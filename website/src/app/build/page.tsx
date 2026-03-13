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
  description?: string;
}

interface ProfileData {
  idea: Idea | null;
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
        { name: `Basiese ${biz}`, price: "R50", description: `Standaard ${biz.toLowerCase()} diens — vinnig en betroubaar` },
        { name: `Premium ${biz}`, price: "R120", description: `Volledige ${biz.toLowerCase()} met ekstra aandag aan detail` },
        { name: `Spesiale pakket`, price: "R200", description: `Alles ingesluit — perfek vir gereelde klante` },
      ]
    : [
        { name: `Basic ${biz}`, price: "R50", description: `Standard ${biz.toLowerCase()} service — fast and reliable` },
        { name: `Premium ${biz}`, price: "R120", description: `Full ${biz.toLowerCase()} with extra attention to detail` },
        { name: `Special package`, price: "R200", description: `Everything included — perfect for regular clients` },
      ];

  const tagline = lang === "sa"
    ? `${biz} in ${wijk} — kwaliteit wat jy kan vertrou`
    : `${biz} in ${wijk} — quality you can trust`;

  return { bio, plan, services, tagline };
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

// ── Section label helper ─────────────────────────────────────────────────────
function SectionLabel({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: "6px",
        fontFamily: FONT.sans, fontSize: "10px", fontWeight: 600,
        letterSpacing: "0.1em", textTransform: "uppercase" as const,
        color: C.muted, marginBottom: "12px",
      }}
    >
      <span style={{ fontSize: "12px" }}>{icon}</span>
      {children}
    </div>
  );
}

// ── Section divider ─────────────────────────────────────────────────────────
function SectionDivider() {
  return (
    <div style={{ height: "1px", background: `linear-gradient(90deg, transparent, ${C.sand}, transparent)`, margin: "4px 0 20px" }} />
  );
}

// ── Paper 1-Pager ────────────────────────────────────────────────────────────
function OnePager({ profile, lang, completion }: { profile: ProfileData; lang: Lang; completion: number }) {
  const t = LANG[lang];
  const ideaName = profile.idea
    ? lang === "sa" ? profile.idea.nameSA : profile.idea.name
    : "...";
  const meta = profile.idea ? CATEGORY_META[profile.idea.category] : null;

  const hasSections = profile.services.length > 0 || profile.bio || profile.story || profile.availability || profile.promise;

  return (
    <div style={{ position: "relative" }}>

      {/* ── Header ───────────────────────────────────────────── */}
      <div style={{ padding: "24px 24px 20px" }}>

        {/* Avatar + Name row */}
        <div style={{ display: "flex", gap: "14px", alignItems: "center", marginBottom: "14px" }}>
          <motion.div
            animate={{ scale: profile.name ? 1 : 0.9, opacity: profile.name ? 1 : 0.5 }}
            style={{
              width: 52, height: 52, borderRadius: "16px",
              background: profile.photoUrl
                ? `url(${profile.photoUrl}) center/cover`
                : meta ? `linear-gradient(135deg, ${meta.color}, ${C.oceanBr})` : C.sandLt,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "22px", color: C.white, fontFamily: FONT.serif,
              fontWeight: 400, flexShrink: 0,
              border: `3px solid ${C.white}`,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            {!profile.photoUrl && (profile.name ? profile.name[0].toUpperCase() : profile.idea?.emoji || "?")}
          </motion.div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: FONT.serif, fontSize: "20px", color: C.ink, lineHeight: 1.2 }}>
              {profile.name ? `${profile.name}'s ${ideaName}` : ideaName}
            </div>
            {profile.wijk && (
              <div style={{ fontFamily: FONT.sans, fontSize: "11px", color: C.muted, marginTop: "3px" }}>
                📍 {profile.wijk}, South Africa
              </div>
            )}
          </div>
        </div>

        {/* Tagline */}
        <AnimatePresence>
          {profile.tagline && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              style={{
                fontFamily: FONT.serif, fontSize: "13px", fontStyle: "italic",
                color: C.body, lineHeight: 1.5, marginBottom: "12px",
              }}
            >
              &ldquo;{profile.tagline}&rdquo;
            </motion.div>
          )}
        </AnimatePresence>

        {/* Badges row: category + verified */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {meta && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "4px",
              padding: "3px 9px", borderRadius: "6px",
              background: `${meta.color}12`, fontFamily: FONT.sans,
              fontSize: "9px", fontWeight: 600, letterSpacing: "0.06em",
              textTransform: "uppercase" as const, color: meta.color,
            }}>
              {profile.idea?.emoji} {lang === "sa" ? meta.labelSA : meta.label}
            </div>
          )}
          {profile.name && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "3px",
              padding: "3px 9px", borderRadius: "6px",
              background: C.greenWash, fontFamily: FONT.sans,
              fontSize: "9px", fontWeight: 600, color: C.green,
            }}>
              ✓ Superpower Hub
            </div>
          )}
        </div>
      </div>

      {/* ── Divider ──────────────────────────────────────────── */}
      <div style={{ height: "1px", background: C.sandLt, margin: "0 24px" }} />

      {/* ── Body ─────────────────────────────────────────────── */}
      <div style={{ padding: "20px 24px 24px" }}>

        {/* Pre-fill: idea description + earning + skeleton sections */}
        {!hasSections && profile.idea && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Idea description */}
            <div style={{
              fontFamily: FONT.sans, fontSize: "12px", color: C.body,
              lineHeight: 1.7, marginBottom: "16px",
            }}>
              {lang === "sa" ? profile.idea.descriptionSA : profile.idea.description}
            </div>

            {/* Earning potential badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "6px 12px", borderRadius: "8px",
              background: C.orangeWash, border: `1px solid ${C.orangePale}`,
              fontFamily: FONT.sans, fontSize: "11px", fontWeight: 600,
              color: C.orange, marginBottom: "20px",
            }}>
              💰 {lang === "sa" ? "Verdien" : "Earn"}: {profile.idea.earning}
            </div>

            {/* Ghost skeleton — sections that will fill in */}
            <div style={{ opacity: 0.4 }}>
              {/* Services skeleton */}
              <div style={{ marginBottom: "16px" }}>
                <div style={{
                  fontFamily: FONT.sans, fontSize: "9px", fontWeight: 600,
                  letterSpacing: "0.1em", textTransform: "uppercase" as const,
                  color: C.soft, marginBottom: "8px",
                }}>
                  📋 {t.bou_services}
                </div>
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{
                    height: "36px", borderRadius: "8px", background: C.sandLt,
                    marginBottom: "4px",
                  }} />
                ))}
              </div>

              {/* Bio skeleton */}
              <div style={{ marginBottom: "16px" }}>
                <div style={{
                  fontFamily: FONT.sans, fontSize: "9px", fontWeight: 600,
                  letterSpacing: "0.1em", textTransform: "uppercase" as const,
                  color: C.soft, marginBottom: "8px",
                }}>
                  💬 {t.bou_about}
                </div>
                <div style={{ height: "10px", borderRadius: "4px", background: C.sandLt, width: "100%", marginBottom: "6px" }} />
                <div style={{ height: "10px", borderRadius: "4px", background: C.sandLt, width: "85%" }} />
              </div>

              {/* Plan skeleton */}
              <div style={{ marginBottom: "16px" }}>
                <div style={{
                  fontFamily: FONT.sans, fontSize: "9px", fontWeight: 600,
                  letterSpacing: "0.1em", textTransform: "uppercase" as const,
                  color: C.soft, marginBottom: "8px",
                }}>
                  🚀 {t.bou_plan}
                </div>
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", background: C.sandLt, flexShrink: 0 }} />
                    <div style={{ height: "10px", borderRadius: "4px", background: C.sandLt, flex: 1 }} />
                  </div>
                ))}
              </div>

              {/* More sections hint */}
              <div style={{
                display: "flex", gap: "6px", flexWrap: "wrap",
              }}>
                {["✦", "🕐", "✨"].map((icon, i) => (
                  <div key={i} style={{
                    height: "24px", width: "80px", borderRadius: "6px", background: C.sandLt,
                  }} />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* No idea selected at all */}
        {!hasSections && !profile.idea && (
          <div style={{
            textAlign: "center", padding: "32px 16px",
            fontFamily: FONT.sans, fontSize: "12px", color: C.soft, lineHeight: 1.7,
          }}>
            <div style={{ fontSize: "28px", marginBottom: "10px", opacity: 0.3 }}>⚡</div>
            {lang === "sa"
              ? "Kies 'n idee om te begin..."
              : "Choose an idea to get started..."}
          </div>
        )}

        {/* Services */}
        <AnimatePresence>
          {profile.services.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: "18px" }}>
              <SectionLabel icon="📋">{t.bou_services}</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {profile.services.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    style={{
                      padding: "10px 12px", borderRadius: "10px",
                      background: C.warm, border: `1px solid ${C.sandLt}`,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontFamily: FONT.sans, fontSize: "12px", fontWeight: 600, color: C.ink }}>{s.name}</span>
                      <span style={{
                        fontFamily: FONT.sans, fontSize: "12px", fontWeight: 700,
                        color: C.green, background: C.greenWash,
                        padding: "2px 8px", borderRadius: "6px",
                      }}>{s.price}</span>
                    </div>
                    {s.description && (
                      <div style={{ fontFamily: FONT.sans, fontSize: "11px", color: C.muted, lineHeight: 1.4, marginTop: "4px" }}>
                        {s.description}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* About */}
        <AnimatePresence>
          {profile.bio && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: "18px" }}>
              <SectionLabel icon="💬">{t.bou_about}</SectionLabel>
              <div style={{ fontFamily: FONT.sans, fontSize: "12px", color: C.body, lineHeight: 1.7 }}>
                {profile.bio}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* My Story */}
        <AnimatePresence>
          {profile.story && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: "18px" }}>
              <SectionLabel icon="✦">{t.bou_story}</SectionLabel>
              <div style={{
                padding: "12px 14px", borderRadius: "10px",
                background: C.warm, borderLeft: `3px solid ${C.greenBr}`,
                fontFamily: FONT.sans, fontSize: "12px", color: C.body,
                lineHeight: 1.7, fontStyle: "italic",
              }}>
                &ldquo;{profile.story}&rdquo;
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* My First Week */}
        <AnimatePresence>
          {profile.plan.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: "18px" }}>
              <SectionLabel icon="🚀">{t.bou_plan}</SectionLabel>
              <div style={{ paddingLeft: "28px", position: "relative" }}>
                <div style={{
                  position: "absolute", left: "10px", top: "12px", bottom: "12px",
                  width: "2px", background: C.greenPale,
                }} />
                {profile.plan.map((planStep, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    style={{
                      marginBottom: i < profile.plan.length - 1 ? "12px" : "0",
                      fontFamily: FONT.sans, fontSize: "12px", color: C.body,
                      lineHeight: 1.5, position: "relative",
                    }}
                  >
                    <span style={{
                      position: "absolute", left: "-28px", top: "1px",
                      width: 20, height: 20, borderRadius: "50%",
                      background: C.green, color: C.white,
                      fontSize: "10px", fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      zIndex: 1,
                    }}>
                      {i + 1}
                    </span>
                    {planStep}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Availability */}
        <AnimatePresence>
          {profile.availability && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: "18px" }}>
              <SectionLabel icon="🕐">{t.bou_availability}</SectionLabel>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "6px 12px", borderRadius: "8px",
                background: C.warm, border: `1px solid ${C.sandLt}`,
                fontFamily: FONT.sans, fontSize: "11px", fontWeight: 500, color: C.body,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.greenBr, flexShrink: 0 }} />
                {profile.availability}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* What to Expect */}
        <AnimatePresence>
          {profile.promise && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: "18px" }}>
              <SectionLabel icon="✨">{t.bou_promise}</SectionLabel>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                {profile.promise.split(",").map((p, i) => (
                  <div
                    key={i}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "4px",
                      padding: "4px 9px", borderRadius: "6px",
                      background: C.greenWash, border: `1px solid ${C.greenPale}`,
                      fontFamily: FONT.sans, fontSize: "10px", fontWeight: 500, color: C.green,
                    }}
                  >
                    ✓ {p.trim()}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        {hasSections && (
          <div style={{
            textAlign: "center", marginTop: "8px", paddingTop: "16px",
            borderTop: `1px solid ${C.sandLt}`,
            fontFamily: FONT.sans, fontSize: "9px", color: C.faint,
            letterSpacing: "0.04em",
          }}>
            Built with <span style={{ color: C.greenBr, fontWeight: 600 }}>Superpowers</span> — start yours free
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// BUILD PAGE — /build — Kasi Coach + Live 1-Pager
// ══════════════════════════════════════════════════════════════════════════════
type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export default function BouPage() {
  const router = useRouter();
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
    tagline: "",
    story: "",
    availability: "",
    promise: "",
    slug: "",
  });

  // Input states
  const [nameInput, setNameInput] = useState("");
  const [wijkInput, setWijkInput] = useState("");
  const [serviceInputs, setServiceInputs] = useState<Service[]>([
    { name: "", price: "" },
    { name: "", price: "" },
    { name: "", price: "" },
  ]);
  const [storyInput, setStoryInput] = useState("");
  const [availInput, setAvailInput] = useState("");
  const [promiseInput, setPromiseInput] = useState("");

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

  // ── Auto-save draft to sessionStorage ────────────────────────────────────
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    // Only save once we have some real data
    if (!profile.idea && !profile.name) return;

    setSaveState("saving");
    clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(() => {
      try {
        const draftData = {
          ...profile,
          idea: profile.idea ? {
            id: profile.idea.id,
            emoji: profile.idea.emoji,
            name: profile.idea.name,
            nameSA: profile.idea.nameSA,
            category: profile.idea.category,
            earning: profile.idea.earning,
            description: profile.idea.description,
            descriptionSA: profile.idea.descriptionSA,
          } : null,
          _step: step,
          _savedAt: Date.now(),
        };
        sessionStorage.setItem("sph-draft", JSON.stringify(draftData));
      } catch {}

      setSaveState("saved");
      // Reset to idle after showing "saved" for a bit
      setTimeout(() => setSaveState("idle"), 2000);
    }, 600); // 600ms debounce

    return () => clearTimeout(saveTimerRef.current);
  }, [profile, step]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [step, isTyping]);

  // Completion percentage — redistributed across 8 questions
  const completion = (() => {
    let c = 0;
    if (profile.idea) c += 10;            // Idea selected
    if (step >= 1) c += 5;                // Idea confirmed (Q1)
    if (profile.name) c += 10;            // Name entered (Q2)
    if (profile.wijk) c += 10;            // Wijk selected (Q3)
    if (profile.bio) c += 10;             // AI generates bio/plan/services
    if (profile.services.length > 0) c += 10; // Services confirmed (Q4)
    if (step >= 5) c += 5;                // Photo step (Q5, optional)
    if (profile.story) c += 15;           // Story / "What makes you different" (Q6)
    if (profile.availability) c += 10;    // Availability (Q7)
    if (profile.promise) c += 15;         // Promise / "What to expect" (Q8)
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
        tagline: generated.tagline,
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
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setStep(6);
    }, 600);
    setStep(5);
  }, []);

  // Q6: Story — "What makes you different?"
  const submitStory = useCallback(() => {
    if (!storyInput.trim()) return;
    setProfile((p) => ({ ...p, story: storyInput.trim() }));
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setStep(7);
    }, 600);
  }, [storyInput]);

  // Q7: Availability
  const submitAvailability = useCallback(() => {
    if (!availInput.trim()) return;
    setProfile((p) => ({ ...p, availability: availInput.trim() }));
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setStep(8);
    }, 600);
  }, [availInput]);

  // Q8: Promise — "What to expect"
  const submitPromise = useCallback(() => {
    if (!promiseInput.trim()) return;
    const slug = (profile.name || "my")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      + "-" + (profile.idea?.name || "biz").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 20);
    setProfile((p) => ({ ...p, promise: promiseInput.trim(), slug }));
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
    }, 800);
  }, [promiseInput, profile.name, profile.idea]);

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

          {/* Auto-save indicator */}
          <AnimatePresence mode="wait">
            {saveState !== "idle" && (
              <motion.div
                key={saveState}
                initial={{ opacity: 0, x: 8, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -4, scale: 0.95 }}
                transition={{ duration: 0.25, ease }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  fontFamily: FONT.sans,
                  fontSize: "10px",
                  fontWeight: 500,
                  color: saveState === "saved" ? C.green : C.muted,
                  letterSpacing: "0.02em",
                }}
              >
                {saveState === "saving" ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    style={{
                      width: 10, height: 10,
                      borderRadius: "50%",
                      border: `1.5px solid ${C.sandLt}`,
                      borderTopColor: C.greenBr,
                    }}
                  />
                ) : (
                  <motion.svg
                    width="10" height="10" viewBox="0 0 16 16"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    <path
                      d="M3 8.5L6.5 12L13 4"
                      stroke={C.green}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </motion.svg>
                )}
                {saveState === "saving" ? t.bou_saving : t.bou_saved}
              </motion.div>
            )}
          </AnimatePresence>

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

      {/* ── Main split layout ──────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 420px",
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

          {/* Q5: Photo — skip sends to Q6 */}
          {step === 5 && !isTyping && step < 6 && (
            <CoachBubble delay={0.2}>
              <div style={{ marginBottom: "8px" }}>{t.bou_q5}</div>
              <div style={{ fontSize: "12px", color: C.muted, marginBottom: "12px" }}>{t.bou_q5_nudge}</div>
              <div style={{ display: "flex", gap: "8px" }}>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={skipPhoto}
                  style={{
                    flex: 1, padding: "10px 16px", borderRadius: "12px",
                    border: `1px solid ${C.sand}`, background: C.white,
                    fontFamily: FONT.sans, fontSize: "13px", fontWeight: 500,
                    color: C.muted, cursor: "pointer",
                  }}
                >
                  {t.bou_q5_skip}
                </motion.button>
              </div>
            </CoachBubble>
          )}

          {/* Typing indicator */}
          {isTyping && step !== 3 && <TypingDots />}

          {/* ── Q6: "What makes you different?" ─────────────────────────── */}
          {step >= 6 && (
            <CoachBubble delay={0.2}>
              <div style={{ marginBottom: "10px" }}>{t.bou_q6}</div>
              {step === 6 && !profile.story && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <textarea
                    value={storyInput}
                    onChange={(e) => setStoryInput(e.target.value)}
                    placeholder={t.bou_q6_placeholder}
                    rows={3}
                    autoFocus
                    style={{
                      width: "100%", padding: "12px 14px", borderRadius: "12px",
                      border: `1px solid ${C.sand}`, fontFamily: FONT.sans, fontSize: "14px",
                      color: C.ink, outline: "none", background: C.creamLt,
                      resize: "none", lineHeight: 1.6,
                    }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={submitStory}
                    disabled={!storyInput.trim()}
                    style={{
                      width: "100%", padding: "10px", borderRadius: "12px", border: "none",
                      background: storyInput.trim() ? C.green : C.sand,
                      color: C.white, fontFamily: FONT.sans, fontSize: "13px", fontWeight: 500,
                      cursor: storyInput.trim() ? "pointer" : "default", transition: "background 200ms",
                    }}
                  >
                    {t.bou_next}
                  </motion.button>
                </div>
              )}
            </CoachBubble>
          )}

          {/* User story answer */}
          {profile.story && step >= 6 && (
            <UserBubble>{profile.story}</UserBubble>
          )}

          {/* ── Q7: "When are you available?" ───────────────────────────── */}
          {step >= 7 && (
            <CoachBubble delay={0.2}>
              <div style={{ marginBottom: "10px" }}>{t.bou_q7}</div>
              {step === 7 && !profile.availability && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {t.bou_q7_chips.split("|").map((chip) => (
                      <motion.button
                        key={chip}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setAvailInput(chip)}
                        style={{
                          padding: "8px 14px", borderRadius: "999px",
                          border: `1px solid ${availInput === chip ? C.green : C.sand}`,
                          background: availInput === chip ? C.greenWash : C.white,
                          fontFamily: FONT.sans, fontSize: "12px", fontWeight: 500,
                          color: availInput === chip ? C.green : C.body,
                          cursor: "pointer", transition: "all 200ms",
                        }}
                      >
                        {chip}
                      </motion.button>
                    ))}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={submitAvailability}
                    disabled={!availInput.trim()}
                    style={{
                      width: "100%", padding: "10px", borderRadius: "12px", border: "none",
                      background: availInput.trim() ? C.green : C.sand,
                      color: C.white, fontFamily: FONT.sans, fontSize: "13px", fontWeight: 500,
                      cursor: availInput.trim() ? "pointer" : "default", transition: "background 200ms",
                    }}
                  >
                    {t.bou_next}
                  </motion.button>
                </div>
              )}
            </CoachBubble>
          )}

          {/* User availability answer */}
          {profile.availability && step >= 7 && (
            <UserBubble>🕐 {profile.availability}</UserBubble>
          )}

          {/* ── Q8: "Any promise to your customers?" ────────────────────── */}
          {step >= 8 && (
            <CoachBubble delay={0.2}>
              <div style={{ marginBottom: "10px" }}>{t.bou_q8}</div>
              {step === 8 && !profile.promise && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {/* Quick-pick chips */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {t.bou_q8_chips.split("|").map((chip) => (
                      <motion.button
                        key={chip}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setPromiseInput((prev) => prev ? prev + ", " + chip : chip)}
                        style={{
                          padding: "8px 14px", borderRadius: "999px",
                          border: `1px solid ${promiseInput.includes(chip) ? C.green : C.sand}`,
                          background: promiseInput.includes(chip) ? C.greenWash : C.white,
                          fontFamily: FONT.sans, fontSize: "12px", fontWeight: 500,
                          color: promiseInput.includes(chip) ? C.green : C.body,
                          cursor: "pointer", transition: "all 200ms",
                        }}
                      >
                        {chip}
                      </motion.button>
                    ))}
                  </div>
                  <textarea
                    value={promiseInput}
                    onChange={(e) => setPromiseInput(e.target.value)}
                    placeholder={t.bou_q8_placeholder}
                    rows={2}
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: "12px",
                      border: `1px solid ${C.sand}`, fontFamily: FONT.sans, fontSize: "13px",
                      color: C.ink, outline: "none", background: C.creamLt,
                      resize: "none", lineHeight: 1.6,
                    }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={submitPromise}
                    disabled={!promiseInput.trim()}
                    style={{
                      width: "100%", padding: "10px", borderRadius: "12px", border: "none",
                      background: promiseInput.trim() ? C.green : C.sand,
                      color: C.white, fontFamily: FONT.sans, fontSize: "13px", fontWeight: 500,
                      cursor: promiseInput.trim() ? "pointer" : "default", transition: "background 200ms",
                    }}
                  >
                    {t.bou_next}
                  </motion.button>
                </div>
              )}
            </CoachBubble>
          )}

          {/* User promise answer */}
          {profile.promise && step >= 8 && (
            <UserBubble>✨ {profile.promise}</UserBubble>
          )}

          {/* ── DONE STATE — "Save my Superpower" ─────────────────────── */}
          {step >= 8 && profile.promise && !isTyping && (
            <CoachBubble delay={0.3}>
              <div
                style={{
                  fontFamily: FONT.serif,
                  fontSize: "20px",
                  color: C.ink,
                  marginBottom: "8px",
                }}
              >
                {t.bou_done_title2}
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: C.muted,
                  marginBottom: "16px",
                  lineHeight: 1.6,
                }}
              >
                {t.bou_done_sub2}
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  // Persist profile to localStorage
                  const saveData = {
                    ...profile,
                    idea: profile.idea ? {
                      id: profile.idea.id,
                      emoji: profile.idea.emoji,
                      name: profile.idea.name,
                      nameSA: profile.idea.nameSA,
                      category: profile.idea.category,
                      earning: profile.idea.earning,
                      description: profile.idea.description,
                      descriptionSA: profile.idea.descriptionSA,
                    } : null,
                  };
                  localStorage.setItem("sph-profile", JSON.stringify(saveData));
                  localStorage.setItem("sph-lang", lang);
                  router.push("/live");
                }}
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
                  border: "none",
                  boxShadow: "0 6px 24px rgba(34,160,107,0.3)",
                  cursor: "pointer",
                }}
              >
                ⚡ {t.bou_save}
                <span>→</span>
              </motion.button>
            </CoachBubble>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* ── RIGHT: Paper 1-Pager ─────────────────────────────────────── */}
        <div
          style={{
            borderLeft: `1px solid ${C.sand}`,
            position: "sticky",
            top: "56px",
            height: "calc(100vh - 56px)",
            overflowY: "auto",
            padding: "20px 16px",
            background: C.creamDk,
          }}
        >
          {/* The paper — real paper feel */}
          <div
            style={{
              position: "relative",
              transform: "rotate(0.3deg)",
            }}
          >
            {/* Paper shadow — offset, soft, like paper on a desk */}
            <div
              style={{
                position: "absolute",
                inset: "4px -2px -6px 2px",
                background: "rgba(0,0,0,0.04)",
                borderRadius: "4px",
                filter: "blur(8px)",
                transform: "rotate(-0.5deg)",
              }}
            />
            {/* Second shadow layer for depth */}
            <div
              style={{
                position: "absolute",
                bottom: "-3px",
                left: "8px",
                right: "4px",
                height: "20px",
                background: "rgba(0,0,0,0.06)",
                borderRadius: "0 0 2px 2px",
                filter: "blur(12px)",
                transform: "rotate(-0.3deg)",
              }}
            />

            {/* The paper itself */}
            <div
              style={{
                position: "relative",
                background: C.white,
                borderRadius: "3px",
                overflow: "hidden",
                /* Subtle paper edge — not perfectly round, slightly rough */
                boxShadow: `
                  0 0 0 1px rgba(0,0,0,0.04),
                  0 1px 2px rgba(0,0,0,0.06),
                  inset 0 0 80px rgba(0,0,0,0.01)
                `,
              }}
            >
              {/* Very subtle paper texture */}
              <div style={{
                position: "absolute", inset: 0, opacity: 0.015, pointerEvents: "none",
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                backgroundSize: "150px",
              }} />

              <OnePager profile={profile} lang={lang} completion={completion} />
            </div>

            {/* Folded corner hint — bottom right */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: "16px",
                height: "16px",
                background: `linear-gradient(135deg, transparent 50%, ${C.creamDk} 50%)`,
                zIndex: 2,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
