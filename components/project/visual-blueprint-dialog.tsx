"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AutoResizeTextarea } from "@/components/project/auto-resize-textarea"

interface VisualBlueprintDialogProps {
  isOpen: boolean
  onClose: () => void
  prompt: string
  onSavePrompt: (prompt: string) => void
}

export function VisualBlueprintDialog({
  isOpen,
  onClose,
  prompt,
  onSavePrompt,
}: VisualBlueprintDialogProps) {
  const [localPrompt, setLocalPrompt] = React.useState(prompt)
  const [prevPrompt, setPrevPrompt] = React.useState(prompt)

  if (prompt !== prevPrompt) {
    setPrevPrompt(prompt)
    setLocalPrompt(prompt)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-background overflow-hidden rounded-xl border-none p-0 shadow-2xl sm:max-w-[500px]">
        <div className="flex flex-col">
          <div className="border-b p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold tracking-tight">
                Visual Blueprint
              </DialogTitle>
              <DialogDescription className="text-xs font-medium opacity-60">
                Configure the architecture and design language for this slide.
              </DialogDescription>
            </DialogHeader>
          </div>

          <ScrollArea className="max-h-[400px] p-6">
            <div className="space-y-4">
              <AutoResizeTextarea
                className="text-foreground bg-muted/20 focus:border-primary/20 min-h-[160px] w-full rounded-lg border p-4 text-sm leading-relaxed transition-all"
                value={localPrompt}
                onChange={setLocalPrompt}
                placeholder="Describe the layout, colors, typography, and visual assets for this slide..."
              />
            </div>
          </ScrollArea>

          <div className="flex justify-end gap-2 border-t p-4">
            <Button
              variant="ghost"
              onClick={onClose}
              className="h-10 px-5 text-xs font-medium"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                onSavePrompt(localPrompt)
                onClose()
              }}
              className="h-10 rounded-lg px-8 text-[11px] font-bold tracking-widest uppercase transition-all"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
