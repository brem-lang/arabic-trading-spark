import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LeadQuiz } from "@/components/landing/LeadQuiz";
import { dialCodeFor, leadSubmissionSchema, toCrmPayload } from "@/lib/lead-schema";
import { readVisitorCountry, visitorCountryCookie } from "@/lib/visitor-country";

describe("visitor country cookie", () => {
  it("is built from Cloudflare's country code", () => {
    expect(visitorCountryCookie("JO", true)).toBe(
      "visitor_country=JO; Path=/; Max-Age=86400; SameSite=Lax; Secure",
    );
    expect(visitorCountryCookie("lb", false)).toBe(
      "visitor_country=LB; Path=/; Max-Age=86400; SameSite=Lax",
    );
  });

  it("is skipped when the country is missing or unknown", () => {
    expect(visitorCountryCookie(null, true)).toBeNull();
    expect(visitorCountryCookie("", true)).toBeNull();
    expect(visitorCountryCookie("XX", true)).toBeNull();
    expect(visitorCountryCookie("J0;x=1", true)).toBeNull();
  });

  it("is read back from document.cookie", () => {
    expect(readVisitorCountry("a=1; visitor_country=JO; b=2")).toBe("JO");
    expect(readVisitorCountry("visitor_country=ae")).toBe("AE");
    expect(readVisitorCountry("other=1")).toBeNull();
    expect(readVisitorCountry("visitor_country=<script>")).toBeNull();
  });
});

describe("dial code pre-selection", () => {
  it("picks the visitor's own code when the market offers it", () => {
    expect(dialCodeFor("sa", "JO")).toBe("+962");
    expect(dialCodeFor("sa", "LB")).toBe("+961");
    expect(dialCodeFor("sa", "AE")).toBe("+971");
    expect(dialCodeFor("sa", "KW")).toBe("+965");
    expect(dialCodeFor("sa", "SA")).toBe("+966");
  });

  it("falls back to the market default", () => {
    expect(dialCodeFor("sa", null)).toBe("+966");
    expect(dialCodeFor("sa", "EG")).toBe("+966");
    expect(dialCodeFor("gb", "JO")).toBe("+44"); // the UK page only offers +44
    expect(dialCodeFor("it", "IT")).toBe("+39");
  });

  it("sends a Jordanian lead to the CRM as JO", () => {
    const lead = leadSubmissionSchema.parse({
      market: "sa",
      contact: {
        firstName: "Omar",
        lastName: "Haddad",
        email: "omar@example.com",
        countryCode: "+962",
        phone: "0791234567",
        consent: true,
      },
      answers: {},
    });
    const payload = toCrmPayload(lead, "203.0.113.7");
    expect(payload.country_code).toBe("JO");
    expect(payload.mobile).toBe("+962791234567");
  });
});

describe("LeadQuiz phone field", () => {
  afterEach(() => {
    document.cookie = "visitor_country=; Max-Age=0; Path=/";
    vi.restoreAllMocks();
  });

  const openContactForm = (page: "sa-ar" | "sa-en") => {
    render(<LeadQuiz page={page} />);
    const skipAll = page === "sa-ar" ? "تخطي كل الأسئلة" : "Skip all questions";
    fireEvent.click(screen.getByRole("button", { name: skipAll }));
    return screen.getByRole("combobox") as HTMLSelectElement;
  };

  it("pre-selects +962 for a visitor from Jordan", () => {
    document.cookie = "visitor_country=JO; Path=/";
    expect(openContactForm("sa-ar").value).toBe("+962");
  });

  it("pre-selects +961 for a visitor from Lebanon on the English page", () => {
    document.cookie = "visitor_country=LB; Path=/";
    expect(openContactForm("sa-en").value).toBe("+961");
  });

  it("keeps +966 without a cookie", () => {
    expect(openContactForm("sa-ar").value).toBe("+966");
  });
});
