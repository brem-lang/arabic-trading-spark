/**
 * The visitor's country (Cloudflare's CF-IPCountry), handed from the server to the browser in a
 * cookie so the lead form can pre-select the visitor's own dial code. Only the 2-letter ISO code,
 * never the IP. Not HttpOnly: the form reads it.
 */
export const VISITOR_COUNTRY_COOKIE = "visitor_country";

const ISO = /^[A-Z]{2}$/;

/** Set-Cookie value for `country`, or null when it isn't a real ISO code (e.g. missing). */
export function visitorCountryCookie(country: string | null | undefined, secure: boolean) {
  const iso = country?.trim().toUpperCase() ?? "";
  // Cloudflare uses XX (unknown) and T1 (Tor); neither is useful to the form.
  if (!ISO.test(iso) || iso === "XX") return null;
  return `${VISITOR_COUNTRY_COOKIE}=${iso}; Path=/; Max-Age=86400; SameSite=Lax${secure ? "; Secure" : ""}`;
}

/** The country from a `document.cookie` string, or null. */
export function readVisitorCountry(cookies: string): string | null {
  const value = cookies.match(/(?:^|;\s*)visitor_country=([^;]*)/)?.[1]?.toUpperCase() ?? "";
  return ISO.test(value) ? value : null;
}
