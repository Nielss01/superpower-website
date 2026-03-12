# Superpowers Hub — Website Plan
**Version:** MVP v1.0
**Date:** 2026-03-12
**Audience:** Young entrepreneurs, 16–17, South Africa (schools + mobile)
**Aesthetic:** Organic, vibrant, warm — NOT corporate. Think Glide × Cape Town × township energy.

---

## 1. What We're Building

A web product that takes a young person from "I want to start something" to "I have a live business profile" in under 10 minutes. The website is the full funnel — landing, onboarding, AI coaching, profile publishing, and marketplace discovery — all in one.

**North star metric:** First WhatsApp booking received within 24 hours of publishing.

**Core principles:**
- Zero friction at entry (no email, no long forms)
- Conversation-first (multiple choice → chat, never blank text fields first)
- Mobile-first, but desktop works (school computer labs exist)
- Afrikaans/English bilingual (SA context, Afrikaans path names stay in)
- AI does the heavy lifting — user just confirms and refines
- WhatsApp is the transaction layer (no payment system in MVP)

---

## 2. Site Architecture

```
superpowerhub.org/
│
├── /                        → Landing (3 path cards)
│
├── /idee                    → Path A: "Ek het 'n idee" (own idea)
├── /idees                   → Path B: "Kies uit 50 idees" (browse library)
├── /quiz                    → Path C: "Help my kies" (interest quiz → AI match)
│
├── /bou                     → Build screen (AI Coach + live 1-pager, post-auth)
│
├── /profiel/[slug]          → Public profile (e.g., /profiel/sipho-sneakers)
│
└── /ontdek                  → Marketplace (filterable by wijk + category)
```

**Auth is not a page.** It's a bottom sheet overlay triggered on first tap of any path card. Phone number → 6-digit OTP → done. Supabase handles row creation. User never leaves the flow.

---

## 3. Design System (from superpowers2-design-system.jsx — strictly follow this)

### 3.1 Fonts
| Role | Font | Weight | Size | Notes |
|------|------|--------|------|-------|
| Display / H1 | Instrument Serif | 400 | 48–64px | Normal weight only. Italic variant for emphasis |
| H2 | Instrument Serif | 400 | 36–44px | |
| H3 | Instrument Serif | 400 | 24–28px | |
| Body | DM Sans | 400 | 16px | Line-height 1.7 |
| Caption / Label | DM Sans | 500 | 11px | Uppercase, 0.06em tracking |
| Button | DM Sans | 500 | 14px | |

**Rule:** Serif headings at weight 400 ONLY. Never bold. The typeface has presence on its own.

### 3.2 Color Tokens
```
Background:     #EDE9E0  (warm cream — page background)
Card:           #FFFFFF  (white)
Card Alt:       #F5F2EC  (cream light)
Border:         #D5D0C7  (sand)

Text Black:     #121212
Text Body:      #4A4A48
Text Muted:     #8A8A86
Text Faint:     #D0CEC8

Emerald:        #1A6B4A  (primary)
Emerald Bright: #22A06B  (hover/active)
Emerald Light:  #6CD9A0
Emerald Wash:   #EDF8F2  (tinted bg)

Ocean:          #2B8FCC
Ocean Bright:   #38BDF8
Ocean Wash:     #EFF9FF

Orange:         #D4763C
Orange Bright:  #F59E0B
Orange Wash:    #FFFBF0

Pink:           #D4497A
Pink Bright:    #F472B6
Pink Wash:      #FFF0F7

Navy:           #1B2838  (dark sections / CTAs)

Wave-specific rich tones (terrain shapes):
  Deep Green:   #1B5E3B
  Lime:         #6DBF47
  Bright Green: #4CAF50
  Teal:         #2BA88C
  Blue:         #3174B5
  Sky:          #5BA4D9
  Orange:       #D4763C
  Gold:         #C4923A
  Sienna:       #B5452A
  Pink:         #D4497A
```

**Gradients:**
```css
/* Flow — featured elements, CTAs, hero accents */
linear-gradient(135deg, #22A06B 0%, #38BDF8 35%, #D4763C 70%, #F472B6 100%)
/* Cool */
linear-gradient(135deg, #22A06B 0%, #38BDF8 100%)
/* Warm */
linear-gradient(135deg, #D4763C 0%, #F472B6 50%, #38BDF8 100%)
/* Sunset */
linear-gradient(135deg, #D4763C 0%, #F472B6 100%)
```

### 3.3 Spacing & Radius
- Base grid: 4px
- Section vertical padding: 80–100px
- Card padding: 24–32px
- Card gap: 16–24px
- Max content width: 1200px
- Page horizontal padding: 24px (mobile), 40px (desktop)

**Border radius:**
- Badges / small elements: 8px
- Buttons / inputs: 12px
- Cards / images: 16px
- Avatars / pill buttons: 999px

### 3.4 Wave Terrain Header (Signature Element)
**The signature visual.** 8–10 overlapping cubic-bezier SVG paths forming a flowing painted landscape.

**Rules:**
- ALL curves — only `C` (cubic bezier) commands. ZERO straight `L` lines on top edges. Every point is a smooth curve.
- Each wave path has its own **vertical linearGradient** — lighter at top edge, richer at bottom — gives each band depth and volume.
- Colors are **RICH and SOLID at full opacity**. No transparency (except pink at ~70%).
- Bands **dip and soar, crossing over each other** — not parallel stacks. Painterly landscape contours.
- Animation: anime.js v4 drives path morphing (d attribute alternates between two organic states) + vertical parallax float per band, staggered timings.
- Placed at bottom of hero section with CSS `mask-image` fade at top edge into cream background.

**Wave color palette** (in draw order, back → front):
```
#1B5E3B → #0D4F34 / #1B5E3B / #2BA88C  (Deep Green)
#3174B5 → #2B6FA0 / #3174B5 / #5BA4D9  (Blue)
#6DBF47 → #3E8C30 / #6DBF47 / #4CAF50  (Lime)
#2BA88C → #1B8C6B / #2BA88C / #22A06B  (Teal)
#D4763C → #C06830 / #D4763C / #E8944A  (Orange)
#5BA4D9 → #4A90C4 / #5BA4D9 / #7CC0E8  (Sky)
#C4923A → #A07828 / #C4923A / #D4A84E  (Gold)
#B5452A → #8C3620 / #B5452A / #C45A3A  (Sienna)
#22A06B → #1A8058 / #22A06B / #38B87C  (Emerald)
#D4497A → #C03868 / #D4497A / #E06090  (Pink, 70% opacity)
```

### 3.5 Organic Blob Shapes
**Rich background accents.** Every section should have 1–2 organic SVG blob shapes behind content. Rules:
- SVG paths only (NOT circles or ellipses)
- Flow through green → blue → orange → pink
- **60–100% opacity** — shapes are RICH and SATURATED, not 5–10% washed out. The brand is vibrant.
- Always bleed off edges of their container
- Overlap cards and images for collage depth
- Think: terrain map contours, Matisse cutouts, painterly

**Blob reference components** (reuse from design system):
```jsx
// Blob1 — rounder, wider (opacity 0.7)
<path d="M420,180 Q480,80 380,40 Q280,0 200,60 Q100,130 40,200 Q-10,260 60,320 Q130,380 240,370 Q350,360 400,280 Q440,220 420,180Z" />

// Blob2 — taller, narrower (opacity 0.6)
<path d="M320,120 Q380,50 300,20 Q220,-10 140,50 Q60,110 30,200 Q0,290 80,340 Q160,390 260,350 Q360,310 370,220 Q380,150 320,120Z" />
```
Create additional blob variants — never reuse the same shape twice on one page.

### 3.6 Buttons
```
Primary:    bg #1A6B4A, text white, radius 12px
Gradient:   bg flow-gradient, text white, radius 12px
Secondary:  bg white, border 1px #D5D0C7, text #121212, radius 12px
Ghost:      transparent, text #8A8A86
Pill:       same styles but radius 999px
```

### 3.7 Cards
```
Default:     white bg, 1px border #D5D0C7, 16px radius
Tinted:      greenWash / blueWash / orangeWash bg, no border
Featured:    2px flow-gradient border wrapper (14px inner radius)
Dark:        #1B2838 bg (navy), white text
Blob Overlay: tinted card + organic shape inside, absolute-positioned
```

### 3.8 Collage System
Overlapping elements = depth + energy:
- Images overlap cards (negative margin / absolute offset)
- Colored blob shapes overlap images
- Badge pills sit offset on card edges (transform: translate)
- Path cards on landing should feel slightly tilted / overlapping at hover

---

## 4. Page-by-Page Specs

### PAGE 1: Landing `/`

**Purpose:** Convert a curious teenager into someone who picks a path. Zero friction. Immediate energy.

**Above the fold (mobile):**
- Full viewport height
- Organic blob in background (green + blue flowing from top-right)
- Small "SUPERPOWER HUB" wordmark top-left (Instrument Serif, not bold)
- Big headline: *"Start jou besigheid. Vandag."* (Start your business. Today.)
- Subhead (DM Sans, muted): "Kry jou gratis besigheidsplan in 10 minute." (Get your free business plan in 10 minutes.)
- The 3 path cards (see below) — below headline or side-scroll on mobile
- No login button. No nav bar. Just the cards.

**3 Path Cards** — the hero action:
```
Card A: "Ek het 'n idee"          Color: Emerald  (#22A06B)
        Sub: "Vertel ons oor jou idee"
        Icon: lightbulb or spark

Card B: "Kies uit 50 idees"       Color: Ocean    (#38BDF8)
        Sub: "Browse ons biblioteek"
        Icon: grid or browse

Card C: "Help my kies"            Color: Orange   (#D4763C)
        Sub: "Doen 'n vinnige toets"
        Icon: quiz/question mark
```
Cards are large, thumb-friendly (min 56px tall tap target), gradient-bordered on hover. Tapping any card triggers the auth bottom sheet before advancing.

**Below the fold (social proof + how it works):**
- Brief "How it works" — 3 steps in horizontal scroll (mobile):
  1. Kies jou pad → 2. Praat met Kasi Coach → 3. Gaan live
- 2–3 sample profile cards (fake/demo data from townships):
  - "Sipho's Sneaker Cleaning" — Khayelitsha
  - "Amara's Braiding" — Soweto
  - "Thabo's Phone Repair" — Mitchells Plain
- These are clickable and link to the `/ontdek` marketplace
- Footer: minimal — just logo, WhatsApp link, "Gemaak in SA 🇿🇦"

**Design notes:**
- Background cream (#EDE9E0)
- Blob 1: emerald, top-right, 60vw wide, 10% opacity, bleed off screen
- Blob 2: blue, bottom-left, 40vw wide, 8% opacity
- Path cards can be slightly rotated at rest (-1deg, 0deg, +1deg) for energy
- On hover: card lifts (box-shadow), rotation returns to 0

---

### PAGE 2: Path A — `/idee` "Ek het 'n idee"

**Purpose:** User has their own business idea, they describe it in plain language.

**Layout:**
- Back arrow (top-left)
- Progress dots (1 of 3 steps in this path)
- H2: *"Vertel ons: wat wil jy maak of doen?"*
- Large text area — friendly placeholder: *"Bv: Ek wil fone skoonmaak by my skool..."*
  - Auto-grows, rounded (16px), cream background
  - Character count bottom-right (muted)
- Below: "Or pick a category first:" — 4 quick-pick pill buttons:
  - Food & Drink / Fashion / Tech / Services
- CTA: "Volgende →" (emerald pill button, disabled until >10 chars)
- Auth bottom sheet fires on CTA tap if not yet authenticated

**Design notes:**
- Warm cream page
- Blob in top-right corner (pink/orange tones)
- Keep it conversational — feels like messaging a friend, not a government form

---

### PAGE 3: Path B — `/idees` "Kies uit 50 idees"

**Purpose:** User browses 50 pre-validated "Zero-Rand" business ideas.

**Layout:**
- H2: *"50 idees. Almal gratis om te begin."*
- Filter pills (horizontal scroll): All / Food / Fashion / Tech / Services / Crafts / Beauty
- Grid: 2 columns (mobile), 3–4 columns (desktop)
- Each idea card:
  - Emoji icon (large, 32px)
  - Idea name (Instrument Serif, 18px)
  - Earning potential badge: e.g., "R50–R200/dag"
  - Wijk relevance tag (e.g., "Goed vir townships")
  - Tap to select → card gets gradient border + checkmark
- CTA bar: fixed bottom — "Kies [Idea Name] →" appears when one is selected
- Auth fires on CTA tap

**50 Ideas (sample, to be expanded):**
Sneaker Cleaning, Phone Screen Cleaning, Braiding/Weaving, Spaza Delivery, Homework Help, Social Media Managing, Phone Charging Station, Car Washing, Garden Help, Alterations/Sewing, Candle Making, Bead Jewelry, Food Packaging, Tutoring, Photography (phone), Cake/Cupcakes, Vegetable Garden, Dog Walking, House Cleaning, Laptop Repair, T-Shirt Printing, Event Decoration, Kids Party Hosting, Translating, Content Creation, Reselling (thrift), Ironing Service, Cooking/Meal Prep, Plumbing Help, Electrical Help... (etc to 50)

**Design notes:**
- Cards use white + colored left border (1 of 4 accent colors, rotated by category)
- Selected state: gradient border wrapper
- Subtle entrance animation: cards stagger in on load (Framer Motion or CSS animation-delay)

---

### PAGE 4: Path C — `/quiz` "Help my kies"

**Purpose:** 5-question interest quiz → AI matches hobbies → top 3 idea suggestions.

**Layout:**
- Step indicator (1/5, 2/5 etc.) — pill progress bar, emerald fill
- One question per screen (swipe/next, not all at once)
- Questions:

```
Q1: Wat doen jy graag ná skool?
    A: Sport / Kuns / Musiek / Tegnologie / Kook / Geld maak

Q2: Hoe werk jy die beste?
    A: Alleen / Met vriende / Buite / Binne

Q3: Hoeveel tyd het jy per dag?
    A: 1 uur / 2–3 uur / Naweke / Elke dag

Q4: Hoeveel geld het jy om te begin?
    A: R0 / Onder R50 / R50–R200 / Meer

Q5: Wat is die grootste ding in jou wyk?
    A: Kinders / Werkers / Studente / Almal
```

- Answer chips: large rounded cards (16px radius), tap to select, emerald highlight
- "Volgende" button appears on selection
- After Q5: brief loading animation ("Kasi Coach dink na...") then → top 3 matches
- Match cards: idea name + why it fits them (e.g., "Goed vir iemand wat van kuns hou")
- "Kies hierdie een" CTA → auth fires

**Design notes:**
- Each question has its own subtle background blob (rotates through green/blue/orange/pink)
- Progress bar uses flow gradient
- Loading state: animated gradient blob pulses
- Keep screens lean — one thing per view

---

### PAGE 5: Auth — Bottom Sheet (overlay, not a page)

**Trigger:** First CTA tap on any path (after selecting an idea/writing an idea/completing quiz).

**Component: `<AuthSheet />`**
- Slides up from bottom on mobile (full-width), centered modal on desktop
- Handle bar at top
- Title: *"Eers 'n vinnige check-in"* (First a quick check-in)
- Sub: "Geen wagwoord nodig — net jou foonnommer."
- Input: Phone number (South African format, +27, flagged)
- CTA: "Stuur OTP" (emerald button, full-width)
- After number submitted → shows 6 OTP digit inputs (auto-advance on each digit)
- Auto-submits on last digit — no button needed
- On success: sheet closes, user advances to /bou

**Design notes:**
- Sheet background: white, 24px top radius
- Backdrop: cream tint 60% opacity, blur(8px)
- Emerald accent throughout
- The sheet should feel native / WhatsApp-like in trust level
- Error state: red tint on input, shake animation

---

### PAGE 6: Build Screen — `/bou` (AI Coach + Live 1-Pager)

**Purpose:** The core product moment. Kasi Coach asks up to 6 questions. Every answer fills the live 1-pager preview on the right (desktop split, stacked on mobile).

**Layout — Desktop (split screen):**
```
┌─────────────────────────┬──────────────────────────┐
│  KASI COACH (LEFT)      │  1-PAGER PREVIEW (RIGHT) │
│                         │                           │
│  Chat-style messages    │  Business profile card    │
│  + answer chips         │  Fills live as answered   │
│                         │                           │
│  Progress: Q2/5 ████░░  │  50% filled indicator     │
└─────────────────────────┴──────────────────────────┘
```

**Layout — Mobile (stacked):**
- 1-pager preview floats as collapsed card at top (expandable)
- Coach conversation is the main screen
- Tap preview card to expand and see full 1-pager

**Kasi Coach — 6 Questions:**
```
Q1 (path-specific):
  Path A: "Vertel ons meer oor jou [stated idea]" → open text
  Path B: "Bevestig: jy wil [chosen idea] doen, reg?" → Yes/Refine
  Path C: "Jy het [matched idea] gekies — perfect! Reg om te bou?" → Yes

Q2 (all paths): "Wat is jou naam?"
  → Free text input (short), fills profile name live

Q3 (all paths): "Watter wyk is jy in?"
  → Dropdown: structured list of townships
  → THIS triggers the AI LLM call in the background (Kasi Coach 3-step plan + bio + service copy)
  → Visible: "Kasi Coach werk aan jou plan..."

Q4 (all paths): "Watter dienste bied jy aan en wat kos dit?"
  → Pre-filled suggestions (AI-generated based on idea + wijk)
  → Multiple choice chips + editable price fields
  → "Voeg diens by" (add service) option

Q5 (all paths): "Laai 'n foto op (opsioneel maar sterk aanbeveel)"
  → Camera / gallery upload
  → Nudge text: "Profiele met fotos kry 3x meer boodskappe"
  → Skip option available

Q6 (all paths): "Is hierdie besigheid jou eie of deel van 'n span?"
  → Solo / Team of 2 / Skool-projek
  → Fills profile "About" section
```

**The Live 1-Pager (right panel / expandable on mobile):**
As answers come in, this fills up:
```
┌────────────────────────────────┐
│  [Photo or gradient avatar]    │
│  [Name]'s [Business]           │
│  📍 [Wijk], South Africa       │
│                                │
│  📋 DIENSTE                    │
│  • [Service 1]........R[price] │
│  • [Service 2]........R[price] │
│                                │
│  💬 OOR MY                    │
│  [AI-generated bio, 2 lines]   │
│                                │
│  🚀 MY PLAN VIR EERSTE R50    │
│  1. [Step 1]                   │
│  2. [Step 2]                   │
│  3. [Step 3]                   │
│                                │
│  [WhatsApp] Stuur boodskap     │
└────────────────────────────────┘
```
Completion indicator: "73% klaar" pill badge, emerald fill, updates per answer.

**After Q5/AI call completes:**
- 1-pager hits 100%
- "Jou profiel is gereed!" message in coach panel
- Big CTA: "Publiseer My Profiel →" (gradient pill button, full-width)

**Design notes:**
- Coach messages: appear with subtle slide-in animation (stagger 150ms)
- Answer chips: large (min 44px), emerald border on selection
- 1-pager: white card, 16px radius, drop shadow, feels like a real document
- LLM streaming: show text as it streams (typewriter effect on bio + plan)
- Mobile: bottom sheet style for answer chips when keyboard is open

---

### PAGE 7: Go Live — `/live` (Celebration / Share)

**Purpose:** Profile is published. Give the user a moment of celebration, then immediately push them to share.

**Layout:**
- Full-page celebration moment:
  - Confetti/particle burst (emerald, blue, orange, pink)
  - Big serif text: *"Jou besigheid is live! 🔥"*
  - Sub: *"superpowerhub.org/[their-slug]"* — tap to copy
- Their published 1-pager previewed below (same design as /bou preview)
- Two big CTAs:
  1. "Deel op WhatsApp" — emerald gradient pill, full-width
     - Pre-filled message: "Kyk na my nuwe besigheid! 🚀 superpowerhub.org/sipho-sneakers"
  2. "Sien my profiel" — secondary outline pill
- Below: "Jy is nou ook in die marketplace:" → link to /ontdek?wijk=[their wijk]

**Design notes:**
- Background: navy (#1B2838) for drama, blobs bleeding in green/pink
- White serif headline pops on dark
- Confetti is CSS (keyframe animation, no library needed)
- This screen should feel like winning something — high energy

---

### PAGE 8: Public Profile — `/profiel/[slug]`

**Purpose:** This is the link shared on WhatsApp. It's what customers see. Must look trustworthy yet warm/local.

**URL examples:** `/profiel/sipho-sneakers`, `/profiel/amara-braiding`

**Layout:**
- Top: Organic blob hero section (cream bg, green blob top-right)
  - Profile photo (circular, 80px, or gradient avatar if no photo)
  - Business name (Instrument Serif, H1)
  - "📍 Khayelitsha, Cape Town" (DM Sans, muted)
  - Superpower badge: "✓ Superpower Hub" (small emerald pill — trust signal)
- Services section:
  - White cards, each service with name + price + description
  - "Bestel nou" WhatsApp deeplink button on each card
- "Oor [Name]" section:
  - AI-written bio (2–3 sentences, warm, first-person)
- "My Plan vir Eerste R50" section:
  - 3-bullet action plan (AI-generated)
  - Visual: numbered steps with emerald dot indicators
- WhatsApp CTA (sticky bottom bar on mobile):
  - "📱 Stuur boodskap" — full-width emerald button
  - Pre-fills: "Hallo [Name], ek het jou profiel gesien..."
- Footer: minimal — "Gebou met Superpower Hub 🚀"

**SEO:** This page should be server-rendered (Next.js dynamic route) with proper meta tags:
```html
<title>[Name]'s [Business] — Superpower Hub</title>
<meta name="description" content="[AI bio snippet] Based in [Wijk]." />
<meta property="og:image" content="[generated OG card]" />
```

**Design notes:**
- Warm cream background, not white (feels personal, not corporate)
- Blob 1: emerald, top-right, 8% opacity
- Profile photo overlaps the hero bottom edge slightly (collage depth)
- Service cards: white with 1px sand border, subtle shadow

---

### PAGE 9: Marketplace — `/ontdek`

**Purpose:** Public discovery. Anyone (no login) can browse all published profiles. Entry point for customers.

**URL params:** `/ontdek?wijk=khayelitsha&kategorie=beauty`

**Layout:**
- Hero: *"Ontdek jong entrepreneurs naby jou"*
- Filter bar (sticky):
  - Wijk dropdown (township selector)
  - Category pills: Almal / Kos / Mode / Tegnologie / Dienste / Skoonheid / Kuns
- Profile grid: 2 col mobile, 3 col desktop
  - Each card:
    - Photo or gradient avatar (gradient is category-colored)
    - Business name (Serif)
    - Category badge (colored pill)
    - Wijk (muted, small)
    - "Stuur WhatsApp" CTA (small, on hover/tap)
- Load more (not infinite scroll — just a button at bottom)
- CTA section: "Wil jy ook hier wees?" → links back to landing with scroll to paths

**Design notes:**
- Slightly darker cream background (#E2DDD4) than profile pages — feels like a directory
- Card hover: lift + gradient border appears
- Empty state (no results for filter): illustrated blob figure + "Nog niemand hier nie — wees die eerste!"
- Featured profiles row (top of page): 3 "Editor's Pick" profiles in larger cards with gradient borders

---

## 5. Component Library

Build these as reusable components (React recommended, or well-structured HTML/CSS):

| Component | Used On | Notes |
|-----------|---------|-------|
| `OrgBlob` | All pages | SVG organic shape, props: color, opacity, size, variant (1-6) |
| `PathCard` | Landing | Big tap target, 3 variants (A/B/C), hover animation |
| `ProgressBar` | Quiz, /bou | Emerald fill, flow-gradient for featured |
| `AnswerChip` | /bou, /quiz | Multiple choice answer button, selected state |
| `CoachMessage` | /bou | Chat bubble (left), slide-in animation |
| `OnePagerPreview` | /bou | Live-filling business profile, completion % |
| `AuthSheet` | Overlay | Bottom sheet, phone + OTP, Supabase |
| `IdeaCard` | /idees | 50-idea grid card, selectable state |
| `ServiceCard` | /profiel | Service + price + WhatsApp deeplink |
| `ProfileCard` | /ontdek | Marketplace grid tile |
| `WhatsAppBtn` | /live, /profiel | Emerald gradient, deeplink pre-fill |
| `WijkDropdown` | /bou, /ontdek | Structured township list, dropdown |
| `GradientBorder` | Featured cards | 2px gradient wrapper component |

---

## 6. Tech Stack (Recommended)

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 15 (App Router) | SSR for public profiles/SEO, dynamic routes for [slug] |
| Language | TypeScript | Type safety throughout |
| Styling | Tailwind CSS v4 | Utility-first, design token variables in globals.css |
| Components | shadcn/ui | Card, Button, Badge, Sheet, Dialog, Input, Avatar, Tabs |
| UI extras | Magic UI | blur-fade reveals, number-ticker for stats |
| Auth | Supabase Auth (phone OTP) | No-password SA-friendly |
| Database | Supabase (Postgres) | Profiles, ideas, wijk data |
| AI/LLM | Claude API (claude-sonnet-4-6) | Kasi Coach, bio, 3-step plan |
| Animation | Framer Motion + anime.js v4 | Framer: stagger reveals, bottom sheet, chat. anime.js: SVG path morphing, wave terrain animations |
| Fonts | Google Fonts (Instrument Serif + DM Sans) | Design system requirement |
| Hosting | Vercel | Next.js native |

**Project location:** `/website/` folder within the repo root.

**Init command:**
```bash
cd website
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
npx shadcn@latest init
```

---

## 7. Data Models

### Profile
```typescript
interface Profile {
  id: string
  slug: string                // e.g., "sipho-sneakers"
  user_id: string             // Supabase auth user
  phone: string
  name: string
  business_name: string
  wijk: string               // township dropdown value
  wijk_label: string         // display name
  category: string
  photo_url?: string
  bio: string                 // AI-generated
  services: Service[]
  action_plan: string[]      // 3 bullets, AI-generated
  path: 'own_idea' | 'browse' | 'quiz'
  source_idea?: string        // if browse or quiz
  published_at: string
  whatsapp_url: string        // pre-generated deeplink
}

interface Service {
  name: string
  price_min: number
  price_max?: number
  description?: string
}
```

### Wijk List (structured, NOT free text)
Selected townships to include (expand):
```
Cape Town Region: Khayelitsha, Mitchells Plain, Gugulethu, Langa, Delft, Nyanga, Manenberg, Athlone, Bishop Lavis, Hanover Park
Joburg Region: Soweto, Alexandra, Diepsloot, Tembisa, Kagiso, Thokoza, Kathlehong, Orange Farm
Pretoria Region: Mamelodi, Soshanguve, Atteridgeville, Mabopane
Eastern Cape: Mdantsane, KwaZakele, New Brighton, Motherwell
KZN: Umlazi, KwaMashu, Inanda, Ntuzuma
```

### Idea Library (50 ideas, Zero-Rand to start)
Each idea has:
```typescript
interface Idea {
  id: string
  name: string               // e.g., "Sneaker Cleaning"
  emoji: string
  category: Category
  earning_range: string      // "R50–R200/dag"
  wijk_fit: string           // "Goed vir digbevolkte areas"
  description: string        // 1 line
  starter_tips: string[]     // 2-3 AI-seedable tips
}
```

---

## 8. AI / Kasi Coach Spec

### When it fires
LLM call triggers after Q3 (wijk answered) — user has told us: idea/path + name + wijk. That's enough for hyperlocal, personal output.

### Prompt structure (constrained)
```
System: You are Kasi Coach, an entrepreneurship coach for young South Africans (16-17)
in townships. Respond in simple English + light Afrikaans phrases. Be warm, direct, and
encouraging. Never use corporate jargon.

User context:
- Name: {name}
- Business idea: {idea}
- Wijk: {wijk}
- Services selected: {services} (may be empty at this stage)

Generate:
1. BUSINESS BIO (2 sentences, first person, warm, mentions wijk):
   "Hallo! My naam is {name}..."

2. 3-STEP ACTION PLAN for first R50 (specific to wijk + idea):
   Step 1: [Immediate local action]
   Step 2: [WhatsApp/word of mouth action]
   Step 3: [First customer action]

3. SERVICE SUGGESTIONS (3–5, with price ranges in Rands):
   - {Service}: R{min}–R{max}

Keep all output under 150 words total. Be specific to {wijk}.
```

### Streaming
Stream the response so the 1-pager fills live as text arrives. Typewriter effect on bio + plan fields.

---

## 9. Build Order (Recommended)

**Phase 1 — Core shell + design system**
1. Set up Next.js + Tailwind + shadcn/ui + fonts
2. Create `globals.css` with all design tokens (CSS variables from design system)
3. Build `OrgBlob` component (reusable SVG blobs)
4. Build `GradientBorder` wrapper component

**Phase 2 — Landing + Paths**
5. Landing page `/` — hero + 3 path cards + how-it-works + sample profiles
6. Path A `/idee` — idea text input
7. Path B `/idees` — 50-idea grid with filter
8. Path C `/quiz` — 5-question quiz stepper

**Phase 3 — Auth + Build**
9. `AuthSheet` component — phone OTP (can mock Supabase for now)
10. `/bou` — split screen AI Coach + live 1-pager
11. Kasi Coach AI integration (Claude API)
12. Live 1-pager fill animation

**Phase 4 — Output + Go Live**
13. `/live` — celebration screen + share sheet
14. `/profiel/[slug]` — public profile page (SSR)
15. WhatsApp deeplink generation

**Phase 5 — Marketplace + Polish**
16. `/ontdek` — marketplace grid + filters
17. SEO: meta tags, OG images, sitemap
18. Mobile polish pass (test on actual SA Android devices — older models exist)
19. Performance: LCP < 2s on 3G (critical for SA mobile)

---

## 10. Mobile-First Constraints (SA Context)

- **Target device:** Entry-level Android (Samsung A-series), screen ~5.5–6.2"
- **Connection:** Often 3G, sometimes LTE. Optimize aggressively.
- **Keyboard:** Android keyboard takes ~40% of screen. Inputs must scroll above keyboard.
- **WhatsApp:** Primary share/communication layer. All sharing must use wa.me deeplinks.
- **Data sensitivity:** Don't load heavy images on first load. Use WebP. Lazy load grid images.
- **Touch targets:** Minimum 48px. Path cards should be 64px+ tall.
- **Thumb zone:** Critical actions (CTA buttons) always in bottom 40% of screen on mobile.
- **Desktop:** School computer labs exist. /bou split screen must work on 1024px+.
- **Language:** Afrikaans-first labels (with light English), but keep it code-switchable (many SA teens mix both languages naturally).

---

## 10.5 Language Strategy

**Default language: English.**
All copy ships in English by default. A language toggle in the top navbar lets users switch to South African (Afrikaans).

**Toggle UI:**
- Pill toggle in top-right of navbar: `EN | SA`
- Persisted in localStorage
- Smooth text transition (no flicker)
- "SA" label (not "AF") — more recognizable to the target audience

**Language key:** `"en"` | `"sa"`

Every string lives in a `LANG` object:
```js
const LANG = {
  en: { hero_headline: "Start your business. Today.", ... },
  sa: { hero_headline: "Start jou besigheid. Vandag.", ... }
}
```

Kasi Coach mirrors the toggle: responds in English by default, uses light Afrikaans phrases when SA is active.

---

## 11. Copy Tone Guide

**Voice:** Your cool older cousin who hustled their way out. Encouraging but real.

**Do (English):**
- "Let's build your business"
- "You're ready. Go do it."
- "Kasi Coach has a plan for you."
- Short sentences. Active voice.
- Celebrate small wins ("First step done! ✓")

**Do (SA/Afrikaans toggle):**
- "Laat ons jou besigheid bou"
- "Jy's gereed. Gaan dit doen."
- "Kasi Coach het 'n plan vir jou."

**Don't (both):**
- "Please complete the following form to proceed"
- "Your application is being processed"
- "Welcome to our platform"
- Long paragraphs
- Words like "portal", "dashboard", "submit", "register"

---

## 12. Success Metrics (MVP)

| Metric | Target |
|--------|--------|
| Landing → Path selection | >60% |
| Path → Auth completion | >70% |
| Auth → Build completion | >80% |
| Build → Profile published | >75% |
| Published → WhatsApp shared within 24h | >50% |
| WhatsApp → First booking received | >30% |

North star: **First booking within 24 hours of publishing.**

---

## File Structure (Next.js App Router)

```
src/
├── app/
│   ├── page.tsx                    → Landing
│   ├── idee/page.tsx               → Path A
│   ├── idees/page.tsx              → Path B
│   ├── quiz/page.tsx               → Path C
│   ├── bou/page.tsx                → Build screen
│   ├── live/page.tsx               → Go Live celebration
│   ├── profiel/[slug]/page.tsx     → Public profile (SSR)
│   ├── ontdek/page.tsx             → Marketplace
│   └── layout.tsx                  → Root layout (fonts, globals)
│
├── components/
│   ├── design/
│   │   ├── OrgBlob.tsx
│   │   ├── GradientBorder.tsx
│   │   └── tokens.ts               → C object from design system
│   ├── landing/
│   │   ├── PathCard.tsx
│   │   └── SampleProfile.tsx
│   ├── auth/
│   │   └── AuthSheet.tsx
│   ├── quiz/
│   │   ├── QuizStep.tsx
│   │   └── AnswerChip.tsx
│   ├── bou/
│   │   ├── KasiCoach.tsx
│   │   ├── CoachMessage.tsx
│   │   └── OnePagerPreview.tsx
│   ├── profile/
│   │   ├── ServiceCard.tsx
│   │   └── WhatsAppBtn.tsx
│   └── marketplace/
│       ├── ProfileCard.tsx
│       └── FilterBar.tsx
│
├── lib/
│   ├── supabase.ts
│   ├── claude.ts                   → Kasi Coach API call
│   ├── ideas.ts                    → 50-idea library data
│   ├── wijk.ts                     → Township list
│   └── deeplink.ts                 → WhatsApp URL generator
│
└── styles/
    └── globals.css                 → CSS variables + font imports
```

---

**Brand rules (from design system):**
- DO: Rich saturated shapes. Vibrant wave terrain. Serif 400 headings. Generous radius. Warm cream bg. Full-color accents.
- DON'T: No pastel shapes. No washed-out colors. No cold greys. No sharp corners. No bold serif.

*This plan is the source of truth for the Superpowers Hub build. All design decisions default to the design system (superpowers2-design-system.jsx). All UX decisions default to mobile-first, zero-friction, township-relevant.*
