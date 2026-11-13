import { afterEach, describe, expect, it, vi } from "vitest";
import { QUIZ_TIMED_FIELDS, createFormTimer, timingSchema } from "@/lib/form-timing";
import { timingReport } from "@/lib/form-timing-report";
import { QUIZ } from "@/lib/lead-schema";

afterEach(() => vi.restoreAllMocks());

function sampleTiming() {
  let t = 0;
  vi.spyOn(performance, "now").mockImplementation(() => t);
  const timer = createFormTimer();
  t = 1_000;
  timer.formLoaded();
  t = 3_000;
  timer.input("is_saudi_citizen");
  t = 5_000;
  timer.skip("investment_amount");
  t = 6_000;
  timer.contactFormShown();
  t = 7_000;
  timer.focus("email");
  t = 7_500;
  timer.input("email");
  t = 8_000;
  timer.input("email");
  t = 9_000;
  timer.blur("email");
  t = 11_000;
  timer.focus("email");
  t = 12_000;
  timer.blur("email");
  t = 13_000;
  timer.input("consent");
  t = 14_000;
  timer.submitClick();
  t = 16_000;
  return timer.submitClick();
}

describe("createFormTimer", () => {
  it("records per-field focus, input, skip and click times", () => {
    const timing = sampleTiming();
    expect(timingSchema.safeParse(timing).success).toBe(true);
    expect(timing).toMatchObject({
      form_loaded_ms: 1_000,
      contact_form_shown_ms: 6_000,
      first_submit_click_ms: 14_000,
      submit_click_ms: 16_000,
      submit_clicks: 2,
      form_fill_ms: 15_000,
    });
    expect(timing.fields.email).toEqual({
      first_focus_ms: 7_000,
      last_blur_ms: 12_000,
      focus_total_ms: 3_000,
      first_input_ms: 7_500,
      last_input_ms: 8_000,
      input_count: 2,
    });
    expect(timing.fields.investment_amount).toEqual({ skipped_ms: 5_000 });
  });

  it("covers every quiz question of every market", () => {
    const keys = new Set(Object.values(QUIZ).flatMap((q) => Object.keys(q)));
    expect([...keys].sort()).toEqual([...QUIZ_TIMED_FIELDS].sort());
  });
});

describe("timingReport", () => {
  it("turns raw timing into readable text", () => {
    const r = timingReport({
      ...sampleTiming(),
      landed_at: "2026-11-12T12:34:20.777Z",
      timezone: "Asia/Riyadh",
      utc_offset_min: 180,
    });
    expect(r.landed_at).toBe("2026-11-12 15:34:20 (Asia/Riyadh, UTC+03:00)");
    expect(r.time_before_submit).toBe("16.0s");
    expect(r.submit_clicks).toBe(2);
    expect(r.fields["Email"]).toBe("3.0s in the field, 2 changes, typed");
    expect(r.fields["Q Saudi citizen"]).toBe("answered at 3.0s");
    expect(r.fields["Q Investment amount"]).toBe("skipped at 5.0s");
    expect(r.fields["Phone"]).toBe("not touched");
    expect(r.fields["Q Start time"]).toBeUndefined();
    expect(r.steps[0]).toBe("0.0s - Opened the page");
    expect(r.steps).toContain("6.0s - Reached the contact form");
    expect(r.steps.at(-1)).toBe("16.0s - Clicked submit (try 2, sent)");
  });
});
