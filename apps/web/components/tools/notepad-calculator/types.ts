export type { NotepadCalculatorOutput as NotepadResult, NotepadLineResult } from "@tooloralabs/tools";

export const SNIPPET_KEYS = ["trip", "loan", "tip", "splitBill"] as const;
export type SnippetKey = (typeof SNIPPET_KEYS)[number];

/**
 * Sample notes. Prose lines come from the locale (they end in ":" so they never parse as math);
 * the calculation lines stay in ASCII because variable names must be identifiers.
 */
export function buildSnippet(key: SnippetKey, p: (k: string) => string): string {
  switch (key) {
    case "trip":
      return [p("trip.title"), "flights = 2 * 340", "hotel = 4 * 125", "food = 4 * 60", "taxi = 2 * 45", "tickets = 2 * 35", "total = flights + hotel + food + taxi + tickets", p("trip.split"), "share = total / 2", p("trip.save"), "months = 5", "monthly = share / months"].join("\n");
    case "loan":
      return [p("loan.title"), "principal = 15000", "rate = 0.06 / 12", "n = 36", "payment = principal * rate / (1 - (1 + rate) ^ (-n))", p("loan.cost"), "paid = payment * n", "interest = paid - principal"].join("\n");
    case "tip":
      return [p("tip.title"), "bill = 64.50", "tip = bill * 0.18", "total = bill + tip", p("tip.split"), "total / 4"].join("\n");
    case "splitBill":
      return [p("splitBill.title"), "rent = 1200", "utilities = 85", "total = rent + utilities", p("splitBill.split"), "total / 3"].join("\n");
  }
}
