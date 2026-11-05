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
