import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

const SERIF = "'Instrument Serif', serif";
const SANS = "'DM Sans', sans-serif";

const C = {
  cream: "#EDE9E0", creamLt: "#F5F2EC", creamDk: "#E2DDD4",
  sand: "#D5D0C7", sandLt: "#E8E4DC",
  white: "#FFFFFF", warm: "#F9F7F3",
  blk: "#121212", dark: "#1E1E1E", char: "#2D2D2D",
  body: "#4A4A48", muted: "#8A8A86", soft: "#B0AEA8", faint: "#D0CEC8",
  // Saturated accent palette — NOT pastel
  green: "#1A6B4A", greenDk: "#0D4F34", greenBr: "#22A06B", greenLt: "#6CD9A0", greenPale: "#D4F0E2", greenWash: "#EDF8F2",
  blue: "#2B8FCC", blueBr: "#38BDF8", blueLt: "#7DD3FC", bluePale: "#D0EFFF", blueWash: "#EFF9FF",
  orange: "#D4763C", orangeBr: "#F59E0B", orangeLt: "#FCD490", orangePale: "#FEF3D6", orangeWash: "#FFFBF0",
  pink: "#D4497A", pinkBr: "#F472B6", pinkLt: "#FBCFE8", pinkWash: "#FFF0F7",
  navy: "#1B2838",
  // Wave-specific rich tones (from Glide reference)
  wDeepGreen: "#1B5E3B", wBrightGreen: "#4CAF50", wTeal: "#2BA88C",
  wBlue: "#3174B5", wSky: "#5BA4D9",
  wOrange: "#D4763C", wAmber: "#C4923A", wGold: "#B8860B",
  wRed: "#B5452A", wSienna: "#A0522D",
};

const GRAD_FLOW = "linear-gradient(135deg, #22A06B 0%, #38BDF8 35%, #D4763C 70%, #F472B6 100%)";
const GRAD_COOL = "linear-gradient(135deg, #22A06B 0%, #38BDF8 100%)";
const GRAD_WARM = "linear-gradient(135deg, #D4763C 0%, #F472B6 50%, #38BDF8 100%)";
const GRAD_SUNSET = "linear-gradient(135deg, #D4763C 0%, #F472B6 100%)";

const tokens = [
  { t: "--cream", h: C.cream, u: "Page bg" }, { t: "--cream-lt", h: C.creamLt, u: "Light bg" },
  { t: "--sand", h: C.sand, u: "Borders" }, { t: "--white", h: C.white, u: "Cards" },
  { t: "--black", h: C.blk, u: "Headings" }, { t: "--body", h: C.body, u: "Body text" },
  { t: "--muted", h: C.muted, u: "Secondary" }, { t: "--faint", h: C.faint, u: "Whisper" },
  { t: "--green", h: C.green, u: "Primary accent" }, { t: "--green-bright", h: C.greenBr, u: "Active green" },
  { t: "--blue", h: C.blue, u: "Secondary accent" }, { t: "--blue-bright", h: C.blueBr, u: "Active blue" },
  { t: "--orange", h: C.orange, u: "Warm accent" }, { t: "--orange-bright", h: C.orangeBr, u: "Active orange" },
  { t: "--pink", h: C.pink, u: "Pink accent" }, { t: "--pink-bright", h: C.pinkBr, u: "Active pink" },
  { t: "--navy", h: C.navy, u: "Dark accent" },
];

const PROMPT = [
  "You are building Superpowers. Follow this design system strictly.",
  "",
  "SHADCN/UI + MAGIC UI:",
  "Install: npx shadcn@latest init",
  "Components: card, button, badge, tabs, sheet, dialog, separator, alert, input, label, avatar, dropdown-menu.",
  "MCP config:",
  '{ "mcpServers": {',
  '  "shadcn-ui": { "command": "npx", "args": ["@jpisnice/shadcn-ui-mcp-server"] },',
  '  "magicui": { "command": "npx", "args": ["-y", "@magicuidesign/mcp@latest"] }',
  '} }',
  "",
  "CSS VARIABLES (globals.css):",
  ":root {",
  "  --background: 38 18% 91%; /* #EDE9E0 warm cream */",
  "  --foreground: 0 0% 7%; /* #121212 */",
  "  --card: 0 0% 100%;",
  "  --primary: 156 60% 26%; /* #1A6B4A emerald */",
  "  --primary-foreground: 0 0% 100%;",
  "  --accent: 200 58% 49%; /* blue */",
  "  --accent-foreground: 0 0% 100%;",
  "  --border: 38 10% 80%; /* #D5D0C7 */",
  "  --ring: 156 60% 26%;",
  "  --radius: 1rem;",
  "}",
  "",
  "BRAND: Vibrant, organic, warm. Rich saturated flowing shapes. Photography mixed with colorful organic wave terrain. Warm cream bg, never cold grey. Colors at FULL saturation — not pastel, not washed out.",
  "",
  "COLORS:",
  "Neutrals: --cream #EDE9E0 (page bg), --sand #D5D0C7 (borders), --white #FFFFFF (cards).",
  "Emerald: #1A6B4A, #22A06B, #6CD9A0, #EDF8F2.",
  "Ocean: #2B8FCC, #38BDF8, #7DD3FC, #EFF9FF.",
  "Orange: #D4763C, #F59E0B, #FEF3D6.",
  "Pink: #D4497A, #F472B6, #FFF0F7.",
  "Navy: #1B2838.",
  "Wave colors (for terrain shapes): #1B5E3B, #6DBF47, #4CAF50, #2BA88C, #3174B5, #5BA4D9, #D4763C, #C4923A, #B5452A, #D4497A.",
  "",
  "WAVE TERRAIN HEADER: The signature SVG element. 8-10 overlapping cubic bezier paths — ALL curves, ZERO straight lines (L commands). Every path uses only C (cubic bezier) commands for buttery smooth flowing shapes with no sharp points anywhere. Each wave has its own vertical (top-to-bottom) linearGradient — lighter at the top edge, richer at the bottom — giving each band depth and volume. Colors are RICH and SOLID at full opacity: deep green #1B5E3B, lime #6DBF47, teal #2BA88C, blue #3174B5, sky #5BA4D9, orange #D4763C, gold #C4923A, sienna #B5452A, pink #D4497A. Bands dip and soar, crossing over each other. Think painterly landscape contours.",
  "",
  "ORGANIC SHAPES: Large flowing blobs for backgrounds. When used as bg accents, keep 60-100% opacity with rich color — NOT 5-10% washed out. The brand is vibrant.",
  "",
  "TYPOGRAPHY:",
  "Display: Instrument Serif, 400, 48-64px, -0.02em.",
  "H2: Instrument Serif, 400, 36-44px.",
  "H3: Instrument Serif, 400, 24-28px.",
  "Body: DM Sans, 400, 16px, line-height 1.7.",
  "Caption: DM Sans, 500, 11px, 0.06em tracking, uppercase.",
  "Button: DM Sans, 500, 14px.",
  "",
  "SPACING: Section 80-100px. Card 24-32px. Gap 16-24px. Max 1200px.",
  "RADIUS: 16px cards. 12px buttons. 8px badges. 999px pills.",
  "",
  "BUTTONS: Primary bg #1A6B4A. Gradient bg flow. Secondary white+border. Ghost transparent.",
  "CARDS: White bg, 16px radius, optional shadow. Featured: gradient border wrapper.",
  "",
  "DO: Rich saturated shapes. Vibrant wave terrain. Serif 400 headings. Generous radius. Warm cream bg. Full-color accents.",
  "DON'T: No pastel shapes. No washed-out colors. No cold greys. No sharp corners. No bold serif."
].join("\n");

/* ═══ WAVE TERRAIN SVG ═══ */
function WaveHeader({ height = 320, className = "" }) {
  return (
    <svg viewBox="0 0 1200 500" preserveAspectRatio="none" className={className} style={{ width: "100%", height, display: "block" }}>
      <defs>
        <linearGradient id="wha" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0D4F34" /><stop offset="50%" stopColor="#1B5E3B" /><stop offset="100%" stopColor="#2BA88C" /></linearGradient>
        <linearGradient id="whb" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2B6FA0" /><stop offset="60%" stopColor="#3174B5" /><stop offset="100%" stopColor="#5BA4D9" /></linearGradient>
        <linearGradient id="whc" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3E8C30" /><stop offset="50%" stopColor="#6DBF47" /><stop offset="100%" stopColor="#4CAF50" /></linearGradient>
        <linearGradient id="whd" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1B8C6B" /><stop offset="60%" stopColor="#2BA88C" /><stop offset="100%" stopColor="#22A06B" /></linearGradient>
        <linearGradient id="whe" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#C06830" /><stop offset="50%" stopColor="#D4763C" /><stop offset="100%" stopColor="#E8944A" /></linearGradient>
        <linearGradient id="whf" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4A90C4" /><stop offset="50%" stopColor="#5BA4D9" /><stop offset="100%" stopColor="#7CC0E8" /></linearGradient>
        <linearGradient id="whg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#A07828" /><stop offset="50%" stopColor="#C4923A" /><stop offset="100%" stopColor="#D4A84E" /></linearGradient>
        <linearGradient id="whh" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8C3620" /><stop offset="50%" stopColor="#B5452A" /><stop offset="100%" stopColor="#C45A3A" /></linearGradient>
        <linearGradient id="whi" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1A8058" /><stop offset="50%" stopColor="#22A06B" /><stop offset="100%" stopColor="#38B87C" /></linearGradient>
        <linearGradient id="whj" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#C03868" /><stop offset="60%" stopColor="#D4497A" /><stop offset="100%" stopColor="#E06090" /></linearGradient>
      </defs>
      <path d="M-50,200 C80,120 180,380 350,280 C520,180 580,420 720,300 C860,180 950,350 1100,240 C1180,195 1230,350 1250,420 C1250,470 1250,520 1250,520 C800,520 200,520 -50,520 C-50,520 -50,400 -50,200Z" fill="url(#wha)" />
      <path d="M-50,340 C100,180 220,440 400,260 C580,80 620,400 780,320 C940,240 1080,440 1250,310 C1250,420 1250,520 1250,520 C800,520 200,520 -50,520 C-50,520 -50,440 -50,340Z" fill="url(#whb)" />
      <path d="M-50,380 C60,280 140,480 300,340 C460,200 520,440 680,360 C840,280 960,460 1120,350 C1190,310 1240,420 1250,460 C1250,490 1250,520 1250,520 C800,520 200,520 -50,520 C-50,520 -50,450 -50,380Z" fill="url(#whc)" />
      <path d="M-50,300 C100,400 200,250 380,350 C560,450 640,260 800,360 C960,460 1100,310 1250,390 C1250,460 1250,520 1250,520 C800,520 200,520 -50,520 C-50,520 -50,400 -50,300Z" fill="url(#whd)" />
      <path d="M-50,420 C80,320 200,480 380,380 C560,280 640,460 800,400 C960,340 1100,490 1250,410 C1250,470 1250,520 1250,520 C800,520 200,520 -50,520 C-50,520 -50,475 -50,420Z" fill="url(#whe)" />
      <path d="M-50,360 C120,440 260,300 440,400 C620,500 700,320 880,420 C1060,510 1150,390 1250,445 C1250,485 1250,520 1250,520 C800,520 200,520 -50,520 C-50,520 -50,440 -50,360Z" fill="url(#whf)" />
      <path d="M-50,450 C100,390 240,490 420,430 C600,370 680,480 850,440 C1020,400 1140,485 1250,455 C1250,490 1250,520 1250,520 C800,520 200,520 -50,520 C-50,520 -50,490 -50,450Z" fill="url(#whg)" />
      <path d="M-50,470 C80,440 180,500 340,460 C500,420 580,490 740,465 C900,440 1040,500 1250,475 C1250,498 1250,520 1250,520 C800,520 200,520 -50,520 C-50,520 -50,498 -50,470Z" fill="url(#whh)" />
      <path d="M-50,485 C120,465 280,502 460,480 C640,458 760,498 940,482 C1120,466 1200,498 1250,490 C1250,506 1250,520 1250,520 C800,520 200,520 -50,520 C-50,520 -50,504 -50,485Z" fill="url(#whi)" />
      <path d="M-50,440 C60,470 160,420 300,455 C440,490 520,430 680,462 C840,494 960,448 1120,472 C1190,482 1240,495 1250,468 C1250,496 1250,520 1250,520 C800,520 200,520 -50,520 C-50,520 -50,480 -50,440Z" fill="url(#whj)" opacity="0.7" />
    </svg>
  );
}

function WaveHeaderCompact({ height = 200 }) {
  return (
    <svg viewBox="0 0 800 300" preserveAspectRatio="none" style={{ width: "100%", height, display: "block" }}>
      <defs>
        <linearGradient id="wca" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0D4F34" /><stop offset="100%" stopColor="#2BA88C" /></linearGradient>
        <linearGradient id="wcb" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2B6FA0" /><stop offset="100%" stopColor="#5BA4D9" /></linearGradient>
        <linearGradient id="wcc" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3E8C30" /><stop offset="100%" stopColor="#6DBF47" /></linearGradient>
        <linearGradient id="wcd" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1B8C6B" /><stop offset="100%" stopColor="#22A06B" /></linearGradient>
        <linearGradient id="wce" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#C06830" /><stop offset="100%" stopColor="#E8944A" /></linearGradient>
        <linearGradient id="wcf" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#A07828" /><stop offset="100%" stopColor="#D4A84E" /></linearGradient>
        <linearGradient id="wcg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8C3620" /><stop offset="100%" stopColor="#C45A3A" /></linearGradient>
      </defs>
      <path d="M-20,140 C80,80 160,240 300,160 C440,80 500,260 640,180 C730,130 800,220 840,180 C840,250 840,320 840,320 C500,320 100,320 -20,320 C-20,320 -20,230 -20,140Z" fill="url(#wca)" />
      <path d="M-20,200 C60,120 160,280 320,180 C480,80 540,260 700,200 C760,178 810,250 840,210 C840,268 840,320 840,320 C500,320 100,320 -20,320 C-20,320 -20,260 -20,200Z" fill="url(#wcb)" />
      <path d="M-20,220 C80,160 160,300 300,220 C440,140 520,280 660,230 C726,208 790,265 840,238 C840,280 840,320 840,320 C500,320 100,320 -20,320 C-20,320 -20,272 -20,220Z" fill="url(#wcc)" />
      <path d="M-20,180 C100,240 200,160 360,230 C520,300 580,180 720,250 C770,268 810,255 840,264 C840,292 840,320 840,320 C500,320 100,320 -20,320 C-20,320 -20,250 -20,180Z" fill="url(#wcd)" />
      <path d="M-20,260 C60,220 180,300 340,250 C500,200 560,290 720,265 C778,256 818,280 840,274 C840,298 840,320 840,320 C500,320 100,320 -20,320 C-20,320 -20,290 -20,260Z" fill="url(#wce)" />
      <path d="M-20,280 C100,260 260,302 440,278 C620,254 720,300 840,284 C840,302 840,320 840,320 C500,320 100,320 -20,320 C-20,320 -20,300 -20,280Z" fill="url(#wcf)" />
      <path d="M-20,295 C100,286 300,312 500,294 C700,276 780,308 840,298 C840,310 840,320 840,320 C500,320 100,320 -20,320 C-20,320 -20,308 -20,295Z" fill="url(#wcg)" />
    </svg>
  );
}

/* Rich blob shapes — high opacity, not pastel */
function Blob1({ color = C.greenBr, opacity = 0.7, className = "" }) {
  return <svg viewBox="0 0 500 400" className={className} style={{ display: "block" }}><path d="M420,180 Q480,80 380,40 Q280,0 200,60 Q100,130 40,200 Q-10,260 60,320 Q130,380 240,370 Q350,360 400,280 Q440,220 420,180Z" fill={color} opacity={opacity} /></svg>;
}
function Blob2({ color = C.blueBr, opacity = 0.6, className = "" }) {
  return <svg viewBox="0 0 400 400" className={className} style={{ display: "block" }}><path d="M320,120 Q380,50 300,20 Q220,-10 140,50 Q60,110 30,200 Q0,290 80,340 Q160,390 260,350 Q360,310 370,220 Q380,150 320,120Z" fill={color} opacity={opacity} /></svg>;
}

/* ═══ CHARTS ═══ */
function AreaChart({ colors = [C.greenBr, C.blueBr], data = [20,45,35,60,50,75,65,85,70,90], h = 120 }) {
  const max = Math.max(...data); const pts = data.map((v,i) => ({ x: (i/(data.length-1))*280, y: h-16-((v/max)*(h-32)) }));
  let path = `M${pts[0].x},${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) { const cx = (pts[i-1].x+pts[i].x)/2; path += ` C${cx},${pts[i-1].y} ${cx},${pts[i].y} ${pts[i].x},${pts[i].y}`; }
  const fill = path + ` L280,${h-8} L0,${h-8} Z`;
  const id = "g" + Math.random().toString(36).slice(2,6);
  return <svg viewBox={`0 0 280 ${h}`} style={{ width: "100%", height: "auto", display: "block" }}><defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={colors[0]} stopOpacity="0.2" /><stop offset="100%" stopColor={colors[1]||colors[0]} stopOpacity="0.03" /></linearGradient></defs><path d={fill} fill={`url(#${id})`} /><path d={path} fill="none" stroke={colors[0]} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function BarChart({ colors = [C.greenBr, C.blueBr, C.orange, C.pinkBr], data = [60,80,45,90,70,55,85], h = 100 }) {
  const max = Math.max(...data);
  return <svg viewBox={`0 0 ${data.length*18} ${h}`} style={{ width: "100%", height: "auto", display: "block" }}>{data.map((v,i) => { const bh = (v/max)*(h-12); return <rect key={i} x={i*18+2} y={h-bh-4} width="12" height={bh} rx="6" fill={colors[i%colors.length]} opacity={0.25+(v/max)*0.75} />; })}</svg>;
}
function RingChart({ segments = [{v:40,c:C.greenBr},{v:25,c:C.blueBr},{v:20,c:C.orange},{v:15,c:C.pinkBr}], size = 90, sw = 8 }) {
  const r = (size-sw)/2; const circ = 2*Math.PI*r; let offset = 0;
  return <svg width={size} height={size} style={{ display: "block", transform: "rotate(-90deg)" }}>{segments.map((seg,i) => { const len = (seg.v/100)*circ; const gap = 4; const el = <circle key={i} cx={size/2} cy={size/2} r={r} fill="none" stroke={seg.c} strokeWidth={sw} strokeLinecap="round" strokeDasharray={`${len-gap} ${circ-len+gap}`} strokeDashoffset={-offset} />; offset += len; return el; })}</svg>;
}
function Spark({ data = [30,50,40,65,55,70,60,80], color = C.greenBr, w = 72, h = 24 }) {
  const max = Math.max(...data); const pts = data.map((v,i) => `${(i/(data.length-1))*w},${h-3-((v/max)*(h-6))}`).join(" ");
  return <svg width={w} height={h} style={{ display: "block" }}><polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

/* ═══ UTILITIES ═══ */
function CopyBtn({ text, label = "Copy", style: extra = {} }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    try { navigator.clipboard.writeText(text); } catch(e) {
      const ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.left = "-9999px"; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
    }
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  return <Button className="text-[14px] font-medium px-6 py-3" style={{ borderRadius: 12, ...extra }} onClick={handleCopy}>{copied ? "✓ Copied" : label}</Button>;
}
function SmCp({ t }) { const [c, s] = useState(false); return <button onClick={e => { e.stopPropagation(); try { navigator.clipboard.writeText(t); } catch(er) { const ta = document.createElement("textarea"); ta.value = t; ta.style.position = "fixed"; ta.style.left = "-9999px"; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); } s(true); setTimeout(() => s(false), 1500); }} className="bg-transparent border-none cursor-pointer px-1 py-0.5 font-mono text-[11px]" style={{ color: c ? C.green : C.muted, transition: "color 200ms" }}>{c ? "✓" : t}</button>; }
function Sec({ title, id, children }) { return <section id={id} className="mb-20"><h2 style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 400, color: C.blk, margin: "0 0 32px" }}>{title}</h2>{children}</section>; }
function Cap({ children }) { return <div style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: C.faint, marginBottom: 16 }}>{children}</div>; }

const nav = ["Wave", "Colors", "Type", "Spacing", "Shapes", "Cards", "Charts", "Buttons", "MCP"];

export default function SuperpowersDS() {
  const [aN, sN] = useState("Wave");
  return (
    <div className="min-h-screen" style={{ background: C.cream, fontFamily: SANS, color: C.body }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />

      {/* ═══ HERO with Wave ═══ */}
      <div style={{ position: "relative", overflow: "hidden", background: C.cream }}>
        <div style={{ padding: "56px 40px 0" }}>
          <div className="max-w-[1200px] mx-auto relative z-10">
            <div className="flex justify-between items-center mb-16">
              <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 400, color: C.blk }}>Superpowers</div>
              <CopyBtn text={PROMPT} label="Copy Lovable Prompt" style={{ background: C.green, color: "#fff" }} />
            </div>
            <h1 style={{ fontFamily: SERIF, fontSize: "clamp(44px, 5.5vw, 64px)", fontWeight: 400, color: C.blk, margin: 0, lineHeight: 1.08, letterSpacing: "-0.02em", maxWidth: 600 }}>Superpowers<br/>Design System</h1>
            <p className="mt-5 max-w-[440px]" style={{ color: C.muted, fontSize: 16, lineHeight: 1.7 }}>Rich organic terrain. Vibrant saturated shapes. Serif elegance on warm cream. Built on shadcn/ui + Magic UI.</p>
            <div className="mt-8 flex gap-3 pb-12">
              <CopyBtn text={PROMPT} label="Copy Lovable Prompt" style={{ background: C.green, color: "#fff" }} />
              <Button className="text-[14px] font-medium px-6 py-3" style={{ borderRadius: 12, background: C.white, border: "1px solid " + C.sand, color: C.blk }}>Learn More</Button>
            </div>
          </div>
        </div>
        <WaveHeader height={340} />
      </div>

      {/* Nav */}
      <div className="sticky top-0 z-10" style={{ background: "rgba(237,233,224,0.88)", backdropFilter: "blur(12px)", borderBottom: "1px solid " + C.sand }}>
        <div className="max-w-[1200px] mx-auto px-10 flex gap-1 overflow-x-auto">
          {nav.map(i => <button key={i} onClick={() => { sN(i); document.getElementById(i.toLowerCase())?.scrollIntoView({ behavior: "smooth" }); }} className="px-4 py-3 my-1 text-[12px] font-medium border-none cursor-pointer" style={{ background: aN === i ? C.white : "none", borderRadius: 8, color: aN === i ? C.blk : C.muted, transition: "all 250ms ease" }}>{i}</button>)}
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-10 py-16">

        {/* ═══ WAVE TERRAIN ═══ */}
        <Sec title="Wave Terrain Header" id="wave">
          <Card className="overflow-hidden p-0" style={{ borderRadius: 16, border: "1px solid " + C.sand }}>
            <div style={{ background: C.cream, padding: "40px 32px 0" }}>
              <div style={{ fontFamily: SERIF, fontSize: 28, color: C.blk, marginBottom: 8 }}>Signature Element</div>
              <div className="text-sm mb-6" style={{ color: C.muted, maxWidth: 420 }}>Multi-layer flowing terrain waves. Each path has its own top-to-bottom gradient for depth. All cubic bezier curves — no sharp points anywhere. Rich saturated colors at full opacity.</div>
            </div>
            <WaveHeader height={240} />
          </Card>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Card className="overflow-hidden p-0" style={{ borderRadius: 16, border: "1px solid " + C.sand }}>
              <div style={{ background: C.navy, padding: "24px 24px 0" }}>
                <div className="text-[13px] font-medium mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>On dark background</div>
              </div>
              <div style={{ background: C.navy }}><WaveHeaderCompact height={160} /></div>
            </Card>
            <Card className="p-6" style={{ borderRadius: 16, border: "1px solid " + C.sand }}>
              <Cap>Wave Color Palette</Cap>
              <div className="flex flex-col gap-2">
                {[
                  { c: "#1B5E3B", n: "Deep Green" }, { c: "#6DBF47", n: "Lime" }, { c: "#4CAF50", n: "Bright Green" }, { c: "#2BA88C", n: "Teal" },
                  { c: "#3174B5", n: "Blue" }, { c: "#5BA4D9", n: "Sky" },
                  { c: "#D4763C", n: "Orange" }, { c: "#C4923A", n: "Gold" }, { c: "#B5452A", n: "Sienna" }, { c: "#D4497A", n: "Pink" },
                ].map(w => (
                  <div key={w.c} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg flex-shrink-0" style={{ background: w.c }} />
                    <span className="text-[12px] font-medium" style={{ color: C.blk }}>{w.n}</span>
                    <span className="font-mono text-[10px] ml-auto" style={{ color: C.muted }}>{w.c}</span>
                  </div>))}
              </div>
            </Card>
          </div>
          <Card className="p-6 mt-4" style={{ borderRadius: 16, border: "1px solid " + C.sand }}>
            <Cap>Wave Rules</Cap>
            <div className="grid grid-cols-4 gap-4">
              {[
                { l: "Curves", v: "ALL cubic bezier (C commands). Zero straight lines. Every point is a smooth curve — no sharp peaks or corners anywhere." },
                { l: "Gradients", v: "Each wave path has its own vertical linearGradient — lighter at the top edge, richer at the bottom. Gives each band a sense of depth and volume." },
                { l: "Color", v: "FULL saturation, full opacity. Solid painted bands. Green, blue, lime, teal, orange, gold, sienna, pink. No transparency." },
                { l: "Layers", v: "8-10 overlapping paths. They cross over each other — not stacked in parallel. Placed at bottom of hero sections or as page dividers." },
              ].map(r => (
                <div key={r.l}>
                  <div className="text-[13px] font-medium mb-1" style={{ color: C.blk }}>{r.l}</div>
                  <div className="text-[12px] leading-relaxed" style={{ color: C.muted }}>{r.v}</div>
                </div>))}
            </div>
          </Card>
        </Sec>

        {/* ═══ COLORS ═══ */}
        <Sec title="Color Palette" id="colors">
          <div className="grid gap-2 mb-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))" }}>
            {tokens.map(c => (<Card key={c.t} className="overflow-hidden p-0" style={{ borderRadius: 12, border: "1px solid " + C.sand }}><div style={{ height: 36, background: c.h }} /><div className="p-2"><SmCp t={c.h} /><div className="font-mono text-[9px]" style={{ color: C.faint }}>{c.t}</div><div className="text-[10px] mt-0.5" style={{ color: C.muted }}>{c.u}</div></div></Card>))}
          </div>
          <div className="grid grid-cols-2 gap-3 mt-5">
            <div>
              <Cap>Flow Gradient</Cap>
              <div className="h-12 rounded-xl" style={{ background: GRAD_FLOW }} />
            </div>
            <div>
              <Cap>Cool / Warm / Sunset</Cap>
              <div className="flex gap-2">
                <div className="flex-1 h-12 rounded-xl" style={{ background: GRAD_COOL }} />
                <div className="flex-1 h-12 rounded-xl" style={{ background: GRAD_WARM }} />
                <div className="flex-1 h-12 rounded-xl" style={{ background: GRAD_SUNSET }} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3 mt-4">
            {[
              { l: "Emerald", c: [C.greenDk, C.green, C.greenBr, C.greenLt, C.greenPale, C.greenWash] },
              { l: "Ocean", c: [C.blue, C.blueBr, C.blueLt, C.bluePale, C.blueWash] },
              { l: "Orange", c: [C.orange, C.orangeBr, C.orangeLt, C.orangePale, C.orangeWash] },
              { l: "Pink", c: [C.pink, C.pinkBr, C.pinkLt, C.pinkWash] },
            ].map(s => (
              <div key={s.l}>
                <Cap>{s.l}</Cap>
                <div className="flex rounded-xl overflow-hidden h-8">{s.c.map(h => <div key={h} className="flex-1" style={{ background: h }} />)}</div>
              </div>))}
          </div>
        </Sec>

        {/* ═══ TYPE ═══ */}
        <Sec title="Typography" id="type">
          <Alert className="rounded-2xl mb-7 border-none" style={{ background: C.greenWash }}>
            <AlertDescription className="text-[14px]" style={{ color: C.green }}>
              <span style={{ fontFamily: SERIF, fontStyle: "italic" }}>Instrument Serif</span> at regular weight (400) for headings. <strong style={{ color: C.blk }}>DM Sans</strong> for body. The serif carries presence without bold.
            </AlertDescription>
          </Alert>
          {[
            { l: "Display", f: SERIF, sz: 56, w: 400, ls: "-0.02em", s: "Where ideas flow" },
            { l: "H2", f: SERIF, sz: 40, w: 400, s: "Your growth platform" },
            { l: "H3", f: SERIF, sz: 26, w: 400, s: "Seamless digital experiences" },
            { l: "H3 Italic", f: SERIF, sz: 26, w: 400, s: "with ease and intention", it: true },
            { l: "Body", f: SANS, sz: 16, w: 400, s: "Redefine account opening and loan origination with seamless, AI-powered digital experiences." },
            { l: "Caption", f: SANS, sz: 11, w: 500, ls: "0.06em", s: "SECTION LABEL", u: true, c: C.muted },
          ].map(t => (
            <div key={t.l} className="py-4" style={{ borderBottom: "1px solid " + C.sandLt }}>
              <div className="flex justify-between mb-2">
                <Badge className="text-[10px] font-medium border-none" style={{ borderRadius: 8, background: C.creamLt, color: C.muted }}>{t.l}</Badge>
                <span className="font-mono text-[11px]" style={{ color: C.faint }}>{t.sz}px / {t.w}</span>
              </div>
              <div style={{ fontFamily: t.f, fontSize: t.sz, fontWeight: t.w, fontStyle: t.it ? "italic" : "normal", letterSpacing: t.ls || "0", color: t.c || C.blk, textTransform: t.u ? "uppercase" : "none", lineHeight: t.sz > 20 ? 1.12 : 1.7 }}>{t.s}</div>
            </div>))}
        </Sec>

        {/* ═══ SPACING ═══ */}
        <Sec title="Spacing & Radius" id="spacing">
          <div className="grid grid-cols-3 gap-5">
            <div>
              <Cap>Scale</Cap>
              {[{n:"4",u:"Inline"},{n:"8",u:"Tight"},{n:"16",u:"Default"},{n:"24",u:"Card gap"},{n:"32",u:"Card pad"},{n:"80",u:"Section"}].map(s=>(
                <div key={s.n} className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-[11px] w-6 text-right" style={{color:C.faint}}>{s.n}</span>
                  <div style={{width:parseInt(s.n),height:10,borderRadius:999,background:GRAD_FLOW,opacity:0.15+(parseInt(s.n)/80)*0.85}}/>
                  <span className="text-[11px]" style={{color:C.muted}}>{s.u}</span>
                </div>))}
            </div>
            <div>
              <Cap>Layout</Cap>
              {[{l:"Section vertical",v:"80–100px"},{l:"Card padding",v:"24–32px"},{l:"Card gap",v:"16–24px"},{l:"Max width",v:"1200px"}].map(r=>(
                <div key={r.l} className="flex justify-between py-1.5" style={{borderBottom:"1px solid "+C.sandLt}}>
                  <span className="text-[12px] font-medium" style={{color:C.blk}}>{r.l}</span>
                  <span className="font-mono text-[11px]" style={{color:C.muted}}>{r.v}</span>
                </div>))}
            </div>
            <div>
              <Cap>Radius</Cap>
              {[{l:"Badges",r:8},{l:"Buttons / inputs",r:12},{l:"Cards / images",r:16},{l:"Pills",r:999}].map(i=>(
                <div key={i.l} className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 flex-shrink-0" style={{background:C.greenWash,borderRadius:i.r}}/>
                  <div><div className="text-[12px] font-medium" style={{color:C.blk}}>{i.l}</div><div className="font-mono text-[11px]" style={{color:C.faint}}>{i.r===999?"pill":i.r+"px"}</div></div>
                </div>))}
            </div>
          </div>
        </Sec>

        {/* ═══ ORGANIC SHAPES ═══ */}
        <Sec title="Organic Shapes" id="shapes">
          <Alert className="rounded-2xl mb-6 border-none" style={{ background: C.orangeWash }}>
            <AlertDescription className="text-[14px]" style={{ color: C.orange }}>
              <strong style={{ color: C.blk }}>Shapes are RICH and SATURATED.</strong> 60–100% opacity, not 5–10% washed out. The brand is vibrant — shapes should feel painted, not ghostly.
            </AlertDescription>
          </Alert>
          <div className="grid grid-cols-3 gap-4">
            {[
              { l: "Emerald Blob", c: C.greenBr, op: 0.7, bg: C.cream },
              { l: "Ocean Blob", c: C.blueBr, op: 0.6, bg: C.cream },
              { l: "Sunset Blob", c: C.orange, op: 0.65, bg: C.cream },
            ].map((b,i) => (
              <Card key={b.l} className="overflow-hidden p-0" style={{ borderRadius: 16, border: "1px solid " + C.sand }}>
                <div className="relative" style={{ background: b.bg, height: 160, overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: -40, left: -40, width: 280 }}><Blob1 color={b.c} opacity={b.op} /></div>
                  <div style={{ position: "absolute", bottom: -30, right: -30, width: 200 }}><Blob2 color={b.c} opacity={b.op * 0.8} /></div>
                </div>
                <div className="p-4">
                  <div className="text-[13px] font-medium" style={{ color: C.blk }}>{b.l}</div>
                  <div className="text-[11px] mt-1" style={{ color: C.muted }}>Opacity {Math.round(b.op*100)}%. Rich, not pastel.</div>
                </div>
              </Card>))}
          </div>
        </Sec>

        {/* ═══ CARDS ═══ */}
        <Sec title="Cards" id="cards">
          <div className="grid grid-cols-4 gap-4">
            <Card className="p-6" style={{ borderRadius: 16, border: "1px solid " + C.sand }}>
              <Cap>Default</Cap>
              <div style={{ fontFamily: SERIF, fontSize: 20, color: C.blk, marginBottom: 6 }}>Clean Card</div>
              <div className="text-[13px] leading-relaxed" style={{ color: C.muted }}>White, border, 16px radius.</div>
            </Card>
            <Card className="p-6" style={{ borderRadius: 16, border: "none", background: C.green, color: "#fff" }}>
              <Cap><span style={{ color: "rgba(255,255,255,0.5)" }}>Rich Green</span></Cap>
              <div style={{ fontFamily: SERIF, fontSize: 20, color: "#fff", marginBottom: 6 }}>Solid Fill</div>
              <div className="text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>Full saturation, not wash.</div>
            </Card>
            <Card className="p-6" style={{ borderRadius: 16, border: "none", background: C.blue }}>
              <Cap><span style={{ color: "rgba(255,255,255,0.5)" }}>Ocean</span></Cap>
              <div style={{ fontFamily: SERIF, fontSize: 20, color: "#fff", marginBottom: 6 }}>Solid Fill</div>
              <div className="text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>Rich, vibrant surface.</div>
            </Card>
            <div style={{ borderRadius: 16, padding: 2, background: GRAD_FLOW }}>
              <Card className="p-6 h-full" style={{ borderRadius: 14, border: "none" }}>
                <Cap>Featured</Cap>
                <div style={{ fontFamily: SERIF, fontSize: 20, color: C.blk, marginBottom: 6 }}>Gradient Border</div>
                <div className="text-[13px] leading-relaxed" style={{ color: C.muted }}>2px gradient wrapper.</div>
              </Card>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Card className="p-6" style={{ borderRadius: 16, background: C.navy, border: "none" }}>
              <Cap><span style={{ color: "rgba(255,255,255,0.3)" }}>Dark</span></Cap>
              <div style={{ fontFamily: SERIF, fontSize: 20, color: "#fff", marginBottom: 6 }}>Navy Card</div>
              <div className="text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>For CTAs and dark sections.</div>
            </Card>
            <Card className="p-6 relative overflow-hidden" style={{ borderRadius: 16, background: C.orange, border: "none" }}>
              <div style={{ position: "absolute", top: -30, right: -40, width: 200 }}><Blob1 color="#B5452A" opacity={0.4} /></div>
              <div className="relative z-10">
                <Cap><span style={{ color: "rgba(255,255,255,0.5)" }}>With Shape</span></Cap>
                <div style={{ fontFamily: SERIF, fontSize: 20, color: "#fff", marginBottom: 6 }}>Blob on Color</div>
                <div className="text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>Organic shape on rich surface.</div>
              </div>
            </Card>
          </div>
        </Sec>

        {/* ═══ CHARTS ═══ */}
        <Sec title="Chart Styles" id="charts">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Card className="p-6" style={{ borderRadius: 16, border: "1px solid " + C.sand }}>
              <CardHeader className="p-0 pb-4"><div className="flex justify-between items-start"><div><Cap>Growth</Cap><div className="text-3xl mt-1" style={{ fontFamily: SERIF, color: C.blk }}>$12.4M</div></div><Badge className="border-none text-[11px]" style={{ borderRadius: 8, background: C.greenWash, color: C.green }}>+24%</Badge></div></CardHeader>
              <AreaChart colors={[C.greenBr, C.blueBr]} data={[20,35,30,55,45,60,50,70,65,85,75,90]} h={100} />
            </Card>
            <Card className="p-6" style={{ borderRadius: 16, border: "1px solid " + C.sand }}>
              <CardHeader className="p-0 pb-4"><div className="flex justify-between items-start"><div><Cap>Revenue</Cap><div className="text-3xl mt-1" style={{ fontFamily: SERIF, color: C.blk }}>$640K</div></div><Badge className="border-none text-[11px]" style={{ borderRadius: 8, background: C.orangeWash, color: C.orange }}>Q1</Badge></div></CardHeader>
              <BarChart data={[60,80,45,90,70,55,85]} h={80} />
            </Card>
            <Card className="p-6" style={{ borderRadius: 16, border: "1px solid " + C.sand }}>
              <CardHeader className="p-0 pb-3"><Cap>Allocation</Cap></CardHeader>
              <div className="flex gap-5 items-center">
                <RingChart size={88} sw={8} />
                <div className="flex flex-col gap-1.5">
                  {[{l:"Accounts",v:"40%",c:C.greenBr},{l:"Lending",v:"25%",c:C.blueBr},{l:"Payments",v:"20%",c:C.orange},{l:"Insights",v:"15%",c:C.pinkBr}].map(s=>(
                    <div key={s.l} className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{background:s.c}}/><span className="text-[12px]" style={{color:C.muted}}>{s.l}</span><span className="text-[12px] font-medium ml-auto" style={{color:C.blk}}>{s.v}</span></div>))}
                </div>
              </div>
            </Card>
            <Card className="p-6" style={{ borderRadius: 16, border: "1px solid " + C.sand }}>
              <Cap>Sparklines</Cap>
              <div className="grid grid-cols-2 gap-4">
                {[{l:"Users",v:"24.8K",c:C.greenBr,d:[30,50,40,65,55,70,60,80]},{l:"Revenue",v:"$8.2M",c:C.blueBr,d:[20,30,35,40,38,50,55,65]},{l:"Loans",v:"1,240",c:C.orange,d:[50,45,55,50,60,58,65,70]},{l:"NPS",v:"72",c:C.pinkBr,d:[60,55,65,62,68,70,72,72]}].map(s=>(
                  <div key={s.l} className="flex justify-between items-center">
                    <div><div className="text-[11px]" style={{color:C.muted}}>{s.l}</div><div className="text-base font-medium mt-0.5" style={{color:C.blk}}>{s.v}</div></div>
                    <Spark data={s.d} color={s.c}/>
                  </div>))}
              </div>
            </Card>
          </div>
        </Sec>

        {/* ═══ BUTTONS ═══ */}
        <Sec title="Buttons" id="buttons">
          <Card className="p-10" style={{ borderRadius: 16, border: "1px solid " + C.sand }}>
            <Cap>Standard (12px radius)</Cap>
            <div className="flex gap-3 flex-wrap items-center mb-8">
              <Button className="text-[14px] font-medium px-6 py-3" style={{ borderRadius: 12, background: C.green, color: "#fff" }}>Primary</Button>
              <Button className="text-[14px] font-medium px-6 py-3" style={{ borderRadius: 12, background: GRAD_FLOW, color: "#fff" }}>Gradient</Button>
              <Button className="text-[14px] font-medium px-6 py-3" style={{ borderRadius: 12, background: C.white, border: "1px solid " + C.sand, color: C.blk }}>Secondary</Button>
              <Button className="text-[14px] font-medium px-6 py-3" style={{ borderRadius: 12, background: "transparent", color: C.muted, border: "none" }}>Ghost</Button>
            </div>
            <Cap>Color Accents</Cap>
            <div className="flex gap-3 items-center flex-wrap">
              <Button className="text-[13px] font-medium px-5 py-2.5" style={{ borderRadius: 12, background: C.blueBr, color: "#fff" }}>Ocean</Button>
              <Button className="text-[13px] font-medium px-5 py-2.5" style={{ borderRadius: 12, background: C.orange, color: "#fff" }}>Orange</Button>
              <Button className="text-[13px] font-medium px-5 py-2.5" style={{ borderRadius: 12, background: C.pinkBr, color: "#fff" }}>Pink</Button>
              <Button className="text-[13px] font-medium px-5 py-2.5" style={{ borderRadius: 12, background: C.navy, color: "#fff" }}>Navy</Button>
              <Badge className="text-[10px] px-3 py-1 border-none" style={{ borderRadius: 8, background: C.green, color: "#fff" }}>Badge</Badge>
              <Badge className="text-[10px] px-3 py-1 border-none" style={{ borderRadius: 8, background: C.blue, color: "#fff" }}>Badge</Badge>
              <Badge className="text-[10px] px-3 py-1 border-none" style={{ borderRadius: 8, background: C.orange, color: "#fff" }}>Badge</Badge>
            </div>
          </Card>
        </Sec>

        {/* ═══ MCP ═══ */}
        <Sec title="ShadCN + Magic UI" id="mcp">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Card className="p-6" style={{ borderRadius: 16, border: "1px solid " + C.sand }}>
              <Cap>MCP Config</Cap>
              <div className="p-5 font-mono text-[11px] leading-relaxed" style={{ borderRadius: 12, background: C.navy, color: C.muted }}>
                <span style={{ color: C.greenLt }}>// .cursor/mcp.json</span><br/>{"{"}<br/>
                {"  "}<span style={{ color: "#fff" }}>"mcpServers"</span>: {"{"}<br/>
                {"    "}<span style={{ color: "#fff" }}>"shadcn-ui"</span>: {"{"}<br/>
                {"      "}<span style={{ color: "#fff" }}>"command"</span>: <span style={{ color: C.greenLt }}>"npx"</span>,<br/>
                {"      "}<span style={{ color: "#fff" }}>"args"</span>: [<span style={{ color: C.greenLt }}>"@jpisnice/shadcn-ui-mcp-server"</span>]<br/>
                {"    }"},<br/>
                {"    "}<span style={{ color: "#fff" }}>"magicui"</span>: {"{"}<br/>
                {"      "}<span style={{ color: "#fff" }}>"command"</span>: <span style={{ color: C.greenLt }}>"npx"</span>,<br/>
                {"      "}<span style={{ color: "#fff" }}>"args"</span>: [<span style={{ color: C.greenLt }}>"-y"</span>, <span style={{ color: C.greenLt }}>"@magicuidesign/mcp@latest"</span>]<br/>
                {"    }"}<br/>{"  }"}<br/>{"}"}
              </div>
            </Card>
            <Card className="p-6" style={{ borderRadius: 16, border: "1px solid " + C.sand }}>
              <Cap>Component Mapping</Cap>
              <div className="flex flex-col gap-2 mb-4">
                {[{s:"Card",h:"rounded-2xl, white or rich color fill"},{s:"Button",h:"rounded-xl, green primary"},{s:"Badge",h:"rounded-lg, saturated fills"},{s:"Table",h:"rounded rows, soft dividers"}].map(m=>(
                  <div key={m.s} className="flex items-center gap-3">
                    <Badge className="text-[10px] font-mono px-2.5 border-none" style={{borderRadius:8,background:C.greenWash,color:C.green}}>{m.s}</Badge>
                    <span className="text-[12px]" style={{color:C.muted}}>{m.h}</span>
                  </div>))}
                {[{s:"marquee",h:"logo tickers"},{s:"blur-fade",h:"section reveals"},{s:"number-ticker",h:"animated stats"},{s:"globe",h:"global reach"}].map(m=>(
                  <div key={m.s} className="flex items-center gap-3">
                    <Badge className="text-[10px] font-mono px-2.5 border-none" style={{borderRadius:8,background:C.blueWash,color:C.blue}}>{m.s}</Badge>
                    <span className="text-[12px]" style={{color:C.muted}}>{m.h}</span>
                  </div>))}
              </div>
            </Card>
          </div>
        </Sec>

        {/* ═══ CTA ═══ */}
        <div className="relative overflow-hidden text-center" style={{ borderRadius: 24, background: C.cream }}>
          <div style={{ padding: "56px 32px 0", position: "relative", zIndex: 1 }}>
            <div style={{ fontFamily: SERIF, fontSize: 36, color: C.blk, lineHeight: 1.15 }}>Ready to build<br/><span style={{ fontStyle: "italic" }}>with flow?</span></div>
            <div className="text-sm mt-3 mb-8" style={{ color: C.muted }}>Paste the prompt. Connect the MCPs. Ship vibrant UI.</div>
            <CopyBtn text={PROMPT} label="Copy Lovable Prompt" style={{ background: C.green, color: "#fff" }} />
            <div style={{ height: 32 }} />
          </div>
          <WaveHeader height={220} />
        </div>
      </div>
    </div>
  );
}
