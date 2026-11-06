# Arabic Trading Spark

Bilingual (Arabic RTL at `/`, English LTR at `/en`) lead-generation landing page with a short quiz and a validated lead form. Built with TanStack Start, React, Tailwind and Vite, deployed to Cloudflare Workers.

## Development

Requires Node.js (or Bun).

```sh
npm i
npm run dev      # http://localhost:8080
npm test
```

Copy your environment variables into `.env` (see `VITE_BASE_ENDPOINT`, `VITE_BASE_API_KEY`).

## Deploy (Cloudflare Workers)

```sh
npm run build
npx wrangler deploy --config .output/server/wrangler.json
```

Set production environment variables in the Cloudflare dashboard (Workers → Settings → Variables). `VITE_*` values are baked in at build time, so they must be present when you run `npm run build`.
