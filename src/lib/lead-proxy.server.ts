import { leadSubmissionSchema, toCrmPayload } from "./lead-schema";
import { isRateLimited, type RateRule } from "./rate-limit";

/** The browser posts leads here; the server adds the visitor IP and the CRM API key. */
export const LEAD_PATH = "/api/submit-lead";

/** Lead submits allowed per visitor IP (the CRM also rejects a second lead from one IP per 24h). */
export const LEAD_RATE_RULE: RateRule = { limit: 5, windowMs: 10 * 60_000 };

const MAX_BODY_BYTES = 8_192;
const CRM_TIMEOUT_MS = 15_000;

export type CrmConfig = {
  endpoint?: string | undefined;
  apiKey?: string | undefined;
  /** Local dev only: IP to send when there is no Cloudflare/nginx header. */
  devIp?: string | undefined;
};

/** Server-only settings (never VITE_*, so the API key is not bundled into the page). */
export function crmConfig(): CrmConfig {
  return {
    endpoint: process.env["BASE_ENDPOINT"],
    apiKey: process.env["BASE_API_KEY"],
    devIp: import.meta.env.DEV ? process.env["DEV_IP_ADDRESS"] || "127.0.0.1" : undefined,
  };
}

/**
 * The visitor's IP: Cloudflare's CF-Connecting-IP first, then what nginx adds.
 * Trustworthy because nginx only accepts connections from Cloudflare (cloudflare-only.conf)
 * and the app port only listens on 127.0.0.1.
 */
export function clientIp(headers: Headers): string {
  const cf = headers.get("cf-connecting-ip")?.trim();
  const real = headers.get("x-real-ip")?.trim();
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (cf || real || forwarded || "").slice(0, 45);
}

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

type CrmResponse = {
  success?: boolean;
  message?: unknown;
  autologin_url?: unknown;
  data?: { autologin_url?: unknown };
};

/**
 * POST /api/submit-lead. Status codes stay below 502/504 on purpose: Cloudflare replaces those
 * with its own error page.
 */
export async function handleSubmitLead(
  request: Request,
  config: CrmConfig = crmConfig(),
  fetchImpl: typeof fetch = fetch,
): Promise<Response> {
  if (request.method !== "POST") return json(405, { success: false });
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return json(415, { success: false });
  }

  const ip = clientIp(request.headers) || config.devIp || "";
  if (!ip) {
    console.error("lead submit: no client IP header (is the request coming through nginx?)");
    return json(400, { success: false });
  }
  if (await isRateLimited(`lead:${ip}`, undefined, LEAD_RATE_RULE)) {
    return json(429, { success: false });
  }

  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) return json(413, { success: false });
  let input: unknown;
  try {
    input = JSON.parse(text);
  } catch {
    return json(400, { success: false });
  }

  const parsed = leadSubmissionSchema.safeParse(input);
  if (!parsed.success) {
    return json(422, {
      success: false,
      errors: parsed.error.issues.map((i) => i.path.join(".")),
    });
  }

  if (!config.endpoint || !config.apiKey) {
    console.error("lead submit: BASE_ENDPOINT or BASE_API_KEY is not set");
    return json(503, { success: false });
  }

  const payload = toCrmPayload(parsed.data, ip);
  try {
    const res = await fetchImpl(config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": config.apiKey,
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(CRM_TIMEOUT_MS),
    });
    const body = await res.text();
    let result: CrmResponse = {};
    try {
      result = JSON.parse(body) as CrmResponse;
    } catch {
      // not JSON; handled below
    }
    // One line per lead, no personal data.
    const sent = `market=${parsed.data.market} country_code=${payload.country_code}`;
    if (!res.ok || result.success === false) {
      console.warn(
        `lead submit: ${sent} → CRM rejected status=${res.status} ${body.slice(0, 300)}`,
      );
      return json(res.status === 409 ? 409 : 422, { success: false });
    }
    console.log(`lead submit: ${sent} → accepted`);
    return json(200, {
      success: true,
      autologin_url: result.autologin_url ?? result.data?.autologin_url,
    });
  } catch (err) {
    console.error(`lead submit: CRM request failed`, err);
    return json(503, { success: false });
  }
}
