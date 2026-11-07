import { z } from "zod";
import { MARKETS, type Lang, type MarketId } from "./markets";

export type { Lang, MarketId } from "./markets";

/** Dial codes with their local mobile-number rules. Each market offers a subset (MARKETS[m].dialCodes). */
export const COUNTRIES = [
  {
    code: "+966",
    iso: "SA",
    label: "السعودية",
    flag: "🇸🇦",
    pattern: /^5\d{8}$/,
    example: "5XXXXXXXX",
  },
  {
    code: "+971",
    iso: "AE",
    label: "الإمارات",
    flag: "🇦🇪",
    pattern: /^5\d{8}$/,
    example: "5XXXXXXXX",
  },
  {
    code: "+965",
    iso: "KW",
    label: "الكويت",
    flag: "🇰🇼",
    pattern: /^[569]\d{7}$/,
    example: "5XXXXXXX",
  },
  {
    code: "+974",
    iso: "QA",
    label: "قطر",
    flag: "🇶🇦",
    pattern: /^[3567]\d{7}$/,
    example: "3XXXXXXX",
  },
  {
    code: "+973",
    iso: "BH",
    label: "البحرين",
    flag: "🇧🇭",
    pattern: /^3\d{7}$/,
    example: "3XXXXXXX",
  },
  {
    code: "+968",
    iso: "OM",
    label: "عُمان",
    flag: "🇴🇲",
    pattern: /^[79]\d{7}$/,
    example: "9XXXXXXX",
  },
  // Jordan: 77 / 78 / 79 + 7 digits (07X XXX XXXX locally).
  {
    code: "+962",
    iso: "JO",
    label: "الأردن",
    flag: "🇯🇴",
    pattern: /^7[789]\d{7}$/,
    example: "7XXXXXXXX",
  },
  // Lebanon: 3 + 6 digits (03 XXX XXX locally), or 70 / 71 / 76 / 78 / 79 / 81 + 6 digits.
  {
    code: "+961",
    iso: "LB",
    label: "لبنان",
    flag: "🇱🇧",
    pattern: /^(?:3\d{6}|7[01689]\d{6}|81\d{6})$/,
    example: "71XXXXXX",
  },
  // UK mobiles: 07xxx xxxxxx, excluding 076 pagers (except 07624, Isle of Man mobiles).
  {
    code: "+44",
    iso: "GB",
    label: "United Kingdom",
    flag: "🇬🇧",
    pattern: /^7(?:[0-57-9]\d{8}|624\d{6})$/,
    example: "7XXXXXXXXX",
  },
  // Mobile rules below match profitsolution's api/phone-check.php.
  // Italy: 3xx + 6–7 digits, no trunk 0.
  {
    code: "+39",
    iso: "IT",
    label: "Italia",
    flag: "🇮🇹",
    pattern: /^3\d{8,9}$/,
    example: "3XXXXXXXXX",
  },
  // Germany: 015x / 016x / 017x, 10–11 digits without the trunk 0.
  {
    code: "+49",
    iso: "DE",
    label: "Deutschland",
    flag: "🇩🇪",
    pattern: /^1[5-7]\d{8,9}$/,
    example: "15XXXXXXXXX",
  },
  // Portugal: 91 / 92 / 93 / 96 + 7 digits.
  {
    code: "+351",
    iso: "PT",
    label: "Portugal",
    flag: "🇵🇹",
    pattern: /^9[1236]\d{7}$/,
    example: "9XXXXXXXX",
  },
  // Spain: 6xx or 7[1-9]x, 9 digits.
  {
    code: "+34",
    iso: "ES",
    label: "España",
    flag: "🇪🇸",
    pattern: /^(?:6\d{8}|7[1-9]\d{7})$/,
    example: "6XXXXXXXX",
  },
] as const;

export type CountryCode = (typeof COUNTRIES)[number]["code"];

export function countriesFor(market: MarketId) {
  const codes: readonly string[] = MARKETS[market].dialCodes;
  return COUNTRIES.filter((c) => codes.includes(c.code));
}

/** The dial code to pre-select: the visitor's own country when this market offers it. */
export function dialCodeFor(market: MarketId, country: string | null | undefined): string {
  const iso = country?.toUpperCase();
  return countriesFor(market).find((c) => c.iso === iso)?.code ?? MARKETS[market].defaultDial;
}

/** Convert Arabic-Indic / Persian digits to Latin and strip spaces, dashes, brackets. */
export function normalizeDigits(value: string): string {
  return value
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[\s\-().]/g, "");
}

const dropTrunkZero = (n: string) => (n.startsWith("0") ? n.slice(1) : n);

/** Turn a locally typed number (e.g. 0501234567, 966501234567) into its local part. */
export function toLocalNumber(raw: string, countryCode: string): string {
  let n = normalizeDigits(raw);
  const cc = countryCode.replace("+", "");
  const pattern = COUNTRIES.find((c) => c.code === countryCode)?.pattern;
  let international = false;
  if (n.startsWith("+")) [n, international] = [n.slice(1), true];
  else if (n.startsWith("00")) [n, international] = [n.slice(2), true];
  if (n.startsWith(cc)) {
    // Without "+" a leading country code is ambiguous: Italian mobiles can start with 39
    // (393…), so only strip it when the number isn't valid as typed but is valid without it.
    const rest = dropTrunkZero(n.slice(cc.length));
    const validAsTyped = pattern?.test(dropTrunkZero(n)) ?? false;
    if (international || (!validAsTyped && (pattern?.test(rest) ?? n.length > cc.length + 6))) {
      n = n.slice(cc.length);
    }
  }
  return dropTrunkZero(n);
}

export function isValidPhone(raw: string, countryCode: string): boolean {
  const country = COUNTRIES.find((c) => c.code === countryCode);
  if (!country) return false;
  return country.pattern.test(toLocalNumber(raw, countryCode));
}

const COMMON_DOMAIN_TYPOS: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gmal.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gamil.com": "gmail.com",
  "gmail.con": "gmail.com",
  "hotmial.com": "hotmail.com",
  "hotmail.co": "hotmail.com",
  "hotmai.com": "hotmail.com",
  "yaho.com": "yahoo.com",
  "yahoo.co": "yahoo.com",
  "outlok.com": "outlook.com",
  "icloud.co": "icloud.com",
};

export function suggestEmailFix(email: string): string | null {
  const [user, domain] = email.trim().toLowerCase().split("@");
  if (!user || !domain) return null;
  const fix = COMMON_DOMAIN_TYPOS[domain];
  return fix ? `${user}@${fix}` : null;
}

const MESSAGES = {
  ar: {
    firstEmpty: "الرجاء إدخال الاسم الأول",
    lastEmpty: "الرجاء إدخال اسم العائلة",
    nameShort: "حرفان على الأقل",
    nameLong: "الاسم طويل جداً",
    nameChars: "الحروف فقط بدون أرقام أو رموز",
    emailEmpty: "الرجاء إدخال البريد الإلكتروني",
    emailLong: "البريد الإلكتروني طويل جداً",
    emailFormat: "صيغة البريد الإلكتروني غير صحيحة",
    emailTypo: "يبدو أن هناك خطأ إملائي في البريد",
    country: "اختر رمز الدولة",
    phoneEmpty: "الرجاء إدخال رقم الجوال",
    phoneInvalid: "رقم الجوال غير صحيح — مثال:",
    consent: "يجب الموافقة على التواصل وشروط المخاطر",
  },
  en: {
    firstEmpty: "Please enter your first name",
    lastEmpty: "Please enter your last name",
    nameShort: "At least 2 letters",
    nameLong: "Name is too long",
    nameChars: "Letters only, no numbers or symbols",
    emailEmpty: "Please enter your email",
    emailLong: "Email is too long",
    emailFormat: "Invalid email format",
    emailTypo: "Looks like a typo in your email",
    country: "Choose a country code",
    phoneEmpty: "Please enter your mobile number",
    phoneInvalid: "Invalid mobile number — e.g.",
    consent: "You must agree to be contacted and accept the risk terms",
  },
  it: {
    firstEmpty: "Inserisci il tuo nome",
    lastEmpty: "Inserisci il tuo cognome",
    nameShort: "Almeno 2 lettere",
    nameLong: "Il nome è troppo lungo",
    nameChars: "Solo lettere, senza numeri o simboli",
    emailEmpty: "Inserisci la tua e-mail",
    emailLong: "L'e-mail è troppo lunga",
    emailFormat: "Formato e-mail non valido",
    emailTypo: "Sembra che ci sia un errore di battitura nell'e-mail",
    country: "Scegli un prefisso",
    phoneEmpty: "Inserisci il tuo numero di cellulare",
    phoneInvalid: "Numero di cellulare non valido — es.",
    consent: "Devi acconsentire a essere contattato e accettare l'avvertenza sui rischi",
  },
  de: {
    firstEmpty: "Bitte gib deinen Vornamen ein",
    lastEmpty: "Bitte gib deinen Nachnamen ein",
    nameShort: "Mindestens 2 Buchstaben",
    nameLong: "Der Name ist zu lang",
    nameChars: "Nur Buchstaben, keine Zahlen oder Symbole",
    emailEmpty: "Bitte gib deine E-Mail-Adresse ein",
    emailLong: "Die E-Mail-Adresse ist zu lang",
    emailFormat: "Ungültiges E-Mail-Format",
    emailTypo: "Deine E-Mail-Adresse scheint einen Tippfehler zu enthalten",
    country: "Wähle eine Ländervorwahl",
    phoneEmpty: "Bitte gib deine Handynummer ein",
    phoneInvalid: "Ungültige Handynummer — z. B.",
    consent: "Du musst der Kontaktaufnahme und dem Risikohinweis zustimmen",
  },
  pt: {
    firstEmpty: "Introduza o seu nome próprio",
    lastEmpty: "Introduza o seu apelido",
    nameShort: "Pelo menos 2 letras",
    nameLong: "O nome é demasiado longo",
    nameChars: "Apenas letras, sem números nem símbolos",
    emailEmpty: "Introduza o seu e-mail",
    emailLong: "O e-mail é demasiado longo",
    emailFormat: "Formato de e-mail inválido",
    emailTypo: "Parece haver um erro de escrita no seu e-mail",
    country: "Escolha um indicativo",
    phoneEmpty: "Introduza o seu número de telemóvel",
    phoneInvalid: "Número de telemóvel inválido — ex.",
    consent: "Tem de aceitar ser contactado e o aviso de risco",
  },
  es: {
    firstEmpty: "Introduce tu nombre",
    lastEmpty: "Introduce tus apellidos",
    nameShort: "Al menos 2 letras",
    nameLong: "El nombre es demasiado largo",
    nameChars: "Solo letras, sin números ni símbolos",
    emailEmpty: "Introduce tu correo electrónico",
    emailLong: "El correo electrónico es demasiado largo",
    emailFormat: "Formato de correo no válido",
    emailTypo: "Parece que hay un error en tu correo electrónico",
    country: "Elige un prefijo",
    phoneEmpty: "Introduce tu número de móvil",
    phoneInvalid: "Número de móvil no válido — p. ej.",
    consent: "Debes aceptar ser contactado y la advertencia de riesgo",
  },
} as const satisfies Record<Lang, Record<string, string>>;

export function phoneErrorMessage(lang: Lang, countryCode: string): string {
  const ex = COUNTRIES.find((c) => c.code === countryCode)?.example ?? "";
  return `${MESSAGES[lang].phoneInvalid} ${ex}`;
}

// A single name part: Arabic or Latin letters (accents included, e.g. José, Müller), optional
// inner space/hyphen/apostrophe.
const LETTERS = "[\\p{Script=Arabic}\\p{Script=Latin}\\p{M}]+";
const NAME_PART_RE = new RegExp(`^${LETTERS}(?:[\\s'-]${LETTERS})*$`, "u");
// Strict email: user@domain.tld with a 2+ letter TLD.
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

/** Contact form rules; `market` limits the phone dial codes to the ones that market accepts. */
export function makeContactSchema(lang: Lang, market: MarketId = "sa") {
  const m = MESSAGES[lang];
  const codes = MARKETS[market].dialCodes as unknown as [CountryCode, ...CountryCode[]];
  const namePart = (empty: string) =>
    z
      .string()
      .trim()
      .min(1, { message: empty })
      .min(2, { message: m.nameShort })
      .max(50, { message: m.nameLong })
      .transform((v) => v.replace(/\s+/g, " "))
      .refine((v) => NAME_PART_RE.test(v), { message: m.nameChars });

  return z
    .object({
      firstName: namePart(m.firstEmpty),
      lastName: namePart(m.lastEmpty),
      email: z
        .string()
        .trim()
        .toLowerCase()
        .min(1, { message: m.emailEmpty })
        .max(255, { message: m.emailLong })
        .refine((v) => EMAIL_RE.test(v), { message: m.emailFormat })
        .refine((v) => !suggestEmailFix(v), { message: m.emailTypo }),
      countryCode: z.enum(codes, { errorMap: () => ({ message: m.country }) }),
      phone: z.string().trim().min(1, { message: m.phoneEmpty }).max(20),
      consent: z.literal(true, { errorMap: () => ({ message: m.consent }) }),
    })
    .superRefine((val, ctx) => {
      if (val.phone && !isValidPhone(val.phone, val.countryCode)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["phone"],
          message: phoneErrorMessage(lang, val.countryCode),
        });
      }
    });
}

export const contactSchema = makeContactSchema("ar", "sa");

export type ContactInput = z.input<typeof contactSchema>;

const COMMON_QUIZ = {
  investment_start_time: [
    "Within the next 7 days",
    "Within the next 30 days",
    "Within the next 3 months",
    "I am just exploring for now",
  ],
  experience_level: [
    "Beginner — I am ready to learn",
    "I have some experience",
    "I am an experienced trader",
    "I am a professional trader",
  ],
  wants_contact: [
    "Yes, I am ready to discuss the next steps.",
    "Yes, but I need more information first.",
  ],
} as const;

/** Quiz shared by the euro markets (IT, DE, PT, ES). */
const EUR_QUIZ = {
  investment_amount: ["Less than €1,000", "€1,000–1,999", "€2,000–9,999", "€10,000 or more"],
  ...COMMON_QUIZ,
} as const;

/**
 * Each market's quiz: question keys, in order, and their canonical answer values. These exact
 * English strings are what the CRM receives whatever language the visitor sees; the UI maps
 * each value to a translated label. Every question is optional: visitors may skip any of them.
 */
export const QUIZ = {
  sa: {
    is_saudi_citizen: ["Yes, I am a Saudi citizen.", "No"],
    investment_amount: [
      "Less than SAR 5,000",
      "SAR 5,000–9,999",
      "SAR 10,000–49,999",
      "SAR 50,000 or more",
    ],
    ...COMMON_QUIZ,
  },
  gb: {
    investment_amount: ["Less than £1,000", "£1,000–1,999", "£2,000–9,999", "£10,000 or more"],
    ...COMMON_QUIZ,
  },
  it: { ...EUR_QUIZ },
  de: { ...EUR_QUIZ },
  pt: { ...EUR_QUIZ },
  es: { ...EUR_QUIZ },
} as const satisfies Record<MarketId, Record<string, readonly [string, ...string[]]>>;

/** Kept for code that only deals with the Saudi quiz. */
export const QUIZ_OPTIONS = QUIZ.sa;

export type QuizField<M extends MarketId = MarketId> = keyof (typeof QUIZ)[M] & string;
export type QuizValue = string;
export type Answers = Record<string, string>;

export function quizFields(market: MarketId): string[] {
  return Object.keys(QUIZ[market]);
}

export function makeAnswerSchema(market: MarketId) {
  const quiz = QUIZ[market] as Record<string, readonly [string, ...string[]]>;
  const shape = Object.fromEntries(
    Object.entries(quiz).map(([key, values]) => [
      key,
      z.enum(values as [string, ...string[]]).optional(),
    ]),
  );
  // Unknown keys are still rejected; a skipped question is simply absent.
  return z.object(shape).strict();
}

export const answerSchema = makeAnswerSchema("sa");

const marketSchema = z.enum(Object.keys(MARKETS) as [MarketId, ...MarketId[]]);

/** A full lead: contact rules and quiz answers both depend on the market the visitor came from. */
export const leadSubmissionSchema = z
  .object({
    market: marketSchema.default("sa"),
    contact: z.unknown(),
    answers: z.unknown(),
    /** Honeypot: hidden from people, usually filled by bots. Forwarded as-is to the CRM. */
    website: z.string().max(200).optional().default(""),
  })
  .transform((val, ctx) => {
    const contact = makeContactSchema("en", val.market).safeParse(val.contact);
    const answers = makeAnswerSchema(val.market).safeParse(val.answers);
    for (const [path, res] of [
      ["contact", contact],
      ["answers", answers],
    ] as const) {
      if (!res.success) {
        for (const issue of res.error.issues)
          ctx.addIssue({ ...issue, path: [path, ...issue.path] });
      }
    }
    if (!contact.success || !answers.success) return z.NEVER;
    return {
      market: val.market,
      contact: contact.data,
      answers: answers.data as Answers,
      website: val.website,
    };
  });

export type LeadSubmission = z.output<typeof leadSubmissionSchema>;

export function toE164(phone: string, countryCode: string): string {
  return `${countryCode}${toLocalNumber(phone, countryCode)}`;
}

export function countryIso(countryCode: string): string {
  return COUNTRIES.find((c) => c.code === countryCode)?.iso ?? "";
}

/** The JSON body the CRM's submit-leads endpoint expects. */
export function toCrmPayload(
  { market, contact, answers, website }: LeadSubmission,
  ipAddress: string,
) {
  return {
    firstname: contact.firstName,
    lastname: contact.lastName,
    email: contact.email,
    mobile: toE164(contact.phone, contact.countryCode),
    country_code: countryIso(contact.countryCode),
    ip_address: ipAddress,
    website,
    // Skipped questions are left out, so `questions` may be shorter than the quiz (or empty).
    questions: quizFields(market)
      .filter((key) => answers[key] !== undefined)
      .map((key) => ({ key, value: answers[key]! })),
  };
}
