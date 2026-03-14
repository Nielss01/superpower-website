"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { C, FONT } from "@/lib/tokens";

interface Listing {
  id:            string;
  user_id:       string;
  business_name: string;
  tagline:       string | null;
  category:      string | null;
  locations:     string[];
  is_published:  boolean;
  is_verified:   boolean;
}

interface CrmUser {
  id:         string;
  email:      string | null;
  createdAt:  string;
  lastSignIn: string | null;
  provider:   string;
  listing:    Listing | null;
}

interface PageResult {
  users: CrmUser[];
  total: number;
  page:  number;
  pages: number;
}

function fmt(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-ZA", { year: "numeric", month: "short", day: "numeric" });
}

export default function CrmUsersPage() {
  const router = useRouter();
  const [result, setResult]         = useState<PageResult | null>(null);
  const [loading, setLoading]       = useState(false);
  const [search, setSearch]         = useState("");
  const [committedQ, setCommittedQ] = useState("");
  const [error, setError]           = useState<string | null>(null);
  const [acting, setActing]         = useState<string | null>(null);

  const fetchPage = useCallback(async (q: string, page: number) => {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/crm/users?q=${encodeURIComponent(q)}&page=${page}`);
    if (res.status === 401) { router.replace("/crm/login"); return; }
    if (!res.ok) { setError(`Error ${res.status}`); setLoading(false); return; }
    setResult(await res.json());
    setLoading(false);
  }, [router]);

  useEffect(() => { fetchPage("", 1); }, [fetchPage]);

  function handleSearchSubmit(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    setCommittedQ(search);
    fetchPage(search, 1);
  }

  async function patchListing(profileId: string, patch: Record<string, unknown>) {
    setActing(profileId);
    // Optimistic update
    setResult((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        users: prev.users.map((u) =>
          u.listing?.id === profileId
            ? { ...u, listing: { ...u.listing!, ...patch } }
            : u,
        ),
      };
    });
    await fetch(`/api/crm/profiles/${profileId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setActing(null);
  }

  const users = result?.users ?? [];
  const visible = users.filter((u) => u.listing);

  return (
    <div style={{ padding: "40px clamp(24px, 4vw, 56px)", fontFamily: FONT.sans }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontFamily: FONT.serif, fontSize: "clamp(22px, 3vw, 28px)", color: C.ink, fontWeight: 400, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
            Profiles
          </h1>
          {result && !loading && (
            <p style={{ fontSize: "14px", color: C.muted, margin: 0 }}>
              {visible.length} listing{visible.length !== 1 ? "s" : ""}
              {committedQ && <span> matching <em>&ldquo;{committedQ}&rdquo;</em></span>}
            </p>
          )}
        </div>
        <input
          type="search"
          placeholder="Search and press Enter…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearchSubmit}
          style={{
            padding: "9px 14px", borderRadius: "10px",
            border: "1px solid #E4E4E7", fontFamily: FONT.sans,
            fontSize: "13px", color: C.ink, outline: "none",
            width: "240px", background: "#fff",
          }}
        />
      </div>

      {error && (
        <div style={{ padding: "12px 16px", borderRadius: "8px", background: "#FFF5F5", border: "1px solid #FECACA", color: "#EF4444", fontSize: "13px", marginBottom: "20px" }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ color: C.muted, fontSize: "14px" }}>Loading…</div>
      ) : visible.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #E4E4E7", padding: "48px", textAlign: "center", color: "#aaa", fontSize: "14px" }}>
          No profiles found.
        </div>
      ) : (
        <>
          <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #E4E4E7", overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 110px 110px 140px", padding: "10px 20px", borderBottom: "1px solid #F0F0F0", fontSize: "10px", fontWeight: 700, color: "#888", letterSpacing: "0.08em", textTransform: "uppercase" as const }}>
              <span>Account</span>
              <span>Listing</span>
              <span>Category</span>
              <span>Joined</span>
              <span>Actions</span>
            </div>

            {visible.map((u, i) => {
              const l = u.listing!;
              return (
                <div
                  key={u.id}
                  style={{
                    display: "grid", gridTemplateColumns: "1fr 1fr 110px 110px 140px",
                    alignItems: "center", padding: "14px 20px",
                    borderBottom: i < visible.length - 1 ? "1px solid #F4F4F5" : "none",
                    opacity: acting === l.id ? 0.6 : 1, transition: "opacity 150ms",
                  }}
                >
                  {/* Account */}
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 500, color: C.ink }}>{u.email ?? <span style={{ color: "#aaa" }}>—</span>}</div>
                    <div style={{ fontSize: "11px", color: "#bbb", marginTop: "2px", fontFamily: "monospace" }}>{u.id}</div>
                  </div>

                  {/* Listing */}
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 500, color: C.ink }}>{l.business_name}</div>
                    {l.tagline && (
                      <div style={{ fontSize: "11px", color: "#aaa", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "220px" }}>
                        {l.tagline}
                      </div>
                    )}
                    {l.locations.length > 0 && (
                      <div style={{ fontSize: "11px", color: "#bbb", marginTop: "1px" }}>{l.locations.join(", ")}</div>
                    )}
                  </div>

                  {/* Category */}
                  <div style={{ fontSize: "12px", color: C.muted }}>{l.category ?? <span style={{ color: "#ddd" }}>—</span>}</div>

                  {/* Joined */}
                  <div style={{ fontSize: "12px", color: C.muted }}>{fmt(u.createdAt)}</div>

                  {/* Actions */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
                    {/* Live toggle */}
                    <button
                      onClick={() => patchListing(l.id, { is_published: !l.is_published })}
                      disabled={acting === l.id}
                      title={l.is_published ? "Click to unpublish" : "Click to publish"}
                      style={{
                        padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 600,
                        border: "none", cursor: "pointer", fontFamily: FONT.sans,
                        background: l.is_published ? "#ECFDF5" : "#F3F4F6",
                        color: l.is_published ? "#059669" : "#6B7280",
                      }}
                    >
                      {l.is_published ? "● Live" : "○ Draft"}
                    </button>

                    {/* Verify toggle */}
                    <button
                      onClick={() => patchListing(l.id, { is_verified: !l.is_verified })}
                      disabled={acting === l.id}
                      title={l.is_verified ? "Click to remove verification" : "Click to verify"}
                      style={{
                        padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 600,
                        border: `1px solid ${l.is_verified ? "#BFDBFE" : "#E4E4E7"}`,
                        cursor: "pointer", fontFamily: FONT.sans,
                        background: l.is_verified ? "#EFF6FF" : "#fff",
                        color: l.is_verified ? "#2563EB" : "#9CA3AF",
                      }}
                    >
                      {l.is_verified ? "✓ Verified" : "Verify"}
                    </button>

                    {/* Edit */}
                    <Link
                      href={`/crm/users/${l.id}`}
                      style={{
                        padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 600,
                        border: "1px solid #E4E4E7", background: "#fff", color: C.muted,
                        textDecoration: "none", whiteSpace: "nowrap" as const,
                      }}
                    >
                      Edit →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {result && result.pages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "20px" }}>
              <PageBtn label="←" disabled={result.page <= 1} onClick={() => fetchPage(committedQ, result.page - 1)} />
              {Array.from({ length: result.pages }, (_, i) => i + 1).map((p) => (
                <PageBtn key={p} label={String(p)} active={p === result.page} disabled={false} onClick={() => fetchPage(committedQ, p)} />
              ))}
              <PageBtn label="→" disabled={result.page >= result.pages} onClick={() => fetchPage(committedQ, result.page + 1)} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PageBtn({ label, active, disabled, onClick }: { label: string; active?: boolean; disabled: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        minWidth: "34px", height: "34px", padding: "0 10px",
        borderRadius: "8px", border: "1px solid #E4E4E7",
        background: active ? C.ink : "#fff",
        color: active ? "#fff" : disabled ? "#ccc" : C.muted,
        fontSize: "13px", cursor: disabled ? "default" : "pointer",
        fontFamily: FONT.sans,
      }}
    >
      {label}
    </button>
  );
}
