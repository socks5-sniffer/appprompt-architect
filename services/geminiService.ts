import { GoogleGenAI, Type } from "@google/genai";
import { WizardData, TechStack } from "../types";

export const generateMasterPrompt = async (data: WizardData): Promise<string> => {
  // Always use process.env.API_KEY directly. Initialize inside the function to pick up any dynamic key injection.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  if (!process.env.API_KEY) {
    return "Error: API Key is missing. Please configure process.env.API_KEY.";
  }

  const modelId = "gemini-2.5-flash"; 

  const systemInstruction = `
    You are a Staff Principal Engineer and Architect with 20+ years of experience.
    Your task is to take a set of raw requirements and turn them into a comprehensive, high-fidelity "Master Prompt" that a developer can feed into an LLM (like Claude 3.5 Sonnet or Gemini 1.5 Pro) to build the software.

    The Master Prompt you generate must include:
    1. **Role Definition**: Tell the LLM exactly who it is (e.g., "Act as an Expert Full Stack Developer...").
    2. **Project Context**: A clear summary of what is being built.
    3. **Tech Stack Constraints**: Strict rules on what libraries to use.
    4. **Code Style Guidelines**: TypeScript rules, naming conventions, functional programming preference, etc.
    5. **Step-by-Step Implementation Plan**: A logical flow (Setup -> Database -> Backend -> Frontend).
    6. **Security & Performance**: Specific instructions based on the user's input.
    7. **UI/UX Philosophy**: Design system rules.

    Output ONLY the "Master Prompt". Do not add conversational filler before or after.
  `;

  const userPrompt = `
    Create a Master Prompt for the following project:
    
    Name: ${data.projectName}
    Type: ${data.projectType}
    Description: ${data.projectDescription}
    Target Audience: ${data.targetAudience}
    
    Technical Stack:
    - Frontend: ${data.techStack.frontend}
    - Backend: ${data.techStack.backend}
    - Database: ${data.techStack.database}
    - Styling: ${data.techStack.styling}
    - Deployment: ${data.techStack.deployment}
    - Tools: ${data.techStack.tools.join(', ')}
    
    Core Features to Implement:
    ${data.coreFeatures.map(f => `- ${f}`).join('\n')}
    
    Design Preferences: ${data.designPreferences}
    Security Requirements: ${data.securityReqs}
    Specific Security Instructions: ${data.securitySpecifics}
    Performance Requirements: ${data.performanceReqs}
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating prompt. Please check your API key and console logs.";
  }
};

export const suggestTechStack = async (
  name: string,
  description: string,
  type: string
): Promise<TechStack | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  if (!process.env.API_KEY) {
    console.error("API Key missing");
    return null;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Recommend the best modern tech stack for a "${type}" project named "${name}". Description: "${description}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            frontend: { type: Type.STRING, description: "Frontend framework/library" },
            backend: { type: Type.STRING, description: "Backend language/framework" },
            database: { type: Type.STRING, description: "Primary database" },
            styling: { type: Type.STRING, description: "CSS framework or methodology" },
            deployment: { type: Type.STRING, description: "Hosting platform" },
            tools: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "3-4 essential libraries or tools"
            }
          },
          required: ["frontend", "backend", "database", "styling", "deployment", "tools"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return null;
    return JSON.parse(jsonText) as TechStack;
  } catch (error) {
    console.error("Error suggesting stack:", error);
    return null;
  }
};
