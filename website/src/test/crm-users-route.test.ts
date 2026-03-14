import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("next/headers", () => ({ cookies: vi.fn() }));
vi.mock("@/lib/crm-auth", () => ({ checkCrmAuth: vi.fn() }));
vi.mock("@supabase/supabase-js", () => ({ createClient: vi.fn() }));

import { createClient } from "@supabase/supabase-js";
import { checkCrmAuth } from "@/lib/crm-auth";
import { GET } from "@/app/api/crm/users/route";

const mockCheckCrmAuth = vi.mocked(checkCrmAuth);
const mockCreateClient = vi.mocked(createClient);

// ── Factories ─────────────────────────────────────────────────────────────────

function makeAuthUser(overrides: Partial<{
  id: string; email: string; created_at: string; last_sign_in_at: string; provider: string;
}> = {}) {
  return {
    id: "user-1",
    email: "user@example.com",
    created_at: "2026-01-01T00:00:00Z",
    last_sign_in_at: "2026-03-01T00:00:00Z",
    provider: "google",
    ...overrides,
  };
}

function makeProfile(overrides: Partial<{
  id: string; user_id: string; business_name: string; tagline: string;
  category: string; locations: string[]; is_published: boolean; is_verified: boolean;
}> = {}) {
  return {
    id: "profile-1",
    user_id: "user-1",
    business_name: "Test Biz",
    tagline: "Great tagline",
    category: "Tech",
    locations: ["Khayelitsha"],
    is_published: true,
    is_verified: false,
    ...overrides,
  };
}

function makeSupabase(
  users: ReturnType<typeof makeAuthUser>[],
  profiles: ReturnType<typeof makeProfile>[],
  reviewerIds: string[],
) {
  return {
    rpc: vi.fn().mockResolvedValue({ data: users, error: null }),
    from: vi.fn().mockImplementation((table: string) => ({
      select: vi.fn().mockResolvedValue({
        data: table === "marketplace_profiles"
          ? profiles
          : reviewerIds.map((id) => ({ reviewer_id: id })),
        error: null,
      }),
    })),
  };
}

function get(url: string) {
  return GET(new NextRequest(`http://localhost${url}`));
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.resetAllMocks();
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
  process.env.SUPABASE_SECRET_KEY = "test-key";
  mockCheckCrmAuth.mockResolvedValue(true);
});

// ── Auth gate ─────────────────────────────────────────────────────────────────

describe("GET /api/crm/users — auth", () => {
  it("returns 401 when not authenticated", async () => {
    mockCheckCrmAuth.mockResolvedValue(false);
    const res = await get("/api/crm/users");
    expect(res.status).toBe(401);
  });

  it("returns 500 when env vars are missing", async () => {
    delete process.env.SUPABASE_SECRET_KEY;
    const res = await get("/api/crm/users");
    expect(res.status).toBe(500);
  });
});

// ── Search filtering ──────────────────────────────────────────────────────────

describe("GET /api/crm/users — search", () => {
  it("returns all users when no query", async () => {
    const users = [makeAuthUser({ id: "u1" }), makeAuthUser({ id: "u2", email: "b@example.com" })];
    const profiles = [makeProfile({ user_id: "u1" }), makeProfile({ id: "p2", user_id: "u2", business_name: "Other Biz" })];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockReturnValue(makeSupabase(users, profiles, []) as any);

    const res = await get("/api/crm/users");
    const json = await res.json();
    expect(json.total).toBe(2);
  });

  it("filters by email (case-insensitive)", async () => {
    const users = [
      makeAuthUser({ id: "u1", email: "alice@example.com" }),
      makeAuthUser({ id: "u2", email: "bob@example.com" }),
    ];
    const profiles = [
      makeProfile({ user_id: "u1", business_name: "Alice Biz" }),
      makeProfile({ id: "p2", user_id: "u2", business_name: "Bob Biz" }),
    ];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockReturnValue(makeSupabase(users, profiles, []) as any);

    const res = await get("/api/crm/users?q=ALICE");
    const json = await res.json();
    expect(json.total).toBe(1);
    expect(json.users[0].email).toBe("alice@example.com");
  });

  it("filters by business name (case-insensitive)", async () => {
    const users = [
      makeAuthUser({ id: "u1", email: "a@example.com" }),
      makeAuthUser({ id: "u2", email: "b@example.com" }),
    ];
    const profiles = [
      makeProfile({ user_id: "u1", business_name: "Kasi Cuts" }),
      makeProfile({ id: "p2", user_id: "u2", business_name: "Tech Hub" }),
    ];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockReturnValue(makeSupabase(users, profiles, []) as any);

    const res = await get("/api/crm/users?q=kasi");
    const json = await res.json();
    expect(json.total).toBe(1);
    expect(json.users[0].listing.business_name).toBe("Kasi Cuts");
  });

  it("filters by user id", async () => {
    const targetId = "aaaaaaaa-0000-0000-0000-000000000001";
    const users = [
      makeAuthUser({ id: targetId, email: "a@example.com" }),
      makeAuthUser({ id: "bbbbbbbb-0000-0000-0000-000000000002", email: "b@example.com" }),
    ];
    const profiles = [
      makeProfile({ user_id: targetId }),
      makeProfile({ id: "p2", user_id: "bbbbbbbb-0000-0000-0000-000000000002", business_name: "Other" }),
    ];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockReturnValue(makeSupabase(users, profiles, []) as any);

    const res = await get(`/api/crm/users?q=${targetId}`);
    const json = await res.json();
    expect(json.total).toBe(1);
    expect(json.users[0].id).toBe(targetId);
  });

  it("returns zero results when no users match the query", async () => {
    const users = [makeAuthUser({ email: "someone@example.com" })];
    const profiles = [makeProfile()];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockReturnValue(makeSupabase(users, profiles, []) as any);

    const res = await get("/api/crm/users?q=nomatch");
    const json = await res.json();
    expect(json.total).toBe(0);
    expect(json.users).toHaveLength(0);
  });
});

// ── Reviewer detection ────────────────────────────────────────────────────────

describe("GET /api/crm/users — isReviewer flag", () => {
  it("marks a user as reviewer when their id appears in reviews", async () => {
    const users = [makeAuthUser({ id: "u1" })];
    const profiles = [makeProfile({ user_id: "u1" })];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockReturnValue(makeSupabase(users, profiles, ["u1"]) as any);

    const res = await get("/api/crm/users");
    const json = await res.json();
    expect(json.users[0].isReviewer).toBe(true);
  });

  it("does not mark a user as reviewer when their id is absent from reviews", async () => {
    const users = [makeAuthUser({ id: "u1" })];
    const profiles = [makeProfile({ user_id: "u1" })];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockReturnValue(makeSupabase(users, profiles, ["other-id"]) as any);

    const res = await get("/api/crm/users");
    const json = await res.json();
    expect(json.users[0].isReviewer).toBe(false);
  });
});

// ── Pagination ────────────────────────────────────────────────────────────────

describe("GET /api/crm/users — pagination", () => {
  it("returns page 1 data and correct pagination metadata", async () => {
    const users = Array.from({ length: 3 }, (_, i) =>
      makeAuthUser({ id: `u${i}`, email: `u${i}@example.com` }),
    );
    const profiles = users.map((u, i) =>
      makeProfile({ id: `p${i}`, user_id: u.id, business_name: `Biz ${i}` }),
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockReturnValue(makeSupabase(users, profiles, []) as any);

    const res = await get("/api/crm/users?page=1");
    const json = await res.json();
    expect(json.page).toBe(1);
    expect(json.pages).toBe(1);
    expect(json.total).toBe(3);
    expect(json.users).toHaveLength(3);
  });

  it("clamps page to the last available page when it exceeds total pages", async () => {
    const users = [makeAuthUser()];
    const profiles = [makeProfile()];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockReturnValue(makeSupabase(users, profiles, []) as any);

    const res = await get("/api/crm/users?page=99");
    const json = await res.json();
    expect(json.page).toBe(1); // clamped to 1
  });

  it("attaches listing data to each user", async () => {
    const users = [makeAuthUser({ id: "u1" })];
    const profiles = [makeProfile({ user_id: "u1", business_name: "My Shop", category: "Food & Beverage" })];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockReturnValue(makeSupabase(users, profiles, []) as any);

    const res = await get("/api/crm/users");
    const json = await res.json();
    expect(json.users[0].listing).not.toBeNull();
    expect(json.users[0].listing.business_name).toBe("My Shop");
    expect(json.users[0].listing.category).toBe("Food & Beverage");
  });

  it("sets listing to null for users without a profile", async () => {
    const users = [makeAuthUser({ id: "u1" })];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockReturnValue(makeSupabase(users, [], []) as any);

    const res = await get("/api/crm/users");
    const json = await res.json();
    expect(json.users[0].listing).toBeNull();
  });
});
