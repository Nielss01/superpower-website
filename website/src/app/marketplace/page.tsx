"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { C, FONT, GRAD } from "@/lib/tokens";
import { LANG, type Lang } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import {
  MARKETPLACE_LISTINGS,
  MARKETPLACE_CATEGORY_META,
  avgRating,
  type MarketplaceCategory,
  type MarketplaceListing,
} from "@/lib/marketplace-data";

const ease = [0.22, 1, 0.36, 1] as const;

const ALL_CATEGORIES = Object.keys(MARKETPLACE_CATEGORY_META) as MarketplaceCategory[];

// Map category key → i18n key suffix
const CAT_I18N: Record<MarketplaceCategory, keyof typeof LANG["en"]> = {
  Creative:           "market_cat_creative",
  Tech:               "market_cat_tech",
  Education:          "market_cat_education",
  "Food & Beverage":  "market_cat_food",
  "Beauty & Wellness":"market_cat_beauty",
  Services:           "market_cat_services",
};

// ── Lang toggle ───────────────────────────────────────────────────────────────
function LangToggle({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <button
      onClick={() => setLang(lang === "en" ? "sa" : "en")}
      aria-label="Toggle language"
      style={{
        display: "flex",
        alignItems: "center",
        background: C.white,
        border: `1px solid ${C.sand}`,
        borderRadius: "999px",
        padding: "3px",
        gap: "2px",
        cursor: "pointer",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      {(["en", "sa"] as Lang[]).map((l) => (
        <span
          key={l}
          style={{
            display: "block",
            padding: "4px 11px",
            borderRadius: "999px",
            fontSize: "11px",
            fontFamily: FONT.sans,
            fontWeight: 500,
            letterSpacing: "0.06em",
            textTransform: "uppercase" as const,
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
function Stars({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <span style={{ display: "inline-flex", gap: "1px" }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          style={{ fontSize: `${size}px`, color: s <= Math.round(rating) ? "#F59E0B" : C.faint, lineHeight: 1 }}
        >
          ★
        </span>
      ))}
    </span>
  );
}

// ── Listing card ──────────────────────────────────────────────────────────────
function ListingCard({ listing, lang, index }: { listing: MarketplaceListing; lang: Lang; index: number }) {
  const [hovered, setHovered] = useState(false);
  const meta = MARKETPLACE_CATEGORY_META[listing.category];
  const avg = avgRating(listing.reviews);
  const t = LANG[lang];
  const reviewCount = listing.reviews.length;
  const reviewLabel = reviewCount === 1 ? t.market_review_one : t.market_review_many;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: index * 0.04, ease }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <Link href={`/marketplace/${listing.id}`} style={{ textDecoration: "none" }}>
        <div
          style={{
            padding: "1px",
            borderRadius: "20px",
            background: hovered ? meta.color : C.sand,
            transition: "background 250ms",
            boxShadow: hovered ? `0 12px 40px ${meta.color}28` : "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{
              background: C.white,
              borderRadius: "18px",
              padding: "20px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: meta.wash,
                opacity: hovered ? 1 : 0,
                transition: "opacity 300ms",
                pointerEvents: "none",
              }}
            />

            {/* Photo + name */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px", position: "relative" }}>
              <img
                src={listing.profilePhotoUrl}
                alt={listing.businessName}
                style={{
                  width: 44, height: 44, borderRadius: "50%", objectFit: "cover",
                  flexShrink: 0, border: `2px solid ${C.white}`,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              />
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: FONT.serif, fontSize: "18px", color: C.ink,
                    lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}
                >
                  {listing.businessName}
                </div>
                {listing.location && (
                  <div style={{ fontFamily: FONT.sans, fontSize: "11px", color: C.soft, marginTop: "2px" }}>
                    📍 {listing.location}
                  </div>
                )}
              </div>
            </div>

            {/* Category */}
            <div
              style={{
                display: "inline-flex", alignItems: "center", gap: "5px",
                padding: "3px 10px", borderRadius: "999px",
                background: `${meta.color}18`,
                fontFamily: FONT.sans, fontSize: "10px", fontWeight: 500,
                letterSpacing: "0.06em", textTransform: "uppercase" as const,
                color: meta.color, marginBottom: "10px",
              }}
            >
              <span style={{ fontSize: "11px" }}>{meta.emoji}</span>
              {t[CAT_I18N[listing.category]]}
            </div>

            {/* Tagline */}
            <div style={{ fontFamily: FONT.sans, fontSize: "13px", color: C.body, lineHeight: 1.5, marginBottom: "14px" }}>
              {listing.tagline}
            </div>

            {/* Rating */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {avg !== null ? (
                <>
                  <Stars rating={avg} />
                  <span style={{ fontFamily: FONT.sans, fontSize: "12px", fontWeight: 600, color: C.body }}>
                    {avg.toFixed(1)}
                  </span>
                  <span style={{ fontFamily: FONT.sans, fontSize: "11px", color: C.soft }}>
                    ({reviewCount} {reviewLabel})
                  </span>
                </>
              ) : (
                <span style={{ fontFamily: FONT.sans, fontSize: "11px", color: C.soft }}>
                  {t.market_no_reviews_short}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ── Category pill ─────────────────────────────────────────────────────────────
function CategoryPill({ label, color, emoji, active, count, onClick }: {
  label: string; color: string; emoji: string; active: boolean; count: number; onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      style={{
        display: "inline-flex", alignItems: "center", gap: "6px",
        padding: "8px 16px", borderRadius: "999px",
        border: active ? "none" : `1px solid ${C.sand}`,
        background: active ? color : C.white,
        color: active ? C.white : C.body,
        fontFamily: FONT.sans, fontSize: "13px", fontWeight: 500,
        cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
        boxShadow: active ? `0 4px 16px ${color}30` : "0 1px 4px rgba(0,0,0,0.04)",
        transition: "background 200ms, color 200ms",
      }}
    >
      <span style={{ fontSize: "13px" }}>{emoji}</span>
      <span>{label}</span>
      <span style={{ fontSize: "11px", opacity: 0.7, fontWeight: 400 }}>{count}</span>
    </motion.button>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MARKETPLACE PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function MarketplacePage() {
  const [lang, setLang] = useState<Lang>("sa");
  const [activeCategory, setActiveCategory] = useState<MarketplaceCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const router = useRouter();

  // Persist language (shared key with rest of site)
  useEffect(() => {
    const saved = localStorage.getItem("sph-lang") as Lang | null;
    if (saved === "en" || saved === "sa") setLang(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem("sph-lang", lang);
  }, [lang]);

  // Auth state
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleListCTA = async () => {
    if (user) {
      router.push("/marketplace/new");
    } else {
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback?next=/marketplace/new` },
      });
    }
  };

  const t = LANG[lang];

  const filtered = useMemo(() => {
    let list = MARKETPLACE_LISTINGS;
    if (activeCategory !== "all") list = list.filter((l) => l.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (l) =>
          l.businessName.toLowerCase().includes(q) ||
          l.tagline.toLowerCase().includes(q) ||
          l.location.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q),
      );
    }
    return list;
  }, [activeCategory, search]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: MARKETPLACE_LISTINGS.length };
    for (const cat of ALL_CATEGORIES) c[cat] = MARKETPLACE_LISTINGS.filter((l) => l.category === cat).length;
    return c;
  }, []);

  const countLabel = filtered.length === 1 ? t.market_count_one : t.market_count_many;

  return (
    <div style={{ background: C.cream, fontFamily: FONT.sans, minHeight: "100vh", overflowX: "hidden" }}>

      {/* ── Sticky header ──────────────────────────────────────────────────── */}
      <div
        style={{
          position: "sticky", top: 0, zIndex: 50,
          background: "rgba(237,233,224,0.88)",
          backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
          borderBottom: `1px solid ${C.sand}`,
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 clamp(20px, 4vw, 48px)" }}>
          {/* Top row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "56px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <Link
                href="/"
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontFamily: FONT.sans, fontSize: "13px", fontWeight: 500, color: C.muted, textDecoration: "none" }}
              >
                <span style={{ fontSize: "16px" }}>←</span>
                {t.market_back}
              </Link>
              <div style={{ width: "1px", height: "20px", background: C.sand }} />
              <span style={{ fontFamily: FONT.serif, fontSize: "20px", color: C.ink, letterSpacing: "-0.01em" }}>
                Superpowers
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <motion.button
                onClick={handleListCTA}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "8px 16px", borderRadius: "999px",
                  background: C.green, color: C.white,
                  fontFamily: FONT.sans, fontSize: "13px", fontWeight: 600,
                  border: "none", cursor: "pointer",
                  boxShadow: `0 4px 16px ${C.green}40`,
                }}
              >
                <span style={{ fontSize: "14px" }}>+</span>
                {t.market_list_cta}
              </motion.button>
              <LangToggle lang={lang} setLang={setLang} />
            </div>
          </div>

          {/* Category pills */}
          <div style={{ display: "flex", gap: "8px", paddingBottom: "14px", overflowX: "auto", scrollbarWidth: "none" }}>
            <CategoryPill
              label={t.market_all} color={C.green} emoji="✦"
              active={activeCategory === "all"} count={counts["all"]}
              onClick={() => setActiveCategory("all")}
            />
            {ALL_CATEGORIES.map((cat) => {
              const meta = MARKETPLACE_CATEGORY_META[cat];
              return (
                <CategoryPill
                  key={cat}
                  label={t[CAT_I18N[cat]]}
                  color={meta.color} emoji={meta.emoji}
                  active={activeCategory === cat} count={counts[cat] || 0}
                  onClick={() => setActiveCategory(cat)}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Page content ─────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 clamp(20px, 4vw, 48px)" }}>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          style={{ padding: "48px 0 12px", maxWidth: "560px" }}
        >
          <div style={{ fontFamily: FONT.sans, fontSize: "11px", fontWeight: 500, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>
            <AnimatePresence mode="wait">
              <motion.span key={`label-${lang}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                {t.market_label}
              </motion.span>
            </AnimatePresence>
          </div>
          <h1 style={{ fontFamily: FONT.serif, fontSize: "clamp(40px, 6vw, 60px)", fontWeight: 400, color: C.ink, lineHeight: 1.05, letterSpacing: "-0.02em", margin: "0 0 14px" }}>
            <AnimatePresence mode="wait">
              <motion.span key={`title-${lang}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }} style={{ display: "block" }}>
                {t.market_title}
              </motion.span>
            </AnimatePresence>
          </h1>
          <p style={{ fontFamily: FONT.sans, fontSize: "15px", color: C.muted, lineHeight: 1.7, margin: 0 }}>
            <AnimatePresence mode="wait">
              <motion.span key={`sub-${lang}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                {t.market_sub}
              </motion.span>
            </AnimatePresence>
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease }}
          style={{ position: "relative", maxWidth: "380px", marginBottom: "32px" }}
        >
          <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "15px", color: C.soft, pointerEvents: "none" }}>
            🔍
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.market_search}
            style={{
              width: "100%", padding: "12px 16px 12px 40px", borderRadius: "14px",
              border: `1px solid ${C.sand}`, background: C.white,
              fontFamily: FONT.sans, fontSize: "14px", color: C.ink,
              outline: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              transition: "border-color 200ms, box-shadow 200ms", boxSizing: "border-box",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = C.greenBr; e.currentTarget.style.boxShadow = `0 0 0 3px ${C.greenBr}22`; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = C.sand; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; }}
          />
        </motion.div>

        {/* Count */}
        <div style={{ fontFamily: FONT.sans, fontSize: "12px", color: C.soft, marginBottom: "16px" }}>
          {filtered.length} {countLabel}
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", paddingBottom: "80px" }}>
            <AnimatePresence mode="popLayout">
              {filtered.map((listing, i) => (
                <ListingCard key={listing.id} listing={listing} lang={lang} index={i} />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🤷</div>
            <div style={{ fontFamily: FONT.serif, fontSize: "24px", color: C.ink, marginBottom: "8px" }}>
              {t.market_empty_title}
            </div>
            <div style={{ fontFamily: FONT.sans, fontSize: "14px", color: C.muted }}>
              {t.market_empty_sub}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
