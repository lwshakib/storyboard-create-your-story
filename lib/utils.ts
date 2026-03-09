// Import the underlying conditional array joining tool clsx
import { clsx, type ClassValue } from "clsx"
// Import twMerge to handle Tailwind CSS class overriding conflicts securely
import { twMerge } from "tailwind-merge"

/**
 * Standard Shadcn/UI tailwind className merging utility wrapper.
 * Processes dynamic classes conditionally while preventing style collisions.
 */
export function cn(...inputs: ClassValue[]) {
  // First clean array structures via clsx, then resolve CSS overrides with twMerge
  return twMerge(clsx(inputs))
}

/**
 * Converts any CSS color string (rgb, rgba, name, etc.) to a hex string.
 * This is crucial for exports like PPTX that strictly require hex.
 */
export function colorToHex(color: string): string {
  // Prevent execution attempting during server-side SSR loops
  if (typeof window === "undefined") return color
  // Short-circuit execution if the color string is already manually formatted in HEX
  if (color.startsWith("#")) return color

  try {
    // Utilize an invisible HTML canvas layer dynamically instantiated to do formatting translation
    const ctx = document.createElement("canvas").getContext("2d")
    // If browser block fails context creation, revert gracefully via original string
    if (!ctx) return color
    // Assign generic string color to stroke fill config
    ctx.fillStyle = color
    // Read the serialized internal state property which implicitly calculates a standard hex value
    return ctx.fillStyle // Returns hex for most colors
  } catch {
    // Gracefully handle failure preventing app crash mapping unsupported color syntaxes
    console.warn("Color conversion failed for:", color)
    return color
  }
}
