'use client';

import { useState } from 'react';
import { useSlideDuplication } from '@/hooks/use-p1-features';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Loader2, Copy, GripVertical } from 'lucide-react';

interface SlideDuplicatorProps {
  presentationId: string;
}

interface SortableSlideProps {
  slide: { id: string; order: number; content: any };
  onDuplicate: (id: string) => void;
}

function SortableSlide({ slide, onDuplicate }: SortableSlideProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3 hover:border-blue-400 transition-colors"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
      >
        <GripVertical className="w-4 h-4 text-gray-400" />
      </button>

      <div className="flex-1">
        <div className="text-sm font-medium text-gray-900">
          Slide {slide.order}
        </div>
        <div className="text-xs text-gray-500">
          {slide.content?.title || 'Untitled'}
        </div>
      </div>

      <button
        onClick={() => onDuplicate(slide.id)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        title="Duplicate slide"
      >
        <Copy className="w-4 h-4 text-gray-600" />
      </button>
    </div>
  );
}

export function SlideDuplicator({ presentationId }: SlideDuplicatorProps) {
  const { slides, isLoading, error, duplicateSlide, reorderSlides } = useSlideDuplication(presentationId);
  const [items, setItems] = useState(slides || []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-4">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm text-gray-600">Loading slides...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-800">Error loading slides</p>
      </div>
    );
  }

  if (!slides || slides.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">No slides available</p>
      </div>
    );
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);
      reorderSlides(newItems.map((item) => item.id));
    }
  };

  const handleDuplicate = (slideId: string) => {
    duplicateSlide(slideId);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Slide Manager</h3>
        <span className="text-xs text-gray-500">{slides.length} slides</span>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {items.map((slide) => (
              <SortableSlide
                key={slide.id}
                slide={slide}
                onDuplicate={handleDuplicate}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Tip:</strong> Drag slides to reorder, or click the copy icon to duplicate.
        </p>
      </div>
    </div>
  );
}
