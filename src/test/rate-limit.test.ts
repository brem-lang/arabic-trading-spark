import { beforeEach, describe, expect, it } from "vitest";
import {
  RATE_LIMIT,
  RATE_WINDOW_MS,
  isRateLimited,
  memoryRateLimited,
  resetMemoryRateLimit,
} from "@/lib/rate-limit";

describe("page rate limit", () => {
  beforeEach(() => resetMemoryRateLimit());

  it("allows RATE_LIMIT loads per window, then blocks", () => {
    for (let i = 0; i < RATE_LIMIT; i++) expect(memoryRateLimited("ip-a", 1_000)).toBe(false);
    expect(memoryRateLimited("ip-a", 1_000)).toBe(true);
    expect(memoryRateLimited("ip-b", 1_000)).toBe(false);
  });

  it("resets after the window", () => {
    for (let i = 0; i <= RATE_LIMIT; i++) memoryRateLimited("ip-a", 1_000);
    expect(memoryRateLimited("ip-a", 1_000 + RATE_WINDOW_MS)).toBe(false);
  });

  it("uses the Cloudflare binding when present", async () => {
    const binding = { limit: async () => ({ success: false }) };
    expect(await isRateLimited("ip-a", binding)).toBe(true);
  });

  it("falls back to memory when the binding throws", async () => {
    const binding = {
      limit: async (): Promise<{ success: boolean }> => {
        throw new Error("down");
      },
    };
    expect(await isRateLimited("ip-c", binding)).toBe(false);
  });
});
