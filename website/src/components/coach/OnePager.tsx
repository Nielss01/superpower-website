"use client";

import { motion, AnimatePresence } from "framer-motion";
import { C, FONT } from "@/lib/tokens";
import { LANG, type Lang } from "@/lib/i18n";
import { CATEGORY_META } from "@/lib/ideas";
import type { ProfileData } from "@/lib/types";

const sectionNum: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  width: 22, height: 22, borderRadius: "50%",
  background: C.green, color: C.white,
  fontFamily: FONT.sans, fontSize: "10px", fontWeight: 700,
  flexShrink: 0,
};

const sectionTitle: React.CSSProperties = {
  fontFamily: FONT.sans, fontSize: "10px", fontWeight: 700,
  letterSpacing: "0.08em", textTransform: "uppercase",
  color: C.ink,
};

const sectionBody: React.CSSProperties = {
  fontFamily: FONT.sans, fontSize: "12px", color: C.body, lineHeight: 1.6,
};

const skeletonLine = (width = "100%"): React.CSSProperties => ({
  height: 10, borderRadius: 4, background: C.sandLt, width, marginBottom: 6,
});

const divider: React.CSSProperties = {
  height: 1, background: C.sandLt, margin: "0",
};

function SectionWrap({ num, title, filled, children }: {
  num: number; title: string; filled: boolean; children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={filled ? { opacity: 0, y: 6 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{ padding: "14px 20px" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div style={{ ...sectionNum, opacity: filled ? 1 : 0.3 }}>{num}</div>
          <div style={{ ...sectionTitle, opacity: filled ? 1 : 0.4 }}>{title}</div>
        </div>
        <div style={{ paddingLeft: 30 }}>
          {children}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function Skeleton({ lines = 2 }: { lines?: number }) {
  return (
    <div style={{ opacity: 0.4 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} style={skeletonLine(i === lines - 1 ? "70%" : "100%")} />
      ))}
    </div>
  );
}

function DottedRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "baseline",
      fontFamily: FONT.sans, fontSize: "12px", color: C.body,
      paddingBottom: 4, borderBottom: `1px dotted ${C.sandLt}`, marginBottom: 4,
    }}>
      <span>{label}</span>
      <span style={{ fontWeight: 600, color: C.green, whiteSpace: "nowrap" }}>{value}</span>
    </div>
  );
}

export function OnePager({ profile, lang, completion }: { profile: ProfileData; lang: Lang; completion: number }) {
  const t = LANG[lang];
  const ideaName = profile.idea
    ? lang === "sa" ? profile.idea.nameSA : profile.idea.name
    : "...";
  const meta = profile.idea ? CATEGORY_META[profile.idea.category] : null;

  return (
    <div style={{ position: "relative" }}>
      {/* ── Header ── */}
      <div style={{
        padding: "20px 20px 16px",
        background: `linear-gradient(135deg, ${C.green}08, ${C.oceanBr}06)`,
      }}>
        <div style={{
          fontFamily: FONT.sans, fontSize: "9px", fontWeight: 700,
          letterSpacing: "0.12em", textTransform: "uppercase",
          color: C.green, marginBottom: 8,
        }}>
          {t.bou_plan_title}
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <motion.div
            animate={{ scale: profile.name ? 1 : 0.9, opacity: profile.name ? 1 : 0.5 }}
            style={{
              width: 44, height: 44, borderRadius: 14,
              background: profile.photoUrl
                ? `url(${profile.photoUrl}) center/cover`
                : meta ? `linear-gradient(135deg, ${meta.color}, ${C.oceanBr})` : C.sandLt,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "18px", color: C.white, fontFamily: FONT.serif,
              flexShrink: 0, border: `2px solid ${C.white}`,
              boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
            }}
          >
            {!profile.photoUrl && (profile.name ? profile.name[0].toUpperCase() : profile.idea?.emoji || "?")}
          </motion.div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: FONT.serif, fontSize: "17px", color: C.ink, lineHeight: 1.2 }}>
              {profile.name ? `${profile.name}'s ${ideaName}` : ideaName}
            </div>
            {profile.wijk && (
              <div style={{ fontFamily: FONT.sans, fontSize: "11px", color: C.muted, marginTop: 2 }}>
                📍 {profile.wijk}
              </div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {profile.tagline && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              style={{
                fontFamily: FONT.serif, fontSize: "12px", fontStyle: "italic",
                color: C.body, lineHeight: 1.5, marginTop: 10,
              }}
            >
              &ldquo;{profile.tagline}&rdquo;
            </motion.div>
          )}
        </AnimatePresence>

        {meta && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "3px 8px", borderRadius: 6, marginTop: 8,
            background: `${meta.color}12`, fontFamily: FONT.sans,
            fontSize: "9px", fontWeight: 600, letterSpacing: "0.06em",
            textTransform: "uppercase", color: meta.color,
          }}>
            {profile.idea?.emoji} {lang === "sa" ? meta.labelSA : meta.label}
          </div>
        )}
      </div>

      <div style={divider} />

      {/* ── 1. The Problem ── */}
      <SectionWrap num={1} title={t.bou_problem} filled={!!profile.problem}>
        {profile.problem
          ? <div style={sectionBody}>{profile.problem}</div>
          : <Skeleton />
        }
      </SectionWrap>

      <div style={divider} />

      {/* ── 2. The Solution ── */}
      <SectionWrap num={2} title={t.bou_solution} filled={!!profile.bio}>
        {profile.bio
          ? <div style={sectionBody}>{profile.bio}</div>
          : <Skeleton />
        }
      </SectionWrap>

      <div style={divider} />

      {/* ── 3. Target Customers ── */}
      <SectionWrap num={3} title={t.bou_target} filled={(profile.targetCustomers?.length ?? 0) > 0}>
        {(profile.targetCustomers?.length ?? 0) > 0
          ? <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {profile.targetCustomers.map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  style={{ ...sectionBody, display: "flex", alignItems: "center", gap: 6 }}
                >
                  <span style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: C.green, flexShrink: 0,
                  }} />
                  {c}
                </motion.div>
              ))}
            </div>
          : <Skeleton lines={3} />
        }
      </SectionWrap>

      <div style={divider} />

      {/* ── 4. Services & Pricing ── */}
      <SectionWrap num={4} title={t.bou_services} filled={profile.services.length > 0}>
        {profile.services.length > 0
          ? <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {profile.services.map((s, i) => (
                <DottedRow key={i} label={s.name} value={s.price} />
              ))}
            </div>
          : <Skeleton lines={3} />
        }
      </SectionWrap>

      <div style={divider} />

      {/* ── 5. Starting Costs ── */}
      <SectionWrap num={5} title={t.bou_costs} filled={(profile.startingCosts?.items?.length ?? 0) > 0}>
        {(profile.startingCosts?.items?.length ?? 0) > 0
          ? <div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {profile.startingCosts.items.map((item, i) => (
                  <DottedRow key={i} label={item.name} value={item.cost} />
                ))}
              </div>
              {profile.startingCosts.total && (
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  marginTop: 6, paddingTop: 6,
                  borderTop: `2px solid ${C.ink}`,
                  fontFamily: FONT.sans, fontSize: "12px", fontWeight: 700, color: C.ink,
                }}>
                  <span>{t.bou_total}</span>
                  <span style={{ color: C.green }}>{profile.startingCosts.total}</span>
                </div>
              )}
            </div>
          : <Skeleton lines={3} />
        }
      </SectionWrap>

      <div style={divider} />

      {/* ── 6. Marketing & Sales ── */}
      <SectionWrap num={6} title={t.bou_marketing} filled={!!(profile.marketing?.hook || profile.marketing?.platform || profile.marketing?.wordOfMouth)}>
        {(profile.marketing?.hook || profile.marketing?.platform || profile.marketing?.wordOfMouth)
          ? <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {profile.marketing.hook && (
                <div style={sectionBody}>
                  <span style={{ fontWeight: 600, color: C.ink }}>Hook:</span>{" "}
                  &ldquo;{profile.marketing.hook}&rdquo;
                </div>
              )}
              {profile.marketing.platform && (
                <div style={sectionBody}>
                  <span style={{ fontWeight: 600, color: C.ink }}>Platform:</span>{" "}
                  {profile.marketing.platform}
                </div>
              )}
              {profile.marketing.wordOfMouth && (
                <div style={sectionBody}>
                  <span style={{ fontWeight: 600, color: C.ink }}>Word of mouth:</span>{" "}
                  &ldquo;{profile.marketing.wordOfMouth}&rdquo;
                </div>
              )}
            </div>
          : <Skeleton lines={3} />
        }
      </SectionWrap>

      <div style={divider} />

      {/* ── 7. The MVP ── */}
      <SectionWrap num={7} title={t.bou_mvp} filled={!!profile.mvp}>
        {profile.mvp
          ? <div style={{
              ...sectionBody,
              padding: "10px 12px", borderRadius: 8,
              background: C.orangeWash, border: `1px solid ${C.orangePale}`,
              fontWeight: 600,
            }}>
              {profile.mvp}
            </div>
          : <Skeleton />
        }
      </SectionWrap>

      <div style={divider} />

      {/* ── First Week Plan ── */}
      <AnimatePresence>
        {(profile.plan?.length ?? 0) > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ padding: "14px 20px" }}
          >
            <div style={{
              ...sectionTitle, color: C.green,
              marginBottom: 10, fontSize: "10px",
            }}>
              🚀 {t.bou_first_week}
            </div>
            <div style={{ paddingLeft: 4, position: "relative" }}>
              <div style={{
                position: "absolute", left: 9, top: 12, bottom: 12,
                width: 2, background: C.greenPale,
              }} />
              {profile.plan.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  style={{
                    marginBottom: i < profile.plan.length - 1 ? 10 : 0,
                    fontFamily: FONT.sans, fontSize: "12px", color: C.body,
                    lineHeight: 1.5, position: "relative", paddingLeft: 26,
                  }}
                >
                  <span style={{
                    position: "absolute", left: 0, top: 1,
                    width: 20, height: 20, borderRadius: "50%",
                    background: C.green, color: C.white,
                    fontSize: "10px", fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 1,
                  }}>
                    {i + 1}
                  </span>
                  {step}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Footer ── */}
      <div style={{
        textAlign: "center", padding: "12px 20px 16px",
        borderTop: `1px solid ${C.sandLt}`,
        fontFamily: FONT.sans, fontSize: "9px", color: C.faint,
        letterSpacing: "0.04em",
      }}>
        Built with <span style={{ color: C.greenBr, fontWeight: 600 }}>Superpowers</span>
      </div>
    </div>
  );
}
