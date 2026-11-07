/** Page loads allowed per visitor IP per window. */
export const RATE_LIMIT = 60;
export const RATE_WINDOW_MS = 60_000;

/** A limit of `limit` hits per `windowMs` for one key. */
export type RateRule = { limit: number; windowMs: number };

export const PAGE_RATE_RULE: RateRule = { limit: RATE_LIMIT, windowMs: RATE_WINDOW_MS };

/** Cloudflare Workers Rate Limiting binding (configured in vite.config.ts → wrangler `ratelimits`). */
export type RateLimitBinding = { limit(options: { key: string }): Promise<{ success: boolean }> };

const hits = new Map<string, { start: number; count: number; windowMs: number }>();

/**
 * Fixed-window counter in this server process's memory. On the Node server this is the limit;
 * on Cloudflare it is the backup when the binding is missing (each Worker instance counts
 * separately there).
 */
export function memoryRateLimited(
  key: string,
  now = Date.now(),
  rule: RateRule = PAGE_RATE_RULE,
): boolean {
  if (hits.size > 10_000) {
    for (const [k, v] of hits) if (now - v.start >= v.windowMs) hits.delete(k);
  }
  const entry = hits.get(key);
  if (!entry || now - entry.start >= entry.windowMs) {
    hits.set(key, { start: now, count: 1, windowMs: rule.windowMs });
    return false;
  }
  entry.count++;
  return entry.count > rule.limit;
}

export async function isRateLimited(
  key: string,
  binding?: RateLimitBinding,
  rule: RateRule = PAGE_RATE_RULE,
): Promise<boolean> {
  if (binding) {
    try {
      return !(await binding.limit({ key })).success;
    } catch (err) {
      console.error("rate limit binding failed, using in-memory limit", err);
    }
  }
  return memoryRateLimited(key, Date.now(), rule);
}

export function resetMemoryRateLimit(): void {
  hits.clear();
}
