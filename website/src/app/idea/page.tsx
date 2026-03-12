"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import OrgBlob from "@/components/design/OrgBlob";
import { C, GRAD, FONT } from "@/lib/tokens";
import { LANG, type Lang } from "@/lib/i18n";
import { CATEGORY_META, type Category } from "@/lib/ideas";

// ── Animation presets ────────────────────────────────────────────────────────
const ease = [0.22, 1, 0.36, 1] as const;

const CATEGORIES: Category[] = ["business", "community", "learn", "creative", "tech"];

// ══════════════════════════════════════════════════════════════════════════════
// IDEA PAGE — Path A — "I have an idea"
// ══════════════════════════════════════════════════════════════════════════════
export default function IdeaPage() {
  const [lang, setLang] = useState<Lang>("sa");
  const [text, setText] = useState("");
  const [category, setCategory] = useState<Category | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const t = LANG[lang];

  // Persist language
  useEffect(() => {
    const saved = localStorage.getItem("sph-lang") as Lang | null;
    if (saved === "en" || saved === "sa") setLang(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem("sph-lang", lang);
  }, [lang]);

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.max(120, el.scrollHeight) + "px";
  }, [text]);

  const canProceed = text.trim().length >= 10;

  const handleNext = () => {
    if (!canProceed) return;
    // Store the custom idea text + category in localStorage for the build page
    localStorage.setItem("sph-custom-idea", text.trim());
    if (category) localStorage.setItem("sph-custom-category", category);
    // Navigate to build with path=a
    window.location.href = `/build?path=a${category ? `&category=${category}` : ""}`;
  };

  return (
    <div
      style={{
        background: C.cream,
        fontFamily: FONT.sans,
        minHeight: "100vh",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      {/* ── Decorative blobs ─────────────────────────────────────────────── */}
      <div
        style={{
          position: "fixed",
          top: -100,
          right: -80,
          width: "clamp(320px, 45vw, 580px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <OrgBlob variant={3} color={C.pinkBr} opacity={0.07} />
      </div>
      <div
        style={{
          position: "fixed",
          bottom: -120,
          left: -100,
          width: "clamp(300px, 40vw, 520px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <OrgBlob variant={5} color={C.greenBr} opacity={0.05} />
      </div>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(237,233,224,0.88)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: `1px solid ${C.sand}`,
        }}
      >
        <div
          style={{
            maxWidth: "720px",
            margin: "0 auto",
            padding: "0 clamp(20px, 4vw, 48px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "56px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontFamily: FONT.sans,
                fontSize: "13px",
                fontWeight: 500,
                color: C.muted,
                textDecoration: "none",
              }}
            >
              <span style={{ fontSize: "16px" }}>←</span>
              {t.idea_back}
            </Link>
            <div style={{ width: "1px", height: "20px", background: C.sand }} />
            <Link href="/" style={{ textDecoration: "none" }}>
              <span
                style={{
                  fontFamily: FONT.serif,
                  fontSize: "18px",
                  fontWeight: 400,
                  color: C.ink,
                }}
              >
                Superpowers
              </span>
            </Link>
          </div>

          {/* Lang toggle */}
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
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: "620px",
          margin: "0 auto",
          padding: "0 clamp(20px, 4vw, 48px)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Hero text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          style={{ paddingTop: "56px", paddingBottom: "8px" }}
        >
          {/* Label */}
          <div
            style={{
              fontFamily: FONT.sans,
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.12em",
              color: C.soft,
              marginBottom: "16px",
            }}
          >
            {t.idea_label}
          </div>

          <h1
            style={{
              fontFamily: FONT.serif,
              fontSize: "clamp(36px, 5.5vw, 52px)",
              fontWeight: 400,
              color: C.ink,
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
              margin: "0 0 16px",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={`title-${lang}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                style={{ display: "block" }}
              >
                {t.idea_title}
              </motion.span>
            </AnimatePresence>
          </h1>

          <p
            style={{
              fontFamily: FONT.sans,
              fontSize: "15px",
              color: C.muted,
              lineHeight: 1.7,
              margin: "0 0 36px",
            }}
          >
            {t.idea_sub}
          </p>
        </motion.div>

        {/* ── Textarea ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease }}
          style={{ position: "relative", marginBottom: "32px" }}
        >
          <div
            style={{
              padding: "2px",
              borderRadius: "20px",
              background: text.length >= 10 ? GRAD.cool : C.sand,
              transition: "background 400ms",
              boxShadow: text.length >= 10
                ? `0 8px 32px ${C.greenBr}18`
                : "0 2px 12px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                background: C.creamLt,
                borderRadius: "18px",
                padding: "24px 24px 40px",
                position: "relative",
              }}
            >
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t.idea_placeholder}
                autoFocus
                style={{
                  width: "100%",
                  minHeight: "120px",
                  resize: "none",
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontFamily: FONT.serif,
                  fontSize: "clamp(18px, 2.5vw, 22px)",
                  fontWeight: 400,
                  color: C.ink,
                  lineHeight: 1.6,
                  letterSpacing: "-0.01em",
                }}
              />

              {/* Character count */}
              <div
                style={{
                  position: "absolute",
                  bottom: "14px",
                  right: "20px",
                  fontFamily: FONT.sans,
                  fontSize: "11px",
                  fontWeight: 500,
                  color: text.length >= 10 ? C.greenBr : C.soft,
                  transition: "color 300ms",
                }}
              >
                {text.length} {t.idea_chars}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Category quick-picks ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25, ease }}
          style={{ marginBottom: "40px" }}
        >
          <div
            style={{
              fontFamily: FONT.sans,
              fontSize: "12px",
              fontWeight: 500,
              color: C.muted,
              marginBottom: "14px",
            }}
          >
            {t.idea_category}
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            {CATEGORIES.map((cat) => {
              const meta = CATEGORY_META[cat];
              const active = category === cat;
              return (
                <motion.button
                  key={cat}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setCategory(active ? null : cat)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "7px",
                    padding: "10px 18px",
                    borderRadius: "999px",
                    border: active ? "none" : `1px solid ${C.sand}`,
                    background: active ? meta.color : C.white,
                    color: active ? C.white : C.body,
                    fontFamily: FONT.sans,
                    fontSize: "13px",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "background 250ms, color 250ms, border 250ms",
                    boxShadow: active
                      ? `0 4px 16px ${meta.color}30`
                      : "0 1px 4px rgba(0,0,0,0.04)",
                  }}
                >
                  <span style={{ fontSize: "15px" }}>{meta.emoji}</span>
                  <span>{lang === "sa" ? meta.labelSA : meta.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* ── CTA Button ───────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35, ease }}
          style={{ paddingBottom: "80px" }}
        >
          <motion.button
            whileHover={canProceed ? { scale: 1.03 } : {}}
            whileTap={canProceed ? { scale: 0.97 } : {}}
            onClick={handleNext}
            disabled={!canProceed}
            style={{
              width: "100%",
              padding: "16px 32px",
              borderRadius: "999px",
              border: "none",
              background: canProceed ? GRAD.flow : C.sand,
              color: canProceed ? "white" : C.muted,
              fontFamily: FONT.sans,
              fontSize: "15px",
              fontWeight: 500,
              cursor: canProceed ? "pointer" : "default",
              transition: "background 400ms, color 300ms",
              boxShadow: canProceed
                ? "0 8px 32px rgba(34,160,107,0.3)"
                : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            {t.idea_cta}
            <motion.span
              animate={{ x: canProceed ? 0 : -4, opacity: canProceed ? 1 : 0.4 }}
              transition={{ duration: 0.2 }}
            >
              →
            </motion.span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
