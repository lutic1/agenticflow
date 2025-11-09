/**
 * Editor Toolbar Component
 * Top-level toolbar with File/Edit/View/Tools dropdown menus
 * Includes keyboard shortcuts and AI feature indicators
 */

'use client';

import { useState } from 'react';
import {
  FileText,
  FolderOpen,
  Save,
  Download,
  Upload,
  Copy,
  RotateCcw,
  RotateCw,
  Layout as LayoutIcon,
  Eye,
  StickyNote,
  Wrench,
  Sparkles,
  Volume2,
  CheckCircle,
  Menu,
} from 'lucide-react';
import { AIBadge } from '@/components/ui/AIBadge';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface EditorToolbarProps {
  /** Presentation ID */
  presentationId: string;
  /** Undo handler */
  onUndo?: () => void;
  /** Redo handler */
  onRedo?: () => void;
  /** Can undo */
  canUndo?: boolean;
  /** Can redo */
  canRedo?: boolean;
  /** Current view mode */
  viewMode?: 'slide' | 'grid' | 'outline';
  /** View mode change handler */
  onViewModeChange?: (mode: 'slide' | 'grid' | 'outline') => void;
}

export function EditorToolbar({
  presentationId,
  onUndo,
  onRedo,
  canUndo = true,
  canRedo = true,
  viewMode = 'slide',
  onViewModeChange,
}: EditorToolbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-gray-200">
      {/* Mobile Menu Toggle */}
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <Menu className="w-4 h-4" />
      </Button>

      {/* Desktop Menu */}
      <div className="hidden lg:flex items-center gap-1">
        {/* File Menu */}
        <FileDropdown presentationId={presentationId} />

        {/* Edit Menu */}
        <EditDropdown
          onUndo={onUndo}
          onRedo={onRedo}
          canUndo={canUndo}
          canRedo={canRedo}
        />

        {/* View Menu */}
        <ViewDropdown
          currentMode={viewMode}
          onModeChange={onViewModeChange}
        />

        {/* Tools Menu */}
        <ToolsDropdown />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Quick Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (⌘Z)"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (⌘⇧Z)"
        >
          <RotateCw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

/**
 * File Dropdown Menu
 */
function FileDropdown({ presentationId }: { presentationId: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="font-normal">
          File
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuItem>
          <FileText className="w-4 h-4 mr-2" />
          New Presentation
          <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <FolderOpen className="w-4 h-4 mr-2" />
          Open
          <DropdownMenuShortcut>⌘O</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Save className="w-4 h-4 mr-2" />
          Save
          <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Save className="w-4 h-4 mr-2" />
          Save As...
          <DropdownMenuShortcut>⌘⇧S</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Download className="w-4 h-4 mr-2" />
          Export
          <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Upload className="w-4 h-4 mr-2" />
          Import Data
          <DropdownMenuShortcut>⌘I</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Edit Dropdown Menu
 */
function EditDropdown({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: {
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo: boolean;
  canRedo: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="font-normal">
          Edit
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuItem onClick={onUndo} disabled={!canUndo}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Undo
          <DropdownMenuShortcut>⌘Z</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onRedo} disabled={!canRedo}>
          <RotateCw className="w-4 h-4 mr-2" />
          Redo
          <DropdownMenuShortcut>⌘⇧Z</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Copy className="w-4 h-4 mr-2" />
          Duplicate Slide
          <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * View Dropdown Menu
 */
function ViewDropdown({
  currentMode,
  onModeChange,
}: {
  currentMode: 'slide' | 'grid' | 'outline';
  onModeChange?: (mode: 'slide' | 'grid' | 'outline') => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="font-normal">
          View
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuItem
          onClick={() => onModeChange?.('grid')}
          className={cn(currentMode === 'grid' && 'bg-gray-100')}
        >
          <LayoutIcon className="w-4 h-4 mr-2" />
          Grid View
          <DropdownMenuShortcut>⌘1</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onModeChange?.('outline')}
          className={cn(currentMode === 'outline' && 'bg-gray-100')}
        >
          <FileText className="w-4 h-4 mr-2" />
          Outline View
          <DropdownMenuShortcut>⌘2</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <StickyNote className="w-4 h-4 mr-2" />
          Speaker Notes
          <DropdownMenuShortcut>⌘3</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Eye className="w-4 h-4 mr-2" />
          Preview Mode
          <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Tools Dropdown Menu
 */
function ToolsDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="font-normal">
          Tools
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuItem>
          <Sparkles className="w-4 h-4 mr-2" />
          Transitions
          <DropdownMenuShortcut>⌘T</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <CheckCircle className="w-4 h-4 mr-2" />
          Accessibility Check
          <DropdownMenuShortcut>⌘A</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex items-center justify-between">
          <div className="flex items-center">
            <Volume2 className="w-4 h-4 mr-2" />
            Voice Narration
          </div>
          <AIBadge size="sm" showText={false} />
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center justify-between">
          <div className="flex items-center">
            <Sparkles className="w-4 h-4 mr-2" />
            AI Image Generator
          </div>
          <AIBadge size="sm" showText={false} />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
