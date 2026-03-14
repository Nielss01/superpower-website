"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import OrgBlob from "@/components/design/OrgBlob";
import { C, GRAD, FONT } from "@/lib/tokens";
import { LANG, type Lang } from "@/lib/i18n";
import { CATEGORY_META, type Category } from "@/lib/ideas";
import { fetchMyProfile } from "@/lib/supabase/profile-queries";

// ── Types ────────────────────────────────────────────────────────────────────
interface Service {
  name: string;
  price: string;
  description?: string;
}

interface SavedProfile {
  idea: {
    id: string;
    emoji: string;
    name: string;
    nameSA: string;
    category: Category;
    earning: string;
    description: string;
    descriptionSA: string;
  } | null;
  name: string;
  wijk: string;
  services: Service[];
  bio: string;
  plan: string[];
  photoUrl: string | null;
  tagline: string;
  story: string;
  availability: string;
  promise: string;
  slug: string;
}

// ── Animation ease ──────────────────────────────────────────────────────────
const ease = [0.22, 1, 0.36, 1] as const;

// ── Section checklist item ──────────────────────────────────────────────────
function SectionCheck({ label, filled, delay }: { label: string; filled: boolean; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3, ease }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 14px",
        borderRadius: "10px",
        background: filled ? C.greenWash : C.creamLt,
        border: `1px solid ${filled ? C.greenPale : C.sandLt}`,
        transition: "all 200ms",
      }}
    >
      <div
        style={{
          width: 20, height: 20,
          borderRadius: "6px",
          background: filled ? C.green : "transparent",
          border: filled ? "none" : `2px solid ${C.sand}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "all 200ms",
        }}
      >
        {filled && (
          <svg width="12" height="12" viewBox="0 0 16 16">
            <path d="M3 8.5L6.5 12L13 4" stroke={C.white} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        )}
      </div>
      <span
        style={{
          fontFamily: FONT.sans,
          fontSize: "13px",
          fontWeight: filled ? 500 : 400,
          color: filled ? C.ink : C.muted,
        }}
      >
        {label}
      </span>
    </motion.div>
  );
}

// ── Plan step with toggle ───────────────────────────────────────────────────
function PlanStep({
  step,
  index,
  done,
  onToggle,
  delay,
}: {
  step: string;
  index: number;
  done: boolean;
  onToggle: () => void;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3, ease }}
      onClick={onToggle}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        padding: "14px 16px",
        borderRadius: "12px",
        background: done ? `${C.greenWash}` : C.white,
        border: `1px solid ${done ? C.greenPale : C.sandLt}`,
        cursor: "pointer",
        transition: "all 200ms",
        userSelect: "none",
      }}
    >
      <div
        style={{
          width: 24, height: 24,
          borderRadius: "50%",
          background: done ? C.green : GRAD.flow,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: done ? "none" : `0 2px 8px ${C.greenBr}30`,
          transition: "all 200ms",
        }}
      >
        {done ? (
          <svg width="12" height="12" viewBox="0 0 16 16">
            <path d="M3 8.5L6.5 12L13 4" stroke={C.white} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        ) : (
          <span style={{ fontFamily: FONT.sans, fontSize: "11px", fontWeight: 700, color: C.white }}>
            {index + 1}
          </span>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <span
          style={{
            fontFamily: FONT.sans,
            fontSize: "13px",
            fontWeight: 500,
            color: done ? C.muted : C.ink,
            lineHeight: 1.5,
            textDecorationLine: done ? "line-through" : "none",
            textDecorationStyle: "solid" as const,
            textDecorationColor: done ? C.sand : "transparent",
          }}
        >
          {step}
        </span>
      </div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MY PAGE — /my — My Businesses
// ══════════════════════════════════════════════════════════════════════════════
export default function MyPage() {
  const [lang, setLang] = useState<Lang>("sa");
  const [profile, setProfile] = useState<SavedProfile | null>(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [planDone, setPlanDone] = useState<boolean[]>([]);
  const [isClaimed, setIsClaimed] = useState(false);

  const loadLocalProfile = () => {
    try {
      const raw = localStorage.getItem("sph-profile");
      if (raw) {
        const data = JSON.parse(raw);
        setProfile(data);
        setPlanDone(new Array(data.plan?.length || 0).fill(false));
        try {
          const planProgress = localStorage.getItem("sph-plan-progress");
          if (planProgress) setPlanDone(JSON.parse(planProgress));
        } catch {}
      }
    } catch {}
  };

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("sph-lang") as Lang | null;
    if (saved === "en" || saved === "sa") setLang(saved);

    setIsClaimed(!!localStorage.getItem("sph-claimed"));

    // Try Supabase first, fall back to localStorage
    fetchMyProfile().then((result) => {
      if (result) {
        const { profile: bp, businessPlan } = result;
        const data: SavedProfile = {
          idea: bp.idea_id ? {
            id: bp.idea_id, emoji: "⚡", name: bp.business_name || "",
            nameSA: bp.business_name || "", category: "business" as Category,
            earning: "", description: "", descriptionSA: "",
          } : null,
          name: bp.name,
          wijk: bp.wijk || "",
          services: (bp.services || []) as SavedProfile["services"],
          bio: bp.bio || businessPlan?.solution || "",
          plan: bp.plan || [],
          photoUrl: bp.photo_url || null,
          tagline: bp.tagline || "",
          story: bp.story || "",
          availability: bp.availability || "",
          promise: bp.promise || "",
          slug: bp.slug,
        };
        setProfile(data);
        setPlanDone(new Array(data.plan?.length || 0).fill(false));
        try {
          const planProgress = localStorage.getItem("sph-plan-progress");
          if (planProgress) setPlanDone(JSON.parse(planProgress));
        } catch {}
      } else {
        loadLocalProfile();
      }
      setLoading(false);
    }).catch(() => {
      loadLocalProfile();
      setLoading(false);
    });
  }, []);

  const togglePlan = (i: number) => {
    setPlanDone((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      localStorage.setItem("sph-plan-progress", JSON.stringify(next));
      return next;
    });
  };

  if (!mounted || loading) return (
    <div style={{
      minHeight: "100vh", background: C.cream,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        style={{
          width: 32, height: 32, borderRadius: "50%",
          border: `3px solid ${C.sandLt}`,
          borderTopColor: C.green,
        }}
      />
    </div>
  );

  const t = LANG[lang];

  // ── No profile state ────────────────────────────────────────────────────
  if (!profile) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: C.cream,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: -100, right: -80, width: 400, opacity: 0.04, pointerEvents: "none" }}>
          <OrgBlob variant={1} color={C.greenBr} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          style={{ textAlign: "center", maxWidth: 360, padding: "40px 24px" }}
        >
          <div style={{
            width: 72, height: 72, borderRadius: "20px",
            background: C.creamLt, border: `1px solid ${C.sandLt}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px", fontSize: "32px",
          }}>
            ⚡
          </div>
          <h2 style={{ fontFamily: FONT.serif, fontSize: "24px", fontWeight: 400, color: C.ink, margin: "0 0 8px" }}>
            {t.my_no_profile}
          </h2>
          <p style={{ fontFamily: FONT.sans, fontSize: "14px", color: C.muted, lineHeight: 1.6, margin: "0 0 24px" }}>
            {t.my_no_profile_sub}
          </p>
          <Link
            href="/"
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "14px 28px", borderRadius: "999px",
              background: GRAD.flow, color: C.white,
              fontFamily: FONT.sans, fontSize: "14px", fontWeight: 600,
              textDecoration: "none", boxShadow: "0 6px 24px rgba(34,160,107,0.3)",
            }}
          >
            ⚡ {t.my_start}
          </Link>
        </motion.div>
      </div>
    );
  }

  // ── Has profile — dashboard ─────────────────────────────────────────────
  const meta = profile.idea ? CATEGORY_META[profile.idea.category] : null;
  const ideaName = profile.idea
    ? lang === "sa" ? profile.idea.nameSA : profile.idea.name
    : "Business";
  const businessName = profile.name ? `${profile.name}'s ${ideaName}` : ideaName;
  const slug = profile.slug || profile.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "my-superpower";
  const shareUrl = `superpowers.org/s/${slug}`;
  const isLive = !!profile.promise; // Has completed all questions

  // Section completion map
  const sections = [
    { key: "name", label: lang === "sa" ? "Naam" : "Name", filled: !!profile.name },
    { key: "wijk", label: lang === "sa" ? "Wyk" : "Area", filled: !!profile.wijk },
    { key: "services", label: t.bou_services, filled: profile.services.length > 0 },
    { key: "bio", label: t.bou_about, filled: !!profile.bio },
    { key: "story", label: t.bou_story, filled: !!profile.story },
    { key: "availability", label: t.bou_availability, filled: !!profile.availability },
    { key: "promise", label: t.bou_promise, filled: !!profile.promise },
  ];
  const filledCount = sections.filter((s) => s.filled).length;
  const completionPct = Math.round((filledCount / sections.length) * 100);
  const planDoneCount = planDone.filter(Boolean).length;

  const copyLink = () => {
    navigator.clipboard.writeText(`https://${shareUrl}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.cream, position: "relative" }}>

      {/* Background blobs */}
      <div style={{ position: "fixed", top: -100, right: -60, width: 350, opacity: 0.04, pointerEvents: "none" }}>
        <OrgBlob variant={1} color={C.greenBr} />
      </div>
      <div style={{ position: "fixed", bottom: -80, left: -80, width: 300, opacity: 0.03, pointerEvents: "none" }}>
        <OrgBlob variant={3} color={C.pinkBr} />
      </div>

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div
        style={{
          position: "sticky", top: 0, zIndex: 50,
          background: "rgba(237,233,224,0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: `1px solid ${C.sand}`,
          padding: "0 clamp(16px, 3vw, 32px)",
          height: "56px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{ fontFamily: FONT.serif, fontSize: "18px", fontWeight: 400, color: C.ink }}>
              Superpowers
            </span>
          </Link>
          <div style={{ width: "1px", height: "20px", background: C.sand }} />
          <span style={{ fontFamily: FONT.sans, fontSize: "12px", fontWeight: 600, color: C.muted, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {t.my_title}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Status pill */}
          <div style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "4px 12px", borderRadius: "999px",
            background: isLive ? C.greenWash : C.orangeWash,
            border: `1px solid ${isLive ? C.greenPale : C.orangePale}`,
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%",
              background: isLive ? C.greenBr : C.orange,
              boxShadow: isLive ? `0 0 0 3px ${C.greenBr}25` : "none",
            }} />
            <span style={{ fontFamily: FONT.sans, fontSize: "10px", fontWeight: 600, color: isLive ? C.green : C.orange }}>
              {isLive ? t.my_live : t.my_draft}
            </span>
          </div>

          {/* Lang toggle */}
          <button
            onClick={() => { const next = lang === "en" ? "sa" : "en"; setLang(next); localStorage.setItem("sph-lang", next); }}
            style={{
              display: "flex", alignItems: "center", background: C.white,
              border: `1px solid ${C.sand}`, borderRadius: "999px", padding: "3px", gap: "2px", cursor: "pointer",
            }}
          >
            {(["en", "sa"] as Lang[]).map((l) => (
              <span
                key={l}
                style={{
                  display: "block", padding: "3px 9px", borderRadius: "999px",
                  fontSize: "10px", fontFamily: FONT.sans, fontWeight: 500, letterSpacing: "0.06em",
                  textTransform: "uppercase" as const,
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
      </div>

      {/* ── Main content ─────────────────────────────────────── */}
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "28px clamp(16px, 4vw, 40px) 60px" }}>

        {/* ── Profile card hero ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          style={{
            padding: "24px",
            borderRadius: "20px",
            background: C.white,
            border: `1px solid ${C.sandLt}`,
            boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle gradient accent top */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: GRAD.flow, borderRadius: "20px 20px 0 0" }} />

          <div style={{ display: "flex", gap: "18px", alignItems: "flex-start" }}>
            {/* Avatar */}
            <div
              style={{
                width: 64, height: 64, borderRadius: "18px",
                background: profile.photoUrl
                  ? `url(${profile.photoUrl}) center/cover`
                  : meta ? `linear-gradient(135deg, ${meta.color}, ${C.oceanBr})` : GRAD.flow,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "26px", color: C.white, fontFamily: FONT.serif,
                flexShrink: 0,
                border: `3px solid ${C.white}`,
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              }}
            >
              {!profile.photoUrl && (profile.name ? profile.name[0].toUpperCase() : profile.idea?.emoji || "⚡")}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{
                fontFamily: FONT.serif, fontSize: "22px",
                fontWeight: 400, color: C.ink, lineHeight: 1.2, margin: 0,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {businessName}
              </h1>

              {profile.wijk && (
                <div style={{ fontFamily: FONT.sans, fontSize: "12px", color: C.muted, marginTop: "4px" }}>
                  📍 {profile.wijk}
                </div>
              )}

              {profile.tagline && (
                <div style={{
                  fontFamily: FONT.sans, fontSize: "12px",
                  color: C.body, marginTop: "6px", lineHeight: 1.4,
                  fontStyle: "italic",
                }}>
                  {profile.tagline}
                </div>
              )}

              {/* Badges */}
              <div style={{ display: "flex", gap: "6px", marginTop: "10px", flexWrap: "wrap" }}>
                {meta && (
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: "3px",
                    padding: "3px 8px", borderRadius: "6px",
                    background: `${meta.color}12`, fontFamily: FONT.sans,
                    fontSize: "9px", fontWeight: 600, textTransform: "uppercase" as const,
                    color: meta.color, letterSpacing: "0.04em",
                  }}>
                    {profile.idea?.emoji} {lang === "sa" ? meta.labelSA : meta.label}
                  </span>
                )}
                {isClaimed && (
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: "3px",
                    padding: "3px 8px", borderRadius: "6px",
                    background: C.greenWash, fontFamily: FONT.sans,
                    fontSize: "9px", fontWeight: 600, color: C.green,
                  }}>
                    ✓ Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── Completion bar ───────────────────────────────── */}
          <div style={{ marginTop: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontFamily: FONT.sans, fontSize: "11px", fontWeight: 600, color: C.muted }}>
                {t.my_profile_complete}
              </span>
              <span style={{
                fontFamily: FONT.sans, fontSize: "12px", fontWeight: 700,
                color: completionPct === 100 ? C.green : C.body,
              }}>
                {completionPct}%
              </span>
            </div>
            <div style={{ height: 6, borderRadius: "999px", background: C.creamLt, overflow: "hidden" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPct}%` }}
                transition={{ duration: 0.8, ease, delay: 0.2 }}
                style={{ height: "100%", borderRadius: "999px", background: GRAD.flow }}
              />
            </div>
          </div>

          {/* ── Action buttons ───────────────────────────────── */}
          <div style={{ display: "flex", gap: "8px", marginTop: "18px" }}>
            <Link
              href={`/s/${slug}`}
              style={{
                flex: 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                padding: "11px 16px", borderRadius: "12px",
                background: C.creamLt, border: `1px solid ${C.sandLt}`,
                fontFamily: FONT.sans, fontSize: "12px", fontWeight: 600,
                color: C.body, textDecoration: "none",
                transition: "all 150ms",
              }}
            >
              👁 {t.my_public_page}
            </Link>
            <Link
              href="/build"
              style={{
                flex: 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                padding: "11px 16px", borderRadius: "12px",
                background: GRAD.flow, border: "none",
                fontFamily: FONT.sans, fontSize: "12px", fontWeight: 600,
                color: C.white, textDecoration: "none",
                boxShadow: "0 3px 12px rgba(34,160,107,0.2)",
              }}
            >
              ✏️ {t.my_edit}
            </Link>
          </div>
        </motion.div>

        {/* ── View my plans button ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4, ease }}
          style={{ marginTop: "16px" }}
        >
          <Link
            href="/my/plans"
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "16px 20px", borderRadius: "14px",
              background: C.white, border: `1px solid ${C.sandLt}`,
              textDecoration: "none",
              boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
              transition: "all 150ms",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: 36, height: 36, borderRadius: "10px",
                background: C.greenWash, border: `1px solid ${C.greenPale}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "16px",
              }}>
                📋
              </div>
              <div>
                <div style={{ fontFamily: FONT.sans, fontSize: "13px", fontWeight: 600, color: C.ink }}>
                  {lang === "sa" ? "My Besigheidsplanne" : "My Business Plans"}
                </div>
                <div style={{ fontFamily: FONT.sans, fontSize: "11px", color: C.muted, marginTop: 1 }}>
                  {lang === "sa" ? "Sien al jou 1-bladsy planne" : "View all your 1-page plans"}
                </div>
              </div>
            </div>
            <span style={{ fontFamily: FONT.sans, fontSize: "16px", color: C.sand }}>→</span>
          </Link>
        </motion.div>

        {/* ── Share URL ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4, ease }}
          style={{
            marginTop: "16px",
            display: "flex", alignItems: "center", gap: "8px",
            padding: "12px 16px", borderRadius: "14px",
            background: C.white, border: `1px solid ${C.sandLt}`,
          }}
        >
          <div style={{
            flex: 1, fontFamily: FONT.sans, fontSize: "13px", color: C.body,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            <span style={{ color: C.green, fontWeight: 600 }}>superpowers.org</span>
            <span style={{ color: C.muted }}>/s/{slug}</span>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={copyLink}
            style={{
              padding: "7px 14px", borderRadius: "8px",
              border: `1px solid ${copied ? C.greenPale : C.sandLt}`,
              background: copied ? C.greenWash : C.creamLt,
              fontFamily: FONT.sans, fontSize: "11px", fontWeight: 600,
              color: copied ? C.green : C.muted,
              cursor: "pointer", transition: "all 200ms", flexShrink: 0,
            }}
          >
            {copied ? (lang === "sa" ? "Gekopieer!" : "Copied!") : (lang === "sa" ? "Kopieer" : "Copy")}
          </motion.button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              lang === "sa"
                ? `Kyk na my Superpower profiel! 🔥 https://${shareUrl}`
                : `Check out my Superpower profile! 🔥 https://${shareUrl}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", gap: "4px",
              padding: "7px 14px", borderRadius: "8px",
              background: "#25D36612", border: "1px solid #25D36625",
              fontFamily: FONT.sans, fontSize: "11px", fontWeight: 600,
              color: "#25D366", textDecoration: "none", flexShrink: 0,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#25D366">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            {t.my_share}
          </a>
        </motion.div>

        {/* ── Profile sections checklist ─────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4, ease }}
          style={{ marginTop: "24px" }}
        >
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: "12px",
          }}>
            <span style={{
              fontFamily: FONT.sans, fontSize: "11px", fontWeight: 600,
              letterSpacing: "0.08em", textTransform: "uppercase" as const,
              color: C.muted,
            }}>
              {t.my_sections}
            </span>
            <span style={{ fontFamily: FONT.sans, fontSize: "11px", color: C.soft }}>
              {filledCount}/{sections.length} {t.my_filled}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {sections.map((s, i) => (
              <SectionCheck key={s.key} label={s.label} filled={s.filled} delay={0.3 + i * 0.05} />
            ))}
          </div>

          {filledCount < sections.length && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              style={{
                marginTop: "12px",
                padding: "10px 14px",
                borderRadius: "10px",
                background: C.orangeWash,
                border: `1px solid ${C.orangePale}`,
                fontFamily: FONT.sans,
                fontSize: "11px",
                color: C.orange,
                lineHeight: 1.5,
              }}
            >
              💡 {t.my_tip}
            </motion.div>
          )}
        </motion.div>

        {/* ── My First Week — interactive plan ──────────────── */}
        {profile.plan.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4, ease }}
            style={{ marginTop: "28px" }}
          >
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: "12px",
            }}>
              <span style={{
                fontFamily: FONT.sans, fontSize: "11px", fontWeight: 600,
                letterSpacing: "0.08em", textTransform: "uppercase" as const,
                color: C.muted, display: "flex", alignItems: "center", gap: "6px",
              }}>
                🚀 {t.my_plan_title}
              </span>
              <span style={{ fontFamily: FONT.sans, fontSize: "11px", color: C.soft }}>
                {planDoneCount}/{profile.plan.length}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {profile.plan.map((step, i) => (
                <PlanStep
                  key={i}
                  step={step}
                  index={i}
                  done={planDone[i] || false}
                  onToggle={() => togglePlan(i)}
                  delay={0.45 + i * 0.08}
                />
              ))}
            </div>

            {/* Celebrate when all done */}
            <AnimatePresence>
              {planDoneCount === profile.plan.length && profile.plan.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    marginTop: "12px",
                    padding: "14px 18px",
                    borderRadius: "12px",
                    background: C.greenWash,
                    border: `1px solid ${C.greenPale}`,
                    textAlign: "center",
                    fontFamily: FONT.sans,
                    fontSize: "13px",
                    fontWeight: 600,
                    color: C.green,
                  }}
                >
                  🎉 {lang === "sa" ? "Alles klaar! Jy het jou eerste week voltooi!" : "All done! You completed your first week!"}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Quick stats preview ───────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.4, ease }}
          style={{
            marginTop: "28px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "8px",
          }}
        >
          {[
            { label: lang === "sa" ? "Dienste" : "Services", value: `${profile.services.length}`, icon: "📋" },
            { label: lang === "sa" ? "Plan stappe" : "Plan steps", value: `${planDoneCount}/${profile.plan.length}`, icon: "🚀" },
            { label: lang === "sa" ? "Profiel" : "Profile", value: `${completionPct}%`, icon: "⚡" },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                padding: "16px 12px",
                borderRadius: "14px",
                background: C.white,
                border: `1px solid ${C.sandLt}`,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "18px", marginBottom: "6px" }}>{stat.icon}</div>
              <div style={{ fontFamily: FONT.sans, fontSize: "18px", fontWeight: 700, color: C.ink }}>
                {stat.value}
              </div>
              <div style={{ fontFamily: FONT.sans, fontSize: "10px", color: C.muted, marginTop: "2px" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Footer ───────────────────────────────────────────── */}
      <div
        style={{
          textAlign: "center",
          padding: "24px",
          borderTop: `1px solid ${C.sandLt}`,
          fontFamily: FONT.sans,
          fontSize: "11px",
          color: C.soft,
        }}
      >
        Built with{" "}
        <Link href="/" style={{ color: C.greenBr, fontWeight: 600, textDecoration: "none" }}>
          Superpowers
        </Link>
      </div>
    </div>
  );
}
