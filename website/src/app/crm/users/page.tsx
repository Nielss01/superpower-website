"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { C, FONT } from "@/lib/tokens";

interface Listing {
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
  isReviewer: boolean;
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
  const [result, setResult]           = useState<PageResult | null>(null);
  const [loading, setLoading]         = useState(false);
  const [search, setSearch]           = useState("");
  const [committedQ, setCommittedQ]   = useState("");
  const [hideReviewers, setHideReviewers] = useState(true);
  const [error, setError]             = useState<string | null>(null);

  const fetchPage = useCallback(async (q: string, page: number) => {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/crm/users?q=${encodeURIComponent(q)}&page=${page}`);
    if (res.status === 401) { router.replace("/crm/login"); return; }
    if (!res.ok) { setError(`Error ${res.status}`); setLoading(false); return; }
    setResult(await res.json());
    setLoading(false);
  }, [router]);

  // Load first page on mount
  useEffect(() => { fetchPage("", 1); }, [fetchPage]);

  function handleSearchSubmit(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    setCommittedQ(search);
    fetchPage(search, 1);
  }

  function goToPage(page: number) {
    fetchPage(committedQ, page);
  }

  const users = result?.users ?? [];
  const visible = hideReviewers ? users.filter((u) => !u.isReviewer || u.listing) : users;

  return (
    <div style={{ padding: "40px clamp(24px, 4vw, 56px)", fontFamily: FONT.sans }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontFamily: FONT.serif, fontSize: "clamp(22px, 3vw, 28px)", color: C.ink, fontWeight: 400, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
            Users &amp; Profiles
          </h1>
          {result && !loading && (
            <p style={{ fontSize: "14px", color: C.muted, margin: 0 }}>
              {result.total} account{result.total !== 1 ? "s" : ""}
              {committedQ && <span> matching <em>"{committedQ}"</em></span>}
              {" · "}
              <span style={{ color: C.green, fontWeight: 500 }}>{users.filter((u) => u.listing).length > 0 ? `${users.filter((u) => u.listing).length} with listing` : "none with listing"}</span>
            </p>
          )}
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            onClick={() => setHideReviewers((v) => !v)}
            style={{
              padding: "9px 14px", borderRadius: "10px", cursor: "pointer",
              border: "1px solid #E4E4E7", fontFamily: FONT.sans, fontSize: "13px",
              background: hideReviewers ? C.ink : "#fff",
              color: hideReviewers ? "#fff" : C.muted,
              transition: "background 150ms, color 150ms",
              whiteSpace: "nowrap" as const,
            }}
          >
            {hideReviewers ? "Reviewers hidden" : "Show reviewers"}
          </button>
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
          No users found.
        </div>
      ) : (
        <>
          <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #E4E4E7", overflow: "hidden" }}>
            {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 110px 120px 80px", padding: "10px 20px", borderBottom: "1px solid #F0F0F0", fontSize: "10px", fontWeight: 700, color: "#888", letterSpacing: "0.08em", textTransform: "uppercase" as const }}>
              <span>Account</span>
              <span>Listing</span>
              <span>Category</span>
              <span>Joined</span>
              <span>Status</span>
            </div>

            {visible.map((u, i) => (
              <div
                key={u.id}
                style={{ display: "grid", gridTemplateColumns: "1fr 1fr 110px 120px 80px", alignItems: "center", padding: "14px 20px", borderBottom: i < visible.length - 1 ? "1px solid #F4F4F5" : "none" }}
              >
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 500, color: C.ink }}>{u.email ?? <span style={{ color: "#aaa" }}>—</span>}</div>
                  <div style={{ fontSize: "11px", color: "#bbb", marginTop: "2px", fontFamily: "monospace" }}>{u.id}</div>
                </div>

                <div>
                  {u.listing ? (
                    <>
                      <div style={{ fontSize: "13px", fontWeight: 500, color: C.ink }}>{u.listing.business_name}</div>
                      {u.listing.tagline && (
                        <div style={{ fontSize: "11px", color: "#aaa", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "220px" }}>
                          {u.listing.tagline}
                        </div>
                      )}
                      {u.listing.locations.length > 0 && (
                        <div style={{ fontSize: "11px", color: "#bbb", marginTop: "1px" }}>
                          {u.listing.locations.join(", ")}
                        </div>
                      )}
                    </>
                  ) : (
                    <span style={{ fontSize: "12px", color: "#ccc" }}>No listing</span>
                  )}
                </div>

                <div style={{ fontSize: "12px", color: C.muted }}>
                  {u.listing?.category ?? <span style={{ color: "#ddd" }}>—</span>}
                </div>

                <div style={{ fontSize: "12px", color: C.muted }}>{fmt(u.createdAt)}</div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {u.listing ? (
                    <>
                      <Badge label={u.listing.is_published ? "Live" : "Draft"} color={u.listing.is_published ? "#059669" : "#aaa"} bg={u.listing.is_published ? "#ECFDF5" : "#F9FAFB"} />
                      {u.listing.is_verified && <Badge label="Verified" color="#2563EB" bg="#EFF6FF" />}
                    </>
                  ) : (
                    <Badge label="No listing" color="#ccc" bg="#F9FAFB" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {result && result.pages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "20px" }}>
              <PageBtn label="←" disabled={result.page <= 1} onClick={() => goToPage(result.page - 1)} />
              {Array.from({ length: result.pages }, (_, i) => i + 1).map((p) => (
                <PageBtn key={p} label={String(p)} active={p === result.page} disabled={false} onClick={() => goToPage(p)} />
              ))}
              <PageBtn label="→" disabled={result.page >= result.pages} onClick={() => goToPage(result.page + 1)} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: "6px", background: bg, color, fontSize: "10px", fontWeight: 600, whiteSpace: "nowrap" as const }}>
      {label}
    </span>
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
