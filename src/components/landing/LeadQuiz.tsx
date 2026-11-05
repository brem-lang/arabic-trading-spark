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
  COUNTRIES,
  makeContactSchema,
  phoneErrorMessage,
  suggestEmailFix,
  isValidPhone,
  QUIZ_OPTIONS,
  type Answers,
  type Lang,
  type QuizField,
  type QuizValue,
} from "@/lib/lead-schema";
import { submitLead } from "@/lib/submit-lead";

type Question = { field: QuizField; title: string; hint: string; options: { value: QuizValue; label: string; icon: string }[] };

/** One [label, icon] pair per canonical option, so a missing translation is a type error. */
type LabelsFor<T extends readonly string[]> = { readonly [I in keyof T]: readonly [label: string, icon: string] };

/** Builds a question whose options are the canonical CRM values from QUIZ_OPTIONS, in order. */
function question<K extends QuizField>(
  field: K,
  title: string,
  hint: string,
  labels: LabelsFor<(typeof QUIZ_OPTIONS)[K]>,
): Question {
  const options = QUIZ_OPTIONS[field].map((value, i) => {
    const [label, icon] = (labels as readonly (readonly [string, string])[])[i]!;
    return { value, label, icon };
  });
  return { field, title, hint, options };
}

const COPY = {
  ar: {
    questions: [
      question("is_saudi_citizen", "هل أنت مواطن سعودي؟", "نخصص لك الخدمة حسب بلد إقامتك", [
        ["نعم، أنا مواطن سعودي", "🇸🇦"],
        ["لا", "🌍"],
      ]),
      question("investment_amount", "كم تخطط أن تستثمر؟", "اختر المبلغ الأقرب لك", [
        ["أقل من 5,000 ريال", "🟢"],
        ["5,000 – 9,999 ريال", "🔵"],
        ["10,000 – 49,999 ريال", "🟡"],
        ["50,000 ريال أو أكثر", "💎"],
      ]),
      question("investment_start_time", "متى تخطط أن تبدأ الاستثمار؟", "لا يوجد التزام — فقط لنعرف توقيتك", [
        ["خلال الأيام السبعة القادمة", "⚡"],
        ["خلال الـ 30 يوماً القادمة", "📅"],
        ["خلال الأشهر الثلاثة القادمة", "🗓️"],
        ["أستكشف الخيارات فقط حالياً", "🧭"],
      ]),
      question("experience_level", "ما مستوى خبرتك في التداول؟", "لا توجد إجابة خاطئة — نخصص لك الأدوات حسب مستواك", [
        ["مبتدئ — مستعد للتعلّم", "🌱"],
        ["لدي بعض الخبرة", "📈"],
        ["متداول ذو خبرة", "⚡"],
        ["متداول محترف", "🏆"],
      ]),
      question("wants_contact", "هل تريد أن يتواصل معك مستشار؟", "مستشارونا يساعدونك في الخطوات التالية", [
        ["نعم، أنا مستعد لمناقشة الخطوات التالية", "✅"],
        ["نعم، لكنني أحتاج معلومات أكثر أولاً", "💬"],
      ]),
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
    failSave: "تعذّر إرسال طلبك، حاول مرة أخرى",
    failCheck: "تحقق من بياناتك وحاول مرة أخرى",
  },
  en: {
    questions: [
      question("is_saudi_citizen", "Are you a Saudi citizen?", "We tailor our service to where you live", [
        ["Yes, I am a Saudi citizen.", "🇸🇦"],
        ["No", "🌍"],
      ]),
      question("investment_amount", "How much do you plan to invest?", "Pick the closest amount", [
        ["Less than SAR 5,000", "🟢"],
        ["SAR 5,000–9,999", "🔵"],
        ["SAR 10,000–49,999", "🟡"],
        ["SAR 50,000 or more", "💎"],
      ]),
      question("investment_start_time", "When do you plan to start investing?", "No commitment — just so we know your timing", [
        ["Within the next 7 days", "⚡"],
        ["Within the next 30 days", "📅"],
        ["Within the next 3 months", "🗓️"],
        ["I am just exploring for now", "🧭"],
      ]),
      question("experience_level", "What's your trading experience?", "No wrong answers — we tailor the tools to your level", [
        ["Beginner — I am ready to learn", "🌱"],
        ["I have some experience", "📈"],
        ["I am an experienced trader", "⚡"],
        ["I am a professional trader", "🏆"],
      ]),
      question("wants_contact", "Would you like an advisor to contact you?", "Our advisors help you with the next steps", [
        ["Yes, I am ready to discuss the next steps.", "✅"],
        ["Yes, but I need more information first.", "💬"],
      ]),
    ],
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
    loadingSteps: ["Verifying your details...", "Creating your account...", "Preparing your personal plan..."],
    redirecting: "Done! Taking you to your account...",
    pleaseWait: "Please don't close this page",
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

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Answers>>({});
  const [website, setWebsite] = useState(""); // honeypot
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState<string>("+966");
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

  const choose = (field: QuizField, value: QuizValue) => {
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
    // Every question must be answered; jump back to the first unanswered one.
    const missing = QUESTIONS.findIndex((qq) => !answers[qq.field]);
    if (missing !== -1) {
      setStep(missing);
      return;
    }
    setLoading(true);
    try {
      const res = await submitLead({
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

              {/* Honeypot: invisible to people, bots tend to fill it. */}
              <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <label htmlFor="website">Website</label>
                <input id="website" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
              </div>

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
                const selected = answers[q.field] === o.value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => choose(q.field, o.value)}
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

function SubmitOverlay({ progress, message, hint }: { progress: number; message: string; hint: string }) {
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
        <div className="h-full rounded-full bg-gradient-primary transition-all duration-300 ease-out" style={{ width: `${pct}%` }} />
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
