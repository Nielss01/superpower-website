import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("next/headers", () => ({ cookies: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));

import { createClient } from "@/lib/supabase/server";
import { GET } from "@/app/api/marketplace/listings/route";

const mockCreateClient = vi.mocked(createClient);

// ── Query chain mock ──────────────────────────────────────────────────────────
// Every chainable method returns the same object so filters can be applied in
// any order. range() is the terminal method and resolves to the provided result.

function makeChain(result: unknown) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chain: Record<string, any> = {};
  for (const m of ["select", "eq", "order", "overlaps", "or"]) {
    chain[m] = vi.fn().mockReturnValue(chain);
  }
  chain.range = vi.fn().mockResolvedValue(result);
  return chain;
}

function makeSupabase(result: unknown) {
  const chain = makeChain(result);
  return { from: vi.fn().mockReturnValue(chain), _chain: chain };
}

function makeRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "profile-1",
    user_id: "user-1",
    business_name: "Test Biz",
    tagline: "A tagline",
    description: "A description",
    locations: ["Khayelitsha"],
    category: "Tech",
    whatsapp_number: "0721234567",
    website: null,
    response_time: "Usually replies within 1 hour",
    profile_photo_url: null,
    service_photo_urls: [],
    is_verified: false,
    marketplace_services: [],
    reviews: [],
    ...overrides,
  };
}

function get(url: string) {
  return GET(new NextRequest(`http://localhost${url}`));
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.resetAllMocks();
});

// ── Misconfiguration ──────────────────────────────────────────────────────────

describe("GET /api/marketplace/listings — setup", () => {
  it("returns 500 when Supabase client cannot be created", async () => {
    mockCreateClient.mockResolvedValue(null as never);
    const res = await get("/api/marketplace/listings");
    expect(res.status).toBe(500);
  });
});

// ── Row mapping ───────────────────────────────────────────────────────────────

describe("GET /api/marketplace/listings — row mapping", () => {
  it("maps DB column names to camelCase response shape", async () => {
    const { _chain, ...sb } = makeSupabase({ data: [makeRow()], count: 1, error: null });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockResolvedValue(sb as any);

    const json = await (await get("/api/marketplace/listings")).json();
    const listing = json.listings[0];

    expect(listing.businessName).toBe("Test Biz");
    expect(listing.userId).toBe("user-1");
    expect(listing.whatsappNumber).toBe("0721234567");
    expect(listing.profilePhotoUrl).toBe("");
    expect(listing.servicePhotoUrls).toEqual([]);
    expect(listing.location).toEqual(["Khayelitsha"]);
  });

  it("defaults null optional fields to empty string", async () => {
    const row = makeRow({ tagline: null, description: null, whatsapp_number: null });
    const { _chain, ...sb } = makeSupabase({ data: [row], count: 1, error: null });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockResolvedValue(sb as any);

    const json = await (await get("/api/marketplace/listings")).json();
    const l = json.listings[0];
    expect(l.tagline).toBe("");
    expect(l.description).toBe("");
    expect(l.whatsappNumber).toBe("");
  });

  it("sorts services by sort_order ascending", async () => {
    const services = [
      { name: "C", price: null, description: null, sort_order: 2 },
      { name: "A", price: null, description: null, sort_order: 0 },
      { name: "B", price: null, description: null, sort_order: 1 },
    ];
    const row = makeRow({ marketplace_services: services });
    const { _chain, ...sb } = makeSupabase({ data: [row], count: 1, error: null });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockResolvedValue(sb as any);

    const json = await (await get("/api/marketplace/listings")).json();
    const names = json.listings[0].services.map((s: { name: string }) => s.name);
    expect(names).toEqual(["A", "B", "C"]);
  });

  it("maps review rows to camelCase and slices date to YYYY-MM-DD", async () => {
    const reviews = [{
      id: "rev-1",
      reviewer_id: "user-2",
      reviewer_name: "Alice",
      rating: 5,
      title: "Great",
      body: "Really good",
      created_at: "2026-02-14T10:30:00Z",
    }];
    const row = makeRow({ reviews });
    const { _chain, ...sb } = makeSupabase({ data: [row], count: 1, error: null });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockResolvedValue(sb as any);

    const json = await (await get("/api/marketplace/listings")).json();
    const review = json.listings[0].reviews[0];
    expect(review.reviewerId).toBe("user-2");
    expect(review.reviewerName).toBe("Alice");
    expect(review.rating).toBe(5);
    expect(review.date).toBe("2026-02-14");
  });

  it("defaults null review title and body to empty string", async () => {
    const reviews = [{
      id: "rev-1", reviewer_id: "u1", reviewer_name: "Bob",
      rating: 3, title: null, body: null, created_at: "2026-01-01T00:00:00Z",
    }];
    const { _chain, ...sb } = makeSupabase({ data: [makeRow({ reviews })], count: 1, error: null });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockResolvedValue(sb as any);

    const json = await (await get("/api/marketplace/listings")).json();
    const review = json.listings[0].reviews[0];
    expect(review.title).toBe("");
    expect(review.body).toBe("");
  });
});

// ── Pagination ────────────────────────────────────────────────────────────────

describe("GET /api/marketplace/listings — pagination", () => {
  it("returns correct pagination metadata", async () => {
    const { _chain, ...sb } = makeSupabase({ data: [], count: 36, error: null });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockResolvedValue(sb as any);

    const json = await (await get("/api/marketplace/listings?page=2")).json();
    expect(json.total).toBe(36);
    expect(json.pages).toBe(3); // ceil(36/12)
    expect(json.page).toBe(2);
  });

  it("clamps page to last available page", async () => {
    const { _chain, ...sb } = makeSupabase({ data: [], count: 5, error: null });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockResolvedValue(sb as any);

    const json = await (await get("/api/marketplace/listings?page=99")).json();
    expect(json.page).toBe(1);
  });

  it("returns page 1 when page param is below 1", async () => {
    const { _chain, ...sb } = makeSupabase({ data: [], count: 0, error: null });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockResolvedValue(sb as any);

    const json = await (await get("/api/marketplace/listings?page=0")).json();
    expect(json.page).toBe(1);
  });

  it("returns at least 1 page even when total is 0", async () => {
    const { _chain, ...sb } = makeSupabase({ data: [], count: 0, error: null });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockResolvedValue(sb as any);

    const json = await (await get("/api/marketplace/listings")).json();
    expect(json.pages).toBe(1);
  });

  it("requests the correct range for page 2 (12 items per page)", async () => {
    const { _chain, ...sb } = makeSupabase({ data: [], count: 30, error: null });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockResolvedValue(sb as any);

    await get("/api/marketplace/listings?page=2");
    expect(_chain.range).toHaveBeenCalledWith(12, 23); // from=12, to=23
  });
});

// ── SQL wildcard escaping ─────────────────────────────────────────────────────

describe("GET /api/marketplace/listings — search escaping", () => {
  it("escapes % in the search query before passing to .or()", async () => {
    const { _chain, ...sb } = makeSupabase({ data: [], count: 0, error: null });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockResolvedValue(sb as any);

    // URL-encoded %25 decodes to %, which must be escaped to \%
    await get("/api/marketplace/listings?q=50%25off");
    const orArg: string = _chain.or.mock.calls[0][0];
    expect(orArg).toContain("50\\%off");
    expect(orArg).not.toMatch(/50%(?!\\)/); // no un-escaped %
  });

  it("escapes _ in the search query", async () => {
    const { _chain, ...sb } = makeSupabase({ data: [], count: 0, error: null });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockResolvedValue(sb as any);

    await get("/api/marketplace/listings?q=hair_salon");
    const orArg: string = _chain.or.mock.calls[0][0];
    expect(orArg).toContain("hair\\_salon");
  });

  it("does not call .or() when query is empty", async () => {
    const { _chain, ...sb } = makeSupabase({ data: [], count: 0, error: null });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockResolvedValue(sb as any);

    await get("/api/marketplace/listings");
    expect(_chain.or).not.toHaveBeenCalled();
  });

  it("does not call .or() when query is whitespace only", async () => {
    const { _chain, ...sb } = makeSupabase({ data: [], count: 0, error: null });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockResolvedValue(sb as any);

    await get("/api/marketplace/listings?q=   ");
    expect(_chain.or).not.toHaveBeenCalled();
  });
});

// ── Query filters ─────────────────────────────────────────────────────────────

describe("GET /api/marketplace/listings — filters", () => {
  it("does not call .eq(category) when category is 'all'", async () => {
    const { _chain, ...sb } = makeSupabase({ data: [], count: 0, error: null });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockResolvedValue(sb as any);

    await get("/api/marketplace/listings?category=all");
    const categoryEqCalls = (_chain.eq.mock.calls as [string, unknown][])
      .filter(([col]) => col === "category");
    expect(categoryEqCalls).toHaveLength(0);
  });

  it("calls .eq(category) when a specific category is given", async () => {
    const { _chain, ...sb } = makeSupabase({ data: [], count: 0, error: null });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockResolvedValue(sb as any);

    await get("/api/marketplace/listings?category=Tech");
    const categoryEqCalls = (_chain.eq.mock.calls as [string, unknown][])
      .filter(([col]) => col === "category");
    expect(categoryEqCalls).toHaveLength(1);
    expect(categoryEqCalls[0][1]).toBe("Tech");
  });

  it("calls .overlaps() when locations are provided", async () => {
    const { _chain, ...sb } = makeSupabase({ data: [], count: 0, error: null });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockResolvedValue(sb as any);

    await get("/api/marketplace/listings?locations=Khayelitsha,Mitchells+Plain");
    expect(_chain.overlaps).toHaveBeenCalledWith("locations", ["Khayelitsha", "Mitchells Plain"]);
  });

  it("does not call .overlaps() when locations param is empty", async () => {
    const { _chain, ...sb } = makeSupabase({ data: [], count: 0, error: null });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockResolvedValue(sb as any);

    await get("/api/marketplace/listings");
    expect(_chain.overlaps).not.toHaveBeenCalled();
  });
});
