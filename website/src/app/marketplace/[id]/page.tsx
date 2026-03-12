"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { notFound } from "next/navigation";
import { C, FONT } from "@/lib/tokens";
import { LANG, type Lang } from "@/lib/i18n";
import {
  MARKETPLACE_LISTINGS,
  MARKETPLACE_CATEGORY_META,
  avgRating,
  buildWhatsAppUrl,
} from "@/lib/marketplace-data";

const ease = [0.22, 1, 0.36, 1] as const;

// ── Lang toggle ───────────────────────────────────────────────────────────────
function LangToggle({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <button
      onClick={() => setLang(lang === "en" ? "sa" : "en")}
      aria-label="Toggle language"
      style={{
        display: "flex", alignItems: "center",
        background: C.white, border: `1px solid ${C.sand}`,
        borderRadius: "999px", padding: "3px", gap: "2px",
        cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      {(["en", "sa"] as Lang[]).map((l) => (
        <span
          key={l}
          style={{
            display: "block", padding: "4px 11px", borderRadius: "999px",
            fontSize: "11px", fontFamily: FONT.sans, fontWeight: 500,
            letterSpacing: "0.06em", textTransform: "uppercase" as const,
            color: lang === l ? C.white : C.muted,
            background: lang === l ? C.green : "transparent",
            transition: "background 200ms, color 200ms",
          }}
        >
          {l.toUpperCase()}
        </span>
      ))}
    </button>
  );
}

// ── Star display ──────────────────────────────────────────────────────────────
function Stars({ rating, size = 15 }: { rating: number; size?: number }) {
  return (
    <span style={{ display: "inline-flex", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ fontSize: `${size}px`, color: s <= Math.round(rating) ? "#F59E0B" : C.faint, lineHeight: 1 }}>
          ★
        </span>
      ))}
    </span>
  );
}

// ── Rating bar ────────────────────────────────────────────────────────────────
function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span style={{ fontFamily: FONT.sans, fontSize: "11px", color: C.muted, width: "8px", textAlign: "right" }}>{star}</span>
      <span style={{ fontSize: "11px", color: "#F59E0B" }}>★</span>
      <div style={{ flex: 1, height: "6px", borderRadius: "999px", background: C.sand, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, borderRadius: "999px", background: "#F59E0B", transition: "width 600ms ease" }} />
      </div>
      <span style={{ fontFamily: FONT.sans, fontSize: "11px", color: C.soft, width: "16px" }}>{count}</span>
    </div>
  );
}

// ── Section heading ───────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: FONT.sans, fontSize: "10px", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: C.soft, marginBottom: "12px" }}>
      {children}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PROFILE PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function MarketplaceProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [lang, setLang] = useState<Lang>("sa");

  // Persist language (shared key with rest of site)
  useEffect(() => {
    const saved = localStorage.getItem("sph-lang") as Lang | null;
    if (saved === "en" || saved === "sa") setLang(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem("sph-lang", lang);
  }, [lang]);

  const listing = MARKETPLACE_LISTINGS.find((l) => l.id === id);
  if (!listing) return notFound();

  const t = LANG[lang];
  const meta = MARKETPLACE_CATEGORY_META[listing.category];
  const avg = avgRating(listing.reviews);
  const reviewCount = listing.reviews.length;
  const reviewLabel = reviewCount === 1 ? t.market_review_one : t.market_review_many;
  const ratingBuckets = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: listing.reviews.filter((r) => r.rating === star).length,
  }));

  const card = (children: React.ReactNode, delay = 0) => (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease }}
      style={{ background: C.white, borderRadius: "20px", padding: "28px", border: `1px solid ${C.sand}`, marginBottom: "16px" }}
    >
      {children}
    </motion.div>
  );

  return (
    <div style={{ background: C.cream, fontFamily: FONT.sans, minHeight: "100vh" }}>

      {/* ── Sticky header ──────────────────────────────────────────────────── */}
      <div
        style={{
          position: "sticky", top: 0, zIndex: 50,
          background: "rgba(237,233,224,0.88)",
          backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
          borderBottom: `1px solid ${C.sand}`,
        }}
      >
        <div
          style={{
            maxWidth: "800px", margin: "0 auto",
            padding: "0 clamp(20px, 4vw, 48px)",
            display: "flex", alignItems: "center", justifyContent: "space-between", height: "56px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <Link
              href="/marketplace"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontFamily: FONT.sans, fontSize: "13px", fontWeight: 500, color: C.muted, textDecoration: "none" }}
            >
              <span style={{ fontSize: "16px" }}>←</span>
              {t.market_back_list}
            </Link>
            <div style={{ width: "1px", height: "20px", background: C.sand }} />
            <span style={{ fontFamily: FONT.serif, fontSize: "20px", color: C.ink, letterSpacing: "-0.01em" }}>
              Superpowers
            </span>
          </div>
          <LangToggle lang={lang} setLang={setLang} />
        </div>
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px clamp(20px, 4vw, 48px) 80px" }}>

        {/* ── Profile header ───────────────────────────────────────────────── */}
        {card(
          <>
            {/* Photo + name */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "20px", marginBottom: "20px", flexWrap: "wrap" }}>
              <img
                src={listing.profilePhotoUrl}
                alt={listing.businessName}
                style={{
                  width: "clamp(64px, 10vw, 80px)", height: "clamp(64px, 10vw, 80px)",
                  borderRadius: "50%", objectFit: "cover",
                  border: `3px solid ${C.white}`, boxShadow: `0 4px 16px ${meta.color}30`, flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: "200px" }}>
                <div
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "5px",
                    padding: "3px 10px", borderRadius: "999px",
                    background: `${meta.color}18`,
                    fontFamily: FONT.sans, fontSize: "10px", fontWeight: 500,
                    letterSpacing: "0.06em", textTransform: "uppercase" as const,
                    color: meta.color, marginBottom: "8px",
                  }}
                >
                  <span>{meta.emoji}</span>
                  {listing.category}
                </div>
                <h1
                  style={{
                    fontFamily: FONT.serif, fontSize: "clamp(26px, 4vw, 36px)",
                    fontWeight: 400, color: C.ink, lineHeight: 1.1,
                    letterSpacing: "-0.02em", margin: "0 0 6px",
                  }}
                >
                  {listing.businessName}
                </h1>
                <p style={{ fontFamily: FONT.sans, fontSize: "15px", color: C.muted, margin: 0, lineHeight: 1.5 }}>
                  {listing.tagline}
                </p>
              </div>
            </div>

            {/* Rating summary */}
            {avg !== null && (
              <div
                style={{
                  display: "flex", alignItems: "flex-start", gap: "24px",
                  padding: "16px 0", borderTop: `1px solid ${C.sand}`, borderBottom: `1px solid ${C.sand}`,
                  marginBottom: "20px", flexWrap: "wrap",
                }}
              >
                <div style={{ textAlign: "center", flexShrink: 0 }}>
                  <div style={{ fontFamily: FONT.serif, fontSize: "48px", color: C.ink, lineHeight: 1, marginBottom: "6px" }}>
                    {avg.toFixed(1)}
                  </div>
                  <Stars rating={avg} size={16} />
                  <div style={{ fontFamily: FONT.sans, fontSize: "11px", color: C.soft, marginTop: "4px" }}>
                    {reviewCount} {reviewLabel}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: "160px", display: "flex", flexDirection: "column", gap: "6px", justifyContent: "center" }}>
                  {ratingBuckets.map(({ star, count }) => (
                    <RatingBar key={star} star={star} count={count} total={reviewCount} />
                  ))}
                </div>
              </div>
            )}

            {/* Meta row */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
              {listing.location && (
                <span style={{ fontFamily: FONT.sans, fontSize: "13px", color: C.muted }}>📍 {listing.location}</span>
              )}
              {listing.website && (
                <a href={listing.website} target="_blank" rel="noopener noreferrer"
                  style={{ fontFamily: FONT.sans, fontSize: "13px", color: C.ocean, textDecoration: "none" }}>
                  🌐 Website
                </a>
              )}
            </div>

            {/* WhatsApp CTA */}
            <motion.a
              href={buildWhatsAppUrl(listing.whatsappNumber, listing.businessName)}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: "inline-flex", alignItems: "center", gap: "10px",
                padding: "14px 28px", borderRadius: "999px",
                background: "#25D366", color: C.white,
                fontFamily: FONT.sans, fontSize: "15px", fontWeight: 500,
                textDecoration: "none", boxShadow: "0 8px 28px rgba(37,211,102,0.35)",
                cursor: "pointer",
              }}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="white" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
              </svg>
              {t.market_whatsapp}
            </motion.a>
          </>,
          0,
        )}

        {/* ── About ────────────────────────────────────────────────────────── */}
        {listing.description && card(
          <>
            <SectionLabel>{t.market_about}</SectionLabel>
            <p style={{ fontFamily: FONT.sans, fontSize: "15px", color: C.body, lineHeight: 1.75, margin: 0, whiteSpace: "pre-line" }}>
              {listing.description}
            </p>
          </>,
          0.1,
        )}

        {/* ── Services ─────────────────────────────────────────────────────── */}
        {listing.services && card(
          <>
            <SectionLabel>{t.market_services_hd}</SectionLabel>
            <p style={{ fontFamily: FONT.sans, fontSize: "15px", color: C.body, lineHeight: 1.75, margin: 0, whiteSpace: "pre-line" }}>
              {listing.services}
            </p>
          </>,
          0.15,
        )}

        {/* ── Photos ───────────────────────────────────────────────────────── */}
        {listing.servicePhotoUrls.length > 0 && card(
          <>
            <SectionLabel>{t.market_photos}</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "10px" }}>
              {listing.servicePhotoUrls.map((url, i) => (
                <img
                  key={i} src={url} alt={`${listing.businessName} photo ${i + 1}`}
                  style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: "14px", border: `1px solid ${C.sand}` }}
                />
              ))}
            </div>
          </>,
          0.2,
        )}

        {/* ── Reviews ──────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25, ease }}
        >
          <div style={{ fontFamily: FONT.serif, fontSize: "clamp(22px, 3vw, 28px)", color: C.ink, marginBottom: "16px", letterSpacing: "-0.01em" }}>
            {t.market_reviews_hd}{" "}
            {reviewCount > 0 && (
              <span style={{ fontFamily: FONT.sans, fontSize: "16px", color: C.soft, fontWeight: 400 }}>
                ({reviewCount})
              </span>
            )}
          </div>

          {reviewCount === 0 ? (
            <div style={{ background: C.white, borderRadius: "20px", padding: "40px", border: `1px solid ${C.sand}`, textAlign: "center", color: C.soft, fontFamily: FONT.sans, fontSize: "14px" }}>
              {t.market_reviews_none}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {listing.reviews.map((review, i) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.06, ease }}
                  style={{ background: C.white, borderRadius: "18px", padding: "20px 24px", border: `1px solid ${C.sand}` }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: review.body ? "10px" : 0, flexWrap: "wrap" }}>
                    <div>
                      <Stars rating={review.rating} size={14} />
                      {review.title && (
                        <div style={{ fontFamily: FONT.sans, fontSize: "14px", fontWeight: 600, color: C.ink, marginTop: "4px" }}>
                          {review.title}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: FONT.sans, fontSize: "13px", fontWeight: 500, color: C.body }}>
                        {review.reviewerName}
                      </div>
                      <div style={{ fontFamily: FONT.sans, fontSize: "11px", color: C.soft, marginTop: "2px" }}>
                        {new Date(review.date).toLocaleDateString(lang === "sa" ? "af-ZA" : "en-ZA", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>
                  </div>
                  {review.body && (
                    <p style={{ fontFamily: FONT.sans, fontSize: "14px", color: C.muted, lineHeight: 1.65, margin: 0 }}>
                      {review.body}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
