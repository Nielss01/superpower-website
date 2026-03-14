"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { C, FONT } from "@/lib/tokens";

interface CrmReview {
  id:           string;
  reviewerId:   string;
  reviewerName: string;
  rating:       number;
  title:        string;
  body:         string;
  createdAt:    string;
  isHidden:     boolean;
  profile:      { id: string; businessName: string; category: string } | null;
}

interface PageResult {
  reviews: CrmReview[];
  total:   number;
  page:    number;
  pages:   number;
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-ZA", { year: "numeric", month: "short", day: "numeric" });
}

function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ fontSize: "12px", letterSpacing: "1px" }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ color: s <= rating ? "#F59E0B" : "#E4E4E7" }}>★</span>
      ))}
    </span>
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

export default function CrmReviewsPage() {
  const router = useRouter();
  const [result, setResult]       = useState<PageResult | null>(null);
  const [loading, setLoading]     = useState(false);
  const [search, setSearch]       = useState("");
  const [committedQ, setCommittedQ] = useState("");
  const [error, setError]         = useState<string | null>(null);
  const [acting, setActing]       = useState<string | null>(null); // id of row being mutated
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchPage = useCallback(async (q: string, page: number) => {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/crm/reviews?q=${encodeURIComponent(q)}&page=${page}`);
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

  async function toggleHide(review: CrmReview) {
    setActing(review.id);
    await fetch("/api/crm/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: review.id, is_hidden: !review.isHidden }),
    });
    setActing(null);
    fetchPage(committedQ, result?.page ?? 1);
  }

  async function handleDelete(id: string) {
    setActing(id);
    setConfirmDelete(null);
    await fetch("/api/crm/reviews", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setActing(null);
    fetchPage(committedQ, result?.page ?? 1);
  }

  const reviews = result?.reviews ?? [];
  const hidden  = reviews.filter((r) => r.isHidden).length;

  return (
    <div style={{ padding: "40px clamp(24px, 4vw, 56px)", fontFamily: FONT.sans }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontFamily: FONT.serif, fontSize: "clamp(22px, 3vw, 28px)", color: C.ink, fontWeight: 400, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
            Reviews
          </h1>
          {result && !loading && (
            <p style={{ fontSize: "14px", color: C.muted, margin: 0 }}>
              {result.total} review{result.total !== 1 ? "s" : ""}
              {committedQ && <span> matching <em>&ldquo;{committedQ}&rdquo;</em></span>}
              {hidden > 0 && <span style={{ color: "#EF4444" }}> · {hidden} hidden on this page</span>}
            </p>
          )}
        </div>
        <input
          type="search"
          placeholder="Search reviewer, title, body… Enter"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearchSubmit}
          style={{
            padding: "9px 14px", borderRadius: "10px",
            border: "1px solid #E4E4E7", fontFamily: FONT.sans,
            fontSize: "13px", color: C.ink, outline: "none",
            width: "280px", background: "#fff",
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
      ) : reviews.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #E4E4E7", padding: "48px", textAlign: "center", color: "#aaa", fontSize: "14px" }}>
          No reviews found.
        </div>
      ) : (
        <>
          <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #E4E4E7", overflow: "hidden" }}>
            {/* Column headers */}
            <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 160px 110px 80px", padding: "10px 20px", borderBottom: "1px solid #F0F0F0", fontSize: "10px", fontWeight: 700, color: "#888", letterSpacing: "0.08em", textTransform: "uppercase" as const }}>
              <span>Rating</span>
              <span>Review</span>
              <span>Profile</span>
              <span>Date</span>
              <span>Actions</span>
            </div>

            {reviews.map((r, i) => (
              <div
                key={r.id}
                style={{
                  display: "grid", gridTemplateColumns: "80px 1fr 160px 110px 80px",
                  alignItems: "start", padding: "16px 20px",
                  borderBottom: i < reviews.length - 1 ? "1px solid #F4F4F5" : "none",
                  background: r.isHidden ? "#FAFAFA" : "#fff",
                  opacity: acting === r.id ? 0.5 : 1,
                  transition: "opacity 150ms",
                }}
              >
                {/* Rating */}
                <div style={{ paddingTop: "2px" }}>
                  <Stars rating={r.rating} />
                  <div style={{ fontSize: "11px", color: C.soft, marginTop: "2px" }}>{r.rating}/5</div>
                </div>

                {/* Review content */}
                <div style={{ minWidth: 0, paddingRight: "16px" }}>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: C.soft, marginBottom: "2px" }}>
                    {r.reviewerName}
                  </div>
                  {r.title && (
                    <div style={{ fontSize: "13px", fontWeight: 600, color: C.ink, marginBottom: "3px" }}>
                      {r.title}
                    </div>
                  )}
                  {r.body && (
                    <div style={{ fontSize: "12px", color: C.muted, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" as const }}>
                      {r.body}
                    </div>
                  )}
                  {!r.title && !r.body && (
                    <span style={{ fontSize: "12px", color: "#ccc", fontStyle: "italic" }}>Rating only</span>
                  )}
                  {r.isHidden && (
                    <div style={{ marginTop: "6px" }}>
                      <Badge label="Hidden" color="#EF4444" bg="#FFF5F5" />
                    </div>
                  )}
                </div>

                {/* Profile */}
                <div>
                  {r.profile ? (
                    <>
                      <div style={{ fontSize: "13px", fontWeight: 500, color: C.ink }}>{r.profile.businessName}</div>
                      <div style={{ fontSize: "11px", color: C.soft, marginTop: "1px" }}>{r.profile.category}</div>
                    </>
                  ) : (
                    <span style={{ fontSize: "12px", color: "#ccc" }}>—</span>
                  )}
                </div>

                {/* Date */}
                <div style={{ fontSize: "12px", color: C.muted }}>{fmt(r.createdAt)}</div>

                {/* Actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <button
                    onClick={() => toggleHide(r)}
                    disabled={acting === r.id}
                    style={{
                      padding: "5px 10px", borderRadius: "7px", fontSize: "11px", fontWeight: 600,
                      border: "1px solid #E4E4E7", cursor: "pointer", fontFamily: FONT.sans,
                      background: r.isHidden ? "#F0FDF4" : "#FFF7ED",
                      color: r.isHidden ? "#059669" : "#D97706",
                    }}
                  >
                    {r.isHidden ? "Unhide" : "Hide"}
                  </button>

                  {confirmDelete === r.id ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <button
                        onClick={() => handleDelete(r.id)}
                        style={{ padding: "5px 10px", borderRadius: "7px", fontSize: "11px", fontWeight: 600, border: "none", cursor: "pointer", fontFamily: FONT.sans, background: "#EF4444", color: "#fff" }}
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        style={{ padding: "5px 10px", borderRadius: "7px", fontSize: "11px", fontWeight: 600, border: "1px solid #E4E4E7", cursor: "pointer", fontFamily: FONT.sans, background: "#fff", color: C.muted }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(r.id)}
                      disabled={acting === r.id}
                      style={{ padding: "5px 10px", borderRadius: "7px", fontSize: "11px", fontWeight: 600, border: "1px solid #FECACA", cursor: "pointer", fontFamily: FONT.sans, background: "#FFF5F5", color: "#EF4444" }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
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
