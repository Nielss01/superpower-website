# AI Coach Architecture — Kasi Coach LLM Integration

## Overview

Replace the deterministic mock coach on `/build` with a real LLM-powered **lifetime coach** using the **Vercel AI SDK** and **Claude Haiku 4.5**. The coach is not a one-time form — it's a persistent mentor the user can return to at any time to refine their profile, ask business questions, get advice, or keep building. Chat history persists in localStorage so users pick up exactly where they left off.

## Stack

| Layer | Technology |
|-------|-----------|
| LLM | Claude Haiku 4.5 via `@ai-sdk/anthropic` |
| Framework | Vercel AI SDK (`ai` + `@ai-sdk/react`) |
| Client hook | `useChat` from `@ai-sdk/react` |
| API route | Next.js App Router edge function |
| Hosting | Vercel (serverless/edge) |
| Schema validation | Zod |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Browser — /build page                                   │
│                                                          │
│  ┌─────────────────────┐   ┌──────────────────────────┐ │
│  │  Chat Panel          │   │  OnePager Preview        │ │
│  │                      │   │                          │ │
│  │  CoachBubble (asst)  │   │  Updates live as         │ │
│  │  UserBubble (user)   │   │  ProfileData changes     │ │
│  │  [Active Widget]     │   │                          │ │
│  │  ─────────────────   │   │                          │ │
│  │  [ Text input      ] │   │                          │ │
│  └──────────┬───────────┘   └──────────────────────────┘ │
│             │                                            │
│     useKasiCoach hook                                    │
│     (wraps useChat + ProfileData state)                  │
└─────────────┬────────────────────────────────────────────┘
              │  POST /api/chat
              │  body: { messages, lang, idea, currentProfile }
              ▼
┌─────────────────────────────────────────────────────────┐
│  Vercel Edge Function — /api/chat/route.ts              │
│                                                          │
│  streamText({                                            │
│    model: anthropic('claude-haiku-4-5-20251001'),                │
│    system: buildSystemPrompt(lang, idea, profile),       │
│    messages,                                             │
│    tools: { updateProfile, generateProfile,              │
│             updateServices, requestWidget },             │
│    maxSteps: 3,                                          │
│    maxTokens: 400,                                       │
│  })                                                      │
│                                                          │
│  return toUIMessageStreamResponse()                      │
└─────────────────────────────────────────────────────────┘
```

## How It Works

### Conversation Flow

1. **User picks an idea** (Path A/B/C) and lands on `/build`
2. **Hardcoded greeting** appears instantly (from i18n, no LLM latency)
3. **User types** their first message → sent to `/api/chat` via `useChat`
4. **Claude responds** conversationally, calling tools to:
   - Extract data: `updateProfile({ field: "name", value: "Thabo" })`
   - Generate content: `generateProfile({ bio, plan, tagline, services })`
   - Show widgets: `requestWidget({ type: "township_dropdown" })`
5. **Client hook** intercepts tool calls → updates `ProfileData` state → renders widgets
6. **OnePager preview** updates live as profile fields are populated
7. **User saves** → localStorage → navigates to `/live`

### Tool Definitions

| Tool | Purpose | When called |
|------|---------|-------------|
| `updateProfile` | Save a text field (name, wijk, story, availability, promise) | User mentions a fact about themselves |
| `updateServices` | Save the services array | After user confirms/edits services |
| `generateProfile` | Generate bio, plan, tagline, services in one shot | Once name + township + idea are known |
| `requestWidget` | Signal UI to show a structured input widget | When the coach needs structured input (township dropdown, service editor, chips) |

### Widget Types

| Widget | Triggered by | Data collected |
|--------|-------------|----------------|
| `township_dropdown` | Coach asks "Where are you based?" | `wijk` field |
| `service_editor` | Coach asks about services | `services[]` array |
| `photo_upload` | Coach asks for a photo | `photoUrl` |
| `availability_chips` | Coach asks when they work | `availability` field |
| `promise_chips` | Coach asks about guarantees | `promise` field |

## System Prompt Strategy

The system prompt is built dynamically per request:

```typescript
function buildSystemPrompt(lang: Lang, idea: Idea, profile: ProfileData, path: string): string {
  return `
You are Kasi Coach — a warm, encouraging business mentor for young South African entrepreneurs.

LANGUAGE: Respond in ${lang === 'sa' ? 'Afrikaans' : 'English'}.

BUSINESS IDEA: "${idea.name}" — ${idea.description}
Category: ${idea.category} | Earning potential: ${idea.earning}

CURRENT PROFILE STATE:
${JSON.stringify(profile, null, 2)}

COLLECT THESE FIELDS (skip any already filled):
- name, wijk (township), services, story, availability, promise

RULES:
- Keep messages SHORT (2-3 sentences). Users are on mobile.
- Be conversational, not robotic. React to what they say.
- Use SA expressions naturally (eish, sharp, lekker, etc.)
- Extract multiple fields from a single message when possible.
- Call generateProfile once you have name + township + idea.
- Call requestWidget for structured inputs.
- Never re-ask for info already in the profile state.
  `;
}
```

## Concurrency & Scale

- **Expected load**: 5–20 concurrent sessions
- **Vercel edge functions**: Auto-scale, no cold start concerns at this volume
- **No shared state**: Each session is independent (localStorage on client, stateless API)
- **Streaming**: Tokens appear in real-time via SSE, no long-polling

## Cost Model (Haiku 4.5: $0.80/M input, $4.00/M output)

| Metric | Estimate |
|--------|----------|
| Tokens per session | ~40K input, ~30K output |
| Cost per session | ~$0.08 |
| 20 users/day | ~$1.60/day |
| Monthly (20 users/day) | **~$48/month** |

### Cost Controls

1. **Truncate history**: Send only last 15 messages + current profile state in system prompt
2. **maxTokens: 400**: Prevent runaway responses
3. **Prompt caching**: Anthropic auto-caches repeated system prompts
4. **Rate limiting**: 30 requests per IP per 10 minutes (simple in-memory counter)
5. **Feature flag**: `NEXT_PUBLIC_USE_LLM=true` — toggle off without redeploying

## Fallback Strategy

If the LLM is unavailable (API error, rate limit, key missing, or feature flag off):

1. `useKasiCoach` hook detects the error
2. Switches to `BuildPageFallback` — the original step-based deterministic flow
3. Uses `generateCoachContentFallback()` (the current template-based generator)
4. User experience degrades gracefully — still functional, just not conversational

## File Structure

```
src/
  app/
    api/
      chat/
        route.ts              ← NEW: streaming LLM endpoint
    build/
      page.tsx                ← REFACTORED: uses useKasiCoach hook
  hooks/
    useKasiCoach.ts           ← NEW: wraps useChat + profile state
  components/
    coach/
      CoachBubble.tsx         ← EXTRACTED from build page
      UserBubble.tsx          ← EXTRACTED from build page
      TypingDots.tsx          ← EXTRACTED from build page
      TownshipDropdown.tsx    ← EXTRACTED widget
      ServiceEditor.tsx       ← EXTRACTED widget
      PhotoUploader.tsx       ← EXTRACTED widget
      AvailabilityChips.tsx   ← EXTRACTED widget
      PromiseChips.tsx        ← EXTRACTED widget
      OnePager.tsx            ← EXTRACTED preview panel
  lib/
    types.ts                  ← NEW: shared ProfileData, Service
    system-prompt.ts          ← NEW: dynamic prompt builder
    fallback.ts               ← MOVED: generateCoachContent()
    i18n.ts                   ← UNCHANGED (widget labels)
    ideas.ts                  ← UNCHANGED
    wijk.ts                   ← UNCHANGED
    tokens.ts                 ← UNCHANGED
```

## Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `ANTHROPIC_API_KEY` | Vercel + `.env.local` | Claude API auth |
| `NEXT_PUBLIC_USE_LLM` | Vercel + `.env.local` | Feature flag (true/false) |

## Bilingual Handling

- **LLM messages**: Claude responds in the language specified by `lang` in system prompt
- **UI chrome** (button labels, headers): Continue using `LANG[lang]` from `i18n.ts`
- **Language switch mid-conversation**: Insert a system message `[Language switched to {lang}]` so Claude adapts

## Implementation Order

1. Install deps (`ai`, `@ai-sdk/anthropic`, `@ai-sdk/react`, `zod`)
2. Extract `ProfileData`/`Service` types → `src/lib/types.ts`
3. Build system prompt → `src/lib/system-prompt.ts`
4. Create API route → `src/app/api/chat/route.ts`
5. Create `useKasiCoach` hook → `src/hooks/useKasiCoach.ts`
6. Extract UI components → `src/components/coach/`
7. Refactor build page to use hook + components
8. Add fallback mode
9. Test all 3 paths × 2 languages
10. Deploy with env vars

## Conversation Persistence (localStorage)

Users must be able to close the browser, come back days later, and continue the conversation.

### Storage keys

| Key | Content | Purpose |
|-----|---------|---------|
| `sph-chat-history` | Full message array (JSON) | Restore conversation on return |
| `sph-profile` | ProfileData (JSON) | Current profile state |
| `sph-draft` | sessionStorage — WIP | Auto-save during active session |
| `sph-lang` | "en" \| "sa" | Language preference |

### How it works

1. **On mount**: Load `sph-chat-history` from localStorage → pass as `initialMessages` to `useChat`
2. **After each exchange**: Save updated messages to `sph-chat-history` (debounced 1s)
3. **On return visit**: Coach sees full history, greets user by name, knows profile state
4. **History truncation for API**: Send last 15 messages to API (cost control), keep FULL history in localStorage for display
5. **System prompt always includes**: Current `ProfileData` so LLM knows what's filled even if history is truncated
6. **Storage budget**: ~5MB per origin. 200 messages ≈ 200KB — plenty of room

### Returning user flow

- User visits `/build` → chat loads → scroll to bottom
- Coach acknowledges return: "Welcome back, {name}! Want to pick up where we left off?"
- System prompt includes `returningUser: true` + `lastVisit` timestamp

## Suggestion Chips (Keep the Conversation Alive)

After the initial profile-building phase, the coach proactively keeps the conversation going with clickable suggestion chips.

### suggestNextStep tool

```typescript
suggestNextStep: tool({
  description: 'Show suggestion chips to guide the user.',
  parameters: z.object({
    suggestions: z.array(z.object({
      label: z.string(),   // "Improve my bio"
      prompt: z.string(),  // sent as user message when clicked
    })).min(1).max(3),
  }),
})
```

Rendered as tappable pill buttons below the latest coach message. Clicking sends the `prompt` as a user message.

### Suggestion strategy

**During profile building (fields incomplete):**
- "Let's add your services →"
- "Tell me your story →"
- "Set your availability →"

**After profile is complete:**
- "How do I get my first customer?"
- "Help me improve my bio"
- "What should I charge?"
- "Marketing tips for WhatsApp"

**On return visits:**
- "How's business going?"
- "Update my servic
es"
- "I got my first client!"
- "Help me with a problem"

### Free-form input

The text input is always visible. Users can type anything at any time — questions, updates, requests. The coach is a full business mentor, not just a form filler.

## Future Considerations

- **Supabase**: When DB is added, persist conversations server-side for analytics
- **Streaming tool calls**: AI SDK supports streaming tool call arguments for large structured outputs
- **Multi-agent**: Could add specialized agents (pricing advisor, marketing coach) as sub-tools
- **Voice**: AI SDK has speech support — could add voice input for low-literacy users
