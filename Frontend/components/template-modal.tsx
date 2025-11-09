"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

interface TemplateModalProps {
  templates: Array<{ id: string; name: string; color: string }>
  initialTemplateId: string
  onConfirm: (id: string) => void
  onCancel: () => void
}

export default function TemplateModal({ templates, initialTemplateId, onConfirm, onCancel }: TemplateModalProps) {
  const initialIndex = templates.findIndex((t) => t.id === initialTemplateId)
  const [currentIndex, setCurrentIndex] = useState(initialIndex >= 0 ? initialIndex : 0)

  const currentTemplate = templates[currentIndex]

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? templates.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === templates.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-lg w-96 max-h-96 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-foreground font-semibold text-lg">{currentTemplate.name}</h2>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-border rounded transition text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Template Preview */}
          <div className={`w-full h-48 rounded-lg bg-gradient-to-br ${currentTemplate.color} mb-4 shadow-sm`} />

          {/* Template Thumbnails */}
          <div className="grid grid-cols-3 gap-3">
            {templates.map((template, idx) => (
              <button
                key={template.id}
                onClick={() => setCurrentIndex(idx)}
                className={`relative rounded-lg overflow-hidden border-2 transition h-20 ${
                  idx === currentIndex
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <div className={`w-full h-full bg-gradient-to-br ${template.color}`} />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition" />
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              className="p-2 hover:bg-border rounded-lg transition text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs text-muted-foreground">
              {currentIndex + 1} / {templates.length}
            </span>
            <button
              onClick={handleNext}
              className="p-2 hover:bg-border rounded-lg transition text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg border border-border hover:bg-sidebar-accent transition text-sm font-medium text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(currentTemplate.id)}
              className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 transition text-sm font-medium text-white"
            >
              this template
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
