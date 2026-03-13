"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import OrgBlob from "@/components/design/OrgBlob";
import { C, GRAD, FONT } from "@/lib/tokens";
import { LANG, type Lang } from "@/lib/i18n";
import { IDEAS, CATEGORY_META, type Idea, type Category } from "@/lib/ideas";
import { WIJK_GROUPS } from "@/lib/wijk";
import type { Service, ProfileData } from "@/lib/types";
import { EMPTY_PROFILE } from "@/lib/types";
import { generateCoachContent } from "@/lib/fallback";

// Conditionally import LLM components
const USE_LLM = process.env.NEXT_PUBLIC_USE_LLM === "true";

// ── Animation presets ────────────────────────────────────────────────────────
const ease = [0.22, 1, 0.36, 1] as const;

// ── Helper: build a synthetic Idea from Path A free-text ─────────────────────
function makeCustomIdea(text: string, cat: Category | null): Idea {
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

// ══════════════════════════════════════════════════════════════════════════════
// BUILD PAGE — /build — LLM Coach or Fallback Step-Based UI
// ══════════════════════════════════════════════════════════════════════════════
export default function BouPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("sa");
  const [showPreviewMobile, setShowPreviewMobile] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Path state
  const [isPathA, setIsPathA] = useState(false);
  const [isPathC, setIsPathC] = useState(false);
  const [customIdeaText, setCustomIdeaText] = useState("");
  const [idea, setIdea] = useState<Idea | null>(null);
  const [useLLM, setUseLLM] = useState(USE_LLM);

  const t = LANG[lang];

  // Load idea from URL or localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sph-lang") as Lang | null;
    if (saved === "en" || saved === "sa") setLang(saved);

    const params = new URLSearchParams(window.location.search);
    const path = params.get("path");

    if (path === "a") {
      setIsPathA(true);
      const customText = localStorage.getItem("sph-custom-idea") || "";
      const customCat = localStorage.getItem("sph-custom-category") as Category | null;
      setCustomIdeaText(customText);
      if (customText) {
        setIdea(makeCustomIdea(customText, customCat));
      }
    } else if (path === "c") {
      setIsPathC(true);
      const ideaId = params.get("idea") || localStorage.getItem("sph-selected-idea");
      if (ideaId) {
        const found = IDEAS.find((i) => i.id === ideaId);
        if (found) setIdea(found);
      }
    } else {
      const ideaId = params.get("idea") || localStorage.getItem("sph-selected-idea");
      if (ideaId) {
        const found = IDEAS.find((i) => i.id === ideaId);
        if (found) setIdea(found);
      }
    }

    setMounted(true);
  }, []);

  // Don't render until client-side state is loaded (avoids hydration mismatch from localStorage)
  if (!mounted) {
    return (
      <div style={{ background: C.cream, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: FONT.sans, fontSize: "14px", color: C.muted }}>Loading...</div>
      </div>
    );
  }

  const path = isPathA ? "a" : isPathC ? "c" : "b";

  if (useLLM) {
    return (
      <LLMBuildPage
        lang={lang}
        setLang={setLang}
        idea={idea}
        path={path}
        isPathA={isPathA}
        isPathC={isPathC}
        customIdeaText={customIdeaText}
        showPreviewMobile={showPreviewMobile}
        setShowPreviewMobile={setShowPreviewMobile}
      />
    );
  }

  return (
    <FallbackBuildPage
      lang={lang}
      setLang={setLang}
      idea={idea}
      setIdea={setIdea}
      isPathA={isPathA}
      isPathC={isPathC}
      customIdeaText={customIdeaText}
      showPreviewMobile={showPreviewMobile}
      setShowPreviewMobile={setShowPreviewMobile}
    />
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LLM-POWERED BUILD PAGE
// ══════════════════════════════════════════════════════════════════════════════
import { useKasiCoach } from "@/hooks/useKasiCoach";
import {
  CoachBubble, UserBubble, TypingDots, SuggestionChips,
  TownshipDropdown, ServiceEditor, AvailabilityChips, PromiseChips,
  OnePager,
} from "@/components/coach";

function LLMBuildPage({
  lang, setLang, idea, path, isPathA, isPathC, customIdeaText,
  showPreviewMobile, setShowPreviewMobile,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
  idea: Idea | null;
  path: "a" | "b" | "c";
  isPathA: boolean;
  isPathC: boolean;
  customIdeaText: string;
  showPreviewMobile: boolean;
  setShowPreviewMobile: (v: boolean) => void;
}) {
  const router = useRouter();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const t = LANG[lang];

  // Build the greeting text for the coach (shown instantly as first assistant message)
  const ideaName = idea
    ? lang === "sa" ? idea.nameSA : idea.name
    : "...";

  const greetingText = (() => {
    if (!idea) return undefined;
    if (lang === "sa") {
      if (isPathA) return `Hey daar! 🔥 Ek is jou Kasi Coach. Jou idee "${customIdeaText}" klink amazing — kom ons bou jou Kasi Besigheidsplan! Wat is jou naam?`;
      if (isPathC) return `Eyyy! 🔥 Die quiz het jou gematched met "${ideaName}" — dis perfek vir jou! Kom ons bou jou Kasi Besigheidsplan saam. Wat is jou naam?`;
      return `Sharp! 🔥 "${ideaName}" is 'n lekker keuse! Ek is jou Kasi Coach — kom ons bou jou Kasi Besigheidsplan! Wat is jou naam?`;
    }
    if (isPathA) return `Hey there! 🔥 I'm your Kasi Coach. Your idea "${customIdeaText}" sounds amazing — let's build your Kasi Business Plan! What's your name?`;
    if (isPathC) return `Eyyy! 🔥 The quiz matched you with "${ideaName}" — that's a perfect fit! Let's build your Kasi Business Plan together. What's your name?`;
    return `Sharp! 🔥 "${ideaName}" is a great choice! I'm your Kasi Coach — let's build your Kasi Business Plan! What's your name?`;
  })();

  const coach = useKasiCoach({ lang, idea, path, greetingText });
  const hasError = coach.status === "error";

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [coach.messages, coach.isLoading, hasError]);

  return (
    <div style={{ background: C.cream, fontFamily: FONT.sans, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <BuildHeader
        lang={lang}
        setLang={setLang}
        isPathA={isPathA}
        isPathC={isPathC}
        completion={coach.completion}
        showPreviewMobile={showPreviewMobile}
        setShowPreviewMobile={setShowPreviewMobile}
      />

      {/* Main split layout */}
      <div
        style={{
          flex: 1, display: "grid", gridTemplateColumns: "1fr 420px",
          maxWidth: "1280px", width: "100%", margin: "0 auto", gap: "0", minHeight: 0,
        }}
      >
        {/* LEFT: Chat */}
        <div
          style={{
            padding: "24px clamp(20px, 3vw, 40px)",
            overflowY: "auto",
            position: "relative",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ position: "absolute", top: -60, right: -40, width: 260, pointerEvents: "none", opacity: 0.06 }}>
            <OrgBlob variant={3} color={C.pinkBr} />
          </div>

          <div
            style={{
              fontFamily: FONT.sans, fontSize: "10px", fontWeight: 600,
              letterSpacing: "0.12em", color: C.soft, marginBottom: "20px",
            }}
          >
            {t.bou_label}
          </div>

          {/* Messages */}
          <div style={{ flex: 1 }}>
            {coach.messages.map((msg) => {
              const textContent = msg.parts
                ?.filter((p): p is Extract<typeof p, { type: "text" }> => p.type === "text")
                .map(p => p.text)
                .filter(t => t.trim())
                .join("\n") || "";

              if (msg.role === "user") {
                if (!textContent) return null;
                return <UserBubble key={msg.id}>{textContent}</UserBubble>;
              }
              if (msg.role === "assistant") {
                if (!textContent) return null;
                return (
                  <CoachBubble key={msg.id}>
                    {textContent}
                  </CoachBubble>
                );
              }
              return null;
            })}

            {/* Active widget */}
            {coach.activeWidget === "township" && (
              <TownshipDropdown
                lang={lang}
                onSelect={(v) => coach.submitWidgetResult("township", v)}
              />
            )}
            {coach.activeWidget === "services" && (
              <ServiceEditor
                lang={lang}
                initialServices={coach.profile.services.length > 0 ? coach.profile.services : undefined}
                onSubmit={(v) => coach.submitWidgetResult("services", v)}
              />
            )}
            {coach.activeWidget === "availability" && (
              <AvailabilityChips
                lang={lang}
                onSelect={(v) => coach.submitWidgetResult("availability", v)}
              />
            )}
            {coach.activeWidget === "promise" && (
              <PromiseChips
                lang={lang}
                onSelect={(v) => coach.submitWidgetResult("promise", v)}
              />
            )}

            {/* Suggestion chips */}
            {!coach.isLoading && coach.suggestions.length > 0 && (
              <SuggestionChips
                suggestions={coach.suggestions}
                onSelect={coach.submitSuggestion}
              />
            )}

            {/* Typing indicator */}
            {coach.isLoading && <TypingDots />}

            {/* Error — retry inline, no redirect */}
            {hasError && (
              <CoachBubble>
                <div style={{ color: C.orange, fontSize: "13px" }}>
                  {lang === "sa" ? "Eish, iets het fout gegaan. Probeer weer!" : "Oops, something went wrong. Try again!"}
                  <button
                    onClick={() => coach.sendMessage({ text: lang === "sa" ? "Kom ons gaan voort" : "Let's continue" })}
                    style={{
                      display: "block", marginTop: "8px", padding: "6px 16px",
                      borderRadius: "999px", border: `1px solid ${C.green}`,
                      background: C.greenWash, color: C.green, fontFamily: FONT.sans,
                      fontSize: "12px", fontWeight: 600, cursor: "pointer",
                    }}
                  >
                    {lang === "sa" ? "Probeer weer →" : "Try again →"}
                  </button>
                </div>
              </CoachBubble>
            )}

            {/* Save button when business plan sections are done (>= 95% = all 9 sections filled) */}
            {coach.completion >= 95 && (
              <div style={{ paddingLeft: "46px", marginBottom: "16px" }}>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    coach.saveAndPublish();
                    localStorage.setItem("sph-lang", lang);
                    router.push("/live");
                  }}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    gap: "8px", width: "100%", padding: "14px 24px", borderRadius: "999px",
                    background: GRAD.flow, color: "white", fontFamily: FONT.sans,
                    fontSize: "15px", fontWeight: 500, border: "none",
                    boxShadow: "0 6px 24px rgba(34,160,107,0.3)", cursor: "pointer",
                  }}
                >
                  ⚡ {t.bou_save} <span>→</span>
                </motion.button>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Chat input — always visible at bottom */}
          <div style={{ position: "sticky", bottom: 0, paddingTop: "12px", background: C.cream }}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (coach.input.trim()) {
                  coach.handleSubmit(e);
                }
              }}
              style={{ display: "flex", gap: "8px" }}
            >
              <input
                type="text"
                value={coach.input}
                onChange={(e) => coach.setInput(e.target.value)}
                placeholder={lang === "sa" ? "Tik enige iets..." : "Type anything..."}
                style={{
                  flex: 1, padding: "12px 16px", borderRadius: "999px",
                  border: `1px solid ${C.sand}`, fontFamily: FONT.sans,
                  fontSize: "14px", color: C.ink, outline: "none",
                  background: C.white,
                }}
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!coach.input.trim() || coach.isLoading}
                style={{
                  padding: "12px 20px", borderRadius: "999px", border: "none",
                  background: coach.input.trim() ? C.green : C.sand,
                  color: C.white, fontFamily: FONT.sans, fontSize: "14px",
                  fontWeight: 500, cursor: coach.input.trim() ? "pointer" : "default",
                  transition: "background 200ms",
                }}
              >
                →
              </motion.button>
            </form>
          </div>
        </div>

        {/* RIGHT: Paper 1-Pager */}
        <PaperPreview profile={coach.profile} lang={lang} completion={coach.completion} />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// FALLBACK (STEP-BASED) BUILD PAGE
// ══════════════════════════════════════════════════════════════════════════════
type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

// Reuse CoachBubble/UserBubble/TypingDots inline for fallback (no LLM dependency)
function FallbackCoachBubble({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16, y: 6 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.4, delay, ease }}
      style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "16px" }}
    >
      <div
        style={{
          width: 36, height: 36, borderRadius: "12px", background: GRAD.flow,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "16px", flexShrink: 0, boxShadow: "0 2px 8px rgba(34,160,107,0.2)",
        }}
      >
        🤖
      </div>
      <div
        style={{
          background: C.white, border: `1px solid ${C.sand}`,
          borderRadius: "4px 16px 16px 16px", padding: "14px 18px", maxWidth: "85%",
          fontFamily: FONT.sans, fontSize: "14px", color: C.body, lineHeight: 1.65,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}

function FallbackUserBubble({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16, y: 6 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.3, ease }}
      style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}
    >
      <div
        style={{
          background: C.green, borderRadius: "16px 4px 16px 16px", padding: "12px 18px",
          maxWidth: "75%", fontFamily: FONT.sans, fontSize: "14px", color: C.white, lineHeight: 1.5,
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}

function FallbackTypingDots() {
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

// Reuse OnePager for fallback path too
const FallbackOnePager = OnePager;

function FallbackBuildPage({
  lang, setLang, idea: initialIdea, setIdea: setParentIdea, isPathA, isPathC, customIdeaText,
  showPreviewMobile, setShowPreviewMobile,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
  idea: Idea | null;
  setIdea: (i: Idea) => void;
  isPathA: boolean;
  isPathC: boolean;
  customIdeaText: string;
  showPreviewMobile: boolean;
  setShowPreviewMobile: (v: boolean) => void;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [refineInput, setRefineInput] = useState("");

  const [profile, setProfile] = useState<ProfileData>({
    ...EMPTY_PROFILE,
    idea: initialIdea,
  });

  const [nameInput, setNameInput] = useState("");
  const [wijkInput, setWijkInput] = useState("");
  const [serviceInputs, setServiceInputs] = useState<Service[]>([
    { name: "", price: "" }, { name: "", price: "" }, { name: "", price: "" },
  ]);
  const [storyInput, setStoryInput] = useState("");
  const [availInput, setAvailInput] = useState("");
  const [promiseInput, setPromiseInput] = useState("");

  const t = LANG[lang];

  // Auto-save draft
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!profile.idea && !profile.name) return;
    setSaveState("saving");
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try {
        const draftData = {
          ...profile,
          idea: profile.idea ? {
            id: profile.idea.id, emoji: profile.idea.emoji, name: profile.idea.name,
            nameSA: profile.idea.nameSA, category: profile.idea.category, earning: profile.idea.earning,
            description: profile.idea.description, descriptionSA: profile.idea.descriptionSA,
          } : null,
          _step: step, _savedAt: Date.now(),
        };
        sessionStorage.setItem("sph-draft", JSON.stringify(draftData));
      } catch {}
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    }, 600);
    return () => clearTimeout(saveTimerRef.current);
  }, [profile, step]);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [step, isTyping]);

  // Completion percentage — fallback path
  const completion = (() => {
    let c = 0;
    if (profile.idea) c += 5;
    if (profile.name) c += 10;
    if (profile.wijk) c += 10;
    if (profile.problem) c += 10;
    if (profile.bio) c += 10;
    if ((profile.targetCustomers?.length ?? 0) > 0) c += 10;
    if (profile.services.length > 0) c += 10;
    if ((profile.startingCosts?.items?.length ?? 0) > 0) c += 10;
    if (profile.marketing?.hook || profile.marketing?.platform || profile.marketing?.wordOfMouth) c += 10;
    if (profile.mvp) c += 10;
    if (profile.tagline) c += 5;
    return Math.min(c, 100);
  })();

  // Step handlers
  const confirmIdea = useCallback(() => {
    setIsTyping(true);
    setTimeout(() => { setIsTyping(false); setStep(2); }, 800);
    setStep(1);
  }, []);

  const submitRefinement = useCallback(() => {
    const refined = refineInput.trim();
    if (!refined) return;
    const customCat = localStorage.getItem("sph-custom-category") as Category | null;
    const combined = customIdeaText + " — " + refined;
    const updatedIdea = makeCustomIdea(combined, customCat);
    setProfile((p) => ({ ...p, idea: updatedIdea }));
    setIsTyping(true);
    setTimeout(() => { setIsTyping(false); setStep(2); }, 800);
    setStep(1);
  }, [refineInput, customIdeaText]);

  const submitName = useCallback(() => {
    if (!nameInput.trim()) return;
    setProfile((p) => ({ ...p, name: nameInput.trim() }));
    setIsTyping(true);
    setTimeout(() => { setIsTyping(false); setStep(3); }, 800);
  }, [nameInput]);

  const submitWijk = useCallback(() => {
    if (!wijkInput) return;
    setProfile((p) => ({ ...p, wijk: wijkInput }));
    setIsTyping(true);
    setTimeout(() => {
      const generated = generateCoachContent(profile.idea!, nameInput.trim(), wijkInput, lang);
      setProfile((p) => ({ ...p, bio: generated.bio, plan: generated.plan, services: generated.services, tagline: generated.tagline }));
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
    setTimeout(() => { setIsTyping(false); setStep(5); }, 600);
  }, [serviceInputs]);

  const skipPhoto = useCallback(() => {
    setIsTyping(true);
    setTimeout(() => { setIsTyping(false); setStep(6); }, 600);
    setStep(5);
  }, []);

  const submitStory = useCallback(() => {
    if (!storyInput.trim()) return;
    setProfile((p) => ({ ...p, story: storyInput.trim() }));
    setIsTyping(true);
    setTimeout(() => { setIsTyping(false); setStep(7); }, 600);
  }, [storyInput]);

  const submitAvailability = useCallback(() => {
    if (!availInput.trim()) return;
    setProfile((p) => ({ ...p, availability: availInput.trim() }));
    setIsTyping(true);
    setTimeout(() => { setIsTyping(false); setStep(8); }, 600);
  }, [availInput]);

  const submitPromise = useCallback(() => {
    if (!promiseInput.trim()) return;
    const slug = (profile.name || "my")
      .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
      + "-" + (profile.idea?.name || "biz").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 20);
    setProfile((p) => ({ ...p, promise: promiseInput.trim(), slug }));
    setIsTyping(true);
    setTimeout(() => { setIsTyping(false); }, 800);
  }, [promiseInput, profile.name, profile.idea]);

  const ideaName = profile.idea
    ? lang === "sa" ? profile.idea.nameSA : profile.idea.name
    : "...";

  return (
    <div style={{ background: C.cream, fontFamily: FONT.sans, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <BuildHeader
        lang={lang}
        setLang={setLang}
        isPathA={isPathA}
        isPathC={isPathC}
        completion={completion}
        showPreviewMobile={showPreviewMobile}
        setShowPreviewMobile={setShowPreviewMobile}
        saveState={saveState}
      />

      {/* Main split layout */}
      <div
        style={{
          flex: 1, display: "grid", gridTemplateColumns: "1fr 420px",
          maxWidth: "1280px", width: "100%", margin: "0 auto", gap: "0", minHeight: 0,
        }}
      >
        {/* LEFT: Kasi Coach chat */}
        <div style={{ padding: "24px clamp(20px, 3vw, 40px)", overflowY: "auto", position: "relative" }}>
          <div style={{ position: "absolute", top: -60, right: -40, width: 260, pointerEvents: "none", opacity: 0.06 }}>
            <OrgBlob variant={3} color={C.pinkBr} />
          </div>
          <div style={{ fontFamily: FONT.sans, fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", color: C.soft, marginBottom: "20px" }}>
            {t.bou_label}
          </div>

          {/* Greeting */}
          <FallbackCoachBubble>
            <div style={{ fontFamily: FONT.serif, fontSize: "18px", color: C.ink, marginBottom: "4px" }}>
              {t.bou_greeting}
            </div>
          </FallbackCoachBubble>

          {/* Q1: Path B confirm */}
          {profile.idea && step >= 0 && !isPathA && !isPathC && (
            <FallbackCoachBubble delay={0.4}>
              <div>{t.bou_q1}{" "}<strong style={{ color: C.green }}>{ideaName}</strong>{" "}{t.bou_q1_end}</div>
              {step === 0 && (
                <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={confirmIdea}
                    style={{ padding: "10px 20px", borderRadius: "12px", border: "none", background: C.green, color: C.white, fontFamily: FONT.sans, fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>
                    {t.bou_q1_yes}
                  </motion.button>
                  <Link href="/ideas" style={{ padding: "10px 20px", borderRadius: "12px", border: `1px solid ${C.sand}`, background: C.white, color: C.muted, fontFamily: FONT.sans, fontSize: "13px", fontWeight: 500, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
                    {t.bou_q1_refine}
                  </Link>
                </div>
              )}
            </FallbackCoachBubble>
          )}

          {/* Q1: Path C confirm */}
          {profile.idea && step >= 0 && isPathC && (
            <FallbackCoachBubble delay={0.4}>
              <div>{t.bou_q1_pathc}{" "}<strong style={{ color: C.green }}>{ideaName}</strong>{" "}{t.bou_q1_pathc_end}</div>
              {step === 0 && (
                <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={confirmIdea}
                    style={{ padding: "10px 20px", borderRadius: "12px", border: "none", background: C.green, color: C.white, fontFamily: FONT.sans, fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>
                    {t.bou_q1_yes}
                  </motion.button>
                  <Link href="/quiz" style={{ padding: "10px 20px", borderRadius: "12px", border: `1px solid ${C.sand}`, background: C.white, color: C.muted, fontFamily: FONT.sans, fontSize: "13px", fontWeight: 500, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
                    {t.bou_q1_refine}
                  </Link>
                </div>
              )}
            </FallbackCoachBubble>
          )}

          {/* Q1: Path A refine */}
          {profile.idea && step >= 0 && isPathA && (
            <FallbackCoachBubble delay={0.4}>
              <div style={{ marginBottom: "8px" }}>{t.bou_q1_patha}</div>
              <div style={{ padding: "12px 16px", borderRadius: "12px", background: C.creamLt, fontFamily: FONT.serif, fontSize: "15px", fontStyle: "italic", color: C.green, lineHeight: 1.5, marginBottom: "10px", borderLeft: `3px solid ${C.greenBr}` }}>
                &quot;{customIdeaText}&quot;
              </div>
              <div style={{ fontSize: "13px", color: C.muted, marginBottom: "10px" }}>{t.bou_q1_patha_refine}</div>
              {step === 0 && (
                <div style={{ display: "flex", gap: "8px", flexDirection: "column" }}>
                  <textarea value={refineInput} onChange={(e) => setRefineInput(e.target.value)} placeholder={t.bou_q1_patha_placeholder} rows={3}
                    style={{ width: "100%", padding: "12px 14px", borderRadius: "12px", border: `1px solid ${C.sand}`, fontFamily: FONT.sans, fontSize: "14px", color: C.ink, outline: "none", background: C.creamLt, resize: "none", lineHeight: 1.6 }} />
                  <div style={{ display: "flex", gap: "8px" }}>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={submitRefinement} disabled={!refineInput.trim()}
                      style={{ flex: 1, padding: "10px 20px", borderRadius: "12px", border: "none", background: refineInput.trim() ? C.green : C.sand, color: C.white, fontFamily: FONT.sans, fontSize: "13px", fontWeight: 500, cursor: refineInput.trim() ? "pointer" : "default", transition: "background 200ms" }}>
                      {t.bou_next}
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={confirmIdea}
                      style={{ padding: "10px 20px", borderRadius: "12px", border: `1px solid ${C.sand}`, background: C.white, color: C.muted, fontFamily: FONT.sans, fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>
                      {t.bou_q1_yes}
                    </motion.button>
                  </div>
                </div>
              )}
            </FallbackCoachBubble>
          )}

          {/* User confirmed */}
          {step >= 1 && !isPathA && (<FallbackUserBubble>{t.bou_q1_yes}</FallbackUserBubble>)}
          {step >= 1 && isPathA && (<FallbackUserBubble>{refineInput.trim() || t.bou_q1_yes}</FallbackUserBubble>)}

          {/* Q2: Name */}
          {step >= 2 && (
            <FallbackCoachBubble delay={0.2}>
              <div>{t.bou_q2}</div>
              {step === 2 && !profile.name && (
                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                  <input type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submitName()} placeholder={t.bou_q2_placeholder} autoFocus
                    style={{ flex: 1, padding: "10px 14px", borderRadius: "12px", border: `1px solid ${C.sand}`, fontFamily: FONT.sans, fontSize: "14px", color: C.ink, outline: "none", background: C.creamLt }} />
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={submitName} disabled={!nameInput.trim()}
                    style={{ padding: "10px 18px", borderRadius: "12px", border: "none", background: nameInput.trim() ? C.green : C.sand, color: C.white, fontFamily: FONT.sans, fontSize: "13px", fontWeight: 500, cursor: nameInput.trim() ? "pointer" : "default", transition: "background 200ms" }}>
                    →
                  </motion.button>
                </div>
              )}
            </FallbackCoachBubble>
          )}
          {profile.name && step >= 2 && (<FallbackUserBubble>{profile.name}</FallbackUserBubble>)}

          {/* Q3: Wijk */}
          {step >= 3 && (
            <FallbackCoachBubble delay={0.2}>
              <div>{t.bou_q3}</div>
              {step === 3 && !profile.wijk && (
                <div style={{ marginTop: "12px" }}>
                  <select value={wijkInput} onChange={(e) => setWijkInput(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "12px", border: `1px solid ${C.sand}`, fontFamily: FONT.sans, fontSize: "14px", color: wijkInput ? C.ink : C.muted, background: C.creamLt, outline: "none", cursor: "pointer", marginBottom: "8px" }}>
                    <option value="">{t.bou_q3_placeholder}</option>
                    {WIJK_GROUPS.map((g) => (
                      <optgroup key={g.region} label={lang === "sa" ? g.regionSA : g.region}>
                        {g.townships.map((tw) => (<option key={tw} value={tw}>{tw}</option>))}
                      </optgroup>
                    ))}
                  </select>
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={submitWijk} disabled={!wijkInput}
                    style={{ width: "100%", padding: "10px", borderRadius: "12px", border: "none", background: wijkInput ? C.green : C.sand, color: C.white, fontFamily: FONT.sans, fontSize: "13px", fontWeight: 500, cursor: wijkInput ? "pointer" : "default", transition: "background 200ms" }}>
                    {t.bou_next}
                  </motion.button>
                </div>
              )}
            </FallbackCoachBubble>
          )}
          {profile.wijk && step >= 3 && (<FallbackUserBubble>📍 {profile.wijk}</FallbackUserBubble>)}

          {/* AI loading */}
          {step === 3 && profile.wijk && isTyping && (
            <FallbackCoachBubble delay={0.1}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  style={{ width: 16, height: 16, border: `2px solid ${C.greenBr}`, borderTopColor: "transparent", borderRadius: "50%" }} />
                <span style={{ color: C.green, fontWeight: 500, fontSize: "13px" }}>{t.bou_q3_loading}</span>
              </div>
            </FallbackCoachBubble>
          )}

          {/* Q4: Services */}
          {step >= 4 && (
            <FallbackCoachBubble delay={0.2}>
              <div style={{ marginBottom: "12px" }}>{t.bou_q4}</div>
              {step === 4 && (
                <div>
                  {serviceInputs.map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                      <input type="text" value={s.name} onChange={(e) => { const next = [...serviceInputs]; next[i] = { ...next[i], name: e.target.value }; setServiceInputs(next); }} placeholder={`Service ${i + 1}`}
                        style={{ flex: 1, padding: "8px 12px", borderRadius: "10px", border: `1px solid ${C.sand}`, fontFamily: FONT.sans, fontSize: "13px", color: C.ink, outline: "none", background: C.creamLt }} />
                      <input type="text" value={s.price} onChange={(e) => { const next = [...serviceInputs]; next[i] = { ...next[i], price: e.target.value }; setServiceInputs(next); }} placeholder={t.bou_q4_price}
                        style={{ width: "80px", padding: "8px 10px", borderRadius: "10px", border: `1px solid ${C.sand}`, fontFamily: FONT.sans, fontSize: "13px", color: C.green, fontWeight: 600, outline: "none", background: C.creamLt, textAlign: "right" }} />
                    </div>
                  ))}
                  <button onClick={() => setServiceInputs([...serviceInputs, { name: "", price: "" }])}
                    style={{ padding: "6px 12px", borderRadius: "8px", border: `1px dashed ${C.sand}`, background: "transparent", fontFamily: FONT.sans, fontSize: "12px", color: C.muted, cursor: "pointer", marginBottom: "12px" }}>
                    + {t.bou_q4_add}
                  </button>
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={submitServices}
                    style={{ width: "100%", padding: "10px", borderRadius: "12px", border: "none", background: C.green, color: C.white, fontFamily: FONT.sans, fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>
                    {t.bou_next}
                  </motion.button>
                </div>
              )}
            </FallbackCoachBubble>
          )}
          {step >= 5 && profile.services.length > 0 && (
            <FallbackUserBubble>{profile.services.map((s) => `${s.name} — ${s.price}`).join(", ")}</FallbackUserBubble>
          )}

          {/* Q5: Photo */}
          {step === 5 && !isTyping && step < 6 && (
            <FallbackCoachBubble delay={0.2}>
              <div style={{ marginBottom: "8px" }}>{t.bou_q5}</div>
              <div style={{ fontSize: "12px", color: C.muted, marginBottom: "12px" }}>{t.bou_q5_nudge}</div>
              <div style={{ display: "flex", gap: "8px" }}>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={skipPhoto}
                  style={{ flex: 1, padding: "10px 16px", borderRadius: "12px", border: `1px solid ${C.sand}`, background: C.white, fontFamily: FONT.sans, fontSize: "13px", fontWeight: 500, color: C.muted, cursor: "pointer" }}>
                  {t.bou_q5_skip}
                </motion.button>
              </div>
            </FallbackCoachBubble>
          )}

          {isTyping && step !== 3 && <FallbackTypingDots />}

          {/* Q6: Story */}
          {step >= 6 && (
            <FallbackCoachBubble delay={0.2}>
              <div style={{ marginBottom: "10px" }}>{t.bou_q6}</div>
              {step === 6 && !profile.story && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <textarea value={storyInput} onChange={(e) => setStoryInput(e.target.value)} placeholder={t.bou_q6_placeholder} rows={3} autoFocus
                    style={{ width: "100%", padding: "12px 14px", borderRadius: "12px", border: `1px solid ${C.sand}`, fontFamily: FONT.sans, fontSize: "14px", color: C.ink, outline: "none", background: C.creamLt, resize: "none", lineHeight: 1.6 }} />
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={submitStory} disabled={!storyInput.trim()}
                    style={{ width: "100%", padding: "10px", borderRadius: "12px", border: "none", background: storyInput.trim() ? C.green : C.sand, color: C.white, fontFamily: FONT.sans, fontSize: "13px", fontWeight: 500, cursor: storyInput.trim() ? "pointer" : "default", transition: "background 200ms" }}>
                    {t.bou_next}
                  </motion.button>
                </div>
              )}
            </FallbackCoachBubble>
          )}
          {profile.story && step >= 6 && (<FallbackUserBubble>{profile.story}</FallbackUserBubble>)}

          {/* Q7: Availability */}
          {step >= 7 && (
            <FallbackCoachBubble delay={0.2}>
              <div style={{ marginBottom: "10px" }}>{t.bou_q7}</div>
              {step === 7 && !profile.availability && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {t.bou_q7_chips.split("|").map((chip) => (
                      <motion.button key={chip} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setAvailInput(chip)}
                        style={{ padding: "8px 14px", borderRadius: "999px", border: `1px solid ${availInput === chip ? C.green : C.sand}`, background: availInput === chip ? C.greenWash : C.white, fontFamily: FONT.sans, fontSize: "12px", fontWeight: 500, color: availInput === chip ? C.green : C.body, cursor: "pointer", transition: "all 200ms" }}>
                        {chip}
                      </motion.button>
                    ))}
                  </div>
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={submitAvailability} disabled={!availInput.trim()}
                    style={{ width: "100%", padding: "10px", borderRadius: "12px", border: "none", background: availInput.trim() ? C.green : C.sand, color: C.white, fontFamily: FONT.sans, fontSize: "13px", fontWeight: 500, cursor: availInput.trim() ? "pointer" : "default", transition: "background 200ms" }}>
                    {t.bou_next}
                  </motion.button>
                </div>
              )}
            </FallbackCoachBubble>
          )}
          {profile.availability && step >= 7 && (<FallbackUserBubble>🕐 {profile.availability}</FallbackUserBubble>)}

          {/* Q8: Promise */}
          {step >= 8 && (
            <FallbackCoachBubble delay={0.2}>
              <div style={{ marginBottom: "10px" }}>{t.bou_q8}</div>
              {step === 8 && !profile.promise && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {t.bou_q8_chips.split("|").map((chip) => (
                      <motion.button key={chip} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setPromiseInput((prev) => prev ? prev + ", " + chip : chip)}
                        style={{ padding: "8px 14px", borderRadius: "999px", border: `1px solid ${promiseInput.includes(chip) ? C.green : C.sand}`, background: promiseInput.includes(chip) ? C.greenWash : C.white, fontFamily: FONT.sans, fontSize: "12px", fontWeight: 500, color: promiseInput.includes(chip) ? C.green : C.body, cursor: "pointer", transition: "all 200ms" }}>
                        {chip}
                      </motion.button>
                    ))}
                  </div>
                  <textarea value={promiseInput} onChange={(e) => setPromiseInput(e.target.value)} placeholder={t.bou_q8_placeholder} rows={2}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "12px", border: `1px solid ${C.sand}`, fontFamily: FONT.sans, fontSize: "13px", color: C.ink, outline: "none", background: C.creamLt, resize: "none", lineHeight: 1.6 }} />
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={submitPromise} disabled={!promiseInput.trim()}
                    style={{ width: "100%", padding: "10px", borderRadius: "12px", border: "none", background: promiseInput.trim() ? C.green : C.sand, color: C.white, fontFamily: FONT.sans, fontSize: "13px", fontWeight: 500, cursor: promiseInput.trim() ? "pointer" : "default", transition: "background 200ms" }}>
                    {t.bou_next}
                  </motion.button>
                </div>
              )}
            </FallbackCoachBubble>
          )}
          {profile.promise && step >= 8 && (<FallbackUserBubble>✨ {profile.promise}</FallbackUserBubble>)}

          {/* Done */}
          {step >= 8 && profile.promise && !isTyping && (
            <FallbackCoachBubble delay={0.3}>
              <div style={{ fontFamily: FONT.serif, fontSize: "20px", color: C.ink, marginBottom: "8px" }}>{t.bou_done_title2}</div>
              <div style={{ fontSize: "13px", color: C.muted, marginBottom: "16px", lineHeight: 1.6 }}>{t.bou_done_sub2}</div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  const saveData = {
                    ...profile,
                    idea: profile.idea ? {
                      id: profile.idea.id, emoji: profile.idea.emoji, name: profile.idea.name,
                      nameSA: profile.idea.nameSA, category: profile.idea.category, earning: profile.idea.earning,
                      description: profile.idea.description, descriptionSA: profile.idea.descriptionSA,
                    } : null,
                  };
                  localStorage.setItem("sph-profile", JSON.stringify(saveData));
                  localStorage.setItem("sph-lang", lang);
                  router.push("/live");
                }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  gap: "8px", width: "100%", padding: "14px 24px", borderRadius: "999px",
                  background: GRAD.flow, color: "white", fontFamily: FONT.sans,
                  fontSize: "15px", fontWeight: 500, border: "none",
                  boxShadow: "0 6px 24px rgba(34,160,107,0.3)", cursor: "pointer",
                }}
              >
                ⚡ {t.bou_save} <span>→</span>
              </motion.button>
            </FallbackCoachBubble>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* RIGHT: Paper 1-Pager */}
        <PaperPreview profile={profile} lang={lang} completion={completion} />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════
function BuildHeader({
  lang, setLang, isPathA, isPathC, completion,
  showPreviewMobile, setShowPreviewMobile, saveState,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
  isPathA: boolean;
  isPathC: boolean;
  completion: number;
  showPreviewMobile: boolean;
  setShowPreviewMobile: (v: boolean) => void;
  saveState?: "idle" | "saving" | "saved";
}) {
  const t = LANG[lang];
  return (
    <div
      style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(237,233,224,0.92)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        borderBottom: `1px solid ${C.sand}`, padding: "0 clamp(16px, 3vw, 32px)",
        height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <Link
          href={isPathA ? "/idea" : isPathC ? "/quiz" : "/ideas"}
          style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            fontFamily: FONT.sans, fontSize: "13px", fontWeight: 500,
            color: C.muted, textDecoration: "none",
          }}
        >
          <span style={{ fontSize: "16px" }}>←</span>
          {t.bou_back}
        </Link>
        <div style={{ width: "1px", height: "20px", background: C.sand }} />
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ fontFamily: FONT.serif, fontSize: "18px", fontWeight: 400, color: C.ink }}>Superpowers</span>
        </Link>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          onClick={() => setShowPreviewMobile(!showPreviewMobile)}
          style={{
            display: "none", padding: "6px 12px", borderRadius: "999px",
            border: `1px solid ${C.sand}`, background: showPreviewMobile ? C.green : C.white,
            color: showPreviewMobile ? C.white : C.muted, fontFamily: FONT.sans,
            fontSize: "11px", fontWeight: 500, cursor: "pointer",
          }}
        >
          {t.bou_preview}
        </button>

        {/* Progress */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 14px", borderRadius: "999px", background: C.white, border: `1px solid ${C.sand}` }}>
          <div style={{ width: 60, height: 4, borderRadius: "999px", background: C.sandLt, overflow: "hidden" }}>
            <motion.div animate={{ width: `${completion}%` }} transition={{ duration: 0.5, ease }} style={{ height: "100%", background: GRAD.flow, borderRadius: "999px" }} />
          </div>
          <span style={{ fontFamily: FONT.sans, fontSize: "11px", fontWeight: 600, color: completion === 100 ? C.green : C.muted }}>{completion}%</span>
        </div>

        {/* Save indicator (fallback only) */}
        {saveState && saveState !== "idle" && (
          <AnimatePresence mode="wait">
            <motion.div
              key={saveState}
              initial={{ opacity: 0, x: 8, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -4, scale: 0.95 }}
              transition={{ duration: 0.25, ease }}
              style={{
                display: "flex", alignItems: "center", gap: "5px",
                fontFamily: FONT.sans, fontSize: "10px", fontWeight: 500,
                color: saveState === "saved" ? C.green : C.muted, letterSpacing: "0.02em",
              }}
            >
              {saveState === "saving" ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  style={{ width: 10, height: 10, borderRadius: "50%", border: `1.5px solid ${C.sandLt}`, borderTopColor: C.greenBr }}
                />
              ) : (
                <motion.svg width="10" height="10" viewBox="0 0 16 16" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}>
                  <path d="M3 8.5L6.5 12L13 4" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </motion.svg>
              )}
              {saveState === "saving" ? t.bou_saving : t.bou_saved}
            </motion.div>
          </AnimatePresence>
        )}

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
                transition: "background 200ms, color 200ms",
              }}
            >
              {l.toUpperCase()}
            </span>
          ))}
        </button>
      </div>
    </div>
  );
}

function PaperPreview({ profile, lang, completion }: { profile: ProfileData; lang: Lang; completion: number }) {
  return (
    <div
      style={{
        borderLeft: `1px solid ${C.sand}`, position: "sticky", top: "56px",
        height: "calc(100vh - 56px)", overflowY: "auto", padding: "20px 16px", background: C.creamDk,
      }}
    >
      <div style={{ position: "relative", transform: "rotate(0.3deg)" }}>
        <div style={{ position: "absolute", inset: "4px -2px -6px 2px", background: "rgba(0,0,0,0.04)", borderRadius: "4px", filter: "blur(8px)", transform: "rotate(-0.5deg)" }} />
        <div style={{ position: "absolute", bottom: "-3px", left: "8px", right: "4px", height: "20px", background: "rgba(0,0,0,0.06)", borderRadius: "0 0 2px 2px", filter: "blur(12px)", transform: "rotate(-0.3deg)" }} />
        <div
          style={{
            position: "relative", background: C.white, borderRadius: "3px", overflow: "hidden",
            boxShadow: `0 0 0 1px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06), inset 0 0 80px rgba(0,0,0,0.01)`,
          }}
        >
          <div style={{
            position: "absolute", inset: 0, opacity: 0.015, pointerEvents: "none",
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "150px",
          }} />
          <FallbackOnePager profile={profile} lang={lang} completion={completion} />
        </div>
        <div style={{ position: "absolute", bottom: 0, right: 0, width: "16px", height: "16px", background: `linear-gradient(135deg, transparent 50%, ${C.creamDk} 50%)`, zIndex: 2 }} />
      </div>
    </div>
  );
}
