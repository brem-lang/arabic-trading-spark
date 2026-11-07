import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  User,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  countriesFor,
  dialCodeFor,
  makeContactSchema,
  phoneErrorMessage,
  suggestEmailFix,
  isValidPhone,
  QUIZ,
  type Answers,
  type QuizField,
  type QuizValue,
} from "@/lib/lead-schema";
import { MARKETS, PAGES, type MarketId, type PageId } from "@/lib/markets";
import { submitLead } from "@/lib/submit-lead";
import { readVisitorCountry } from "@/lib/visitor-country";

type Question = {
  field: string;
  title: string;
  hint: string;
  options: { value: QuizValue; label: string; icon: string }[];
};

/** One [label, icon] pair per canonical option, so a missing translation is a type error. */
type LabelsFor<T> = { readonly [I in keyof T]: readonly [label: string, icon: string] };

/** Builds a question whose options are the market's canonical CRM values from QUIZ, in order. */
function question<M extends MarketId, K extends QuizField<M>>(
  market: M,
  field: K,
  title: string,
  hint: string,
  labels: LabelsFor<(typeof QUIZ)[M][K]>,
): Question {
  const values = QUIZ[market][field] as readonly string[];
  const options = values.map((value, i) => {
    const [label, icon] = (labels as readonly (readonly [string, string])[])[i]!;
    return { value, label, icon };
  });
  return { field, title, hint, options };
}

const SA_AR = {
  questions: [
    question("sa", "is_saudi_citizen", "هل أنت مواطن سعودي؟", "نخصص لك الخدمة حسب بلد إقامتك", [
      ["نعم، أنا مواطن سعودي", "🇸🇦"],
      ["لا", "🌍"],
    ]),
    question("sa", "investment_amount", "كم تخطط أن تستثمر؟", "اختر المبلغ الأقرب لك", [
      ["أقل من 5,000 ريال", "🟢"],
      ["5,000 – 9,999 ريال", "🔵"],
      ["10,000 – 49,999 ريال", "🟡"],
      ["50,000 ريال أو أكثر", "💎"],
    ]),
    question(
      "sa",
      "investment_start_time",
      "متى تخطط أن تبدأ الاستثمار؟",
      "لا يوجد التزام — فقط لنعرف توقيتك",
      [
        ["خلال الأيام السبعة القادمة", "⚡"],
        ["خلال الـ 30 يوماً القادمة", "📅"],
        ["خلال الأشهر الثلاثة القادمة", "🗓️"],
        ["أستكشف الخيارات فقط حالياً", "🧭"],
      ],
    ),
    question(
      "sa",
      "experience_level",
      "ما مستوى خبرتك في التداول؟",
      "لا توجد إجابة خاطئة — نخصص لك الأدوات حسب مستواك",
      [
        ["مبتدئ — مستعد للتعلّم", "🌱"],
        ["لدي بعض الخبرة", "📈"],
        ["متداول ذو خبرة", "⚡"],
        ["متداول محترف", "🏆"],
      ],
    ),
    question(
      "sa",
      "wants_contact",
      "هل تريد أن يتواصل معك مستشار؟",
      "مستشارونا يساعدونك في الخطوات التالية",
      [
        ["نعم، أنا مستعد لمناقشة الخطوات التالية", "✅"],
        ["نعم، لكنني أحتاج معلومات أكثر أولاً", "💬"],
      ],
    ),
  ],
  done: "تم بنجاح",
  lastStep: "الخطوة الأخيرة",
  questionOf: (n: number, t: number) => `السؤال ${n} من ${t}`,
  thanks: (name: string) => `شكراً ${name}، تم استلام طلبك!`,
  willCall: "سيتواصل معك أحد مستشارينا على الرقم",
  willCallEnd: "لمساعدتك في فتح حسابك وتفعيل أدوات الذكاء الاصطناعي.",
  nextSteps: ["ابقِ هاتفك قريباً منك", "جهّز هويتك الوطنية أو الإقامة", "ابدأ بإيداع 250$ فقط"],
  qualified: "أنت مؤهل للبدء",
  formTitle: "أين نرسل خطتك الشخصية؟",
  formSub: "أدخل بياناتك ليتواصل معك مستشار ويفعّل حسابك",
  firstName: "الاسم الأول",
  firstPh: "مثال: محمد",
  lastName: "اسم العائلة",
  lastPh: "مثال: العتيبي",
  email: "البريد الإلكتروني",
  didYouMean: "هل تقصد",
  phone: "رقم الجوال",
  countryCode: "رمز الدولة",
  consent:
    "أوافق على أن يتواصل معي مستشار عبر الهاتف أو البريد، وأدرك أن التداول ينطوي على مخاطر وقد أخسر جزءاً من رأس المال أو كله.",
  sending: "جاري الإرسال...",
  loadingSteps: ["جاري التحقق من بياناتك...", "جاري إنشاء حسابك...", "جاري تجهيز خطتك الشخصية..."],
  redirecting: "تم! جاري تحويلك إلى حسابك...",
  pleaseWait: "يرجى عدم إغلاق الصفحة",
  submit: "احصل على خطتي وابدأ بـ 250$",
  encrypted: "بياناتك مشفّرة",
  noShare: "لا نشارك بياناتك",
  back: "رجوع",
  skip: "تخطي",
  skipAll: "تخطي كل الأسئلة",
  optional: "اختياري",
  failSave: "تعذّر إرسال طلبك، حاول مرة أخرى",
  failCheck: "تحقق من بياناتك وحاول مرة أخرى",
};

// The last three questions have the same canonical values in every market (COMMON_QUIZ).
const EN_COMMON_QUESTIONS = [
  question(
    "gb",
    "investment_start_time",
    "When do you plan to start investing?",
    "No commitment — just so we know your timing",
    [
      ["Within the next 7 days", "⚡"],
      ["Within the next 30 days", "📅"],
      ["Within the next 3 months", "🗓️"],
      ["I am just exploring for now", "🧭"],
    ],
  ),
  question(
    "gb",
    "experience_level",
    "What's your trading experience?",
    "No wrong answers — we tailor the tools to your level",
    [
      ["Beginner — I am ready to learn", "🌱"],
      ["I have some experience", "📈"],
      ["I am an experienced trader", "⚡"],
      ["I am a professional trader", "🏆"],
    ],
  ),
  question(
    "gb",
    "wants_contact",
    "Would you like an advisor to contact you?",
    "Our advisors help you with the next steps",
    [
      ["Yes, I am ready to discuss the next steps.", "✅"],
      ["Yes, but I need more information first.", "💬"],
    ],
  ),
];

const SA_EN = {
  questions: [
    question(
      "sa",
      "is_saudi_citizen",
      "Are you a Saudi citizen?",
      "We tailor our service to where you live",
      [
        ["Yes, I am a Saudi citizen.", "🇸🇦"],
        ["No", "🌍"],
      ],
    ),
    question(
      "sa",
      "investment_amount",
      "How much do you plan to invest?",
      "Pick the closest amount",
      [
        ["Less than SAR 5,000", "🟢"],
        ["SAR 5,000–9,999", "🔵"],
        ["SAR 10,000–49,999", "🟡"],
        ["SAR 50,000 or more", "💎"],
      ],
    ),
    ...EN_COMMON_QUESTIONS,
  ],
  done: "Completed",
  lastStep: "Final step",
  questionOf: (n: number, t: number) => `Question ${n} of ${t}`,
  thanks: (name: string) => `Thanks ${name}, we've got your request!`,
  willCall: "One of our advisors will call you on",
  willCallEnd: "to help you open your account and activate the AI tools.",
  nextSteps: [
    "Keep your phone nearby",
    "Have your national ID or Iqama ready",
    "Start with just a $250 deposit",
  ],
  qualified: "You're eligible to start",
  formTitle: "Where should we send your personal plan?",
  formSub: "Enter your details and an advisor will activate your account",
  firstName: "First name",
  firstPh: "e.g. Mohammed",
  lastName: "Last name",
  lastPh: "e.g. Alotaibi",
  email: "Email",
  didYouMean: "Did you mean",
  phone: "Mobile number",
  countryCode: "Country code",
  consent:
    "I agree to be contacted by an advisor by phone or email, and I understand trading involves risk and I may lose some or all of my capital.",
  sending: "Sending...",
  loadingSteps: [
    "Verifying your details...",
    "Creating your account...",
    "Preparing your personal plan...",
  ],
  redirecting: "Done! Taking you to your account...",
  pleaseWait: "Please don't close this page",
  submit: "Get my plan & start with $250",
  encrypted: "Your data is encrypted",
  noShare: "We never share your data",
  back: "Back",
  skip: "Skip",
  skipAll: "Skip all questions",
  optional: "Optional",
  failSave: "Couldn't send your request, please try again",
  failCheck: "Check your details and try again",
};

/** UK (default) page: same English copy without the Saudi-specific question and details. */
const GB_EN: typeof SA_EN = {
  ...SA_EN,
  questions: [
    question(
      "gb",
      "investment_amount",
      "How much do you plan to invest?",
      "Pick the closest amount",
      [
        ["Less than £1,000", "🟢"],
        ["£1,000–1,999", "🔵"],
        ["£2,000–9,999", "🟡"],
        ["£10,000 or more", "💎"],
      ],
    ),
    ...EN_COMMON_QUESTIONS,
  ],
  nextSteps: [
    "Keep your phone nearby",
    "Have your photo ID ready",
    "Start with just a $250 deposit",
  ],
  firstPh: "e.g. James",
  lastPh: "e.g. Smith",
};

/** The euro markets share one quiz (EUR_QUIZ), so the questions only differ by language. */
type EurLabels = {
  q: readonly [title: string, hint: string, options: readonly (readonly [string, string])[]][];
};

function eurQuestions(market: "it" | "de" | "pt" | "es", { q }: EurLabels): Question[] {
  const fields = [
    "investment_amount",
    "investment_start_time",
    "experience_level",
    "wants_contact",
  ] as const;
  return fields.map((field, i) => {
    const [title, hint, labels] = q[i]!;
    return question(market, field, title, hint, labels as never);
  });
}

const IT_IT: typeof SA_EN = {
  questions: eurQuestions("it", {
    q: [
      [
        "Quanto pensi di investire?",
        "Scegli l'importo più vicino",
        [
          ["Meno di 1.000 €", "🟢"],
          ["1.000–1.999 €", "🔵"],
          ["2.000–9.999 €", "🟡"],
          ["10.000 € o più", "💎"],
        ],
      ],
      [
        "Quando pensi di iniziare a investire?",
        "Nessun impegno — solo per conoscere i tuoi tempi",
        [
          ["Entro i prossimi 7 giorni", "⚡"],
          ["Entro i prossimi 30 giorni", "📅"],
          ["Entro i prossimi 3 mesi", "🗓️"],
          ["Per ora sto solo valutando", "🧭"],
        ],
      ],
      [
        "Qual è la tua esperienza di trading?",
        "Non ci sono risposte sbagliate — adattiamo gli strumenti al tuo livello",
        [
          ["Principiante — voglio imparare", "🌱"],
          ["Ho un po' di esperienza", "📈"],
          ["Sono un trader esperto", "⚡"],
          ["Sono un trader professionista", "🏆"],
        ],
      ],
      [
        "Vuoi essere contattato da un consulente?",
        "I nostri consulenti ti aiutano con i passi successivi",
        [
          ["Sì, sono pronto a parlare dei prossimi passi", "✅"],
          ["Sì, ma prima ho bisogno di più informazioni", "💬"],
        ],
      ],
    ],
  }),
  done: "Completato",
  lastStep: "Ultimo passo",
  questionOf: (n: number, t: number) => `Domanda ${n} di ${t}`,
  thanks: (name: string) => `Grazie ${name}, abbiamo ricevuto la tua richiesta!`,
  willCall: "Uno dei nostri consulenti ti chiamerà al numero",
  willCallEnd:
    "per aiutarti ad aprire il conto e attivare gli strumenti di intelligenza artificiale.",
  nextSteps: [
    "Tieni il telefono a portata di mano",
    "Prepara un documento d'identità",
    "Inizia con un deposito di soli 250 €",
  ],
  qualified: "Puoi iniziare",
  formTitle: "Dove inviamo il tuo piano personale?",
  formSub: "Inserisci i tuoi dati: un consulente ti contatterà e attiverà il tuo conto",
  firstName: "Nome",
  firstPh: "es. Marco",
  lastName: "Cognome",
  lastPh: "es. Rossi",
  email: "E-mail",
  didYouMean: "Intendevi",
  phone: "Numero di cellulare",
  countryCode: "Prefisso",
  consent:
    "Acconsento a essere contattato da un consulente via telefono o e-mail e sono consapevole che il trading comporta rischi e che potrei perdere in parte o del tutto il capitale investito.",
  sending: "Invio in corso...",
  loadingSteps: [
    "Verifica dei tuoi dati...",
    "Creazione del tuo conto...",
    "Preparazione del tuo piano personale...",
  ],
  redirecting: "Fatto! Ti stiamo portando al tuo conto...",
  pleaseWait: "Non chiudere questa pagina",
  submit: "Ricevi il mio piano e inizia con 250 €",
  encrypted: "I tuoi dati sono criptati",
  noShare: "Non condividiamo i tuoi dati",
  back: "Indietro",
  skip: "Salta",
  skipAll: "Salta tutte le domande",
  optional: "Facoltativa",
  failSave: "Impossibile inviare la richiesta, riprova",
  failCheck: "Controlla i tuoi dati e riprova",
};

const DE_DE: typeof SA_EN = {
  questions: eurQuestions("de", {
    q: [
      [
        "Wie viel möchtest du investieren?",
        "Wähle den Betrag, der am besten passt",
        [
          ["Weniger als 1.000 €", "🟢"],
          ["1.000–1.999 €", "🔵"],
          ["2.000–9.999 €", "🟡"],
          ["10.000 € oder mehr", "💎"],
        ],
      ],
      [
        "Wann möchtest du mit dem Investieren beginnen?",
        "Unverbindlich — nur damit wir deinen Zeitplan kennen",
        [
          ["In den nächsten 7 Tagen", "⚡"],
          ["In den nächsten 30 Tagen", "📅"],
          ["In den nächsten 3 Monaten", "🗓️"],
          ["Ich schaue mich erst einmal um", "🧭"],
        ],
      ],
      [
        "Wie viel Trading-Erfahrung hast du?",
        "Es gibt keine falschen Antworten — wir passen die Tools an dein Niveau an",
        [
          ["Einsteiger — ich will lernen", "🌱"],
          ["Ich habe etwas Erfahrung", "📈"],
          ["Ich bin ein erfahrener Trader", "⚡"],
          ["Ich bin ein professioneller Trader", "🏆"],
        ],
      ],
      [
        "Möchtest du von einem Berater kontaktiert werden?",
        "Unsere Berater helfen dir bei den nächsten Schritten",
        [
          ["Ja, ich bin bereit, die nächsten Schritte zu besprechen", "✅"],
          ["Ja, aber ich brauche zuerst mehr Informationen", "💬"],
        ],
      ],
    ],
  }),
  done: "Abgeschlossen",
  lastStep: "Letzter Schritt",
  questionOf: (n: number, t: number) => `Frage ${n} von ${t}`,
  thanks: (name: string) => `Danke ${name}, wir haben deine Anfrage erhalten!`,
  willCall: "Einer unserer Berater ruft dich unter",
  willCallEnd: "an, um dir bei der Kontoeröffnung und der Aktivierung der KI-Tools zu helfen.",
  nextSteps: [
    "Halte dein Telefon bereit",
    "Lege deinen Personalausweis bereit",
    "Starte mit nur 250 € Einzahlung",
  ],
  qualified: "Du kannst loslegen",
  formTitle: "Wohin sollen wir deinen persönlichen Plan senden?",
  formSub: "Gib deine Daten ein, damit ein Berater dich kontaktiert und dein Konto aktiviert",
  firstName: "Vorname",
  firstPh: "z. B. Lukas",
  lastName: "Nachname",
  lastPh: "z. B. Müller",
  email: "E-Mail",
  didYouMean: "Meintest du",
  phone: "Handynummer",
  countryCode: "Ländervorwahl",
  consent:
    "Ich bin damit einverstanden, von einem Berater per Telefon oder E-Mail kontaktiert zu werden, und mir ist bewusst, dass Trading mit Risiken verbunden ist und ich mein eingesetztes Kapital teilweise oder ganz verlieren kann.",
  sending: "Wird gesendet...",
  loadingSteps: [
    "Deine Daten werden geprüft...",
    "Dein Konto wird erstellt...",
    "Dein persönlicher Plan wird vorbereitet...",
  ],
  redirecting: "Fertig! Du wirst zu deinem Konto weitergeleitet...",
  pleaseWait: "Bitte schließe diese Seite nicht",
  submit: "Plan erhalten & mit 250 € starten",
  encrypted: "Deine Daten sind verschlüsselt",
  noShare: "Wir geben deine Daten nicht weiter",
  back: "Zurück",
  skip: "Überspringen",
  skipAll: "Alle Fragen überspringen",
  optional: "Optional",
  failSave: "Deine Anfrage konnte nicht gesendet werden, bitte versuche es erneut",
  failCheck: "Prüfe deine Daten und versuche es erneut",
};

const PT_PT: typeof SA_EN = {
  questions: eurQuestions("pt", {
    q: [
      [
        "Quanto pretende investir?",
        "Escolha o valor mais próximo",
        [
          ["Menos de 1.000 €", "🟢"],
          ["1.000–1.999 €", "🔵"],
          ["2.000–9.999 €", "🟡"],
          ["10.000 € ou mais", "💎"],
        ],
      ],
      [
        "Quando pretende começar a investir?",
        "Sem compromisso — só para sabermos o seu prazo",
        [
          ["Nos próximos 7 dias", "⚡"],
          ["Nos próximos 30 dias", "📅"],
          ["Nos próximos 3 meses", "🗓️"],
          ["Por agora estou só a explorar", "🧭"],
        ],
      ],
      [
        "Qual é a sua experiência em trading?",
        "Não há respostas erradas — adaptamos as ferramentas ao seu nível",
        [
          ["Principiante — quero aprender", "🌱"],
          ["Tenho alguma experiência", "📈"],
          ["Sou um trader experiente", "⚡"],
          ["Sou um trader profissional", "🏆"],
        ],
      ],
      [
        "Quer ser contactado por um consultor?",
        "Os nossos consultores ajudam-no nos próximos passos",
        [
          ["Sim, estou pronto para falar sobre os próximos passos", "✅"],
          ["Sim, mas primeiro preciso de mais informações", "💬"],
        ],
      ],
    ],
  }),
  done: "Concluído",
  lastStep: "Último passo",
  questionOf: (n: number, t: number) => `Pergunta ${n} de ${t}`,
  thanks: (name: string) => `Obrigado ${name}, recebemos o seu pedido!`,
  willCall: "Um dos nossos consultores vai ligar-lhe para o número",
  willCallEnd: "para o ajudar a abrir a sua conta e ativar as ferramentas de IA.",
  nextSteps: [
    "Mantenha o telemóvel por perto",
    "Tenha o Cartão de Cidadão à mão",
    "Comece com um depósito de apenas 250 €",
  ],
  qualified: "Pode começar",
  formTitle: "Para onde enviamos o seu plano pessoal?",
  formSub: "Introduza os seus dados para que um consultor o contacte e ative a sua conta",
  firstName: "Nome próprio",
  firstPh: "ex. João",
  lastName: "Apelido",
  lastPh: "ex. Silva",
  email: "E-mail",
  didYouMean: "Queria dizer",
  phone: "Número de telemóvel",
  countryCode: "Indicativo",
  consent:
    "Aceito ser contactado por um consultor por telefone ou e-mail e compreendo que o trading envolve riscos e que posso perder parte ou a totalidade do capital investido.",
  sending: "A enviar...",
  loadingSteps: [
    "A verificar os seus dados...",
    "A criar a sua conta...",
    "A preparar o seu plano pessoal...",
  ],
  redirecting: "Concluído! A redirecioná-lo para a sua conta...",
  pleaseWait: "Por favor, não feche esta página",
  submit: "Receber o meu plano e começar com 250 €",
  encrypted: "Os seus dados estão encriptados",
  noShare: "Não partilhamos os seus dados",
  back: "Voltar",
  skip: "Saltar",
  skipAll: "Saltar todas as perguntas",
  optional: "Opcional",
  failSave: "Não foi possível enviar o pedido, tente novamente",
  failCheck: "Verifique os seus dados e tente novamente",
};

const ES_ES: typeof SA_EN = {
  questions: eurQuestions("es", {
    q: [
      [
        "¿Cuánto piensas invertir?",
        "Elige el importe más cercano",
        [
          ["Menos de 1.000 €", "🟢"],
          ["1.000–1.999 €", "🔵"],
          ["2.000–9.999 €", "🟡"],
          ["10.000 € o más", "💎"],
        ],
      ],
      [
        "¿Cuándo piensas empezar a invertir?",
        "Sin compromiso — solo para conocer tus plazos",
        [
          ["En los próximos 7 días", "⚡"],
          ["En los próximos 30 días", "📅"],
          ["En los próximos 3 meses", "🗓️"],
          ["Por ahora solo estoy explorando", "🧭"],
        ],
      ],
      [
        "¿Cuál es tu experiencia en trading?",
        "No hay respuestas incorrectas — adaptamos las herramientas a tu nivel",
        [
          ["Principiante — quiero aprender", "🌱"],
          ["Tengo algo de experiencia", "📈"],
          ["Soy un trader con experiencia", "⚡"],
          ["Soy un trader profesional", "🏆"],
        ],
      ],
      [
        "¿Quieres que te contacte un asesor?",
        "Nuestros asesores te ayudan con los siguientes pasos",
        [
          ["Sí, estoy listo para hablar de los siguientes pasos", "✅"],
          ["Sí, pero primero necesito más información", "💬"],
        ],
      ],
    ],
  }),
  done: "Completado",
  lastStep: "Último paso",
  questionOf: (n: number, t: number) => `Pregunta ${n} de ${t}`,
  thanks: (name: string) => `¡Gracias ${name}, hemos recibido tu solicitud!`,
  willCall: "Uno de nuestros asesores te llamará al",
  willCallEnd: "para ayudarte a abrir tu cuenta y activar las herramientas de IA.",
  nextSteps: [
    "Ten el teléfono cerca",
    "Ten a mano tu DNI o NIE",
    "Empieza con un depósito de solo 250 €",
  ],
  qualified: "Ya puedes empezar",
  formTitle: "¿Dónde te enviamos tu plan personal?",
  formSub: "Introduce tus datos para que un asesor te contacte y active tu cuenta",
  firstName: "Nombre",
  firstPh: "p. ej. Javier",
  lastName: "Apellidos",
  lastPh: "p. ej. García",
  email: "Correo electrónico",
  didYouMean: "¿Quisiste decir",
  phone: "Número de móvil",
  countryCode: "Prefijo",
  consent:
    "Acepto que un asesor me contacte por teléfono o correo electrónico y entiendo que el trading conlleva riesgos y que puedo perder parte o la totalidad de mi capital.",
  sending: "Enviando...",
  loadingSteps: [
    "Verificando tus datos...",
    "Creando tu cuenta...",
    "Preparando tu plan personal...",
  ],
  redirecting: "¡Listo! Te llevamos a tu cuenta...",
  pleaseWait: "Por favor, no cierres esta página",
  submit: "Obtener mi plan y empezar con 250 €",
  encrypted: "Tus datos están cifrados",
  noShare: "No compartimos tus datos",
  back: "Atrás",
  skip: "Omitir",
  skipAll: "Omitir todas las preguntas",
  optional: "Opcional",
  failSave: "No se pudo enviar tu solicitud, inténtalo de nuevo",
  failCheck: "Revisa tus datos e inténtalo de nuevo",
};

const COPY: Record<PageId, typeof SA_EN> = {
  "gb-en": GB_EN,
  "sa-ar": SA_AR,
  "sa-en": SA_EN,
  "it-it": IT_IT,
  "de-de": DE_DE,
  "pt-pt": PT_PT,
  "es-es": ES_ES,
};

type FieldKey = "firstName" | "lastName" | "email" | "phone" | "consent";
type Errors = Partial<Record<FieldKey | "form", string>>;

export function LeadQuiz({ page }: { page: PageId }) {
  const { market, lang } = PAGES[page];
  const t = COPY[page];
  const QUESTIONS = t.questions;
  const COUNTRIES = countriesFor(market);
  const rtl = lang === "ar";
  const Forward = rtl ? ArrowLeft : ArrowRight;
  const Back = rtl ? ArrowRight : ArrowLeft;
  const schema = makeContactSchema(lang, market);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Answers>>({});
  const [website, setWebsite] = useState(""); // honeypot
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState<string>(MARKETS[market].defaultDial);
  // After hydration (so server and client HTML match): switch to the visitor's own dial code,
  // e.g. +962 for Jordan, from the country cookie the server sets (src/server.ts).
  useEffect(() => {
    setCountryCode(dialCodeFor(market, readVisitorCountry(document.cookie)));
  }, [market]);
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);

  // While waiting for the CRM, ease the bar towards 95% so it keeps moving but never "finishes" early.
  useEffect(() => {
    if (!loading) {
      setSendProgress(0);
      return;
    }
    setSendProgress(8);
    const id = setInterval(() => setSendProgress((p) => p + (95 - p) * 0.06), 150);
    return () => clearInterval(id);
  }, [loading]);
  const [done, setDone] = useState(false);

  const total = QUESTIONS.length + 1;
  const isForm = step === QUESTIONS.length;
  const progress = done ? 100 : Math.round((step / total) * 100);
  const q = QUESTIONS[step];

  /** Leave this question unanswered (clearing any earlier answer) and move on. */
  const skip = (field: string) => {
    setAnswers(({ [field]: _skipped, ...rest }) => rest);
    setStep((s) => Math.min(s + 1, QUESTIONS.length));
  };

  const choose = (field: string, value: QuizValue) => {
    setAnswers((a) => ({ ...a, [field]: value }));
    setTimeout(() => setStep((s) => Math.min(s + 1, QUESTIONS.length)), 220);
  };

  const validate = (): Errors => {
    const res = schema.safeParse({ firstName, lastName, email, countryCode, phone, consent });
    const e: Errors = {};
    if (!res.success) {
      for (const issue of res.error.issues) {
        const k = issue.path[0] as keyof Errors;
        if (!e[k]) e[k] = issue.message;
      }
    }
    // The schema's cross-field phone check only runs once other fields pass; check it here too.
    if (!e.phone && phone.trim() && !isValidPhone(phone, countryCode)) {
      e.phone = phoneErrorMessage(lang, countryCode);
    }
    return e;
  };

  const liveErrors = validate();
  const fieldError = (k: FieldKey) => (touched[k] ? liveErrors[k] : undefined) ?? errors[k];
  const emailFix = suggestEmailFix(email);
  const phoneOk = phone.length > 0 && isValidPhone(phone, countryCode);
  const country = COUNTRIES.find((c) => c.code === countryCode)!;

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setTouched({ firstName: true, lastName: true, email: true, phone: true, consent: true });
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    // Questions are optional: unanswered ones are simply left out of the lead.
    setLoading(true);
    try {
      const res = await submitLead({
        market,
        contact: { firstName, lastName, email, countryCode, phone, consent },
        answers: answers as Answers,
        website,
      });
      if (res.ok && res.autologinUrl) {
        // Keep the loading overlay up (at 100%) while the browser navigates away.
        setRedirecting(true);
        const url = res.autologinUrl;
        setTimeout(() => window.location.assign(url), 400);
        return;
      }
      if (res.ok) setDone(true);
      else setErrors({ form: t.failSave });
    } catch {
      setErrors({ form: t.failCheck });
    }
    setLoading(false);
  };

  const nameField = (
    id: "firstName" | "lastName",
    value: string,
    setter: (v: string) => void,
    label: string,
    ph: string,
    auto: string,
  ) => (
    <Field
      id={id}
      label={label}
      icon={<User className="h-4 w-4" />}
      error={fieldError(id)}
      valid={touched[id] && !liveErrors[id]}
    >
      <input
        id={id}
        autoComplete={auto}
        value={value}
        maxLength={50}
        onChange={(e) => setter(e.target.value)}
        onBlur={() => setTouched((x) => ({ ...x, [id]: true }))}
        placeholder={ph}
        className="h-full w-full min-w-0 bg-transparent outline-none placeholder:text-muted-foreground/60"
      />
    </Field>
  );

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-card p-6 shadow-card backdrop-blur-xl sm:p-10">
      <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 -bottom-24 h-64 w-64 rounded-full bg-gold/15 blur-3xl" />

      <div className="relative mb-8">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {done
              ? t.done
              : isForm
                ? t.lastStep
                : `${t.questionOf(step + 1, QUESTIONS.length)} · ${t.optional}`}
          </span>
          <span className="font-bold text-primary">{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {loading && (
        <SubmitOverlay
          progress={redirecting ? 100 : sendProgress}
          message={
            redirecting
              ? t.redirecting
              : t.loadingSteps[Math.min(Math.floor(sendProgress / 33), t.loadingSteps.length - 1)]!
          }
          hint={t.pleaseWait}
        />
      )}

      <div className="relative min-h-[420px]">
        {done ? (
          <div className="flex flex-col items-center py-10 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 animate-pulse-ring">
              <CheckCircle2 className="h-11 w-11 text-primary" />
            </div>
            <h3 className="text-2xl font-bold sm:text-3xl">{t.thanks(firstName.trim())}</h3>
            <p className="mt-3 max-w-md text-muted-foreground">
              {t.willCall}{" "}
              <span dir="ltr" className="font-semibold text-foreground">
                {countryCode} {phone}
              </span>{" "}
              {t.willCallEnd}
            </p>
            <div className="mt-8 grid w-full max-w-md gap-3 text-start text-sm">
              {t.nextSteps.map((s) => (
                <div
                  key={s}
                  className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3"
                >
                  <Check className="h-4 w-4 shrink-0 text-primary" />
                  {s}
                </div>
              ))}
            </div>
          </div>
        ) : isForm ? (
          <form onSubmit={onSubmit} noValidate className="animate-in fade-in duration-300">
            <div className="mb-6 text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                <Check className="h-3.5 w-3.5" /> {t.qualified}
              </span>
              <h3 className="mt-4 text-2xl font-bold sm:text-3xl">{t.formTitle}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t.formSub}</p>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {nameField(
                  "firstName",
                  firstName,
                  setFirstName,
                  t.firstName,
                  t.firstPh,
                  "given-name",
                )}
                {nameField("lastName", lastName, setLastName, t.lastName, t.lastPh, "family-name")}
              </div>

              <Field
                id="email"
                label={t.email}
                icon={<Mail className="h-4 w-4" />}
                error={fieldError("email")}
                valid={touched.email && !liveErrors.email}
              >
                <input
                  id="email"
                  type="email"
                  dir="ltr"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  maxLength={255}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched((x) => ({ ...x, email: true }))}
                  placeholder="name@example.com"
                  className={cn(
                    "h-full w-full bg-transparent outline-none placeholder:text-muted-foreground/60",
                    rtl && "text-right",
                  )}
                />
              </Field>
              {emailFix && (
                <button
                  type="button"
                  onClick={() => setEmail(emailFix)}
                  className="-mt-2 text-xs text-gold underline underline-offset-4"
                >
                  {t.didYouMean} <span dir="ltr">{emailFix}</span>?
                </button>
              )}

              <div>
                <label htmlFor="phone" className="mb-1.5 block text-sm font-medium">
                  {t.phone}
                </label>
                <div className="flex gap-2" dir="ltr">
                  <select
                    aria-label={t.countryCode}
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="h-12 rounded-xl border border-input bg-muted/50 px-2 text-sm outline-none focus:border-primary"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code} className="bg-card">
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>
                  <div
                    className={cn(
                      "flex h-12 flex-1 items-center gap-2 rounded-xl border bg-muted/50 px-3 transition-colors focus-within:border-primary",
                      touched.phone && liveErrors.phone
                        ? "border-destructive"
                        : phoneOk
                          ? "border-primary/60"
                          : "border-input",
                    )}
                  >
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <input
                      id="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel-national"
                      value={phone}
                      maxLength={20}
                      onChange={(e) =>
                        setPhone(e.target.value.replace(/[^\d\u0660-\u0669\s+\-]/g, ""))
                      }
                      onBlur={() => setTouched((x) => ({ ...x, phone: true }))}
                      placeholder={country.example}
                      className="h-full w-full bg-transparent outline-none placeholder:text-muted-foreground/60"
                    />
                    {phoneOk && <CheckCircle2 className="h-4 w-4 text-primary" />}
                  </div>
                </div>
                {fieldError("phone") && <ErrorText>{fieldError("phone")}</ErrorText>}
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    setTouched((x) => ({ ...x, consent: true }));
                  }}
                  className="mt-0.5 h-4 w-4 accent-primary"
                />
                <span>{t.consent}</span>
              </label>
              {fieldError("consent") && <ErrorText>{fieldError("consent")}</ErrorText>}

              {/* Honeypot: invisible to people, bots tend to fill it. */}
              <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <label htmlFor="website">Website</label>
                <input
                  id="website"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              {errors.form && (
                <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  {errors.form}
                </div>
              )}

              <Button type="submit" variant="hero" size="xl" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" /> {t.sending}
                  </>
                ) : (
                  <>
                    {t.submit} <Forward />
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5" /> {t.encrypted}
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> {t.noShare}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="mt-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <Back className="h-4 w-4" /> {t.back}
            </button>
          </form>
        ) : q ? (
          <div key={step} className="animate-in fade-in duration-300">
            <h3 className="text-center text-2xl font-bold sm:text-3xl">{q.title}</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">{q.hint}</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {q.options.map((o) => {
                const selected = answers[q.field] === o.value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => choose(q.field, o.value)}
                    className={cn(
                      "group flex items-center gap-4 rounded-2xl border p-4 text-start transition-all hover:-translate-y-0.5 hover:border-primary/70 hover:bg-primary/5",
                      selected
                        ? "border-primary bg-primary/10 shadow-glow"
                        : "border-border bg-muted/30",
                    )}
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-background/60 text-2xl">
                      {o.icon}
                    </span>
                    <span className="flex-1 font-semibold">{o.label}</span>
                    <span
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full border transition-colors",
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border",
                      )}
                    >
                      {selected && <Check className="h-3.5 w-3.5" />}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                >
                  <Back className="h-4 w-4" /> {t.back}
                </button>
              ) : (
                <span />
              )}
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setStep(QUESTIONS.length)}
                  className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  {t.skipAll}
                </button>
                <button
                  type="button"
                  onClick={() => skip(q.field)}
                  className="flex items-center gap-1 font-semibold text-primary hover:text-primary/80"
                >
                  {t.skip} <Forward className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  icon,
  error,
  valid,
  children,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  error?: string | undefined;
  valid?: boolean | undefined;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <div
        className={cn(
          "flex h-12 items-center gap-2 rounded-xl border bg-muted/50 px-3 transition-colors focus-within:border-primary",
          error ? "border-destructive" : valid ? "border-primary/60" : "border-input",
        )}
      >
        <span className="text-muted-foreground">{icon}</span>
        {children}
        {valid && !error && <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />}
      </div>
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}

function SubmitOverlay({
  progress,
  message,
  hint,
}: {
  progress: number;
  message: string;
  hint: string;
}) {
  const pct = Math.round(progress);
  return (
    <div
      role="status"
      aria-live="polite"
      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/85 p-8 text-center backdrop-blur-md animate-in fade-in duration-300"
    >
      <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-muted" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary border-r-primary/60" />
        <span className="text-sm font-bold text-primary tabular-nums">{pct}%</span>
      </div>
      <p key={message} className="text-lg font-semibold animate-in fade-in duration-300">
        {message}
      </p>
      <div
        className="mt-5 h-2 w-full max-w-xs overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      >
        <div
          className="h-full rounded-full bg-gradient-primary transition-all duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-4 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive" role="alert">
      <AlertCircle className="h-3.5 w-3.5" /> {children}
    </p>
  );
}
