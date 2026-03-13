"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import OrgBlob from "@/components/design/OrgBlob";
import { C, GRAD, FONT } from "@/lib/tokens";
import { LANG, type Lang } from "@/lib/i18n";
import { CATEGORY_META, type Category } from "@/lib/ideas";

// ── Types (matches build page) ──────────────────────────────────────────────
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

// ── Section label ───────────────────────────────────────────────────────────
function SectionLabel({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: "7px",
        fontFamily: FONT.sans, fontSize: "11px", fontWeight: 600,
        letterSpacing: "0.08em", textTransform: "uppercase" as const,
        color: C.muted, marginBottom: "14px",
      }}
    >
      <span style={{ fontSize: "13px" }}>{icon}</span>
      {children}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PUBLIC SUPERPOWER PAGE — /s/[slug]
// ══════════════════════════════════════════════════════════════════════════════
export default function SuperpowerPage() {
  const [lang, setLang] = useState<Lang>("sa");
  const [profile, setProfile] = useState<SavedProfile | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("sph-lang") as Lang | null;
    if (saved === "en" || saved === "sa") setLang(saved);

    try {
      const raw = localStorage.getItem("sph-profile");
      if (raw) setProfile(JSON.parse(raw));
    } catch {}
  }, []);

  if (!mounted) return null;

  if (!profile) {
    return (
      <div style={{
        minHeight: "100vh", background: C.cream, display: "flex",
        alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px",
      }}>
        <div style={{ fontSize: "40px", opacity: 0.3 }}>⚡</div>
        <div style={{ fontFamily: FONT.sans, fontSize: "14px", color: C.muted }}>
          {lang === "sa" ? "Superpower nie gevind nie" : "Superpower not found"}
        </div>
        <Link href="/" style={{
          fontFamily: FONT.sans, fontSize: "13px", color: C.green,
          textDecoration: "none", fontWeight: 500,
        }}>
          ← {lang === "sa" ? "Terug na tuisblad" : "Back to home"}
        </Link>
      </div>
    );
  }

  const t = LANG[lang];
  const ideaName = profile.idea
    ? lang === "sa" ? profile.idea.nameSA : profile.idea.name
    : "Business";
  const meta = profile.idea ? CATEGORY_META[profile.idea.category] : null;
  const businessName = profile.name ? `${profile.name}'s ${ideaName}` : ideaName;

  return (
    <div style={{ minHeight: "100vh", background: C.cream, position: "relative" }}>

      {/* Background blobs */}
      <div style={{ position: "fixed", top: -120, right: -80, width: 350, opacity: 0.04, pointerEvents: "none" }}>
        <OrgBlob variant={1} color={C.greenBr} />
      </div>
      <div style={{ position: "fixed", bottom: -60, left: -100, width: 300, opacity: 0.03, pointerEvents: "none" }}>
        <OrgBlob variant={3} color={C.pinkBr} />
      </div>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div
        style={{
          background: meta
            ? `linear-gradient(160deg, ${meta.color}15 0%, ${C.cream} 50%, ${C.oceanBr}08 100%)`
            : C.creamLt,
          padding: "0 0 48px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle colored bar top */}
        <div style={{ height: "4px", background: GRAD.flow }} />

        {/* Top bar */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "16px clamp(20px, 5vw, 48px)",
          maxWidth: "680px", margin: "0 auto",
        }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{ fontFamily: FONT.serif, fontSize: "18px", color: C.ink }}>
              Superpowers
            </span>
          </Link>
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

        {/* Profile header */}
        <div style={{ maxWidth: "680px", margin: "0 auto", padding: "16px clamp(20px, 5vw, 48px) 0" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}
          >
            {/* Avatar */}
            <div
              style={{
                width: 80, height: 80, borderRadius: "22px",
                background: profile.photoUrl
                  ? `url(${profile.photoUrl}) center/cover`
                  : meta ? `linear-gradient(135deg, ${meta.color}, ${C.oceanBr})` : C.sand,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "32px", color: C.white, fontFamily: FONT.serif,
                flexShrink: 0,
                border: `4px solid ${C.white}`,
                boxShadow: "0 6px 24px rgba(0,0,0,0.1)",
              }}
            >
              {!profile.photoUrl && (profile.name ? profile.name[0].toUpperCase() : profile.idea?.emoji || "⚡")}
            </div>

            <div>
              {/* Business name */}
              <h1 style={{
                fontFamily: FONT.serif, fontSize: "clamp(24px, 5vw, 32px)",
                fontWeight: 400, color: C.ink, lineHeight: 1.15, margin: 0,
              }}>
                {businessName}
              </h1>

              {/* Location */}
              {profile.wijk && (
                <div style={{
                  fontFamily: FONT.sans, fontSize: "13px", color: C.muted,
                  marginTop: "6px", display: "flex", alignItems: "center", gap: "5px",
                }}>
                  📍 {profile.wijk}, South Africa
                </div>
              )}

              {/* Tagline */}
              {profile.tagline && (
                <div style={{
                  fontFamily: FONT.serif, fontSize: "14px", fontStyle: "italic",
                  color: C.body, marginTop: "10px", lineHeight: 1.5,
                }}>
                  &ldquo;{profile.tagline}&rdquo;
                </div>
              )}

              {/* Badges */}
              <div style={{ display: "flex", gap: "6px", marginTop: "12px", flexWrap: "wrap" }}>
                {meta && (
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: "4px",
                    padding: "4px 10px", borderRadius: "8px",
                    background: `${meta.color}12`, fontFamily: FONT.sans,
                    fontSize: "10px", fontWeight: 600, textTransform: "uppercase" as const,
                    color: meta.color, letterSpacing: "0.04em",
                  }}>
                    {profile.idea?.emoji} {lang === "sa" ? meta.labelSA : meta.label}
                  </span>
                )}
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: "4px",
                  padding: "4px 10px", borderRadius: "8px",
                  background: C.greenWash, fontFamily: FONT.sans,
                  fontSize: "10px", fontWeight: 600, color: C.green,
                }}>
                  ✓ Superpower Hub
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Body sections ────────────────────────────────────────── */}
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "0 clamp(20px, 5vw, 48px) 60px" }}>

        {/* Services */}
        {profile.services.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease }}
            style={{ marginTop: "36px" }}
          >
            <SectionLabel icon="📋">{t.bou_services}</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" }}>
              {profile.services.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  style={{
                    padding: "16px", borderRadius: "14px",
                    background: C.white, border: `1px solid ${C.sandLt}`,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: s.description ? "8px" : "0" }}>
                    <span style={{ fontFamily: FONT.sans, fontSize: "14px", fontWeight: 600, color: C.ink }}>{s.name}</span>
                    <span style={{
                      fontFamily: FONT.sans, fontSize: "14px", fontWeight: 700,
                      color: C.green, background: C.greenWash,
                      padding: "3px 10px", borderRadius: "8px",
                    }}>{s.price}</span>
                  </div>
                  {s.description && (
                    <div style={{ fontFamily: FONT.sans, fontSize: "12px", color: C.muted, lineHeight: 1.5 }}>
                      {s.description}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* About */}
        {profile.bio && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5, ease }}
            style={{ marginTop: "32px" }}
          >
            <SectionLabel icon="💬">{t.bou_about}</SectionLabel>
            <div style={{
              fontFamily: FONT.sans, fontSize: "14px", color: C.body, lineHeight: 1.8,
            }}>
              {profile.bio}
            </div>
          </motion.div>
        )}

        {/* My Story */}
        {profile.story && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5, ease }}
            style={{ marginTop: "32px" }}
          >
            <SectionLabel icon="✦">{t.bou_story}</SectionLabel>
            <div style={{
              padding: "18px 22px", borderRadius: "14px",
              background: C.creamLt, borderLeft: `4px solid ${C.greenBr}`,
              fontFamily: FONT.sans, fontSize: "14px", color: C.body,
              lineHeight: 1.8, fontStyle: "italic",
            }}>
              &ldquo;{profile.story}&rdquo;
            </div>
          </motion.div>
        )}

        {/* My First Week */}
        {profile.plan.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5, ease }}
            style={{ marginTop: "32px" }}
          >
            <SectionLabel icon="🚀">{t.bou_plan}</SectionLabel>
            <div style={{ paddingLeft: "32px", position: "relative" }}>
              <div style={{
                position: "absolute", left: "11px", top: "14px", bottom: "14px",
                width: "2px", background: C.greenPale,
              }} />
              {profile.plan.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  style={{
                    marginBottom: i < profile.plan.length - 1 ? "16px" : "0",
                    fontFamily: FONT.sans, fontSize: "14px", color: C.body,
                    lineHeight: 1.6, position: "relative",
                  }}
                >
                  <span style={{
                    position: "absolute", left: "-32px", top: "2px",
                    width: 22, height: 22, borderRadius: "50%",
                    background: C.green, color: C.white,
                    fontSize: "11px", fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 1, boxShadow: "0 2px 6px rgba(26,107,74,0.25)",
                  }}>
                    {i + 1}
                  </span>
                  {step}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Availability + Promises side by side */}
        {(profile.availability || profile.promise) && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5, ease }}
            style={{
              marginTop: "32px",
              display: "grid",
              gridTemplateColumns: profile.availability && profile.promise ? "1fr 1fr" : "1fr",
              gap: "20px",
            }}
          >
            {profile.availability && (
              <div>
                <SectionLabel icon="🕐">{t.bou_availability}</SectionLabel>
                <div style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "12px 16px", borderRadius: "12px",
                  background: C.white, border: `1px solid ${C.sandLt}`,
                  fontFamily: FONT.sans, fontSize: "13px", fontWeight: 500, color: C.body,
                }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: C.greenBr, flexShrink: 0,
                    boxShadow: "0 0 0 3px rgba(34,160,107,0.15)",
                  }} />
                  {profile.availability}
                </div>
              </div>
            )}
            {profile.promise && (
              <div>
                <SectionLabel icon="✨">{t.bou_promise}</SectionLabel>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {profile.promise.split(",").map((p, i) => (
                    <span
                      key={i}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: "4px",
                        padding: "6px 12px", borderRadius: "8px",
                        background: C.greenWash, border: `1px solid ${C.greenPale}`,
                        fontFamily: FONT.sans, fontSize: "11px", fontWeight: 500, color: C.green,
                      }}
                    >
                      ✓ {p.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Actions: Edit / Keep chatting ───────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{
            marginTop: "40px",
            padding: "20px 24px",
            borderRadius: "16px",
            background: C.white,
            border: `1px solid ${C.sandLt}`,
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FONT.sans, fontSize: "13px", fontWeight: 600, color: C.ink, marginBottom: "3px" }}>
              {lang === "sa" ? "Hou aan bou" : "Keep building"}
            </div>
            <div style={{ fontFamily: FONT.sans, fontSize: "11px", color: C.muted, lineHeight: 1.5 }}>
              {lang === "sa"
                ? "Gaan na jou dashboard om jou Superpower te bestuur."
                : "Go to your dashboard to manage your Superpower."}
            </div>
          </div>
          <Link
            href="/my"
            style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "10px 20px", borderRadius: "999px",
              background: GRAD.flow, color: C.white,
              fontFamily: FONT.sans, fontSize: "12px", fontWeight: 600,
              textDecoration: "none", flexShrink: 0,
              boxShadow: "0 3px 12px rgba(34,160,107,0.2)",
            }}
          >
            ⚡ {lang === "sa" ? "My Dashboard" : "My Dashboard"}
          </Link>
        </motion.div>
      </div>

      {/* ── Footer ───────────────────────────────────────────────── */}
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
        </Link>{" "}
        —{" "}
        <Link href="/" style={{ color: C.green, textDecoration: "none" }}>
          {lang === "sa" ? "begin joune gratis" : "start yours free"}
        </Link>
      </div>
    </div>
  );
}
