"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"

interface DragItem {
  id: string
  type: string
  content?: any
}

interface DragDropContextType {
  draggedItem: DragItem | null
  isDragging: boolean
  startDrag: (item: DragItem) => void
  endDrag: () => void
  dropItem: (targetId: string, position?: "before" | "after") => void
}

const DragDropContext = createContext<DragDropContextType | null>(null)

export function DragDropProvider({ children }: { children: React.ReactNode }) {
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const startDrag = useCallback((item: DragItem) => {
    setDraggedItem(item)
    setIsDragging(true)
  }, [])

  const endDrag = useCallback(() => {
    setDraggedItem(null)
    setIsDragging(false)
  }, [])

  const dropItem = useCallback(
    (targetId: string, position: "before" | "after" = "after") => {
      // This will be handled by the parent component
      console.log("Drop item", draggedItem, "at", targetId, position)
    },
    [draggedItem],
  )

  return (
    <DragDropContext.Provider
      value={{
        draggedItem,
        isDragging,
        startDrag,
        endDrag,
        dropItem,
      }}
    >
      {children}
    </DragDropContext.Provider>
  )
}

export function useDragDrop() {
  const context = useContext(DragDropContext)
  if (!context) {
    throw new Error("useDragDrop must be used within a DragDropProvider")
  }
  return context
}
