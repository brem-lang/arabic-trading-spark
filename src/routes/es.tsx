import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing/LandingPage";

// Spain, Spanish. Only shown to visitors from ES (src/server.ts).
export const Route = createFileRoute("/es")({
  head: () => ({
    meta: [
      { title: "Empieza a invertir con 250 € y herramientas de IA | Nukhba AI" },
      {
        name: "description",
        content:
          "Empieza a invertir desde España con un depósito de 250 €, herramientas de IA que analizan el mercado 24/7 y un asesor personal.",
      },
      { property: "og:title", content: "Empieza a invertir con 250 € e IA | Nukhba AI" },
      {
        property: "og:description",
        content: "Responde a 4 preguntas rápidas y recibe un plan de trading personal con IA.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <LandingPage page="es-es" />,
});
