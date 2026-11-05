import { Link } from "@tanstack/react-router";
import {
  Bot,
  BrainCircuit,
  ShieldCheck,
  Wallet,
  Headphones,
  LineChart,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Smartphone,
  Zap,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LeadQuiz } from "@/components/landing/LeadQuiz";
import type { Lang } from "@/lib/lead-schema";
import hero from "@/assets/hero-trading.jpg";

const COPY = {
  ar: {
    brand: "نُخبة",
    start: "ابدأ الآن",
    switchLabel: "English",
    switchTo: "/en",
    badge: "متاح الآن للمستثمرين في السعودية 🇸🇦",
    h1a: "تداول بذكاء",
    h1b: "ابدأ بـ",
    h1price: "250$",
    h1c: "فقط",
    h1ai: "والذكاء الاصطناعي",
    h1d: "يعمل معك",
    lead: "أدوات AI تحلل الأسهم والذهب والعملات الرقمية على مدار الساعة، ومستشار يرافقك من أول خطوة. أجب عن 4 أسئلة واحصل على خطتك الشخصية مجاناً.",
    cta: "اكتشف خطتك المجانية",
    how: "كيف يعمل؟",
    stats: [
      { v: "250$", l: "حد أدنى للإيداع" },
      { v: "24/7", l: "تحليل بالذكاء الاصطناعي" },
      { v: "عربي", l: "دعم بلغتك" },
    ],
    cardTitle: "مساعد التداول الذكي",
    cardSub: "تحليل مباشر",
    live: "مباشر",
    signals: [
      { a: "الذهب XAU", t: "زخم صاعد محتمل", c: "text-primary" },
      { a: "أرامكو", t: "مستوى دعم قوي", c: "text-gold" },
      { a: "BTC", t: "تقلب مرتفع — انتبه", c: "text-destructive" },
    ],
    alert: "تنبيه جديد خلال ثوانٍ",
    featTitleA: "أدوات",
    featTitleAi: "الذكاء الاصطناعي",
    featTitleB: "في جيبك",
    featSub: "كل ما تحتاجه لتبدأ التداول بثقة، حتى لو كانت هذه أول مرة.",
    features: [
      { title: "تحليل ذكي لحظي", text: "خوارزميات AI تراقب الأسهم والذهب والعملات 24/7 وتلخص لك الفرص." },
      { title: "إشارات وتنبيهات", text: "تنبيهات فورية على جوالك عند تحرك السوق، بلغة واضحة." },
      { title: "إدارة مخاطر تلقائية", text: "حدود وقف خسارة ذكية تساعدك على حماية رأس مالك." },
      { title: "مستشار شخصي", text: "مستشار يتحدث لغتك يرافقك من أول إيداع خطوة بخطوة." },
    ],
    stepsA: "3 خطوات",
    stepsB: "وتبدأ",
    steps: [
      { n: "١", title: "أجب عن 4 أسئلة", text: "نفهم خبرتك وأهدافك خلال أقل من دقيقة." },
      { n: "٢", title: "تواصل مع مستشارك", text: "يتصل بك مستشار ويجهّز حسابك." },
      { n: "٣", title: "ابدأ بـ 250$", text: "فعّل أدوات الذكاء الاصطناعي وابدأ التداول." },
    ],
    perks: ["إيداع سهل عبر مدى والبطاقات", "تطبيق جوال بالعربية", "أسهم، ذهب، عملات رقمية"],
    quizBadge: "أقل من 60 ثانية",
    quizTitle: "اكتشف خطة التداول المناسبة لك",
    quizSub: "أجب عن 4 أسئلة سريعة ودع الذكاء الاصطناعي يخصص لك البداية.",
    faqTitle: "أسئلة شائعة",
    faq: [
      { q: "هل يمكنني البدء بـ 250$ فقط؟", a: "نعم، الحد الأدنى للإيداع 250$ ويمكنك زيادته متى شئت حسب راحتك." },
      { q: "هل أحتاج خبرة سابقة؟", a: "لا. أدوات الذكاء الاصطناعي والمستشار الشخصي مصممة لمساعدة المبتدئين خطوة بخطوة." },
      { q: "كيف تساعدني أدوات الذكاء الاصطناعي؟", a: "تحلل الأسواق باستمرار وتقدّم لك ملخصات وتنبيهات وتساعدك في إدارة المخاطر، لكن القرار النهائي دائماً لك." },
      { q: "هل يمكنني سحب أموالي؟", a: "نعم، يمكنك طلب السحب في أي وقت عبر حسابك، ويشرح لك المستشار طرق السحب المتاحة." },
      { q: "هل أرباح التداول مضمونة؟", a: "لا. التداول ينطوي على مخاطر وقد تخسر جزءاً من رأس المال أو كله. لا تستثمر إلا ما تستطيع تحمّل خسارته." },
    ],
    bottomCta: "ابدأ بـ 250$ الآن",
    riskLabel: "تحذير المخاطر:",
    risk: "التداول في الأسهم والعملات والعملات الرقمية وعقود الفروقات ينطوي على مخاطر عالية وقد لا يناسب جميع المستثمرين. قد تخسر جزءاً من رأس مالك أو كله. أدوات الذكاء الاصطناعي تقدم تحليلات مساعدة ولا تضمن أي أرباح، والأداء السابق لا يدل على النتائج المستقبلية. لا تستثمر أموالاً لا تستطيع تحمّل خسارتها.",
    rights: "جميع الحقوق محفوظة",
    mobileCta: "ابدأ بـ 250$ — خطتك المجانية",
  },
  en: {
    brand: "Nukhba",
    start: "Start now",
    switchLabel: "العربية",
    switchTo: "/",
    badge: "Now available for investors in Saudi Arabia 🇸🇦",
    h1a: "Trade smarter.",
    h1b: "Start with just",
    h1price: "$250",
    h1c: "",
    h1ai: "and let AI",
    h1d: "work for you",
    lead: "AI tools analyze stocks, gold and crypto around the clock, and a personal advisor guides you from day one. Answer 4 questions and get your personal plan for free.",
    cta: "Get your free plan",
    how: "How it works",
    stats: [
      { v: "$250", l: "Minimum deposit" },
      { v: "24/7", l: "AI market analysis" },
      { v: "AR / EN", l: "Support in your language" },
    ],
    cardTitle: "AI Trading Assistant",
    cardSub: "Live analysis",
    live: "Live",
    signals: [
      { a: "Gold XAU", t: "Possible bullish momentum", c: "text-primary" },
      { a: "Aramco", t: "Strong support level", c: "text-gold" },
      { a: "BTC", t: "High volatility — caution", c: "text-destructive" },
    ],
    alert: "New alert in seconds",
    featTitleA: "",
    featTitleAi: "AI tools",
    featTitleB: "in your pocket",
    featSub: "Everything you need to start trading with confidence, even if it's your first time.",
    features: [
      { title: "Real-time smart analysis", text: "AI algorithms watch stocks, gold and currencies 24/7 and summarize opportunities for you." },
      { title: "Signals & alerts", text: "Instant alerts on your phone when the market moves, in plain language." },
      { title: "Automated risk management", text: "Smart stop-loss limits help you protect your capital." },
      { title: "Personal advisor", text: "An advisor who speaks your language guides you step by step from your first deposit." },
    ],
    stepsA: "3 steps",
    stepsB: "to start",
    steps: [
      { n: "1", title: "Answer 4 questions", text: "We learn your experience and goals in under a minute." },
      { n: "2", title: "Talk to your advisor", text: "An advisor calls you and sets up your account." },
      { n: "3", title: "Start with $250", text: "Activate the AI tools and start trading." },
    ],
    perks: ["Easy deposits via mada & cards", "Mobile app in Arabic & English", "Stocks, gold, crypto"],
    quizBadge: "Under 60 seconds",
    quizTitle: "Find the trading plan that fits you",
    quizSub: "Answer 4 quick questions and let AI tailor your start.",
    faqTitle: "Frequently asked questions",
    faq: [
      { q: "Can I really start with just $250?", a: "Yes. The minimum deposit is $250 and you can increase it whenever you like." },
      { q: "Do I need prior experience?", a: "No. The AI tools and your personal advisor are designed to help beginners step by step." },
      { q: "How do the AI tools help me?", a: "They continuously analyze the markets and give you summaries, alerts and risk-management help — but the final decision is always yours." },
      { q: "Can I withdraw my money?", a: "Yes, you can request a withdrawal at any time from your account, and your advisor will explain the available methods." },
      { q: "Are trading profits guaranteed?", a: "No. Trading involves risk and you may lose some or all of your capital. Only invest what you can afford to lose." },
    ],
    bottomCta: "Start with $250 now",
    riskLabel: "Risk warning:",
    risk: "Trading stocks, currencies, cryptocurrencies and CFDs carries a high level of risk and may not be suitable for all investors. You may lose some or all of your capital. AI tools provide supporting analysis and do not guarantee any profits; past performance is not indicative of future results. Do not invest money you cannot afford to lose.",
    rights: "All rights reserved",
    mobileCta: "Start with $250 — free plan",
  },
} as const;

const TICKER = [
  { s: "XAU/USD", v: "+0.84%", up: true },
  { s: "BTC/USD", v: "+2.31%", up: true },
  { s: "ARAMCO", v: "+0.42%", up: true },
  { s: "EUR/USD", v: "-0.12%", up: false },
  { s: "NVDA", v: "+1.67%", up: true },
  { s: "OIL", v: "-0.38%", up: false },
  { s: "TSLA", v: "+0.95%", up: true },
  { s: "ETH/USD", v: "+1.12%", up: true },
];

const FEATURE_ICONS = [BrainCircuit, Bot, ShieldCheck, Headphones];
const PERK_ICONS = [Wallet, Smartphone, LineChart];

const scrollTo = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

export function LandingPage({ lang }: { lang: Lang }) {
  const t = COPY[lang];
  const rtl = lang === "ar";
  const Forward = rtl ? ArrowLeft : ArrowRight;

  return (
    <div dir={rtl ? "rtl" : "ltr"} lang={lang} className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/50 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold">
              {t.brand} <span className="text-gradient-gold">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="glass" size="sm">
              <Link to={t.switchTo}>
                <Globe /> {t.switchLabel}
              </Link>
            </Button>
            <Button variant="glow" size="sm" onClick={() => scrollTo("quiz")}>
              {t.start}
            </Button>
          </div>
        </div>
      </header>

      <section className="relative pt-16">
        <div className="absolute inset-0">
          <img src={hero} alt="" width={1600} height={1008} className="h-full w-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-hero" />
          <div className="absolute inset-0 bg-grid opacity-20" />
        </div>

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pt-16 pb-20 lg:grid-cols-[1.1fr_1fr] lg:pt-24">
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              {t.badge}
            </span>
            <h1 className="mt-6 text-4xl leading-[1.25] font-black sm:text-5xl lg:text-6xl">
              {t.h1a}
              <br />
              {t.h1b} <span className="text-gradient-gold">{t.h1price}</span> {t.h1c}
              <br />
              <span className="text-gradient-primary">{t.h1ai}</span> {t.h1d}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">{t.lead}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button variant="hero" size="xl" onClick={() => scrollTo("quiz")}>
                {t.cta} <Forward />
              </Button>
              <Button variant="glass" size="xl" onClick={() => scrollTo("features")}>
                {t.how}
              </Button>
            </div>
            <div className="mt-10 grid max-w-lg grid-cols-3 gap-4">
              {t.stats.map((s) => (
                <div key={s.l} className="rounded-2xl border border-border/60 bg-card/50 p-4 text-center backdrop-blur">
                  <div className="font-display text-xl font-bold text-gradient-gold sm:text-2xl">{s.v}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="animate-float rounded-3xl border border-border bg-card/80 p-6 shadow-card backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">{t.cardTitle}</div>
                    <div className="text-xs text-muted-foreground">{t.cardSub}</div>
                  </div>
                </div>
                <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary">{t.live}</span>
              </div>
              <div className="mt-6 flex h-32 items-end gap-1.5" dir="ltr">
                {[40, 55, 45, 62, 58, 70, 66, 78, 72, 85, 80, 92].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t bg-gradient-primary opacity-80" style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className="mt-6 space-y-3">
                {t.signals.map((r) => (
                  <div key={r.a} className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3 text-sm">
                    <span className="font-semibold">{r.a}</span>
                    <span className={r.c}>{r.t}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-6 -end-6 rounded-2xl border border-gold/40 bg-card px-5 py-3 shadow-gold">
              <div className="flex items-center gap-2 text-sm font-bold">
                <Zap className="h-4 w-4 text-gold" /> {t.alert}
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden border-y border-border/60 bg-card/60 py-3 backdrop-blur" dir="ltr">
          <div className="flex w-max animate-ticker gap-10">
            {[...TICKER, ...TICKER, ...TICKER].map((x, i) => (
              <span key={i} className="flex items-center gap-2 text-sm font-medium whitespace-nowrap">
                <span className="text-muted-foreground">{x.s}</span>
                <span className={x.up ? "text-primary" : "text-destructive"}>{x.v}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            {t.featTitleA} <span className="text-gradient-primary">{t.featTitleAi}</span> {t.featTitleB}
          </h2>
          <p className="mt-4 text-muted-foreground">{t.featSub}</p>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {t.features.map((f, i) => {
            const Icon = FEATURE_ICONS[i] ?? Sparkles;
            return (
              <div
                key={f.title}
                className="group rounded-3xl border border-border bg-gradient-card p-6 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-glow"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 transition-colors group-hover:bg-primary/25">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-5 text-lg font-bold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-y border-border/60 bg-card/30">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <h2 className="text-center text-3xl font-bold sm:text-4xl">
            {t.stepsA} <span className="text-gradient-gold">{t.stepsB}</span>
          </h2>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {t.steps.map((s) => (
              <div key={s.n} className="relative rounded-3xl border border-border bg-background/60 p-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-gold font-display text-3xl font-black text-gold-foreground shadow-gold">
                  {s.n}
                </div>
                <h3 className="mt-6 text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {t.perks.map((p, i) => {
              const Icon = PERK_ICONS[i] ?? Sparkles;
              return (
                <div key={p} className="flex items-center justify-center gap-3 rounded-2xl border border-border/60 p-4 text-sm">
                  <Icon className="h-5 w-5 text-gold" /> {p}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="quiz" className="relative scroll-mt-20 px-4 py-24">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="relative mx-auto max-w-2xl">
          <div className="mb-10 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-4 py-1.5 text-sm font-semibold text-gold">
              <Sparkles className="h-4 w-4" /> {t.quizBadge}
            </span>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">{t.quizTitle}</h2>
            <p className="mt-3 text-muted-foreground">{t.quizSub}</p>
          </div>
          <LeadQuiz lang={lang} />
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-24">
        <h2 className="text-center text-3xl font-bold sm:text-4xl">{t.faqTitle}</h2>
        <Accordion type="single" collapsible className="mt-10 space-y-3">
          {t.faq.map((f, i) => (
            <AccordionItem key={i} value={`q${i}`} className="rounded-2xl border border-border bg-card/50 px-5">
              <AccordionTrigger className="text-start text-base font-semibold hover:no-underline">{f.q}</AccordionTrigger>
              <AccordionContent className="leading-relaxed text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="mt-12 text-center">
          <Button variant="hero" size="xl" onClick={() => scrollTo("quiz")}>
            {t.bottomCta} <Forward />
          </Button>
        </div>
      </section>

      <footer className="border-t border-border bg-card/40 pb-28 sm:pb-10">
        <div className="mx-auto max-w-6xl px-4 pt-10">
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-xs leading-relaxed text-muted-foreground">
            <strong className="text-foreground">{t.riskLabel}</strong> {t.risk}
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} {t.brand} AI — {t.rights}
          </p>
        </div>
      </footer>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 p-3 backdrop-blur-xl sm:hidden">
        <Button variant="hero" size="xl" className="w-full" onClick={() => scrollTo("quiz")}>
          {t.mobileCta} <Forward />
        </Button>
      </div>
    </div>
  );
}
