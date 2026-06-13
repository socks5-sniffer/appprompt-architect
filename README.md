# AppPrompt Architect

**AppPrompt Architect** is a sophisticated Prompt Construction Wizard that interviews developers to generate high-fidelity "Master Prompts" for LLM-assisted software development. It guides users through a multi-step wizard to collect project requirements, tech stack preferences, features, constraints, and security needs, then generates a comprehensive prompt ready to paste into any AI coding tool.

---

## Features

- Interactive multi-step wizard for project requirements
- **Triple AI provider support** — choose between Google Gemini, Anthropic Claude, and OpenAI per session
- **AI-powered tech stack suggestions** — let the selected AI recommend a stack based on your project description
- Per-step input validation with inline error messages
- Export generated prompts as **Markdown** or **JSON**
- Edit the generated prompt in-browser before exporting
- One-click copy to clipboard
- Secure backend proxy — API keys never leave the server
- Modern, fully responsive UI with mobile-optimised navigation

---

## Architecture

```
┌─────────────────────┐        ┌──────────────────────────┐
│   React Frontend    │  /api  │   Express Backend Proxy  │
│  (Vite, port 3000)  │ ──────▶│      (Node, port 3001)   │
└─────────────────────┘        └──────────┬───────────────┘
                                           │
                         ┌─────────────┴─────────────┐
                         │             │             │
                  Google Gemini   Anthropic Claude   OpenAI GPT-4o
```

The Vite dev server proxies all `/api` requests to the Express backend, so API keys are never bundled into the client.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 8 |
| Backend | Node.js, Express 4 |
| AI Providers | Google Gemini (`gemini-2.5-flash`), Anthropic Claude (`claude-opus-4-8`), OpenAI (`gpt-4o`) |
| Styling | Tailwind CSS |

---

## Getting Started

### Prerequisites

- Node.js v18+
- At least one AI provider API key (Gemini, Claude, or OpenAI)

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example .env
```

```env
# Required for Gemini provider
GEMINI_API_KEY=your-gemini-key

# Required for Claude provider
ANTHROPIC_API_KEY=your-anthropic-key

# Required for OpenAI provider
OPENAI_API_KEY=your-openai-key

# Optional — defaults shown
PORT=3001
FRONTEND_URL=http://localhost:3000
```

You only need the key for the provider(s) you intend to use.

### Local Development

```bash
npm run dev
```

This starts both the Vite frontend (port 3000) and the Express API server (port 3001) in parallel. Works on macOS, Linux, and Windows.

### Individual Servers

```bash
npm run dev:web   # Vite frontend only
npm run dev:api   # Express backend only
```

### Production Build

```bash
npm run build     # Vite production build → dist/
```

---

## Usage

1. Select your AI provider (Gemini, Claude, or OpenAI) from the sidebar or tap the provider chip on mobile to cycle through them.
2. Work through the four wizard steps:
   - **Project Basics** — name, type, audience, description
   - **Tech Stack** — pick a preset, use AI suggestion, or fill in manually
   - **Core Features** — add must-have capabilities from suggestions or type your own
   - **Requirements & Constraints** — security checklist, design and performance notes
3. Review the summary and click **Generate Master Prompt**.
4. Edit the result in-browser if needed, then **Copy**, **Export as Markdown**, or **Export as JSON**.

---

## Project Structure

```
├── server/
│   └── index.js          # Express backend proxy (API keys live here)
├── components/
│   ├── WizardSteps.tsx   # Per-step wizard UI with inline validation
│   └── common.tsx        # Shared UI primitives (Input, Button, Card…)
├── services/
│   └── aiService.ts      # Frontend API client (no keys, no direct AI calls)
├── App.tsx               # Wizard orchestration, validation, export logic
├── types.ts              # Shared TypeScript types incl. AIProvider
├── constants.ts          # Tech stack presets, security checklist, suggestions
├── dev.js                # Cross-platform parallel dev server launcher
├── .env.example          # Environment variable template
└── vite.config.ts        # Vite config with /api proxy
```

---

## Security Notes

- API keys are read from environment variables on the server and never sent to the browser.
- CORS is restricted to the origin specified in `FRONTEND_URL`.
- All AI request payloads are sanitised (length-capped, type-checked) before forwarding.
- The project has **0 npm audit vulnerabilities** (`concurrently` was replaced with `dev.js` to eliminate a critical `shell-quote` CVE).

---

## License

MIT
