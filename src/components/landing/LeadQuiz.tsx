import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
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
  COUNTRIES,
  makeContactSchema,
  phoneErrorMessage,
  suggestEmailFix,
  isValidPhone,
  type Lang,
  type QuizField,
} from "@/lib/lead-schema";
import { submitLead } from "@/lib/leads.functions";

type Question = { field: QuizField; title: string; hint: string; options: { label: string; icon: string }[] };

const COPY = {
  ar: {
    questions: [
      {
        field: "experience",
        title: "ما مستوى خبرتك في التداول؟",
        hint: "لا توجد إجابة خاطئة — نخصص لك الأدوات حسب مستواك",
        options: [
          { label: "مبتدئ تماماً", icon: "🌱" },
          { label: "جربت التداول قليلاً", icon: "📈" },
          { label: "متداول متوسط", icon: "⚡" },
          { label: "متداول محترف", icon: "🏆" },
        ],
      },
      {
        field: "goal",
        title: "ما هدفك الأساسي من التداول؟",
        hint: "اختر الأقرب لك",
        options: [
          { label: "دخل إضافي شهري", icon: "💰" },
          { label: "استثمار طويل المدى", icon: "🏦" },
          { label: "تعلّم الأسواق", icon: "🎓" },
          { label: "تنويع مدخراتي", icon: "🧭" },
        ],
      },
      {
        field: "budget",
        title: "كم تخطط أن تبدأ به؟",
        hint: "الحد الأدنى للبدء 250$ فقط",
        options: [
          { label: "250$ – 500$", icon: "🟢" },
          { label: "500$ – 1,000$", icon: "🔵" },
          { label: "1,000$ – 5,000$", icon: "🟡" },
          { label: "أكثر من 5,000$", icon: "💎" },
        ],
      },
      {
        field: "ai_interest",
        title: "كيف تريد أن يساعدك الذكاء الاصطناعي؟",
        hint: "أدوات AI تحلل السوق على مدار الساعة",
        options: [
          { label: "إشارات وتنبيهات ذكية", icon: "🔔" },
          { label: "تحليل السوق لحظياً", icon: "🤖" },
          { label: "إدارة المخاطر تلقائياً", icon: "🛡️" },
          { label: "كل ما سبق", icon: "✨" },
        ],
      },
    ] as Question[],
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
    submit: "احصل على خطتي وابدأ بـ 250$",
    encrypted: "بياناتك مشفّرة",
    noShare: "لا نشارك بياناتك",
    back: "رجوع",
    failSave: "تعذّر إرسال طلبك، حاول مرة أخرى",
    failCheck: "تحقق من بياناتك وحاول مرة أخرى",
  },
  en: {
    questions: [
      {
        field: "experience",
        title: "What's your trading experience?",
        hint: "No wrong answers — we tailor the tools to your level",
        options: [
          { label: "Complete beginner", icon: "🌱" },
          { label: "Tried it a little", icon: "📈" },
          { label: "Intermediate trader", icon: "⚡" },
          { label: "Professional trader", icon: "🏆" },
        ],
      },
      {
        field: "goal",
        title: "What's your main trading goal?",
        hint: "Pick the closest one",
        options: [
          { label: "Extra monthly income", icon: "💰" },
          { label: "Long-term investing", icon: "🏦" },
          { label: "Learn the markets", icon: "🎓" },
          { label: "Diversify my savings", icon: "🧭" },
        ],
      },
      {
        field: "budget",
        title: "How much do you plan to start with?",
        hint: "Minimum to start is just $250",
        options: [
          { label: "$250 – $500", icon: "🟢" },
          { label: "$500 – $1,000", icon: "🔵" },
          { label: "$1,000 – $5,000", icon: "🟡" },
          { label: "More than $5,000", icon: "💎" },
        ],
      },
      {
        field: "ai_interest",
        title: "How should AI help you?",
        hint: "AI tools analyze the market around the clock",
        options: [
          { label: "Smart signals & alerts", icon: "🔔" },
          { label: "Real-time market analysis", icon: "🤖" },
          { label: "Automated risk management", icon: "🛡️" },
          { label: "All of the above", icon: "✨" },
        ],
      },
    ] as Question[],
    done: "Completed",
    lastStep: "Final step",
    questionOf: (n: number, t: number) => `Question ${n} of ${t}`,
    thanks: (name: string) => `Thanks ${name}, we've got your request!`,
    willCall: "One of our advisors will call you on",
    willCallEnd: "to help you open your account and activate the AI tools.",
    nextSteps: ["Keep your phone nearby", "Have your national ID or Iqama ready", "Start with just a $250 deposit"],
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
    submit: "Get my plan & start with $250",
    encrypted: "Your data is encrypted",
    noShare: "We never share your data",
    back: "Back",
    failSave: "Couldn't send your request, please try again",
    failCheck: "Check your details and try again",
  },
} as const;

type FieldKey = "firstName" | "lastName" | "email" | "phone" | "consent";
type Errors = Partial<Record<FieldKey | "form", string>>;

export function LeadQuiz({ lang = "ar" }: { lang?: Lang }) {
  const t = COPY[lang];
  const QUESTIONS = t.questions;
  const rtl = lang === "ar";
  const Forward = rtl ? ArrowLeft : ArrowRight;
  const Back = rtl ? ArrowRight : ArrowLeft;
  const schema = makeContactSchema(lang);

  const submit = useServerFn(submitLead);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Record<QuizField, string>>>({});
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState<string>("+966");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const total = QUESTIONS.length + 1;
  const isForm = step === QUESTIONS.length;
  const progress = done ? 100 : Math.round((step / total) * 100);
  const q = QUESTIONS[step];

  const choose = (field: QuizField, value: string) => {
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
    setLoading(true);
    try {
      const res = await submit({
        data: { contact: { firstName, lastName, email, countryCode, phone, consent }, answers },
      });
      if (res.ok) setDone(true);
      else setErrors({ form: t.failSave });
    } catch {
      setErrors({ form: t.failCheck });
    } finally {
      setLoading(false);
    }
  };

  const nameField = (
    id: "firstName" | "lastName",
    value: string,
    setter: (v: string) => void,
    label: string,
    ph: string,
    auto: string,
  ) => (
    <Field id={id} label={label} icon={<User className="h-4 w-4" />} error={fieldError(id)} valid={touched[id] && !liveErrors[id]}>
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
          <span>{done ? t.done : isForm ? t.lastStep : t.questionOf(step + 1, QUESTIONS.length)}</span>
          <span className="font-bold text-primary">{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-gradient-primary transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

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
                <div key={s} className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3">
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
                {nameField("firstName", firstName, setFirstName, t.firstName, t.firstPh, "given-name")}
                {nameField("lastName", lastName, setLastName, t.lastName, t.lastPh, "family-name")}
              </div>

              <Field id="email" label={t.email} icon={<Mail className="h-4 w-4" />} error={fieldError("email")} valid={touched.email && !liveErrors.email}>
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
                  className={cn("h-full w-full bg-transparent outline-none placeholder:text-muted-foreground/60", rtl && "text-right")}
                />
              </Field>
              {emailFix && (
                <button type="button" onClick={() => setEmail(emailFix)} className="-mt-2 text-xs text-gold underline underline-offset-4">
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
                      touched.phone && liveErrors.phone ? "border-destructive" : phoneOk ? "border-primary/60" : "border-input",
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
                      onChange={(e) => setPhone(e.target.value.replace(/[^\d\u0660-\u0669\s+\-]/g, ""))}
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

              {errors.form && (
                <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">{errors.form}</div>
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

            <button type="button" onClick={() => setStep((s) => s - 1)} className="mt-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <Back className="h-4 w-4" /> {t.back}
            </button>
          </form>
        ) : q ? (
          <div key={step} className="animate-in fade-in duration-300">
            <h3 className="text-center text-2xl font-bold sm:text-3xl">{q.title}</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">{q.hint}</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {q.options.map((o) => {
                const selected = answers[q.field] === o.label;
                return (
                  <button
                    key={o.label}
                    type="button"
                    onClick={() => choose(q.field, o.label)}
                    className={cn(
                      "group flex items-center gap-4 rounded-2xl border p-4 text-start transition-all hover:-translate-y-0.5 hover:border-primary/70 hover:bg-primary/5",
                      selected ? "border-primary bg-primary/10 shadow-glow" : "border-border bg-muted/30",
                    )}
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-background/60 text-2xl">{o.icon}</span>
                    <span className="flex-1 font-semibold">{o.label}</span>
                    <span
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full border transition-colors",
                        selected ? "border-primary bg-primary text-primary-foreground" : "border-border",
                      )}
                    >
                      {selected && <Check className="h-3.5 w-3.5" />}
                    </span>
                  </button>
                );
              })}
            </div>
            {step > 0 && (
              <button type="button" onClick={() => setStep((s) => s - 1)} className="mt-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <Back className="h-4 w-4" /> {t.back}
              </button>
            )}
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

function ErrorText({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive" role="alert">
      <AlertCircle className="h-3.5 w-3.5" /> {children}
    </p>
  );
}
