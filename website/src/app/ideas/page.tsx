"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import OrgBlob from "@/components/design/OrgBlob";
import { C, GRAD, FONT } from "@/lib/tokens";
import { LANG, type Lang } from "@/lib/i18n";
import { IDEAS, CATEGORY_META, type Category, type Idea } from "@/lib/ideas";

// ── Animation presets ────────────────────────────────────────────────────────
const ease = [0.22, 1, 0.36, 1] as const;

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, delay: i * 0.03, ease },
  }),
  exit: { opacity: 0, y: -12, scale: 0.97, transition: { duration: 0.2 } },
};

const CATEGORIES: (Category | "all")[] = [
  "all",
  "business",
  "community",
  "learn",
  "creative",
  "tech",
];

// Color cycle for "all" category visual variety
const ACCENT_CYCLE = [C.greenBr, C.oceanBr, C.orange, C.pinkBr, C.ocean];

// ── Idea Card ────────────────────────────────────────────────────────────────
function IdeaCard({
  idea,
  lang,
  selected,
  onSelect,
  index,
}: {
  idea: Idea;
  lang: Lang;
  selected: boolean;
  onSelect: () => void;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);
  const meta = CATEGORY_META[idea.category];
  const name = lang === "sa" ? idea.nameSA : idea.name;
  const desc = lang === "sa" ? idea.descriptionSA : idea.description;

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      layoutId={idea.id}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onSelect}
      style={{ cursor: "pointer" }}
    >
      {/* Gradient border wrapper */}
      <div
        style={{
          padding: selected ? "2px" : "1px",
          borderRadius: "20px",
          background: selected
            ? GRAD.flow
            : hovered
              ? meta.color
              : C.sand,
          transition: "background 300ms, padding 200ms",
          boxShadow: selected
            ? `0 8px 32px ${meta.color}33`
            : hovered
              ? "0 12px 36px rgba(0,0,0,0.08)"
              : "0 2px 8px rgba(0,0,0,0.03)",
        }}
      >
        <div
          style={{
            background: selected ? C.warm : C.white,
            borderRadius: "18px",
            padding: "22px 20px 18px",
            position: "relative",
            overflow: "hidden",
            transition: "background 300ms",
          }}
        >
          {/* Background blob — subtle, only on hover/select */}
          <div
            style={{
              position: "absolute",
              top: -30,
              right: -30,
              width: 140,
              opacity: selected ? 0.25 : hovered ? 0.15 : 0,
              transition: "opacity 400ms",
              pointerEvents: "none",
            }}
          >
            <OrgBlob
              variant={(((index % 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6)}
              color={meta.color}
              opacity={0.6}
            />
          </div>

          {/* Selected checkmark */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: GRAD.flow,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "13px",
                  fontWeight: 700,
                  zIndex: 2,
                  boxShadow: "0 2px 8px rgba(34,160,107,0.3)",
                }}
              >
                ✓
              </motion.div>
            )}
          </AnimatePresence>

          {/* Emoji + Category row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "12px",
            }}
          >
            <motion.div
              animate={{
                scale: hovered ? 1.15 : 1,
                rotate: hovered ? 6 : 0,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              style={{
                width: 44,
                height: 44,
                borderRadius: "14px",
                background: selected ? meta.color : meta.wash,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                flexShrink: 0,
                transition: "background 300ms",
              }}
            >
              {idea.emoji}
            </motion.div>
            <div
              style={{
                display: "inline-block",
                padding: "3px 9px",
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
              fontSize: "19px",
              fontWeight: 400,
              color: selected ? meta.color : C.ink,
              lineHeight: 1.25,
              marginBottom: "6px",
              transition: "color 250ms",
              position: "relative",
              zIndex: 1,
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
              marginBottom: "14px",
              position: "relative",
              zIndex: 1,
            }}
          >
            {desc}
          </div>

          {/* Earning badge */}
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
              position: "relative",
              zIndex: 1,
            }}
          >
            <span style={{ color: meta.color, fontSize: "10px" }}>●</span>
            {idea.earning}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Category Pill ────────────────────────────────────────────────────────────
function CategoryPill({
  cat,
  active,
  onClick,
  count,
  lang,
}: {
  cat: Category | "all";
  active: boolean;
  onClick: () => void;
  count: number;
  lang: Lang;
}) {
  const isAll = cat === "all";
  const meta = isAll ? null : CATEGORY_META[cat];
  const label = isAll
    ? lang === "sa"
      ? "Almal"
      : "All"
    : lang === "sa"
      ? meta!.labelSA
      : meta!.label;
  const color = isAll ? C.green : meta!.color;
  const emoji = isAll ? "✦" : meta!.emoji;

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "7px",
        padding: active ? "8px 18px" : "8px 16px",
        borderRadius: "999px",
        border: active ? "none" : `1px solid ${C.sand}`,
        background: active ? color : C.white,
        color: active ? C.white : C.body,
        fontFamily: FONT.sans,
        fontSize: "13px",
        fontWeight: 500,
        cursor: "pointer",
        transition: "background 250ms, color 250ms, border 250ms",
        whiteSpace: "nowrap",
        boxShadow: active
          ? `0 4px 16px ${color}30`
          : "0 1px 4px rgba(0,0,0,0.04)",
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: "14px" }}>{emoji}</span>
      <span>{label}</span>
      <span
        style={{
          fontSize: "11px",
          opacity: 0.7,
          fontWeight: 400,
        }}
      >
        {count}
      </span>
    </motion.button>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// IDEAS PAGE — Path B
// ══════════════════════════════════════════════════════════════════════════════
export default function IdeasPage() {
  const [lang, setLang] = useState<Lang>("sa");
  const [activeCategory, setActiveCategory] = useState<Category | "all">(
    "all"
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const t = LANG[lang];

  // Persist language
  useEffect(() => {
    const saved = localStorage.getItem("sph-lang") as Lang | null;
    if (saved === "en" || saved === "sa") setLang(saved);
  }, []);
  // Filter ideas
  const filtered = useMemo(() => {
    let list = IDEAS;
    if (activeCategory !== "all") {
      list = list.filter((i) => i.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.nameSA.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.descriptionSA.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeCategory, search]);

  // Category counts
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: IDEAS.length };
    for (const cat of Object.keys(CATEGORY_META)) c[cat] = 0;
    for (const idea of IDEAS) c[idea.category]++;
    return c;
  }, []);

  const selectedIdea = selectedId
    ? IDEAS.find((i) => i.id === selectedId)
    : null;

  return (
    <div
      style={{
        background: C.cream,
        fontFamily: FONT.sans,
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      {/* ── Decorative blobs ─────────────────────────────────────────────── */}
      <div
        style={{
          position: "fixed",
          top: -120,
          right: -100,
          width: "clamp(300px, 40vw, 550px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <OrgBlob variant={3} color={C.oceanBr} opacity={0.06} />
      </div>
      <div
        style={{
          position: "fixed",
          bottom: -100,
          left: -80,
          width: "clamp(280px, 35vw, 500px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <OrgBlob variant={5} color={C.pinkBr} opacity={0.05} />
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
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "0 clamp(20px, 4vw, 48px)",
          }}
        >
          {/* Top row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: "56px",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "14px" }}
            >
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
                {t.ideas_back}
              </Link>

              <div
                style={{
                  width: "1px",
                  height: "20px",
                  background: C.sand,
                }}
              />

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    fontFamily: FONT.serif,
                    fontSize: "20px",
                    fontWeight: 400,
                    color: C.ink,
                    letterSpacing: "-0.01em",
                  }}
                >
                  Superpowers
                </span>
              </div>
            </div>

            {/* Lang toggle */}
            <button
              onClick={() => { const next = lang === "en" ? "sa" : "en"; setLang(next); localStorage.setItem("sph-lang", next); }}
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

          {/* Category pills — horizontally scrollable */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              paddingBottom: "14px",
              overflowX: "auto",
              scrollbarWidth: "none",
            }}
          >
            {CATEGORIES.map((cat) => (
              <CategoryPill
                key={cat}
                cat={cat}
                active={activeCategory === cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setSelectedId(null);
                }}
                count={counts[cat] || 0}
                lang={lang}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Page content ─────────────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 clamp(20px, 4vw, 48px)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* ── Hero headline ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          style={{
            padding: "48px 0 12px",
            maxWidth: "560px",
          }}
        >
          {/* Label */}
          <div
            style={{
              fontFamily: FONT.sans,
              fontSize: "11px",
              fontWeight: 500,
              color: C.muted,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            {t.ideas_label}
          </div>

          <h1
            style={{
              fontFamily: FONT.serif,
              fontSize: "clamp(40px, 6vw, 60px)",
              fontWeight: 400,
              color: C.ink,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              margin: "0 0 14px",
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
                {t.ideas_title}
              </motion.span>
            </AnimatePresence>
          </h1>

          <p
            style={{
              fontFamily: FONT.sans,
              fontSize: "15px",
              color: C.muted,
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={`sub-${lang}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {t.ideas_sub}
              </motion.span>
            </AnimatePresence>
          </p>
        </motion.div>

        {/* ── Search bar ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease }}
          style={{
            position: "relative",
            maxWidth: "380px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "15px",
              color: C.soft,
              pointerEvents: "none",
            }}
          >
            🔍
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.ideas_search}
            style={{
              width: "100%",
              padding: "12px 16px 12px 40px",
              borderRadius: "14px",
              border: `1px solid ${C.sand}`,
              background: C.white,
              fontFamily: FONT.sans,
              fontSize: "14px",
              color: C.ink,
              outline: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              transition: "border-color 200ms, box-shadow 200ms",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = C.oceanBr;
              e.currentTarget.style.boxShadow = `0 0 0 3px ${C.oceanBr}22`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = C.sand;
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
            }}
          />
        </motion.div>

        {/* ── Results count ───────────────────────────────────────────────── */}
        <div
          style={{
            fontFamily: FONT.sans,
            fontSize: "12px",
            color: C.soft,
            marginBottom: "16px",
          }}
        >
          {filtered.length} {t.ideas_count}
        </div>

        {/* ── Ideas grid ─────────────────────────────────────────────────── */}
        <motion.div
          layout
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "16px",
            paddingBottom: selectedId ? "120px" : "80px",
          }}
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((idea, i) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                lang={lang}
                selected={selectedId === idea.id}
                onSelect={() =>
                  setSelectedId(selectedId === idea.id ? null : idea.id)
                }
                index={i}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              textAlign: "center",
              padding: "80px 20px",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🤷</div>
            <div
              style={{
                fontFamily: FONT.serif,
                fontSize: "24px",
                color: C.ink,
                marginBottom: "8px",
              }}
            >
              {lang === "sa" ? "Niks gevind nie" : "Nothing found"}
            </div>
            <div
              style={{ fontFamily: FONT.sans, fontSize: "14px", color: C.muted }}
            >
              {lang === "sa"
                ? "Probeer 'n ander soekterm"
                : "Try a different search term"}
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Fixed bottom CTA bar ─────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedIdea && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 60,
              padding: "0 clamp(20px, 4vw, 48px) 24px",
            }}
          >
            <div
              style={{
                maxWidth: "640px",
                margin: "0 auto",
                padding: "16px 20px",
                borderRadius: "20px",
                background: "rgba(27,40,56,0.95)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                boxShadow:
                  "0 -4px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.06) inset",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              {/* Selected idea info */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "12px",
                    background: CATEGORY_META[selectedIdea.category].color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    flexShrink: 0,
                  }}
                >
                  {selectedIdea.emoji}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: FONT.serif,
                      fontSize: "16px",
                      color: "white",
                      lineHeight: 1.2,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {lang === "sa" ? selectedIdea.nameSA : selectedIdea.name}
                  </div>
                  <div
                    style={{
                      fontFamily: FONT.sans,
                      fontSize: "11px",
                      color: "rgba(255,255,255,0.4)",
                    }}
                  >
                    {selectedIdea.earning}
                  </div>
                </div>
              </div>

              {/* CTA button */}
              <motion.a
                href={`/build?idea=${selectedIdea.id}`}
                onClick={() => localStorage.setItem("sph-selected-idea", selectedIdea.id)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 24px",
                  borderRadius: "999px",
                  background: GRAD.flow,
                  color: "white",
                  fontFamily: FONT.sans,
                  fontSize: "14px",
                  fontWeight: 500,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  boxShadow: "0 4px 20px rgba(34,160,107,0.35)",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                {t.ideas_cta}
                <span>→</span>
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
