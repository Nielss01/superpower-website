import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("next/headers", () => ({ cookies: vi.fn() }));
vi.mock("@/lib/crm-auth", () => ({ checkCrmAuth: vi.fn() }));
vi.mock("@supabase/supabase-js", () => ({ createClient: vi.fn() }));

import { createClient } from "@supabase/supabase-js";
import { checkCrmAuth } from "@/lib/crm-auth";
import { GET, PATCH, DELETE } from "@/app/api/crm/reviews/route";

const mockCheckCrmAuth = vi.mocked(checkCrmAuth);
const mockCreateClient = vi.mocked(createClient);

// ── Fluent query chain mock ───────────────────────────────────────────────────
// Builds a chainable object where every method returns itself.
// range() and eq() resolve to the provided result when awaited.

function makeChain(result: unknown) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chain: Record<string, any> = {};
  for (const m of ["select", "order", "or", "update", "delete"]) {
    chain[m] = vi.fn().mockReturnValue(chain);
  }
  chain.range = vi.fn().mockResolvedValue(result);
  chain.eq    = vi.fn().mockResolvedValue(result);
  return chain;
}

function makeSupabase(getResult: unknown, mutateResult = { error: null }) {
  const getChain    = makeChain(getResult);
  const mutateChain = makeChain(mutateResult);
  return {
    from: vi.fn().mockImplementation((_table: string) => ({
      ...getChain,
      update: vi.fn().mockReturnValue(mutateChain),
      delete: vi.fn().mockReturnValue(mutateChain),
    })),
  };
}

function makeReviewRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "review-1",
    reviewer_id: "user-1",
    reviewer_name: "Alice",
    rating: 4,
    title: "Great",
    body: "Really good",
    created_at: "2026-01-15T10:00:00Z",
    is_hidden: false,
    marketplace_profiles: { id: "profile-1", business_name: "Test Biz", category: "Tech" },
    ...overrides,
  };
}

function patch(body: unknown) {
  return PATCH(new NextRequest("http://localhost/api/crm/reviews", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }));
}

function del(body: unknown) {
  return DELETE(new NextRequest("http://localhost/api/crm/reviews", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }));
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.resetAllMocks();
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
  process.env.SUPABASE_SECRET_KEY = "test-key";
  mockCheckCrmAuth.mockResolvedValue(true);
});

// ── Auth gates ────────────────────────────────────────────────────────────────

describe("CRM reviews routes — auth", () => {
  beforeEach(() => mockCheckCrmAuth.mockResolvedValue(false));

  it("GET returns 401 when not authenticated", async () => {
    const res = await GET(new NextRequest("http://localhost/api/crm/reviews"));
    expect(res.status).toBe(401);
  });

  it("PATCH returns 401 when not authenticated", async () => {
    const res = await patch({ id: "r1", is_hidden: true });
    expect(res.status).toBe(401);
  });

  it("DELETE returns 401 when not authenticated", async () => {
    const res = await del({ id: "r1" });
    expect(res.status).toBe(401);
  });
});

// ── GET ───────────────────────────────────────────────────────────────────────

describe("GET /api/crm/reviews", () => {
  it("maps review rows to camelCase response shape", async () => {
    const row = makeReviewRow();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockReturnValue(makeSupabase({ data: [row], count: 1, error: null }) as any);

    const res = await GET(new NextRequest("http://localhost/api/crm/reviews"));
    const json = await res.json();

    expect(json.reviews).toHaveLength(1);
    const r = json.reviews[0];
    expect(r.reviewerId).toBe("user-1");
    expect(r.reviewerName).toBe("Alice");
    expect(r.isHidden).toBe(false);
    expect(r.profile.businessName).toBe("Test Biz");
  });

  it("sets profile to null when no linked profile", async () => {
    const row = makeReviewRow({ marketplace_profiles: null });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockReturnValue(makeSupabase({ data: [row], count: 1, error: null }) as any);

    const res = await GET(new NextRequest("http://localhost/api/crm/reviews"));
    const json = await res.json();
    expect(json.reviews[0].profile).toBeNull();
  });

  it("returns correct pagination metadata", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockReturnValue(makeSupabase({ data: [], count: 60, error: null }) as any);

    const res = await GET(new NextRequest("http://localhost/api/crm/reviews?page=2"));
    const json = await res.json();
    expect(json.total).toBe(60);
    expect(json.pages).toBe(3); // Math.ceil(60/25)
    expect(json.page).toBe(2);
  });

  it("clamps page to last page when it exceeds total pages", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockReturnValue(makeSupabase({ data: [], count: 10, error: null }) as any);

    const res = await GET(new NextRequest("http://localhost/api/crm/reviews?page=99"));
    const json = await res.json();
    expect(json.page).toBe(1);
  });
});

// ── PATCH ─────────────────────────────────────────────────────────────────────

describe("PATCH /api/crm/reviews", () => {
  it("accepts a valid hide request and returns ok", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockReturnValue(makeSupabase(null, { error: null }) as any);

    const res = await patch({ id: "review-1", is_hidden: true });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("returns 400 when is_hidden is a string instead of boolean", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockReturnValue(makeSupabase(null, { error: null }) as any);

    const res = await patch({ id: "review-1", is_hidden: "true" }); // string, not boolean
    expect(res.status).toBe(400);
  });

  it("returns 400 when id is missing", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockReturnValue(makeSupabase(null, { error: null }) as any);

    const res = await patch({ is_hidden: true }); // no id
    expect(res.status).toBe(400);
  });

  it("returns 400 when is_hidden is missing", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockReturnValue(makeSupabase(null, { error: null }) as any);

    const res = await patch({ id: "review-1" }); // no is_hidden
    expect(res.status).toBe(400);
  });
});

// ── DELETE ────────────────────────────────────────────────────────────────────

describe("DELETE /api/crm/reviews", () => {
  it("accepts a valid delete request and returns ok", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockReturnValue(makeSupabase(null, { error: null }) as any);

    const res = await del({ id: "review-1" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("returns 400 when id is missing", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockReturnValue(makeSupabase(null, { error: null }) as any);

    const res = await del({});
    expect(res.status).toBe(400);
  });
});
