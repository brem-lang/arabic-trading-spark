import { MARKETS, PAGES, marketForCountry, pageForPath } from "./markets";

/** Old URLs that moved; kept so existing links keep working. */
const LEGACY_PATHS: Record<string, string> = { "/en": "/sa/en" };

/** Lowercase, no trailing slash ("/SA/" → "/sa"), and legacy paths mapped to their new home. */
export function normalizePath(pathname: string): string {
  let p = pathname.toLowerCase();
  if (p.length > 1) p = p.replace(/\/+$/, "") || "/";
  return LEGACY_PATHS[p] ?? p;
}

/** True for the landing pages (and their aliases), the only paths geo and rate limits apply to. */
export function isPagePath(pathname: string): boolean {
  return pageForPath(normalizePath(pathname)) !== undefined;
}

/**
 * Where a visitor from `country` should go when opening `pathname`, or null to serve it as is.
 * Each market's pages are only shown to visitors from that country; everyone else is sent to
 * their own market's home page (the English UK page when their country has none).
 */
export function geoRedirect(pathname: string, country: string | null | undefined): string | null {
  const normalized = normalizePath(pathname);
  const pageId = pageForPath(normalized);
  if (!pageId) return null;

  const home = marketForCountry(country);
  const target = PAGES[pageId].market === home ? normalized : MARKETS[home].home;
  return target === pathname ? null : target;
}
