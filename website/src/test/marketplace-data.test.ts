import { describe, it, expect } from "vitest";
import {
  avgRating,
  isTopHustler,
  buildWhatsAppUrl,
  type MarketplaceReview,
} from "@/lib/marketplace-data";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeReview(rating: number, id = Math.random().toString()): MarketplaceReview {
  return { id, reviewerId: "reviewer-1", reviewerName: "Test", rating, title: "", body: "", date: "2026-01-01" };
}

function makeReviews(ratings: number[]): MarketplaceReview[] {
  return ratings.map((r) => makeReview(r));
}

// ── avgRating ─────────────────────────────────────────────────────────────────

describe("avgRating", () => {
  it("returns null for an empty array", () => {
    expect(avgRating([])).toBeNull();
  });

  it("returns the single rating for a one-review array", () => {
    expect(avgRating([makeReview(4)])).toBe(4);
  });

  it("calculates the mean correctly", () => {
    expect(avgRating(makeReviews([3, 5]))).toBe(4);
    expect(avgRating(makeReviews([1, 2, 3, 4, 5]))).toBe(3);
  });

  it("handles all same ratings", () => {
    expect(avgRating(makeReviews([5, 5, 5]))).toBe(5);
  });
});

// ── isTopHustler ──────────────────────────────────────────────────────────────

describe("isTopHustler", () => {
  it("returns false with fewer than 20 reviews", () => {
    expect(isTopHustler(makeReviews(Array(19).fill(5)))).toBe(false);
  });

  it("returns false with 20 reviews but avg below 4.25", () => {
    // avg = 4.0
    const reviews = makeReviews([...Array(10).fill(5), ...Array(10).fill(3)]);
    expect(isTopHustler(reviews)).toBe(false);
  });

  it("returns true with 20+ reviews and avg >= 4.25", () => {
    // avg = 4.5
    const reviews = makeReviews([...Array(10).fill(5), ...Array(10).fill(4)]);
    expect(isTopHustler(reviews)).toBe(true);
  });

  it("returns true at exactly 20 reviews and avg exactly 4.25", () => {
    // avg = 4.25 — 5 fives + 15 fours = (25+60)/20 = 85/20 = 4.25
    const reviews = makeReviews([...Array(5).fill(5), ...Array(15).fill(4)]);
    expect(isTopHustler(reviews)).toBe(true);
  });

  it("returns false for an empty array", () => {
    expect(isTopHustler([])).toBe(false);
  });
});

// ── buildWhatsAppUrl ──────────────────────────────────────────────────────────

describe("buildWhatsAppUrl", () => {
  it("converts a local 0xx number to 27xx", () => {
    const url = buildWhatsAppUrl("0721234567", "Test Biz");
    expect(url).toMatch(/^https:\/\/wa\.me\/27721234567/);
  });

  it("strips non-digit characters before converting", () => {
    const url = buildWhatsAppUrl("072 123 4567", "Test Biz");
    expect(url).toMatch(/^https:\/\/wa\.me\/27721234567/);
  });

  it("leaves an already-international number unchanged", () => {
    const url = buildWhatsAppUrl("27821234567", "Test Biz");
    expect(url).toMatch(/^https:\/\/wa\.me\/27821234567/);
  });

  it("includes the business name in the pre-filled message", () => {
    const url = buildWhatsAppUrl("0721234567", "Acme Design");
    expect(decodeURIComponent(url)).toContain("Acme Design");
  });

  it("includes the Superpower Hub mention in the message", () => {
    const url = buildWhatsAppUrl("0721234567", "Acme");
    expect(decodeURIComponent(url)).toContain("Superpower Hub");
  });
});
