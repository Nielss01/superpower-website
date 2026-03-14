"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { C, GRAD, FONT } from "@/lib/tokens";
import { LANG, type Lang } from "@/lib/i18n";
import { OnePager } from "@/components/coach/OnePager";
import { fetchMyPlans, rowsToProfileData } from "@/lib/supabase/profile-queries";
import { EMPTY_PROFILE, type ProfileData } from "@/lib/types";

const ease = [0.22, 1, 0.36, 1] as const;

export default function MyPlansPage() {
  const [lang, setLang] = useState<Lang>("sa");
  const [plans, setPlans] = useState<ProfileData[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("sph-lang") as Lang | null;
    if (saved === "en" || saved === "sa") setLang(saved);

    // Try Supabase first
    fetchMyPlans()
      .then((results) => {
        if (results.length > 0) {
          setPlans(results.map(r => rowsToProfileData(r.profile, r.businessPlan)));
        } else {
          // Fall back to localStorage
          loadLocalPlan();
        }
        setLoading(false);
      })
      .catch(() => {
        loadLocalPlan();
        setLoading(false);
      });
  }, []);

  const loadLocalPlan = () => {
    try {
      const raw = localStorage.getItem("sph-profile");
      if (raw) {
        const data = { ...EMPTY_PROFILE, ...JSON.parse(raw) } as ProfileData;
        setPlans([data]);
      }
    } catch {}
  };

  const t = LANG[lang];

  if (!mounted || loading) {
    return (
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
  }

  return (
    <div style={{ minHeight: "100vh", background: C.cream }}>
      {/* ── Top bar ── */}
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
          <Link href="/my" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: FONT.sans, fontSize: "14px", color: C.muted }}>←</span>
            <span style={{ fontFamily: FONT.serif, fontSize: "18px", fontWeight: 400, color: C.ink }}>
              Superpowers
            </span>
          </Link>
          <div style={{ width: "1px", height: "20px", background: C.sand }} />
          <span style={{ fontFamily: FONT.sans, fontSize: "12px", fontWeight: 600, color: C.muted, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {lang === "sa" ? "My Besigheidsplanne" : "My Business Plans"}
          </span>
        </div>

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

      {/* ── Content ── */}
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "28px clamp(16px, 4vw, 40px) 60px" }}>

        {plans.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            style={{ textAlign: "center", padding: "60px 24px" }}
          >
            <div style={{
              width: 72, height: 72, borderRadius: "20px",
              background: C.creamLt, border: `1px solid ${C.sandLt}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px", fontSize: "32px",
            }}>
              📋
            </div>
            <h2 style={{ fontFamily: FONT.serif, fontSize: "24px", fontWeight: 400, color: C.ink, margin: "0 0 8px" }}>
              {lang === "sa" ? "Nog geen planne nie" : "No plans yet"}
            </h2>
            <p style={{ fontFamily: FONT.sans, fontSize: "14px", color: C.muted, lineHeight: 1.6, margin: "0 0 24px" }}>
              {lang === "sa" ? "Bou jou eerste besigheidsplan met die Kasi Coach." : "Build your first business plan with the Kasi Coach."}
            </p>
            <Link
              href="/build"
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                padding: "14px 28px", borderRadius: "999px",
                background: GRAD.flow, color: C.white,
                fontFamily: FONT.sans, fontSize: "14px", fontWeight: 600,
                textDecoration: "none", boxShadow: "0 6px 24px rgba(34,160,107,0.3)",
              }}
            >
              {lang === "sa" ? "Bou my eerste plan" : "Build my first plan"}
            </Link>
          </motion.div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {plans.map((plan, i) => {
              const ideaName = plan.idea
                ? lang === "sa" ? plan.idea.nameSA : plan.idea.name
                : "Business";
              const title = plan.name ? `${plan.name}'s ${ideaName}` : ideaName;

              return (
                <motion.div
                  key={plan.slug || i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5, ease }}
                >
                  {/* Plan card header */}
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    marginBottom: "12px",
                  }}>
                    <h2 style={{
                      fontFamily: FONT.serif, fontSize: "18px", fontWeight: 400,
                      color: C.ink, margin: 0,
                    }}>
                      {title}
                    </h2>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {plan.slug && (
                        <Link
                          href={`/s/${plan.slug}`}
                          style={{
                            padding: "5px 12px", borderRadius: "8px",
                            background: C.creamLt, border: `1px solid ${C.sandLt}`,
                            fontFamily: FONT.sans, fontSize: "11px", fontWeight: 600,
                            color: C.muted, textDecoration: "none",
                          }}
                        >
                          {lang === "sa" ? "Sien profiel" : "View profile"}
                        </Link>
                      )}
                      <Link
                        href="/build"
                        style={{
                          padding: "5px 12px", borderRadius: "8px",
                          background: C.greenWash, border: `1px solid ${C.greenPale}`,
                          fontFamily: FONT.sans, fontSize: "11px", fontWeight: 600,
                          color: C.green, textDecoration: "none",
                        }}
                      >
                        {lang === "sa" ? "Wysig" : "Edit"}
                      </Link>
                    </div>
                  </div>

                  {/* The OnePager */}
                  <div style={{
                    borderRadius: "16px",
                    overflow: "hidden",
                    border: `1px solid ${C.sandLt}`,
                    background: C.white,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                  }}>
                    <OnePager profile={plan} lang={lang} completion={100} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div
        style={{
          textAlign: "center", padding: "24px",
          borderTop: `1px solid ${C.sandLt}`,
          fontFamily: FONT.sans, fontSize: "11px", color: C.soft,
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
