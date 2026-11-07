# Arabic Trading Spark

Bilingual (Arabic RTL at `/`, English LTR at `/en`) lead-generation landing page with a short quiz and a validated lead form. Built with TanStack Start, React, Tailwind and Vite, deployed to Cloudflare Workers.

## Development

Requires Node.js (or Bun).

```sh
npm i
npm run dev      # http://localhost:8080
npm test
```

Copy `.env.example` to `.env` and fill in `BASE_ENDPOINT` and `BASE_API_KEY` (server-only; the browser
posts leads to `/api/submit-lead`, which adds the visitor IP and the key). `DEV_IP_ADDRESS` is the IP
sent with test leads in local dev.

## Deploy (Node server behind nginx)

```sh
git pull && npm ci && npm run build && sudo systemctl restart arabic-trading-spark
```

One-time setup: install `deploy/arabic-trading-spark.service` into `/etc/systemd/system/` and
`deploy/nginx-spark.conf` as the nginx site, then `systemctl enable --now arabic-trading-spark`
and `nginx -t && systemctl reload nginx`.

`NITRO_PRESET=cloudflare-module npm run build` still builds a Cloudflare Worker
(`npx wrangler deploy --config .output/server/wrangler.json`), with `BASE_*` set as Worker secrets.
