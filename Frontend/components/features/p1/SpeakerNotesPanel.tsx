'use client';

import { useEffect, useState } from 'react';
import { useSpeakerNotes } from '@/hooks/use-p1-features';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Loader2, Bold, Italic, List, ListOrdered } from 'lucide-react';

interface SpeakerNotesPanelProps {
  slideId: string;
}

export function SpeakerNotesPanel({ slideId }: SpeakerNotesPanelProps) {
  const { notes, isLoading, error, updateNotes } = useSpeakerNotes(slideId);
  const [content, setContent] = useState('');

  const editor = useEditor({
    extensions: [StarterKit],
    content: notes?.content || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContent(html);
    },
  });

  useEffect(() => {
    if (notes?.content && editor) {
      editor.commands.setContent(notes.content);
    }
  }, [notes, editor]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-4">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm text-gray-600">Loading speaker notes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-800">Error loading speaker notes</p>
      </div>
    );
  }

  const handleSave = () => {
    if (content) {
      updateNotes(content);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Speaker Notes</h3>
        <button
          onClick={handleSave}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          Save
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-gray-50 border border-gray-200 rounded-lg">
        <button
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor?.isActive('bold') ? 'bg-gray-300' : ''
          }`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor?.isActive('italic') ? 'bg-gray-300' : ''
          }`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <button
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor?.isActive('bulletList') ? 'bg-gray-300' : ''
          }`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor?.isActive('orderedList') ? 'bg-gray-300' : ''
          }`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
      </div>

      {/* Editor */}
      <div className="border border-gray-200 rounded-lg p-4 min-h-[200px] prose prose-sm max-w-none">
        <EditorContent editor={editor} />
      </div>

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Tip:</strong> Notes are private and only visible to presenters.
          Use Markdown formatting for rich text.
        </p>
      </div>
    </div>
  );
}
