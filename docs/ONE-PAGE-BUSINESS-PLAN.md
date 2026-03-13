# Plan: Restructure Kasi Coach to Build a "One Page Kasi Business Plan"

## Context

The Kasi Coach AI is working (streams, tool calls, profile updates) but asks generic questions and fills a profile card. The user wants the coach to ask **specific business plan questions** that map to a structured "One Page Kasi Business Plan" template. The coach should guide kids through these sections one at a time, filling the 1-pager on the right as they go.

**Target output — "One Page Kasi Business Plan":**
1. Business Name + Founder + Township
2. The Problem — what problem does this solve?
3. The Solution — how does the business fix it?
4. Target Customers — 3 specific customer types
5. Services & Pricing — what they offer + prices
6. Starting Costs — what they need to buy + total
7. Marketing & Sales — hook, platform, word-of-mouth
8. The MVP — one thing to do TODAY
9. First Week Plan — generated action steps

## Files to Change (in order)

### 1. `src/lib/types.ts` — Add new ProfileData fields

Add to `ProfileData` interface:
```typescript
problem: string;                    // "The Problem" section
targetCustomers: string[];          // 3 customer types
marketing: { hook: string; platform: string; wordOfMouth: string };
startingCosts: { items: { name: string; cost: string }[]; total: string };
mvp: string;                        // First step today
```

Update `EMPTY_PROFILE` with defaults. Keep old fields (`story`, `availability`, `promise`) for localStorage backward compat — just don't use them in the new flow.

### 2. `src/lib/i18n.ts` — Add business plan section labels

Add to both `en` and `sa`:
```
bou_plan_title:    "One Page Kasi Business Plan" / "Een Bladsy Kasi Besigheidsplan"
bou_problem:       "The Problem" / "Die Probleem"
bou_solution:      "The Solution" / "Die Oplossing"
bou_target:        "Target Customers" / "Teiken Klante"
bou_costs:         "Starting Costs" / "Begin Koste"
bou_marketing:     "Marketing & Sales" / "Bemarking & Verkope"
bou_mvp:           "The MVP — Do This Today" / "Die MVP — Doen Dit Vandag"
bou_first_week:    "My First Week Plan" / "My Eerste Week Plan"
bou_total:         "Total" / "Totaal"
```

### 3. `src/app/api/chat/route.ts` — Add new tools + expand updateProfile

- Expand `updateProfile` field enum: add `"problem"`, `"mvp"`
- Add 3 new tools:
  - `updateTargetCustomers({ customers: string[] })`
  - `updateStartingCosts({ items: {name, cost}[], total: string })`
  - `updateMarketing({ hook, platform, wordOfMouth })`
- Update `generateProfile` description: it now generates `tagline`, `plan[]`, and polishes `bio` after all sections are filled
- Update default `currentProfile` fallback to include new empty fields

### 4. `src/lib/system-prompt.ts` — New 9-step conversation flow

Replace the current 7-step flow with:

| Step | Question | Tool Call | Field |
|------|----------|-----------|-------|
| 1 | What's your name? (in greeting) | `updateProfile({field:"name"})` | name |
| 2 | Where are you based? | `requestWidget({type:"township"})` | wijk |
| 3 | What problem do you see that your business solves? | `updateProfile({field:"problem"})` | problem |
| 4 | How does your business fix this? (2-3 sentences) | `updateProfile({field:"bio"})` | bio (= solution) |
| 5 | Who will buy from you? Name 3 types of people | `updateTargetCustomers(...)` | targetCustomers |
| 6 | What will you offer and what will you charge? | `updateServices(...)` or widget | services |
| 7 | What do you need to buy to start? How much? | `updateStartingCosts(...)` | startingCosts |
| 8 | How will you get your first customers? (hook, platform, word-of-mouth) | `updateMarketing(...)` | marketing |
| 9 | What's ONE thing you can do TODAY? | `updateProfile({field:"mvp"})` | mvp |
| 10 | All done → `generateProfile()` | generates `tagline`, `plan[]` | tagline, plan |

Key prompt rules (keep from current):
- ALWAYS include next question IN the text (good/bad examples)
- ALWAYS call suggestNextStep at end
- ONE question at a time
- Celebrate each answer, then move to next step
- Track which steps are ✓ done vs → current based on `currentProfile` state

**"I don't know" / stuck handling — CRITICAL for kids:**

The coach MUST detect when a user is stuck, unsure, or gives a vague/short answer and proactively help them. These are kids who may not know business concepts. The system prompt must include:

1. **If the user says "I don't know" / "idk" / "not sure" / gives a very short answer:**
   - DON'T skip the step or move on
   - DON'T just repeat the question
   - DO give a concrete example from their specific business idea
   - DO offer 2-3 options they can pick from (via suggestNextStep chips)
   - Example: User says "idk" to "What problem does your business solve?" → Coach: "No worries! Think about it like this — with your Eco Car Wash, the problem could be: people's cars get dirty but they don't have time to go to a car wash, OR water is expensive and regular car washes waste it. Which one sounds more like your area? Or tell me in your own words!"

2. **suggestNextStep chips should always include a "Help me" option:**
   - During every step, one of the 3 suggestion chips should be a help option like:
     - "I need help with this" / "Help my hiermee"
     - "Give me an example" / "Gee my 'n voorbeeld"
     - "I'm not sure" / "Ek is nie seker nie"
   - When clicked, the coach provides a filled-out example based on their specific idea

3. **Proactive examples in questions:**
   - Every question should include a brief example to make it concrete
   - Example: "What problem does your Eco Car Wash solve? For example: 'People don't have time to wash their cars' or 'Car washes waste too much water'. What do you think?"

4. **The coach should FILL IN the answer for the user if they're really stuck:**
   - After the user says "I don't know" twice for the same step, the coach should say: "No stress! Based on what you told me, here's what I think works..." and call the tool to fill it in, then ask "Does this sound right? We can change it anytime!"
   - This keeps the flow moving and shows the kid what a good answer looks like

### 5. `src/hooks/useKasiCoach.ts` — Handle new tools + update completion

- Add `onToolCall` handlers for `updateTargetCustomers`, `updateStartingCosts`, `updateMarketing`
- Update completion calculation:
  - idea(5) + name(10) + wijk(10) + problem(10) + bio(10) + targetCustomers(10) + services(10) + startingCosts(10) + marketing(10) + mvp(10) + tagline(5) = 100%
- Update `loadProfile` to merge with `EMPTY_PROFILE` so old localStorage profiles get defaults for new fields

### 6. `src/components/coach/OnePager.tsx` — Redesign as business plan document

Transform from profile card to business plan document layout:

```
┌─────────────────────────────────────┐
│ ONE PAGE KASI BUSINESS PLAN         │
│ [Name]'s [Idea]  •  [Township]      │
├─────────────────────────────────────┤
│ 1. THE PROBLEM                      │
│    [problem text]                   │
├─────────────────────────────────────┤
│ 2. THE SOLUTION                     │
│    [bio/solution]  "[tagline]"      │
├─────────────────────────────────────┤
│ 3. TARGET CUSTOMERS                 │
│    • Customer type 1                │
│    • Customer type 2                │
│    • Customer type 3                │
├─────────────────────────────────────┤
│ 4. SERVICES & PRICING               │
│    Service 1 .............. R50     │
│    Service 2 .............. R120    │
├─────────────────────────────────────┤
│ 5. STARTING COSTS                   │
│    Item 1 ................. R30     │
│    Item 2 ................. R80     │
│    ────────────────────────         │
│    TOTAL .................. R110    │
├─────────────────────────────────────┤
│ 6. MARKETING & SALES                │
│    Hook: "..."                      │
│    Platform: WhatsApp               │
│    Word of mouth: "..."             │
├─────────────────────────────────────┤
│ 7. THE MVP — Do This Today          │
│    [mvp text]                       │
├─────────────────────────────────────┤
│ MY FIRST WEEK PLAN                  │
│    1. [step]  2. [step]  3. [step]  │
├─────────────────────────────────────┤
│ Built with Superpowers              │
└─────────────────────────────────────┘
```

- Each section animates in when data arrives (existing AnimatePresence pattern)
- Skeleton placeholders for unfilled sections
- Numbered sections with consistent styling
- Keep existing props: `{ profile: ProfileData; lang: Lang; completion: number }`

### 7. `src/app/build/page.tsx` — Update greeting text

Change greeting to reference "business plan":
- EN: `"Let's build your Kasi Business Plan! 🔥 What's your name?"`
- SA: `"Kom ons bou jou Kasi Besigheidsplan! 🔥 Wat is jou naam?"`

### 8. `src/lib/fallback.ts` — Update fallback generation

Add placeholder values for new fields so the fallback (non-LLM) path doesn't break.

## Example: Completed Business Plan

**The One Page Kasi Business Plan**
**Business Name:** Fresh Kicks Sneaker Care
**Founder:** Sipho | **Township:** Khayelitsha

**1. The Problem**
People in the community spend a lot of money on nice sneakers, but the streets can be dusty and shoes get dirty quickly. Buying new sneakers all the time is too expensive.

**2. The Solution**
A premium, drop-off sneaker cleaning service right in the neighborhood. We use safe soaps and careful brushing to make old sneakers look brand new again.
*"Your kicks, fresh like day one"*

**3. Target Customers**
- High school students who want to look good at school or parties
- Young professionals working in the city who need clean shoes for work
- Local creatives and musicians in the area

**4. Services & Pricing**
- Standard Clean .............. R50/pair
- Deep Clean .................. R80/pair

**5. Starting Costs**
- Soft shoe brush ............. R30
- Gentle cleaning soap ........ R40
- Microfiber cloth ............ R20
- **TOTAL ..................... R90**

**6. Marketing & Sales**
- **Hook:** "Before and After" photos of cleaned sneakers
- **Platform:** WhatsApp Business catalog + TikTok
- **Word of Mouth:** Ask every happy customer to share my WhatsApp number on their status

**7. The MVP — Do This Today**
Clean my brother's dirtiest sneakers for free. Take clear photos, put them on WhatsApp status: "Who wants their sneakers this fresh for R50? Send me a message!"

**My First Week Plan**
1. Clean 3 pairs for friends/family (free) and take photos
2. Set up WhatsApp Business with catalog and before/after photos
3. Post first TikTok showing the cleaning process
4. Get 5 paying customers through word of mouth
5. Buy extra supplies with first profits

## Verification

1. `npm run build` — no TypeScript errors
2. Clear localStorage, open `/build`, select an idea
3. Coach greets → asks name → township → problem → solution → target customers → services → costs → marketing → MVP
4. Each answer fills the corresponding section on the 1-pager (right side)
5. After all sections: `generateProfile` creates tagline + first week plan
6. Progress bar reaches 100%, save button appears
7. Test both EN and SA languages
8. Test returning user (localStorage persistence)
