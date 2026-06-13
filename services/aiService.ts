import { WizardData, TechStack, AIProvider } from '../types';

async function apiFetch<T>(path: string, body: object): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `Request failed: ${res.status}`);
  return json;
}

export const generateMasterPrompt = async (
  data: WizardData,
  provider: AIProvider
): Promise<string> => {
  const { result } = await apiFetch<{ result: string }>('/api/generate', { provider, data });
  return result;
};

export const suggestTechStack = async (
  name: string,
  description: string,
  type: string,
  provider: AIProvider
): Promise<TechStack | null> => {
  try {
    const { result } = await apiFetch<{ result: TechStack }>('/api/suggest-stack', {
      provider, name, description, type
    });
    return result;
  } catch {
    return null;
  }
};
