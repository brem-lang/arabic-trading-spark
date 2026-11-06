import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LeadQuiz } from "@/components/landing/LeadQuiz";

describe("LeadQuiz optional questions", () => {
  it("marks questions optional and skips one at a time", () => {
    render(<LeadQuiz page="gb-en" />);
    expect(screen.getByText("Question 1 of 4 · Optional")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^Skip$/ }));
    expect(screen.getByText("Question 2 of 4 · Optional")).toBeInTheDocument();
  });

  it("jumps straight to the contact form with Skip all", () => {
    render(<LeadQuiz page="it-it" />);
    fireEvent.click(screen.getByRole("button", { name: "Salta tutte le domande" }));
    expect(screen.getByText("Dove inviamo il tuo piano personale?")).toBeInTheDocument();
  });
});
