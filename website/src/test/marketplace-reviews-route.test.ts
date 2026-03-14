import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("next/headers", () => ({ cookies: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));

import { createClient } from "@/lib/supabase/server";
import { POST } from "@/app/api/marketplace/reviews/route";

const mockCreateClient = vi.mocked(createClient);

// ── Supabase mock helpers ─────────────────────────────────────────────────────

function makeUpsertChain(result: unknown) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chain: Record<string, any> = {};
  chain.upsert = vi.fn().mockReturnValue(chain);
  chain.select = vi.fn().mockReturnValue(chain);
  chain.single = vi.fn().mockResolvedValue(result);
  return chain;
}

function makeSupabase({
  user = makeUser(),
  upsertResult = { data: makeReviewRow(), error: null },
}: {
  user?: ReturnType<typeof makeUser> | null;
  upsertResult?: unknown;
} = {}) {
  const chain = makeUpsertChain(upsertResult);
  return {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user } }) },
    from: vi.fn().mockReturnValue(chain),
    _chain: chain,
  };
}

function makeUser(overrides: Partial<{
  id: string;
  email: string;
  user_metadata: Record<string, unknown>;
}> = {}) {
  return {
    id: "user-1",
    email: "alice.smith@example.com",
    user_metadata: { full_name: "Alice Smith" },
    ...overrides,
  };
}

function makeReviewRow() {
  return {
    id: "review-1",
    reviewer_id: "user-1",
    reviewer_name: "Alice",
    rating: 4,
    title: "Great",
    body: "Really good",
    created_at: "2026-03-14T10:00:00Z",
  };
}

function post(body: unknown) {
  return POST(new NextRequest("http://localhost/api/marketplace/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }));
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.resetAllMocks();
});

// ── Auth ──────────────────────────────────────────────────────────────────────

describe("POST /api/marketplace/reviews — auth", () => {
  it("returns 401 when user is not logged in", async () => {
    const { _chain, ...sb } = makeSupabase({ user: null });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockResolvedValue(sb as any);

    const res = await post({ profile_id: "p1", rating: 4 });
    expect(res.status).toBe(401);
  });

  it("returns 500 when Supabase client cannot be created", async () => {
    mockCreateClient.mockResolvedValue(null as never);
    const res = await post({ profile_id: "p1", rating: 4 });
    expect(res.status).toBe(500);
  });
});

// ── Payload validation ────────────────────────────────────────────────────────

describe("POST /api/marketplace/reviews — validation", () => {
  beforeEach(() => {
    const { _chain, ...sb } = makeSupabase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockResolvedValue(sb as any);
  });

  it("returns 400 when profile_id is missing", async () => {
    const res = await post({ rating: 4 });
    expect(res.status).toBe(400);
  });

  it("returns 400 when rating is missing", async () => {
    const res = await post({ profile_id: "p1" });
    expect(res.status).toBe(400);
  });

  it("returns 400 when rating is 0", async () => {
    const res = await post({ profile_id: "p1", rating: 0 });
    expect(res.status).toBe(400);
  });

  it("returns 400 when rating is 6", async () => {
    const res = await post({ profile_id: "p1", rating: 6 });
    expect(res.status).toBe(400);
  });

  it("returns 400 when rating is a string", async () => {
    const res = await post({ profile_id: "p1", rating: "5" });
    expect(res.status).toBe(400);
  });

  it("accepts rating of 1 (minimum)", async () => {
    const res = await post({ profile_id: "p1", rating: 1 });
    expect(res.status).toBe(200);
  });

  it("accepts rating of 5 (maximum)", async () => {
    const res = await post({ profile_id: "p1", rating: 5 });
    expect(res.status).toBe(200);
  });
});

// ── First name extraction ─────────────────────────────────────────────────────

describe("POST /api/marketplace/reviews — first name extraction", () => {
  it("uses the first word of full_name from user metadata", async () => {
    const { _chain, ...sb } = makeSupabase({
      user: makeUser({ user_metadata: { full_name: "Alice Smith" } }),
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockResolvedValue(sb as any);

    await post({ profile_id: "p1", rating: 4 });

    const upsertArg = _chain.upsert.mock.calls[0][0];
    expect(upsertArg.reviewer_name).toBe("Alice");
  });

  it("uses only the first name when full_name has multiple words", async () => {
    const { _chain, ...sb } = makeSupabase({
      user: makeUser({ user_metadata: { full_name: "Mary Jane Watson" } }),
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockResolvedValue(sb as any);

    await post({ profile_id: "p1", rating: 3 });

    const upsertArg = _chain.upsert.mock.calls[0][0];
    expect(upsertArg.reviewer_name).toBe("Mary");
  });

  it("falls back to the email prefix when full_name is absent", async () => {
    const { _chain, ...sb } = makeSupabase({
      user: makeUser({ user_metadata: {}, email: "bob.jones@example.com" }),
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockResolvedValue(sb as any);

    await post({ profile_id: "p1", rating: 2 });

    const upsertArg = _chain.upsert.mock.calls[0][0];
    expect(upsertArg.reviewer_name).toBe("bob.jones");
  });

  it("falls back to 'Anonymous' when there is no name or email", async () => {
    const { _chain, ...sb } = makeSupabase({
      user: makeUser({ user_metadata: {}, email: undefined }),
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockResolvedValue(sb as any);

    await post({ profile_id: "p1", rating: 5 });

    const upsertArg = _chain.upsert.mock.calls[0][0];
    expect(upsertArg.reviewer_name).toBe("Anonymous");
  });

  it("falls back to email prefix when full_name is whitespace only", async () => {
    const { _chain, ...sb } = makeSupabase({
      user: makeUser({ user_metadata: { full_name: "   " }, email: "thandeka@example.com" }),
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockResolvedValue(sb as any);

    await post({ profile_id: "p1", rating: 4 });

    const upsertArg = _chain.upsert.mock.calls[0][0];
    expect(upsertArg.reviewer_name).toBe("thandeka");
  });
});

// ── Data transformation ───────────────────────────────────────────────────────

describe("POST /api/marketplace/reviews — data transformation", () => {
  it("passes through title and body when provided", async () => {
    const { _chain, ...sb } = makeSupabase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockResolvedValue(sb as any);

    await post({ profile_id: "p1", rating: 4, title: "Good", body: "Really liked it" });

    const upsertArg = _chain.upsert.mock.calls[0][0];
    expect(upsertArg.title).toBe("Good");
    expect(upsertArg.body).toBe("Really liked it");
  });

  it("trims whitespace from title and body", async () => {
    const { _chain, ...sb } = makeSupabase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockResolvedValue(sb as any);

    await post({ profile_id: "p1", rating: 4, title: "  Padded  ", body: "  Also padded  " });

    const upsertArg = _chain.upsert.mock.calls[0][0];
    expect(upsertArg.title).toBe("Padded");
    expect(upsertArg.body).toBe("Also padded");
  });

  it("converts empty title to null", async () => {
    const { _chain, ...sb } = makeSupabase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockResolvedValue(sb as any);

    await post({ profile_id: "p1", rating: 4, title: "" });

    const upsertArg = _chain.upsert.mock.calls[0][0];
    expect(upsertArg.title).toBeNull();
  });

  it("converts whitespace-only body to null", async () => {
    const { _chain, ...sb } = makeSupabase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockResolvedValue(sb as any);

    await post({ profile_id: "p1", rating: 4, body: "   " });

    const upsertArg = _chain.upsert.mock.calls[0][0];
    expect(upsertArg.body).toBeNull();
  });

  it("sets null title and body when optional fields are omitted", async () => {
    const { _chain, ...sb } = makeSupabase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockResolvedValue(sb as any);

    await post({ profile_id: "p1", rating: 4 });

    const upsertArg = _chain.upsert.mock.calls[0][0];
    expect(upsertArg.title).toBeNull();
    expect(upsertArg.body).toBeNull();
  });

  it("stores the authenticated user's id as reviewer_id", async () => {
    const { _chain, ...sb } = makeSupabase({
      user: makeUser({ id: "specific-user-id" }),
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockResolvedValue(sb as any);

    await post({ profile_id: "p1", rating: 4 });

    const upsertArg = _chain.upsert.mock.calls[0][0];
    expect(upsertArg.reviewer_id).toBe("specific-user-id");
  });

  it("returns the saved review data on success", async () => {
    const savedReview = makeReviewRow();
    const { _chain, ...sb } = makeSupabase({
      upsertResult: { data: savedReview, error: null },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockResolvedValue(sb as any);

    const res = await post({ profile_id: "p1", rating: 4 });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.review.id).toBe("review-1");
    expect(json.review.rating).toBe(4);
  });
});
