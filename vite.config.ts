import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

// Production runs as a Node server behind nginx (systemd: deploy/arabic-trading-spark.service).
// `NITRO_PRESET=cloudflare-module npm run build` still builds the Cloudflare Worker instead.
const preset = process.env["NITRO_PRESET"] || "node-server";
const cloudflare = preset.startsWith("cloudflare");

// Server-only settings (BASE_ENDPOINT, BASE_API_KEY, DEV_IP_ADDRESS) for `vite dev`; in
// production systemd loads .env. Not VITE_*, so they never reach the browser bundle.
const SERVER_ENV = ["BASE_ENDPOINT", "BASE_API_KEY", "DEV_IP_ADDRESS"];

export default defineConfig(({ command, mode }) => {
  if (command === "serve") {
    const env = loadEnv(mode, process.cwd(), "");
    for (const key of SERVER_ENV) if (env[key] && !process.env[key]) process.env[key] = env[key];
  }
  return {
    server: { host: "::", port: 8080 },
    css: { transformer: "lightningcss" },
    resolve: {
      alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
    plugins: [
      tailwindcss(),
      tsConfigPaths({ projects: ["./tsconfig.json"] }),
      tanstackStart({
        // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
        server: { entry: "server" },
        importProtection: {
          behavior: "error",
          client: { files: ["**/server/**", "**/*.server.*"], specifiers: ["server-only"] },
        },
      }),
      // Build-only: bundle the server (Node by default, or a Cloudflare Worker; see `preset`).
      ...(command === "build" && !cloudflare ? [nitro({ preset })] : []),
      ...(command === "build" && cloudflare
        ? [
            nitro({
              preset,
              cloudflare: {
                nodeCompat: true,
                deployConfig: true,
                wrangler: {
                  // Landing-page loads per visitor IP (src/lib/rate-limit.ts); period must be 10 or 60 s.
                  ratelimits: [
                    {
                      name: "PAGE_RATE_LIMITER",
                      namespace_id: "1001",
                      simple: { limit: 60, period: 60 },
                    },
                  ],
                },
              },
            }),
          ]
        : []),
      viteReact(),
    ],
  };
});
