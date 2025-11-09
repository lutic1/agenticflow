"use client"

import { useState, useEffect } from "react"
import { ChevronLeft } from "lucide-react"
import ReasoningDisplay from "./reasoning-display"
import SlidePlanPreview from "./slide-plan-preview"
import HTMLSlidesRenderer from "./html-slides-renderer"
import InteractiveSlidesViewer from "./interactive-slides-viewer"

interface SlidesGeneratorProps {
  presentation: any
  template: string
  onBack: () => void
}

type Stage = "reasoning" | "plan" | "rendering" | "viewing"

export default function SlidesGenerator({ presentation, template, onBack }: SlidesGeneratorProps) {
  const [stage, setStage] = useState<Stage>("reasoning")
  const [renderedSlides, setRenderedSlides] = useState<any[] | null>(null)

  useEffect(() => {
    const timers = [setTimeout(() => setStage("plan"), 3000), setTimeout(() => setStage("rendering"), 6000)]
    return () => timers.forEach((t) => clearTimeout(t))
  }, [])

  const handleRenderingComplete = (slides: any[]) => {
    console.log("[v0] Rendering complete, transitioning to viewing stage with slides:", slides)
    setRenderedSlides(slides)
    setStage("viewing")
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition font-medium text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </button>
          <h1 className="text-lg font-semibold text-foreground">{presentation.title}</h1>
          <div className="w-16" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-8 py-12">
        {stage === "reasoning" && <ReasoningDisplay reasoning={presentation.reasoning} />}

        {stage === "plan" && <SlidePlanPreview plan={presentation.slidePlan} />}

        {stage === "rendering" && (
          <HTMLSlidesRenderer slides={presentation.slides} template={template} onComplete={handleRenderingComplete} />
        )}

        {stage === "viewing" && (
          <InteractiveSlidesViewer
            slides={presentation.slides}
            title={presentation.title}
            template={template}
            onClose={onBack}
          />
        )}
      </div>
    </main>
  )
}
