import { leadSubmissionSchema, toCrmPayload } from "./lead-schema";

// Cloudflare's free trace endpoint; the second host is a backup if the first is blocked.
const IP_LOOKUPS = ["https://www.cloudflare.com/cdn-cgi/trace", "https://1.1.1.1/cdn-cgi/trace"];

/**
 * The visitor's public IP, which the CRM requires. Browsers can't see it, so ask Cloudflare.
 * The trace response is plain text lines like `ip=203.0.113.7`.
 */
async function getPublicIp(): Promise<string> {
  // Local dev only: a fixed IP from .env, so test leads are easy to recognize. Ignored in builds.
  const devIp = import.meta.env.DEV ? (import.meta.env["VITE_DEV_IP_ADDRESS"] as string | undefined) : undefined;
  if (devIp) return devIp;

  for (const url of IP_LOOKUPS) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5_000) });
      if (!res.ok) continue;
      const ip = (await res.text()).match(/^ip=(.+)$/m)?.[1]?.trim();
      if (ip) return ip;
    } catch {
      // try the next lookup
    }
  }
  return "";
}

type CrmResponse = {
  success?: boolean;
  autologin_url?: unknown;
  data?: { autologin_url?: unknown };
};

export type SubmitResult = { ok: boolean; autologinUrl?: string | undefined };

/** Only follow absolute http(s) URLs, so a bad response can't run `javascript:` etc. */
function safeUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Sends a lead straight from the browser to the CRM's submit-leads endpoint.
 * Note: VITE_* variables are bundled into the page, so the API key is visible to visitors.
 */
export async function submitLead(input: unknown): Promise<SubmitResult> {
  const endpoint = import.meta.env["VITE_BASE_ENDPOINT"] as string | undefined;
  const apiKey = import.meta.env["VITE_BASE_API_KEY"] as string | undefined;
  if (!endpoint || !apiKey) {
    console.error("lead submit failed: VITE_BASE_ENDPOINT or VITE_BASE_API_KEY is not set");
    return { ok: false };
  }

  const lead = leadSubmissionSchema.parse(input);
  try {
    const payload = toCrmPayload(lead, await getPublicIp());
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15_000),
    });
    const text = await res.text();
    let body: CrmResponse = {};
    try {
      body = JSON.parse(text) as CrmResponse;
    } catch {
      // not JSON; handled below
    }
    if (!res.ok || body.success === false) {
      console.error("lead submit failed", res.status, text.slice(0, 500));
      return { ok: false };
    }
    return { ok: true, autologinUrl: safeUrl(body.autologin_url ?? body.data?.autologin_url) };
  } catch (err) {
    console.error("lead submit failed", err);
    return { ok: false };
  }
}
