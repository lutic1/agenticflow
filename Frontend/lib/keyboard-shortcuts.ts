/**
 * Keyboard Shortcuts System
 * Handles keyboard shortcut registration and execution
 */

export interface KeyboardShortcut {
  /** Unique identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** Description */
  description: string;
  /** Key combination (e.g., "mod+s", "shift+cmd+z") */
  keys: string;
  /** Category */
  category: 'File' | 'Edit' | 'View' | 'Tools' | 'Navigation';
  /** Handler function */
  handler: () => void;
  /** Is enabled */
  enabled?: boolean;
}

export const isMac = typeof window !== 'undefined' && navigator.platform.includes('Mac');

/**
 * Format key combination for display
 */
export function formatKeys(keys: string): string {
  return keys
    .split('+')
    .map((key) => {
      switch (key.toLowerCase()) {
        case 'mod':
        case 'cmd':
          return isMac ? '⌘' : 'Ctrl';
        case 'shift':
          return '⇧';
        case 'alt':
        case 'option':
          return isMac ? '⌥' : 'Alt';
        case 'ctrl':
          return 'Ctrl';
        default:
          return key.toUpperCase();
      }
    })
    .join('');
}

/**
 * Check if key event matches shortcut
 */
export function matchesShortcut(event: KeyboardEvent, keys: string): boolean {
  const parts = keys.toLowerCase().split('+');
  const key = parts[parts.length - 1];
  const modifiers = parts.slice(0, -1);

  // Check if key matches
  if (event.key.toLowerCase() !== key) {
    return false;
  }

  // Check modifiers
  const hasCtrlOrCmd = modifiers.includes('mod') || modifiers.includes('cmd') || modifiers.includes('ctrl');
  const hasShift = modifiers.includes('shift');
  const hasAlt = modifiers.includes('alt') || modifiers.includes('option');

  if (hasCtrlOrCmd && !(event.metaKey || event.ctrlKey)) {
    return false;
  }

  if (hasShift && !event.shiftKey) {
    return false;
  }

  if (hasAlt && !event.altKey) {
    return false;
  }

  return true;
}

/**
 * Default shortcuts
 */
export const defaultShortcuts: Omit<KeyboardShortcut, 'handler'>[] = [
  // File
  {
    id: 'file.new',
    name: 'New Presentation',
    description: 'Create a new presentation',
    keys: 'mod+n',
    category: 'File',
  },
  {
    id: 'file.open',
    name: 'Open',
    description: 'Open a presentation',
    keys: 'mod+o',
    category: 'File',
  },
  {
    id: 'file.save',
    name: 'Save',
    description: 'Save current presentation',
    keys: 'mod+s',
    category: 'File',
  },
  {
    id: 'file.save-as',
    name: 'Save As',
    description: 'Save with new name',
    keys: 'mod+shift+s',
    category: 'File',
  },
  {
    id: 'file.export',
    name: 'Export',
    description: 'Export presentation',
    keys: 'mod+e',
    category: 'File',
  },
  {
    id: 'file.import',
    name: 'Import Data',
    description: 'Import data into presentation',
    keys: 'mod+i',
    category: 'File',
  },

  // Edit
  {
    id: 'edit.undo',
    name: 'Undo',
    description: 'Undo last action',
    keys: 'mod+z',
    category: 'Edit',
  },
  {
    id: 'edit.redo',
    name: 'Redo',
    description: 'Redo last undone action',
    keys: 'mod+shift+z',
    category: 'Edit',
  },
  {
    id: 'edit.duplicate',
    name: 'Duplicate Slide',
    description: 'Duplicate current slide',
    keys: 'mod+d',
    category: 'Edit',
  },

  // View
  {
    id: 'view.grid',
    name: 'Grid View',
    description: 'Switch to grid view',
    keys: 'mod+1',
    category: 'View',
  },
  {
    id: 'view.outline',
    name: 'Outline View',
    description: 'Switch to outline view',
    keys: 'mod+2',
    category: 'View',
  },
  {
    id: 'view.notes',
    name: 'Speaker Notes',
    description: 'Toggle speaker notes',
    keys: 'mod+3',
    category: 'View',
  },
  {
    id: 'view.preview',
    name: 'Preview Mode',
    description: 'Enter preview mode',
    keys: 'mod+p',
    category: 'View',
  },

  // Tools
  {
    id: 'tools.transitions',
    name: 'Transitions',
    description: 'Open transitions panel',
    keys: 'mod+t',
    category: 'Tools',
  },
  {
    id: 'tools.accessibility',
    name: 'Accessibility Check',
    description: 'Run accessibility checker',
    keys: 'mod+a',
    category: 'Tools',
  },

  // Navigation
  {
    id: 'nav.next-slide',
    name: 'Next Slide',
    description: 'Navigate to next slide',
    keys: 'arrowright',
    category: 'Navigation',
  },
  {
    id: 'nav.prev-slide',
    name: 'Previous Slide',
    description: 'Navigate to previous slide',
    keys: 'arrowleft',
    category: 'Navigation',
  },
  {
    id: 'nav.first-slide',
    name: 'First Slide',
    description: 'Jump to first slide',
    keys: 'home',
    category: 'Navigation',
  },
  {
    id: 'nav.last-slide',
    name: 'Last Slide',
    description: 'Jump to last slide',
    keys: 'end',
    category: 'Navigation',
  },
  {
    id: 'nav.shortcuts',
    name: 'Keyboard Shortcuts',
    description: 'Show keyboard shortcuts',
    keys: 'mod+/',
    category: 'Navigation',
  },
];

/**
 * Keyboard shortcuts manager
 */
export class KeyboardShortcutsManager {
  private shortcuts: Map<string, KeyboardShortcut> = new Map();
  private isEnabled = true;

  constructor(shortcuts: KeyboardShortcut[] = []) {
    shortcuts.forEach((shortcut) => this.register(shortcut));
    this.attachListener();
  }

  register(shortcut: KeyboardShortcut): void {
    this.shortcuts.set(shortcut.id, shortcut);
  }

  unregister(id: string): void {
    this.shortcuts.delete(id);
  }

  enable(): void {
    this.isEnabled = true;
  }

  disable(): void {
    this.isEnabled = false;
  }

  getAll(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values());
  }

  getByCategory(category: KeyboardShortcut['category']): KeyboardShortcut[] {
    return this.getAll().filter((s) => s.category === category);
  }

  private attachListener(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', (event) => {
      if (!this.isEnabled) return;

      // Skip if typing in input/textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        return;
      }

      // Find matching shortcut
      for (const shortcut of this.shortcuts.values()) {
        if (shortcut.enabled !== false && matchesShortcut(event, shortcut.keys)) {
          event.preventDefault();
          shortcut.handler();
          break;
        }
      }
    });
  }
}
