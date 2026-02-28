/**
 * Simple utility to parse partial or incomplete JSON strings.
 * This is useful for streaming JSON from an LLM.
 */
export function parsePartialJson(jsonString: string): any {
  if (!jsonString) return null

  // Find the first occurrence of '{' or '[' to start parsing
  const firstBrace = jsonString.indexOf("{")
  const firstBracket = jsonString.indexOf("[")
  let startIndex = -1

  if (firstBrace !== -1 && firstBracket !== -1) {
    startIndex = Math.min(firstBrace, firstBracket)
  } else if (firstBrace !== -1) {
    startIndex = firstBrace
  } else if (firstBracket !== -1) {
    startIndex = firstBracket
  }

  if (startIndex === -1) return null

  let cleaned = jsonString.substring(startIndex).trim()

  // Remove markdown code block endings if they accidentally got included
  cleaned = cleaned
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim()

  // 2. Try to balance the braces
  let openBraces = 0
  let openBrackets = 0
  let inString = false
  let escaped = false

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i]
    if (escaped) {
      escaped = false
      continue
    }
    if (char === "\\") {
      escaped = true
      continue
    }
    if (char === '"') {
      inString = !inString
      continue
    }
    if (!inString) {
      if (char === "{") openBraces++
      if (char === "}") openBraces--
      if (char === "[") openBrackets++
      if (char === "]") openBrackets--
    }
  }

  // If inside a string, close it
  if (inString) cleaned += '"'

  // Close brackets and braces in reverse order
  let suffix = ""
  // Note: This is an extremely naive balancing. In a real scenario,
  // we would track the stack of [ and { to close them in the correct order.
  // But for this use case (a single high-level object), it often suffices.

  // A slightly better way: track the stack
  const stack: ("[" | "{")[] = []
  inString = false
  escaped = false
  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i]
    if (escaped) {
      escaped = false
      continue
    }
    if (char === "\\") {
      escaped = true
      continue
    }
    if (char === '"') {
      inString = !inString
      continue
    }
    if (!inString) {
      if (char === "{") stack.push("{")
      if (char === "[") stack.push("[")
      if (char === "}") stack.pop()
      if (char === "]") stack.pop()
    }
  }

  while (stack.length > 0) {
    const last = stack.pop()
    if (last === "{") cleaned += "}"
    if (last === "[") cleaned += "]"
  }

  try {
    return JSON.parse(cleaned)
  } catch (e) {
    // If it still fails, it's too incomplete or malformed
    return null
  }
}
