"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import OrgBlob from "@/components/design/OrgBlob";
import HeroLandscape from "@/components/design/HeroLandscape";
import { C, GRAD, FONT } from "@/lib/tokens";
import { LANG, type Lang } from "@/lib/i18n";

// ── Ease / animation presets ──────────────────────────────────────────────────
const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } },
};

// ── Radius ────────────────────────────────────────────────────────────────────
const R = { sm: "8px", md: "12px", lg: "16px", xl: "20px", full: "999px" };

// ── Language Toggle ───────────────────────────────────────────────────────────
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
        borderRadius: R.full,
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

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("sph-profile");
      if (raw) {
        const data = JSON.parse(raw);
        if (data.name) setHasProfile(true);
      }
    } catch {}
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease } }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "0 clamp(20px, 4vw, 48px)",
        height: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: scrolled ? "rgba(237,233,224,0.88)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? `1px solid ${C.sand}` : "1px solid transparent",
        transition: "background 300ms, border-color 300ms",
      }}
    >
      {/* Wordmark — pure typographic logo per brand book */}
      <Link href="/" style={{ textDecoration: "none" }}>
        <span
          style={{
            fontFamily: FONT.serif,
            fontSize: "22px",
            fontWeight: 400,
            color: C.ink,
            letterSpacing: "-0.01em",
            lineHeight: 1,
          }}
        >
          Superpowers
        </span>
      </Link>

      {/* Right nav */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {hasProfile && (
          <Link
            href="/my"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "6px 14px",
              borderRadius: "999px",
              background: C.greenWash,
              border: `1px solid ${C.greenPale}`,
              fontFamily: FONT.sans,
              fontSize: "12px",
              fontWeight: 600,
              color: C.green,
              textDecoration: "none",
              transition: "background 200ms",
            }}
          >
            ⚡ {lang === "sa" ? "My Besighede" : "My Businesses"}
          </Link>
        )}
        <LangToggle lang={lang} setLang={setLang} />
      </div>
    </motion.nav>
  );
}

// ── Path Card ─────────────────────────────────────────────────────────────────
interface PathCardProps {
  icon: string;
  label: string;
  sub: string;
  color: string;
  wash: string;
  href: string;
  rotation: number;
}

function PathCard({ icon, label, sub, color, wash, href, rotation }: PathCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      variants={fadeUp}
      animate={{ rotate: hovered ? 0 : rotation }}
      whileHover={{ y: -6, scale: 1.02, rotate: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      style={{ transformOrigin: "center bottom" }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <Link href={href} style={{ textDecoration: "none", display: "block" }}>
        {/* Gradient border wrapper */}
        <div
          style={{
            padding: hovered ? "2px" : "1px",
            borderRadius: "20px",
            background: hovered ? GRAD.flow : C.sand,
            transition: "background 300ms, padding 200ms",
            boxShadow: hovered
              ? "0 20px 60px rgba(0,0,0,0.12)"
              : "0 2px 12px rgba(0,0,0,0.04)",
            transition2: "box-shadow 300ms",
          } as React.CSSProperties}
        >
          <div
            style={{
              background: C.white,
              borderRadius: "18px",
              padding: "28px 24px 24px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* Background blob inside card */}
            <div
              style={{
                position: "absolute",
                top: -40,
                right: -40,
                width: 190,
                opacity: hovered ? 1 : 0.4,
                transition: "opacity 350ms",
                pointerEvents: "none",
              }}
            >
              <OrgBlob variant={2} color={color} opacity={0.13} />
            </div>

            {/* Icon */}
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "16px",
                background: hovered ? color : wash,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                marginBottom: "20px",
                transition: "background 250ms",
                position: "relative",
                zIndex: 1,
              }}
            >
              {icon}
            </div>

            {/* Text */}
            <div style={{ position: "relative", zIndex: 1 }}>
              <div
                style={{
                  fontFamily: FONT.serif,
                  fontSize: "21px",
                  fontWeight: 400,
                  color: hovered ? color : C.ink,
                  lineHeight: 1.25,
                  marginBottom: "8px",
                  transition: "color 250ms",
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontFamily: FONT.sans,
                  fontSize: "13px",
                  color: C.muted,
                  lineHeight: 1.6,
                  marginBottom: "20px",
                }}
              >
                {sub}
              </div>

              {/* CTA row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  fontFamily: FONT.sans,
                  fontSize: "12px",
                  fontWeight: 500,
                  color: hovered ? color : C.faint,
                  transition: "color 250ms",
                }}
              >
                <span>Choose this</span>
                <motion.span
                  animate={{ x: hovered ? 4 : 0 }}
                  transition={{ duration: 0.18 }}
                >
                  →
                </motion.span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ── Step Card ─────────────────────────────────────────────────────────────────
interface StepCardProps {
  num: string;
  title: string;
  body: string;
  accentColor: string;
  blobVariant: 1 | 2 | 3 | 4 | 5 | 6;
}

function StepCard({ num, title, body, accentColor, blobVariant }: StepCardProps) {
  return (
    <motion.div variants={fadeUp} style={{ position: "relative" }}>
      <div
        style={{
          position: "absolute",
          top: -24,
          right: -16,
          width: 160,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <OrgBlob variant={blobVariant} color={accentColor} opacity={0.1} />
      </div>
      <div
        style={{
          background: C.white,
          borderRadius: "20px",
          padding: "32px 28px 28px",
          border: `1px solid ${C.sand}`,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Ghost step number */}
        <div
          style={{
            fontFamily: FONT.serif,
            fontSize: "76px",
            fontWeight: 400,
            fontStyle: "italic",
            lineHeight: 1,
            color: accentColor,
            opacity: 0.13,
            position: "absolute",
            top: 10,
            right: 18,
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          {num}
        </div>

        <div
          style={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: accentColor,
            marginBottom: "20px",
          }}
        />
        <div
          style={{
            fontFamily: FONT.serif,
            fontSize: "23px",
            fontWeight: 400,
            color: C.ink,
            lineHeight: 1.25,
            marginBottom: "12px",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: FONT.sans,
            fontSize: "14px",
            color: C.muted,
            lineHeight: 1.7,
          }}
        >
          {body}
        </div>
      </div>
    </motion.div>
  );
}

// ── Profile Card (demo) ───────────────────────────────────────────────────────
interface ProfileCardProps {
  name: string;
  wijk: string;
  tag: string;
  bio: string;
  accentColor: string;
  avatarGrad: string;
  initials: string;
}

function ProfileCard({
  name, wijk, tag, bio, accentColor, avatarGrad, initials,
}: ProfileCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      variants={fadeUp}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <div
        style={{
          padding: hovered ? "2px" : "1px",
          borderRadius: "22px",
          background: hovered ? GRAD.flow : C.sand,
          transition: "background 300ms, padding 200ms",
          boxShadow: hovered ? "0 16px 48px rgba(0,0,0,0.1)" : "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            background: C.white,
            borderRadius: "20px",
            padding: "24px 24px 20px",
            paddingTop: "48px",
            position: "relative",
          }}
        >
          {/* Live badge */}
          <div
            style={{
              position: "absolute",
              top: "14px",
              right: "14px",
              background: C.greenWash,
              color: C.green,
              fontFamily: FONT.sans,
              fontSize: "10px",
              fontWeight: 500,
              padding: "3px 8px",
              borderRadius: "999px",
            }}
          >
            ✓ Live
          </div>

          {/* Avatar — collage overhang */}
          <div
            style={{
              position: "absolute",
              top: -28,
              left: 22,
              width: 56,
              height: 56,
              borderRadius: "999px",
              background: avatarGrad,
              border: `3px solid ${C.white}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              fontWeight: 600,
              color: C.white,
              fontFamily: FONT.sans,
              boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
              zIndex: 2,
            }}
          >
            {initials}
          </div>

          {/* Tag */}
          <div
            style={{
              display: "inline-block",
              background: accentColor + "18",
              color: accentColor,
              fontFamily: FONT.sans,
              fontSize: "10px",
              fontWeight: 500,
              letterSpacing: "0.06em",
              textTransform: "uppercase" as const,
              padding: "3px 10px",
              borderRadius: "999px",
              marginBottom: "8px",
            }}
          >
            {tag}
          </div>

          <div
            style={{
              fontFamily: FONT.serif,
              fontSize: "18px",
              fontWeight: 400,
              color: C.ink,
              lineHeight: 1.3,
              marginBottom: "5px",
            }}
          >
            {name}
          </div>

          <div
            style={{
              fontFamily: FONT.sans,
              fontSize: "12px",
              color: C.muted,
              marginBottom: "12px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span>📍</span>
            <span>{wijk}, South Africa</span>
          </div>

          <div
            style={{
              fontFamily: FONT.sans,
              fontSize: "13px",
              color: C.body,
              lineHeight: 1.6,
              marginBottom: "16px",
            }}
          >
            {bio}
          </div>

          {/* WhatsApp button */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 14px",
              background: hovered ? "#25D366" : C.sandLt,
              borderRadius: "12px",
              transition: "background 250ms",
              cursor: "pointer",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill={hovered ? "white" : "#25D366"}>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            <span
              style={{
                fontFamily: FONT.sans,
                fontSize: "12px",
                fontWeight: 500,
                color: hovered ? "white" : C.body,
                transition: "color 250ms",
              }}
            >
              Message
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LANDING PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function LandingPage() {
  const [lang, setLang] = useState<Lang>("sa");
  const t = LANG[lang];

  useEffect(() => {
    const saved = localStorage.getItem("sph-lang") as Lang | null;
    if (saved === "en" || saved === "sa") setLang(saved);
  }, []);

  const switchLang = (l: Lang) => { setLang(l); localStorage.setItem("sph-lang", l); };

  const paths = [
    { icon: "⚡", label: t.path_a_label, sub: t.path_a_sub, color: C.greenBr, wash: C.greenWash, href: "/idea", rotation: -1.5 },
    { icon: "✦", label: t.path_b_label, sub: t.path_b_sub, color: C.oceanBr, wash: C.oceanWash, href: "/ideas", rotation: 0 },
    { icon: "◈", label: t.path_c_label, sub: t.path_c_sub, color: C.orange,   wash: C.orangeWash, href: "/quiz",  rotation: 1.5 },
    { icon: "🛍️", label: t.path_market_label, sub: t.path_market_sub, color: C.pinkBr, wash: C.pinkWash, href: "/marketplace", rotation: -1 },
  ];

  const steps = [
    { num: t.step1_num, title: t.step1_title, body: t.step1_body, accentColor: C.greenBr, blobVariant: 3 as const },
    { num: t.step2_num, title: t.step2_title, body: t.step2_body, accentColor: C.oceanBr, blobVariant: 4 as const },
    { num: t.step3_num, title: t.step3_title, body: t.step3_body, accentColor: C.orange,  blobVariant: 5 as const },
  ];

  const profiles = [
    { name: t.profile1_name, wijk: t.profile1_wijk, tag: t.profile1_tag, bio: t.profile1_bio, accentColor: C.greenBr, avatarGrad: `linear-gradient(135deg, ${C.greenBr}, ${C.oceanBr})`, initials: "SC" },
    { name: t.profile2_name, wijk: t.profile2_wijk, tag: t.profile2_tag, bio: t.profile2_bio, accentColor: C.pinkBr,  avatarGrad: `linear-gradient(135deg, ${C.pink}, ${C.pinkBr})`,    initials: "AB" },
    { name: t.profile3_name, wijk: t.profile3_wijk, tag: t.profile3_tag, bio: t.profile3_bio, accentColor: C.oceanBr, avatarGrad: `linear-gradient(135deg, ${C.ocean}, ${C.oceanBr})`,   initials: "TR" },
  ];

  return (
    <div style={{ background: C.cream, fontFamily: FONT.sans, overflowX: "hidden", minHeight: "100vh" }}>

      <Navbar lang={lang} setLang={switchLang} />

      {/* ══ HERO ═══════════════════════════════════════════════════════════════ */}
      <section
        style={{
          position: "relative",
          minHeight: "100svh",
          padding: "0 clamp(20px, 5vw, 60px)",
          paddingTop: "80px",
          paddingBottom: "80px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        {/* ── Full-bleed landscape background — wallpaper style ── */}
        <HeroLandscape />

        {/* Content */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: "800px",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          {/* Pre-label — casual, not corporate */}
          <motion.div variants={fadeUp}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "20px" }}>
              <span style={{ fontFamily: FONT.sans, fontSize: "13px", fontWeight: 400, color: C.muted, letterSpacing: "0.01em" }}>
                <AnimatePresence mode="wait">
                  <motion.span key={`pre-${lang}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                    {t.hero_pre}
                  </motion.span>
                </AnimatePresence>
              </span>
              {/* Subtle flowing line instead of a pill */}
              <div style={{ flex: 1, maxWidth: "48px", height: "1px", background: GRAD.flow, opacity: 0.5 }} />
            </div>
          </motion.div>

          {/* Headline — 2 lines, tighter footprint */}
          <motion.div variants={fadeUp}>
            <h1
              style={{
                fontFamily: FONT.serif,
                fontSize: "clamp(52px, 8.5vw, 98px)",
                fontWeight: 400,
                color: C.ink,
                lineHeight: 1.05,
                letterSpacing: "-0.025em",
                margin: 0,
                overflow: "visible",
              }}
            >
              {/* Line 1: normal weight */}
              <AnimatePresence mode="wait">
                <motion.span
                  key={`l1-${lang}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  style={{ display: "block", paddingBottom: "0.08em" }}
                >
                  {t.hero_line1} {t.hero_line2}
                </motion.span>
              </AnimatePresence>
              {/* Line 2: italic + flow gradient — the money line */}
              <AnimatePresence mode="wait">
                <motion.span
                  key={`l3-${lang}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, delay: 0.06 }}
                  style={{
                    display: "block",
                    fontStyle: "italic",
                    background: GRAD.flow,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    paddingBottom: "0.15em",
                    marginBottom: "-0.15em",
                  }}
                >
                  {t.hero_line3}
                </motion.span>
              </AnimatePresence>
            </h1>
          </motion.div>

          {/* Sub */}
          <motion.div variants={fadeUp}>
            <p style={{ fontFamily: FONT.sans, fontSize: "clamp(15px, 1.8vw, 18px)", color: C.muted, lineHeight: 1.7, maxWidth: "440px", margin: "20px 0 0", textAlign: "center" }}>
              <AnimatePresence mode="wait">
                <motion.span key={`sub-${lang}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                  {t.hero_sub}
                </motion.span>
              </AnimatePresence>
            </p>
          </motion.div>

          {/* Path cards */}
          <motion.div
            variants={staggerContainer}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "14px",
              marginTop: "48px",
              width: "100%",
              maxWidth: "960px",
            }}
          >
            {paths.map((path) => (
              <PathCard key={path.href} {...path} />
            ))}
          </motion.div>

          {/* Trust chips */}
          <motion.div
            variants={fadeUp}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginTop: "40px", flexWrap: "wrap" }}
          >
            {["✓ Free forever", "✓ No experience needed", "✓ Live in 10 min"].map((chip) => (
              <span
                key={chip}
                style={{
                  fontFamily: FONT.sans,
                  fontSize: "12px",
                  fontWeight: 600,
                  color: C.white,
                  background: "rgba(26,107,74,0.75)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  padding: "6px 14px",
                  borderRadius: "999px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  letterSpacing: "0.01em",
                }}
              >
                {chip}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ══ HOW IT WORKS ═══════════════════════════════════════════════════════ */}
      <section style={{ padding: "100px clamp(20px, 5vw, 80px)", maxWidth: "1280px", margin: "0 auto", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, right: -60, width: "clamp(200px, 28vw, 380px)", pointerEvents: "none" }}>
          <OrgBlob variant={6} color={C.pinkBr} opacity={0.07} />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, ease }}>
          <div style={{ fontFamily: FONT.sans, fontSize: "11px", fontWeight: 500, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "14px" }}>
            <AnimatePresence mode="wait">
              <motion.span key={`how-lbl-${lang}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                {t.how_label}
              </motion.span>
            </AnimatePresence>
          </div>
          <h2 style={{ fontFamily: FONT.serif, fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 400, color: C.ink, lineHeight: 1.1, letterSpacing: "-0.02em", margin: 0, marginBottom: "56px", maxWidth: "520px" }}>
            <AnimatePresence mode="wait">
              <motion.span key={`how-ttl-${lang}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                {t.how_title}
              </motion.span>
            </AnimatePresence>
          </h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-60px" }}
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}
        >
          {steps.map((step) => (
            <StepCard key={step.num} {...step} />
          ))}
        </motion.div>
      </section>

      {/* ══ SAMPLE PROFILES ════════════════════════════════════════════════════ */}
      <section style={{ padding: "100px clamp(20px, 5vw, 80px)", background: C.creamDk, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, left: -100, width: "clamp(280px, 38vw, 540px)", pointerEvents: "none" }}>
          <OrgBlob variant={5} color={C.greenBr} opacity={0.06} />
        </div>
        <div style={{ position: "absolute", bottom: -80, right: -80, width: "clamp(260px, 34vw, 460px)", pointerEvents: "none" }}>
          <OrgBlob variant={4} color={C.oceanBr} opacity={0.07} />
        </div>

        <div style={{ maxWidth: "1280px", margin: "0 auto", position: "relative" }}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease }}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "56px", flexWrap: "wrap", gap: "16px" }}
          >
            <div>
              <div style={{ fontFamily: FONT.sans, fontSize: "11px", fontWeight: 500, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>
                <AnimatePresence mode="wait">
                  <motion.span key={`prof-lbl-${lang}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                    {t.profiles_label}
                  </motion.span>
                </AnimatePresence>
              </div>
              <h2 style={{ fontFamily: FONT.serif, fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 400, color: C.ink, lineHeight: 1.15, letterSpacing: "-0.02em", margin: 0 }}>
                <AnimatePresence mode="wait">
                  <motion.span key={`prof-ttl-${lang}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                    {t.profiles_title}
                  </motion.span>
                </AnimatePresence>
              </h2>
            </div>
            <a href="/ontdek" style={{ fontFamily: FONT.sans, fontSize: "13px", fontWeight: 500, color: C.green, textDecoration: "none" }}>
              View all →
            </a>
          </motion.div>

          {/* Profile grid — extra top padding for avatar overhang */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-60px" }}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px", paddingTop: "32px" }}
          >
            {profiles.map((p) => (
              <ProfileCard key={p.name} {...p} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ CTA — NAVY ═════════════════════════════════════════════════════════ */}
      <section style={{ background: C.navy, padding: "100px clamp(20px, 5vw, 80px)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -80, left: -120, width: "clamp(300px, 45vw, 600px)", pointerEvents: "none" }}>
          <OrgBlob variant={1} color={C.greenBr} opacity={0.08} />
        </div>
        <div style={{ position: "absolute", bottom: -60, right: -60, width: "clamp(240px, 36vw, 480px)", pointerEvents: "none" }}>
          <OrgBlob variant={2} color={C.pinkBr} opacity={0.06} />
        </div>
        <div style={{ position: "absolute", top: 20, right: 80, width: "clamp(160px, 22vw, 300px)", pointerEvents: "none" }}>
          <OrgBlob variant={6} color={C.oceanBr} opacity={0.05} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          style={{ maxWidth: "640px", margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}
        >
          {/* Free badge */}
          <div
            style={{
              display: "inline-block",
              background: "rgba(34,160,107,0.15)",
              border: "1px solid rgba(34,160,107,0.3)",
              borderRadius: "999px",
              padding: "5px 16px",
              marginBottom: "28px",
              fontFamily: FONT.sans,
              fontSize: "12px",
              fontWeight: 500,
              color: C.greenLt,
              letterSpacing: "0.05em",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.span key={`cta-lbl-${lang}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                {t.cta_label}
              </motion.span>
            </AnimatePresence>
          </div>

          <h2 style={{ fontFamily: FONT.serif, fontSize: "clamp(40px, 6vw, 68px)", fontWeight: 400, color: "#ffffff", lineHeight: 1.08, letterSpacing: "-0.025em", margin: "0 0 20px" }}>
            <AnimatePresence mode="wait">
              <motion.span key={`cta-ttl-${lang}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                {t.cta_title}
              </motion.span>
            </AnimatePresence>
          </h2>

          <p style={{ fontFamily: FONT.sans, fontSize: "16px", color: "rgba(255,255,255,0.4)", lineHeight: 1.7, margin: "0 0 40px" }}>
            <AnimatePresence mode="wait">
              <motion.span key={`cta-sub-${lang}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                {t.cta_sub}
              </motion.span>
            </AnimatePresence>
          </p>

          <motion.a
            href="/idea"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "16px 36px",
              borderRadius: "999px",
              background: GRAD.flow,
              color: "white",
              fontFamily: FONT.sans,
              fontSize: "15px",
              fontWeight: 500,
              textDecoration: "none",
              boxShadow: "0 8px 32px rgba(34,160,107,0.35)",
              cursor: "pointer",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.span key={`cta-btn-${lang}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                {t.cta_btn}
              </motion.span>
            </AnimatePresence>
            <span>→</span>
          </motion.a>
        </motion.div>
      </section>

      {/* ══ FOOTER ═════════════════════════════════════════════════════════════ */}
      <footer
        style={{
          background: C.navy,
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "28px clamp(20px, 4vw, 48px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <span style={{ fontFamily: FONT.serif, fontSize: "18px", color: "rgba(255,255,255,0.5)", fontWeight: 400 }}>
          Superpowers
        </span>

        <span style={{ fontFamily: FONT.sans, fontSize: "12px", color: "rgba(255,255,255,0.22)" }}>
          <AnimatePresence mode="wait">
            <motion.span key={`footer-${lang}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              {t.footer_made} 🇿🇦
            </motion.span>
          </AnimatePresence>
        </span>

        <LangToggle lang={lang} setLang={switchLang} />
      </footer>
    </div>
  );
}
