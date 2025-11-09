/**
 * Icon-Based Editor Toolbar
 *
 * Purpose: Replace vertical sidebar with horizontal icon-based toolbar
 *
 * Features:
 * - Icon-only buttons with tooltips
 * - Grouped tools in dropdowns (max 15-18 visible items)
 * - Visual hierarchy (large Export, grouped AI tools)
 * - Keyboard shortcuts
 * - Responsive (hamburger menu on mobile)
 *
 * Improvements over old sidebar:
 * - Uses horizontal space efficiently
 * - Clearer visual hierarchy
 * - Less overwhelming (dropdowns hide complexity)
 * - AI tools visually distinct
 */

'use client';

import { useState } from 'react';
import {
  Layout,
  Type,
  Palette,
  BarChart3,
  AlignLeft,
  Image as ImageIcon,
  FileImage,
  Sparkles,
  Eye,
  Download,
  CheckCircle,
  Undo,
  Redo,
  ChevronDown,
  Menu,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Button } from './Button';
import { AIBadge } from './AIBadge';

interface Tool {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  onClick: () => void;
}

interface ToolGroup {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  items: Tool[];
}

export function EditorToolbar() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Define tool groups
  const toolGroups: ToolGroup[] = [
    {
      id: 'layout',
      label: 'Layout',
      icon: Layout,
      shortcut: 'L',
      items: [
        { id: 'grid', label: 'Grid Layout', icon: Layout, shortcut: 'G', onClick: () => {} },
        { id: 'typography', label: 'Typography', icon: Type, shortcut: 'T', onClick: () => {} },
        { id: 'colors', label: 'Colors', icon: Palette, shortcut: 'C', onClick: () => {} },
      ],
    },
    {
      id: 'content',
      label: 'Content',
      icon: BarChart3,
      shortcut: 'I',
      items: [
        { id: 'charts', label: 'Insert Chart', icon: BarChart3, onClick: () => {} },
        { id: 'text-overflow', label: 'Text Overflow', icon: AlignLeft, onClick: () => {} },
        { id: 'images', label: 'Optimize Images', icon: ImageIcon, onClick: () => {} },
      ],
    },
    {
      id: 'quality',
      label: 'Quality',
      icon: CheckCircle,
      shortcut: 'Q',
      items: [
        { id: 'validate', label: 'Validate Content', icon: CheckCircle, onClick: () => {} },
        { id: 'accessibility', label: 'Accessibility', icon: Eye, onClick: () => {} },
      ],
    },
  ];

  const aiTools: Tool[] = [
    { id: 'ai-images', label: 'AI Images', icon: Sparkles, shortcut: 'Ctrl+I', onClick: () => {} },
    { id: 'ai-quality', label: 'AI Quality', icon: Sparkles, shortcut: 'Ctrl+Q', onClick: () => {} },
  ];

  const standaloneTool = [
    { id: 'master', label: 'Master Slides', icon: FileImage, onClick: () => {} },
  ];

  return (
    <Tooltip.Provider delayDuration={300}>
      <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-200 bg-white">
        {/* Mobile Menu Button */}
        <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
          <Menu className="w-5 h-5" />
        </button>

        {/* Tool Groups (Desktop) */}
        <div className="hidden md:flex items-center gap-1">
          {toolGroups.map((group) => (
            <ToolDropdown key={group.id} group={group} />
          ))}

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Standalone Tools */}
          {standaloneTool.map((tool) => (
            <ToolButton key={tool.id} tool={tool} />
          ))}

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* AI Tools Group - Visually Distinct */}
          <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
            <AIBadge variant="compact" className="mr-1">
              AI
            </AIBadge>
            {aiTools.map((tool) => (
              <ToolButton key={tool.id} tool={tool} variant="ai" />
            ))}
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* Undo/Redo */}
          <div className="hidden sm:flex items-center gap-1">
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 transition-colors">
                  <Undo className="w-4 h-4 text-gray-600" />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg z-50"
                  sideOffset={5}
                >
                  Undo (Ctrl+Z)
                  <Tooltip.Arrow className="fill-gray-900" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>

            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 transition-colors">
                  <Redo className="w-4 h-4 text-gray-600" />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg z-50"
                  sideOffset={5}
                >
                  Redo (Ctrl+Y)
                  <Tooltip.Arrow className="fill-gray-900" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>

            <div className="w-px h-6 bg-gray-300 mx-1" />
          </div>

          {/* Export Button - Primary Action */}
          <Button variant="primary" size="md" icon={<Download />}>
            Export
          </Button>
        </div>
      </div>
    </Tooltip.Provider>
  );
}

/**
 * Tool Dropdown Component
 * Groups multiple related tools
 */
function ToolDropdown({ group }: { group: ToolGroup }) {
  return (
    <DropdownMenu.Root>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-1 px-2 py-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
              <group.icon className="w-5 h-5 text-gray-600" />
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>
          </DropdownMenu.Trigger>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg z-50"
            sideOffset={5}
          >
            {group.label}
            {group.shortcut && (
              <kbd className="ml-2 px-1 bg-white/20 rounded text-[10px]">{group.shortcut}</kbd>
            )}
            <Tooltip.Arrow className="fill-gray-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[200px] bg-white rounded-lg shadow-xl border border-gray-200 p-1 z-50"
          sideOffset={5}
        >
          {group.items.map((item) => (
            <DropdownMenu.Item
              key={item.id}
              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-md cursor-pointer outline-none"
              onClick={item.onClick}
            >
              <item.icon className="w-4 h-4 text-gray-600" />
              <span className="flex-1 text-sm text-gray-900">{item.label}</span>
              {item.shortcut && (
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] text-gray-600 font-mono">
                  {item.shortcut}
                </kbd>
              )}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

/**
 * Individual Tool Button
 * Icon-only with tooltip
 */
function ToolButton({ tool, variant = 'default' }: { tool: Tool; variant?: 'default' | 'ai' }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          onClick={tool.onClick}
          className={`
            p-2 rounded-lg transition-all
            ${variant === 'ai' ? 'hover:bg-purple-100' : 'hover:bg-gray-100'}
            focus:outline-none focus:ring-2 focus:ring-blue-500
          `}
        >
          <tool.icon
            className={`w-5 h-5 ${variant === 'ai' ? 'text-purple-600' : 'text-gray-600'}`}
          />
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          className="bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg z-50"
          sideOffset={5}
        >
          {tool.label}
          {tool.shortcut && (
            <kbd className="ml-2 px-1 bg-white/20 rounded text-[10px]">{tool.shortcut}</kbd>
          )}
          <Tooltip.Arrow className="fill-gray-900" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

/**
 * Usage:
 *
 * // In main editor page
 * <div className="h-screen flex flex-col">
 *   <EditorToolbar />
 *   <div className="flex flex-1">
 *     <SlidesPanel />
 *     <Canvas />
 *     <PropertiesPanel />
 *   </div>
 * </div>
 *
 * Before: 24 items in vertical sidebar
 * After: 15 items in horizontal toolbar with dropdowns
 */
