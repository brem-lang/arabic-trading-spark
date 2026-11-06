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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LeadQuiz } from "@/components/landing/LeadQuiz";
import { PAGES, type PageId } from "@/lib/markets";
import hero from "@/assets/hero-trading.jpg";

/** Language switch target within the same market; null hides the switch. */
type SwitchTo = "/sa" | "/sa/en" | null;

const SA_AR = {
  brand: "نُخبة",
  start: "ابدأ الآن",
  switchLabel: "English",
  switchTo: "/sa/en" as SwitchTo,
  localStock: "ARAMCO",
  badge: "متاح الآن للمستثمرين في السعودية 🇸🇦",
  h1a: "تداول بذكاء",
  h1b: "ابدأ بـ",
  h1price: "250$",
  h1c: "فقط",
  h1ai: "والذكاء الاصطناعي",
  h1d: "يعمل معك",
  lead: "أدوات AI تحلل الأسهم والذهب والعملات الرقمية على مدار الساعة، ومستشار يرافقك من أول خطوة. أجب عن 5 أسئلة واحصل على خطتك الشخصية مجاناً.",
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
    {
      title: "تحليل ذكي لحظي",
      text: "خوارزميات AI تراقب الأسهم والذهب والعملات 24/7 وتلخص لك الفرص.",
    },
    { title: "إشارات وتنبيهات", text: "تنبيهات فورية على جوالك عند تحرك السوق، بلغة واضحة." },
    { title: "إدارة مخاطر تلقائية", text: "حدود وقف خسارة ذكية تساعدك على حماية رأس مالك." },
    { title: "مستشار شخصي", text: "مستشار يتحدث لغتك يرافقك من أول إيداع خطوة بخطوة." },
  ],
  stepsA: "3 خطوات",
  stepsB: "وتبدأ",
  steps: [
    { n: "١", title: "أجب عن 5 أسئلة", text: "نفهم خبرتك وأهدافك خلال أقل من دقيقة." },
    { n: "٢", title: "تواصل مع مستشارك", text: "يتصل بك مستشار ويجهّز حسابك." },
    { n: "٣", title: "ابدأ بـ 250$", text: "فعّل أدوات الذكاء الاصطناعي وابدأ التداول." },
  ],
  perks: ["إيداع سهل عبر مدى والبطاقات", "تطبيق جوال بالعربية", "أسهم، ذهب، عملات رقمية"],
  quizBadge: "أقل من 60 ثانية",
  quizTitle: "اكتشف خطة التداول المناسبة لك",
  quizSub: "أجب عن 5 أسئلة سريعة ودع الذكاء الاصطناعي يخصص لك البداية.",
  faqTitle: "أسئلة شائعة",
  faq: [
    {
      q: "هل يمكنني البدء بـ 250$ فقط؟",
      a: "نعم، الحد الأدنى للإيداع 250$ ويمكنك زيادته متى شئت حسب راحتك.",
    },
    {
      q: "هل أحتاج خبرة سابقة؟",
      a: "لا. أدوات الذكاء الاصطناعي والمستشار الشخصي مصممة لمساعدة المبتدئين خطوة بخطوة.",
    },
    {
      q: "كيف تساعدني أدوات الذكاء الاصطناعي؟",
      a: "تحلل الأسواق باستمرار وتقدّم لك ملخصات وتنبيهات وتساعدك في إدارة المخاطر، لكن القرار النهائي دائماً لك.",
    },
    {
      q: "هل يمكنني سحب أموالي؟",
      a: "نعم، يمكنك طلب السحب في أي وقت عبر حسابك، ويشرح لك المستشار طرق السحب المتاحة.",
    },
    {
      q: "هل أرباح التداول مضمونة؟",
      a: "لا. التداول ينطوي على مخاطر وقد تخسر جزءاً من رأس المال أو كله. لا تستثمر إلا ما تستطيع تحمّل خسارته.",
    },
  ],
  bottomCta: "ابدأ بـ 250$ الآن",
  riskLabel: "تحذير المخاطر:",
  risk: "التداول في الأسهم والعملات والعملات الرقمية وعقود الفروقات ينطوي على مخاطر عالية وقد لا يناسب جميع المستثمرين. قد تخسر جزءاً من رأس مالك أو كله. أدوات الذكاء الاصطناعي تقدم تحليلات مساعدة ولا تضمن أي أرباح، والأداء السابق لا يدل على النتائج المستقبلية. لا تستثمر أموالاً لا تستطيع تحمّل خسارتها.",
  rights: "جميع الحقوق محفوظة",
  mobileCta: "ابدأ بـ 250$ — خطتك المجانية",
};

const SA_EN: typeof SA_AR = {
  brand: "Nukhba",
  start: "Start now",
  switchLabel: "العربية",
  switchTo: "/sa",
  localStock: "ARAMCO",
  badge: "Now available for investors in Saudi Arabia 🇸🇦",
  h1a: "Trade smarter.",
  h1b: "Start with just",
  h1price: "$250",
  h1c: "",
  h1ai: "and let AI",
  h1d: "work for you",
  lead: "AI tools analyze stocks, gold and crypto around the clock, and a personal advisor guides you from day one. Answer 5 questions and get your personal plan for free.",
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
    {
      title: "Real-time smart analysis",
      text: "AI algorithms watch stocks, gold and currencies 24/7 and summarize opportunities for you.",
    },
    {
      title: "Signals & alerts",
      text: "Instant alerts on your phone when the market moves, in plain language.",
    },
    {
      title: "Automated risk management",
      text: "Smart stop-loss limits help you protect your capital.",
    },
    {
      title: "Personal advisor",
      text: "An advisor who speaks your language guides you step by step from your first deposit.",
    },
  ],
  stepsA: "3 steps",
  stepsB: "to start",
  steps: [
    {
      n: "1",
      title: "Answer 5 questions",
      text: "We learn your experience and goals in under a minute.",
    },
    {
      n: "2",
      title: "Talk to your advisor",
      text: "An advisor calls you and sets up your account.",
    },
    { n: "3", title: "Start with $250", text: "Activate the AI tools and start trading." },
  ],
  perks: [
    "Easy deposits via mada & cards",
    "Mobile app in Arabic & English",
    "Stocks, gold, crypto",
  ],
  quizBadge: "Under 60 seconds",
  quizTitle: "Find the trading plan that fits you",
  quizSub: "Answer 5 quick questions and let AI tailor your start.",
  faqTitle: "Frequently asked questions",
  faq: [
    {
      q: "Can I really start with just $250?",
      a: "Yes. The minimum deposit is $250 and you can increase it whenever you like.",
    },
    {
      q: "Do I need prior experience?",
      a: "No. The AI tools and your personal advisor are designed to help beginners step by step.",
    },
    {
      q: "How do the AI tools help me?",
      a: "They continuously analyze the markets and give you summaries, alerts and risk-management help — but the final decision is always yours.",
    },
    {
      q: "Can I withdraw my money?",
      a: "Yes, you can request a withdrawal at any time from your account, and your advisor will explain the available methods.",
    },
    {
      q: "Are trading profits guaranteed?",
      a: "No. Trading involves risk and you may lose some or all of your capital. Only invest what you can afford to lose.",
    },
  ],
  bottomCta: "Start with $250 now",
  riskLabel: "Risk warning:",
  risk: "Trading stocks, currencies, cryptocurrencies and CFDs carries a high level of risk and may not be suitable for all investors. You may lose some or all of your capital. AI tools provide supporting analysis and do not guarantee any profits; past performance is not indicative of future results. Do not invest money you cannot afford to lose.",
  rights: "All rights reserved",
  mobileCta: "Start with $250 — free plan",
};

/** UK (default) page: the English copy without Saudi-specific details. */
const GB_EN: typeof SA_AR = {
  ...SA_EN,
  switchLabel: "",
  switchTo: null,
  localStock: "FTSE 100",
  badge: "Now available for investors in the UK 🇬🇧",
  stats: [
    { v: "$250", l: "Minimum deposit" },
    { v: "24/7", l: "AI market analysis" },
    { v: "1:1", l: "Personal advisor" },
  ],
  signals: [
    { a: "Gold XAU", t: "Possible bullish momentum", c: "text-primary" },
    { a: "FTSE 100", t: "Strong support level", c: "text-gold" },
    { a: "BTC", t: "High volatility — caution", c: "text-destructive" },
  ],
  perks: [
    "Easy deposits by card & bank transfer",
    "Easy-to-use mobile app",
    "Stocks, gold, crypto",
  ],
  // The UK quiz has 4 questions (no Saudi citizenship question).
  lead: "AI tools analyze stocks, gold and crypto around the clock, and a personal advisor guides you from day one. Answer 4 questions and get your personal plan for free.",
  steps: [
    {
      n: "1",
      title: "Answer 4 questions",
      text: "We learn your experience and goals in under a minute.",
    },
    SA_EN.steps[1]!,
    SA_EN.steps[2]!,
  ],
  quizSub: "Answer 4 quick questions and let AI tailor your start.",
};

const IT_IT: typeof SA_AR = {
  brand: "Nukhba",
  start: "Inizia ora",
  switchLabel: "",
  switchTo: null,
  localStock: "FTSE MIB",
  badge: "Ora disponibile per gli investitori in Italia 🇮🇹",
  h1a: "Fai trading in modo intelligente.",
  h1b: "Inizia con soli",
  h1price: "250 €",
  h1c: "",
  h1ai: "e lascia che l'IA",
  h1d: "lavori per te",
  lead: "Strumenti di IA analizzano azioni, oro e criptovalute 24 ore su 24 e un consulente personale ti segue dal primo giorno. Rispondi a 4 domande e ricevi gratis il tuo piano personale.",
  cta: "Ricevi il tuo piano gratuito",
  how: "Come funziona",
  stats: [
    { v: "250 €", l: "Deposito minimo" },
    { v: "24/7", l: "Analisi di mercato con IA" },
    { v: "IT", l: "Assistenza in italiano" },
  ],
  cardTitle: "Assistente di trading IA",
  cardSub: "Analisi in tempo reale",
  live: "Live",
  signals: [
    { a: "Oro XAU", t: "Possibile spinta rialzista", c: "text-primary" },
    { a: "FTSE MIB", t: "Supporto solido", c: "text-gold" },
    { a: "BTC", t: "Volatilità elevata — attenzione", c: "text-destructive" },
  ],
  alert: "Nuovo avviso in pochi secondi",
  featTitleA: "Gli strumenti di",
  featTitleAi: "intelligenza artificiale",
  featTitleB: "in tasca",
  featSub:
    "Tutto ciò che ti serve per iniziare a fare trading con fiducia, anche se è la prima volta.",
  features: [
    {
      title: "Analisi intelligente in tempo reale",
      text: "Algoritmi di IA monitorano azioni, oro e valute 24/7 e ti riassumono le opportunità.",
    },
    {
      title: "Segnali e avvisi",
      text: "Avvisi istantanei sul telefono quando il mercato si muove, in un linguaggio semplice.",
    },
    {
      title: "Gestione automatica del rischio",
      text: "Limiti di stop-loss intelligenti ti aiutano a proteggere il capitale.",
    },
    {
      title: "Consulente personale",
      text: "Un consulente che parla la tua lingua ti guida passo dopo passo dal primo deposito.",
    },
  ],
  stepsA: "3 passi",
  stepsB: "per iniziare",
  steps: [
    {
      n: "1",
      title: "Rispondi a 4 domande",
      text: "Conosciamo la tua esperienza e i tuoi obiettivi in meno di un minuto.",
    },
    {
      n: "2",
      title: "Parla con il tuo consulente",
      text: "Un consulente ti chiama e configura il tuo conto.",
    },
    {
      n: "3",
      title: "Inizia con 250 €",
      text: "Attiva gli strumenti di IA e inizia a fare trading.",
    },
  ],
  perks: [
    "Depositi facili con carta e bonifico",
    "App mobile in italiano",
    "Azioni, oro, criptovalute",
  ],
  quizBadge: "Meno di 60 secondi",
  quizTitle: "Scopri il piano di trading adatto a te",
  quizSub: "Rispondi a 4 domande veloci e lascia che l'IA personalizzi il tuo inizio.",
  faqTitle: "Domande frequenti",
  faq: [
    {
      q: "Posso davvero iniziare con soli 250 €?",
      a: "Sì. Il deposito minimo è di 250 € e puoi aumentarlo quando vuoi.",
    },
    {
      q: "Serve esperienza?",
      a: "No. Gli strumenti di IA e il tuo consulente personale sono pensati per aiutare i principianti passo dopo passo.",
    },
    {
      q: "Come mi aiutano gli strumenti di IA?",
      a: "Analizzano continuamente i mercati e ti forniscono riepiloghi, avvisi e supporto nella gestione del rischio — ma la decisione finale è sempre tua.",
    },
    {
      q: "Posso prelevare il mio denaro?",
      a: "Sì, puoi richiedere un prelievo in qualsiasi momento dal tuo conto e il consulente ti spiegherà i metodi disponibili.",
    },
    {
      q: "I profitti sono garantiti?",
      a: "No. Il trading comporta rischi e potresti perdere in parte o del tutto il capitale. Investi solo ciò che puoi permetterti di perdere.",
    },
  ],
  bottomCta: "Inizia ora con 250 €",
  riskLabel: "Avvertenza sui rischi:",
  risk: "Il trading di azioni, valute, criptovalute e CFD comporta un elevato livello di rischio e potrebbe non essere adatto a tutti gli investitori. Potresti perdere in parte o del tutto il capitale. Gli strumenti di IA forniscono analisi di supporto e non garantiscono alcun profitto; i risultati passati non sono indicativi di quelli futuri. Non investire denaro che non puoi permetterti di perdere.",
  rights: "Tutti i diritti riservati",
  mobileCta: "Inizia con 250 € — piano gratuito",
};

const DE_DE: typeof SA_AR = {
  brand: "Nukhba",
  start: "Jetzt starten",
  switchLabel: "",
  switchTo: null,
  localStock: "DAX",
  badge: "Jetzt verfügbar für Anleger in Deutschland 🇩🇪",
  h1a: "Clever traden.",
  h1b: "Starte mit nur",
  h1price: "250 €",
  h1c: "",
  h1ai: "und lass die KI",
  h1d: "für dich arbeiten",
  lead: "KI-Tools analysieren rund um die Uhr Aktien, Gold und Kryptowährungen, und ein persönlicher Berater begleitet dich vom ersten Tag an. Beantworte 4 Fragen und erhalte kostenlos deinen persönlichen Plan.",
  cta: "Kostenlosen Plan erhalten",
  how: "So funktioniert's",
  stats: [
    { v: "250 €", l: "Mindesteinzahlung" },
    { v: "24/7", l: "KI-Marktanalyse" },
    { v: "DE", l: "Support auf Deutsch" },
  ],
  cardTitle: "KI-Trading-Assistent",
  cardSub: "Live-Analyse",
  live: "Live",
  signals: [
    { a: "Gold XAU", t: "Mögliches Aufwärtsmomentum", c: "text-primary" },
    { a: "DAX", t: "Starke Unterstützung", c: "text-gold" },
    { a: "BTC", t: "Hohe Volatilität — Vorsicht", c: "text-destructive" },
  ],
  alert: "Neuer Alarm in Sekunden",
  featTitleA: "",
  featTitleAi: "KI-Tools",
  featTitleB: "für die Hosentasche",
  featSub:
    "Alles, was du brauchst, um mit Zuversicht zu traden — auch wenn es dein erstes Mal ist.",
  features: [
    {
      title: "Intelligente Echtzeit-Analyse",
      text: "KI-Algorithmen beobachten Aktien, Gold und Währungen rund um die Uhr und fassen Chancen für dich zusammen.",
    },
    {
      title: "Signale & Alarme",
      text: "Sofortige Benachrichtigungen aufs Handy, wenn sich der Markt bewegt — klar und verständlich.",
    },
    {
      title: "Automatisches Risikomanagement",
      text: "Intelligente Stop-Loss-Limits helfen dir, dein Kapital zu schützen.",
    },
    {
      title: "Persönlicher Berater",
      text: "Ein Berater, der deine Sprache spricht, begleitet dich ab der ersten Einzahlung Schritt für Schritt.",
    },
  ],
  stepsA: "3 Schritte",
  stepsB: "zum Start",
  steps: [
    {
      n: "1",
      title: "Beantworte 4 Fragen",
      text: "Wir lernen deine Erfahrung und Ziele in weniger als einer Minute kennen.",
    },
    {
      n: "2",
      title: "Sprich mit deinem Berater",
      text: "Ein Berater ruft dich an und richtet dein Konto ein.",
    },
    { n: "3", title: "Starte mit 250 €", text: "Aktiviere die KI-Tools und beginne zu traden." },
  ],
  perks: [
    "Einfache Einzahlung per Karte & Überweisung",
    "Mobile App auf Deutsch",
    "Aktien, Gold, Krypto",
  ],
  quizBadge: "Unter 60 Sekunden",
  quizTitle: "Finde den Trading-Plan, der zu dir passt",
  quizSub: "Beantworte 4 kurze Fragen und lass die KI deinen Start anpassen.",
  faqTitle: "Häufige Fragen",
  faq: [
    {
      q: "Kann ich wirklich mit nur 250 € starten?",
      a: "Ja. Die Mindesteinzahlung beträgt 250 €, und du kannst sie jederzeit erhöhen.",
    },
    {
      q: "Brauche ich Vorkenntnisse?",
      a: "Nein. Die KI-Tools und dein persönlicher Berater sind darauf ausgelegt, Einsteigern Schritt für Schritt zu helfen.",
    },
    {
      q: "Wie helfen mir die KI-Tools?",
      a: "Sie analysieren laufend die Märkte und liefern dir Zusammenfassungen, Alarme und Unterstützung beim Risikomanagement — die endgültige Entscheidung triffst aber immer du.",
    },
    {
      q: "Kann ich mein Geld auszahlen lassen?",
      a: "Ja, du kannst jederzeit über dein Konto eine Auszahlung beantragen, und dein Berater erklärt dir die verfügbaren Methoden.",
    },
    {
      q: "Sind Trading-Gewinne garantiert?",
      a: "Nein. Trading ist mit Risiken verbunden, und du kannst dein Kapital teilweise oder ganz verlieren. Investiere nur, was du dir leisten kannst zu verlieren.",
    },
  ],
  bottomCta: "Jetzt mit 250 € starten",
  riskLabel: "Risikohinweis:",
  risk: "Der Handel mit Aktien, Währungen, Kryptowährungen und CFDs ist mit einem hohen Risiko verbunden und möglicherweise nicht für alle Anleger geeignet. Du kannst dein Kapital teilweise oder ganz verlieren. KI-Tools liefern unterstützende Analysen und garantieren keine Gewinne; vergangene Wertentwicklungen sind kein Indikator für künftige Ergebnisse. Investiere kein Geld, dessen Verlust du dir nicht leisten kannst.",
  rights: "Alle Rechte vorbehalten",
  mobileCta: "Mit 250 € starten — kostenloser Plan",
};

const PT_PT: typeof SA_AR = {
  brand: "Nukhba",
  start: "Começar agora",
  switchLabel: "",
  switchTo: null,
  localStock: "PSI",
  badge: "Já disponível para investidores em Portugal 🇵🇹",
  h1a: "Faça trading de forma inteligente.",
  h1b: "Comece com apenas",
  h1price: "250 €",
  h1c: "",
  h1ai: "e deixe a IA",
  h1d: "trabalhar por si",
  lead: "Ferramentas de IA analisam ações, ouro e criptomoedas 24 horas por dia, e um consultor pessoal acompanha-o desde o primeiro dia. Responda a 4 perguntas e receba gratuitamente o seu plano pessoal.",
  cta: "Receber o meu plano gratuito",
  how: "Como funciona",
  stats: [
    { v: "250 €", l: "Depósito mínimo" },
    { v: "24/7", l: "Análise de mercado com IA" },
    { v: "PT", l: "Apoio em português" },
  ],
  cardTitle: "Assistente de trading com IA",
  cardSub: "Análise em tempo real",
  live: "Ao vivo",
  signals: [
    { a: "Ouro XAU", t: "Possível impulso de subida", c: "text-primary" },
    { a: "PSI", t: "Nível de suporte forte", c: "text-gold" },
    { a: "BTC", t: "Volatilidade elevada — atenção", c: "text-destructive" },
  ],
  alert: "Novo alerta em segundos",
  featTitleA: "Ferramentas de",
  featTitleAi: "inteligência artificial",
  featTitleB: "no seu bolso",
  featSub:
    "Tudo o que precisa para começar a fazer trading com confiança, mesmo que seja a primeira vez.",
  features: [
    {
      title: "Análise inteligente em tempo real",
      text: "Algoritmos de IA acompanham ações, ouro e moedas 24/7 e resumem-lhe as oportunidades.",
    },
    {
      title: "Sinais e alertas",
      text: "Alertas instantâneos no telemóvel quando o mercado se mexe, numa linguagem simples.",
    },
    {
      title: "Gestão de risco automática",
      text: "Limites de stop-loss inteligentes ajudam-no a proteger o seu capital.",
    },
    {
      title: "Consultor pessoal",
      text: "Um consultor que fala a sua língua acompanha-o passo a passo desde o primeiro depósito.",
    },
  ],
  stepsA: "3 passos",
  stepsB: "para começar",
  steps: [
    {
      n: "1",
      title: "Responda a 4 perguntas",
      text: "Ficamos a conhecer a sua experiência e objetivos em menos de um minuto.",
    },
    {
      n: "2",
      title: "Fale com o seu consultor",
      text: "Um consultor liga-lhe e configura a sua conta.",
    },
    {
      n: "3",
      title: "Comece com 250 €",
      text: "Ative as ferramentas de IA e comece a fazer trading.",
    },
  ],
  perks: [
    "Depósitos fáceis com cartão, MB WAY e transferência",
    "Aplicação móvel em português",
    "Ações, ouro, criptomoedas",
  ],
  quizBadge: "Menos de 60 segundos",
  quizTitle: "Descubra o plano de trading certo para si",
  quizSub: "Responda a 4 perguntas rápidas e deixe a IA personalizar o seu início.",
  faqTitle: "Perguntas frequentes",
  faq: [
    {
      q: "Posso mesmo começar com apenas 250 €?",
      a: "Sim. O depósito mínimo é de 250 € e pode aumentá-lo sempre que quiser.",
    },
    {
      q: "Preciso de experiência?",
      a: "Não. As ferramentas de IA e o seu consultor pessoal foram pensados para ajudar principiantes passo a passo.",
    },
    {
      q: "Como me ajudam as ferramentas de IA?",
      a: "Analisam continuamente os mercados e dão-lhe resumos, alertas e ajuda na gestão de risco — mas a decisão final é sempre sua.",
    },
    {
      q: "Posso levantar o meu dinheiro?",
      a: "Sim, pode pedir um levantamento a qualquer momento na sua conta, e o seu consultor explica-lhe os métodos disponíveis.",
    },
    {
      q: "Os lucros são garantidos?",
      a: "Não. O trading envolve riscos e pode perder parte ou a totalidade do seu capital. Invista apenas o que pode dar-se ao luxo de perder.",
    },
  ],
  bottomCta: "Comece já com 250 €",
  riskLabel: "Aviso de risco:",
  risk: "A negociação de ações, moedas, criptomoedas e CFD envolve um elevado nível de risco e pode não ser adequada a todos os investidores. Pode perder parte ou a totalidade do seu capital. As ferramentas de IA fornecem análises de apoio e não garantem quaisquer lucros; o desempenho passado não é indicativo de resultados futuros. Não invista dinheiro que não pode dar-se ao luxo de perder.",
  rights: "Todos os direitos reservados",
  mobileCta: "Comece com 250 € — plano gratuito",
};

const ES_ES: typeof SA_AR = {
  brand: "Nukhba",
  start: "Empieza ya",
  switchLabel: "",
  switchTo: null,
  localStock: "IBEX 35",
  badge: "Ya disponible para inversores en España 🇪🇸",
  h1a: "Invierte con inteligencia.",
  h1b: "Empieza con solo",
  h1price: "250 €",
  h1c: "",
  h1ai: "y deja que la IA",
  h1d: "trabaje para ti",
  lead: "Herramientas de IA analizan acciones, oro y criptomonedas las 24 horas, y un asesor personal te acompaña desde el primer día. Responde a 4 preguntas y recibe gratis tu plan personal.",
  cta: "Consigue tu plan gratis",
  how: "Cómo funciona",
  stats: [
    { v: "250 €", l: "Depósito mínimo" },
    { v: "24/7", l: "Análisis de mercado con IA" },
    { v: "ES", l: "Atención en español" },
  ],
  cardTitle: "Asistente de trading con IA",
  cardSub: "Análisis en directo",
  live: "En directo",
  signals: [
    { a: "Oro XAU", t: "Posible impulso alcista", c: "text-primary" },
    { a: "IBEX 35", t: "Soporte sólido", c: "text-gold" },
    { a: "BTC", t: "Alta volatilidad — precaución", c: "text-destructive" },
  ],
  alert: "Nueva alerta en segundos",
  featTitleA: "Herramientas de",
  featTitleAi: "inteligencia artificial",
  featTitleB: "en tu bolsillo",
  featSub:
    "Todo lo que necesitas para empezar a invertir con confianza, aunque sea tu primera vez.",
  features: [
    {
      title: "Análisis inteligente en tiempo real",
      text: "Algoritmos de IA vigilan acciones, oro y divisas 24/7 y te resumen las oportunidades.",
    },
    {
      title: "Señales y alertas",
      text: "Alertas instantáneas en tu móvil cuando el mercado se mueve, en un lenguaje claro.",
    },
    {
      title: "Gestión de riesgo automática",
      text: "Límites de stop-loss inteligentes te ayudan a proteger tu capital.",
    },
    {
      title: "Asesor personal",
      text: "Un asesor que habla tu idioma te guía paso a paso desde tu primer depósito.",
    },
  ],
  stepsA: "3 pasos",
  stepsB: "para empezar",
  steps: [
    {
      n: "1",
      title: "Responde a 4 preguntas",
      text: "Conocemos tu experiencia y tus objetivos en menos de un minuto.",
    },
    { n: "2", title: "Habla con tu asesor", text: "Un asesor te llama y configura tu cuenta." },
    {
      n: "3",
      title: "Empieza con 250 €",
      text: "Activa las herramientas de IA y empieza a invertir.",
    },
  ],
  perks: [
    "Depósitos fáciles con tarjeta, Bizum y transferencia",
    "App móvil en español",
    "Acciones, oro, criptomonedas",
  ],
  quizBadge: "Menos de 60 segundos",
  quizTitle: "Descubre el plan de trading ideal para ti",
  quizSub: "Responde a 4 preguntas rápidas y deja que la IA personalice tu inicio.",
  faqTitle: "Preguntas frecuentes",
  faq: [
    {
      q: "¿De verdad puedo empezar con solo 250 €?",
      a: "Sí. El depósito mínimo es de 250 € y puedes aumentarlo cuando quieras.",
    },
    {
      q: "¿Necesito experiencia previa?",
      a: "No. Las herramientas de IA y tu asesor personal están pensados para ayudar a los principiantes paso a paso.",
    },
    {
      q: "¿Cómo me ayudan las herramientas de IA?",
      a: "Analizan los mercados de forma continua y te dan resúmenes, alertas y ayuda con la gestión del riesgo — pero la decisión final siempre es tuya.",
    },
    {
      q: "¿Puedo retirar mi dinero?",
      a: "Sí, puedes solicitar una retirada en cualquier momento desde tu cuenta, y tu asesor te explicará los métodos disponibles.",
    },
    {
      q: "¿Están garantizadas las ganancias?",
      a: "No. El trading conlleva riesgos y puedes perder parte o la totalidad de tu capital. Invierte solo lo que puedas permitirte perder.",
    },
  ],
  bottomCta: "Empieza ya con 250 €",
  riskLabel: "Advertencia de riesgo:",
  risk: "Operar con acciones, divisas, criptomonedas y CFD conlleva un alto nivel de riesgo y puede no ser adecuado para todos los inversores. Puedes perder parte o la totalidad de tu capital. Las herramientas de IA ofrecen análisis de apoyo y no garantizan ningún beneficio; las rentabilidades pasadas no garantizan resultados futuros. No inviertas dinero que no puedas permitirte perder.",
  rights: "Todos los derechos reservados",
  mobileCta: "Empieza con 250 € — plan gratis",
};

const COPY: Record<PageId, typeof SA_AR> = {
  "gb-en": GB_EN,
  "sa-ar": SA_AR,
  "sa-en": SA_EN,
  "it-it": IT_IT,
  "de-de": DE_DE,
  "pt-pt": PT_PT,
  "es-es": ES_ES,
};

const TICKER = [
  { s: "XAU/USD", v: "+0.84%", up: true },
  { s: "BTC/USD", v: "+2.31%", up: true },
  { s: "LOCAL", v: "+0.42%", up: true },
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

export function LandingPage({ page }: { page: PageId }) {
  const { lang } = PAGES[page];
  const t = COPY[page];
  const ticker = TICKER.map((x) => (x.s === "LOCAL" ? { ...x, s: t.localStock } : x));
  const rtl = lang === "ar";
  const Forward = rtl ? ArrowLeft : ArrowRight;

  return (
    <div
      dir={rtl ? "rtl" : "ltr"}
      lang={lang}
      className="min-h-screen overflow-x-hidden bg-background text-foreground"
    >
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
            {t.switchTo && (
              <Button asChild variant="glass" size="sm">
                <Link to={t.switchTo}>
                  <Globe /> {t.switchLabel}
                </Link>
              </Button>
            )}
            <Button variant="glow" size="sm" onClick={() => scrollTo("quiz")}>
              {t.start}
            </Button>
          </div>
        </div>
      </header>

      <section className="relative pt-16">
        <div className="absolute inset-0">
          <img
            src={hero}
            alt=""
            width={1600}
            height={1008}
            className="h-full w-full object-cover opacity-60"
          />
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
                <div
                  key={s.l}
                  className="rounded-2xl border border-border/60 bg-card/50 p-4 text-center backdrop-blur"
                >
                  <div className="font-display text-xl font-bold text-gradient-gold sm:text-2xl">
                    {s.v}
                  </div>
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
                <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary">
                  {t.live}
                </span>
              </div>
              <div className="mt-6 flex h-32 items-end gap-1.5" dir="ltr">
                {[40, 55, 45, 62, 58, 70, 66, 78, 72, 85, 80, 92].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-gradient-primary opacity-80"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="mt-6 space-y-3">
                {t.signals.map((r) => (
                  <div
                    key={r.a}
                    className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3 text-sm"
                  >
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

        <div
          className="relative overflow-hidden border-y border-border/60 bg-card/60 py-3 backdrop-blur"
          dir="ltr"
        >
          <div className="flex w-max animate-ticker gap-10">
            {[...ticker, ...ticker, ...ticker].map((x, i) => (
              <span
                key={i}
                className="flex items-center gap-2 text-sm font-medium whitespace-nowrap"
              >
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
            {t.featTitleA} <span className="text-gradient-primary">{t.featTitleAi}</span>{" "}
            {t.featTitleB}
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
              <div
                key={s.n}
                className="relative rounded-3xl border border-border bg-background/60 p-8 text-center"
              >
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
                <div
                  key={p}
                  className="flex items-center justify-center gap-3 rounded-2xl border border-border/60 p-4 text-sm"
                >
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
          <LeadQuiz page={page} />
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-24">
        <h2 className="text-center text-3xl font-bold sm:text-4xl">{t.faqTitle}</h2>
        <Accordion type="single" collapsible className="mt-10 space-y-3">
          {t.faq.map((f, i) => (
            <AccordionItem
              key={i}
              value={`q${i}`}
              className="rounded-2xl border border-border bg-card/50 px-5"
            >
              <AccordionTrigger className="text-start text-base font-semibold hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="leading-relaxed text-muted-foreground">
                {f.a}
              </AccordionContent>
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
