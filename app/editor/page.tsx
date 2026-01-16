"use client"

import * as React from "react"
import { EditorView } from "@/components/editor/editor-view"

export default function EditorPage() {
  const [initialData, setInitialData] = React.useState<any>(null)

  React.useEffect(() => {
    const importedData = localStorage.getItem('importedStoryboard')
    if (importedData) {
      try {
        setInitialData(JSON.parse(importedData))
        localStorage.removeItem('importedStoryboard')
      } catch (e) {
        console.error("Failed to parse imported data", e)
      }
    }
  }, [])

  return <EditorView initialData={initialData} />
}
