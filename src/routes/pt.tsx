import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing/LandingPage";

// Portugal, Portuguese. Only shown to visitors from PT (src/server.ts).
export const Route = createFileRoute("/pt")({
  head: () => ({
    meta: [
      { title: "Comece a fazer trading com 250 € e ferramentas de IA | Nukhba AI" },
      {
        name: "description",
        content:
          "Comece a fazer trading a partir de Portugal com um depósito de 250 €, ferramentas de IA que analisam o mercado 24/7 e um consultor pessoal.",
      },
      { property: "og:title", content: "Comece a fazer trading com 250 € e IA | Nukhba AI" },
      {
        property: "og:description",
        content: "Responda a 4 perguntas rápidas e receba um plano de trading pessoal com IA.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <LandingPage page="pt-pt" />,
});
