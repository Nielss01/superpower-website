import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

const SERIF = "'Instrument Serif', serif";
const SANS = "'DM Sans', sans-serif";

const C = {
  // Core warm neutrals
  cream: "#EDE9E0", creamLt: "#F5F2EC", creamDk: "#E2DDD4",
  sand: "#D5D0C7", sandLt: "#E8E4DC",
  white: "#FFFFFF", warm: "#F9F7F3",
  // Text
  blk: "#121212", dark: "#1E1E1E", char: "#2D2D2D",
  body: "#4A4A48", muted: "#8A8A86", soft: "#B0AEA8", faint: "#D0CEC8",
  // Accent: Emerald green
  green: "#1A6B4A", greenDk: "#0D4F34", greenBr: "#22A06B", greenLt: "#6CD9A0", greenPale: "#D4F0E2", greenWash: "#EDF8F2",
  // Accent: Ocean blue / cyan
  blue: "#2B8FCC", blueBr: "#38BDF8", blueLt: "#7DD3FC", bluePale: "#D0EFFF", blueWash: "#EFF9FF",
  // Accent: Warm orange
  orange: "#D4763C", orangeBr: "#F59E0B", orangeLt: "#FCD490", orangePale: "#FEF3D6", orangeWash: "#FFFBF0",
  // Accent: Pink / magenta
  pink: "#D4497A", pinkBr: "#F472B6", pinkLt: "#FBCFE8", pinkWash: "#FFF0F7",
  // Accent: Deep navy
  navy: "#1B2838",
  // Gradient stops
  g1: "#22A06B", g2: "#38BDF8", g3: "#D4763C", g4: "#F472B6",
};

const GRAD_FLOW = "linear-gradient(135deg, #22A06B 0%, #38BDF8 35%, #D4763C 70%, #F472B6 100%)";
const GRAD_WARM = "linear-gradient(135deg, #D4763C 0%, #F472B6 50%, #38BDF8 100%)";
const GRAD_COOL = "linear-gradient(135deg, #22A06B 0%, #38BDF8 100%)";
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
  "You are building Superpowers Hub. Follow this design system strictly.",
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
  "  --card-foreground: 0 0% 7%;",
  "  --primary: 156 60% 26%; /* #1A6B4A emerald */",
  "  --primary-foreground: 0 0% 100%;",
  "  --secondary: 38 12% 83%; /* sand */",
  "  --secondary-foreground: 0 0% 7%;",
  "  --muted: 38 8% 78%;",
  "  --muted-foreground: 38 3% 37%;",
  "  --accent: 200 58% 49%; /* blue */",
  "  --accent-foreground: 0 0% 100%;",
  "  --border: 38 10% 80%; /* #D5D0C7 */",
  "  --ring: 156 60% 26%;",
  "  --radius: 1rem;",
  "}",
  "",
  "BRAND: Vibrant, organic, warm. Flowing abstract shapes. Collage-style compositions. Photography mixed with colorful organic blobs. Think: modern fintech meets painterly art. Warm cream bg, never cold grey.",
  "",
  "COLORS:",
  "Neutrals: --cream #EDE9E0 (page bg), --cream-lt #F5F2EC, --sand #D5D0C7 (borders), --white #FFFFFF (cards).",
  "Text: --black #121212, --body #4A4A48, --muted #8A8A86, --faint #D0CEC8.",
  "Emerald: #1A6B4A (primary), #22A06B (bright), #6CD9A0 (light), #EDF8F2 (wash).",
  "Ocean: #2B8FCC, #38BDF8 (bright), #7DD3FC (light), #EFF9FF (wash).",
  "Orange: #D4763C, #F59E0B (bright), #FEF3D6 (wash).",
  "Pink: #D4497A, #F472B6 (bright), #FFF0F7 (wash).",
  "Navy: #1B2838 (dark sections).",
  "Flow gradient: linear-gradient(135deg, #22A06B 0%, #38BDF8 35%, #D4763C 70%, #F472B6 100%)",
  "",
  "ORGANIC SHAPES: The brand uses large flowing, painterly organic blob shapes as backgrounds and decorative elements. These should be created with SVG paths or clip-paths, NOT circles or simple geometry. Colors flow through green → blue → orange → pink. Shapes should overlap and bleed off-screen. Think terrain map contours.",
  "",
  "TYPOGRAPHY:",
  "Display/H1: Instrument Serif, 400 (not bold — the serif carries the weight), 48-64px, -0.02em.",
  "H2: Instrument Serif, 400, 36-44px.",
  "H3: Instrument Serif, 400, 24-28px.",
  "Body: DM Sans, 400, 16px, line-height 1.7.",
  "Caption: DM Sans, 500, 11px, 0.06em tracking, uppercase.",
  "Button: DM Sans, 500, 14px.",
  "Note: Serif headings are NORMAL weight (400), not bold. The typeface itself has enough presence.",
  "",
  "SPACING: 4px grid. Section 80-100px. Card 24-32px. Card gap 16-24px. Max 1200px.",
  "RADIUS: 16px (cards, images). 12px (buttons, inputs). 8px (badges, small elements). 999px (pills, avatars). Generous, rounded, friendly.",
  "",
  "BUTTONS:",
  "Primary: bg #1A6B4A, color white, 12px radius.",
  "Gradient: bg flow gradient, color white, 12px radius.",
  "Secondary: bg white, border 1px #D5D0C7, color #121212, 12px radius.",
  "Ghost: transparent, color #8A8A86.",
  "Pill: same styles but 999px radius.",
  "",
  "CARDS: White bg, 16px radius, border 1px #D5D0C7 OR no border. Optional: subtle shadow 0 1px 3px rgba(0,0,0,0.04). Clean, warm.",
  "Featured: Gradient border via wrapper, or colored bg accent.",
  "",
  "COLLAGE SYSTEM: Overlapping elements are key. Images overlap cards. Colored shapes overlap images. Badge pills sit offset on card edges. This creates depth and visual energy.",
  "",
  "CHARTS: Use brand colors. Smooth curves. Area fills with gradient from 20% to 3%. 16px radius on bars. No grid. Minimal.",
  "",
  "MAGIC UI: Use marquee for logo scrollers. blur-fade for reveals. number-ticker for stats. animated-beam for connections. globe for global reach. particles sparingly.",
  "",
  "DO: Warm cream bg. Organic flowing shapes. Serif 400 headings. Generous radius. Multi-color accents. Collage overlaps. Photography with abstract shapes.",
  "DON'T: No cold greys. No sharp corners. No thin hairline borders. No monochrome. No heavy/bold serif."
].join("\n");

function CopyBtn({ text, label = "Copy", style: extra = {} }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    try { navigator.clipboard.writeText(text); } catch(e) {
      const ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.left = "-9999px"; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
    }
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  return <Button className="text-[14px] font-medium px-6 py-3" style={{ borderRadius: 12, ...extra }} onClick={handleCopy}>{copied ? "\u2713 Copied" : label}</Button>;
}
function SmCp({ t }) { const [c, s] = useState(false); return <button onClick={e => { e.stopPropagation(); try { navigator.clipboard.writeText(t); } catch(er) { const ta = document.createElement("textarea"); ta.value = t; ta.style.position = "fixed"; ta.style.left = "-9999px"; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); } s(true); setTimeout(() => s(false), 1500); }} className="bg-transparent border-none cursor-pointer px-1 py-0.5 font-mono text-[11px]" style={{ color: c ? C.green : C.muted, transition: "color 200ms" }}>{c ? "\u2713" : t}</button>; }
function Sec({ title, id, children }) { return <section id={id} className="mb-20"><h2 style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 400, color: C.blk, margin: "0 0 32px" }}>{title}</h2>{children}</section>; }

/* Organic blob SVGs */
function Blob1({ color = C.greenBr, opacity = 0.12, className = "" }) {
  return <svg viewBox="0 0 500 400" className={className} style={{ display: "block" }}><path d="M420,180 Q480,80 380,40 Q280,0 200,60 Q100,130 40,200 Q-10,260 60,320 Q130,380 240,370 Q350,360 400,280 Q440,220 420,180Z" fill={color} opacity={opacity} /></svg>;
}
function Blob2({ color = C.blueBr, opacity = 0.1, className = "" }) {
  return <svg viewBox="0 0 400 400" className={className} style={{ display: "block" }}><path d="M320,120 Q380,50 300,20 Q220,-10 140,50 Q60,110 30,200 Q0,290 80,340 Q160,390 260,350 Q360,310 370,220 Q380,150 320,120Z" fill={color} opacity={opacity} /></svg>;
}

function AreaChart({ colors = [C.greenBr, C.blueBr], data = [20,45,35,60,50,75,65,85,70,90], h = 120 }) {
  const max = Math.max(...data); const pts = data.map((v,i) => ({ x: (i/(data.length-1))*280, y: h-16-((v/max)*(h-32)) }));
  let path = `M${pts[0].x},${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) { const cx = (pts[i-1].x+pts[i].x)/2; path += ` C${cx},${pts[i-1].y} ${cx},${pts[i].y} ${pts[i].x},${pts[i].y}`; }
  const fill = path + ` L280,${h-8} L0,${h-8} Z`;
  const id = "g" + Math.random().toString(36).slice(2,6);
  return <svg viewBox={`0 0 280 ${h}`} style={{ width: "100%", height: "auto", display: "block" }}><defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={colors[0]} stopOpacity="0.2" /><stop offset="100%" stopColor={colors[1] || colors[0]} stopOpacity="0.03" /></linearGradient></defs><path d={fill} fill={`url(#${id})`} /><path d={path} fill="none" stroke={colors[0]} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function BarChart({ colors = [C.greenBr, C.blueBr, C.orange, C.pinkBr], data = [60,80,45,90,70,55,85], h = 100 }) {
  const max = Math.max(...data);
  return <svg viewBox={`0 0 ${data.length*18} ${h}`} style={{ width: "100%", height: "auto", display: "block" }}>{data.map((v,i) => { const bh = (v/max)*(h-12); return <rect key={i} x={i*18+2} y={h-bh-4} width="12" height={bh} rx="6" fill={colors[i % colors.length]} opacity={0.25+(v/max)*0.75} />; })}</svg>;
}
function RingChart({ segments = [{v:40,c:C.greenBr},{v:25,c:C.blueBr},{v:20,c:C.orange},{v:15,c:C.pinkBr}], size = 90, sw = 8 }) {
  const r = (size-sw)/2; const circ = 2*Math.PI*r; let offset = 0;
  return <svg width={size} height={size} style={{ display: "block", transform: "rotate(-90deg)" }}>{segments.map((seg,i) => { const len = (seg.v/100)*circ; const gap = 4; const el = <circle key={i} cx={size/2} cy={size/2} r={r} fill="none" stroke={seg.c} strokeWidth={sw} strokeLinecap="round" strokeDasharray={`${len-gap} ${circ-len+gap}`} strokeDashoffset={-offset} />; offset += len; return el; })}</svg>;
}
function Spark({ data = [30,50,40,65,55,70,60,80], color = C.greenBr, w = 72, h = 24 }) {
  const max = Math.max(...data); const pts = data.map((v,i) => `${(i/(data.length-1))*w},${h-3-((v/max)*(h-6))}`).join(" ");
  return <svg width={w} height={h} style={{ display: "block" }}><polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

const nav = ["Colors", "Type", "Spacing", "Shapes", "Cards", "Charts", "Buttons", "MCP"];

export default function SuperpowersDS() {
  const [aN, sN] = useState("Colors");
  return (
    <div className="min-h-screen" style={{ background: C.cream, fontFamily: SANS, color: C.body }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />

      {/* Hero — gradient-backed */}
      <div style={{ position: "relative", overflow: "hidden", padding: "56px 40px 72px" }}>
        {/* Organic background blobs */}
        <div style={{ position: "absolute", top: -80, right: -120, width: 600, opacity: 1 }}><Blob1 color={C.greenBr} opacity={0.08} /></div>
        <div style={{ position: "absolute", top: 60, right: 80, width: 400, opacity: 1 }}><Blob2 color={C.blueBr} opacity={0.06} /></div>
        <div style={{ position: "absolute", bottom: -60, left: -80, width: 500, opacity: 1 }}><Blob1 color={C.orange} opacity={0.05} /></div>
        <div style={{ position: "absolute", bottom: 20, right: 200, width: 300, opacity: 1 }}><Blob2 color={C.pinkBr} opacity={0.04} /></div>
        <div className="max-w-[1200px] mx-auto relative z-10">
          <div className="flex justify-between items-center mb-16">
            <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 400, color: C.blk }}>Superpowers Hub</div>
            <CopyBtn text={PROMPT} label="Copy Lovable Prompt" style={{ background: C.green, color: "#fff" }} />
          </div>
          <h1 style={{ fontFamily: SERIF, fontSize: "clamp(44px, 5.5vw, 64px)", fontWeight: 400, color: C.blk, margin: 0, lineHeight: 1.08, letterSpacing: "-0.02em", maxWidth: 600 }}>Superpowers Hub<br/>Design System</h1>
          <p className="mt-5 max-w-[420px] leading-relaxed" style={{ color: C.muted, fontSize: 16 }}>Organic shapes, warm palette, serif elegance. Vibrant multi-color accents on warm cream. Built on shadcn/ui + Magic UI.</p>
          <div className="mt-8 flex gap-3">
            <CopyBtn text={PROMPT} label="Copy Lovable Prompt" style={{ background: C.green, color: "#fff" }} />
            <Button className="text-[14px] font-medium px-6 py-3" style={{ borderRadius: 12, background: C.white, border: "1px solid " + C.sand, color: C.blk }}>Learn More</Button>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="sticky top-0 z-10" style={{ background: "rgba(237,233,224,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid " + C.sand }}>
        <div className="max-w-[1200px] mx-auto px-10 flex gap-1 overflow-x-auto">
          {nav.map(i => <button key={i} onClick={() => { sN(i); document.getElementById(i.toLowerCase())?.scrollIntoView({ behavior: "smooth" }); }} className="px-4 py-3 my-1 text-[12px] font-medium border-none cursor-pointer" style={{ background: aN === i ? C.white : "none", borderRadius: 8, color: aN === i ? C.blk : C.muted, transition: "all 250ms ease" }}>{i}</button>)}
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-10 py-16">

        {/* Colors */}
        <Sec title="Color Palette" id="colors">
          <div className="grid gap-2 mb-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))" }}>
            {tokens.map(c => (<Card key={c.t} className="overflow-hidden p-0" style={{ borderRadius: 12, border: "1px solid " + C.sand }}><div style={{ height: 36, background: c.h }} /><div className="p-2"><SmCp t={c.h} /><div className="font-mono text-[9px]" style={{ color: C.faint }}>{c.t}</div><div className="text-[10px] mt-0.5" style={{ color: C.muted }}>{c.u}</div></div></Card>))}
          </div>
          {/* Gradient bars */}
          <div className="grid grid-cols-2 gap-3 mt-5">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wider mb-2" style={{ color: C.faint }}>Flow Gradient</div>
              <div className="h-12 rounded-xl" style={{ background: GRAD_FLOW }} />
            </div>
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wider mb-2" style={{ color: C.faint }}>Cool / Warm / Sunset</div>
              <div className="flex gap-2">
                <div className="flex-1 h-12 rounded-xl" style={{ background: GRAD_COOL }} />
                <div className="flex-1 h-12 rounded-xl" style={{ background: GRAD_WARM }} />
                <div className="flex-1 h-12 rounded-xl" style={{ background: GRAD_SUNSET }} />
              </div>
            </div>
          </div>
          {/* Color scales */}
          <div className="grid grid-cols-4 gap-3 mt-4">
            {[
              { l: "Emerald", c: [C.greenDk, C.green, C.greenBr, C.greenLt, C.greenPale, C.greenWash] },
              { l: "Ocean", c: [C.blue, C.blueBr, C.blueLt, C.bluePale, C.blueWash] },
              { l: "Orange", c: [C.orange, C.orangeBr, C.orangeLt, C.orangePale, C.orangeWash] },
              { l: "Pink", c: [C.pink, C.pinkBr, C.pinkLt, C.pinkWash] },
            ].map(s => (
              <div key={s.l}>
                <div className="text-[11px] font-medium uppercase tracking-wider mb-2" style={{ color: C.faint }}>{s.l}</div>
                <div className="flex rounded-xl overflow-hidden h-8">{s.c.map(h => <div key={h} className="flex-1" style={{ background: h }} />)}</div>
              </div>
            ))}
          </div>
        </Sec>

        {/* Type */}
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
            { l: "Body", f: SANS, sz: 16, w: 400, s: "Redefine account opening and loan origination with seamless, AI-powered digital experiences. Deliver growth." },
            { l: "Caption", f: SANS, sz: 11, w: 500, ls: "0.06em", s: "SECTION LABEL", u: true, c: C.muted },
          ].map(t => (
            <div key={t.l} className="py-4" style={{ borderBottom: "1px solid " + C.sandLt }}>
              <div className="flex justify-between mb-2">
                <Badge className="text-[10px] font-medium border-none" style={{ borderRadius: 8, background: C.creamLt, color: C.muted }}>{t.l}</Badge>
                <span className="font-mono text-[11px]" style={{ color: C.faint }}>{t.sz}px / {t.w}</span>
              </div>
              <div style={{ fontFamily: t.f, fontSize: t.sz, fontWeight: t.w, fontStyle: t.it ? "italic" : "normal", letterSpacing: t.ls || "0", color: t.c || C.blk, textTransform: t.u ? "uppercase" : "none", lineHeight: t.sz > 20 ? 1.12 : 1.7 }}>{t.s}</div>
            </div>
          ))}
        </Sec>

        {/* Spacing */}
        <Sec title="Spacing & Radius" id="spacing">
          <div className="grid grid-cols-3 gap-5">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wider mb-4" style={{ color: C.faint }}>Scale</div>
              {[{ n: "4", u: "Inline" }, { n: "8", u: "Tight" }, { n: "12", u: "Related" }, { n: "16", u: "Default" }, { n: "24", u: "Card gap" }, { n: "32", u: "Card pad" }, { n: "48", u: "Large" }, { n: "80", u: "Section" }].map(s => (
                <div key={s.n} className="flex items-center gap-3 mb-1.5">
                  <span className="font-mono text-[11px] w-6 text-right" style={{ color: C.faint }}>{s.n}</span>
                  <div style={{ width: parseInt(s.n), height: 10, borderRadius: 999, background: GRAD_FLOW, opacity: 0.15+(parseInt(s.n)/80)*0.85 }} />
                  <span className="text-[11px]" style={{ color: C.muted }}>{s.u}</span>
                </div>
              ))}
            </div>
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wider mb-4" style={{ color: C.faint }}>Layout</div>
              {[{ l: "Page horizontal", v: "24-40px" }, { l: "Section vertical", v: "80-100px" }, { l: "Card padding", v: "24-32px" }, { l: "Card gap", v: "16-24px" }, { l: "Max width", v: "1200px" }].map(r => (
                <div key={r.l} className="flex justify-between py-1.5" style={{ borderBottom: "1px solid " + C.sandLt }}>
                  <span className="text-[12px] font-medium" style={{ color: C.blk }}>{r.l}</span>
                  <span className="font-mono text-[11px]" style={{ color: C.muted }}>{r.v}</span>
                </div>
              ))}
            </div>
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wider mb-4" style={{ color: C.faint }}>Radius</div>
              {[{l:"Badges / small",r:8},{l:"Buttons / inputs",r:12},{l:"Cards / images",r:16},{l:"Avatars / pills",r:999}].map(i => (
                <div key={i.l} className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 flex-shrink-0" style={{ background: C.greenWash, borderRadius: i.r }} />
                  <div><div className="text-[12px] font-medium" style={{ color: C.blk }}>{i.l}</div><div className="font-mono text-[11px]" style={{ color: C.faint }}>{i.r === 999 ? "pill" : i.r+"px"}</div></div>
                </div>
              ))}
            </div>
          </div>
        </Sec>

        {/* Organic Shapes */}
        <Sec title="Organic Shapes" id="shapes">
          <div className="grid grid-cols-3 gap-4">
            {[
              { l: "Emerald Blob", c: C.greenBr, op: 0.15, bg: C.creamLt },
              { l: "Ocean Blob", c: C.blueBr, op: 0.12, bg: C.blueWash },
              { l: "Sunset Blob", c: C.orange, op: 0.12, bg: C.orangeWash },
            ].map((b,i) => (
              <Card key={b.l} className="overflow-hidden p-0" style={{ borderRadius: 16, border: "1px solid " + C.sand }}>
                <div className="relative" style={{ background: b.bg, height: 160, overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: -40, left: -40, width: 280 }}><Blob1 color={b.c} opacity={b.op} /></div>
                  <div style={{ position: "absolute", bottom: -30, right: -30, width: 200 }}><Blob2 color={b.c} opacity={b.op * 0.8} /></div>
                </div>
                <div className="p-4">
                  <div className="text-[13px] font-medium" style={{ color: C.blk }}>{b.l}</div>
                  <div className="text-[11px] mt-1" style={{ color: C.muted }}>SVG path blobs. Overlap + bleed off edges. Never symmetrical.</div>
                </div>
              </Card>
            ))}
          </div>
          <Card className="mt-4 p-6" style={{ borderRadius: 16, border: "1px solid " + C.sand }}>
            <div className="text-[11px] font-medium uppercase tracking-wider mb-3" style={{ color: C.faint }}>Shape Rules</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { l: "Form", v: "Organic, flowing, terrain-like contours. Never geometric." },
                { l: "Colors", v: "Green → Blue → Orange → Pink flow. One or two per composition." },
                { l: "Overlap", v: "Shapes bleed off-screen. Overlap images and cards for depth." },
                { l: "Opacity", v: "5-15% for backgrounds. Up to 25% for decorative accents." },
              ].map(r => (
                <div key={r.l} className="py-1.5" style={{ borderBottom: "1px solid " + C.sandLt }}>
                  <span className="text-[12px] font-medium" style={{ color: C.blk }}>{r.l}</span>
                  <div className="text-[12px] mt-0.5" style={{ color: C.muted }}>{r.v}</div>
                </div>
              ))}
            </div>
          </Card>
        </Sec>

        {/* Cards */}
        <Sec title="Cards" id="cards">
          <div className="grid grid-cols-4 gap-4">
            <Card className="p-6" style={{ borderRadius: 16, border: "1px solid " + C.sand }}>
              <div className="text-[11px] font-medium uppercase tracking-wider mb-3" style={{ color: C.faint }}>Default</div>
              <div style={{ fontFamily: SERIF, fontSize: 20, color: C.blk, marginBottom: 6 }}>Clean Card</div>
              <div className="text-[13px] leading-relaxed" style={{ color: C.muted }}>White, border, generous radius.</div>
            </Card>
            <Card className="p-6" style={{ borderRadius: 16, border: "none", background: C.greenWash }}>
              <div className="text-[11px] font-medium uppercase tracking-wider mb-3" style={{ color: C.green }}>Tinted</div>
              <div style={{ fontFamily: SERIF, fontSize: 20, color: C.blk, marginBottom: 6 }}>Emerald Wash</div>
              <div className="text-[13px] leading-relaxed" style={{ color: C.muted }}>Soft color fill, no border.</div>
            </Card>
            <Card className="p-6" style={{ borderRadius: 16, border: "none", background: C.blueWash }}>
              <div className="text-[11px] font-medium uppercase tracking-wider mb-3" style={{ color: C.blue }}>Ocean</div>
              <div style={{ fontFamily: SERIF, fontSize: 20, color: C.blk, marginBottom: 6 }}>Blue Wash</div>
              <div className="text-[13px] leading-relaxed" style={{ color: C.muted }}>Cool accent background.</div>
            </Card>
            <div style={{ borderRadius: 16, padding: 2, background: GRAD_FLOW }}>
              <Card className="p-6 h-full" style={{ borderRadius: 14, border: "none" }}>
                <div className="text-[11px] font-medium uppercase tracking-wider mb-3" style={{ color: C.green }}>Featured</div>
                <div style={{ fontFamily: SERIF, fontSize: 20, color: C.blk, marginBottom: 6 }}>Gradient Border</div>
                <div className="text-[13px] leading-relaxed" style={{ color: C.muted }}>2px gradient wrapper.</div>
              </Card>
            </div>
          </div>
          {/* Dark card row */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Card className="p-6" style={{ borderRadius: 16, background: C.navy, border: "none" }}>
              <div className="text-[11px] font-medium uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>Dark</div>
              <div style={{ fontFamily: SERIF, fontSize: 20, color: "#fff", marginBottom: 6 }}>Navy Card</div>
              <div className="text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>For dark sections and CTAs.</div>
            </Card>
            <Card className="p-6 relative overflow-hidden" style={{ borderRadius: 16, background: C.orangeWash, border: "none" }}>
              <div style={{ position: "absolute", top: -30, right: -40, width: 200 }}><Blob1 color={C.orange} opacity={0.1} /></div>
              <div className="relative z-10">
                <div className="text-[11px] font-medium uppercase tracking-wider mb-3" style={{ color: C.orange }}>With Shape</div>
                <div style={{ fontFamily: SERIF, fontSize: 20, color: C.blk, marginBottom: 6 }}>Blob Overlay</div>
                <div className="text-[13px] leading-relaxed" style={{ color: C.muted }}>Organic shape inside card.</div>
              </div>
            </Card>
          </div>
        </Sec>

        {/* Charts */}
        <Sec title="Chart Styles" id="charts">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Card className="p-6" style={{ borderRadius: 16, border: "1px solid " + C.sand }}>
              <CardHeader className="p-0 pb-4"><div className="flex justify-between items-start"><div><div className="text-[11px] font-medium uppercase tracking-wider" style={{ color: C.faint }}>Growth</div><div className="text-3xl mt-1" style={{ fontFamily: SERIF, color: C.blk }}>$12.4M</div></div><Badge className="border-none text-[11px]" style={{ borderRadius: 8, background: C.greenWash, color: C.green }}>+24%</Badge></div></CardHeader>
              <AreaChart colors={[C.greenBr, C.blueBr]} data={[20,35,30,55,45,60,50,70,65,85,75,90]} h={100} />
            </Card>
            <Card className="p-6" style={{ borderRadius: 16, border: "1px solid " + C.sand }}>
              <CardHeader className="p-0 pb-4"><div className="flex justify-between items-start"><div><div className="text-[11px] font-medium uppercase tracking-wider" style={{ color: C.faint }}>Revenue</div><div className="text-3xl mt-1" style={{ fontFamily: SERIF, color: C.blk }}>$640K</div></div><Badge className="border-none text-[11px]" style={{ borderRadius: 8, background: C.orangeWash, color: C.orange }}>Q1</Badge></div></CardHeader>
              <BarChart colors={[C.greenBr, C.blueBr, C.orange, C.pinkBr]} data={[60,80,45,90,70,55,85]} h={80} />
            </Card>
            <Card className="p-6" style={{ borderRadius: 16, border: "1px solid " + C.sand }}>
              <CardHeader className="p-0 pb-3"><div className="text-[11px] font-medium uppercase tracking-wider" style={{ color: C.faint }}>Allocation</div></CardHeader>
              <div className="flex gap-5 items-center">
                <RingChart segments={[{v:40,c:C.greenBr},{v:25,c:C.blueBr},{v:20,c:C.orange},{v:15,c:C.pinkBr}]} size={88} sw={8} />
                <div className="flex flex-col gap-1.5">
                  {[{ l: "Accounts", v: "40%", c: C.greenBr }, { l: "Lending", v: "25%", c: C.blueBr }, { l: "Payments", v: "20%", c: C.orange }, { l: "Insights", v: "15%", c: C.pinkBr }].map(s => (
                    <div key={s.l} className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ background: s.c }} /><span className="text-[12px]" style={{ color: C.muted }}>{s.l}</span><span className="text-[12px] font-medium ml-auto" style={{ color: C.blk }}>{s.v}</span></div>))}
                </div>
              </div>
            </Card>
            <Card className="p-6" style={{ borderRadius: 16, border: "1px solid " + C.sand }}>
              <div className="text-[11px] font-medium uppercase tracking-wider mb-4" style={{ color: C.faint }}>Sparklines</div>
              <div className="grid grid-cols-2 gap-4">
                {[{ l: "Users", v: "24.8K", c: C.greenBr, d: [30,50,40,65,55,70,60,80] }, { l: "Revenue", v: "$8.2M", c: C.blueBr, d: [20,30,35,40,38,50,55,65] }, { l: "Loans", v: "1,240", c: C.orange, d: [50,45,55,50,60,58,65,70] }, { l: "NPS", v: "72", c: C.pinkBr, d: [60,55,65,62,68,70,72,72] }].map(s => (
                  <div key={s.l} className="flex justify-between items-center">
                    <div><div className="text-[11px]" style={{ color: C.muted }}>{s.l}</div><div className="text-base font-medium mt-0.5" style={{ color: C.blk }}>{s.v}</div></div>
                    <Spark data={s.d} color={s.c} />
                  </div>))}
              </div>
            </Card>
          </div>
        </Sec>

        {/* Buttons */}
        <Sec title="Buttons" id="buttons">
          <Card className="p-10" style={{ borderRadius: 16, border: "1px solid " + C.sand }}>
            <div className="text-[11px] font-medium uppercase tracking-wider mb-5" style={{ color: C.faint }}>Standard (12px radius)</div>
            <div className="flex gap-3 flex-wrap items-center mb-8">
              <Button className="text-[14px] font-medium px-6 py-3" style={{ borderRadius: 12, background: C.green, color: "#fff" }}>Primary</Button>
              <Button className="text-[14px] font-medium px-6 py-3" style={{ borderRadius: 12, background: GRAD_FLOW, color: "#fff" }}>Gradient</Button>
              <Button className="text-[14px] font-medium px-6 py-3" style={{ borderRadius: 12, background: C.white, border: "1px solid " + C.sand, color: C.blk }}>Secondary</Button>
              <Button className="text-[14px] font-medium px-6 py-3" style={{ borderRadius: 12, background: "transparent", color: C.muted, border: "none" }}>Ghost</Button>
            </div>
            <div className="text-[11px] font-medium uppercase tracking-wider mb-5" style={{ color: C.faint }}>Pill (999px radius)</div>
            <div className="flex gap-3 flex-wrap items-center mb-8">
              <Button className="text-[14px] font-medium px-6 py-3 rounded-full" style={{ background: C.green, color: "#fff" }}>Primary Pill</Button>
              <Button className="text-[14px] font-medium px-6 py-3 rounded-full" style={{ background: GRAD_FLOW, color: "#fff" }}>Gradient Pill</Button>
              <Button className="text-[14px] font-medium px-6 py-3 rounded-full" style={{ background: C.white, border: "1px solid " + C.sand, color: C.blk }}>Secondary Pill</Button>
            </div>
            <Separator style={{ background: C.sandLt }} className="mb-6" />
            <div className="text-[11px] font-medium uppercase tracking-wider mb-4" style={{ color: C.faint }}>Color Accents</div>
            <div className="flex gap-3 items-center flex-wrap">
              <Button className="text-[13px] font-medium px-5 py-2.5" style={{ borderRadius: 12, background: C.blueBr, color: "#fff" }}>Ocean</Button>
              <Button className="text-[13px] font-medium px-5 py-2.5" style={{ borderRadius: 12, background: C.orange, color: "#fff" }}>Orange</Button>
              <Button className="text-[13px] font-medium px-5 py-2.5" style={{ borderRadius: 12, background: C.pinkBr, color: "#fff" }}>Pink</Button>
              <Button className="text-[13px] font-medium px-5 py-2.5" style={{ borderRadius: 12, background: C.navy, color: "#fff" }}>Navy</Button>
              <Badge className="text-[10px] px-3 py-1 border-none" style={{ borderRadius: 8, background: C.greenWash, color: C.green }}>Badge</Badge>
              <Badge className="text-[10px] px-3 py-1 border-none" style={{ borderRadius: 8, background: C.blueWash, color: C.blue }}>Badge</Badge>
              <Badge className="text-[10px] px-3 py-1 border-none" style={{ borderRadius: 8, background: C.orangeWash, color: C.orange }}>Badge</Badge>
              <Badge className="text-[10px] px-3 py-1 border-none" style={{ borderRadius: 8, background: C.pinkWash, color: C.pink }}>Badge</Badge>
            </div>
          </Card>
        </Sec>

        {/* MCP */}
        <Sec title="ShadCN + Magic UI" id="mcp">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Card className="p-6" style={{ borderRadius: 16, border: "1px solid " + C.sand }}>
              <div className="text-[11px] font-medium uppercase tracking-wider mb-4" style={{ color: C.faint }}>MCP Config</div>
              <div className="p-5 font-mono text-[11px] leading-relaxed" style={{ borderRadius: 12, background: C.navy, color: C.muted }}>
                <span style={{ color: C.greenLt }}>// .cursor/mcp.json</span><br/>
                {"{"}<br/>
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
              <div className="text-[11px] font-medium uppercase tracking-wider mb-4" style={{ color: C.faint }}>Component Mapping</div>
              <div className="flex flex-col gap-2 mb-5">
                <div className="text-[10px] font-medium uppercase tracking-wider" style={{ color: C.faint }}>shadcn/ui</div>
                {[{ s: "Card", h: "rounded-2xl (16px), border or tinted" }, { s: "Button", h: "rounded-xl (12px) or rounded-full" }, { s: "Badge", h: "rounded-lg (8px), colored wash fills" }, { s: "Table", h: "rounded rows, soft dividers" }].map(m => (
                  <div key={m.s} className="flex items-center gap-3">
                    <Badge className="text-[10px] font-mono px-2.5 border-none" style={{ borderRadius: 8, background: C.greenWash, color: C.green }}>{m.s}</Badge>
                    <span className="text-[12px]" style={{ color: C.muted }}>{m.h}</span>
                  </div>))}
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-[10px] font-medium uppercase tracking-wider" style={{ color: C.faint }}>Magic UI</div>
                {[{ s: "marquee", h: "logo tickers, partner scrollers" }, { s: "blur-fade", h: "section content reveals" }, { s: "number-ticker", h: "animated stat counters" }, { s: "globe", h: "global reach visualization" }, { s: "particles", h: "ambient background energy" }].map(m => (
                  <div key={m.s} className="flex items-center gap-3">
                    <Badge className="text-[10px] font-mono px-2.5 border-none" style={{ borderRadius: 8, background: C.blueWash, color: C.blue }}>{m.s}</Badge>
                    <span className="text-[12px]" style={{ color: C.muted }}>{m.h}</span>
                  </div>))}
              </div>
            </Card>
          </div>
          <Card className="p-6" style={{ borderRadius: 16, border: "1px solid " + C.sand }}>
            <div className="text-[11px] font-medium uppercase tracking-wider mb-4" style={{ color: C.faint }}>CSS Variables</div>
            <div className="p-5 font-mono text-[11px] leading-loose" style={{ borderRadius: 12, background: C.navy, color: C.muted }}>
              <span style={{ color: C.greenLt }}>:root {"{"}</span><br/>
              {"  "}<span style={{ color: "#fff" }}>--background</span>: 38 18% 91%; <span style={{ color: C.greenLt }}>/* warm cream */</span><br/>
              {"  "}<span style={{ color: "#fff" }}>--primary</span>: 156 60% 26%; <span style={{ color: C.greenLt }}>/* #1A6B4A emerald */</span><br/>
              {"  "}<span style={{ color: "#fff" }}>--accent</span>: 200 58% 49%; <span style={{ color: C.greenLt }}>/* ocean blue */</span><br/>
              {"  "}<span style={{ color: "#fff" }}>--border</span>: 38 10% 80%;<br/>
              {"  "}<span style={{ color: "#fff" }}>--radius</span>: 1rem; <span style={{ color: C.greenLt }}>/* 16px */</span><br/>
              <span style={{ color: C.greenLt }}>{"}"}</span>
            </div>
          </Card>
        </Sec>

        {/* CTA */}
        <div className="relative overflow-hidden text-center" style={{ borderRadius: 24, padding: "64px 32px", background: C.navy }}>
          <div style={{ position: "absolute", top: -60, left: -80, width: 400 }}><Blob1 color={C.greenBr} opacity={0.08} /></div>
          <div style={{ position: "absolute", bottom: -40, right: -60, width: 350 }}><Blob2 color={C.blueBr} opacity={0.06} /></div>
          <div style={{ position: "absolute", top: 20, right: 40, width: 250 }}><Blob1 color={C.pinkBr} opacity={0.04} /></div>
          <div className="relative z-10">
            <div style={{ fontFamily: SERIF, fontSize: 36, color: "#fff", lineHeight: 1.15 }}>Ready to build<br/><span style={{ fontStyle: "italic" }}>with flow?</span></div>
            <div className="text-sm mt-3 mb-8" style={{ color: "rgba(255,255,255,0.4)" }}>Paste the prompt. Connect the MCPs. Ship vibrant UI.</div>
            <CopyBtn text={PROMPT} label="Copy Lovable Prompt" style={{ background: C.greenBr, color: "#fff" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
