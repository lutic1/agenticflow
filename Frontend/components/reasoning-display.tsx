"use client"

interface ReasoningDisplayProps {
  reasoning: string
}

export default function ReasoningDisplay({ reasoning }: ReasoningDisplayProps) {
  const lines = reasoning.split("\n").filter(Boolean)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <h2 className="text-lg font-semibold text-foreground">AI Reasoning Process</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Understanding your requirements and planning the presentation structure...
        </p>
      </div>

      {/* Reasoning Content */}
      <div className="space-y-3">
        {lines.map((line, idx) => (
          <div
            key={idx}
            className="flex gap-4 animate-in fade-in slide-in-from-left duration-500"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <span className="text-xs font-semibold text-primary">{idx + 1}</span>
            </div>
            <div className="flex-1 pt-2">
              <p className="text-foreground text-sm leading-relaxed">{line}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2 pt-6">
        <div className="h-1 w-8 bg-primary rounded-full" />
        <span className="text-xs text-muted-foreground">Next: Slide Plan</span>
      </div>
    </div>
  )
}
