import { describe, it, expect } from "vitest";
import { contactSchema, isValidPhone, toE164, suggestEmailFix } from "@/lib/lead-schema";

const valid = {
  firstName: "محمد",
  lastName: "العتيبي",
  email: "mohammed@gmail.com",
  countryCode: "+966",
  phone: "0501234567",
  consent: true,
};

describe("lead form validation", () => {
  it("accepts a correct Saudi lead", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it("requires both first and last name", () => {
    expect(contactSchema.safeParse({ ...valid, lastName: "" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...valid, firstName: "" }).success).toBe(false);
  });

  it("rejects names with digits", () => {
    expect(contactSchema.safeParse({ ...valid, firstName: "Ali1" }).success).toBe(false);
  });

  it("rejects malformed emails and common typos", () => {
    expect(contactSchema.safeParse({ ...valid, email: "mohammed@gmail" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...valid, email: "mohammed@gmial.com" }).success).toBe(false);
    expect(suggestEmailFix("a@gmial.com")).toBe("a@gmail.com");
  });

  it("accepts Saudi mobiles typed in any common format", () => {
    expect(isValidPhone("0501234567", "+966")).toBe(true);
    expect(isValidPhone("501234567", "+966")).toBe(true);
    expect(isValidPhone("+966 50 123 4567", "+966")).toBe(true);
    expect(isValidPhone("٠٥٠١٢٣٤٥٦٧", "+966")).toBe(true);
    expect(toE164("0501234567", "+966")).toBe("+966501234567");
  });

  it("rejects Saudi numbers that are not mobiles or wrong length", () => {
    expect(isValidPhone("0112345678", "+966")).toBe(false);
    expect(isValidPhone("05012345", "+966")).toBe(false);
  });

  it("requires consent", () => {
    expect(contactSchema.safeParse({ ...valid, consent: false }).success).toBe(false);
  });
});

describe("English form validation", () => {
  it("shows English messages and the same rules", async () => {
    const { makeContactSchema } = await import("@/lib/lead-schema");
    const en = makeContactSchema("en");
    const res = en.safeParse({ ...valid, firstName: "", phone: "0112345678" });
    expect(res.success).toBe(false);
    const msgs = res.success ? [] : res.error.issues.map((i) => i.message);
    expect(msgs).toContain("Please enter your first name");
    expect(en.safeParse({ ...valid, firstName: "John", lastName: "Smith" }).success).toBe(true);
  });
});

describe("CRM payload", () => {
  it("matches the submit-leads JSON structure", async () => {
    const { leadSubmissionSchema, toCrmPayload } = await import("@/lib/lead-schema");
    const data = leadSubmissionSchema.parse({
      contact: {
        ...valid,
        firstName: "Mohammed",
        lastName: "Alharbi",
        email: "mohammed@example.com",
        phone: "0512345678",
      },
      answers: {
        is_saudi_citizen: "No",
        investment_amount: "SAR 5,000–9,999",
        investment_start_time: "Within the next 7 days",
        experience_level: "Beginner — I am ready to learn",
        wants_contact: "Yes, but I need more information first.",
      },
    });
    expect(toCrmPayload(data, "203.0.113.7")).toEqual({
      firstname: "Mohammed",
      lastname: "Alharbi",
      email: "mohammed@example.com",
      mobile: "+966512345678",
      country_code: "SA",
      ip_address: "203.0.113.7",
      website: "",
      questions: [
        { key: "is_saudi_citizen", value: "No" },
        { key: "investment_amount", value: "SAR 5,000–9,999" },
        { key: "investment_start_time", value: "Within the next 7 days" },
        { key: "experience_level", value: "Beginner — I am ready to learn" },
        { key: "wants_contact", value: "Yes, but I need more information first." },
      ],
    });
  });

  it("rejects answers that are not one of the canonical options", async () => {
    const { answerSchema } = await import("@/lib/lead-schema");
    expect(answerSchema.safeParse({ is_saudi_citizen: "maybe" }).success).toBe(false);
  });
});

describe("optional questions", () => {
  it("accepts a lead with no answers and sends an empty questions list", async () => {
    const { leadSubmissionSchema, toCrmPayload } = await import("@/lib/lead-schema");
    const data = leadSubmissionSchema.parse({ contact: valid, answers: {} });
    expect(toCrmPayload(data, "84.235.64.1").questions).toEqual([]);
  });

  it("sends only the answered questions, in quiz order", async () => {
    const { leadSubmissionSchema, toCrmPayload } = await import("@/lib/lead-schema");
    const data = leadSubmissionSchema.parse({
      contact: valid,
      answers: { wants_contact: "Yes, but I need more information first.", is_saudi_citizen: "No" },
    });
    expect(toCrmPayload(data, "84.235.64.1").questions).toEqual([
      { key: "is_saudi_citizen", value: "No" },
      { key: "wants_contact", value: "Yes, but I need more information first." },
    ]);
  });

  it("still rejects unknown questions and invalid values", async () => {
    const { answerSchema } = await import("@/lib/lead-schema");
    expect(answerSchema.safeParse({ favourite_colour: "blue" }).success).toBe(false);
    expect(answerSchema.safeParse({ investment_amount: "a lot" }).success).toBe(false);
  });
});

describe("euro markets", () => {
  it("accepts mobiles and rejects landlines for IT, DE, PT, ES", () => {
    expect(isValidPhone("347 812 9054", "+39")).toBe(true);
    expect(isValidPhone("+39 347 812 9054", "+39")).toBe(true);
    expect(isValidPhone("06 1234 5678", "+39")).toBe(false); // Rome landline
    expect(isValidPhone("0151 23456789", "+49")).toBe(true);
    expect(isValidPhone("+49 171 2345678", "+49")).toBe(true);
    expect(isValidPhone("030 1234567", "+49")).toBe(false); // Berlin landline
    expect(isValidPhone("912 345 678", "+351")).toBe(true);
    expect(isValidPhone("212 345 678", "+351")).toBe(false); // Lisbon landline
    expect(isValidPhone("612 345 678", "+34")).toBe(true);
    expect(isValidPhone("712 345 678", "+34")).toBe(true);
    expect(isValidPhone("912 345 678", "+34")).toBe(false); // Madrid landline
  });

  it("keeps Italian mobiles that start with 39 typed without +", () => {
    expect(isValidPhone("3931234567", "+39")).toBe(true);
    expect(toE164("3931234567", "+39")).toBe("+393931234567");
    expect(toE164("393931234567", "+39")).toBe("+393931234567");
  });

  it("validates in the page language and sends the euro quiz", async () => {
    const { makeContactSchema, leadSubmissionSchema, toCrmPayload } =
      await import("@/lib/lead-schema");
    const contact = {
      firstName: "Giulia",
      lastName: "D'Angelo",
      email: "giulia@example.it",
      countryCode: "+39",
      phone: "347 812 9054",
      consent: true,
    };
    const res = makeContactSchema("it", "it").safeParse({ ...contact, firstName: "" });
    expect(res.success ? [] : res.error.issues.map((i) => i.message)).toContain(
      "Inserisci il tuo nome",
    );

    const data = leadSubmissionSchema.parse({
      market: "it",
      contact,
      answers: {
        investment_amount: "€2,000–9,999",
        investment_start_time: "Within the next 7 days",
        experience_level: "Beginner — I am ready to learn",
        wants_contact: "Yes, but I need more information first.",
      },
    });
    const payload = toCrmPayload(data, "79.0.0.1");
    expect(payload.mobile).toBe("+393478129054");
    expect(payload.country_code).toBe("IT");
    expect(payload.questions[0]).toEqual({ key: "investment_amount", value: "€2,000–9,999" });
  });
});

describe("UK market", () => {
  const ukContact = {
    firstName: "James",
    lastName: "Smith",
    email: "james@example.com",
    countryCode: "+44",
    phone: "07400 123456",
    consent: true,
  };
  const ukAnswers = {
    investment_amount: "£1,000–1,999",
    investment_start_time: "Within the next 30 days",
    experience_level: "I have some experience",
    wants_contact: "Yes, I am ready to discuss the next steps.",
  };

  it("accepts UK mobiles and rejects landlines and pagers", () => {
    expect(isValidPhone("07400 123456", "+44")).toBe(true);
    expect(isValidPhone("+44 7400 123456", "+44")).toBe(true);
    expect(isValidPhone("02071234567", "+44")).toBe(false);
    expect(isValidPhone("07612345678", "+44")).toBe(false);
  });

  it("accepts accented Latin names", async () => {
    const { makeContactSchema } = await import("@/lib/lead-schema");
    expect(
      makeContactSchema("en", "gb").safeParse({
        ...ukContact,
        firstName: "José",
        lastName: "Müller",
      }).success,
    ).toBe(true);
  });

  it("only offers the market's own dial codes", async () => {
    const { makeContactSchema } = await import("@/lib/lead-schema");
    expect(makeContactSchema("en", "gb").safeParse(valid).success).toBe(false);
    expect(makeContactSchema("en", "sa").safeParse(ukContact).success).toBe(false);
  });

  it("sends the UK quiz without the Saudi citizen question", async () => {
    const { leadSubmissionSchema, toCrmPayload } = await import("@/lib/lead-schema");
    const data = leadSubmissionSchema.parse({
      market: "gb",
      contact: ukContact,
      answers: ukAnswers,
    });
    const payload = toCrmPayload(data, "203.0.113.7");
    expect(payload.mobile).toBe("+447400123456");
    expect(payload.country_code).toBe("GB");
    expect(payload.questions.map((q) => q.key)).toEqual([
      "investment_amount",
      "investment_start_time",
      "experience_level",
      "wants_contact",
    ]);
  });

  it("rejects Saudi answers on the UK market", async () => {
    const { leadSubmissionSchema } = await import("@/lib/lead-schema");
    const res = leadSubmissionSchema.safeParse({
      market: "gb",
      contact: ukContact,
      answers: { ...ukAnswers, is_saudi_citizen: "No" },
    });
    expect(res.success).toBe(false);
  });
});
