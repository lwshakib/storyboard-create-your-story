import { CLOUDFLARE_API_KEY, GLM_WORKER_URL } from '@/lib/env';

/**
 * Generates text using GLM-4.7-Flash through a Cloudflare Worker.
 *
 * @param options - Prompt, system message, temperature, etc.
 * @returns Object containing the generated text and metadata for compatibility.
 */
export const generateText = async (options: {
  prompt: string;
  system?: string;
  temperature?: number;
  maxTokens?: number;
}) => {
  const { prompt, system, temperature = 0.7, maxTokens } = options;

  if (!GLM_WORKER_URL) {
    throw new Error('GLM_WORKER_URL is not set in environment variables');
  }

  if (!CLOUDFLARE_API_KEY) {
    throw new Error('CLOUDFLARE_API_KEY is not set in environment variables');
  }

  console.log('[GENERATOR] Initializing GLM text generation...');

  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [];
  if (system) {
    messages.push({ role: 'system', content: system });
  }
  messages.push({ role: 'user', content: prompt });

  const response = await fetch(GLM_WORKER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${CLOUDFLARE_API_KEY}`,
    },
    body: JSON.stringify({
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GLM-4.7-Flash Worker Error (${response.status}): ${errorText}`);
  }

  const result = await response.json();

  if (!result.choices || !result.choices[0] || !result.choices[0].message) {
    throw new Error('Unexpected response format from GLM-4.7-Flash Worker');
  }

  const text = result.choices[0].message.content;

  // Return structure compatible with common AI SDK usage (e.g., result.text)
  return {
    text,
    finishReason: result.choices[0].finish_reason,
    usage: result.usage,
    // Add dummy steps for compatibility if needed, though most callers only use .text
    steps: [{ text }],
  };
};
