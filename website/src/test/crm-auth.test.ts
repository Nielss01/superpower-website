import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next/headers before importing the module under test
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

import { cookies } from "next/headers";
import { checkCrmAuth } from "@/lib/crm-auth";

const mockCookies = vi.mocked(cookies);

beforeEach(() => {
  vi.resetAllMocks();
  process.env.CRM_AUTH_TOKEN = "test-token-abc";
});

describe("checkCrmAuth", () => {
  it("returns true when cookie matches the token", async () => {
    mockCookies.mockResolvedValue({
      get: (name: string) => name === "sph_crm_auth" ? { name, value: "test-token-abc" } : undefined,
    } as ReturnType<typeof cookies> extends Promise<infer T> ? T : never);

    expect(await checkCrmAuth()).toBe(true);
  });

  it("returns false when cookie value does not match", async () => {
    mockCookies.mockResolvedValue({
      get: () => ({ name: "sph_crm_auth", value: "wrong-token" }),
    } as ReturnType<typeof cookies> extends Promise<infer T> ? T : never);

    expect(await checkCrmAuth()).toBe(false);
  });

  it("returns false when cookie is absent", async () => {
    mockCookies.mockResolvedValue({
      get: () => undefined,
    } as ReturnType<typeof cookies> extends Promise<infer T> ? T : never);

    expect(await checkCrmAuth()).toBe(false);
  });

  it("returns false when CRM_AUTH_TOKEN env var is not set", async () => {
    delete process.env.CRM_AUTH_TOKEN;
    mockCookies.mockResolvedValue({
      get: () => ({ name: "sph_crm_auth", value: "anything" }),
    } as ReturnType<typeof cookies> extends Promise<infer T> ? T : never);

    expect(await checkCrmAuth()).toBe(false);
  });
});
