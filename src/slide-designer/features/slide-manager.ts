/**
 * Slide Manager (P1.4)
 * Slide duplication, reordering, and management
 * Drag-and-drop support, undo/redo, clipboard operations
 */

export interface SlideData {
  id: string;
  order: number;
  html: string;
  content: {
    title?: string;
    subtitle?: string;
    body?: string;
    bullets?: string[];
    images?: Array<{ src: string; alt: string }>;
    charts?: any[];
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    masterSlideId?: string;
    tags?: string[];
    notes?: string;
  };
}

export interface PresentationState {
  slides: SlideData[];
  activeSlideIndex: number;
  history: HistoryEntry[];
  historyIndex: number;
}

export interface HistoryEntry {
  action: 'add' | 'delete' | 'reorder' | 'update' | 'duplicate';
  timestamp: Date;
  before: Partial<PresentationState>;
  after: Partial<PresentationState>;
}

export interface DragDropEvent {
  sourceIndex: number;
  targetIndex: number;
  position: 'before' | 'after';
}

/**
 * Slide Manager
 * Manages slide operations: duplicate, reorder, delete
 */
export class SlideManager {
  private state: PresentationState;
  private maxHistorySize: number = 50;

  constructor(initialSlides: SlideData[] = []) {
    this.state = {
      slides: initialSlides,
      activeSlideIndex: 0,
      history: [],
      historyIndex: -1
    };
  }

  /**
   * Duplicate a slide
   */
  duplicateSlide(slideIndex: number): SlideData {
    const slide = this.state.slides[slideIndex];
    if (!slide) {
      throw new Error(`Slide at index ${slideIndex} not found`);
    }

    // Create deep copy with new ID
    const duplicatedSlide: SlideData = {
      ...JSON.parse(JSON.stringify(slide)),
      id: this.generateId(),
      order: slideIndex + 1,
      metadata: {
        ...slide.metadata,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };

    // Insert after original slide
    this.addSlide(duplicatedSlide, slideIndex + 1);

    return duplicatedSlide;
  }

  /**
   * Add slide at specific position
   */
  addSlide(slide: SlideData, position?: number): void {
    const before: Partial<PresentationState> = {
      slides: [...this.state.slides]
    };

    if (position !== undefined && position >= 0 && position <= this.state.slides.length) {
      // Insert at specific position
      this.state.slides.splice(position, 0, slide);
    } else {
      // Add to end
      this.state.slides.push(slide);
    }

    // Reorder all slides
    this.reorderSlides();

    const after: Partial<PresentationState> = {
      slides: [...this.state.slides]
    };

    this.recordHistory('add', before, after);
  }

  /**
   * Delete slide
   */
  deleteSlide(slideIndex: number): void {
    if (slideIndex < 0 || slideIndex >= this.state.slides.length) {
      throw new Error(`Invalid slide index: ${slideIndex}`);
    }

    if (this.state.slides.length === 1) {
      throw new Error('Cannot delete the last slide');
    }

    const before: Partial<PresentationState> = {
      slides: [...this.state.slides],
      activeSlideIndex: this.state.activeSlideIndex
    };

    this.state.slides.splice(slideIndex, 1);

    // Adjust active slide index
    if (this.state.activeSlideIndex >= this.state.slides.length) {
      this.state.activeSlideIndex = this.state.slides.length - 1;
    }

    // Reorder remaining slides
    this.reorderSlides();

    const after: Partial<PresentationState> = {
      slides: [...this.state.slides],
      activeSlideIndex: this.state.activeSlideIndex
    };

    this.recordHistory('delete', before, after);
  }

  /**
   * Move slide to new position
   */
  moveSlide(fromIndex: number, toIndex: number): void {
    if (fromIndex === toIndex) return;

    if (
      fromIndex < 0 ||
      fromIndex >= this.state.slides.length ||
      toIndex < 0 ||
      toIndex >= this.state.slides.length
    ) {
      throw new Error('Invalid slide indices');
    }

    const before: Partial<PresentationState> = {
      slides: [...this.state.slides]
    };

    const [slide] = this.state.slides.splice(fromIndex, 1);
    this.state.slides.splice(toIndex, 0, slide);

    // Reorder all slides
    this.reorderSlides();

    // Update active slide index if needed
    if (this.state.activeSlideIndex === fromIndex) {
      this.state.activeSlideIndex = toIndex;
    } else if (
      fromIndex < this.state.activeSlideIndex &&
      toIndex >= this.state.activeSlideIndex
    ) {
      this.state.activeSlideIndex--;
    } else if (
      fromIndex > this.state.activeSlideIndex &&
      toIndex <= this.state.activeSlideIndex
    ) {
      this.state.activeSlideIndex++;
    }

    const after: Partial<PresentationState> = {
      slides: [...this.state.slides]
    };

    this.recordHistory('reorder', before, after);
  }

  /**
   * Handle drag and drop
   */
  handleDragDrop(event: DragDropEvent): void {
    const { sourceIndex, targetIndex, position } = event;

    // Calculate final position based on before/after
    let finalIndex = targetIndex;
    if (position === 'after') {
      finalIndex = sourceIndex < targetIndex ? targetIndex : targetIndex + 1;
    } else {
      finalIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
    }

    this.moveSlide(sourceIndex, finalIndex);
  }

  /**
   * Reorder slides (update order property)
   */
  private reorderSlides(): void {
    this.state.slides.forEach((slide, index) => {
      slide.order = index;
    });
  }

  /**
   * Undo last action
   */
  undo(): boolean {
    if (!this.canUndo()) return false;

    const entry = this.state.history[this.state.historyIndex];
    this.applyState(entry.before);
    this.state.historyIndex--;

    return true;
  }

  /**
   * Redo last undone action
   */
  redo(): boolean {
    if (!this.canRedo()) return false;

    this.state.historyIndex++;
    const entry = this.state.history[this.state.historyIndex];
    this.applyState(entry.after);

    return true;
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.state.historyIndex >= 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.state.historyIndex < this.state.history.length - 1;
  }

  /**
   * Apply state (for undo/redo)
   */
  private applyState(partialState: Partial<PresentationState>): void {
    if (partialState.slides) {
      this.state.slides = [...partialState.slides];
    }
    if (partialState.activeSlideIndex !== undefined) {
      this.state.activeSlideIndex = partialState.activeSlideIndex;
    }
  }

  /**
   * Record history entry
   */
  private recordHistory(
    action: HistoryEntry['action'],
    before: Partial<PresentationState>,
    after: Partial<PresentationState>
  ): void {
    // Remove future history if we branched
    if (this.state.historyIndex < this.state.history.length - 1) {
      this.state.history = this.state.history.slice(0, this.state.historyIndex + 1);
    }

    // Add new history entry
    this.state.history.push({
      action,
      timestamp: new Date(),
      before,
      after
    });

    this.state.historyIndex++;

    // Limit history size
    if (this.state.history.length > this.maxHistorySize) {
      this.state.history.shift();
      this.state.historyIndex--;
    }
  }

  /**
   * Copy slide to clipboard
   */
  copySlide(slideIndex: number): SlideData {
    const slide = this.state.slides[slideIndex];
    if (!slide) {
      throw new Error(`Slide at index ${slideIndex} not found`);
    }

    // Return deep copy (for clipboard)
    return JSON.parse(JSON.stringify(slide));
  }

  /**
   * Paste slide from clipboard
   */
  pasteSlide(slideData: SlideData, position?: number): void {
    const newSlide: SlideData = {
      ...slideData,
      id: this.generateId(),
      metadata: {
        ...slideData.metadata,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };

    this.addSlide(newSlide, position);
  }

  /**
   * Get slide by index
   */
  getSlide(index: number): SlideData | undefined {
    return this.state.slides[index];
  }

  /**
   * Get slide by ID
   */
  getSlideById(id: string): SlideData | undefined {
    return this.state.slides.find(s => s.id === id);
  }

  /**
   * Get all slides
   */
  getAllSlides(): SlideData[] {
    return [...this.state.slides];
  }

  /**
   * Get slide count
   */
  getSlideCount(): number {
    return this.state.slides.length;
  }

  /**
   * Get active slide
   */
  getActiveSlide(): SlideData | undefined {
    return this.state.slides[this.state.activeSlideIndex];
  }

  /**
   * Set active slide
   */
  setActiveSlide(index: number): void {
    if (index >= 0 && index < this.state.slides.length) {
      this.state.activeSlideIndex = index;
    }
  }

  /**
   * Get active slide index
   */
  getActiveSlideIndex(): number {
    return this.state.activeSlideIndex;
  }

  /**
   * Update slide content
   */
  updateSlide(index: number, updates: Partial<SlideData>): void {
    const slide = this.state.slides[index];
    if (!slide) {
      throw new Error(`Slide at index ${index} not found`);
    }

    const before: Partial<PresentationState> = {
      slides: [...this.state.slides]
    };

    Object.assign(slide, updates);
    slide.metadata.updatedAt = new Date();

    const after: Partial<PresentationState> = {
      slides: [...this.state.slides]
    };

    this.recordHistory('update', before, after);
  }

  /**
   * Bulk reorder slides
   */
  bulkReorder(newOrder: number[]): void {
    if (newOrder.length !== this.state.slides.length) {
      throw new Error('New order must include all slides');
    }

    const before: Partial<PresentationState> = {
      slides: [...this.state.slides]
    };

    const reorderedSlides = newOrder.map(index => this.state.slides[index]);
    this.state.slides = reorderedSlides;
    this.reorderSlides();

    const after: Partial<PresentationState> = {
      slides: [...this.state.slides]
    };

    this.recordHistory('reorder', before, after);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `slide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Export presentation state
   */
  exportState(): PresentationState {
    return JSON.parse(JSON.stringify(this.state));
  }

  /**
   * Import presentation state
   */
  importState(state: PresentationState): void {
    this.state = JSON.parse(JSON.stringify(state));
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.state.history = [];
    this.state.historyIndex = -1;
  }

  /**
   * Get history
   */
  getHistory(): HistoryEntry[] {
    return [...this.state.history];
  }

  /**
   * Search slides by content
   */
  searchSlides(query: string): SlideData[] {
    const lowerQuery = query.toLowerCase();

    return this.state.slides.filter(slide => {
      const searchText = [
        slide.content.title,
        slide.content.subtitle,
        slide.content.body,
        ...(slide.content.bullets || []),
        ...(slide.metadata.tags || [])
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchText.includes(lowerQuery);
    });
  }

  /**
   * Filter slides by tag
   */
  filterByTag(tag: string): SlideData[] {
    return this.state.slides.filter(slide =>
      slide.metadata.tags?.includes(tag)
    );
  }

  /**
   * Get all unique tags
   */
  getAllTags(): string[] {
    const tags = new Set<string>();

    this.state.slides.forEach(slide => {
      slide.metadata.tags?.forEach(tag => tags.add(tag));
    });

    return Array.from(tags).sort();
  }
}

// Singleton instance helper
let globalSlideManager: SlideManager | null = null;

export function getGlobalSlideManager(): SlideManager {
  if (!globalSlideManager) {
    globalSlideManager = new SlideManager();
  }
  return globalSlideManager;
}

export function setGlobalSlideManager(manager: SlideManager): void {
  globalSlideManager = manager;
}
