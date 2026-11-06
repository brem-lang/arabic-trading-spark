import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing/LandingPage";

// Italy, Italian. Only shown to visitors from IT (src/server.ts).
export const Route = createFileRoute("/it")({
  head: () => ({
    meta: [
      { title: "Inizia a fare trading con 250 € e strumenti di IA | Nukhba AI" },
      {
        name: "description",
        content:
          "Inizia a fare trading dall'Italia con un deposito di 250 €, strumenti di IA che analizzano il mercato 24/7 e un consulente personale.",
      },
      { property: "og:title", content: "Inizia a fare trading con 250 € e l'IA | Nukhba AI" },
      {
        property: "og:description",
        content:
          "Rispondi a 4 domande veloci e ricevi un piano di trading personale basato sull'IA.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <LandingPage page="it-it" />,
});
