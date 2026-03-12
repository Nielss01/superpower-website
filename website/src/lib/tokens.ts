// ── Design System Tokens ─────────────────────────────────────────────────────
// Single source of truth for JS/TS usage. CSS variables in globals.css.

export const C = {
  // Neutrals
  cream:       "#EDE9E0",
  creamLt:     "#F5F2EC",
  creamDk:     "#E2DDD4",
  sand:        "#D5D0C7",
  sandLt:      "#E8E4DC",
  white:       "#FFFFFF",
  warm:        "#F9F7F3",
  // Text
  ink:         "#121212",
  dark:        "#1E1E1E",
  body:        "#4A4A48",
  muted:       "#8A8A86",
  soft:        "#B0AEA8",
  faint:       "#D0CEC8",
  // Emerald
  green:       "#1A6B4A",
  greenDk:     "#0D4F34",
  greenBr:     "#22A06B",
  greenLt:     "#6CD9A0",
  greenPale:   "#D4F0E2",
  greenWash:   "#EDF8F2",
  // Ocean
  ocean:       "#2B8FCC",
  oceanBr:     "#38BDF8",
  oceanLt:     "#7DD3FC",
  oceanPale:   "#D0EFFF",
  oceanWash:   "#EFF9FF",
  // Orange
  orange:      "#D4763C",
  orangeBr:    "#F59E0B",
  orangeLt:    "#FCD490",
  orangePale:  "#FEF3D6",
  orangeWash:  "#FFFBF0",
  // Pink
  pink:        "#D4497A",
  pinkBr:      "#F472B6",
  pinkLt:      "#FBCFE8",
  pinkWash:    "#FFF0F7",
  // Navy
  navy:        "#1B2838",
  // Wave-specific rich tones (from Glide reference)
  wDeepGreen:  "#1B5E3B",
  wBrightGreen:"#4CAF50",
  wLime:       "#6DBF47",
  wTeal:       "#2BA88C",
  wBlue:       "#3174B5",
  wSky:        "#5BA4D9",
  wOrange:     "#D4763C",
  wAmber:      "#C4923A",
  wGold:       "#B8860B",
  wRed:        "#B5452A",
  wSienna:     "#A0522D",
  wPink:       "#D4497A",
} as const;

export const GRAD = {
  flow:   "linear-gradient(135deg, #22A06B 0%, #38BDF8 35%, #D4763C 70%, #F472B6 100%)",
  cool:   "linear-gradient(135deg, #22A06B 0%, #38BDF8 100%)",
  warm:   "linear-gradient(135deg, #D4763C 0%, #F472B6 50%, #38BDF8 100%)",
  sunset: "linear-gradient(135deg, #D4763C 0%, #F472B6 100%)",
  greenBlue: "linear-gradient(135deg, #22A06B 0%, #38BDF8 100%)",
} as const;

export const FONT = {
  serif: "'Instrument Serif', serif",
  sans:  "'DM Sans', sans-serif",
} as const;

export const RADIUS = {
  sm:   "8px",
  md:   "12px",
  lg:   "16px",
  xl:   "20px",
  full: "999px",
} as const;

// Path card definitions
export const PATHS = [
  {
    id:    "idea",
    color: C.greenBr,
    wash:  C.greenWash,
    href:  "/idea",
    icon:  "⚡",
  },
  {
    id:    "browse",
    color: C.oceanBr,
    wash:  C.oceanWash,
    href:  "/ideas",
    icon:  "✦",
  },
  {
    id:    "quiz",
    color: C.orange,
    wash:  C.orangeWash,
    href:  "/quiz",
    icon:  "◈",
  },
] as const;
