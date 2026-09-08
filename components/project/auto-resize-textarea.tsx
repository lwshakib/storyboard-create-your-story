"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface AutoResizeTextareaProps {
  value: string
  onChange: (val: string) => void
  onBlur?: () => void
  className?: string
  placeholder?: string
  rows?: number
  disabled?: boolean
  autoFocus?: boolean
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
}

/**
 * AutoResizeTextarea dynamically calculates and updates its height
 * to fit content without causing page jumps or awkward scrollbars.
 */
export const AutoResizeTextarea = ({
  value,
  onChange,
  onBlur,
  className,
  placeholder,
  rows = 1,
  disabled = false,
  autoFocus = false,
  onKeyDown,
}: AutoResizeTextareaProps) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const adjustHeight = React.useCallback(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      const scrollHeight = textarea.scrollHeight

      let finalHeight = scrollHeight
      if (typeof window !== "undefined") {
        const computedMaxHeight = window.getComputedStyle(textarea).maxHeight
        const maxHeight = parseFloat(computedMaxHeight)
        if (!isNaN(maxHeight)) {
          if (scrollHeight > maxHeight) {
            finalHeight = maxHeight
            textarea.style.overflowY = "auto"
          } else {
            textarea.style.overflowY = "hidden"
          }
        }
      }

      textarea.style.height = `${finalHeight}px`
    }
  }, [])

  React.useLayoutEffect(() => {
    adjustHeight()
    window.addEventListener("resize", adjustHeight)
    return () => window.removeEventListener("resize", adjustHeight)
  }, [value, adjustHeight])

  return (
    <textarea
      ref={textareaRef}
      value={value}
      autoFocus={autoFocus}
      onChange={(e) => {
        onChange(e.target.value)
        adjustHeight()
      }}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      className={cn(
        "w-full resize-none border-none bg-transparent p-1 outline-none focus:ring-0",
        className
      )}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
    />
  )
}
