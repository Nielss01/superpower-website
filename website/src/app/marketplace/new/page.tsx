"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { C, FONT } from "@/lib/tokens";
import { LANG, type Lang } from "@/lib/i18n";
import { MARKETPLACE_CATEGORY_META, type MarketplaceCategory } from "@/lib/marketplace-data";
import { createClient } from "@/lib/supabase/client";

const ease = [0.22, 1, 0.36, 1] as const;
const ALL_CATEGORIES = Object.keys(MARKETPLACE_CATEGORY_META) as MarketplaceCategory[];

// ── Lang toggle (copied from marketplace page) ────────────────────────────────
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

// ── Field ─────────────────────────────────────────────────────────────────────
function Field({
  label, value, onChange, placeholder, multiline = false, required = false,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; multiline?: boolean; required?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const shared: React.CSSProperties = {
    width: "100%", padding: "12px 14px", borderRadius: "12px",
    border: `1.5px solid ${focused ? C.greenBr : C.sand}`,
    background: C.white, fontFamily: FONT.sans, fontSize: "14px",
    color: C.ink, outline: "none",
    boxShadow: focused ? `0 0 0 3px ${C.greenBr}22` : "none",
    transition: "border-color 200ms, box-shadow 200ms",
    boxSizing: "border-box" as const,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontFamily: FONT.sans, fontSize: "12px", fontWeight: 600, color: C.muted, letterSpacing: "0.06em", textTransform: "uppercase" }}>
        {label}{required && <span style={{ color: C.pinkBr, marginLeft: "3px" }}>*</span>}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          style={{ ...shared, resize: "vertical" }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={shared}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// NEW LISTING PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function NewListingPage() {
  const [lang, setLang] = useState<Lang>("sa");
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  // Form fields
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [services, setServices] = useState("");
  const [location, setLocation] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [category, setCategory] = useState<MarketplaceCategory>("Services");

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("sph-lang") as Lang | null;
    if (saved === "en" || saved === "sa") setLang(saved);

    // Redirect to marketplace if not authenticated
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/marketplace?signin=1");
      }
    });
  }, [router]);

  useEffect(() => {
    if (mounted) localStorage.setItem("sph-lang", lang);
  }, [lang, mounted]);

  const t = LANG[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !tagline.trim() || !category) return;
    setSubmitting(true);

    // TODO: persist to Supabase marketplace_profiles table
    // For now, just simulate a short delay
    await new Promise((r) => setTimeout(r, 800));

    setSubmitting(false);
    setDone(true);
  };

  if (!mounted) return null;

  const catMeta = MARKETPLACE_CATEGORY_META[category];

  return (
    <div style={{ background: C.cream, fontFamily: FONT.sans, minHeight: "100vh", overflowX: "hidden" }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "sticky", top: 0, zIndex: 50,
          background: "rgba(237,233,224,0.88)",
          backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
          borderBottom: `1px solid ${C.sand}`,
        }}
      >
        <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 clamp(20px, 4vw, 48px)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "56px" }}>
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
                {t.market_new_title}
              </span>
            </div>
            <LangToggle lang={lang} setLang={setLang} />
          </div>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "48px clamp(20px, 4vw, 48px) 80px" }}>

        <AnimatePresence mode="wait">
          {done ? (
            /* ── Success state ──────────────────────────────────────────── */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease }}
              style={{ textAlign: "center", padding: "60px 20px" }}
            >
              <div style={{ fontSize: "64px", marginBottom: "24px" }}>🎉</div>
              <h2 style={{ fontFamily: FONT.serif, fontSize: "clamp(28px, 5vw, 40px)", color: C.ink, fontWeight: 400, margin: "0 0 12px", letterSpacing: "-0.02em" }}>
                {t.market_new_success}
              </h2>
              <p style={{ fontFamily: FONT.sans, fontSize: "15px", color: C.muted, lineHeight: 1.7, margin: "0 0 32px" }}>
                {t.market_new_success_sub}
              </p>
              <Link
                href="/marketplace"
                style={{
                  display: "inline-block", padding: "14px 28px", borderRadius: "999px",
                  background: C.green, color: C.white,
                  fontFamily: FONT.sans, fontSize: "15px", fontWeight: 600,
                  textDecoration: "none", boxShadow: `0 6px 24px ${C.green}40`,
                }}
              >
                {t.market_back_list}
              </Link>
            </motion.div>
          ) : (
            /* ── Form ───────────────────────────────────────────────────── */
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease }}
              style={{ display: "flex", flexDirection: "column", gap: "24px" }}
            >
              {/* Intro */}
              <div style={{ marginBottom: "8px" }}>
                <p style={{ fontFamily: FONT.sans, fontSize: "15px", color: C.muted, lineHeight: 1.7, margin: 0 }}>
                  {t.market_new_sub}
                </p>
              </div>

              <Field label={t.market_new_name} value={name} onChange={setName} placeholder="e.g. Zara Creative Studio" required />
              <Field label={t.market_new_tagline} value={tagline} onChange={setTagline} placeholder="e.g. Bold African designs for bold people" required />
              <Field label={t.market_new_desc} value={description} onChange={setDescription} placeholder="Tell customers about your business..." multiline />
              <Field label={t.market_new_services} value={services} onChange={setServices} placeholder="List the services you offer..." multiline />
              <Field label={t.market_new_location} value={location} onChange={setLocation} placeholder="e.g. Woodstock, Cape Town" />
              <Field label={t.market_new_whatsapp} value={whatsapp} onChange={setWhatsapp} placeholder="e.g. 0721234567" />

              {/* Category */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontFamily: FONT.sans, fontSize: "12px", fontWeight: 600, color: C.muted, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {t.market_new_cat} <span style={{ color: C.pinkBr }}>*</span>
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {ALL_CATEGORIES.map((cat) => {
                    const meta = MARKETPLACE_CATEGORY_META[cat];
                    const active = category === cat;
                    return (
                      <motion.button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: "6px",
                          padding: "8px 14px", borderRadius: "999px",
                          border: active ? "none" : `1px solid ${C.sand}`,
                          background: active ? meta.color : C.white,
                          color: active ? C.white : C.body,
                          fontFamily: FONT.sans, fontSize: "13px", fontWeight: 500,
                          cursor: "pointer",
                          boxShadow: active ? `0 4px 16px ${meta.color}30` : "0 1px 4px rgba(0,0,0,0.04)",
                          transition: "all 200ms",
                        }}
                      >
                        <span>{meta.emoji}</span>
                        <span>{cat}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={submitting || !name.trim() || !tagline.trim()}
                whileHover={{ scale: submitting ? 1 : 1.02 }}
                whileTap={{ scale: submitting ? 1 : 0.98 }}
                style={{
                  padding: "16px 32px", borderRadius: "999px",
                  background: submitting || !name.trim() || !tagline.trim() ? C.sand : C.green,
                  color: submitting || !name.trim() || !tagline.trim() ? C.muted : C.white,
                  fontFamily: FONT.sans, fontSize: "16px", fontWeight: 600,
                  border: "none", cursor: submitting ? "wait" : "pointer",
                  boxShadow: name.trim() && tagline.trim() ? `0 6px 24px ${C.green}40` : "none",
                  transition: "background 200ms, color 200ms, box-shadow 200ms",
                  marginTop: "8px",
                }}
              >
                {submitting ? "..." : t.market_new_submit}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
