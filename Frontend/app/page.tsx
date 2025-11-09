"use client"

import { useState } from "react"
import { Plus, Search, BookOpen } from "lucide-react"
import TemplateSelector from "@/components/template-selector"
import SlidesGenerator from "@/components/slides-generator"

const SAMPLE_PROMPTS = [
  "Design a pitch deck for a startup seeking funding",
  "Prepare a training module on cybersecurity best practices",
  "Create a presentation on the impact of AI on the future of work",
  "Create a sales presentation for a B2B software solution",
]

const SLIDE_TEMPLATES = [
  { id: "glamour", name: "Glamour", color: "from-amber-900 to-amber-700" },
  { id: "amber", name: "Amber", color: "from-orange-200 to-orange-100" },
  { id: "arctic", name: "Arctic", color: "from-slate-400 to-slate-300" },
  { id: "cerulean", name: "Cerulean", color: "from-blue-300 to-blue-200" },
  { id: "cobalt", color: "from-gray-300 to-gray-200", name: "Cobalt" },
  { id: "emerald", name: "Emerald", color: "from-green-700 to-green-600" },
  { id: "sketch", name: "Sketch", color: "from-slate-900 to-slate-800" },
  { id: "basalt", name: "Basalt", color: "from-gray-800 to-gray-700" },
  { id: "mist", name: "Mist", color: "from-stone-400 to-stone-300" },
  { id: "onyx", name: "Onyx", color: "from-gray-900 to-gray-800" },
  { id: "neon", name: "Neon", color: "from-purple-600 to-purple-500" },
]

const generateMockPresentation = (prompt: string, template: string) => {
  return {
    title: prompt,
    template,
    reasoning: `Analyzing presentation requirements for: "${prompt}"\n\nIdentifying key themes and structure based on audience and content type\n\nDetermining optimal slide count and layout patterns for maximum engagement\n\nSelecting visual hierarchy and color scheme aligned with template: ${template}\n\nPlanning transitions and timing for smooth presentation flow\n\nOptimizing content hierarchy for clarity and retention`,
    slidePlan: [
      {
        title: "Title Slide",
        description: "Professional introduction with main topic and subtitle aligned with theme",
      },
      {
        title: "Agenda",
        description: "Overview of key topics and presentation structure for audience orientation",
      },
      {
        title: "Problem Statement",
        description: "Define the core challenge and context that motivates the presentation",
      },
      {
        title: "Key Insights",
        description: "Present critical data points, findings, or observations with supporting details",
      },
      {
        title: "Solution Overview",
        description: "Introduce the proposed solution or main idea with visual representation",
      },
      {
        title: "Implementation Timeline",
        description: "Outline phases, milestones, and expected outcomes with clear timelines",
      },
      {
        title: "Next Steps",
        description: "Clear call to action and recommended follow-up actions for the audience",
      },
      {
        title: "Questions & Discussion",
        description: "Interactive closing slide for audience questions and discussion",
      },
    ],
    slides: [
      {
        title: prompt,
        content: "Creating Strategic Impact",
        layout: "title",
        html: `
          <div class="flex flex-col justify-center items-center h-full text-white">
            <h1 class="text-6xl font-bold text-center mb-6">${prompt}</h1>
            <p class="text-2xl opacity-90">Creating Strategic Impact</p>
          </div>
        `,
      },
      {
        title: "Agenda",
        content: "Overview of key topics",
        layout: "content",
        html: `
          <div class="flex flex-col justify-center h-full text-white">
            <h1 class="text-5xl font-bold mb-12">Agenda</h1>
            <ul class="text-2xl space-y-6">
              <li class="flex items-start">
                <span class="mr-6">•</span>
                <span>Strategic Overview & Context</span>
              </li>
              <li class="flex items-start">
                <span class="mr-6">•</span>
                <span>Key Insights & Analysis</span>
              </li>
              <li class="flex items-start">
                <span class="mr-6">•</span>
                <span>Solution Framework</span>
              </li>
              <li class="flex items-start">
                <span class="mr-6">•</span>
                <span>Implementation Plan</span>
              </li>
              <li class="flex items-start">
                <span class="mr-6">•</span>
                <span>Next Steps & Action Items</span>
              </li>
            </ul>
          </div>
        `,
      },
      {
        title: "Problem Statement",
        content: "Understanding the current landscape and challenges",
        layout: "content",
        html: `
          <div class="flex flex-col justify-center h-full text-white">
            <h1 class="text-5xl font-bold mb-12">Problem Statement</h1>
            <div class="text-xl leading-relaxed space-y-6 max-w-3xl">
              <p>Understanding the current landscape and challenges we need to address to drive meaningful change and sustainable growth.</p>
              <p>Identifying key pain points, market gaps, and opportunities that inform our strategic direction.</p>
              <p>Establishing a clear baseline for measuring progress and success throughout implementation.</p>
            </div>
          </div>
        `,
      },
      {
        title: "Key Insights",
        content: "Critical findings and data points",
        layout: "content",
        html: `
          <div class="flex flex-col justify-center h-full text-white">
            <h1 class="text-5xl font-bold mb-12">Key Insights</h1>
            <div class="grid grid-cols-2 gap-8 text-lg">
              <div class="bg-white/10 backdrop-blur p-6 rounded-lg">
                <h3 class="text-2xl font-bold mb-3">Finding 1</h3>
                <p class="opacity-90">Critical insights from comprehensive analysis and market research.</p>
              </div>
              <div class="bg-white/10 backdrop-blur p-6 rounded-lg">
                <h3 class="text-2xl font-bold mb-3">Finding 2</h3>
                <p class="opacity-90">Data-driven observations that support strategic recommendations.</p>
              </div>
              <div class="bg-white/10 backdrop-blur p-6 rounded-lg">
                <h3 class="text-2xl font-bold mb-3">Finding 3</h3>
                <p class="opacity-90">Key performance indicators and success metrics identified.</p>
              </div>
              <div class="bg-white/10 backdrop-blur p-6 rounded-lg">
                <h3 class="text-2xl font-bold mb-3">Finding 4</h3>
                <p class="opacity-90">Risk assessment and mitigation strategies outlined.</p>
              </div>
            </div>
          </div>
        `,
      },
      {
        title: "Solution Overview",
        content: "Proposed approach and framework",
        layout: "content",
        html: `
          <div class="flex flex-col justify-center h-full text-white">
            <h1 class="text-5xl font-bold mb-12">Solution Overview</h1>
            <div class="text-xl leading-relaxed space-y-8 max-w-3xl">
              <p>A comprehensive approach designed to address the identified challenges and create lasting impact.</p>
              <div class="bg-white/10 backdrop-blur p-8 rounded-lg">
                <h3 class="text-2xl font-bold mb-4">Core Components</h3>
                <ul class="space-y-3 text-lg">
                  <li class="flex items-start"><span class="mr-4">✓</span> <span>Strategic Foundation</span></li>
                  <li class="flex items-start"><span class="mr-4">✓</span> <span>Operational Excellence</span></li>
                  <li class="flex items-start"><span class="mr-4">✓</span> <span>Continuous Improvement</span></li>
                </ul>
              </div>
            </div>
          </div>
        `,
      },
      {
        title: "Implementation Timeline",
        content: "Phased approach to execution",
        layout: "content",
        html: `
          <div class="flex flex-col justify-center h-full text-white">
            <h1 class="text-5xl font-bold mb-12">Implementation Timeline</h1>
            <div class="space-y-6 text-lg max-w-3xl">
              <div class="flex items-start gap-6">
                <div class="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 font-bold text-xl">Q1</div>
                <div>
                  <h3 class="text-2xl font-bold mb-2">Foundation & Setup</h3>
                  <p class="opacity-90">Establish infrastructure, secure resources, and align stakeholders</p>
                </div>
              </div>
              <div class="flex items-start gap-6">
                <div class="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 font-bold text-xl">Q2</div>
                <div>
                  <h3 class="text-2xl font-bold mb-2">Development & Testing</h3>
                  <p class="opacity-90">Build core capabilities and conduct thorough testing phases</p>
                </div>
              </div>
              <div class="flex items-start gap-6">
                <div class="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 font-bold text-xl">Q3</div>
                <div>
                  <h3 class="text-2xl font-bold mb-2">Launch & Deployment</h3>
                  <p class="opacity-90">Execute full rollout with training and change management</p>
                </div>
              </div>
            </div>
          </div>
        `,
      },
      {
        title: "Next Steps",
        content: "Clear path forward",
        layout: "content",
        html: `
          <div class="flex flex-col justify-center h-full text-white">
            <h1 class="text-5xl font-bold mb-12">Next Steps</h1>
            <div class="text-xl leading-relaxed space-y-8 max-w-3xl">
              <p class="text-2xl font-semibold">Ready to move forward?</p>
              <div class="bg-white/10 backdrop-blur p-8 rounded-lg space-y-4">
                <p>✓ Finalize resource allocation and budget approval</p>
                <p>✓ Establish project governance and oversight structure</p>
                <p>✓ Schedule kickoff meeting with core team members</p>
                <p>✓ Begin stakeholder communication campaign</p>
              </div>
              <p class="text-lg opacity-90">Let's discuss timeline, resources, and get started on this journey together.</p>
            </div>
          </div>
        `,
      },
      {
        title: "Questions & Discussion",
        content: "Open floor for feedback",
        layout: "title",
        html: `
          <div class="flex flex-col justify-center items-center h-full text-white">
            <h1 class="text-6xl font-bold mb-6">Thank You</h1>
            <p class="text-3xl opacity-90">Questions & Discussion</p>
          </div>
        `,
      },
    ],
  }
}

export default function Home() {
  const [prompt, setPrompt] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("basalt")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPresentation, setGeneratedPresentation] = useState<any>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setGeneratedPresentation(null)

    setTimeout(() => {
      const mockPresentation = generateMockPresentation(prompt, selectedTemplate)
      setGeneratedPresentation(mockPresentation)
      setIsGenerating(false)
    }, 500)
  }

  if (generatedPresentation) {
    return (
      <SlidesGenerator
        presentation={generatedPresentation}
        template={selectedTemplate}
        onBack={() => {
          setGeneratedPresentation(null)
          setPrompt("")
        }}
      />
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* LEFT SIDEBAR */}
      <div className="w-56 bg-sidebar border-r border-sidebar-border flex flex-col overflow-hidden">
        {/* Logo - Changed from 'manus' to 'AI Slides Generator' */}
        <div className="px-4 py-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-primary flex items-center justify-center">
              <span className="text-white text-xs font-bold">AI</span>
            </div>
            <span className="font-semibold text-foreground text-sm">AI Slides</span>
          </div>
        </div>

        {/* Primary Actions */}
        <div className="px-3 py-3 space-y-2 border-b border-sidebar-border">
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-sidebar-accent hover:bg-border transition text-foreground text-sm font-medium">
            <Plus className="w-4 h-4" />
            New presentation
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 text-muted-foreground hover:bg-sidebar-accent rounded-lg transition text-sm">
            <Search className="w-4 h-4" />
            Search
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 text-muted-foreground hover:bg-sidebar-accent rounded-lg transition text-sm">
            <BookOpen className="w-4 h-4" />
            Library
          </button>
        </div>

        {/* Recent Projects Section - Empty placeholder for future projects */}
        <div className="flex-1 overflow-y-auto px-2 py-3">
          <div className="text-xs font-semibold text-muted-foreground px-2 py-2 uppercase tracking-wide">
            Recent presentations
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground px-3 py-2">No presentations yet. Create one to get started!</p>
          </div>
        </div>

        {/* Bottom Icons */}
        <div className="px-3 py-3 border-t border-sidebar-border flex gap-2">
          <button className="flex-1 h-8 rounded-lg bg-border hover:bg-sidebar-accent transition" />
          <button className="flex-1 h-8 rounded-lg bg-border hover:bg-sidebar-accent transition" />
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOP HEADER - Removed model dropdown, points, upgrade, kept only user circle */}
        <div className="border-b border-border bg-card px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded bg-primary" />
            <div className="flex flex-col">
              <h2 className="text-sm font-semibold text-foreground">AI Slides Generator</h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold hover:opacity-80 transition">
              U
            </button>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto bg-background">
          <div className="max-w-5xl mx-auto px-8 py-12">
            {/* Main Heading */}
            <h1 className="text-5xl font-serif text-foreground text-center mb-8">What can I do for you?</h1>

            {/* Input Field */}
            <div className="mb-10">
              <div className="flex items-center bg-card border-2 border-border rounded-full px-4 py-3 hover:border-primary/30 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition gap-3">
                <Plus className="w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your presentation topic"
                  className="flex-1 bg-transparent text-foreground placeholder-muted-foreground focus:outline-none text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && prompt.trim()) {
                      handleGenerate()
                    }
                  }}
                />
                <div className="flex items-center gap-2">
                  <button
                    disabled={isGenerating}
                    className="p-1 hover:bg-border rounded disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <svg
                      className="w-4 h-4 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <button
                    disabled={isGenerating}
                    className="p-1 hover:bg-border rounded disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <svg
                      className="w-4 h-4 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </button>
                  <div className="px-2 py-1 bg-primary/10 rounded text-primary text-xs font-medium flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M5 2a1 1 0 011 1v1h1V3a1 1 0 011-1h5a1 1 0 011 1v1h1V3a1 1 0 011-1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V3a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Slides
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l-4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || isGenerating}
                    className="p-1 hover:bg-border rounded disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <svg
                      className="w-4 h-4 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 13l-7 7-7-7m0-6l7-7 7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Sample Prompts */}
            <div className="mb-12">
              <h3 className="text-sm font-medium text-foreground mb-4">Sample prompts</h3>
              <div className="grid grid-cols-2 gap-3">
                {SAMPLE_PROMPTS.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPrompt(sample)}
                    className="text-left text-sm px-4 py-3 rounded-lg border border-border hover:border-primary/30 text-muted-foreground hover:bg-primary/5 transition"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Selection */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-foreground">Choose a template</h3>
                <select className="text-xs text-muted-foreground bg-card border border-border rounded px-2 py-1 cursor-pointer">
                  <option>8 - 12</option>
                </select>
              </div>
              <TemplateSelector
                templates={SLIDE_TEMPLATES}
                selectedTemplate={selectedTemplate}
                onSelectTemplate={setSelectedTemplate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
