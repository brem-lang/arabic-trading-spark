import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  LEAD_RATE_RULE,
  clientIp,
  handleSubmitLead,
  type CrmConfig,
} from "@/lib/lead-proxy.server";
import { resetMemoryRateLimit } from "@/lib/rate-limit";

const lead = {
  market: "sa",
  contact: {
    firstName: "Mohammed",
    lastName: "Alharbi",
    email: "mohammed@example.com",
    countryCode: "+966",
    phone: "0512345678",
    consent: true,
  },
  answers: { is_saudi_citizen: "No" },
};

const config: CrmConfig = { endpoint: "https://crm.example/submit", apiKey: "secret-key" };

function post(body: unknown, headers: Record<string, string> = {}) {
  return new Request("https://site.example/api/submit-lead", {
    method: "POST",
    headers: { "content-type": "application/json", "cf-connecting-ip": "203.0.113.7", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function crmReplies(status: number, body: unknown) {
  return vi.fn(async () => new Response(JSON.stringify(body), { status }));
}

describe("clientIp", () => {
  it("prefers Cloudflare's CF-Connecting-IP, then nginx's headers", () => {
    const h = (o: Record<string, string>) => new Headers(o);
    expect(clientIp(h({ "cf-connecting-ip": "1.1.1.1", "x-real-ip": "2.2.2.2" }))).toBe("1.1.1.1");
    expect(clientIp(h({ "x-real-ip": "2.2.2.2", "x-forwarded-for": "3.3.3.3" }))).toBe("2.2.2.2");
    expect(clientIp(h({ "x-forwarded-for": "3.3.3.3, 10.0.0.1" }))).toBe("3.3.3.3");
    expect(clientIp(h({}))).toBe("");
  });
});

describe("POST /api/submit-lead", () => {
  beforeEach(() => {
    resetMemoryRateLimit();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("forwards the lead with the visitor IP and the server-side API key", async () => {
    const crm = crmReplies(201, { success: true, autologin_url: "https://broker.example/login" });
    const res = await handleSubmitLead(post(lead), config, crm);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      success: true,
      autologin_url: "https://broker.example/login",
    });
    const [url, init] = crm.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(config.endpoint);
    expect((init.headers as Record<string, string>)["x-api-key"]).toBe("secret-key");
    const sent = JSON.parse(init.body as string);
    expect(sent.ip_address).toBe("203.0.113.7");
    expect(sent.mobile).toBe("+966512345678");
  });

  it("ignores any ip_address the browser tries to send", async () => {
    const crm = crmReplies(201, { success: true });
    await handleSubmitLead(post({ ...lead, ip_address: "6.6.6.6" }), config, crm);
    const [, init] = crm.mock.calls[0] as unknown as [string, RequestInit];
    expect(JSON.parse(init.body as string).ip_address).toBe("203.0.113.7");
  });

  it("refuses to send a lead without an IP", async () => {
    const crm = crmReplies(201, { success: true });
    const req = new Request("https://site.example/api/submit-lead", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(lead),
    });
    expect((await handleSubmitLead(req, config, crm)).status).toBe(400);
    expect(crm).not.toHaveBeenCalled();
  });

  it("uses the dev IP when there is no header (local dev)", async () => {
    const crm = crmReplies(201, { success: true });
    const req = new Request("http://localhost/api/submit-lead", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(lead),
    });
    await handleSubmitLead(req, { ...config, devIp: "198.51.100.1" }, crm);
    const [, init] = crm.mock.calls[0] as unknown as [string, RequestInit];
    expect(JSON.parse(init.body as string).ip_address).toBe("198.51.100.1");
  });

  it("rejects an invalid lead before calling the CRM", async () => {
    const crm = crmReplies(201, { success: true });
    const bad = { ...lead, contact: { ...lead.contact, phone: "123" } };
    const res = await handleSubmitLead(post(bad), config, crm);
    expect(res.status).toBe(422);
    expect(crm).not.toHaveBeenCalled();
  });

  it("rejects non-POST, non-JSON and malformed bodies", async () => {
    const crm = crmReplies(201, { success: true });
    const get = new Request("https://site.example/api/submit-lead");
    expect((await handleSubmitLead(get, config, crm)).status).toBe(405);
    expect(
      (await handleSubmitLead(post("x", { "content-type": "text/plain" }), config, crm)).status,
    ).toBe(415);
    expect((await handleSubmitLead(post("{nope"), config, crm)).status).toBe(400);
    expect((await handleSubmitLead(post("x".repeat(10_000)), config, crm)).status).toBe(413);
    expect(crm).not.toHaveBeenCalled();
  });

  it("passes CRM rejections on as 422, and duplicates as 409", async () => {
    const rejected = await handleSubmitLead(
      post(lead),
      config,
      crmReplies(422, { success: false }),
    );
    expect(rejected.status).toBe(422);
    const duplicate = await handleSubmitLead(
      post(lead, { "cf-connecting-ip": "203.0.113.8" }),
      config,
      crmReplies(409, { success: false }),
    );
    expect(duplicate.status).toBe(409);
  });

  it("answers 503 when the CRM is down or not configured", async () => {
    const down = vi.fn(async () => {
      throw new Error("ECONNREFUSED");
    });
    expect((await handleSubmitLead(post(lead), config, down)).status).toBe(503);
    const unset = await handleSubmitLead(
      post(lead, { "cf-connecting-ip": "203.0.113.9" }),
      {},
      down,
    );
    expect(unset.status).toBe(503);
  });

  it("limits submits per IP", async () => {
    const crm = crmReplies(201, { success: true });
    for (let i = 0; i < LEAD_RATE_RULE.limit; i++) {
      expect((await handleSubmitLead(post(lead), config, crm)).status).toBe(200);
    }
    expect((await handleSubmitLead(post(lead), config, crm)).status).toBe(429);
    const other = await handleSubmitLead(
      post(lead, { "cf-connecting-ip": "198.51.100.2" }),
      config,
      crm,
    );
    expect(other.status).toBe(200);
  });
});

describe("submitLead (browser)", () => {
  it("posts to our own endpoint without an API key or IP", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify({ success: true, autologin_url: "javascript:alert(1)" }), {
          status: 200,
        }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { submitLead } = await import("@/lib/submit-lead");
    const res = await submitLead(lead);
    vi.unstubAllGlobals();

    expect(res).toEqual({ ok: true, autologinUrl: undefined }); // unsafe URL is dropped
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("/api/submit-lead");
    expect(JSON.stringify(init.headers)).not.toMatch(/api-key|authorization/i);
    expect(JSON.parse(init.body as string)).not.toHaveProperty("ip_address");
  });
});
