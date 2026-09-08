"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, X, MessageCircle, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import {
  MessageResponse,
  parseMarkdown,
} from "@/components/ai-elements/message"
import { AutoResizeTextarea } from "@/components/project/auto-resize-textarea"

export interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
}

interface ProjectChatDrawerProps {
  isOpen: boolean
  onToggleOpen: () => void
  messages: ChatMessage[]
  isLoading: boolean
  status: string | null
  currentMessage: string
  setCurrentMessage: (val: string) => void
  onSendMessage: () => void
}

export function ProjectChatDrawer({
  isOpen,
  onToggleOpen,
  messages,
  isLoading,
  status,
  currentMessage,
  setCurrentMessage,
  onSendMessage,
}: ProjectChatDrawerProps) {
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-card fixed right-4 bottom-24 z-[200] flex h-[500px] w-[calc(100vw-32px)] flex-col overflow-hidden rounded-3xl border shadow-2xl sm:right-8 sm:w-[380px]"
          >
            {/* Drawer Header */}
            <div className="bg-muted/5 flex shrink-0 items-center justify-between border-b p-5">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-xl">
                  <Sparkles className="text-primary size-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-foreground text-sm font-semibold">
                    Project assistant
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleOpen}
                className="size-8 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages Scroll Area */}
            <ScrollArea className="min-h-0 flex-1 p-6">
              <div className="space-y-6">
                {messages.length === 0 && (
                  <div className="bg-muted/5 flex flex-col items-center justify-center gap-5 rounded-3xl border border-dashed py-16 text-center">
                    <div className="bg-muted/20 flex h-12 w-12 items-center justify-center rounded-full">
                      <MessageCircle className="text-muted-foreground/40 size-6" />
                    </div>
                    <div className="space-y-2 px-6">
                      <p className="text-xs font-bold opacity-80">
                        Hello! I&apos;m your AI Project Architect.
                      </p>
                      <p className="text-muted-foreground text-[10px] leading-relaxed">
                        I can help you restructure the project, add/delete
                        sections, or refine your entire narrative.
                      </p>
                    </div>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex flex-col gap-2",
                      msg.role === "user" ? "items-end" : "items-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-5 py-3.5 text-[13px] leading-relaxed",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground font-medium shadow-md"
                          : "bg-muted/30 border shadow-sm"
                      )}
                    >
                      {msg.role === "user" ? (
                        msg.content
                      ) : (
                        <MessageResponse>
                          {parseMarkdown(msg.content)}
                        </MessageResponse>
                      )}
                    </div>
                  </div>
                ))}

                {status && (
                  <div className="flex items-center gap-3 px-2 py-1">
                    <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                    <span className="text-xs text-slate-400">{status}</span>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Message Input Footer */}
            <div className="shrink-0 border-t p-5">
              <div className="relative flex items-end gap-3">
                <AutoResizeTextarea
                  className="bg-muted/30 focus:border-primary/20 max-h-32 min-h-[48px] w-full rounded-2xl border px-5 py-3 text-[13px] leading-relaxed transition-all"
                  placeholder="Architectural feedback..."
                  value={currentMessage}
                  onChange={setCurrentMessage}
                  onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      onSendMessage()
                    }
                  }}
                  disabled={isLoading}
                />
                <Button
                  size="icon"
                  className="size-11 shrink-0 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
                  onClick={onSendMessage}
                  disabled={!currentMessage.trim() || isLoading}
                >
                  <Send className="size-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat Toggle Button */}
      <Button
        size="icon"
        onClick={onToggleOpen}
        className={cn(
          "fixed right-8 bottom-8 z-[200] size-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-90",
          isOpen
            ? "bg-muted hover:bg-muted text-foreground"
            : "bg-primary shadow-primary/20"
        )}
      >
        {isOpen ? (
          <X className="size-6" />
        ) : (
          <MessageCircle className="size-6" />
        )}
      </Button>
    </>
  )
}
