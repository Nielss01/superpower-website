import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("next/headers", () => ({ cookies: vi.fn() }));
vi.mock("@/lib/crm-auth", () => ({ checkCrmAuth: vi.fn() }));
vi.mock("@supabase/supabase-js", () => ({ createClient: vi.fn() }));

import { createClient } from "@supabase/supabase-js";
import { checkCrmAuth } from "@/lib/crm-auth";
import { GET, PATCH } from "@/app/api/crm/profiles/[id]/route";

const mockCheckCrmAuth = vi.mocked(checkCrmAuth);
const mockCreateClient = vi.mocked(createClient);

const ROUTE_PARAMS = { params: Promise.resolve({ id: "profile-abc" }) };

function makeProfile() {
  return {
    id: "profile-abc",
    user_id: "user-1",
    business_name: "Test Biz",
    tagline: "Great tagline",
    description: "A description",
    category: "Tech",
    locations: ["Khayelitsha"],
    whatsapp_number: "0721234567",
    website: null,
    response_time: "Usually replies within 1 hour",
    is_published: true,
    is_verified: false,
    profile_photo_url: null,
    service_photo_urls: [],
    marketplace_services: [],
  };
}

// Builds a mock Supabase client that captures what is passed to update()
function makeSupabaseForPatch(capturedPatches: Record<string, unknown>[]) {
  const mockEq     = vi.fn().mockResolvedValue({ error: null });
  const mockUpdate = vi.fn().mockImplementation((patch: Record<string, unknown>) => {
    capturedPatches.push(patch);
    return { eq: mockEq };
  });
  return {
    from: vi.fn().mockReturnValue({ update: mockUpdate }),
  };
}

function makeSupabaseForGet(profile: unknown | null, errorCode?: string) {
  const error = errorCode ? { message: "Not found", code: errorCode } : null;
  const mockSingle = vi.fn().mockResolvedValue({ data: profile, error });
  const mockEq     = vi.fn().mockReturnValue({ single: mockSingle });
  return {
    from: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ eq: mockEq }) }),
  };
}

function patchReq(body: unknown) {
  return new NextRequest("http://localhost/api/crm/profiles/profile-abc", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.resetAllMocks();
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
  process.env.SUPABASE_SECRET_KEY = "test-key";
  mockCheckCrmAuth.mockResolvedValue(true);
});

// ── Auth gates ────────────────────────────────────────────────────────────────

describe("CRM profiles routes — auth", () => {
  beforeEach(() => mockCheckCrmAuth.mockResolvedValue(false));

  it("GET returns 401 when not authenticated", async () => {
    const res = await GET(new NextRequest("http://localhost/"), ROUTE_PARAMS);
    expect(res.status).toBe(401);
  });

  it("PATCH returns 401 when not authenticated", async () => {
    const res = await PATCH(patchReq({ business_name: "New" }), ROUTE_PARAMS);
    expect(res.status).toBe(401);
  });
});

// ── GET ───────────────────────────────────────────────────────────────────────

describe("GET /api/crm/profiles/[id]", () => {
  it("returns the profile data on success", async () => {
    const profile = makeProfile();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockReturnValue(makeSupabaseForGet(profile) as any);

    const res = await GET(new NextRequest("http://localhost/"), ROUTE_PARAMS);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.business_name).toBe("Test Biz");
  });

  it("returns 404 when profile is not found (PGRST116)", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockReturnValue(makeSupabaseForGet(null, "PGRST116") as any);

    const res = await GET(new NextRequest("http://localhost/"), ROUTE_PARAMS);
    expect(res.status).toBe(404);
  });
});

// ── PATCH — field whitelist ───────────────────────────────────────────────────

describe("PATCH /api/crm/profiles/[id] — field whitelist", () => {
  it("forwards only whitelisted fields to the database", async () => {
    const captured: Record<string, unknown>[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockReturnValue(makeSupabaseForPatch(captured) as any);

    const res = await PATCH(patchReq({
      business_name: "Legit Update",   // allowed
      is_published:  true,             // allowed
      user_id:       "injected-id",    // NOT allowed
      id:            "injected-id",    // NOT allowed
      reviewer_id:   "injected",       // NOT allowed
    }), ROUTE_PARAMS);

    expect(res.status).toBe(200);
    expect(captured[0]).toEqual({ business_name: "Legit Update", is_published: true });
    expect(captured[0]).not.toHaveProperty("user_id");
    expect(captured[0]).not.toHaveProperty("id");
    expect(captured[0]).not.toHaveProperty("reviewer_id");
  });

  it("forwards all whitelisted fields correctly", async () => {
    const captured: Record<string, unknown>[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockReturnValue(makeSupabaseForPatch(captured) as any);

    const validPatch = {
      business_name: "Name",
      tagline: "Tagline",
      description: "Desc",
      category: "Tech",
      locations: ["Khayelitsha"],
      whatsapp_number: "0721234567",
      website: "https://example.com",
      response_time: "Usually replies within 1 hour",
      is_published: true,
      is_verified: false,
    };

    await PATCH(patchReq(validPatch), ROUTE_PARAMS);
    expect(captured[0]).toEqual(validPatch);
  });

  it("returns 400 when body contains no whitelisted fields", async () => {
    const captured: Record<string, unknown>[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockReturnValue(makeSupabaseForPatch(captured) as any);

    const res = await PATCH(patchReq({ user_id: "x", id: "y" }), ROUTE_PARAMS);
    expect(res.status).toBe(400);
    expect(captured).toHaveLength(0); // update() was never called
  });

  it("returns 400 when body is empty", async () => {
    const captured: Record<string, unknown>[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockCreateClient.mockReturnValue(makeSupabaseForPatch(captured) as any);

    const res = await PATCH(patchReq({}), ROUTE_PARAMS);
    expect(res.status).toBe(400);
  });
});
