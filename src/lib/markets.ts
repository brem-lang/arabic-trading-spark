/**
 * Markets (countries) and the pages that serve them. Add a country here, plus its copy in
 * LandingPage/LeadQuiz and its quiz in lead-schema, to open a new route like /it.
 */
export type Lang = "ar" | "en" | "it" | "de" | "pt" | "es";
export type MarketId = "gb" | "sa" | "it" | "de" | "pt" | "es";

export const MARKETS = {
  /** Default market: anyone whose country has no page of its own lands here. */
  gb: { countries: ["GB"], home: "/", dialCodes: ["+44"], defaultDial: "+44" },
  /** Arabic market: Saudi Arabia, the other Gulf states, Jordan and Lebanon. */
  sa: {
    countries: ["SA", "AE", "KW", "QA", "BH", "OM", "JO", "LB"],
    home: "/sa",
    dialCodes: ["+966", "+971", "+965", "+974", "+973", "+968", "+962", "+961"],
    defaultDial: "+966",
  },
  it: { countries: ["IT"], home: "/it", dialCodes: ["+39"], defaultDial: "+39" },
  de: { countries: ["DE"], home: "/de", dialCodes: ["+49"], defaultDial: "+49" },
  pt: { countries: ["PT"], home: "/pt", dialCodes: ["+351"], defaultDial: "+351" },
  es: { countries: ["ES"], home: "/es", dialCodes: ["+34"], defaultDial: "+34" },
} as const satisfies Record<
  MarketId,
  {
    /** ISO countries (Cloudflare's CF-IPCountry) whose visitors get this market's pages. */
    countries: readonly string[];
    home: string;
    dialCodes: readonly string[];
    defaultDial: string;
  }
>;

export const DEFAULT_MARKET: MarketId = "gb";

export const PAGES = {
  "gb-en": { market: "gb", lang: "en", path: "/" },
  "sa-ar": { market: "sa", lang: "ar", path: "/sa" },
  "sa-en": { market: "sa", lang: "en", path: "/sa/en" },
  "it-it": { market: "it", lang: "it", path: "/it" },
  "de-de": { market: "de", lang: "de", path: "/de" },
  "pt-pt": { market: "pt", lang: "pt", path: "/pt" },
  "es-es": { market: "es", lang: "es", path: "/es" },
} as const satisfies Record<string, { market: MarketId; lang: Lang; path: string }>;

export type PageId = keyof typeof PAGES;

export function pageForPath(pathname: string): PageId | undefined {
  return (Object.keys(PAGES) as PageId[]).find((id) => PAGES[id].path === pathname);
}

/** The market a visitor from this ISO country belongs to (default market when there's none). */
export function marketForCountry(country: string | null | undefined): MarketId {
  const iso = country?.toUpperCase() ?? "";
  const found = (Object.keys(MARKETS) as MarketId[]).find(
    (id) => id !== DEFAULT_MARKET && (MARKETS[id].countries as readonly string[]).includes(iso),
  );
  return found ?? DEFAULT_MARKET;
}
