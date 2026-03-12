import { useState } from "react";

const FLOW = [
  // ── COLUMN 0: Entry ──────────────────────────────────────────────
  {
    id: "landing",
    col: 2, row: 0,
    type: "entry",
    label: "Landing Page",
    sub: "superpowerhub.org",
    color: "#38BDF8",
    detail: "Single screen. Headline + 3 path cards. Zero auth, zero forms. Thumb-sized cards are the only interaction.",
  },

  // ── COLUMN 1: 3 Paths ────────────────────────────────────────────
  {
    id: "pathA",
    col: 0, row: 2,
    type: "path",
    label: "Ek het 'n idee",
    sub: "Submit own idea",
    color: "#00E5A0",
    detail: "User describes their idea in plain text. Goes straight to auth → split screen where agent refines it.",
  },
  {
    id: "pathB",
    col: 2, row: 2,
    type: "path",
    label: "Kies uit 50 idees",
    sub: "Browse idea library",
    color: "#FFB800",
    detail: "Swipeable grid of 50 pre-validated Zero-Rand ideas. User taps one → auth fires immediately.",
  },
  {
    id: "pathC",
    col: 4, row: 2,
    type: "path",
    label: "Help my kies",
    sub: "Quiz → AI match",
    color: "#A78BFA",
    detail: "Interest quiz (5 questions). AI matches hobbies to top 3 ideas. User picks one → auth fires.",
  },

  // ── AUTH (shared) ─────────────────────────────────────────────────
  {
    id: "auth",
    col: 2, row: 4,
    type: "auth",
    label: "Auth — Bottom Sheet",
    sub: "Phone + OTP · ~10 sec",
    color: "#38BDF8",
    detail: "Triggers on FIRST TAP of any path. Bottom sheet slides up: phone number → 6-digit OTP auto-submit. Supabase row created. User never leaves the flow.",
  },

  // ── SPLIT SCREEN ─────────────────────────────────────────────────
  {
    id: "split",
    col: 2, row: 6,
    type: "split",
    label: "Split Screen",
    sub: "Agent LEFT · 1-pager RIGHT",
    color: "#00E5A0",
    detail: "Left: Kasi Coach asks max 6 questions (multiple choice + chat). Right: 1-pager preview starts 50% filled with chosen idea. Each answer fills the right side live.",
    wide: true,
  },

  // ── QUESTIONS (annotated inside split) ───────────────────────────
  {
    id: "q-flow",
    col: 2, row: 7,
    type: "steps",
    label: "Agent Questions (all paths identical after Q1)",
    sub: "",
    color: "#64748B",
    detail: "",
    questions: [
      { q: "Q1 (path-specific)", a: "A: Vertel oor jou idee  /  B: Bevestig keuse  /  C: Kies hobbies", color: "#00E5A0" },
      { q: "Q2 — Naam", a: "Fills name on 1-pager live", color: "#38BDF8" },
      { q: "Q3 — Wijk", a: "Dropdown: township → triggers AI call in background", color: "#FFB800" },
      { q: "Q4 — Dienste & pryse", a: "Multiple choice suggestions + editable → fills service slots", color: "#A78BFA" },
      { q: "Q5 — Foto (optional)", a: "Camera / gallery. Trust signal — nudged strongly", color: "#F472B6" },
    ],
  },

  // ── AI COACH ─────────────────────────────────────────────────────
  {
    id: "ai",
    col: 2, row: 9,
    type: "ai",
    label: "AI Kasi Coach",
    sub: "3-stap plan · bio · service copy",
    color: "#F472B6",
    detail: "LLM call fires at Q3 (wijk answered). Streamed response. Output: 3-bullet action plan for first R50 + auto-written bio + service descriptions. 1-pager hits 100%.",
  },

  // ── PROFILE LIVE ─────────────────────────────────────────────────
  {
    id: "profile",
    col: 2, row: 11,
    type: "output",
    label: "Profiel Gepubliseer",
    sub: "superpowerhub.org/sipho-sneakers",
    color: "#4ADE80",
    detail: "One 'Publiseer' tap. Dynamic slug generated. WhatsApp deeplink with pre-filled booking message. SEO-indexed. Auto-listed on marketplace.",
  },

  // ── SIDE: MARKETPLACE ────────────────────────────────────────────
  {
    id: "marketplace",
    col: 4, row: 11,
    type: "side",
    label: "Marketplace",
    sub: "/ontdek?wijk=khayelitsha",
    color: "#818CF8",
    detail: "Public directory. Auto-indexed on profile publish. Filterable by wijk + category. No login to browse — entry for customers.",
  },

  // ── SHARE / ACTIVATE ────────────────────────────────────────────
  {
    id: "share",
    col: 2, row: 13,
    type: "terminal",
    label: "Deel & Aktiveer",
    sub: "WhatsApp · Eerste boeking < 24u",
    color: "#FB923C",
    detail: "Native share sheet opens automatically. WhatsApp pinned first. 'First booking within 24h' is the north star activation metric.",
  },
];

// SVG edges between nodes
const EDGES = [
  { from: "landing", to: "pathA", label: "" },
  { from: "landing", to: "pathB", label: "" },
  { from: "landing", to: "pathC", label: "" },
  { from: "pathA", to: "auth", label: "1st tap" },
  { from: "pathB", to: "auth", label: "1st tap" },
  { from: "pathC", to: "auth", label: "1st tap" },
  { from: "auth", to: "split", label: "" },
  { from: "split", to: "q-flow", label: "" },
  { from: "q-flow", to: "ai", label: "" },
  { from: "ai", to: "profile", label: "1-pager 100%" },
  { from: "profile", to: "marketplace", label: "auto-listed" },
  { from: "profile", to: "share", label: "" },
];

// Grid layout
const COL_X = [60, 200, 340, 480, 620]; // 5 columns
const ROW_H = 88;
const CARD_W = 200;
const CARD_H = 60;

function getPos(col, row) {
  return {
    cx: COL_X[col] + CARD_W / 2,
    cy: row * ROW_H + CARD_H / 2 + 20,
    x: COL_X[col],
    y: row * ROW_H + 20,
  };
}

const typeStyle = {
  entry:    { bg: "#0F1C2E", border: "#38BDF8" },
  path:     { bg: "#0D1F18", border: "#00E5A0" },
  auth:     { bg: "#0F1828", border: "#38BDF8" },
  split:    { bg: "#0D1F18", border: "#00E5A0" },
  steps:    { bg: "#090E18", border: "#1E293B" },
  ai:       { bg: "#170E24", border: "#F472B6" },
  output:   { bg: "#091A0E", border: "#4ADE80" },
  side:     { bg: "#0F1228", border: "#818CF8" },
  terminal: { bg: "#1A0E06", border: "#FB923C" },
};

const CANVAS_W = 780;
const CANVAS_H = 1340;

export default function ProcessFlow() {
  const [active, setActive] = useState(null);

  const activeNode = FLOW.find(n => n.id === active);

  // Build a lookup for positions
  const pos = {};
  FLOW.forEach(n => { pos[n.id] = getPos(n.col, n.row); });

  return (
    <div style={{ minHeight: "100vh", background: "#060C18", fontFamily: "'Space Grotesk', sans-serif", overflowX: "auto" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Space+Mono&family=Space+Grotesk:wght@400;600&display=swap');
        * { box-sizing: border-box; }
        @keyframes slideUp { from { transform:translateY(30px); opacity:0 } to { transform:translateY(0); opacity:1 } }
      `}</style>

      {/* Header */}
      <div style={{ padding: "16px 20px 10px", borderBottom: "1px solid #0F2040" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, background: "linear-gradient(135deg,#00E5A0,#38BDF8)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>⚡</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#F1F5F9", fontFamily: "'Syne',sans-serif" }}>SUPERPOWER HUB</div>
            <div style={{ fontSize: 9, fontFamily: "monospace", color: "#334155", letterSpacing: "0.12em" }}>PROCESS FLOW · MVP v0.1 · TAP NODE FOR DETAIL</div>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div style={{ position: "relative", width: CANVAS_W, minHeight: CANVAS_H, margin: "0 auto" }}>

        {/* SVG edges */}
        <svg style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }} width={CANVAS_W} height={CANVAS_H}>
          <defs>
            <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="#1E3A5F" />
            </marker>
            <marker id="arr-hi" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="#6C8EFF" />
            </marker>
          </defs>
          {EDGES.map((e, i) => {
            const f = pos[e.from];
            const t = pos[e.to];
            if (!f || !t) return null;
            const isHi = active === e.from || active === e.to;
            const fx = f.cx, fy = f.cy + CARD_H / 2;
            const tx = t.cx, ty = t.cy - CARD_H / 2;
            const my = (fy + ty) / 2;
            const d = `M${fx},${fy} C${fx},${my} ${tx},${my} ${tx},${ty}`;
            return (
              <g key={i}>
                <path d={d} fill="none" stroke={isHi ? "#6C8EFF" : "#1E3A5F"} strokeWidth={isHi ? 2 : 1.5}
                  markerEnd={isHi ? "url(#arr-hi)" : "url(#arr)"} opacity={isHi ? 1 : 0.7} />
                {e.label && (
                  <text x={(fx+tx)/2} y={my - 4} fill={isHi ? "#6C8EFF" : "#1E3A5F"}
                    fontSize="8" fontFamily="monospace" textAnchor="middle">{e.label}</text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Nodes */}
        {FLOW.map(node => {
          if (node.type === "steps") return <StepsNode key={node.id} node={node} pos={pos[node.id]} active={active} />;
          const p = pos[node.id];
          const ts = typeStyle[node.type] || typeStyle.entry;
          const isActive = active === node.id;
          const w = node.wide ? 420 : CARD_W;
          return (
            <div
              key={node.id}
              onClick={() => setActive(active === node.id ? null : node.id)}
              style={{
                position: "absolute",
                left: node.wide ? COL_X[1] : p.x,
                top: p.y,
                width: w,
                cursor: "pointer",
                zIndex: isActive ? 5 : 1,
              }}
            >
              <div style={{
                background: ts.bg,
                border: `1.5px solid ${isActive ? node.color : ts.border}`,
                borderRadius: 10,
                padding: "10px 13px",
                boxShadow: isActive ? `0 0 18px ${node.color}35, 0 4px 20px rgba(0,0,0,0.5)` : "0 2px 10px rgba(0,0,0,0.4)",
                transition: "all 0.2s",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: node.color, fontFamily: "'Syne',sans-serif", lineHeight: 1.2 }}>{node.label}</div>
                    {node.sub && <div style={{ fontSize: 9, fontFamily: "monospace", color: "#475569", marginTop: 2 }}>{node.sub}</div>}
                  </div>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: node.color, flexShrink: 0, marginTop: 4, marginLeft: 8, opacity: 0.7 }} />
                </div>
              </div>
            </div>
          );
        })}

        {/* Phase labels on left margin */}
        {[
          { row: 0, label: "① ENTRY" },
          { row: 2, label: "② PATH" },
          { row: 4, label: "③ AUTH" },
          { row: 6, label: "④ BUILD" },
          { row: 9, label: "⑤ AI" },
          { row: 11, label: "⑥ LIVE" },
          { row: 13, label: "⑦ ACTIVATE" },
        ].map((p, i) => (
          <div key={i} style={{
            position: "absolute",
            left: 4,
            top: p.row * ROW_H + 30,
            fontSize: 7,
            fontFamily: "monospace",
            color: "#1E3A5F",
            letterSpacing: "0.1em",
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            userSelect: "none",
          }}>{p.label}</div>
        ))}

      </div>

      {/* Detail drawer */}
      {activeNode && activeNode.detail && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          background: "#0B1120",
          borderTop: `2px solid ${activeNode.color}`,
          padding: "18px 20px 28px",
          zIndex: 50,
          animation: "slideUp 0.2s ease",
          boxShadow: "0 -20px 50px rgba(0,0,0,0.8)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: activeNode.color, fontFamily: "'Syne',sans-serif" }}>{activeNode.label}</div>
            <button onClick={() => setActive(null)} style={{ background: "none", border: "none", color: "#475569", fontSize: 18, cursor: "pointer" }}>✕</button>
          </div>
          <div style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.7 }}>{activeNode.detail}</div>
        </div>
      )}

      {/* Legend */}
      <div style={{ padding: "12px 20px 24px", display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", borderTop: "1px solid #0A1628" }}>
        {[
          { color: "#38BDF8", label: "Entry / Auth" },
          { color: "#00E5A0", label: "Onboarding paths" },
          { color: "#F472B6", label: "AI / LLM" },
          { color: "#4ADE80", label: "Live output" },
          { color: "#FB923C", label: "Activation" },
          { color: "#818CF8", label: "Marketplace" },
        ].map((l, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 7, height: 7, borderRadius: 2, background: l.color }} />
            <span style={{ fontSize: 10, fontFamily: "monospace", color: "#475569" }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepsNode({ node, pos, active }) {
  const w = 420;
  return (
    <div style={{
      position: "absolute",
      left: COL_X[1],
      top: pos.y,
      width: w,
      zIndex: 1,
    }}>
      <div style={{
        background: "#090E18",
        border: "1px dashed #1E293B",
        borderRadius: 10,
        padding: "10px 13px",
      }}>
        <div style={{ fontSize: 9, fontFamily: "monospace", color: "#334155", letterSpacing: "0.1em", marginBottom: 8 }}>AGENT QUESTIONS — CONVERGENCE POINT</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {node.questions.map((q, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <div style={{ width: 3, background: q.color, borderRadius: 2, flexShrink: 0, alignSelf: "stretch", minHeight: 16 }} />
              <div>
                <span style={{ fontSize: 10, fontWeight: 700, color: q.color, fontFamily: "monospace" }}>{q.q} </span>
                <span style={{ fontSize: 10, color: "#475569" }}>— {q.a}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
