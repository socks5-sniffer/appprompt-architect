import express from 'express';
import cors from 'cors';
import { GoogleGenAI, Type } from '@google/genai';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { config } from 'dotenv';

config();

const app = express();
app.use(express.json({ limit: '1mb' }));

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',');
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o.trim()))) {
      cb(null, true);
    } else {
      cb(new Error('Not allowed by CORS'));
    }
  },
  methods: ['POST']
}));

const SYSTEM_INSTRUCTION = `
You are a Staff Principal Engineer and Architect with 20+ years of experience.
Your task is to take a set of raw requirements and turn them into a comprehensive, high-fidelity "Master Prompt" that a developer can feed into an LLM (like Claude or Gemini) to build the software.

The Master Prompt you generate must include:
1. **Role Definition**: Tell the LLM exactly who it is (e.g., "Act as an Expert Full Stack Developer...").
2. **Project Context**: A clear summary of what is being built.
3. **Tech Stack Constraints**: Strict rules on what libraries to use.
4. **Code Style Guidelines**: TypeScript rules, naming conventions, functional programming preference, etc.
5. **Step-by-Step Implementation Plan**: A logical flow (Setup -> Database -> Backend -> Frontend).
6. **Security & Performance**: Specific instructions based on the user's input.
7. **UI/UX Philosophy**: Design system rules.

Output ONLY the "Master Prompt". Do not add conversational filler before or after.
`.trim();

function sanitize(val, maxLen = 5000) {
  if (typeof val !== 'string') return '';
  return val.slice(0, maxLen);
}

function sanitizeData(data) {
  return {
    projectName: sanitize(data.projectName, 200),
    projectType: sanitize(data.projectType, 100),
    projectDescription: sanitize(data.projectDescription),
    targetAudience: sanitize(data.targetAudience, 500),
    techStack: {
      frontend: sanitize(data.techStack?.frontend, 500),
      backend: sanitize(data.techStack?.backend, 500),
      database: sanitize(data.techStack?.database, 500),
      styling: sanitize(data.techStack?.styling, 500),
      deployment: sanitize(data.techStack?.deployment, 500),
      tools: (Array.isArray(data.techStack?.tools) ? data.techStack.tools : [])
        .slice(0, 20).map(t => sanitize(t, 200))
    },
    coreFeatures: (Array.isArray(data.coreFeatures) ? data.coreFeatures : [])
      .slice(0, 50).map(f => sanitize(f, 500)),
    designPreferences: sanitize(data.designPreferences),
    securityReqs: sanitize(data.securityReqs),
    securitySpecifics: sanitize(data.securitySpecifics),
    performanceReqs: sanitize(data.performanceReqs)
  };
}

function buildGeneratePrompt(d) {
  return `Create a Master Prompt for the following project:\n\nName: ${d.projectName}\nType: ${d.projectType}\nDescription: ${d.projectDescription}\nTarget Audience: ${d.targetAudience}\n\nTechnical Stack:\n- Frontend: ${d.techStack.frontend}\n- Backend: ${d.techStack.backend}\n- Database: ${d.techStack.database}\n- Styling: ${d.techStack.styling}\n- Deployment: ${d.techStack.deployment}\n- Tools: ${d.techStack.tools.join(', ')}\n\nCore Features to Implement:\n${d.coreFeatures.map(f => `- ${f}`).join('\n')}\n\nDesign Preferences: ${d.designPreferences}\nSecurity Requirements: ${d.securityReqs}\nSpecific Security Instructions: ${d.securitySpecifics}\nPerformance Requirements: ${d.performanceReqs}`;
}

function buildStackPrompt(name, description, type) {
  return `Recommend the best modern tech stack for a "${type}" project named "${name}". Description: "${description}". Respond ONLY with a JSON object with these exact keys: frontend, backend, database, styling, deployment, tools (array of 3-4 strings). No markdown, no explanation.`;
}

async function runGemini(systemInstruction, userPrompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured on the server.');
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: userPrompt,
    config: { systemInstruction, temperature: 0.7 }
  });
  return response.text || '';
}

async function runClaude(systemInstruction, userPrompt, maxTokens = 4096) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not configured on the server.');
  const client = new Anthropic({ apiKey });
  const message = await client.messages.create({
    model: 'claude-opus-4-8',
    max_tokens: maxTokens,
    system: systemInstruction,
    messages: [{ role: 'user', content: userPrompt }]
  });
  const block = message.content[0];
  return block?.type === 'text' ? block.text : '';
}

async function suggestStackGemini(name, description, type) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured on the server.');
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: buildStackPrompt(name, description, type),
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          frontend: { type: Type.STRING },
          backend: { type: Type.STRING },
          database: { type: Type.STRING },
          styling: { type: Type.STRING },
          deployment: { type: Type.STRING },
          tools: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['frontend', 'backend', 'database', 'styling', 'deployment', 'tools']
      }
    }
  });
  return JSON.parse(response.text || 'null');
}

async function suggestStackClaude(name, description, type) {
  const text = await runClaude('', buildStackPrompt(name, description, type), 512);
  const clean = text.replace(/```json\n?|```\n?/g, '').trim();
  return JSON.parse(clean);
}

async function runOpenAI(systemInstruction, userPrompt, maxTokens = 4096) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured on the server.');
  const client = new OpenAI({ apiKey });
  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: userPrompt }
    ]
  });
  return response.choices[0]?.message?.content || '';
}

async function suggestStackOpenAI(name, description, type) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured on the server.');
  const client = new OpenAI({ apiKey });
  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 512,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: 'You output only valid JSON.' },
      { role: 'user', content: buildStackPrompt(name, description, type) }
    ]
  });
  return JSON.parse(response.choices[0]?.message?.content || 'null');
}

app.post('/api/generate', async (req, res) => {
  try {
    const { provider, data } = req.body ?? {};
    if (!provider || !data) return res.status(400).json({ error: 'Missing provider or data.' });
    if (!['gemini', 'claude', 'openai'].includes(provider)) return res.status(400).json({ error: 'Invalid provider.' });
    const safe = sanitizeData(data);
    const userPrompt = buildGeneratePrompt(safe);
    const result = provider === 'gemini'
      ? await runGemini(SYSTEM_INSTRUCTION, userPrompt)
      : provider === 'claude'
        ? await runClaude(SYSTEM_INSTRUCTION, userPrompt)
        : await runOpenAI(SYSTEM_INSTRUCTION, userPrompt);
    res.json({ result });
  } catch (err) {
    console.error('[/api/generate]', err.message);
    res.status(500).json({ error: err.message || 'Generation failed.' });
  }
});

app.post('/api/suggest-stack', async (req, res) => {
  try {
    const { provider, name, description, type } = req.body ?? {};
    if (!provider) return res.status(400).json({ error: 'Missing provider.' });
    if (!['gemini', 'claude', 'openai'].includes(provider)) return res.status(400).json({ error: 'Invalid provider.' });
    const sName = sanitize(name, 200), sDesc = sanitize(description), sType = sanitize(type, 100);
    const result = provider === 'gemini'
      ? await suggestStackGemini(sName, sDesc, sType)
      : provider === 'claude'
        ? await suggestStackClaude(sName, sDesc, sType)
        : await suggestStackOpenAI(sName, sDesc, sType);
    res.json({ result });
  } catch (err) {
    console.error('[/api/suggest-stack]', err.message);
    res.status(500).json({ error: err.message || 'Suggestion failed.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`AppPrompt Architect API running on http://localhost:${PORT}`));
