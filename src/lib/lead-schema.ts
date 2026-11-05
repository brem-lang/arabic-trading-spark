import { z } from "zod";

/** Gulf country codes with their local mobile-number rules. */
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
] as const;

export type CountryCode = (typeof COUNTRIES)[number]["code"];

/** Convert Arabic-Indic / Persian digits to Latin and strip spaces, dashes, brackets. */
export function normalizeDigits(value: string): string {
  return value
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[\s\-().]/g, "");
}

/** Turn a locally typed number (e.g. 0501234567, 966501234567) into its local part. */
export function toLocalNumber(raw: string, countryCode: string): string {
  let n = normalizeDigits(raw);
  const cc = countryCode.replace("+", "");
  if (n.startsWith("+")) n = n.slice(1);
  if (n.startsWith("00")) n = n.slice(2);
  if (n.startsWith(cc) && n.length > cc.length + 6) n = n.slice(cc.length);
  if (n.startsWith("0")) n = n.slice(1);
  return n;
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

export type Lang = "ar" | "en";

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
} as const;

export function phoneErrorMessage(lang: Lang, countryCode: string): string {
  const ex = COUNTRIES.find((c) => c.code === countryCode)?.example ?? "";
  return `${MESSAGES[lang].phoneInvalid} ${ex}`;
}

// A single name part: Arabic or Latin letters, optional inner space/hyphen/apostrophe.
const NAME_PART_RE = /^[\p{Script=Arabic}A-Za-z]+(?:[\s'-][\p{Script=Arabic}A-Za-z]+)*$/u;
// Strict email: user@domain.tld with a 2+ letter TLD.
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

export function makeContactSchema(lang: Lang) {
  const m = MESSAGES[lang];
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
      countryCode: z.enum(COUNTRIES.map((c) => c.code) as [CountryCode, ...CountryCode[]], {
        errorMap: () => ({ message: m.country }),
      }),
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

export const contactSchema = makeContactSchema("ar");

export type ContactInput = z.input<typeof contactSchema>;

/**
 * Quiz questions and their canonical answer values. These exact English strings are what the
 * CRM receives whatever language the visitor sees; the UI maps each value to a translated label.
 */
export const QUIZ_OPTIONS = {
  is_saudi_citizen: ["Yes, I am a Saudi citizen.", "No"],
  investment_amount: [
    "Less than SAR 5,000",
    "SAR 5,000–9,999",
    "SAR 10,000–49,999",
    "SAR 50,000 or more",
  ],
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

export type QuizField = keyof typeof QUIZ_OPTIONS;
export type QuizValue<K extends QuizField = QuizField> = (typeof QUIZ_OPTIONS)[K][number];
export const QUIZ_FIELDS = Object.keys(QUIZ_OPTIONS) as QuizField[];

export const answerSchema = z.object({
  is_saudi_citizen: z.enum(QUIZ_OPTIONS.is_saudi_citizen),
  investment_amount: z.enum(QUIZ_OPTIONS.investment_amount),
  investment_start_time: z.enum(QUIZ_OPTIONS.investment_start_time),
  experience_level: z.enum(QUIZ_OPTIONS.experience_level),
  wants_contact: z.enum(QUIZ_OPTIONS.wants_contact),
});

export type Answers = z.infer<typeof answerSchema>;

export const leadSubmissionSchema = z.object({
  contact: contactSchema,
  answers: answerSchema,
  /** Honeypot: hidden from people, usually filled by bots. Forwarded as-is to the CRM. */
  website: z.string().max(200).optional().default(""),
});

export type LeadSubmission = z.output<typeof leadSubmissionSchema>;

export function toE164(phone: string, countryCode: string): string {
  return `${countryCode}${toLocalNumber(phone, countryCode)}`;
}

export function countryIso(countryCode: string): string {
  return COUNTRIES.find((c) => c.code === countryCode)?.iso ?? "";
}

/** The JSON body the CRM's submit-leads endpoint expects. */
export function toCrmPayload({ contact, answers, website }: LeadSubmission, ipAddress: string) {
  return {
    firstname: contact.firstName,
    lastname: contact.lastName,
    email: contact.email,
    mobile: toE164(contact.phone, contact.countryCode),
    country_code: countryIso(contact.countryCode),
    ip_address: ipAddress,
    website,
    questions: QUIZ_FIELDS.map((key) => ({ key, value: answers[key] })),
  };
}
