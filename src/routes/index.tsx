import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing/LandingPage";

// Default market (UK, English). Visitors from a country with its own page are redirected
// there by src/server.ts.
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Start Trading with $250 and AI Tools | Nukhba AI" },
      {
        name: "description",
        content:
          "Start trading with a $250 deposit, AI tools that analyze the market 24/7, and a personal advisor.",
      },
      { property: "og:title", content: "Start Trading with $250 and AI | Nukhba AI" },
      {
        property: "og:description",
        content: "Answer 4 quick questions and get a personal, AI-powered trading plan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <LandingPage page="gb-en" />,
});
