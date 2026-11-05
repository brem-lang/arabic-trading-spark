import { z } from "zod";

/** Gulf country codes with their local mobile-number rules. */
export const COUNTRIES = [
  { code: "+966", label: "السعودية", flag: "🇸🇦", pattern: /^5\d{8}$/, example: "5XXXXXXXX" },
  { code: "+971", label: "الإمارات", flag: "🇦🇪", pattern: /^5\d{8}$/, example: "5XXXXXXXX" },
  { code: "+965", label: "الكويت", flag: "🇰🇼", pattern: /^[569]\d{7}$/, example: "5XXXXXXX" },
  { code: "+974", label: "قطر", flag: "🇶🇦", pattern: /^[3567]\d{7}$/, example: "3XXXXXXX" },
  { code: "+973", label: "البحرين", flag: "🇧🇭", pattern: /^3\d{7}$/, example: "3XXXXXXX" },
  { code: "+968", label: "عُمان", flag: "🇴🇲", pattern: /^[79]\d{7}$/, example: "9XXXXXXX" },
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

export const QUIZ_FIELDS = ["experience", "goal", "budget", "ai_interest"] as const;
export type QuizField = (typeof QUIZ_FIELDS)[number];

export const answerSchema = z.object({
  experience: z.string().trim().min(1).max(60),
  goal: z.string().trim().min(1).max(60),
  budget: z.string().trim().min(1).max(60),
  ai_interest: z.string().trim().min(1).max(60),
});

export const leadSubmissionSchema = z.object({
  contact: contactSchema,
  answers: answerSchema,
});

export function toE164(phone: string, countryCode: string): string {
  return `${countryCode}${toLocalNumber(phone, countryCode)}`;
}
