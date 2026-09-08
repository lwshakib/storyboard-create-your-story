import { ai, Content, Tool } from "./client"
import { CHAT_MODEL } from "./constants"
import prisma from "@/lib/prisma"
import { deductCredits } from "@/lib/credits"

export type StreamEvent =
  | { type: "text"; content: string; isThought?: boolean }
  | { type: "tool_call"; name: string; args: Record<string, unknown> }
  | { type: "project_update"; project: Record<string, unknown> }
  | { type: "error"; message: string }
  | { type: "done" }

export interface StreamTextOptions {
  contents: Content[]
  projectId: string
  userId: string
  systemInstruction?: string
  tools?: Tool[]
}

interface ProjectSlide {
  id: string
  title: string
  description: string
  prompt: string
  index: number
  html?: string
}

interface UpdateProjectMetadataArgs {
  title?: string
  description?: string
}

interface UpdateSlideArgs {
  slideId: string
  updates: Partial<ProjectSlide>
}

interface BatchUpdateSlidesArgs {
  slides: Array<{
    slideId: string
    updates: Partial<ProjectSlide>
  }>
}

interface DeleteSlideArgs {
  slideId: string
}

interface AddSlideArgs {
  index: number
  slide: Omit<ProjectSlide, "id" | "index">
}

const cleanHtml = (html?: string) => {
  if (!html) return html
  let clean = html
  // Strip code fences if wrapped in ```html ... ```
  clean = clean.replace(/^```(?:html)?\s*/i, "").replace(/\s*```$/i, "")
  // Unescape backslash-escaped quotes from LLM JSON strings (e.g. \" -> " and \' -> ')
  clean = clean.replace(/\\"/g, '"').replace(/\\'/g, "'")
  // Convert markdown bold and italic
  clean = clean
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
  return clean
}

/**
 * Creates a ReadableStream that encodes StreamEvents as SSE event frames (data: <payload>\n\n)
 * for real-time live streaming with zero buffering.
 */
export function createAIStream(
  execute: (send: (event: StreamEvent) => void) => Promise<void>
) {
  const encoder = new TextEncoder()

  return new ReadableStream({
    start(controller) {
      const send = (event: StreamEvent) => {
        try {
          const chunk = encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
          controller.enqueue(chunk)
        } catch (err) {
          console.error("Stream enqueue error:", err)
        }
      }

      execute(send)
        .then(() => {
          send({ type: "done" })
          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
        })
        .catch((error) => {
          console.error("Stream execution error:", error)
          send({ type: "error", message: String(error) })
          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
        })
        .finally(() => {
          controller.close()
        })
    },
  })
}

/**
 * Perform tool-calling loop execution and stream generated parts back to client.
 */
export function streamText(options: StreamTextOptions) {
  const { contents, projectId, userId, systemInstruction, tools } = options

  const lastMessage = contents[contents.length - 1]
  const input = lastMessage?.parts?.[0]?.text || ""
  const history = contents.slice(0, -1)

  const chat = ai.chats.create({
    model: CHAT_MODEL,
    history: history as Content[],
    config: {
      systemInstruction,
      tools,
    },
  })

  return createAIStream(async (send) => {
    let callExecutionCount = 0
    const MAX_CALLS = 5
    let hasChanges = false
    let currentInput: Parameters<typeof chat.sendMessageStream>[0] = {
      message: input,
    }

    while (callExecutionCount < MAX_CALLS) {
      const responseStream = await chat.sendMessageStream(currentInput)

      const functionCalls: NonNullable<
        Awaited<ReturnType<typeof chat.sendMessage>>["functionCalls"]
      > = []
      let lastResponse: Awaited<ReturnType<typeof chat.sendMessage>> | null =
        null

      for await (const chunk of responseStream) {
        lastResponse = chunk
        if (chunk.functionCalls && chunk.functionCalls.length > 0) {
          functionCalls.push(...chunk.functionCalls)
        }

        const candidate = chunk.candidates?.[0]
        let sentText = false
        if (candidate && candidate.content) {
          const parts = candidate.content.parts || []
          for (const part of parts) {
            if ((part as { thought?: unknown }).thought) {
              send({
                type: "text",
                content: part.text || "",
                isThought: true,
              })
              sentText = true
            } else if (part.text) {
              send({ type: "text", content: part.text })
              sentText = true
            }
          }
        }
        if (!sentText && chunk.text) {
          send({ type: "text", content: chunk.text })
        }
      }

      if (!lastResponse) {
        throw new Error("AI Architect failed to generate a valid response.")
      }

      if (functionCalls.length > 0) {
        const toolResults = []
        const actionSummaries: string[] = []

        for (const call of functionCalls) {
          const { name, args, id } = call
          if (!name) continue

          // Notify client about tool call
          send({
            type: "tool_call",
            name,
            args: (args as Record<string, unknown>) || {},
          })

          let toolOutput: Record<string, unknown> = {
            success: true,
          }

          try {
            if (name === "update_project_metadata") {
              const { title, description } =
                args as unknown as UpdateProjectMetadataArgs
              await prisma.project.update({
                where: { id: projectId },
                data: { title, description },
              })
              hasChanges = true
              actionSummaries.push(title ? `Updated project title to "${title}"` : "Updated project metadata")
            } else if (name === "get_project_details") {
              const proj = await prisma.project.findUnique({
                where: { id: projectId },
                include: { slides: { orderBy: { index: "asc" } } },
              })
              if (proj) {
                toolOutput = {
                  success: true,
                  title: proj.title,
                  description: proj.description,
                  slides: proj.slides.map((s) => ({
                    id: s.id,
                    index: s.index,
                    title: s.title,
                    description: s.description,
                    prompt: s.prompt,
                    html: s.html || "",
                  })),
                }
                actionSummaries.push("Inspected project slides and outline")
              } else {
                toolOutput = { success: false, error: "Project not found" }
              }
            } else if (name === "update_slide") {
              const { slideId, updates } = args as unknown as UpdateSlideArgs
              const safeUpdates = { ...updates }
              if (safeUpdates.html) {
                safeUpdates.html = cleanHtml(safeUpdates.html)
              }
              const updated = await prisma.slide.update({
                where: { id: slideId },
                data: safeUpdates,
              })
              hasChanges = true
              actionSummaries.push(`Updated Slide ${updated.index + 1}${updated.title ? ` ("${updated.title}")` : ""}`)
            } else if (name === "batch_update_slides") {
              const { slides } = args as unknown as BatchUpdateSlidesArgs
              if (Array.isArray(slides) && slides.length > 0) {
                for (const item of slides) {
                  if (!item.slideId || !item.updates) continue
                  const safeUpdates = { ...item.updates }
                  if (safeUpdates.html) {
                    safeUpdates.html = cleanHtml(safeUpdates.html)
                  }
                  const updated = await prisma.slide.update({
                    where: { id: item.slideId },
                    data: safeUpdates,
                  })
                  hasChanges = true
                  actionSummaries.push(`Updated Slide ${updated.index + 1}${updated.title ? ` ("${updated.title}")` : ""}`)
                }
              }
            } else if (name === "delete_slide") {
              const { slideId } = args as unknown as DeleteSlideArgs
              const deletedSlide = await prisma.slide.delete({
                where: { id: slideId },
              })

              // Shift remaining slides down
              await prisma.slide.updateMany({
                where: {
                  projectId,
                  index: { gt: deletedSlide.index },
                },
                data: {
                  index: { decrement: 1 },
                },
              })
              hasChanges = true
              actionSummaries.push(`Removed Slide ${deletedSlide.index + 1}`)
            } else if (name === "add_slide") {
              const { index, slide } = args as unknown as AddSlideArgs
              const safeSlide = {
                ...slide,
                html: cleanHtml(slide.html) || "",
              }

              // Shift existing slides up
              await prisma.slide.updateMany({
                where: {
                  projectId,
                  index: { gte: index },
                },
                data: {
                  index: { increment: 1 },
                },
              })

              const created = await prisma.slide.create({
                data: {
                  ...safeSlide,
                  projectId,
                  index,
                },
              })
              hasChanges = true
              actionSummaries.push(`Added new slide at position ${created.index + 1}`)
            }
          } catch (err) {
            console.error(`Tool execution error [${name}]:`, err)
            toolOutput = { success: false, error: String(err) }
          }

          toolResults.push({
            functionResponse: {
              name,
              response: { result: toolOutput },
              id,
            },
          })
        }

        if (hasChanges) {
          // Send real-time project sync to client as soon as DB updates complete
          const updatedProject = await prisma.project.findUnique({
            where: { id: projectId },
            include: { slides: { orderBy: { index: "asc" } } },
          })
          if (updatedProject) {
            send({
              type: "project_update",
              project: updatedProject as unknown as Record<string, unknown>,
            })
          }

          // Provide a guaranteed text response explaining the changes
          const modificationSummaries = actionSummaries.filter(
            (s) => !s.startsWith("Inspected")
          )
          const summaryText =
            modificationSummaries.length > 0
              ? `I've updated your presentation:\n\n` +
                modificationSummaries.map((s) => `• ${s}`).join("\n")
              : "I've processed your architectural feedback."

          send({
            type: "text",
            content: summaryText,
          })

          // Deduct 1 credit for successful interaction
          await deductCredits(userId, 1).catch(() => {})
          break
        } else {
          // Only read tools were executed (e.g. get_project_details)
          // Continue loop to give the model the project state so it can execute actual changes!
          currentInput = {
            message: toolResults.map((tr) => ({
              functionResponse: tr.functionResponse,
            })),
          }
          callExecutionCount++
        }
      } else {
        // Direct text response without tools
        if (hasChanges) {
          const updatedProject = await prisma.project.findUnique({
            where: { id: projectId },
            include: { slides: { orderBy: { index: "asc" } } },
          })
          if (updatedProject) {
            send({
              type: "project_update",
              project: updatedProject as unknown as Record<string, unknown>,
            })
          }
        }

        // Deduct credits for the interaction (1 credit)
        await deductCredits(userId, 1).catch(() => {})
        break
      }
    }
  })
}
