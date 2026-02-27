import { generateText, stepCountIs } from "ai"
import { GeminiModel } from "./model"
import { tools } from "./tools"
import { generateHtmlStoryboardPrompt } from "./prompts"
import { formatInspirationsForPrompt } from "@/inspirations/registry"

/**
 * Generates a single, high-fidelity slide based on a specific prompt.
 * Ensures the output is clean HTML and handles tool-calling autonomously.
 */
export async function generateSingleSlideText(prompt: string, context?: string) {
  const inspirations = formatInspirationsForPrompt()
  const systemPrompt: string = generateHtmlStoryboardPrompt(inspirations)

  const fullPrompt = context 
    ? `CONTEXT OF FULL STORYBOARD:\n${context}\n\nCURRENT TASK:\n${prompt}`
    : prompt

  const { text } = await generateText({
    model: GeminiModel(),
    system: systemPrompt,
    prompt: fullPrompt,
    tools,
    toolChoice: 'auto',
    stopWhen: stepCountIs(10),
    temperature: 0.7,
  })

  console.log("text",text);
  

  // Clean the response: The AI might wrap the output in markdown code blocks or add fluff
  let cleanText = text.trim()
  
  // 1. Remove markdown code block wrappers
  cleanText = cleanText.replace(/```[a-z]*\n?/gi, "").replace(/\n?```/g, "").replace(/```/g, "")

  // 2. Remove any stray custom tags
  cleanText = cleanText.replace(/<slide-\d+[^>]*>/gi, "").replace(/<\/slide-\d+>/gi, "")
  cleanText = cleanText.replace(/<structured-data>[\s\S]*?<\/structured-data>/gi, "").trim();

  // 3. Primary: Extract full HTML document
  const htmlDocRegex = /(<!DOCTYPE html[\s\S]*?<\/html>|<html[\s\S]*?<\/html>)/i;
  const docMatch = cleanText.match(htmlDocRegex);
  if (docMatch) {
    return docMatch[1].trim();
  }

  // 4. Secondary: Extract anything between the first < and last >
  // This is the most robust way to strip conversational fluff
  const firstAngle = cleanText.indexOf('<');
  const lastAngle = cleanText.lastIndexOf('>');
  
  if (firstAngle !== -1 && lastAngle !== -1 && lastAngle > firstAngle) {
    const extracted = cleanText.substring(firstAngle, lastAngle + 1).trim();
    if (extracted) {
      console.log("[GENERATOR] Extracted HTML via bracket boundary.");
      return extracted;
    }
  }

  // 5. Final Fallback: Return what we have or original trimmed text
  if (!cleanText && text.trim()) {
    return text.trim();
  }

  return cleanText;
}
