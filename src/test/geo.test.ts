import { describe, expect, it } from "vitest";
import { geoRedirect, isPagePath, normalizePath } from "@/lib/geo";

describe("geo redirect", () => {
  it("serves each market page only to visitors from that country", () => {
    expect(geoRedirect("/sa", "SA")).toBeNull();
    expect(geoRedirect("/sa/en", "SA")).toBeNull();
    expect(geoRedirect("/", "GB")).toBeNull();
  });

  it("sends visitors from other countries to the English UK page", () => {
    expect(geoRedirect("/sa", "GB")).toBe("/");
    expect(geoRedirect("/sa/en", "FR")).toBe("/");
    expect(geoRedirect("/sa", "US")).toBe("/");
  });

  it("treats a missing or unknown country as the UK default", () => {
    expect(geoRedirect("/sa", null)).toBe("/");
    expect(geoRedirect("/sa", "XX")).toBe("/");
    expect(geoRedirect("/", undefined)).toBeNull();
  });

  it("sends Saudi visitors on the default page to /sa", () => {
    expect(geoRedirect("/", "SA")).toBe("/sa");
    expect(geoRedirect("/", "sa")).toBe("/sa");
  });

  it("serves the Arabic market to the Gulf states, Jordan and Lebanon", () => {
    for (const cc of ["AE", "KW", "QA", "BH", "OM", "JO", "LB"]) {
      expect(geoRedirect("/", cc)).toBe("/sa");
      expect(geoRedirect("/sa", cc)).toBeNull();
      expect(geoRedirect("/sa/en", cc)).toBeNull();
      expect(geoRedirect("/de", cc)).toBe("/sa");
    }
    // Other Middle East countries are not part of it (yet).
    expect(geoRedirect("/sa", "EG")).toBe("/");
    expect(geoRedirect("/sa", "IQ")).toBe("/");
  });

  it("normalizes case, trailing slashes and the old /en URL", () => {
    expect(normalizePath("/SA")).toBe("/sa");
    expect(normalizePath("/sa/")).toBe("/sa");
    expect(normalizePath("/SA/EN/")).toBe("/sa/en");
    expect(normalizePath("/en")).toBe("/sa/en");
    expect(geoRedirect("/SA", "SA")).toBe("/sa");
    expect(geoRedirect("/en", "SA")).toBe("/sa/en");
    expect(geoRedirect("/en", "US")).toBe("/");
    expect(geoRedirect("/en", "DE")).toBe("/de");
  });

  it("routes IT, DE, PT and ES visitors to their own page", () => {
    for (const cc of ["IT", "DE", "PT", "ES"]) {
      const home = `/${cc.toLowerCase()}`;
      expect(geoRedirect(home, cc)).toBeNull();
      expect(geoRedirect("/", cc)).toBe(home);
      expect(geoRedirect("/sa", cc)).toBe(home);
      expect(geoRedirect(home, "SA")).toBe("/sa");
      expect(geoRedirect(home, "FR")).toBe("/");
    }
    expect(geoRedirect("/IT/", "IT")).toBe("/it");
  });

  it("ignores paths that are not landing pages", () => {
    expect(geoRedirect("/favicon.ico", "US")).toBeNull();
    expect(geoRedirect("/assets/app.js", "US")).toBeNull();
    expect(isPagePath("/assets/app.js")).toBe(false);
    expect(isPagePath("/SA/")).toBe(true);
  });
});
