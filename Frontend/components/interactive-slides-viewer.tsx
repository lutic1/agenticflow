"use client"

import { useState, useRef, useEffect } from "react"
import { Download, Share2, Play, X, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react"
import { exportToPowerPoint, exportToPDF } from "./export-service"

interface Slide {
  title: string
  content: string
  layout: string
}

interface InteractiveSlidesViewerProps {
  slides: Slide[]
  title: string
  template: string
  onClose?: () => void
}

export default function InteractiveSlidesViewer({ slides, title, template, onClose }: InteractiveSlidesViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleExport = async (
    format: "pptx" | "pdf" | "google-slides" | "google-drive" | "onedrive-personal" | "onedrive-work",
  ) => {
    setIsExporting(true)
    try {
      if (format === "pptx") {
        await exportToPowerPoint(slides, title, template)
      } else if (format === "pdf") {
        await exportToPDF(slides, title)
      }
      setShowExportMenu(false)
    } catch (error) {
      console.error(`Failed to export to ${format}:`, error)
    } finally {
      setIsExporting(false)
    }
  }

  const getSlideColor = () => {
    const templateColors: Record<string, { from: string; to: string }> = {
      glamour: { from: "from-amber-900", to: "to-amber-700" },
      amber: { from: "from-amber-700", to: "to-amber-600" },
      arctic: { from: "from-blue-600", to: "to-blue-500" },
      cerulean: { from: "from-blue-500", to: "to-blue-400" },
      cobalt: { from: "from-blue-700", to: "to-blue-600" },
      emerald: { from: "from-green-700", to: "to-green-600" },
      sketch: { from: "from-gray-800", to: "to-gray-700" },
      mist: { from: "from-gray-600", to: "to-gray-500" },
      basalt: { from: "from-slate-700", to: "to-slate-600" },
      onyx: { from: "from-gray-900", to: "to-gray-800" },
      neon: { from: "from-purple-700", to: "to-purple-600" },
      patina: { from: "from-teal-600", to: "to-teal-500" },
    }
    return templateColors[template] || { from: "from-blue-600", to: "to-blue-500" }
  }

  if (!slides || slides.length === 0) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">No slides to display</p>
        </div>
      </div>
    )
  }

  const slideColor = getSlideColor()
  const currentSlideData = slides[currentSlide]

  return (
    <div ref={containerRef} className="w-full h-screen bg-background flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
            <p className="text-xs text-muted-foreground">Last modified: 2 hours ago</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-secondary rounded-lg transition text-foreground" title="Share">
            <Share2 className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-secondary rounded-lg transition text-foreground" title="Download">
            <Download className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-secondary rounded-lg transition text-foreground" title="Present">
            <Play className="w-5 h-5" />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="p-2 hover:bg-secondary rounded-lg transition text-foreground"
              title="More options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showExportMenu && (
              <div className="absolute top-12 right-0 w-64 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden">
                <div className="flex flex-col">
                  <button
                    onClick={() => handleExport("pptx")}
                    disabled={isExporting}
                    className="px-4 py-3 text-left text-sm text-foreground hover:bg-secondary disabled:opacity-50 transition flex items-center gap-3 border-b border-border"
                  >
                    <div className="w-5 h-5 bg-red-600 rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-white">P</span>
                    </div>
                    <span className="font-medium">PPTX</span>
                  </button>

                  <button
                    onClick={() => handleExport("pdf")}
                    disabled={isExporting}
                    className="px-4 py-3 text-left text-sm text-foreground hover:bg-secondary disabled:opacity-50 transition flex items-center gap-3 border-b border-border"
                  >
                    <div className="w-5 h-5 bg-red-500 rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-white">P</span>
                    </div>
                    <span className="font-medium">PDF</span>
                  </button>

                  <div className="px-4 py-2 bg-secondary">
                    <p className="text-xs text-muted-foreground font-semibold">CONVERT TO:</p>
                  </div>

                  <button
                    onClick={() => handleExport("google-slides")}
                    className="px-4 py-3 text-left text-sm text-foreground hover:bg-secondary transition flex items-center gap-3 border-b border-border"
                  >
                    <div className="w-5 h-5 bg-yellow-500 rounded flex items-center justify-center">
                      <span className="text-xs">🔷</span>
                    </div>
                    <span>Convert to Google Slides</span>
                  </button>

                  <button
                    onClick={() => handleExport("google-drive")}
                    className="px-4 py-3 text-left text-sm text-foreground hover:bg-secondary transition flex items-center gap-3 border-b border-border"
                  >
                    <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center">
                      <span className="text-xs">📁</span>
                    </div>
                    <span>Save to Google Drive</span>
                  </button>

                  <button
                    onClick={() => handleExport("onedrive-personal")}
                    className="px-4 py-3 text-left text-sm text-foreground hover:bg-secondary transition flex items-center gap-3 border-b border-border"
                  >
                    <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                      <span className="text-xs">☁️</span>
                    </div>
                    <span>Save to OneDrive (personal)</span>
                  </button>

                  <button
                    onClick={() => handleExport("onedrive-work")}
                    className="px-4 py-3 text-left text-sm text-foreground hover:bg-secondary transition flex items-center gap-3"
                  >
                    <div className="w-5 h-5 bg-blue-700 rounded flex items-center justify-center">
                      <span className="text-xs">💼</span>
                    </div>
                    <span>Save to OneDrive (work/school)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition text-foreground"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Thumbnails */}
        <div className="w-40 border-r border-border bg-card overflow-y-auto flex flex-col gap-2 p-3">
          {slides.map((slide, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`relative aspect-video rounded border-2 transition overflow-hidden flex-shrink-0 ${
                currentSlide === idx
                  ? `border-blue-500 shadow-lg ${slideColor.from} ${slideColor.to} bg-gradient-to-br`
                  : "border-gray-300 bg-gradient-to-br from-gray-100 to-gray-200"
              }`}
            >
              <div className="w-full h-full flex items-center justify-center p-2">
                <span
                  className={`text-xs font-bold text-center line-clamp-2 ${currentSlide === idx ? "text-white" : "text-gray-600"}`}
                >
                  {slide.title}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Center - Main Slide Display */}
        <div className="flex-1 flex items-center justify-center p-8 bg-gray-100">
          <div
            className={`w-full h-full max-w-4xl aspect-video rounded-lg shadow-2xl bg-gradient-to-br ${slideColor.from} ${slideColor.to} p-12 flex flex-col justify-between text-white overflow-hidden relative`}
          >
            <div className="flex-1 flex flex-col justify-center">
              <h2 className="text-5xl font-bold mb-6 break-words">{currentSlideData?.title}</h2>
              <div className="text-xl leading-relaxed opacity-90 whitespace-pre-wrap break-words">
                {currentSlideData?.content}
              </div>
            </div>

            {/* Slide Footer */}
            <div className="flex items-center justify-between pt-6 border-t border-white/20">
              <span className="text-sm opacity-75">
                Slide {currentSlide + 1} of {slides.length}
              </span>
              <span className="text-sm opacity-75">AI Slides Generator</span>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Empty for now */}
        <div className="w-0" />
      </div>

      <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-card gap-4">
        <button
          onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
          disabled={currentSlide === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <span className="text-sm text-muted-foreground">
          Slide {currentSlide + 1} of {slides.length}
        </span>

        <button
          onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
          disabled={currentSlide === slides.length - 1}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
