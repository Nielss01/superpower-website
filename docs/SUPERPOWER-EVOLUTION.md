# "My Superpower" — 1-Pager Evolution Plan
**Date:** 2026-03-12
**Status:** Approved direction

---

## The Problem

The current 1-pager is thin (name, 3 services, a bio, a 3-step plan, WhatsApp CTA). It fills fast, the coach conversation ends abruptly, and "Publish" goes nowhere meaningful. There's no reason to come back.

---

## The Vision: "My Superpower" — a living business page

Instead of a static 1-pager, this becomes **a living document that grows**. The coach conversation doesn't end — it's a relationship. And the CTA isn't "WhatsApp me" — it's **"Save my Superpower"** which creates their persistent profile at `/s/[slug]` (short, shareable).

---

## 1. Richer 1-Pager

The preview card becomes a real page. Add these sections, filled progressively by coach conversation:

| Section | Current | Proposed |
|---------|---------|----------|
| Header | Name + wijk | Name + wijk + **tagline** (AI-generated one-liner) |
| Services | 3 flat rows | Services with **descriptions** + prices, expandable |
| Bio | 2 lines | **"My Story"** — 3-4 sentences, more personal |
| Plan | 3 steps | **"My First Week"** — actionable timeline |
| Social proof | None | **"What to expect"** — AI-generated promises/guarantees |
| Hours | None | **Availability** — "Weekdays after 3pm" / "Weekends" |
| CTA | WhatsApp | **"Book me"** button (WhatsApp deeplink with pre-filled msg) |

---

## 2. The Coach Keeps Going

After the current Q1-Q5, add new questions that unlock more sections:

```
Q6: "What makes you different from others?"
    → fills "My Story" with personality
    → Input: open text, friendly placeholder

Q7: "When are you available?"
    → fills availability section
    → Input: quick-pick chips (Weekdays after school / Weekends / Every day / By appointment)

Q8: "Any promise to your customers?"
    → fills "What to expect" section
    → Input: open text or suggested chips (Always on time / Money back if not happy / Free first consultation)
```

Each answer enriches the 1-pager. Completion redistributes:
- Current Q1-Q5 = 70%
- New Q6-Q8 = remaining 30%

---

## 3. Naming: "My Superpower"

The concept: your business IS your superpower. It's not a generic "profile" — it's personal.

| Context | Copy |
|---------|------|
| Save CTA | "Save my Superpower" |
| Share CTA | "Share my Superpower" |
| View CTA | "View my Superpower" |
| Coach completion msg | "Your Superpower is ready!" |
| Public page footer | "Built with Superpowers — start yours free" |

### Alternatives considered:
| Option | Feel | Verdict |
|--------|------|---------|
| **My Superpower** | Personal, empowering, ties to brand name | **Winner** |
| My Hustle | SA slang, energetic | Too casual for parents/teachers seeing it |
| My Page | Generic | Forgettable |
| My Business Card | Old-fashioned but familiar | Too corporate |

---

## 4. Post-Save Flow

### `/live` — Celebration Page
- Navy background (#1B2838) for drama
- Confetti/particle burst (CSS keyframes — emerald, blue, orange, pink)
- Big serif text: "Your Superpower is live!" / "Jou Superpower is live!"
- Shareable URL displayed: `superpowers.org/s/sipho-sneakers`
- Copy link button (tap to copy, toast confirmation)
- Two big CTAs:
  1. "Share on WhatsApp" — emerald gradient pill, pre-filled message
  2. "View my Superpower" — secondary outline pill → goes to `/s/[slug]`
- Below: "You're now in the marketplace" → link to `/explore`
- Blobs bleeding in green/pink on dark background

### `/s/[slug]` — Public Superpower Page
Short URL. This is what gets shared on WhatsApp. Contains:
- Warm cream background (personal, not corporate)
- Profile photo or gradient avatar (overlaps hero edge for collage depth)
- Business name (Instrument Serif, H1)
- Location pin: "Khayelitsha, South Africa"
- Verified badge: "Superpower Hub" (emerald pill — trust signal)
- Tagline (AI-generated one-liner)
- **Services** — white cards with name + price + description
- **My Story** — personal bio, 3-4 sentences
- **My First Week** — 3-step action plan with numbered emerald dots
- **What to Expect** — promises/guarantees
- **Availability** — when they're free
- **Book me** — sticky bottom bar, WhatsApp deeplink with pre-filled: "Hi [Name], I saw your Superpower profile..."
- Footer: "Built with Superpowers — start yours free"
- SEO: server-rendered with og:title, og:description, og:image

---

## 5. Implementation Steps

### Phase 1: Coach + 1-Pager Upgrade (current task)
1. **Expand `ProfileData`** — add `tagline`, `story`, `availability`, `promise` fields
2. **Expand `OnePager` component** — add new sections, only visible when data exists
3. **Add Q6-Q8 to the coach** — new steps that unlock remaining sections
4. **Update i18n** — new strings for Q6-Q8, section labels, "Save my Superpower" CTA
5. **Update completion calc** — redistribute across 8 questions instead of 5
6. **Rename the CTA** — "Save my Superpower" instead of "Publish my profile"

### Phase 2: Celebration + Public Page (next task)
7. **Build `/live` celebration page** — confetti, share URL, WhatsApp CTA
8. **Build `/s/[slug]` public page** — the shareable Superpower profile

### Phase 3: Persistence (future)
9. **Supabase integration** — save profiles to database
10. **Auth** — phone number OTP (bottom sheet, WhatsApp-like trust)
11. **Edit mode** — come back and update your Superpower
12. **Marketplace `/explore`** — browse all published Superpowers

---

## 6. Data Model Update

```typescript
interface ProfileData {
  // Existing
  idea: Idea | null;
  name: string;
  wijk: string;
  services: Service[];
  bio: string;           // → becomes "My Story" (richer)
  plan: string[];         // → becomes "My First Week"
  photoUrl: string | null;

  // New
  tagline: string;        // AI-generated one-liner
  story: string;          // "What makes you different" — personal narrative
  availability: string;   // "Weekdays after 3pm" etc.
  promise: string;        // "What to expect" — customer guarantees
  slug: string;           // URL-safe: "sipho-sneakers"
}
```

---

## 7. Completion Redistribution

| Step | Weight | Cumulative |
|------|--------|------------|
| Idea selected | 10% | 10% |
| Idea confirmed (Q1) | 5% | 15% |
| Name entered (Q2) | 10% | 25% |
| Wijk selected (Q3) | 10% | 35% |
| AI generates bio/plan/services | 10% | 45% |
| Services confirmed (Q4) | 10% | 55% |
| Photo (Q5, optional) | 5% | 60% |
| Story / "What makes you different" (Q6) | 15% | 75% |
| Availability (Q7) | 10% | 85% |
| Promise / "What to expect" (Q8) | 15% | 100% |
