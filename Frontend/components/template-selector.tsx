"use client"

import { useState } from "react"
import TemplateModal from "./template-modal"

interface Template {
  id: string
  name: string
  color: string
}

interface TemplateSelectorProps {
  templates: Template[]
  selectedTemplate: string
  onSelectTemplate: (id: string) => void
}

export default function TemplateSelector({ templates, selectedTemplate, onSelectTemplate }: TemplateSelectorProps) {
  const [selectedForModal, setSelectedForModal] = useState<string | null>(null)

  const handleConfirmTemplate = (id: string) => {
    onSelectTemplate(id)
    setSelectedForModal(null)
  }

  return (
    <>
      <div className="grid grid-cols-4 gap-4">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => setSelectedForModal(template.id)}
            className="group flex flex-col gap-3 transition"
          >
            <div
              className={`h-28 rounded-lg bg-gradient-to-br ${template.color} border-2 transition shadow-sm ${
                selectedTemplate === template.id
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border hover:border-primary/30"
              }`}
            />
            <p className="text-center text-sm font-medium text-foreground">{template.name}</p>
          </button>
        ))}
      </div>

      {selectedForModal && (
        <TemplateModal
          templates={templates}
          initialTemplateId={selectedForModal}
          onConfirm={handleConfirmTemplate}
          onCancel={() => setSelectedForModal(null)}
        />
      )}
    </>
  )
}
