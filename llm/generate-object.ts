import { z } from 'zod';
import { CLOUDFLARE_API_KEY, GLM_WORKER_URL } from '@/lib/env';
import { zodToJsonSchema } from 'zod-to-json-schema';

/**
 * Generates a structured JSON object using GLM-4.7-Flash in strict schema mode.
 *
 * @param prompt - The instruction for the AI (e.g., "Create a quiz about X").
 * @param objectSchema - A Zod schema defining the required output structure.
 * @returns The parsed JSON object matching the provided schema.
 */
export const generateObjectFromAI = async (
  prompt: string,
  objectSchema: z.ZodTypeAny
) => {
  if (!GLM_WORKER_URL) {
    throw new Error('GLM_WORKER_URL is not set in environment variables')
  }

  const url = GLM_WORKER_URL

  if (!CLOUDFLARE_API_KEY) {
    throw new Error('CLOUDFLARE_API_KEY is not set in environment variables')
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${CLOUDFLARE_API_KEY}`,
  }

  // Convert Zod schema to JSON Schema for the worker's strict mode
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsonSchema = zodToJsonSchema(objectSchema as any)

  const response = await fetch(url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'response_schema',
          strict: true,
          schema: jsonSchema,
        },
      },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`GLM-4.7-Flash Worker Error (${response.status}): ${errorText}`)
  }

  const result = await response.json()

  if (!result.choices || !result.choices[0] || !result.choices[0].message) {
    throw new Error('Unexpected response format from GLM-4.7-Flash Worker')
  }

  const content = result.choices[0].message.content

  try {
    return JSON.parse(content)
  } catch (parseError) {
    console.error('Failed to parse JSON from model response:', content, parseError)
    throw new Error('Model returned invalid JSON')
  }
}

/**
 * Compatibility wrapper for the existing generateObject signature.
 */
export async function generateObject<T>(options: {
  schema: z.ZodTypeAny
  prompt: string
  system?: string
}) {
  const fullPrompt = options.system
    ? `${options.system}\n\n${options.prompt}`
    : options.prompt

  const object = await generateObjectFromAI(fullPrompt, options.schema)
  return { object: object as T }
}
