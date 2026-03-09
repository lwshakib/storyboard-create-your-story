import { z } from 'zod';
import { CLOUDFLARE_API_KEY, GLM_WORKER_URL } from '@/lib/env';
import { zodToJsonSchema } from 'zod-to-json-schema';

/**
 * Generates a structured JSON object using GLM-4.7-Flash in strict schema mode.
 * 
 * @param params - Configuration for the generation.
 * @returns An object containing the generated JSON.
 */
export const generateObject = async ({
  messages,
  schema,
  temperature = 0.7,
  abortSignal,
}: {
  messages: any[];
  schema: z.ZodSchema;
  temperature?: number;
  abortSignal?: AbortSignal;
}) => {
  if (!GLM_WORKER_URL) {
    throw new Error('GLM_WORKER_URL is not set in environment variables');
  }

  if (!CLOUDFLARE_API_KEY) {
    throw new Error('CLOUDFLARE_API_KEY is not set in environment variables');
  }

  const url = GLM_WORKER_URL;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${CLOUDFLARE_API_KEY}`,
  };

  // Convert Zod schema to JSON Schema for the worker's strict mode
  const jsonSchema = zodToJsonSchema(schema as any);

  // Immediate exit if signal aborted
  if (abortSignal?.aborted) {
    throw new Error('AbortError');
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: headers,
    signal: abortSignal,
    body: JSON.stringify({
      messages,
      temperature,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'response_schema',
          strict: true,
          schema: jsonSchema,
        },
      },
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

  const message = result.choices[0].message;
  const content = message.content;
  
  try {
    return { object: JSON.parse(content) };
  } catch (error) {
    console.error('Failed to parse JSON from model response:', content);
    throw new Error('Model returned invalid JSON');
  }
};

