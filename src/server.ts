import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { geoRedirect, isPagePath } from "./lib/geo";
import { isRateLimited, type RateLimitBinding } from "./lib/rate-limit";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

type CloudflareRequest = Request & {
  cf?: { country?: string };
  runtime?: { cloudflare?: { env?: { PAGE_RATE_LIMITER?: RateLimitBinding } } };
};

const DEV_GEO_COOKIE = "dev_geo";

/**
 * Visitor country from Cloudflare (request.cf, or the CF-IPCountry header).
 * Local dev has neither, so there `?geo=SA` picks a country and a cookie remembers it.
 */
function visitorCountry(request: CloudflareRequest, url: URL): string | null {
  if (import.meta.env.DEV) {
    const fromQuery = url.searchParams.get("geo");
    if (fromQuery && /^[A-Za-z]{2}$/.test(fromQuery)) return fromQuery.toUpperCase();
    const fromCookie = request.headers.get("cookie")?.match(/(?:^|;\s*)dev_geo=([A-Za-z]{2})/)?.[1];
    if (fromCookie) return fromCookie.toUpperCase();
  }
  return request.cf?.country ?? request.headers.get("cf-ipcountry");
}

function htmlResponse(
  status: number,
  title: string,
  message: string,
  headers: Record<string, string> = {},
) {
  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title><style>body{font:15px/1.5 system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;padding:1.5rem;text-align:center}</style></head><body><div><h1>${title}</h1><p>${message}</p></div></body></html>`,
    {
      status,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
        ...headers,
      },
    },
  );
}

/** Rate limit and country gate for the landing pages; null lets the request through. */
async function guardPage(request: CloudflareRequest): Promise<Response | null> {
  const url = new URL(request.url);
  if (!isPagePath(url.pathname)) return null;

  const env = request.runtime?.cloudflare?.env;
  const ip = request.headers.get("cf-connecting-ip") ?? "local";
  if (await isRateLimited(`page:${ip}`, env?.PAGE_RATE_LIMITER)) {
    return htmlResponse(
      429,
      "Too many requests",
      "Please wait a minute and try again. · يرجى الانتظار دقيقة ثم المحاولة مرة أخرى.",
      { "retry-after": "60" },
    );
  }

  const country = visitorCountry(request, url);
  const target = geoRedirect(url.pathname, country);
  if (!target) return null;

  // Keep the query string (click_id and other tracking) across the redirect.
  const headers: Record<string, string> = {
    location: target + url.search,
    "cache-control": "no-store",
  };
  return new Response(null, { status: 302, headers });
}

/** Dev only: remember `?geo=XX` in a cookie so later page loads keep that country. */
function rememberDevGeo(request: Request, response: Response): Response {
  if (!import.meta.env.DEV) return response;
  const geo = new URL(request.url).searchParams.get("geo");
  if (!geo || !/^[A-Za-z]{2}$/.test(geo)) return response;
  const copy = new Response(response.body, response);
  copy.headers.append("set-cookie", `${DEV_GEO_COOKIE}=${geo.toUpperCase()}; Path=/; SameSite=Lax`);
  return copy;
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const blocked = await guardPage(request as CloudflareRequest);
      if (blocked) return rememberDevGeo(request, blocked);

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return rememberDevGeo(request, await normalizeCatastrophicSsrResponse(response));
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
