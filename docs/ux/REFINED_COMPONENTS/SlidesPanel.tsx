/**
 * Slides Panel with Visual Thumbnails
 *
 * Purpose: Replace text-only slide navigation with visual page thumbnails
 *
 * Features:
 * - Visual slide thumbnails
 * - Drag-and-drop reordering
 * - Duplicate/delete actions
 * - Add new slide button
 * - Active slide highlighting
 * - Slide numbers
 *
 * Dependencies:
 * - @dnd-kit/core - Drag and drop
 * - @dnd-kit/sortable - Sortable lists
 */

'use client';

import { useState } from 'react';
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
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, GripVertical, Copy, Trash2 } from 'lucide-react';

interface Slide {
  id: string;
  title: string;
  content?: string;
  thumbnail?: string;
}

interface SlidesPanelProps {
  slides: Slide[];
  currentSlide: number;
  onSlideSelect: (index: number) => void;
  onSlideReorder?: (oldIndex: number, newIndex: number) => void;
  onSlideAdd?: () => void;
  onSlideDuplicate?: (id: string) => void;
  onSlideDelete?: (id: string) => void;
}

export function SlidesPanel({
  slides,
  currentSlide,
  onSlideSelect,
  onSlideReorder,
  onSlideAdd,
  onSlideDuplicate,
  onSlideDelete,
}: SlidesPanelProps) {
  const [slideIds, setSlideIds] = useState(slides.map((s) => s.id));

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = slideIds.indexOf(active.id as string);
      const newIndex = slideIds.indexOf(over.id as string);

      setSlideIds(arrayMove(slideIds, oldIndex, newIndex));
      onSlideReorder?.(oldIndex, newIndex);
    }
  };

  return (
    <div className="w-64 border-r bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b bg-white flex items-center justify-between shrink-0">
        <h3 className="font-semibold text-sm text-gray-900">
          Slides <span className="text-gray-500">({slides.length})</span>
        </h3>
        <button
          onClick={onSlideAdd}
          className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Add new slide"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Slides List */}
      <div className="flex-1 overflow-y-auto p-2">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={slideIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {slides.map((slide, index) => (
                <SlideThumbnail
                  key={slide.id}
                  slide={slide}
                  index={index}
                  isActive={currentSlide === index}
                  onClick={() => onSlideSelect(index)}
                  onDuplicate={() => onSlideDuplicate?.(slide.id)}
                  onDelete={() => onSlideDelete?.(slide.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Empty State */}
      {slides.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-3">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-sm text-gray-600 mb-3">No slides yet</p>
          <button
            onClick={onSlideAdd}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create First Slide
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Individual Slide Thumbnail Component
 */
interface SlideThumbnailProps {
  slide: Slide;
  index: number;
  isActive: boolean;
  onClick: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function SlideThumbnail({
  slide,
  index,
  isActive,
  onClick,
  onDuplicate,
  onDelete,
}: SlideThumbnailProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: slide.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative rounded-lg overflow-hidden cursor-pointer
        border-2 transition-all duration-200
        ${
          isActive
            ? 'border-blue-600 shadow-lg ring-2 ring-blue-100'
            : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
        }
      `}
      onClick={onClick}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 p-1 bg-white/90 backdrop-blur rounded cursor-move opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-3 h-3 text-gray-600" />
      </div>

      {/* Slide Number Badge */}
      <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/70 text-white text-xs font-bold rounded z-10">
        {index + 1}
      </div>

      {/* Active Indicator */}
      {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 z-10" />}

      {/* Thumbnail Preview */}
      <div className="aspect-video bg-white p-3 flex flex-col">
        {slide.thumbnail ? (
          <img src={slide.thumbnail} alt={slide.title} className="w-full h-full object-cover" />
        ) : (
          <>
            <div className="font-bold text-gray-900 text-sm truncate mb-2">
              {slide.title || `Slide ${index + 1}`}
            </div>
            <div className="text-gray-600 text-[10px] line-clamp-3 leading-tight">
              {slide.content?.substring(0, 80) || 'Empty slide'}
            </div>
          </>
        )}
      </div>

      {/* Actions Bar (Show on Hover) */}
      <div className="absolute bottom-0 left-0 right-0 flex gap-1 p-1.5 bg-gradient-to-t from-black/80 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="flex-1 p-1.5 bg-white/20 hover:bg-white/30 rounded text-white transition-colors"
          title="Duplicate slide"
        >
          <Copy className="w-3 h-3 mx-auto" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm('Delete this slide?')) {
              onDelete();
            }
          }}
          className="flex-1 p-1.5 bg-white/20 hover:bg-red-500 rounded text-white transition-colors"
          title="Delete slide"
        >
          <Trash2 className="w-3 h-3 mx-auto" />
        </button>
      </div>
    </div>
  );
}

/**
 * Usage Example:
 *
 * const [slides, setSlides] = useState([...]);
 * const [currentSlide, setCurrentSlide] = useState(0);
 *
 * <SlidesPanel
 *   slides={slides}
 *   currentSlide={currentSlide}
 *   onSlideSelect={setCurrentSlide}
 *   onSlideReorder={(oldIdx, newIdx) => {
 *     const newSlides = arrayMove(slides, oldIdx, newIdx);
 *     setSlides(newSlides);
 *   }}
 *   onSlideAdd={() => {
 *     setSlides([...slides, { id: uuid(), title: 'New Slide', content: '' }]);
 *   }}
 *   onSlideDuplicate={(id) => {
 *     const slide = slides.find(s => s.id === id);
 *     setSlides([...slides, { ...slide, id: uuid() }]);
 *   }}
 *   onSlideDelete={(id) => {
 *     setSlides(slides.filter(s => s.id !== id));
 *   }}
 * />
 *
 * Before: Text "Slide 3 / 10" with arrows
 * After: Visual thumbnails with drag-to-reorder, duplicate/delete actions
 */
