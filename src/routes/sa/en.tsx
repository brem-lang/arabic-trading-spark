import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing/LandingPage";

// Saudi Arabia, English. Only shown to visitors from SA (src/server.ts).
export const Route = createFileRoute("/sa/en")({
  head: () => ({
    meta: [
      { title: "Start Trading with $250 and AI Tools | Nukhba AI" },
      {
        name: "description",
        content:
          "Start trading from Saudi Arabia with a $250 deposit, AI tools that analyze the market 24/7, and a personal advisor.",
      },
      { property: "og:title", content: "Start Trading with $250 and AI | Nukhba AI" },
      {
        property: "og:description",
        content: "Answer 4 quick questions and get a personal, AI-powered trading plan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "alternate", hrefLang: "ar", href: "/sa" }],
  }),
  component: () => <LandingPage page="sa-en" />,
});
