"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import OrgBlob from "@/components/design/OrgBlob";
import { C, GRAD, FONT } from "@/lib/tokens";
import { LANG, type Lang } from "@/lib/i18n";
import {
  MARKETPLACE_LISTINGS,
  MARKETPLACE_CATEGORY_META,
  avgRating,
  isTopHustler,
  buildWhatsAppUrl,
} from "@/lib/marketplace-data";

const ease = [0.22, 1, 0.36, 1] as const;

// ── Section label (matches builder /s/[slug]) ────────────────────────────────
function SectionLabel({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "7px",
      fontFamily: FONT.sans, fontSize: "11px", fontWeight: 600,
      letterSpacing: "0.08em", textTransform: "uppercase" as const,
      color: C.muted, marginBottom: "14px",
    }}>
      <span style={{ fontSize: "13px" }}>{icon}</span>
      {children}
    </div>
  );
}

// ── Stars ─────────────────────────────────────────────────────────────────────
function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
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

// ── Rating distribution bar ───────────────────────────────────────────────────
function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span style={{ fontFamily: FONT.sans, fontSize: "11px", color: C.muted, width: "8px", textAlign: "right" }}>{star}</span>
      <span style={{ fontSize: "11px", color: "#F59E0B" }}>★</span>
      <div style={{ flex: 1, height: "6px", borderRadius: "999px", background: C.sand, overflow: "hidden" }}>
        <div style={{ height: "100%", width: total > 0 ? `${(count / total) * 100}%` : "0%", borderRadius: "999px", background: "#F59E0B", transition: "width 600ms ease" }} />
      </div>
      <span style={{ fontFamily: FONT.sans, fontSize: "11px", color: C.soft, width: "16px" }}>{count}</span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MARKETPLACE PROFILE PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function MarketplaceProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [lang, setLang] = useState<Lang>("sa");

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
  const topHustler = isTopHustler(listing.reviews);
  const reviewCount = listing.reviews.length;
  const reviewLabel = reviewCount === 1 ? t.market_review_one : t.market_review_many;
  const ratingBuckets = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: listing.reviews.filter((r) => r.rating === star).length,
  }));

  // Parse newline-separated services text into individual cards
  const serviceLines = listing.services
    ? listing.services.split("\n").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div style={{ minHeight: "100vh", background: C.cream, position: "relative" }}>

      {/* Background blobs */}
      <div style={{ position: "fixed", top: -120, right: -80, width: 350, opacity: 0.04, pointerEvents: "none" }}>
        <OrgBlob variant={1} color={meta.color} />
      </div>
      <div style={{ position: "fixed", bottom: -60, left: -100, width: 300, opacity: 0.03, pointerEvents: "none" }}>
        <OrgBlob variant={3} color={C.pinkBr} />
      </div>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(160deg, ${meta.color}15 0%, ${C.cream} 50%, ${C.oceanBr}08 100%)`,
        padding: "0 0 48px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Coloured top stripe */}
        <div style={{ height: "4px", background: GRAD.flow }} />

        {/* Nav */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "16px clamp(20px, 5vw, 48px)",
          maxWidth: "680px", margin: "0 auto",
        }}>
          <Link
            href="/marketplace"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontFamily: FONT.sans, fontSize: "13px", fontWeight: 500, color: C.muted, textDecoration: "none" }}
          >
            <span style={{ fontSize: "16px" }}>←</span>
            {t.market_back_list}
          </Link>
          <button
            onClick={() => { const next = lang === "en" ? "sa" : "en"; setLang(next); localStorage.setItem("sph-lang", next); }}
            style={{ display: "flex", alignItems: "center", background: C.white, border: `1px solid ${C.sand}`, borderRadius: "999px", padding: "3px", gap: "2px", cursor: "pointer" }}
          >
            {(["en", "sa"] as Lang[]).map((l) => (
              <span
                key={l}
                style={{
                  display: "block", padding: "3px 9px", borderRadius: "999px",
                  fontSize: "10px", fontFamily: FONT.sans, fontWeight: 500,
                  letterSpacing: "0.06em", textTransform: "uppercase" as const,
                  color: lang === l ? C.white : C.muted,
                  background: lang === l ? C.green : "transparent",
                  transition: "all 200ms",
                }}
              >
                {l.toUpperCase()}
              </span>
            ))}
          </button>
        </div>

        {/* Profile header */}
        <div style={{ maxWidth: "680px", margin: "0 auto", padding: "8px clamp(20px, 5vw, 48px) 0" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}
          >
            {/* Avatar — rounded square, matching builder */}
            <div style={{
              width: 80, height: 80, borderRadius: "22px", flexShrink: 0,
              background: listing.profilePhotoUrl
                ? `url(${listing.profilePhotoUrl}) center/cover`
                : `linear-gradient(135deg, ${meta.color}, ${C.oceanBr})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "28px", color: C.white,
              border: `4px solid ${C.white}`,
              boxShadow: "0 6px 24px rgba(0,0,0,0.1)",
            }}>
              {!listing.profilePhotoUrl && meta.emoji}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{
                fontFamily: FONT.serif, fontSize: "clamp(24px, 5vw, 32px)",
                fontWeight: 400, color: C.ink, lineHeight: 1.15, margin: 0,
              }}>
                {listing.businessName}
              </h1>

              {listing.location.length > 0 && (
                <div style={{ fontFamily: FONT.sans, fontSize: "13px", color: C.muted, marginTop: "6px", display: "flex", alignItems: "center", gap: "5px" }}>
                  📍 {listing.location.join(", ")}
                </div>
              )}

              {listing.tagline && (
                <div style={{ fontFamily: FONT.serif, fontSize: "14px", fontStyle: "italic", color: C.body, marginTop: "10px", lineHeight: 1.5 }}>
                  &ldquo;{listing.tagline}&rdquo;
                </div>
              )}

              {/* Badges */}
              <div style={{ display: "flex", gap: "6px", marginTop: "12px", flexWrap: "wrap" }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: "4px",
                  padding: "4px 10px", borderRadius: "8px",
                  background: `${meta.color}12`, fontFamily: FONT.sans,
                  fontSize: "10px", fontWeight: 600, textTransform: "uppercase" as const,
                  color: meta.color, letterSpacing: "0.04em",
                }}>
                  {meta.emoji} {listing.category}
                </span>
                {topHustler && (
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: "4px",
                    padding: "4px 10px", borderRadius: "8px",
                    background: "#FEF3C7", fontFamily: FONT.sans,
                    fontSize: "10px", fontWeight: 600, color: "#D97706",
                  }}>
                    🏆 Top Hustler
                  </span>
                )}
                {listing.isVerified && (
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: "4px",
                    padding: "4px 10px", borderRadius: "8px",
                    background: C.greenWash, fontFamily: FONT.sans,
                    fontSize: "10px", fontWeight: 600, color: C.green,
                  }}>
                    ✓ Verified
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* Rating + response time + WhatsApp */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease }}
            style={{ marginTop: "24px", display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}
          >
            {avg !== null && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontFamily: FONT.serif, fontSize: "28px", color: C.ink, lineHeight: 1 }}>
                  {(avg * 2).toFixed(1)}
                  <span style={{ fontFamily: FONT.sans, fontSize: "13px", color: C.soft, fontWeight: 400 }}>/10</span>
                </span>
                <div>
                  <Stars rating={avg} size={14} />
                  <div style={{ fontFamily: FONT.sans, fontSize: "11px", color: C.soft, marginTop: "2px" }}>
                    {reviewCount} {reviewLabel}
                  </div>
                </div>
              </div>
            )}

            {listing.responseTime && (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                padding: "8px 14px", borderRadius: "999px",
                background: C.white, border: `1px solid ${C.sandLt}`,
                fontFamily: FONT.sans, fontSize: "12px", fontWeight: 500, color: C.body,
              }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.greenBr, flexShrink: 0, boxShadow: "0 0 0 3px rgba(34,160,107,0.15)" }} />
                {listing.responseTime}
              </div>
            )}

            {listing.whatsappNumber && (
              <motion.a
                href={buildWhatsAppUrl(listing.whatsappNumber, listing.businessName)}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  padding: "10px 22px", borderRadius: "999px",
                  background: "#25D366", color: C.white,
                  fontFamily: FONT.sans, fontSize: "13px", fontWeight: 600,
                  textDecoration: "none", boxShadow: "0 6px 20px rgba(37,211,102,0.3)",
                }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="white" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                </svg>
                {t.market_whatsapp}
              </motion.a>
            )}

            {listing.website && (
              <a
                href={listing.website}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontFamily: FONT.sans, fontSize: "13px", color: C.ocean, textDecoration: "none", fontWeight: 500 }}
              >
                🌐 Website
              </a>
            )}
          </motion.div>
        </div>
      </div>

      {/* ── Body sections ─────────────────────────────────────────────────── */}
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "0 clamp(20px, 5vw, 48px) 60px" }}>

        {/* Services */}
        {serviceLines.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease }}
            style={{ marginTop: "36px" }}
          >
            <SectionLabel icon="📋">{t.market_services_hd}</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" }}>
              {serviceLines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.06 }}
                  style={{
                    padding: "14px 16px", borderRadius: "14px",
                    background: C.white, border: `1px solid ${C.sandLt}`,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                    fontFamily: FONT.sans, fontSize: "13px", color: C.body, lineHeight: 1.5,
                  }}
                >
                  {line}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* About */}
        {listing.description && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5, ease }}
            style={{ marginTop: "32px" }}
          >
            <SectionLabel icon="💬">{t.market_about}</SectionLabel>
            <div style={{ fontFamily: FONT.sans, fontSize: "14px", color: C.body, lineHeight: 1.8, whiteSpace: "pre-line" }}>
              {listing.description}
            </div>
          </motion.div>
        )}

        {/* Photos */}
        {listing.servicePhotoUrls.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5, ease }}
            style={{ marginTop: "32px" }}
          >
            <SectionLabel icon="📷">{t.market_photos}</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "10px" }}>
              {listing.servicePhotoUrls.map((url, i) => (
                <img
                  key={i} src={url} alt={`${listing.businessName} photo ${i + 1}`}
                  style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: "14px", border: `1px solid ${C.sandLt}` }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5, ease }}
          style={{ marginTop: "32px" }}
        >
          <SectionLabel icon="⭐">
            <>
              {t.market_reviews_hd}
              {reviewCount > 0 && (
                <span style={{ fontWeight: 400, color: C.soft, textTransform: "none" as const, letterSpacing: 0 }}>
                  {" "}({reviewCount})
                </span>
              )}
            </>
          </SectionLabel>

          {/* Rating breakdown */}
          {reviewCount > 0 && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: "24px", marginBottom: "20px", flexWrap: "wrap" }}>
              <div style={{ textAlign: "center", flexShrink: 0 }}>
                <div style={{ fontFamily: FONT.serif, fontSize: "40px", color: C.ink, lineHeight: 1, marginBottom: "4px" }}>
                  {(avg! * 2).toFixed(1)}
                  <span style={{ fontFamily: FONT.sans, fontSize: "14px", color: C.soft, fontWeight: 400 }}>/10</span>
                </div>
                <Stars rating={avg!} size={14} />
              </div>
              <div style={{ flex: 1, minWidth: "160px", display: "flex", flexDirection: "column", gap: "6px", justifyContent: "center" }}>
                {ratingBuckets.map(({ star, count }) => (
                  <RatingBar key={star} star={star} count={count} total={reviewCount} />
                ))}
              </div>
            </div>
          )}

          {reviewCount === 0 ? (
            <div style={{
              background: C.white, borderRadius: "14px", padding: "32px",
              border: `1px solid ${C.sandLt}`, textAlign: "center",
              color: C.soft, fontFamily: FONT.sans, fontSize: "14px",
            }}>
              {t.market_reviews_none}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {listing.reviews.map((review, i) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.06, duration: 0.4, ease }}
                  style={{
                    padding: "18px 20px", borderRadius: "14px",
                    background: C.white, border: `1px solid ${C.sandLt}`,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                    <div>
                      <Stars rating={review.rating} size={13} />
                      {review.title && (
                        <div style={{ fontFamily: FONT.sans, fontSize: "13px", fontWeight: 600, color: C.ink, marginTop: "4px" }}>
                          {review.title}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: FONT.sans, fontSize: "12px", fontWeight: 500, color: C.body }}>
                        {review.reviewerName}
                      </div>
                      <div style={{ fontFamily: FONT.sans, fontSize: "11px", color: C.soft, marginTop: "2px" }}>
                        {new Date(review.date).toLocaleDateString(lang === "sa" ? "af-ZA" : "en-ZA", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>
                  </div>
                  {review.body && (
                    <p style={{ fontFamily: FONT.sans, fontSize: "13px", color: C.muted, lineHeight: 1.7, margin: "10px 0 0" }}>
                      {review.body}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <div style={{
        textAlign: "center", padding: "24px", borderTop: `1px solid ${C.sandLt}`,
        fontFamily: FONT.sans, fontSize: "11px", color: C.soft,
      }}>
        <Link href="/marketplace" style={{ color: C.greenBr, fontWeight: 600, textDecoration: "none" }}>
          Superpower Marketplace
        </Link>
        {" — "}
        <Link href="/" style={{ color: C.green, textDecoration: "none" }}>
          {lang === "sa" ? "begin joune gratis" : "start yours free"}
        </Link>
      </div>
    </div>
  );
}
