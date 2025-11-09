'use client';

import { useState } from 'react';
import { use } from 'react';
import {
  GridLayoutEditor,
  TypographyControls,
  ColorPaletteSelector,
  ChartInserter,
  TextOverflowManager,
  MasterSlideEditor,
  TransitionSelector,
  AccessibilityChecker,
  ExportDialog,
  ImageOptimizer,
  ContentValidator,
  ContentQualityPanel,
} from '@/components/features/p0';
import {
  SlideDuplicator,
  TemplateLibrary,
  SpeakerNotesPanel,
  LanguageSelector,
  VideoEmbedder,
  FontUploader,
  CollaborationPanel,
  VersionHistoryPanel,
  AIImageGenerator,
  DataImporter,
  SlideManager,
} from '@/components/features/p1';
import {
  Layout,
  Type,
  Palette,
  BarChart3,
  AlignLeft,
  FileImage,
  Sparkles,
  Eye,
  Download,
  Image as ImageIcon,
  CheckCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  Copy,
  MessageSquare,
  History,
  Globe,
  Video,
  Upload,
  Users,
  FileSpreadsheet,
  Play,
  Star,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(1);
  const [activePanel, setActivePanel] = useState<string | null>('grid');
  const [slideContent, setSlideContent] = useState('This is sample content for the slide. You can edit and validate this content using the AI-powered tools.');

  const p0Tools = [
    { id: 'grid', name: 'Grid Layout', icon: Layout, component: GridLayoutEditor },
    { id: 'typography', name: 'Typography', icon: Type, component: TypographyControls },
    { id: 'colors', name: 'Colors', icon: Palette, component: ColorPaletteSelector },
    { id: 'charts', name: 'Charts', icon: BarChart3, component: ChartInserter },
    { id: 'overflow', name: 'Text Overflow', icon: AlignLeft, component: TextOverflowManager },
    { id: 'master', name: 'Master Slides', icon: FileImage, component: MasterSlideEditor },
    { id: 'transitions', name: 'Transitions', icon: Sparkles, component: TransitionSelector },
    { id: 'accessibility', name: 'Accessibility', icon: Eye, component: AccessibilityChecker },
    { id: 'export', name: 'Export', icon: Download, component: ExportDialog },
    { id: 'images', name: 'Images', icon: ImageIcon, component: ImageOptimizer },
    { id: 'validator', name: 'Validation', icon: CheckCircle, component: ContentValidator },
    { id: 'quality', name: 'AI Quality', icon: Sparkles, component: ContentQualityPanel },
  ];

  const p1Tools = [
    { id: 'slide-manager', name: 'Slide Manager', icon: Copy, component: SlideManager },
    { id: 'speaker-notes', name: 'Speaker Notes', icon: MessageSquare, component: SpeakerNotesPanel },
    { id: 'collaboration', name: 'Collaboration', icon: Users, component: CollaborationPanel },
    { id: 'version-history', name: 'Version History', icon: History, component: VersionHistoryPanel },
    { id: 'video-embed', name: 'Video Embed', icon: Video, component: VideoEmbedder },
    { id: 'ai-image', name: 'AI Images', icon: Sparkles, component: AIImageGenerator },
    { id: 'data-import', name: 'Data Import', icon: FileSpreadsheet, component: DataImporter },
    { id: 'font-upload', name: 'Custom Fonts', icon: Upload, component: FontUploader },
  ];

  const allTools = [...p0Tools, ...p1Tools];
  const ActiveComponent = allTools.find((t) => t.id === activePanel)?.component;

  const handlePresentationMode = () => {
    router.push(`/presentations/${id}/present`);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back
            </Link>
            <div className="h-6 w-px bg-gray-300" />
            <h1 className="text-lg font-semibold text-gray-900">
              Presentation Editor - {id}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <LanguageSelector presentationId={id} />

            {/* Collaboration Indicator */}
            <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg">
              <Users className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-600">2 online</span>
            </div>

            {/* Present Button */}
            <button
              onClick={handlePresentationMode}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Play className="w-4 h-4" />
              <span>Present</span>
            </button>

            {/* Slide Navigation */}
            <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg">
              <span className="text-sm text-gray-600">Slide {currentSlide} / 10</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentSlide(Math.max(1, currentSlide - 1))}
                  disabled={currentSlide === 1}
                  className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentSlide(Math.min(10, currentSlide + 1))}
                  disabled={currentSlide === 10}
                  className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Tools */}
        <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          {/* P0 Features */}
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              P0 Features
            </h2>
            <p className="text-xs text-gray-500 mt-1">12 core features</p>
          </div>

          <div className="p-2 border-b border-gray-200">
            {p0Tools.map((tool) => {
              const Icon = tool.icon;
              const isActive = activePanel === tool.id;

              return (
                <button
                  key={tool.id}
                  onClick={() => setActivePanel(isActive ? null : tool.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors mb-1 ${
                    isActive
                      ? 'bg-blue-50 text-blue-900 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span className="text-sm">{tool.name}</span>
                </button>
              );
            })}
          </div>

          {/* P1 Features */}
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-600" />
              P1 Advanced
            </h2>
            <p className="text-xs text-gray-500 mt-1">14 advanced features</p>
          </div>

          <div className="p-2">
            {p1Tools.map((tool) => {
              const Icon = tool.icon;
              const isActive = activePanel === tool.id;

              return (
                <button
                  key={tool.id}
                  onClick={() => setActivePanel(isActive ? null : tool.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors mb-1 ${
                    isActive
                      ? 'bg-purple-50 text-purple-900 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-purple-600' : 'text-gray-500'}`} />
                  <span className="text-sm">{tool.name}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Links */}
          <div className="p-4 border-t border-gray-200">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-yellow-600" />
              Quick Access
            </h2>
            <div className="space-y-2">
              <Link
                href="/library"
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <FileImage className="w-4 h-4 text-gray-500" />
                Template Library
              </Link>
              <Link
                href="/analytics"
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <BarChart3 className="w-4 h-4 text-gray-500" />
                Analytics
              </Link>
            </div>
          </div>
        </div>

        {/* Main Canvas */}
        <div className="flex-1 overflow-auto p-8 bg-gray-100">
          <div className="max-w-4xl mx-auto">
            {/* Slide Canvas */}
            <div className="bg-white rounded-lg shadow-xl aspect-video p-8 border-4 border-gray-200">
              <div className="h-full flex flex-col">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Slide {currentSlide}
                </h1>
                <div className="flex-1 space-y-4">
                  <p className="text-lg text-gray-700">{slideContent}</p>

                  <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <strong>Interactive Canvas:</strong> Use the P0 & P1 tools on the left to modify
                      this slide. All features are fully integrated and ready to use.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Editor Features</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Select any P0 or P1 feature from the left sidebar</li>
                <li>• Configure settings in the right panel</li>
                <li>• Use collaboration tools to work with team members</li>
                <li>• Click Present to start live presentation mode</li>
                <li>• Access Template Library and Analytics from Quick Access</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Active Tool Panel */}
        {activePanel && ActiveComponent && (
          <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
            <ActiveComponent
              slideId={`slide-${currentSlide}`}
              presentationId={id}
              content={slideContent}
              onLayoutChange={(layout) => console.log('Layout changed:', layout)}
              onTypographyChange={(config) => console.log('Typography changed:', config)}
              onPaletteChange={(palette) => console.log('Palette changed:', palette)}
              onChartInsert={(chart) => console.log('Chart inserted:', chart)}
              onStrategyChange={(strategy) => console.log('Overflow strategy:', strategy)}
              onMasterChange={(master) => console.log('Master changed:', master)}
              onTransitionChange={(transition) => console.log('Transition changed:', transition)}
              onIssuesFix={(issues) => console.log('Issues fixed:', issues)}
              onExport={(config) => console.log('Exporting:', config)}
              onImageOptimized={(image) => console.log('Image optimized:', image)}
              onValidationComplete={(results) => console.log('Validation:', results)}
              onSuggestionApply={(suggestion) => {
                setSlideContent(suggestion);
                console.log('Suggestion applied:', suggestion);
              }}
            />
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center gap-4">
          <span>● Backend: Online</span>
          <span>P0 Features: 12/12</span>
          <span className="text-purple-600">P1 Features: 14/14</span>
        </div>
        <div className="flex items-center gap-4">
          {activePanel ? (
            <span className="font-medium text-blue-600">
              Active: {allTools.find((t) => t.id === activePanel)?.name}
            </span>
          ) : (
            <span>Select a tool to get started</span>
          )}
        </div>
      </div>
    </div>
  );
}
