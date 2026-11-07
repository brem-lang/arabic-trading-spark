import { leadSubmissionSchema } from "./lead-schema";

/** Same-origin endpoint (src/lib/lead-proxy.server.ts); it adds the visitor IP and the API key. */
const LEAD_ENDPOINT = "/api/submit-lead";

type SubmitResponse = { success?: boolean; autologin_url?: unknown };

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
 * Sends a lead to our own server, which forwards it to the CRM. The browser never sees the
 * CRM API key and never has to look up its own IP (ad blockers used to block that lookup).
 */
export async function submitLead(input: unknown): Promise<SubmitResult> {
  // Same check the server runs; throws (shown as "check your details") before any request.
  leadSubmissionSchema.parse(input);
  try {
    const res = await fetch(LEAD_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(20_000),
    });
    const body = (await res.json().catch(() => ({}))) as SubmitResponse;
    if (!res.ok || body.success !== true) {
      console.error("lead submit failed", res.status);
      return { ok: false };
    }
    return { ok: true, autologinUrl: safeUrl(body.autologin_url) };
  } catch (err) {
    console.error("lead submit failed", err);
    return { ok: false };
  }
}
