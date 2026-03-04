import { generateObject as aiGenerateObject } from "ai"
import { GeminiModel } from "./model"

/**
 * A generic wrapper for object generation that ensures a fresh model instance
 * and random key rotation for every structured task.
 */
export async function generateObject<T>(options: any) {
  console.log("[GENERATOR] Initializing object generation...")

  const result = await aiGenerateObject({
    model: GeminiModel(),
    ...options,
  })

  return result as any as { object: T }
}
