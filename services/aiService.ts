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

/**
 * Streams the master prompt via SSE, invoking onDelta with each chunk and the
 * accumulated text so far. Resolves with the full text once the stream ends.
 */
export const streamMasterPrompt = async (
  data: WizardData,
  provider: AIProvider,
  onDelta: (chunk: string, fullText: string) => void
): Promise<string> => {
  const res = await fetch('/api/generate/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, data })
  });

  if (!res.ok || !res.body) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error || `Request failed: ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let sepIndex: number;
    while ((sepIndex = buffer.indexOf('\n\n')) !== -1) {
      const frame = buffer.slice(0, sepIndex);
      buffer = buffer.slice(sepIndex + 2);
      if (!frame.trim()) continue;

      const lines = frame.split('\n');
      const event = lines.find(l => l.startsWith('event: '))?.slice(7).trim();
      const dataLine = lines.find(l => l.startsWith('data: '))?.slice(6);
      const payload = dataLine ? JSON.parse(dataLine) : {};

      if (event === 'delta' && payload.text) {
        fullText += payload.text;
        onDelta(payload.text, fullText);
      } else if (event === 'error') {
        throw new Error(payload.error || 'Generation failed.');
      } else if (event === 'done') {
        return fullText;
      }
    }
  }

  return fullText;
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
