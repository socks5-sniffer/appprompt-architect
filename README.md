
# AppPrompt Architect

**AppPrompt Architect** is a sophisticated Prompt Construction Wizard that interviews developers to generate high-fidelity "Master Prompts" for LLM-assisted software development. It guides users through a multi-step wizard to collect project requirements, tech stack preferences, features, constraints, and security needs, then generates a comprehensive prompt for use with advanced LLMs (e.g., Gemini, Claude).

---

## Features
- Interactive multi-step wizard for project requirements
- Tech stack suggestions and customization
- Security and performance requirements
- Generates a "Master Prompt" for LLMs
- Modern, responsive UI

## Tech Stack
- **Frontend:** React 19, TypeScript, Vite
- **Backend:** (Prompt generation only; no server required)
- **AI Integration:** Google Gemini API (`@google/genai`)
- **Styling:** Tailwind CSS (see constants for stack presets)

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- Gemini API Key

### Installation & Local Development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Set your Gemini API key in `.env.local`:
   ```env
   GEMINI_API_KEY=your-key-here
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Usage
Follow the wizard to enter your project details. On completion, the app will generate a "Master Prompt" tailored for your requirements and tech stack.

---

## Project Structure
- `App.tsx` — Main app logic and wizard flow
- `components/` — UI components and wizard steps
- `services/geminiService.ts` — Gemini API integration and prompt generation
- `constants.ts` — Tech stack presets and suggestions
- `types.ts` — TypeScript types for wizard data

---

## License
MIT
