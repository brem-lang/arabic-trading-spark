/** Page loads allowed per visitor IP per window. */
export const RATE_LIMIT = 60;
export const RATE_WINDOW_MS = 60_000;

/** Cloudflare Workers Rate Limiting binding (configured in vite.config.ts → wrangler `ratelimits`). */
export type RateLimitBinding = { limit(options: { key: string }): Promise<{ success: boolean }> };

const hits = new Map<string, { start: number; count: number }>();

/**
 * Fixed-window counter in this Worker instance's memory. Used when the Cloudflare binding is
 * missing (local dev). Each instance counts separately, so it is a backup, not the main limit.
 */
export function memoryRateLimited(key: string, now = Date.now()): boolean {
  if (hits.size > 10_000) {
    for (const [k, v] of hits) if (now - v.start >= RATE_WINDOW_MS) hits.delete(k);
  }
  const entry = hits.get(key);
  if (!entry || now - entry.start >= RATE_WINDOW_MS) {
    hits.set(key, { start: now, count: 1 });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

export async function isRateLimited(key: string, binding?: RateLimitBinding): Promise<boolean> {
  if (binding) {
    try {
      return !(await binding.limit({ key })).success;
    } catch (err) {
      console.error("rate limit binding failed, using in-memory limit", err);
    }
  }
  return memoryRateLimited(key);
}

export function resetMemoryRateLimit(): void {
  hits.clear();
}
