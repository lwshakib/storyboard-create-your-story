import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts any CSS color string (rgb, rgba, name, etc.) to a hex string.
 * This is crucial for exports like PPTX that strictly require hex.
 */
export function colorToHex(color: string): string {
  if (typeof window === "undefined") return color
  if (color.startsWith("#")) return color

  try {
    const ctx = document.createElement("canvas").getContext("2d")
    if (!ctx) return color
    ctx.fillStyle = color
    return ctx.fillStyle // Returns hex for most colors
  } catch (e) {
    console.warn("Color conversion failed for:", color)
    return color
  }
}
