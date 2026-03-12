"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import OrgBlob from "@/components/design/OrgBlob";
import { C, GRAD, FONT } from "@/lib/tokens";
import { LANG, type Lang } from "@/lib/i18n";
import { IDEAS, CATEGORY_META, type Idea, type Category } from "@/lib/ideas";
import { WIJK_GROUPS } from "@/lib/wijk";

// ── Animation presets ────────────────────────────────────────────────────────
const ease = [0.22, 1, 0.36, 1] as const;
const slideIn = {
  initial: { opacity: 0, x: -20, y: 8 },
  animate: { opacity: 1, x: 0, y: 0, transition: { duration: 0.4, ease } },
};

// ── Types ────────────────────────────────────────────────────────────────────
interface Service {
  name: string;
  price: string;
}

interface ProfileData {
  idea: Idea | null;
  name: string;
  wijk: string;
  services: Service[];
  bio: string;
  plan: string[];
  photoUrl: string | null;
}

// ── Helper: build a synthetic Idea from Path A free-text ─────────────────────
function makeCustomIdea(text: string, cat: Category | null): Idea {
  // Extract a short name from the first ~40 chars
  const shortName = text.length > 40 ? text.slice(0, 38).trim() + "…" : text;
  return {
    id: "custom",
    emoji: "⚡",
    name: shortName,
    nameSA: shortName,
    description: text,
    descriptionSA: text,
    category: cat || "business",
    earning: "R50–R300/day",
  };
}

// ── Mock AI generation (simulates Kasi Coach LLM response) ──────────────────
function generateCoachContent(idea: Idea, name: string, wijk: string, lang: Lang) {
  const n = name || "You";
  const biz = lang === "sa" ? idea.nameSA : idea.name;

  const bio = lang === "sa"
    ? `Hallo! My naam is ${n} van ${wijk}. Ek bied ${biz.toLowerCase()} aan wat kwaliteit en betroubaarheid kombineer. Kontak my op WhatsApp om te bespreek!`
    : `Hi! I'm ${n} from ${wijk}. I offer ${biz.toLowerCase()} that combines quality and reliability. Hit me up on WhatsApp to book!`;

  const plan = lang === "sa"
    ? [
        `Maak 'n WhatsApp Business-profiel met jou ${biz.toLowerCase()} dienste en pryse`,
        `Deel jou profiel in 3 plaaslike ${wijk} WhatsApp-groepe en vra jou eerste klant`,
        `Lewer jou eerste diens en vra vir 'n review om jou reputasie te bou`,
      ]
    : [
        `Set up a WhatsApp Business profile with your ${biz.toLowerCase()} services and prices`,
        `Share your profile in 3 local ${wijk} WhatsApp groups and ask for your first client`,
        `Deliver your first service and ask for a review to build your reputation`,
      ];

  const services: Service[] = lang === "sa"
    ? [
        { name: `Basiese ${biz}`, price: "R50" },
        { name: `Premium ${biz}`, price: "R120" },
        { name: `Spesiale pakket`, price: "R200" },
      ]
    : [
        { name: `Basic ${biz}`, price: "R50" },
        { name: `Premium ${biz}`, price: "R120" },
        { name: `Special package`, price: "R200" },
      ];

  return { bio, plan, services };
}

// ── Coach Message Bubble ─────────────────────────────────────────────────────
function CoachBubble({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16, y: 6 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.4, delay, ease }}
      style={{
        display: "flex",
        gap: "10px",
        alignItems: "flex-start",
        marginBottom: "16px",
      }}
    >
      {/* Coach avatar */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "12px",
          background: GRAD.flow,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "16px",
          flexShrink: 0,
          boxShadow: "0 2px 8px rgba(34,160,107,0.2)",
        }}
      >
        🤖
      </div>
      {/* Message */}
      <div
        style={{
          background: C.white,
          border: `1px solid ${C.sand}`,
          borderRadius: "4px 16px 16px 16px",
          padding: "14px 18px",
          maxWidth: "85%",
          fontFamily: FONT.sans,
          fontSize: "14px",
          color: C.body,
          lineHeight: 1.65,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}

// ── User Message Bubble ──────────────────────────────────────────────────────
function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16, y: 6 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.3, ease }}
      style={{
        display: "flex",
        justifyContent: "flex-end",
        marginBottom: "16px",
      }}
    >
      <div
        style={{
          background: C.green,
          borderRadius: "16px 4px 16px 16px",
          padding: "12px 18px",
          maxWidth: "75%",
          fontFamily: FONT.sans,
          fontSize: "14px",
          color: C.white,
          lineHeight: 1.5,
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}

// ── Typing indicator ─────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "16px" }}>
      <div
        style={{
          width: 36, height: 36, borderRadius: "12px", background: GRAD.flow,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0,
        }}
      >
        🤖
      </div>
      <div
        style={{
          background: C.white, border: `1px solid ${C.sand}`, borderRadius: "4px 16px 16px 16px",
          padding: "14px 20px", display: "flex", gap: "5px", alignItems: "center",
        }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
            transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }}
            style={{ width: 7, height: 7, borderRadius: "50%", background: C.greenBr }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Live 1-Pager Preview Card ────────────────────────────────────────────────
function OnePager({ profile, lang, completion }: { profile: ProfileData; lang: Lang; completion: number }) {
  const t = LANG[lang];
  const ideaName = profile.idea
    ? lang === "sa" ? profile.idea.nameSA : profile.idea.name
    : "...";
  const meta = profile.idea ? CATEGORY_META[profile.idea.category] : null;

  return (
    <div
      style={{
        background: C.white,
        borderRadius: "20px",
        border: `1px solid ${C.sand}`,
        padding: "28px 24px 24px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.06)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Completion bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: C.sandLt,
          overflow: "hidden",
        }}
      >
        <motion.div
          animate={{ width: `${completion}%` }}
          transition={{ duration: 0.6, ease }}
          style={{ height: "100%", background: GRAD.flow, borderRadius: "0 2px 2px 0" }}
        />
      </div>

      {/* Completion badge */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "4px 12px",
          borderRadius: "999px",
          background: completion === 100 ? C.greenWash : C.sandLt,
          marginBottom: "20px",
          fontFamily: FONT.sans,
          fontSize: "11px",
          fontWeight: 600,
          color: completion === 100 ? C.green : C.muted,
          transition: "all 400ms",
        }}
      >
        <span>{completion}%</span>
        <span>{t.bou_complete}</span>
      </div>

      {/* Avatar + Name */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "18px" }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "999px",
            background: profile.photoUrl
              ? `url(${profile.photoUrl}) center/cover`
              : meta ? `linear-gradient(135deg, ${meta.color}, ${C.oceanBr})` : C.sand,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            color: C.white,
            fontFamily: FONT.sans,
            fontWeight: 600,
            flexShrink: 0,
            border: `3px solid ${C.white}`,
            boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
          }}
        >
          {!profile.photoUrl && (profile.name ? profile.name[0].toUpperCase() : "?")}
        </div>
        <div>
          <div
            style={{
              fontFamily: FONT.serif,
              fontSize: "20px",
              fontWeight: 400,
              color: C.ink,
              lineHeight: 1.2,
            }}
          >
            {profile.name ? `${profile.name}'s ${ideaName}` : ideaName}
          </div>
          {profile.wijk && (
            <div style={{ fontFamily: FONT.sans, fontSize: "12px", color: C.muted, marginTop: "3px" }}>
              📍 {profile.wijk}, South Africa
            </div>
          )}
        </div>
      </div>

      {/* Category badge */}
      {meta && (
        <div
          style={{
            display: "inline-block",
            padding: "3px 10px",
            borderRadius: "8px",
            background: `${meta.color}18`,
            fontFamily: FONT.sans,
            fontSize: "10px",
            fontWeight: 500,
            letterSpacing: "0.06em",
            textTransform: "uppercase" as const,
            color: meta.color,
            marginBottom: "20px",
          }}
        >
          {lang === "sa" ? meta.labelSA : meta.label}
        </div>
      )}

      {/* Services */}
      {profile.services.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              fontFamily: FONT.sans,
              fontSize: "10px",
              fontWeight: 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase" as const,
              color: C.soft,
              marginBottom: "10px",
            }}
          >
            📋 {t.bou_services}
          </div>
          {profile.services.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 0",
                borderBottom: i < profile.services.length - 1 ? `1px solid ${C.sandLt}` : "none",
                fontFamily: FONT.sans,
                fontSize: "13px",
              }}
            >
              <span style={{ color: C.body }}>{s.name}</span>
              <span style={{ color: C.green, fontWeight: 600 }}>{s.price}</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Bio */}
      {profile.bio && (
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              fontFamily: FONT.sans,
              fontSize: "10px",
              fontWeight: 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase" as const,
              color: C.soft,
              marginBottom: "8px",
            }}
          >
            💬 {t.bou_about}
          </div>
          <div style={{ fontFamily: FONT.sans, fontSize: "13px", color: C.body, lineHeight: 1.7 }}>
            {profile.bio}
          </div>
        </div>
      )}

      {/* Action plan */}
      {profile.plan.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              fontFamily: FONT.sans,
              fontSize: "10px",
              fontWeight: 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase" as const,
              color: C.soft,
              marginBottom: "10px",
            }}
          >
            🚀 {t.bou_plan}
          </div>
          {profile.plan.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              style={{
                display: "flex",
                gap: "10px",
                marginBottom: "8px",
                fontFamily: FONT.sans,
                fontSize: "13px",
                color: C.body,
                lineHeight: 1.6,
              }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: C.greenWash,
                  color: C.green,
                  fontSize: "11px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: "1px",
                }}
              >
                {i + 1}
              </span>
              <span>{step}</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* WhatsApp CTA */}
      {completion >= 60 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 16px",
            borderRadius: "12px",
            background: "#25D366",
            cursor: "pointer",
            justifyContent: "center",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
          <span style={{ fontFamily: FONT.sans, fontSize: "13px", fontWeight: 500, color: "white" }}>
            {t.bou_whatsapp}
          </span>
        </motion.div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// BUILD PAGE — /build — Kasi Coach + Live 1-Pager
// ══════════════════════════════════════════════════════════════════════════════
type Step = 0 | 1 | 2 | 3 | 4 | 5;

export default function BouPage() {
  const [lang, setLang] = useState<Lang>("sa");
  const [step, setStep] = useState<Step>(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showPreviewMobile, setShowPreviewMobile] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Path state
  const [isPathA, setIsPathA] = useState(false);
  const [isPathC, setIsPathC] = useState(false);
  const [customIdeaText, setCustomIdeaText] = useState("");
  const [refineInput, setRefineInput] = useState("");

  // Profile state
  const [profile, setProfile] = useState<ProfileData>({
    idea: null,
    name: "",
    wijk: "",
    services: [],
    bio: "",
    plan: [],
    photoUrl: null,
  });

  // Input states
  const [nameInput, setNameInput] = useState("");
  const [wijkInput, setWijkInput] = useState("");
  const [serviceInputs, setServiceInputs] = useState<Service[]>([
    { name: "", price: "" },
    { name: "", price: "" },
    { name: "", price: "" },
  ]);

  const t = LANG[lang];

  // Load idea from URL or localStorage — supports both Path A and Path B
  useEffect(() => {
    const saved = localStorage.getItem("sph-lang") as Lang | null;
    if (saved === "en" || saved === "sa") setLang(saved);

    const params = new URLSearchParams(window.location.search);
    const path = params.get("path");

    if (path === "a") {
      // Path A: user typed their own idea
      setIsPathA(true);
      const customText = localStorage.getItem("sph-custom-idea") || "";
      const customCat = localStorage.getItem("sph-custom-category") as Category | null;
      setCustomIdeaText(customText);
      if (customText) {
        const syntheticIdea = makeCustomIdea(customText, customCat);
        setProfile((p) => ({ ...p, idea: syntheticIdea }));
      }
    } else if (path === "c") {
      // Path C: quiz-matched idea
      setIsPathC(true);
      const ideaId = params.get("idea") || localStorage.getItem("sph-selected-idea");
      if (ideaId) {
        const found = IDEAS.find((i) => i.id === ideaId);
        if (found) {
          setProfile((p) => ({ ...p, idea: found }));
        }
      }
    } else {
      // Path B: pre-selected idea from library
      const ideaId = params.get("idea") || localStorage.getItem("sph-selected-idea");
      if (ideaId) {
        const found = IDEAS.find((i) => i.id === ideaId);
        if (found) {
          setProfile((p) => ({ ...p, idea: found }));
        }
      }
    }
  }, []);

  useEffect(() => { localStorage.setItem("sph-lang", lang); }, [lang]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [step, isTyping]);

  // Completion percentage
  const completion = (() => {
    let c = 0;
    if (profile.idea) c += 15;
    if (step >= 1) c += 5; // confirmed
    if (profile.name) c += 20;
    if (profile.wijk) c += 10;
    if (profile.services.length > 0) c += 20;
    if (profile.bio) c += 20;
    if (profile.plan.length > 0) c += 10;
    return Math.min(c, 100);
  })();

  // Step handlers
  const confirmIdea = useCallback(() => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setStep(2);
    }, 800);
    setStep(1);
  }, []);

  // Path A: submit the refinement text → updates the synthetic idea, then proceed
  const submitRefinement = useCallback(() => {
    const refined = refineInput.trim();
    if (!refined) return;
    const customCat = localStorage.getItem("sph-custom-category") as Category | null;
    const combined = customIdeaText + " — " + refined;
    const updatedIdea = makeCustomIdea(combined, customCat);
    setProfile((p) => ({ ...p, idea: updatedIdea }));
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setStep(2);
    }, 800);
    setStep(1);
  }, [refineInput, customIdeaText]);

  const submitName = useCallback(() => {
    if (!nameInput.trim()) return;
    setProfile((p) => ({ ...p, name: nameInput.trim() }));
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setStep(3);
    }, 800);
  }, [nameInput]);

  const submitWijk = useCallback(() => {
    if (!wijkInput) return;
    setProfile((p) => ({ ...p, wijk: wijkInput }));
    setIsTyping(true);
    // Simulate AI generation
    setTimeout(() => {
      const generated = generateCoachContent(profile.idea!, nameInput.trim(), wijkInput, lang);
      setProfile((p) => ({
        ...p,
        bio: generated.bio,
        plan: generated.plan,
        services: generated.services,
      }));
      setServiceInputs(generated.services);
      setIsTyping(false);
      setStep(4);
    }, 2500);
  }, [wijkInput, profile.idea, nameInput, lang]);

  const submitServices = useCallback(() => {
    const valid = serviceInputs.filter((s) => s.name.trim() && s.price.trim());
    if (valid.length === 0) return;
    setProfile((p) => ({ ...p, services: valid }));
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setStep(5);
    }, 600);
  }, [serviceInputs]);

  const skipPhoto = useCallback(() => {
    setStep(5);
  }, []);

  const ideaName = profile.idea
    ? lang === "sa" ? profile.idea.nameSA : profile.idea.name
    : "...";

  return (
    <div style={{ background: C.cream, fontFamily: FONT.sans, minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(237,233,224,0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: `1px solid ${C.sand}`,
          padding: "0 clamp(16px, 3vw, 32px)",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <Link
            href={isPathA ? "/idea" : isPathC ? "/quiz" : "/ideas"}
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
            {t.bou_back}
          </Link>
          <div style={{ width: "1px", height: "20px", background: C.sand }} />
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{ fontFamily: FONT.serif, fontSize: "18px", fontWeight: 400, color: C.ink }}>
              Superpowers
            </span>
          </Link>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Mobile preview toggle */}
          <button
            onClick={() => setShowPreviewMobile(!showPreviewMobile)}
            style={{
              display: "none",
              padding: "6px 12px",
              borderRadius: "999px",
              border: `1px solid ${C.sand}`,
              background: showPreviewMobile ? C.green : C.white,
              color: showPreviewMobile ? C.white : C.muted,
              fontFamily: FONT.sans,
              fontSize: "11px",
              fontWeight: 500,
              cursor: "pointer",
              // Show on mobile via CSS later — for now always show
            }}
          >
            {t.bou_preview}
          </button>

          {/* Progress pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px 14px",
              borderRadius: "999px",
              background: C.white,
              border: `1px solid ${C.sand}`,
            }}
          >
            <div
              style={{
                width: 60,
                height: 4,
                borderRadius: "999px",
                background: C.sandLt,
                overflow: "hidden",
              }}
            >
              <motion.div
                animate={{ width: `${completion}%` }}
                transition={{ duration: 0.5, ease }}
                style={{ height: "100%", background: GRAD.flow, borderRadius: "999px" }}
              />
            </div>
            <span style={{ fontFamily: FONT.sans, fontSize: "11px", fontWeight: 600, color: completion === 100 ? C.green : C.muted }}>
              {completion}%
            </span>
          </div>

          {/* Lang toggle */}
          <button
            onClick={() => setLang(lang === "en" ? "sa" : "en")}
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
                  transition: "background 200ms, color 200ms",
                }}
              >
                {l.toUpperCase()}
              </span>
            ))}
          </button>
        </div>
      </div>

      {/* ── Main split layout ──────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 380px",
          maxWidth: "1280px",
          width: "100%",
          margin: "0 auto",
          gap: "0",
          minHeight: 0,
        }}
      >
        {/* ── LEFT: Kasi Coach chat ────────────────────────────────────────── */}
        <div
          style={{
            padding: "24px clamp(20px, 3vw, 40px)",
            overflowY: "auto",
            position: "relative",
          }}
        >
          {/* Decorative blob */}
          <div style={{ position: "absolute", top: -60, right: -40, width: 260, pointerEvents: "none", opacity: 0.06 }}>
            <OrgBlob variant={3} color={C.pinkBr} />
          </div>

          {/* Coach label */}
          <div
            style={{
              fontFamily: FONT.sans,
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.12em",
              color: C.soft,
              marginBottom: "20px",
            }}
          >
            {t.bou_label}
          </div>

          {/* ── CHAT FLOW ─────────────────────────────────────────────────── */}

          {/* Greeting */}
          <CoachBubble>
            <div style={{ fontFamily: FONT.serif, fontSize: "18px", color: C.ink, marginBottom: "4px" }}>
              {t.bou_greeting}
            </div>
          </CoachBubble>

          {/* Q1: Path-specific — Path A (refine) or Path B (confirm) */}
          {profile.idea && step >= 0 && !isPathA && !isPathC && (
            <CoachBubble delay={0.4}>
              <div>
                {t.bou_q1}{" "}
                <strong style={{ color: C.green }}>{ideaName}</strong>{" "}
                {t.bou_q1_end}
              </div>
              {step === 0 && (
                <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={confirmIdea}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "12px",
                      border: "none",
                      background: C.green,
                      color: C.white,
                      fontFamily: FONT.sans,
                      fontSize: "13px",
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    {t.bou_q1_yes}
                  </motion.button>
                  <Link
                    href="/ideas"
                    style={{
                      padding: "10px 20px",
                      borderRadius: "12px",
                      border: `1px solid ${C.sand}`,
                      background: C.white,
                      color: C.muted,
                      fontFamily: FONT.sans,
                      fontSize: "13px",
                      fontWeight: 500,
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                    }}
                  >
                    {t.bou_q1_refine}
                  </Link>
                </div>
              )}
            </CoachBubble>
          )}

          {/* Q1 — Path C: "You matched with [idea] — perfect! Ready to build?" */}
          {profile.idea && step >= 0 && isPathC && (
            <CoachBubble delay={0.4}>
              <div>
                {t.bou_q1_pathc}{" "}
                <strong style={{ color: C.green }}>{ideaName}</strong>{" "}
                {t.bou_q1_pathc_end}
              </div>
              {step === 0 && (
                <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={confirmIdea}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "12px",
                      border: "none",
                      background: C.green,
                      color: C.white,
                      fontFamily: FONT.sans,
                      fontSize: "13px",
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    {t.bou_q1_yes}
                  </motion.button>
                  <Link
                    href="/quiz"
                    style={{
                      padding: "10px 20px",
                      borderRadius: "12px",
                      border: `1px solid ${C.sand}`,
                      background: C.white,
                      color: C.muted,
                      fontFamily: FONT.sans,
                      fontSize: "13px",
                      fontWeight: 500,
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                    }}
                  >
                    {t.bou_q1_refine}
                  </Link>
                </div>
              )}
            </CoachBubble>
          )}

          {/* Q1 — Path A: "Tell me more about your idea" + refinement input */}
          {profile.idea && step >= 0 && isPathA && (
            <CoachBubble delay={0.4}>
              <div style={{ marginBottom: "8px" }}>
                {t.bou_q1_patha}
              </div>
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "12px",
                  background: C.creamLt,
                  fontFamily: FONT.serif,
                  fontSize: "15px",
                  fontStyle: "italic",
                  color: C.green,
                  lineHeight: 1.5,
                  marginBottom: "10px",
                  borderLeft: `3px solid ${C.greenBr}`,
                }}
              >
                "{customIdeaText}"
              </div>
              <div style={{ fontSize: "13px", color: C.muted, marginBottom: "10px" }}>
                {t.bou_q1_patha_refine}
              </div>
              {step === 0 && (
                <div style={{ display: "flex", gap: "8px", flexDirection: "column" }}>
                  <textarea
                    value={refineInput}
                    onChange={(e) => setRefineInput(e.target.value)}
                    placeholder={t.bou_q1_patha_placeholder}
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "12px",
                      border: `1px solid ${C.sand}`,
                      fontFamily: FONT.sans,
                      fontSize: "14px",
                      color: C.ink,
                      outline: "none",
                      background: C.creamLt,
                      resize: "none",
                      lineHeight: 1.6,
                    }}
                  />
                  <div style={{ display: "flex", gap: "8px" }}>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={submitRefinement}
                      disabled={!refineInput.trim()}
                      style={{
                        flex: 1,
                        padding: "10px 20px",
                        borderRadius: "12px",
                        border: "none",
                        background: refineInput.trim() ? C.green : C.sand,
                        color: C.white,
                        fontFamily: FONT.sans,
                        fontSize: "13px",
                        fontWeight: 500,
                        cursor: refineInput.trim() ? "pointer" : "default",
                        transition: "background 200ms",
                      }}
                    >
                      {t.bou_next}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={confirmIdea}
                      style={{
                        padding: "10px 20px",
                        borderRadius: "12px",
                        border: `1px solid ${C.sand}`,
                        background: C.white,
                        color: C.muted,
                        fontFamily: FONT.sans,
                        fontSize: "13px",
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      {t.bou_q1_yes}
                    </motion.button>
                  </div>
                </div>
              )}
            </CoachBubble>
          )}

          {/* User confirmed — show different text for each path */}
          {step >= 1 && !isPathA && !isPathC && (
            <UserBubble>{t.bou_q1_yes}</UserBubble>
          )}
          {step >= 1 && isPathC && (
            <UserBubble>{t.bou_q1_yes}</UserBubble>
          )}
          {step >= 1 && isPathA && (
            <UserBubble>{refineInput.trim() || t.bou_q1_yes}</UserBubble>
          )}

          {/* Q2: Name */}
          {step >= 2 && (
            <CoachBubble delay={0.2}>
              <div>{t.bou_q2}</div>
              {step === 2 && !profile.name && (
                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submitName()}
                    placeholder={t.bou_q2_placeholder}
                    autoFocus
                    style={{
                      flex: 1,
                      padding: "10px 14px",
                      borderRadius: "12px",
                      border: `1px solid ${C.sand}`,
                      fontFamily: FONT.sans,
                      fontSize: "14px",
                      color: C.ink,
                      outline: "none",
                      background: C.creamLt,
                    }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={submitName}
                    disabled={!nameInput.trim()}
                    style={{
                      padding: "10px 18px",
                      borderRadius: "12px",
                      border: "none",
                      background: nameInput.trim() ? C.green : C.sand,
                      color: C.white,
                      fontFamily: FONT.sans,
                      fontSize: "13px",
                      fontWeight: 500,
                      cursor: nameInput.trim() ? "pointer" : "default",
                      transition: "background 200ms",
                    }}
                  >
                    →
                  </motion.button>
                </div>
              )}
            </CoachBubble>
          )}

          {/* User name answer */}
          {profile.name && step >= 2 && (
            <UserBubble>{profile.name}</UserBubble>
          )}

          {/* Q3: Wijk */}
          {step >= 3 && (
            <CoachBubble delay={0.2}>
              <div>{t.bou_q3}</div>
              {step === 3 && !profile.wijk && (
                <div style={{ marginTop: "12px" }}>
                  <select
                    value={wijkInput}
                    onChange={(e) => setWijkInput(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "12px",
                      border: `1px solid ${C.sand}`,
                      fontFamily: FONT.sans,
                      fontSize: "14px",
                      color: wijkInput ? C.ink : C.muted,
                      background: C.creamLt,
                      outline: "none",
                      cursor: "pointer",
                      marginBottom: "8px",
                    }}
                  >
                    <option value="">{t.bou_q3_placeholder}</option>
                    {WIJK_GROUPS.map((g) => (
                      <optgroup key={g.region} label={lang === "sa" ? g.regionSA : g.region}>
                        {g.townships.map((tw) => (
                          <option key={tw} value={tw}>{tw}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={submitWijk}
                    disabled={!wijkInput}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "12px",
                      border: "none",
                      background: wijkInput ? C.green : C.sand,
                      color: C.white,
                      fontFamily: FONT.sans,
                      fontSize: "13px",
                      fontWeight: 500,
                      cursor: wijkInput ? "pointer" : "default",
                      transition: "background 200ms",
                    }}
                  >
                    {t.bou_next}
                  </motion.button>
                </div>
              )}
            </CoachBubble>
          )}

          {/* User wijk answer */}
          {profile.wijk && step >= 3 && (
            <UserBubble>📍 {profile.wijk}</UserBubble>
          )}

          {/* AI loading state */}
          {step === 3 && profile.wijk && isTyping && (
            <CoachBubble delay={0.1}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  style={{ width: 16, height: 16, border: `2px solid ${C.greenBr}`, borderTopColor: "transparent", borderRadius: "50%" }}
                />
                <span style={{ color: C.green, fontWeight: 500, fontSize: "13px" }}>{t.bou_q3_loading}</span>
              </div>
            </CoachBubble>
          )}

          {/* Q4: Services (pre-filled by AI) */}
          {step >= 4 && (
            <CoachBubble delay={0.2}>
              <div style={{ marginBottom: "12px" }}>{t.bou_q4}</div>
              {step === 4 && (
                <div>
                  {serviceInputs.map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                      <input
                        type="text"
                        value={s.name}
                        onChange={(e) => {
                          const next = [...serviceInputs];
                          next[i] = { ...next[i], name: e.target.value };
                          setServiceInputs(next);
                        }}
                        placeholder={`Service ${i + 1}`}
                        style={{
                          flex: 1,
                          padding: "8px 12px",
                          borderRadius: "10px",
                          border: `1px solid ${C.sand}`,
                          fontFamily: FONT.sans,
                          fontSize: "13px",
                          color: C.ink,
                          outline: "none",
                          background: C.creamLt,
                        }}
                      />
                      <input
                        type="text"
                        value={s.price}
                        onChange={(e) => {
                          const next = [...serviceInputs];
                          next[i] = { ...next[i], price: e.target.value };
                          setServiceInputs(next);
                        }}
                        placeholder={t.bou_q4_price}
                        style={{
                          width: "80px",
                          padding: "8px 10px",
                          borderRadius: "10px",
                          border: `1px solid ${C.sand}`,
                          fontFamily: FONT.sans,
                          fontSize: "13px",
                          color: C.green,
                          fontWeight: 600,
                          outline: "none",
                          background: C.creamLt,
                          textAlign: "right",
                        }}
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => setServiceInputs([...serviceInputs, { name: "", price: "" }])}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      border: `1px dashed ${C.sand}`,
                      background: "transparent",
                      fontFamily: FONT.sans,
                      fontSize: "12px",
                      color: C.muted,
                      cursor: "pointer",
                      marginBottom: "12px",
                    }}
                  >
                    + {t.bou_q4_add}
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={submitServices}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "12px",
                      border: "none",
                      background: C.green,
                      color: C.white,
                      fontFamily: FONT.sans,
                      fontSize: "13px",
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    {t.bou_next}
                  </motion.button>
                </div>
              )}
            </CoachBubble>
          )}

          {/* User services answer */}
          {step >= 5 && profile.services.length > 0 && (
            <UserBubble>
              {profile.services.map((s) => `${s.name} — ${s.price}`).join(", ")}
            </UserBubble>
          )}

          {/* Typing indicator */}
          {isTyping && step !== 3 && <TypingDots />}

          {/* ── DONE STATE ────────────────────────────────────────────────── */}
          {step >= 5 && !isTyping && (
            <CoachBubble delay={0.3}>
              <div
                style={{
                  fontFamily: FONT.serif,
                  fontSize: "20px",
                  color: C.ink,
                  marginBottom: "8px",
                }}
              >
                {t.bou_done_title}
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: C.muted,
                  marginBottom: "16px",
                  lineHeight: 1.6,
                }}
              >
                {t.bou_done_sub}
              </div>
              <motion.a
                href="/live"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  width: "100%",
                  padding: "14px 24px",
                  borderRadius: "999px",
                  background: GRAD.flow,
                  color: "white",
                  fontFamily: FONT.sans,
                  fontSize: "15px",
                  fontWeight: 500,
                  textDecoration: "none",
                  boxShadow: "0 6px 24px rgba(34,160,107,0.3)",
                  cursor: "pointer",
                }}
              >
                {t.bou_publish}
                <span>→</span>
              </motion.a>
            </CoachBubble>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* ── RIGHT: Live 1-Pager Preview ──────────────────────────────────── */}
        <div
          style={{
            padding: "24px 24px 24px 0",
            borderLeft: `1px solid ${C.sand}`,
            position: "sticky",
            top: "56px",
            height: "calc(100vh - 56px)",
            overflowY: "auto",
          }}
        >
          <div style={{ padding: "0 0 0 24px" }}>
            {/* Preview label */}
            <div
              style={{
                fontFamily: FONT.sans,
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.12em",
                color: C.soft,
                marginBottom: "16px",
                textTransform: "uppercase",
              }}
            >
              {t.bou_preview}
            </div>
            <OnePager profile={profile} lang={lang} completion={completion} />
          </div>
        </div>
      </div>
    </div>
  );
}
