/**
 * Keyboard Shortcuts Modal
 * Displays all available keyboard shortcuts organized by category
 */

'use client';

import { useState, useEffect } from 'react';
import { Keyboard, X, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { defaultShortcuts, formatKeys, type KeyboardShortcut } from '@/lib/keyboard-shortcuts';
import { cn } from '@/lib/utils';

interface KeyboardShortcutsModalProps {
  /** Is modal open */
  isOpen?: boolean;
  /** Close handler */
  onClose?: () => void;
  /** Custom shortcuts */
  shortcuts?: Omit<KeyboardShortcut, 'handler'>[];
}

export function KeyboardShortcutsModal({
  isOpen: controlledIsOpen,
  onClose,
  shortcuts = defaultShortcuts,
}: KeyboardShortcutsModalProps) {
  const [isOpen, setIsOpen] = useState(controlledIsOpen ?? false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync with controlled state
  useEffect(() => {
    if (controlledIsOpen !== undefined) {
      setIsOpen(controlledIsOpen);
    }
  }, [controlledIsOpen]);

  // Handle keyboard shortcut to open modal (⌘/)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === '/') {
        event.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  // Filter shortcuts by search query
  const filteredShortcuts = shortcuts.filter(
    (shortcut) =>
      shortcut.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shortcut.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group by category
  const categories = Array.from(new Set(filteredShortcuts.map((s) => s.category)));

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search shortcuts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Shortcuts List */}
        <div className="flex-1 overflow-y-auto space-y-6">
          {categories.map((category) => {
            const categoryShortcuts = filteredShortcuts.filter((s) => s.category === category);

            if (categoryShortcuts.length === 0) return null;

            return (
              <div key={category}>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">{category}</h3>
                <div className="space-y-2">
                  {categoryShortcuts.map((shortcut) => (
                    <div
                      key={shortcut.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm">
                          {shortcut.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {shortcut.description}
                        </div>
                      </div>
                      <KeyBadge keys={shortcut.keys} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {filteredShortcuts.length === 0 && (
            <div className="text-center py-12">
              <Keyboard className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-sm">No shortcuts found</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            Press <KeyBadge keys="mod+/" inline /> to toggle this modal
          </div>
          <Button variant="outline" size="sm" onClick={handleClose}>
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Key Badge Component
 */
function KeyBadge({ keys, inline = false }: { keys: string; inline?: boolean }) {
  const formattedKeys = formatKeys(keys);
  const keyParts = formattedKeys.split(/(?=[⌘⇧⌥])|(?<=[⌘⇧⌥])/);

  return (
    <div className={cn('flex items-center gap-1', inline && 'inline-flex')}>
      {keyParts.map((part, index) => (
        <kbd
          key={index}
          className="inline-flex items-center justify-center min-w-[1.5rem] px-2 py-1 text-xs font-semibold bg-gray-100 border border-gray-300 rounded shadow-sm"
        >
          {part}
        </kbd>
      ))}
    </div>
  );
}

/**
 * Keyboard Shortcuts Button Trigger
 */
export function KeyboardShortcutsButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        title="Keyboard Shortcuts (⌘/)"
      >
        <Keyboard className="w-4 h-4" />
      </Button>
      <KeyboardShortcutsModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
