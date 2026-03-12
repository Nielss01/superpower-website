"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import OrgBlob from "@/components/design/OrgBlob";
import { C, GRAD, FONT } from "@/lib/tokens";
import { LANG, type Lang } from "@/lib/i18n";
import { IDEAS, CATEGORY_META, type Idea } from "@/lib/ideas";

// ── Animation ────────────────────────────────────────────────────────────────
const ease = [0.22, 1, 0.36, 1] as const;

// ── Quiz data structure ──────────────────────────────────────────────────────
interface QuizQuestion {
  key: string;
  emoji: string;
  blobColor: string;
  blobVariant: 1 | 2 | 3 | 4 | 5 | 6;
  answers: { key: string; emoji: string; tags: string[] }[];
}

const QUIZ: QuizQuestion[] = [
  {
    key: "q1",
    emoji: "🎯",
    blobColor: "#22A06B",
    blobVariant: 3,
    answers: [
      { key: "a1", emoji: "⚽", tags: ["active", "outdoor", "community"] },
      { key: "a2", emoji: "🎨", tags: ["creative", "visual", "solo"] },
      { key: "a3", emoji: "🎵", tags: ["creative", "social", "performance"] },
      { key: "a4", emoji: "💻", tags: ["tech", "indoor", "solo"] },
      { key: "a5", emoji: "🍳", tags: ["food", "indoor", "practical"] },
      { key: "a6", emoji: "💰", tags: ["business", "hustle", "social"] },
    ],
  },
  {
    key: "q2",
    emoji: "🧠",
    blobColor: "#38BDF8",
    blobVariant: 4,
    answers: [
      { key: "a1", emoji: "🧘", tags: ["solo", "focused"] },
      { key: "a2", emoji: "👥", tags: ["social", "team"] },
      { key: "a3", emoji: "🌳", tags: ["outdoor", "active"] },
      { key: "a4", emoji: "🏠", tags: ["indoor", "focused"] },
    ],
  },
  {
    key: "q3",
    emoji: "⏰",
    blobColor: "#D4763C",
    blobVariant: 5,
    answers: [
      { key: "a1", emoji: "⚡", tags: ["quick", "minimal"] },
      { key: "a2", emoji: "📅", tags: ["moderate", "flexible"] },
      { key: "a3", emoji: "🌅", tags: ["weekend", "batch"] },
      { key: "a4", emoji: "🔥", tags: ["fulltime", "dedicated"] },
    ],
  },
  {
    key: "q4",
    emoji: "💸",
    blobColor: "#F472B6",
    blobVariant: 6,
    answers: [
      { key: "a1", emoji: "🆓", tags: ["zero", "service"] },
      { key: "a2", emoji: "🪙", tags: ["low", "simple"] },
      { key: "a3", emoji: "💵", tags: ["medium", "materials"] },
      { key: "a4", emoji: "📦", tags: ["investment", "stock"] },
    ],
  },
  {
    key: "q5",
    emoji: "🏘️",
    blobColor: "#2B8FCC",
    blobVariant: 2,
    answers: [
      { key: "a1", emoji: "👧", tags: ["kids", "education", "play"] },
      { key: "a2", emoji: "👷", tags: ["workers", "service", "busy"] },
      { key: "a3", emoji: "🎓", tags: ["students", "tech", "learn"] },
      { key: "a4", emoji: "🌍", tags: ["everyone", "general"] },
    ],
  },
];

// ── Match engine — score ideas based on quiz tags ────────────────────────────
// Maps answer tags → idea IDs that are a good fit
const TAG_IDEA_MAP: Record<string, string[]> = {
  active:      ["eco-car-wash", "mobile-laundry", "walking-school-bus", "street-clean-crew", "weekend-tournament"],
  outdoor:     ["eco-car-wash", "fresh-veggie-box", "community-garden", "street-clean-crew"],
  creative:    ["diy-candle-studio", "bead-jewelry", "tshirt-press", "mural-artist", "content-creator"],
  visual:      ["mural-artist", "content-creator", "tshirt-press", "photo-booth"],
  solo:        ["sneaker-rescue", "braiding-booker", "phone-repair-hub", "laptop-clinic"],
  tech:        ["phone-repair-hub", "laptop-clinic", "wifi-hotspot", "app-tester", "ai-homework"],
  indoor:      ["phone-repair-hub", "laptop-clinic", "ai-homework", "braiding-booker"],
  food:        ["late-night-bites", "fresh-veggie-box", "spaza-restock"],
  business:    ["thrift-flipper", "airtime-reseller", "spaza-restock", "mobile-laundry"],
  hustle:      ["airtime-reseller", "queue-standin", "thrift-flipper", "late-night-bites"],
  social:      ["weekend-tournament", "trusted-babysitters", "safety-alert", "lost-found-bot"],
  team:        ["street-clean-crew", "weekend-tournament", "walking-school-bus"],
  focused:     ["sneaker-rescue", "phone-repair-hub", "braiding-booker"],
  quick:       ["airtime-reseller", "queue-standin", "clinic-tracker"],
  moderate:    ["sneaker-rescue", "braiding-booker", "late-night-bites"],
  weekend:     ["eco-car-wash", "weekend-tournament", "thrift-flipper"],
  fulltime:    ["mobile-laundry", "fresh-veggie-box", "spaza-restock"],
  zero:        ["sneaker-rescue", "clinic-tracker", "lost-found-bot", "safety-alert", "water-power-update"],
  low:         ["late-night-bites", "airtime-reseller", "community-garden"],
  medium:      ["thrift-flipper", "fresh-veggie-box", "bead-jewelry"],
  investment:  ["spaza-restock", "phone-repair-hub"],
  service:     ["queue-standin", "mobile-laundry", "braiding-booker", "eco-car-wash"],
  kids:        ["walking-school-bus", "trusted-babysitters", "ai-homework"],
  education:   ["ai-homework", "homework-hero", "study-group-host"],
  workers:     ["queue-standin", "clinic-tracker", "late-night-bites", "mobile-laundry"],
  students:    ["airtime-reseller", "wifi-hotspot", "ai-homework", "phone-repair-hub"],
  everyone:    ["sneaker-rescue", "thrift-flipper", "eco-car-wash", "lost-found-bot"],
  general:     ["sneaker-rescue", "airtime-reseller", "mobile-laundry"],
  performance: ["content-creator", "weekend-tournament"],
  practical:   ["late-night-bites", "fresh-veggie-box", "spaza-restock"],
  play:        ["weekend-tournament", "trusted-babysitters"],
  busy:        ["queue-standin", "late-night-bites", "airtime-reseller"],
  learn:       ["ai-homework", "homework-hero", "study-group-host"],
  simple:      ["sneaker-rescue", "airtime-reseller", "queue-standin"],
  materials:   ["bead-jewelry", "diy-candle-studio", "tshirt-press"],
  stock:       ["spaza-restock", "fresh-veggie-box", "thrift-flipper"],
  batch:       ["eco-car-wash", "fresh-veggie-box", "weekend-tournament"],
  dedicated:   ["mobile-laundry", "braiding-booker", "spaza-restock"],
  flexible:    ["sneaker-rescue", "late-night-bites", "airtime-reseller"],
  minimal:     ["clinic-tracker", "safety-alert", "water-power-update"],
};

// Why-fit phrases per idea for the results screen
const MATCH_REASONS_EN: Record<string, string> = {
  "sneaker-rescue":     "You like working with your hands and you can start with R0",
  "thrift-flipper":     "You've got an eye for style and love the hustle",
  "late-night-bites":   "You enjoy cooking and there's always demand after dark",
  "eco-car-wash":       "You like being outside and weekends are your power time",
  "mobile-laundry":     "You're dedicated and love practical, everyday services",
  "braiding-booker":    "Creative solo work that people always need",
  "airtime-reseller":   "Quick hustle that works for students and workers alike",
  "queue-standin":      "Service-minded and available — workers will pay for this",
  "clinic-tracker":     "Tech-smart and community-minded — start for free",
  "phone-repair-hub":   "Tech-focused and you can work indoors on your own time",
  "weekend-tournament": "Social, active, and great for bringing the community together",
  "fresh-veggie-box":   "Practical, healthy, and there's always demand in every area",
  "spaza-restock":      "Business-minded — you see opportunities others miss",
  "ai-homework":        "You're into tech and there are students everywhere who need help",
  "walking-school-bus": "Active, community-focused, and parents will thank you",
  "safety-alert":       "Community-minded — you can start a safety network for free",
  "trusted-babysitters":"Social, reliable, and every area needs trusted childcare",
  "community-garden":   "Outdoor + practical — grow food, sell it, build community",
  "street-clean-crew":  "Active team player — earn from recycling while cleaning up",
  "lost-found-bot":     "Tech-savvy community builder — start a WhatsApp group today",
  "water-power-update": "Be the reliable info source your neighborhood needs",
  "content-creator":    "Creative and visual — share your talent with the world",
};
const MATCH_REASONS_SA: Record<string, string> = {
  "sneaker-rescue":     "Jy hou daarvan om met jou hande te werk en jy kan met R0 begin",
  "thrift-flipper":     "Jy het 'n oog vir styl en hou van die hustle",
  "late-night-bites":   "Jy geniet kook en daar is altyd vraag na donker",
  "eco-car-wash":       "Jy hou daarvan om buite te wees en naweke is jou krag-tyd",
  "mobile-laundry":     "Jy is toegewy en hou van praktiese, alledaagse dienste",
  "braiding-booker":    "Kreatiewe solo werk wat mense altyd nodig het",
  "airtime-reseller":   "Vinnige hustle wat werk vir studente en werkers",
  "queue-standin":      "Diensgerig en beskikbaar — werkers sal hiervoor betaal",
  "clinic-tracker":     "Tegnologies slim en gemeenskaps-gerig — begin gratis",
  "phone-repair-hub":   "Tegnologies gefokus en jy kan binne werk op jou eie tyd",
  "weekend-tournament": "Sosiaal, aktief, en perfek om die gemeenskap saam te bring",
  "fresh-veggie-box":   "Prakties, gesond, en daar is altyd vraag in elke area",
  "spaza-restock":      "Besigheidsingesteld — jy sien geleenthede wat ander mis",
  "ai-homework":        "Jy is lief vir tegnologie en studente oral het hulp nodig",
  "walking-school-bus": "Aktief, gemeenskaps-gefokus, en ouers sal jou bedank",
  "safety-alert":       "Gemeenskaps-gerig — begin 'n veiligheidsnetwerk gratis",
  "trusted-babysitters":"Sosiaal, betroubaar, en elke area het betroubare kinderoppas nodig",
  "community-garden":   "Buite + prakties — groei kos, verkoop dit, bou gemeenskap",
  "street-clean-crew":  "Aktiewe spanspeler — verdien van herwinning terwyl jy skoonmaak",
  "lost-found-bot":     "Tegnologies bekwame gemeenskapbouer — begin vandag 'n WhatsApp groep",
  "water-power-update": "Wees die betroubare inligtingsbron wat jou buurt nodig het",
  "content-creator":    "Kreatief en visueel — deel jou talent met die wêreld",
};

function matchIdeas(answers: (string[] | null)[]): { idea: Idea; reason: string; reasonSA: string; score: number }[] {
  // Collect all tags from selected answers
  const allTags: string[] = [];
  answers.forEach((tags) => {
    if (tags) allTags.push(...tags);
  });

  // Score each idea
  const scores: Record<string, number> = {};
  for (const tag of allTags) {
    const ideaIds = TAG_IDEA_MAP[tag] || [];
    for (const id of ideaIds) {
      scores[id] = (scores[id] || 0) + 1;
    }
  }

  // Sort by score, get top 3 with actual Idea data
  return Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([id, score]) => {
      const idea = IDEAS.find((i) => i.id === id);
      return idea
        ? {
            idea,
            reason: MATCH_REASONS_EN[id] || "Great match based on your answers",
            reasonSA: MATCH_REASONS_SA[id] || "Goeie keuse gebaseer op jou antwoorde",
            score,
          }
        : null;
    })
    .filter(Boolean) as { idea: Idea; reason: string; reasonSA: string; score: number }[];
}

// ── Answer Chip ──────────────────────────────────────────────────────────────
function AnswerChip({
  emoji,
  label,
  selected,
  color,
  onClick,
  index,
}: {
  emoji: string;
  label: string;
  selected: boolean;
  color: string;
  onClick: () => void;
  index: number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 16, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease }}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "16px 22px",
        borderRadius: "16px",
        border: selected ? "none" : `1px solid ${C.sand}`,
        background: selected ? color : C.white,
        color: selected ? C.white : C.ink,
        fontFamily: FONT.sans,
        fontSize: "15px",
        fontWeight: 500,
        cursor: "pointer",
        transition: "background 200ms, color 200ms, border 200ms",
        boxShadow: selected
          ? `0 6px 24px ${color}40`
          : "0 2px 8px rgba(0,0,0,0.04)",
        width: "100%",
        textAlign: "left",
      }}
    >
      <span style={{ fontSize: "22px", flexShrink: 0 }}>{emoji}</span>
      <span>{label}</span>
      {selected && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
          style={{ marginLeft: "auto", fontSize: "16px" }}
        >
          ✓
        </motion.span>
      )}
    </motion.button>
  );
}

// ── Match Result Card ────────────────────────────────────────────────────────
function MatchCard({
  idea,
  reason,
  rank,
  lang,
  onSelect,
}: {
  idea: Idea;
  reason: string;
  rank: number;
  lang: Lang;
  onSelect: () => void;
}) {
  const t = LANG[lang];
  const meta = CATEGORY_META[idea.category];
  const name = lang === "sa" ? idea.nameSA : idea.name;
  const desc = lang === "sa" ? idea.descriptionSA : idea.description;
  const [hovered, setHovered] = useState(false);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: rank * 0.15, ease }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <div
        style={{
          padding: rank === 0 ? "2px" : "1px",
          borderRadius: "22px",
          background: rank === 0 ? GRAD.flow : hovered ? meta.color : C.sand,
          transition: "background 300ms, padding 200ms",
          boxShadow: rank === 0
            ? `0 12px 48px ${meta.color}30`
            : hovered
              ? "0 12px 36px rgba(0,0,0,0.08)"
              : "0 2px 8px rgba(0,0,0,0.03)",
        }}
      >
        <div
          style={{
            background: C.white,
            borderRadius: "20px",
            padding: "28px 24px 22px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background blob */}
          <div
            style={{
              position: "absolute",
              top: -40,
              right: -40,
              width: 180,
              opacity: hovered ? 0.2 : rank === 0 ? 0.12 : 0.06,
              transition: "opacity 400ms",
              pointerEvents: "none",
            }}
          >
            <OrgBlob
              variant={((rank % 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6}
              color={meta.color}
              opacity={0.6}
            />
          </div>

          {/* Rank medal + Emoji row */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
            <span style={{ fontSize: "28px" }}>{medals[rank]}</span>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "14px",
                background: rank === 0 ? meta.color : meta.wash,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                transition: "background 300ms",
              }}
            >
              {idea.emoji}
            </div>
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
              }}
            >
              {lang === "sa" ? meta.labelSA : meta.label}
            </div>
          </div>

          {/* Name */}
          <div
            style={{
              fontFamily: FONT.serif,
              fontSize: rank === 0 ? "22px" : "19px",
              fontWeight: 400,
              color: C.ink,
              lineHeight: 1.25,
              marginBottom: "6px",
            }}
          >
            {name}
          </div>

          {/* Description */}
          <div
            style={{
              fontFamily: FONT.sans,
              fontSize: "13px",
              color: C.muted,
              lineHeight: 1.6,
              marginBottom: "12px",
            }}
          >
            {desc}
          </div>

          {/* Match reason */}
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "12px",
              background: C.creamLt,
              borderLeft: `3px solid ${meta.color}`,
              fontFamily: FONT.sans,
              fontSize: "12px",
              color: C.body,
              lineHeight: 1.6,
              marginBottom: "16px",
            }}
          >
            <span style={{ fontWeight: 600, color: meta.color }}>{t.quiz_match_why}</span>{" "}
            {reason}
          </div>

          {/* Earning + CTA */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "4px 10px",
                borderRadius: "999px",
                background: C.sandLt,
                fontFamily: FONT.sans,
                fontSize: "11px",
                fontWeight: 500,
                color: C.body,
              }}
            >
              <span style={{ color: meta.color, fontSize: "10px" }}>●</span>
              {idea.earning}
            </div>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onSelect}
              style={{
                padding: "10px 22px",
                borderRadius: "999px",
                border: "none",
                background: rank === 0 ? GRAD.flow : meta.color,
                color: "white",
                fontFamily: FONT.sans,
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                boxShadow: rank === 0
                  ? "0 4px 20px rgba(34,160,107,0.35)"
                  : `0 4px 16px ${meta.color}30`,
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {t.quiz_match_cta}
              <span>→</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// QUIZ PAGE — Path C — "Help me choose"
// ══════════════════════════════════════════════════════════════════════════════
type Phase = "intro" | "quiz" | "loading" | "results";

export default function QuizPage() {
  const [lang, setLang] = useState<Lang>("sa");
  const [phase, setPhase] = useState<Phase>("intro");
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<(string[] | null)[]>([null, null, null, null, null]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [matches, setMatches] = useState<{ idea: Idea; reason: string; reasonSA: string; score: number }[]>([]);

  const t = LANG[lang];
  const q = QUIZ[qIndex];

  // Persist language
  useEffect(() => {
    const saved = localStorage.getItem("sph-lang") as Lang | null;
    if (saved === "en" || saved === "sa") setLang(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem("sph-lang", lang);
  }, [lang]);

  const startQuiz = useCallback(() => {
    setPhase("quiz");
    setQIndex(0);
    setSelectedAnswer(null);
  }, []);

  const selectAnswer = useCallback((answerKey: string, tags: string[]) => {
    setSelectedAnswer(answerKey);
    const next = [...answers];
    next[qIndex] = tags;
    setAnswers(next);

    // Auto-advance after short delay
    setTimeout(() => {
      if (qIndex < 4) {
        setQIndex(qIndex + 1);
        setSelectedAnswer(null);
      } else {
        // All done — show loading then results
        setPhase("loading");
        setTimeout(() => {
          const results = matchIdeas(next);
          setMatches(results);
          setPhase("results");
        }, 2200);
      }
    }, 500);
  }, [answers, qIndex]);

  const selectMatch = useCallback((idea: Idea) => {
    localStorage.setItem("sph-selected-idea", idea.id);
    window.location.href = `/build?path=c&idea=${idea.id}`;
  }, []);

  // Question text & answer labels from i18n
  const getQuestionText = (qi: number) => {
    const keys = ["quiz_q1", "quiz_q2", "quiz_q3", "quiz_q4", "quiz_q5"] as const;
    return t[keys[qi] as keyof typeof t] || "";
  };

  const getAnswerLabel = (qi: number, ai: number) => {
    const key = `quiz_q${qi + 1}_a${ai + 1}` as keyof typeof t;
    return t[key] || "";
  };

  const progress = phase === "quiz" ? ((qIndex + 1) / 5) * 100 : phase === "results" ? 100 : 0;

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
            maxWidth: "640px",
            margin: "0 auto",
            padding: "0 clamp(20px, 4vw, 48px)",
          }}
        >
          <div
            style={{
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
                {t.quiz_back}
              </Link>
              <div style={{ width: "1px", height: "20px", background: C.sand }} />
              <Link href="/" style={{ textDecoration: "none" }}>
                <span style={{ fontFamily: FONT.serif, fontSize: "18px", fontWeight: 400, color: C.ink }}>
                  Superpowers
                </span>
              </Link>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {/* Progress pill */}
              {phase !== "intro" && (
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
                  <div style={{ width: 60, height: 4, borderRadius: "999px", background: C.sandLt, overflow: "hidden" }}>
                    <motion.div
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease }}
                      style={{ height: "100%", background: GRAD.flow, borderRadius: "999px" }}
                    />
                  </div>
                  {phase === "quiz" && (
                    <span style={{ fontFamily: FONT.sans, fontSize: "11px", fontWeight: 600, color: C.muted }}>
                      {qIndex + 1}/{QUIZ.length}
                    </span>
                  )}
                </div>
              )}

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
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: "560px",
          margin: "0 auto",
          padding: "0 clamp(20px, 4vw, 48px)",
          position: "relative",
          zIndex: 1,
          minHeight: "calc(100vh - 56px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <AnimatePresence mode="wait">
          {/* ── INTRO ────────────────────────────────────────────────────── */}
          {phase === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease }}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                paddingBottom: "80px",
              }}
            >
              {/* Decorative blob */}
              <div
                style={{
                  position: "absolute",
                  top: -40,
                  right: -80,
                  width: "clamp(280px, 40vw, 450px)",
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              >
                <OrgBlob variant={4} color={C.orange} opacity={0.07} />
              </div>

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
                {t.quiz_label}
              </div>

              <div
                style={{
                  fontSize: "56px",
                  marginBottom: "24px",
                }}
              >
                ◈
              </div>

              <h1
                style={{
                  fontFamily: FONT.serif,
                  fontSize: "clamp(32px, 5vw, 44px)",
                  fontWeight: 400,
                  color: C.ink,
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                  margin: "0 0 16px",
                }}
              >
                {t.quiz_title}
              </h1>

              <p
                style={{
                  fontFamily: FONT.sans,
                  fontSize: "15px",
                  color: C.muted,
                  lineHeight: 1.7,
                  margin: "0 0 40px",
                  maxWidth: "380px",
                }}
              >
                {t.quiz_sub}
              </p>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={startQuiz}
                style={{
                  padding: "16px 40px",
                  borderRadius: "999px",
                  border: "none",
                  background: GRAD.flow,
                  color: "white",
                  fontFamily: FONT.sans,
                  fontSize: "15px",
                  fontWeight: 500,
                  cursor: "pointer",
                  boxShadow: "0 8px 32px rgba(34,160,107,0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                {t.start}
                <span>→</span>
              </motion.button>
            </motion.div>
          )}

          {/* ── QUIZ QUESTIONS ───────────────────────────────────────────── */}
          {phase === "quiz" && (
            <motion.div
              key={`q-${qIndex}`}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.4, ease }}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                paddingTop: "40px",
                paddingBottom: "80px",
                position: "relative",
              }}
            >
              {/* Per-question blob */}
              <div
                style={{
                  position: "absolute",
                  top: 20,
                  right: -60,
                  width: "clamp(220px, 35vw, 380px)",
                  pointerEvents: "none",
                  zIndex: 0,
                  opacity: 0.08,
                }}
              >
                <OrgBlob variant={q.blobVariant} color={q.blobColor} />
              </div>

              {/* Question number */}
              <div
                style={{
                  fontFamily: FONT.serif,
                  fontSize: "72px",
                  fontWeight: 400,
                  fontStyle: "italic",
                  color: q.blobColor,
                  opacity: 0.1,
                  lineHeight: 1,
                  marginBottom: "-8px",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {String(qIndex + 1).padStart(2, "0")}
              </div>

              {/* Question emoji */}
              <div style={{ fontSize: "32px", marginBottom: "16px", position: "relative", zIndex: 1 }}>
                {q.emoji}
              </div>

              {/* Question text */}
              <h2
                style={{
                  fontFamily: FONT.serif,
                  fontSize: "clamp(26px, 4vw, 34px)",
                  fontWeight: 400,
                  color: C.ink,
                  lineHeight: 1.15,
                  letterSpacing: "-0.015em",
                  margin: "0 0 32px",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {getQuestionText(qIndex)}
              </h2>

              {/* Answer chips — staggered grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: q.answers.length <= 4 ? "1fr 1fr" : "1fr 1fr",
                  gap: "10px",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {q.answers.map((ans, i) => (
                  <AnswerChip
                    key={ans.key}
                    emoji={ans.emoji}
                    label={getAnswerLabel(qIndex, i)}
                    selected={selectedAnswer === ans.key}
                    color={q.blobColor}
                    onClick={() => !selectedAnswer && selectAnswer(ans.key, ans.tags)}
                    index={i}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* ── LOADING ──────────────────────────────────────────────────── */}
          {phase === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4, ease }}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                gap: "24px",
              }}
            >
              {/* Pulsing gradient blob */}
              <motion.div
                animate={{
                  scale: [1, 1.12, 1],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: GRAD.flow,
                  boxShadow: "0 8px 40px rgba(34,160,107,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "32px",
                }}
              >
                🤖
              </motion.div>

              <div
                style={{
                  fontFamily: FONT.serif,
                  fontSize: "20px",
                  color: C.ink,
                }}
              >
                {t.quiz_loading}
              </div>

              {/* Animated dots */}
              <div style={{ display: "flex", gap: "6px" }}>
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -6, 0] }}
                    transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: C.greenBr,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* ── RESULTS ──────────────────────────────────────────────────── */}
          {phase === "results" && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease }}
              style={{ paddingTop: "48px", paddingBottom: "80px" }}
            >
              {/* Decorative blob */}
              <div
                style={{
                  position: "absolute",
                  top: -20,
                  left: -80,
                  width: "clamp(300px, 42vw, 500px)",
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              >
                <OrgBlob variant={1} color={C.greenBr} opacity={0.06} />
              </div>

              <div style={{ position: "relative", zIndex: 1 }}>
                <div
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: "10px",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    color: C.soft,
                    marginBottom: "14px",
                  }}
                >
                  {t.quiz_label}
                </div>

                <h2
                  style={{
                    fontFamily: FONT.serif,
                    fontSize: "clamp(30px, 5vw, 40px)",
                    fontWeight: 400,
                    color: C.ink,
                    lineHeight: 1.1,
                    letterSpacing: "-0.02em",
                    margin: "0 0 10px",
                  }}
                >
                  {t.quiz_results_title}
                </h2>

                <p
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: "14px",
                    color: C.muted,
                    lineHeight: 1.7,
                    margin: "0 0 36px",
                  }}
                >
                  {t.quiz_results_sub}
                </p>

                {/* Match cards */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px" }}>
                  {matches.map((m, i) => (
                    <MatchCard
                      key={m.idea.id}
                      idea={m.idea}
                      reason={lang === "sa" ? m.reasonSA : m.reason}
                      rank={i}
                      lang={lang}
                      onSelect={() => selectMatch(m.idea)}
                    />
                  ))}
                </div>

                {/* See all ideas link */}
                <div style={{ textAlign: "center" }}>
                  <Link
                    href="/ideas"
                    style={{
                      fontFamily: FONT.sans,
                      fontSize: "13px",
                      fontWeight: 500,
                      color: C.muted,
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    {t.quiz_match_other}
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
