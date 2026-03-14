# CLAUDE.md

## Project Overview
This is a **Next.js 16 App Router** project using TypeScript, Tailwind CSS v4, Supabase, and the Vercel AI SDK.

Claude should act as a senior TypeScript engineer working within this repository.

## Tech Stack
- TypeScript (strict mode)
- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4
- shadcn/ui + Radix Base UI
- Framer Motion / anime.js
- Vercel AI SDK (`ai`, `@ai-sdk/anthropic`)
- Supabase (`@supabase/supabase-js`, `@supabase/ssr`)
- Zod
- ESLint
- Prettier
- Vitest

## Package Management
Use pnpm (`pnpm-lock.yaml` is present). Never mix npm and pnpm.

Common commands (run from `website/`):

```
pnpm install
pnpm dev
pnpm build
pnpm test
pnpm lint
```

## TypeScript Rules
- Always use strict typing
- Avoid `any`
- Prefer explicit types
- Prefer async/await
- Use ES modules

## Folder Structure

```
website/
  src/
    app/          # Next.js App Router pages and API routes
    components/   # Shared UI components
    hooks/        # Custom React hooks
    lib/          # Utilities and Supabase clients
      supabase/
        client.ts  # Browser client (createBrowserClient)
        server.ts  # Server client (createServerClient + cookies)
    test/         # Test utilities / setup
```

## Supabase

Use `@supabase/ssr` (not raw `@supabase/supabase-js`) for all client creation:
- **Browser/client components**: `src/lib/supabase/client.ts` → `createBrowserClient`
- **Server components / Route Handlers**: `src/lib/supabase/server.ts` → `createServerClient`

Rules:
- Keep Supabase client creation in `src/lib/supabase/`
- Avoid inline SQL in business logic
- Use typed queries where possible
- Never expose service role keys

## Environment Variables

File: `website/.env.local`

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

`NEXT_PUBLIC_` prefix is required for vars used in browser/client code. Never commit secrets.

## Code Style
- Prettier formatting
- ESLint clean
- 2-space indentation
- Semicolons required

Naming:
- `camelCase` variables
- `PascalCase` types and components
- `kebab-case` filenames

## Testing

Preferred: Vitest (config at `website/vitest.config.ts`)

Tests live in:
- `src/test/`
- `*.test.ts` / `*.test.tsx` co-located or in test dir

Always run `pnpm test` before finishing work.

## Development Workflow

1. Inspect existing code
2. Reuse utilities and existing components
3. Implement minimal solution
4. Add types
5. Add tests
6. Run lint/build/test

## Security
Never:
- Expose secrets
- Log credentials
- Commit `.env.local`
- Bypass Supabase auth

## Claude Behavior

When editing code:
- Read relevant files first
- Make minimal changes
- Avoid large refactors
- Explain architecture changes
