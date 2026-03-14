"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { C, GRAD, FONT } from "@/lib/tokens";
import { LANG, type Lang } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import {
  fetchCategories,
  fetchLocations,
  publishListing,
  type CategoryMetaMap,
} from "@/lib/supabase/queries";

// ── Animation presets ─────────────────────────────────────────────────────────
const ease = [0.22, 1, 0.36, 1] as const;

// ── Step type ────────────────────────────────────────────────────────────────
type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

const RESPONSE_TIMES = [
  "Usually replies within 1 hour",
  "Usually replies within a few hours",
  "Usually replies within 1 day",
  "Usually replies within 2–3 days",
];

// ── Draft data shape ─────────────────────────────────────────────────────────
interface ServiceItem {
  name: string;
  price: string;
}

interface DraftListing {
  category: string | null;
  name: string;
  locations: string[];
  tagline: string;
  description: string;
  services: ServiceItem[];
  whatsapp: string;
  responseTime: string;
}

// ── Coach Message Bubble ──────────────────────────────────────────────────────
function CoachBubble({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16, y: 6 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.4, delay, ease }}
      style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "16px" }}
    >
      {/* Coach avatar */}
      <div
        style={{
          width: 36, height: 36, borderRadius: "12px", background: GRAD.flow,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "16px", flexShrink: 0, boxShadow: "0 2px 8px rgba(34,160,107,0.2)",
        }}
      >
        🤖
      </div>
      {/* Message */}
      <div
        style={{
          background: C.white, border: `1px solid ${C.sand}`,
          borderRadius: "4px 16px 16px 16px", padding: "14px 18px",
          maxWidth: "85%", fontFamily: FONT.sans, fontSize: "14px",
          color: C.body, lineHeight: 1.65, boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}

// ── User Message Bubble ───────────────────────────────────────────────────────
function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16, y: 6 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.3, ease }}
      style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}
    >
      <div
        style={{
          background: C.green, borderRadius: "16px 4px 16px 16px",
          padding: "12px 18px", maxWidth: "75%", fontFamily: FONT.sans,
          fontSize: "14px", color: C.white, lineHeight: 1.5,
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}

// ── Typing indicator ──────────────────────────────────────────────────────────
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
          background: C.white, border: `1px solid ${C.sand}`,
          borderRadius: "4px 16px 16px 16px", padding: "14px 20px",
          display: "flex", gap: "5px", alignItems: "center",
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

// ── Live listing card preview ─────────────────────────────────────────────────
function ListingPreview({ draft, completion, categoryMeta }: { draft: DraftListing; completion: number; categoryMeta: CategoryMetaMap }) {
  const meta = draft.category ? (categoryMeta[draft.category] ?? null) : null;
  const hasContent = draft.name || draft.category;

  return (
    <div style={{ position: "relative" }}>
      {/* Completion bar */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
        <div style={{ flex: 1, height: 4, borderRadius: "999px", background: C.sandLt, overflow: "hidden" }}>
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

      {/* Card preview */}
      <div
        style={{
          background: C.white, borderRadius: "16px",
          border: `1px solid ${C.sand}`,
          overflow: "hidden",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        }}
      >
        {/* Colour top bar from category */}
        <div
          style={{
            height: 4,
            background: meta ? meta.color : C.sand,
            transition: "background 400ms",
          }}
        />

        <div style={{ padding: "20px" }}>
          {/* Avatar + name */}
          <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "14px" }}>
            <div
              style={{
                width: 52, height: 52, borderRadius: "14px", flexShrink: 0,
                background: meta
                  ? `linear-gradient(135deg, ${meta.color}, ${meta.color}88)`
                  : C.sandLt,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "22px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                transition: "background 400ms",
              }}
            >
              {meta ? meta.emoji : "🏪"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: FONT.serif, fontSize: "18px", color: draft.name ? C.ink : C.soft,
                  lineHeight: 1.25, marginBottom: "3px",
                  transition: "color 300ms",
                }}
              >
                {draft.name || "Your Business Name"}
              </div>
              {draft.locations.length > 0 && (
                <div style={{ fontFamily: FONT.sans, fontSize: "11px", color: C.muted }}>
                  📍 {draft.locations.join(", ")}
                </div>
              )}
            </div>
          </div>

          {/* Tagline */}
          <AnimatePresence>
            {draft.tagline && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                style={{
                  fontFamily: FONT.serif, fontSize: "13px", fontStyle: "italic",
                  color: C.body, lineHeight: 1.5, marginBottom: "12px",
                }}
              >
                &ldquo;{draft.tagline}&rdquo;
              </motion.div>
            )}
          </AnimatePresence>

          {/* Category badge */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "14px" }}>
            {meta && (
              <div
                style={{
                  display: "inline-flex", alignItems: "center", gap: "4px",
                  padding: "3px 9px", borderRadius: "6px",
                  background: `${meta.color}12`, fontFamily: FONT.sans,
                  fontSize: "9px", fontWeight: 600, letterSpacing: "0.06em",
                  textTransform: "uppercase" as const, color: meta.color,
                  transition: "all 300ms",
                }}
              >
                {meta.emoji} {meta.name}
              </div>
            )}
            {draft.responseTime && (
              <div
                style={{
                  display: "inline-flex", alignItems: "center", gap: "4px",
                  padding: "3px 9px", borderRadius: "6px",
                  background: C.greenWash, fontFamily: FONT.sans,
                  fontSize: "9px", fontWeight: 600, color: C.green,
                }}
              >
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.green, display: "inline-block" }} />
                {draft.responseTime.replace("Usually replies ", "")}
              </div>
            )}
          </div>

          {/* Description preview */}
          <AnimatePresence>
            {draft.description && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                style={{
                  fontFamily: FONT.sans, fontSize: "12px", color: C.body,
                  lineHeight: 1.7, marginBottom: "12px",
                  display: "-webkit-box", WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical" as const, overflow: "hidden",
                }}
              >
                {draft.description}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Services preview */}
          <AnimatePresence>
            {draft.services.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "14px" }}
              >
                {draft.services.filter((s) => s.name.trim()).slice(0, 4).map((s, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "7px 10px", borderRadius: "8px",
                      background: C.sandLt, fontFamily: FONT.sans, fontSize: "11px",
                    }}
                  >
                    <span style={{ color: C.body }}>{s.name.trim()}</span>
                    {s.price.trim() && (
                      <span style={{ color: C.green, fontWeight: 600, flexShrink: 0, marginLeft: "8px" }}>
                        R{s.price.trim()}
                      </span>
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* WhatsApp CTA */}
          <div
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: "6px", padding: "10px", borderRadius: "10px",
              background: draft.whatsapp ? C.green : C.sandLt,
              fontFamily: FONT.sans, fontSize: "12px", fontWeight: 600,
              color: draft.whatsapp ? C.white : C.soft,
              transition: "background 300ms, color 300ms",
            }}
          >
            💬 {draft.whatsapp ? "Chat on WhatsApp" : "WhatsApp contact"}
          </div>
        </div>

        {/* Footer */}
        {!hasContent && (
          <div
            style={{
              textAlign: "center", padding: "32px 16px",
              fontFamily: FONT.sans, fontSize: "12px", color: C.soft, lineHeight: 1.7,
            }}
          >
            <div style={{ fontSize: "28px", marginBottom: "10px", opacity: 0.3 }}>🏪</div>
            Answer the questions to see your listing come to life...
          </div>
        )}

        <div
          style={{
            textAlign: "center", padding: "12px",
            borderTop: `1px solid ${C.sandLt}`,
            fontFamily: FONT.sans, fontSize: "9px", color: C.faint, letterSpacing: "0.04em",
          }}
        >
          Listed on <span style={{ color: C.greenBr, fontWeight: 600 }}>Superpower Hub</span>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// NEW LISTING WIZARD
// ══════════════════════════════════════════════════════════════════════════════
export default function NewListingPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("sa");
  const [step, setStep] = useState<Step>(0);
  const [isTyping, setIsTyping] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPreviewMobile, setShowPreviewMobile] = useState(false);
  const [categoryMeta, setCategoryMeta] = useState<CategoryMetaMap>({});
  const [allLocations, setAllLocations] = useState<string[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [draft, setDraft] = useState<DraftListing>({
    category: null,
    name: "",
    locations: [],
    tagline: "",
    description: "",
    services: [],
    whatsapp: "",
    responseTime: "",
  });

  // Input states
  const [nameInput, setNameInput] = useState("");
  const [taglineInput, setTaglineInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [servicesInput, setServicesInput] = useState<ServiceItem[]>([
    { name: "", price: "" },
    { name: "", price: "" },
    { name: "", price: "" },
  ]);
  const [whatsappInput, setWhatsappInput] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("sph-lang") as Lang | null;
    if (saved === "en" || saved === "sa") setLang(saved);

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.replace("/marketplace?signin=1");
    });

    // Load categories and locations from Supabase
    Promise.all([fetchCategories(), fetchLocations()]).then(([cats, locs]) => {
      setCategoryMeta(cats);
      setAllLocations(locs);
    });
  }, [router]);

  // Auto-save draft
  useEffect(() => {
    if (!draft.name && !draft.category) return;
    try {
      sessionStorage.setItem("sph-new-listing-draft", JSON.stringify({ ...draft, _step: step }));
    } catch {}
  }, [draft, step]);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [step, isTyping]);

  const t = LANG[lang];

  // Completion
  const completion = (() => {
    let c = 0;
    if (draft.category) c += 14;
    if (draft.name) c += 14;
    if (draft.locations.length > 0) c += 14;
    if (draft.tagline) c += 14;
    if (draft.description) c += 14;
    if (draft.services.some((s) => s.name.trim())) c += 14;
    if (draft.whatsapp) c += 16;
    return Math.min(c, 100);
  })();

  // ── Step handlers ────────────────────────────────────────────────────────
  const pickCategory = useCallback((cat: string) => {
    setDraft((d) => ({ ...d, category: cat }));
    setIsTyping(true);
    setTimeout(() => { setIsTyping(false); setStep(1); }, 700);
  }, []);

  const submitName = useCallback(() => {
    if (!nameInput.trim()) return;
    setDraft((d) => ({ ...d, name: nameInput.trim() }));
    setIsTyping(true);
    setTimeout(() => { setIsTyping(false); setStep(2); }, 700);
  }, [nameInput]);

  const toggleLocation = useCallback((township: string) => {
    setDraft((d) => ({
      ...d,
      locations: d.locations.includes(township)
        ? d.locations.filter((l) => l !== township)
        : [...d.locations, township],
    }));
  }, []);

  const submitLocations = useCallback(() => {
    if (draft.locations.length === 0) return;
    setIsTyping(true);
    setTimeout(() => { setIsTyping(false); setStep(3); }, 700);
  }, [draft.locations]);

  const submitTagline = useCallback(() => {
    if (!taglineInput.trim()) return;
    setDraft((d) => ({ ...d, tagline: taglineInput.trim() }));
    setIsTyping(true);
    setTimeout(() => { setIsTyping(false); setStep(4); }, 700);
  }, [taglineInput]);

  const submitDescription = useCallback(() => {
    if (!descriptionInput.trim()) return;
    setDraft((d) => ({ ...d, description: descriptionInput.trim() }));
    setIsTyping(true);
    setTimeout(() => { setIsTyping(false); setStep(5); }, 700);
  }, [descriptionInput]);

  const submitServices = useCallback(() => {
    const filled = servicesInput.filter((s) => s.name.trim());
    if (filled.length === 0) return;
    setDraft((d) => ({ ...d, services: filled }));
    setIsTyping(true);
    setTimeout(() => { setIsTyping(false); setStep(6); }, 700);
  }, [servicesInput]);

  const submitWhatsapp = useCallback(() => {
    if (!whatsappInput.trim()) return;
    setDraft((d) => ({ ...d, whatsapp: whatsappInput.trim() }));
    setIsTyping(true);
    setTimeout(() => { setIsTyping(false); setStep(7); }, 700);
  }, [whatsappInput]);

  const pickResponseTime = useCallback((rt: string) => {
    setDraft((d) => ({ ...d, responseTime: rt }));
  }, []);

  const handlePublish = useCallback(async () => {
    if (!draft.category || !draft.name || !draft.whatsapp) return;
    setSubmitting(true);
    const result = await publishListing({
      businessName: draft.name,
      tagline: draft.tagline,
      description: draft.description,
      locations: draft.locations,
      category: draft.category,
      whatsappNumber: draft.whatsapp,
      responseTime: draft.responseTime,
      services: draft.services,
    });
    setSubmitting(false);
    if (result) {
      try { sessionStorage.removeItem("sph-new-listing-draft"); } catch {}
      router.push(`/marketplace/${result.id}?new=1`);
    }
  }, [draft, router]);

  const meta = draft.category ? (categoryMeta[draft.category] ?? null) : null;

  return (
    <div
      style={{
        background: C.cream, fontFamily: FONT.sans, minHeight: "100vh",
        display: "flex", flexDirection: "column",
      }}
    >
      {/* ── GRAD top stripe ─────────────────────────────────────────────────── */}
      <div style={{ height: 4, background: GRAD.flow, flexShrink: 0 }} />

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "sticky", top: 0, zIndex: 50,
          background: "rgba(237,233,224,0.92)",
          backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
          borderBottom: `1px solid ${C.sand}`,
          padding: "0 clamp(16px,3vw,32px)", height: "56px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <Link
            href="/marketplace"
            style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              fontFamily: FONT.sans, fontSize: "13px", fontWeight: 500,
              color: C.muted, textDecoration: "none",
            }}
          >
            <span style={{ fontSize: "16px" }}>←</span>
            Back to listings
          </Link>
          <div style={{ width: "1px", height: "20px", background: C.sand }} />
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{ fontFamily: FONT.serif, fontSize: "18px", fontWeight: 400, color: C.ink }}>
              Superpower Hub
            </span>
          </Link>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Mobile preview toggle */}
          <button
            onClick={() => setShowPreviewMobile(!showPreviewMobile)}
            style={{
              padding: "6px 12px", borderRadius: "999px",
              border: `1px solid ${C.sand}`,
              background: showPreviewMobile ? C.green : C.white,
              color: showPreviewMobile ? C.white : C.muted,
              fontFamily: FONT.sans, fontSize: "11px", fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Preview
          </button>

          {/* Progress pill */}
          <div
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "4px 14px", borderRadius: "999px",
              background: C.white, border: `1px solid ${C.sand}`,
            }}
          >
            <div style={{ width: 60, height: 4, borderRadius: "999px", background: C.sandLt, overflow: "hidden" }}>
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
        </div>
      </div>

      {/* ── Body: split layout ───────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1, display: "grid",
          gridTemplateColumns: "1fr 380px",
          maxWidth: "1100px", margin: "0 auto", width: "100%",
          alignItems: "start",
        }}
      >
        {/* ── LEFT: Chat ──────────────────────────────────────────────────── */}
        <div
          style={{
            padding: "32px clamp(20px,4vw,48px) 80px",
            overflowY: "auto",
          }}
        >
          {/* ── Q0: What category? ─────────────────────────────────── */}
          <CoachBubble>
            <div style={{ marginBottom: "10px" }}>
              👋 Welcome! Let&rsquo;s add your business to the marketplace.{" "}
              <strong>What type of business is it?</strong>
            </div>
            {step === 0 && !draft.category && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "4px" }}>
                {Object.values(categoryMeta).map((m) => (
                  <motion.button
                    key={m.key}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => pickCategory(m.key)}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "6px",
                      padding: "8px 14px", borderRadius: "999px",
                      border: `1px solid ${C.sand}`, background: C.white,
                      color: C.body, fontFamily: FONT.sans, fontSize: "13px",
                      fontWeight: 500, cursor: "pointer",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                    }}
                  >
                    <span>{m.emoji}</span>
                    <span>{m.name}</span>
                  </motion.button>
                ))}
              </div>
            )}
          </CoachBubble>

          {/* User: category answer */}
          {draft.category && (
            <UserBubble>
              {meta?.emoji} {meta?.name ?? draft.category}
            </UserBubble>
          )}

          {isTyping && step === 0 && <TypingDots />}

          {/* ── Q1: Business name ──────────────────────────────────── */}
          {step >= 1 && (
            <CoachBubble delay={0.1}>
              <div style={{ marginBottom: "10px" }}>
                Love it! What&rsquo;s the <strong>name of your business</strong>?
              </div>
              {step === 1 && !draft.name && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <input
                    autoFocus
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") submitName(); }}
                    placeholder="e.g. Zara Creative Studio"
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: "12px",
                      border: `1px solid ${C.sand}`, fontFamily: FONT.sans, fontSize: "13px",
                      color: C.ink, outline: "none", background: C.creamLt,
                      boxSizing: "border-box",
                    }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={submitName}
                    disabled={!nameInput.trim()}
                    style={{
                      width: "100%", padding: "10px", borderRadius: "12px", border: "none",
                      background: nameInput.trim() ? C.green : C.sand,
                      color: C.white, fontFamily: FONT.sans, fontSize: "13px", fontWeight: 500,
                      cursor: nameInput.trim() ? "pointer" : "default", transition: "background 200ms",
                    }}
                  >
                    Next →
                  </motion.button>
                </div>
              )}
            </CoachBubble>
          )}

          {draft.name && step >= 1 && (
            <UserBubble>🏪 {draft.name}</UserBubble>
          )}

          {isTyping && step === 1 && <TypingDots />}

          {/* ── Q2: Township / location ─────────────────────────────── */}
          {step >= 2 && (
            <CoachBubble delay={0.1}>
              <div style={{ marginBottom: "10px" }}>
                Great name! <strong>Where are you based?</strong> Pick all the areas you serve.
              </div>
              {step === 2 && (
                <>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
                    {allLocations.map((township) => {
                      const active = draft.locations.includes(township);
                      return (
                        <motion.button
                          key={township}
                          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                          onClick={() => toggleLocation(township)}
                          style={{
                            padding: "6px 12px", borderRadius: "999px",
                            border: active ? "none" : `1px solid ${C.sand}`,
                            background: active ? "#A855F7" : C.white,
                            color: active ? C.white : C.body,
                            fontFamily: FONT.sans, fontSize: "12px", fontWeight: 500,
                            cursor: "pointer", transition: "all 200ms",
                            boxShadow: active ? "0 4px 14px rgba(168,85,247,0.3)" : "0 1px 4px rgba(0,0,0,0.04)",
                          }}
                        >
                          {township}
                        </motion.button>
                      );
                    })}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={submitLocations}
                    disabled={draft.locations.length === 0}
                    style={{
                      width: "100%", padding: "10px", borderRadius: "12px", border: "none",
                      background: draft.locations.length > 0 ? C.green : C.sand,
                      color: C.white, fontFamily: FONT.sans, fontSize: "13px", fontWeight: 500,
                      cursor: draft.locations.length > 0 ? "pointer" : "default", transition: "background 200ms",
                    }}
                  >
                    Next →
                  </motion.button>
                </>
              )}
            </CoachBubble>
          )}

          {draft.locations.length > 0 && step >= 3 && (
            <UserBubble>📍 {draft.locations.join(", ")}</UserBubble>
          )}

          {isTyping && step === 2 && <TypingDots />}

          {/* ── Q3: Tagline ─────────────────────────────────────────── */}
          {step >= 3 && (
            <CoachBubble delay={0.1}>
              <div style={{ marginBottom: "10px" }}>
                Nice! Now give it a <strong>one-line tagline</strong> — what makes you stand out?
              </div>
              {!draft.tagline && step === 3 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <input
                    autoFocus
                    type="text"
                    value={taglineInput}
                    onChange={(e) => setTaglineInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") submitTagline(); }}
                    placeholder="e.g. Bold African designs for bold people"
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: "12px",
                      border: `1px solid ${C.sand}`, fontFamily: FONT.sans, fontSize: "13px",
                      color: C.ink, outline: "none", background: C.creamLt,
                      boxSizing: "border-box",
                    }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={submitTagline}
                    disabled={!taglineInput.trim()}
                    style={{
                      width: "100%", padding: "10px", borderRadius: "12px", border: "none",
                      background: taglineInput.trim() ? C.green : C.sand,
                      color: C.white, fontFamily: FONT.sans, fontSize: "13px", fontWeight: 500,
                      cursor: taglineInput.trim() ? "pointer" : "default", transition: "background 200ms",
                    }}
                  >
                    Next →
                  </motion.button>
                </div>
              )}
            </CoachBubble>
          )}

          {draft.tagline && step >= 3 && (
            <UserBubble>✨ &ldquo;{draft.tagline}&rdquo;</UserBubble>
          )}

          {isTyping && step === 3 && <TypingDots />}

          {/* ── Q4: Description / About ─────────────────────────────── */}
          {step >= 4 && (
            <CoachBubble delay={0.1}>
              <div style={{ marginBottom: "10px" }}>
                Perfect tagline! Tell customers a bit more — <strong>what&rsquo;s your business about?</strong>
              </div>
              {!draft.description && step === 4 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <textarea
                    autoFocus
                    value={descriptionInput}
                    onChange={(e) => setDescriptionInput(e.target.value)}
                    placeholder="Tell customers about your business, your background, and what makes you great..."
                    rows={4}
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: "12px",
                      border: `1px solid ${C.sand}`, fontFamily: FONT.sans, fontSize: "13px",
                      color: C.ink, outline: "none", background: C.creamLt,
                      resize: "vertical", lineHeight: 1.6, boxSizing: "border-box",
                    }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={submitDescription}
                    disabled={!descriptionInput.trim()}
                    style={{
                      width: "100%", padding: "10px", borderRadius: "12px", border: "none",
                      background: descriptionInput.trim() ? C.green : C.sand,
                      color: C.white, fontFamily: FONT.sans, fontSize: "13px", fontWeight: 500,
                      cursor: descriptionInput.trim() ? "pointer" : "default", transition: "background 200ms",
                    }}
                  >
                    Next →
                  </motion.button>
                </div>
              )}
            </CoachBubble>
          )}

          {draft.description && step >= 4 && (
            <UserBubble>
              {draft.description.length > 120 ? draft.description.slice(0, 120) + "…" : draft.description}
            </UserBubble>
          )}

          {isTyping && step === 4 && <TypingDots />}

          {/* ── Q5: Services ────────────────────────────────────────── */}
          {step >= 5 && (
            <CoachBubble delay={0.1}>
              <div style={{ marginBottom: "10px" }}>
                Awesome! <strong>What services do you offer?</strong> Add a name and price (in Rand) for each.
              </div>
              {step === 5 && draft.services.length === 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {/* Column headers */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 32px", gap: "6px" }}>
                    <span style={{ fontFamily: FONT.sans, fontSize: "10px", fontWeight: 600, color: C.muted, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>
                      Service
                    </span>
                    <span style={{ fontFamily: FONT.sans, fontSize: "10px", fontWeight: 600, color: C.muted, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>
                      Price (R)
                    </span>
                  </div>

                  {servicesInput.map((row, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 90px 32px", gap: "6px", alignItems: "center" }}>
                      <input
                        autoFocus={i === 0}
                        type="text"
                        value={row.name}
                        onChange={(e) => {
                          const next = [...servicesInput];
                          next[i] = { ...next[i], name: e.target.value };
                          setServicesInput(next);
                        }}
                        placeholder={["Logo design", "Social media kit", "Flyer design"][i] ?? "Service name"}
                        style={{
                          padding: "9px 12px", borderRadius: "10px",
                          border: `1px solid ${C.sand}`, fontFamily: FONT.sans, fontSize: "13px",
                          color: C.ink, outline: "none", background: C.creamLt, boxSizing: "border-box",
                        }}
                      />
                      <div style={{ position: "relative" }}>
                        <span style={{
                          position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)",
                          fontFamily: FONT.sans, fontSize: "13px", color: C.muted, pointerEvents: "none",
                        }}>R</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={row.price}
                          onChange={(e) => {
                            const next = [...servicesInput];
                            next[i] = { ...next[i], price: e.target.value.replace(/[^0-9]/g, "") };
                            setServicesInput(next);
                          }}
                          placeholder="0"
                          style={{
                            width: "100%", padding: "9px 8px 9px 22px", borderRadius: "10px",
                            border: `1px solid ${C.sand}`, fontFamily: FONT.sans, fontSize: "13px",
                            color: C.ink, outline: "none", background: C.creamLt, boxSizing: "border-box",
                          }}
                        />
                      </div>
                      {/* Remove row */}
                      <button
                        type="button"
                        onClick={() => setServicesInput((prev) => prev.filter((_, j) => j !== i))}
                        style={{
                          width: 32, height: 32, borderRadius: "8px", border: `1px solid ${C.sand}`,
                          background: C.white, color: C.muted, fontFamily: FONT.sans, fontSize: "14px",
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {/* Add row */}
                  <button
                    type="button"
                    onClick={() => setServicesInput((prev) => [...prev, { name: "", price: "" }])}
                    style={{
                      padding: "7px 14px", borderRadius: "10px",
                      border: `1px dashed ${C.sand}`, background: "transparent",
                      fontFamily: FONT.sans, fontSize: "12px", color: C.muted,
                      cursor: "pointer", textAlign: "left",
                    }}
                  >
                    + Add another service
                  </button>

                  <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={submitServices}
                    disabled={!servicesInput.some((s) => s.name.trim())}
                    style={{
                      width: "100%", padding: "10px", borderRadius: "12px", border: "none",
                      background: servicesInput.some((s) => s.name.trim()) ? C.green : C.sand,
                      color: C.white, fontFamily: FONT.sans, fontSize: "13px", fontWeight: 500,
                      cursor: servicesInput.some((s) => s.name.trim()) ? "pointer" : "default",
                      transition: "background 200ms",
                    }}
                  >
                    Next →
                  </motion.button>
                </div>
              )}
            </CoachBubble>
          )}

          {draft.services.length > 0 && step >= 5 && (
            <UserBubble>
              📋 {draft.services.map((s) => s.price.trim() ? `${s.name} (R${s.price})` : s.name).join(", ")}
            </UserBubble>
          )}

          {isTyping && step === 5 && <TypingDots />}

          {/* ── Q6: WhatsApp number ─────────────────────────────────── */}
          {step >= 6 && (
            <CoachBubble delay={0.1}>
              <div style={{ marginBottom: "10px" }}>
                What&rsquo;s your <strong>WhatsApp number</strong>? Customers will contact you directly.
              </div>
              {!draft.whatsapp && step === 6 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <input
                    autoFocus
                    type="tel"
                    value={whatsappInput}
                    onChange={(e) => setWhatsappInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") submitWhatsapp(); }}
                    placeholder="e.g. 0721234567"
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: "12px",
                      border: `1px solid ${C.sand}`, fontFamily: FONT.sans, fontSize: "13px",
                      color: C.ink, outline: "none", background: C.creamLt,
                      boxSizing: "border-box",
                    }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={submitWhatsapp}
                    disabled={!whatsappInput.trim()}
                    style={{
                      width: "100%", padding: "10px", borderRadius: "12px", border: "none",
                      background: whatsappInput.trim() ? C.green : C.sand,
                      color: C.white, fontFamily: FONT.sans, fontSize: "13px", fontWeight: 500,
                      cursor: whatsappInput.trim() ? "pointer" : "default", transition: "background 200ms",
                    }}
                  >
                    Next →
                  </motion.button>
                </div>
              )}
            </CoachBubble>
          )}

          {draft.whatsapp && step >= 6 && (
            <UserBubble>💬 {draft.whatsapp}</UserBubble>
          )}

          {isTyping && step === 6 && <TypingDots />}

          {/* ── Q7: Response time + publish ─────────────────────────── */}
          {step >= 7 && (
            <CoachBubble delay={0.1}>
              <div style={{ marginBottom: "10px" }}>
                Almost done! <strong>How quickly do you typically reply</strong> to enquiries?
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
                {RESPONSE_TIMES.map((rt) => (
                  <motion.button
                    key={rt}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => pickResponseTime(rt)}
                    style={{
                      padding: "8px 14px", borderRadius: "999px",
                      border: `1px solid ${draft.responseTime === rt ? C.green : C.sand}`,
                      background: draft.responseTime === rt ? C.greenWash : C.white,
                      fontFamily: FONT.sans, fontSize: "12px", fontWeight: 500,
                      color: draft.responseTime === rt ? C.green : C.body,
                      cursor: "pointer", transition: "all 200ms",
                    }}
                  >
                    {rt}
                  </motion.button>
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={handlePublish}
                disabled={submitting}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  width: "100%", padding: "14px 24px", borderRadius: "999px",
                  background: submitting ? C.sand : GRAD.flow,
                  color: "white", fontFamily: FONT.sans, fontSize: "15px", fontWeight: 500,
                  border: "none", boxShadow: submitting ? "none" : "0 6px 24px rgba(34,160,107,0.3)",
                  cursor: submitting ? "wait" : "pointer", transition: "opacity 200ms",
                }}
              >
                {submitting ? "Publishing…" : "🚀 Publish my listing →"}
              </motion.button>
              <div
                style={{
                  fontFamily: FONT.sans, fontSize: "11px", color: C.muted,
                  textAlign: "center", marginTop: "8px", lineHeight: 1.5,
                }}
              >
                You can always edit or remove your listing later.
              </div>
            </CoachBubble>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* ── RIGHT: Live listing card preview ────────────────────────────── */}
        <div
          style={{
            borderLeft: `1px solid ${C.sand}`,
            position: "sticky", top: "60px",
            height: "calc(100vh - 60px)",
            overflowY: "auto",
            padding: "24px 20px",
            background: C.creamDk,
          }}
        >
          <div
            style={{
              fontFamily: FONT.sans, fontSize: "10px", fontWeight: 600,
              letterSpacing: "0.1em", textTransform: "uppercase" as const,
              color: C.muted, marginBottom: "14px",
            }}
          >
            Live preview
          </div>
          <ListingPreview draft={draft} completion={completion} categoryMeta={categoryMeta} />
        </div>
      </div>
    </div>
  );
}
