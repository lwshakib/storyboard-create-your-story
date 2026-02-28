import {
  generateText as aiGenerateText,
  generateObject as aiGenerateObject,
} from "ai"
import { GeminiModel } from "./model"

/**
 * A generic wrapper for text generation that ensures a fresh model instance
 * (with random API key and model selection) is used for every request.
 */
export async function generateText(options: any) {
  console.log("[GENERATOR] Initializing text generation...")

  const result = await aiGenerateText({
    model: GeminiModel(),
    ...options,
  })

  console.log("[GENERATOR] Steps taken total:", result.steps.length)
  result.steps.forEach((step, i) => {
    console.log(
      `[GENERATOR] Step ${i} | Text len: ${step.text?.length || 0} | Tool calls: ${step.toolCalls?.length || 0}`
    )
  })

  return result
}

/**
 * A generic wrapper for object generation that ensures a fresh model instance
 * and random key rotation for every structured task.
 */
export async function generateObject(options: any) {
  console.log("[GENERATOR] Initializing object generation...")

  return await aiGenerateObject({
    model: GeminiModel(),
    ...options,
  })
}
