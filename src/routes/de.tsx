import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing/LandingPage";

// Germany, German. Only shown to visitors from DE (src/server.ts).
export const Route = createFileRoute("/de")({
  head: () => ({
    meta: [
      { title: "Mit 250 € und KI-Tools ins Trading starten | Nukhba AI" },
      {
        name: "description",
        content:
          "Starte aus Deutschland mit 250 € Einzahlung, KI-Tools, die den Markt rund um die Uhr analysieren, und einem persönlichen Berater.",
      },
      { property: "og:title", content: "Mit 250 € und KI ins Trading starten | Nukhba AI" },
      {
        property: "og:description",
        content:
          "Beantworte 4 kurze Fragen und erhalte einen persönlichen, KI-gestützten Trading-Plan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <LandingPage page="de-de" />,
});
