import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing/LandingPage";

// Saudi Arabia, Arabic. Only shown to visitors from SA (src/server.ts).
export const Route = createFileRoute("/sa/")({
  head: () => ({
    meta: [
      { title: "ابدأ التداول بـ 250$ مع أدوات الذكاء الاصطناعي | نُخبة AI" },
      {
        name: "description",
        content:
          "ابدأ رحلتك في التداول من السعودية بإيداع 250$ فقط، مع أدوات ذكاء اصطناعي تحلل السوق ومستشار شخصي.",
      },
      { property: "og:title", content: "ابدأ التداول بـ 250$ مع الذكاء الاصطناعي | نُخبة AI" },
      {
        property: "og:description",
        content: "أجب عن 4 أسئلة سريعة واحصل على خطة تداول مخصصة مدعومة بالذكاء الاصطناعي.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "alternate", hrefLang: "en", href: "/sa/en" }],
  }),
  component: () => <LandingPage page="sa-ar" />,
});
