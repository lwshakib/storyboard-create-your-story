import { useState, useCallback } from "react"
import { toast } from "sonner"

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

interface Project {
  id: string
  title: string
  description: string | null
  slides: Array<{
    id: string
    title: string
    description: string
    prompt: string
    index: number
    html: string
  }>
}

interface UseChatOptions {
  projectId: string
  onProjectUpdate?: (project: Project) => void
}

/**
 * useChat: A custom hook to manage the AI Architect conversation.
 * Handles streaming, tool call status tracking, and project state synchronization.
 */
export function useChat({ projectId, onProjectUpdate }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  const sendMessage = useCallback(
    async (text: string, projectData: Record<string, unknown>) => {
      if (!text.trim() || isLoading) return

      const userMsg = text.trim()
      setMessages((prev) => [...prev, { role: "user", content: userMsg }])
      setIsLoading(true)
      setStatus("Thinking...")

      try {
        const res = await fetch("/api/generate/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId,
            message: userMsg,
            history: messages,
            projectData,
          }),
        })

        if (res.status === 403) {
          const data = await res.json()
          if (data.error === "INSUFFICIENT_CREDITS") {
            toast.error("Insufficient Credits", {
              description:
                "You need at least 1 credit to chat with the Project Assistant.",
            })
            return
          }
        }

        if (!res.ok) throw new Error("Chat connection failed")

        const reader = res.body?.getReader()
        if (!reader) throw new Error("No readable stream found")

        const decoder = new TextDecoder()
        let assistantMsg = ""
        let buffer = ""

        // Do not insert an empty assistant placeholder upfront to prevent empty blank cards

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          // Keep the incomplete line chunk in the buffer
          buffer = lines.pop() || ""

          for (const rawLine of lines) {
            const line = rawLine.trim()
            if (!line || line.startsWith(":")) continue // Ignore empty lines and SSE comments

            let dataStr = line
            if (line.startsWith("data: ")) {
              dataStr = line.slice(6).trim()
            } else if (line.startsWith("data:")) {
              dataStr = line.slice(5).trim()
            }

            // Check for SSE completion sentinel
            if (dataStr === "[DONE]") {
              setStatus(null)
              break
            }

            try {
              const event = JSON.parse(dataStr)

              if (event.type === "text") {
                setStatus(null)
                if (event.isThought) {
                  setStatus("Reasoning...")
                } else {
                  assistantMsg += event.content
                  setMessages((prev) => {
                    const next = [...prev]
                    const last = next[next.length - 1]
                    if (last && last.role === "assistant") {
                      last.content = assistantMsg
                    } else {
                      next.push({ role: "assistant", content: assistantMsg })
                    }
                    return next
                  })
                }
              } else if (event.type === "tool_call") {
                const name = event.name
                if (name === "update_slide") {
                  setStatus("Updating slide...")
                } else if (name === "batch_update_slides") {
                  setStatus("Updating multiple slides...")
                } else if (name === "add_slide") {
                  setStatus("Adding slide...")
                } else if (name === "delete_slide") {
                  setStatus("Deleting slide...")
                } else if (name === "update_project_metadata") {
                  setStatus("Updating project metadata...")
                } else if (name === "get_project_details") {
                  setStatus("Reading project details...")
                } else {
                  setStatus(`Executing: ${name.replace(/_/g, " ")}...`)
                }
              } else if (event.type === "project_update") {
                if (onProjectUpdate) onProjectUpdate(event.project)
              } else if (event.type === "error") {
                toast.error(event.message)
              }
            } catch (e) {
              console.error("Stream parsing error:", e)
            }
          }
        }
      } catch (error) {
        console.error("Chat error:", error)
        toast.error("Failed to reach Project Assistant")
      } finally {
        setIsLoading(false)
        setStatus(null)
      }
    },
    [messages, isLoading, projectId, onProjectUpdate]
  )

  return {
    messages,
    isLoading,
    status,
    sendMessage,
    setMessages,
  }
}
