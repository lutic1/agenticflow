"use client"

import { useEffect, useState } from "react"

interface Slide {
  title: string
  content: string
  layout: string
}

interface HTMLSlidesRendererProps {
  slides: Slide[]
  template: string
  onComplete: (slides: Slide[]) => void
}

export default function HTMLSlidesRenderer({ slides, template, onComplete }: HTMLSlidesRendererProps) {
  const [renderedCount, setRenderedCount] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setRenderedCount((prev) => {
        const next = prev + 1
        if (next >= slides.length) {
          clearInterval(interval)
          onComplete(slides)
          return prev
        }
        return next
      })
    }, 600)

    return () => clearInterval(interval)
  }, [slides, onComplete])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <h2 className="text-lg font-semibold text-gray-900">Rendering Slides</h2>
        </div>
        <p className="text-sm text-gray-600">Creating and formatting {slides.length} slides...</p>
      </div>

      {/* Rendered Slides Grid */}
      <div className="grid grid-cols-2 gap-4">
        {slides.slice(0, renderedCount + 1).map((slide, idx) => (
          <div
            key={idx}
            className="p-4 rounded-lg border-2 border-green-200 bg-green-50 animate-in fade-in scale-in duration-500"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm">{slide.title}</h3>
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">Rendered successfully</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center gap-2 pt-6">
        <div className="h-1 w-24 bg-green-500 rounded-full" />
        <span className="text-xs text-gray-500">Next: Interactive Viewer</span>
      </div>
    </div>
  )
}
