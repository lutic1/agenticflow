"use client"

interface Slide {
  title: string
  description: string
}

interface SlidePlanPreviewProps {
  plan: Slide[]
}

export default function SlidePlanPreview({ plan }: SlidePlanPreviewProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <h2 className="text-lg font-semibold text-gray-900">Slide Plan Overview</h2>
        </div>
        <p className="text-sm text-gray-600">
          Your presentation will include {plan.length} slides with the following structure:
        </p>
      </div>

      {/* Slides List */}
      <div className="space-y-2">
        {plan.map((slide, idx) => (
          <div
            key={idx}
            className="flex gap-4 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition bg-gray-50 hover:bg-gray-100 animate-in fade-in slide-in-from-left duration-500"
            style={{ animationDelay: `${idx * 150}ms` }}
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">{idx + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm">{slide.title}</h3>
              <p className="text-gray-600 text-sm mt-1 line-clamp-2">{slide.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center gap-2 pt-6">
        <div className="h-1 w-16 bg-amber-500 rounded-full" />
        <span className="text-xs text-gray-500">Next: Rendering Slides</span>
      </div>
    </div>
  )
}
