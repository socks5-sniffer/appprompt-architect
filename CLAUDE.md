# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install       # install dependencies
npm run dev       # start both Vite frontend (:3000) and Express API (:3001) via dev.js
npm run dev:web   # frontend only
npm run dev:api   # backend only
npm run build     # production build -> dist/
npm run preview   # preview the production build
```

There is no test suite or linter configured in this repo. `tsconfig.json` has `noEmit: true` — type checking happens via the editor/Vite, not a standalone `tsc` build step.

Environment variables live in `.env` (copy from `.env.example`). The server only requires a key for whichever provider(s) you're testing (`GEMINI_API_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`); `PORT` and `FRONTEND_URL` default to `3001` and `http://localhost:3000`. Model IDs are also env-overridable (`GEMINI_MODEL`, `CLAUDE_MODEL`, `OPENAI_MODEL` — see `MODELS` in `server/index.js`) so a provider's model can be bumped without a code change; each falls back to a hardcoded current default if unset.

## Architecture

Two processes, no build-time coupling between them:

- **Frontend** (`App.tsx`, `components/`, `services/aiService.ts`) — a single-page wizard (Basics → Tech Stack → Features → Constraints → Review → Result) driven entirely by local React state in `App.tsx`. It never talks to AI providers directly; `services/aiService.ts` is a thin `fetch` client that talks to `/api/generate/stream` (SSE, used for Master Prompt generation) and `/api/suggest-stack` (plain JSON, used for tech-stack suggestions).
- **Backend** (`server/index.js`) — a single-file Express proxy that holds all provider API keys server-side and never exposes them to the client. It sanitizes/length-caps incoming wizard data (`sanitizeData`), then dispatches to one of three provider implementations (Gemini via `@google/genai`, Claude via `@anthropic-ai/sdk`, OpenAI via `openai`) based on the `provider` field in the request body. Vite's dev server proxies `/api/*` to `localhost:3001` (see `vite.config.ts`); in production the Express server must be deployed/reachable separately since Vite only builds the static frontend.

Each provider has a non-streaming implementation (`runX`, used by `/api/suggest-stack`) and a streaming one (`streamX`, used by `/api/generate/stream`) — they must be kept in sync (model ID, token limits, thinking/reasoning config) since they diverged from a single function. `/api/generate/stream` emits three SSE event types: `delta` (`{text}` chunks), `error` (`{error}`), and `done`; `services/aiService.ts`'s `streamMasterPrompt` parses these itself (no SSE library) and resolves with the full accumulated text.

Adding a fourth AI provider means updating in lockstep: `types.ts` (`AIProvider` union), both the non-streaming and streaming provider functions plus the `['gemini','claude','openai'].includes(provider)` guards in `server/index.js`, and the `PROVIDER_CONFIG` UI metadata in `App.tsx`.

Claude and OpenAI's current default models (`claude-sonnet-5`, `gpt-5.6-terra`) are reasoning models that spend part of their token budget on hidden reasoning before emitting visible output — this has already caused two silent-failure bugs worth knowing about if you touch these call sites: (1) Claude's non-streaming response content array isn't guaranteed to have the text block at index `0` (a `thinking` block can precede it) — always `.find(b => b.type === 'text')`, never index `[0]`; (2) OpenAI can return an empty `message.content` if `max_completion_tokens` is too tight for reasoning + output — both OpenAI call sites set `reasoning_effort: 'low'|'minimal'` and generous token headroom to avoid this, since this app's tasks (templated prompt text, short JSON) don't need deep reasoning.

`services/geminiService.ts` is legacy/unused — it predates the provider-agnostic backend proxy and calls Gemini directly from the client with a bundled key. Nothing imports it. Don't extend it; use `server/index.js` + `aiService.ts` instead.

`constants.ts` holds all static wizard content: `POPULAR_STACKS` presets, `TYPE_SUGGESTIONS`/`TECH_FIELD_SUGGESTIONS`, `SECURITY_CHECKLIST`, `COMMON_FEATURES`, and several stack-specific security-requirement text blocks (Spring Boot, Postgres RLS, Firebase, IAP validation) that get pulled into the generated Master Prompt based on user selections in `components/WizardSteps.tsx`.

`types.ts` is the single source of truth for the wizard's shape (`WizardData`, `TechStack`, `AppStep`, `AIProvider`) and its `INITIAL_DATA` default — both frontend and the wizard step components import from here.
