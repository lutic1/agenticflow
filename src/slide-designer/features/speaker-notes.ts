/**
 * Speaker Notes UI (P1.3)
 * Presenter view with speaker notes and navigation
 * Dual-screen support, timer, slide preview
 */

export interface SpeakerNote {
  slideId: string;
  slideNumber: number;
  content: string;
  tips?: string[];
  duration?: number; // Suggested duration in seconds
  keyPoints?: string[];
}

export interface PresenterView {
  currentSlide: number;
  totalSlides: number;
  elapsedTime: number;
  notes: SpeakerNote | null;
  nextSlide?: {
    number: number;
    preview: string;
  };
}

export interface TimerSettings {
  totalDuration?: number; // Total presentation duration in seconds
  warningThreshold?: number; // Warn when X seconds remaining
  autoAdvance?: boolean;
}

/**
 * Speaker Notes Manager
 * Manage speaker notes for presentation delivery
 */
export class SpeakerNotesManager {
  private notes: Map<string, SpeakerNote>;
  private currentSlideIndex: number = 0;
  private startTime: Date | null = null;
  private timerSettings: TimerSettings = {};

  constructor() {
    this.notes = new Map();
  }

  /**
   * Add or update speaker note for slide
   */
  setNote(slideId: string, slideNumber: number, content: string, metadata?: {
    tips?: string[];
    duration?: number;
    keyPoints?: string[];
  }): void {
    this.notes.set(slideId, {
      slideId,
      slideNumber,
      content,
      tips: metadata?.tips,
      duration: metadata?.duration,
      keyPoints: metadata?.keyPoints
    });
  }

  /**
   * Get speaker note for slide
   */
  getNote(slideId: string): SpeakerNote | null {
    return this.notes.get(slideId) || null;
  }

  /**
   * Get note by slide number
   */
  getNoteBySlideNumber(slideNumber: number): SpeakerNote | null {
    for (const note of this.notes.values()) {
      if (note.slideNumber === slideNumber) {
        return note;
      }
    }
    return null;
  }

  /**
   * Delete speaker note
   */
  deleteNote(slideId: string): void {
    this.notes.delete(slideId);
  }

  /**
   * Get all notes
   */
  getAllNotes(): SpeakerNote[] {
    return Array.from(this.notes.values()).sort((a, b) => a.slideNumber - b.slideNumber);
  }

  /**
   * Start presentation timer
   */
  startTimer(settings?: TimerSettings): void {
    this.startTime = new Date();
    if (settings) {
      this.timerSettings = settings;
    }
  }

  /**
   * Reset timer
   */
  resetTimer(): void {
    this.startTime = null;
  }

  /**
   * Get elapsed time in seconds
   */
  getElapsedTime(): number {
    if (!this.startTime) return 0;
    return Math.floor((Date.now() - this.startTime.getTime()) / 1000);
  }

  /**
   * Get remaining time (if total duration set)
   */
  getRemainingTime(): number | null {
    if (!this.timerSettings.totalDuration) return null;
    return Math.max(0, this.timerSettings.totalDuration - this.getElapsedTime());
  }

  /**
   * Check if time warning should be shown
   */
  shouldShowWarning(): boolean {
    if (!this.timerSettings.warningThreshold) return false;
    const remaining = this.getRemainingTime();
    return remaining !== null && remaining <= this.timerSettings.warningThreshold;
  }

  /**
   * Format time as MM:SS
   */
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  /**
   * Generate presenter view HTML
   */
  generatePresenterView(
    currentSlideNumber: number,
    currentSlideHTML: string,
    nextSlideHTML?: string,
    totalSlides: number = 10
  ): string {
    const note = this.getNoteBySlideNumber(currentSlideNumber);
    const elapsed = this.getElapsedTime();
    const remaining = this.getRemainingTime();
    const showWarning = this.shouldShowWarning();

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Presenter View - Slide ${currentSlideNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #1a1a1a;
      color: #fff;
      overflow: hidden;
      height: 100vh;
    }

    .presenter-view {
      display: grid;
      grid-template-columns: 2fr 1fr;
      grid-template-rows: auto 1fr;
      gap: 16px;
      padding: 16px;
      height: 100vh;
    }

    /* Header with timer and controls */
    .header {
      grid-column: 1 / -1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #2a2a2a;
      padding: 16px 24px;
      border-radius: 8px;
    }

    .timer {
      display: flex;
      gap: 32px;
      align-items: center;
    }

    .timer-item {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .timer-label {
      font-size: 12px;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .timer-value {
      font-size: 32px;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
    }

    .timer-value.warning {
      color: #f59e0b;
      animation: pulse 1s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }

    .slide-progress {
      font-size: 24px;
      font-weight: 600;
    }

    .controls {
      display: flex;
      gap: 12px;
    }

    .btn {
      padding: 10px 20px;
      background: #4299e1;
      border: none;
      border-radius: 6px;
      color: white;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn:hover {
      background: #3182ce;
    }

    .btn-secondary {
      background: #4a5568;
    }

    .btn-secondary:hover {
      background: #2d3748;
    }

    /* Current slide preview */
    .current-slide {
      background: #2a2a2a;
      border-radius: 8px;
      padding: 16px;
      overflow: auto;
    }

    .current-slide h3 {
      margin-bottom: 12px;
      color: #999;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .slide-preview {
      background: white;
      border-radius: 4px;
      overflow: auto;
      max-height: calc(100vh - 200px);
    }

    /* Notes and next slide */
    .sidebar {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .notes-panel {
      background: #2a2a2a;
      border-radius: 8px;
      padding: 20px;
      overflow: auto;
      flex: 1;
    }

    .notes-panel h3 {
      margin-bottom: 16px;
      color: #999;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .notes-content {
      font-size: 16px;
      line-height: 1.6;
      color: #e5e5e5;
    }

    .notes-content p {
      margin-bottom: 12px;
    }

    .key-points {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #3a3a3a;
    }

    .key-points h4 {
      font-size: 14px;
      color: #4299e1;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .key-points ul {
      list-style: none;
    }

    .key-points li {
      padding: 8px 0;
      padding-left: 24px;
      position: relative;
      font-size: 14px;
      line-height: 1.5;
    }

    .key-points li:before {
      content: "→";
      position: absolute;
      left: 0;
      color: #4299e1;
      font-weight: bold;
    }

    .tips {
      margin-top: 16px;
      padding: 12px;
      background: #3a3a3a;
      border-radius: 4px;
      border-left: 3px solid #f59e0b;
    }

    .tips h4 {
      font-size: 12px;
      color: #f59e0b;
      margin-bottom: 8px;
      text-transform: uppercase;
    }

    .tips ul {
      list-style: none;
      font-size: 13px;
      line-height: 1.6;
    }

    .tips li {
      padding: 4px 0;
    }

    .next-slide-panel {
      background: #2a2a2a;
      border-radius: 8px;
      padding: 16px;
      max-height: 300px;
    }

    .next-slide-panel h3 {
      margin-bottom: 12px;
      color: #999;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .next-slide-preview {
      background: white;
      border-radius: 4px;
      overflow: auto;
      transform: scale(0.5);
      transform-origin: top left;
      width: 200%;
      height: 200%;
    }

    .no-notes {
      color: #666;
      font-style: italic;
      text-align: center;
      padding: 40px;
    }
  </style>
</head>
<body>
  <div class="presenter-view">
    <!-- Header -->
    <div class="header">
      <div class="timer">
        <div class="timer-item">
          <div class="timer-label">Elapsed</div>
          <div class="timer-value">${this.formatTime(elapsed)}</div>
        </div>
        ${remaining !== null ? `
        <div class="timer-item">
          <div class="timer-label">Remaining</div>
          <div class="timer-value ${showWarning ? 'warning' : ''}">${this.formatTime(remaining)}</div>
        </div>
        ` : ''}
      </div>

      <div class="slide-progress">
        ${currentSlideNumber} / ${totalSlides}
      </div>

      <div class="controls">
        <button class="btn btn-secondary" onclick="window.close()">End Presentation</button>
        <button class="btn" onclick="location.reload()">Refresh</button>
      </div>
    </div>

    <!-- Current Slide -->
    <div class="current-slide">
      <h3>Current Slide</h3>
      <div class="slide-preview">
        ${currentSlideHTML}
      </div>
    </div>

    <!-- Sidebar -->
    <div class="sidebar">
      <!-- Speaker Notes -->
      <div class="notes-panel">
        <h3>Speaker Notes</h3>
        ${note ? `
        <div class="notes-content">
          <p>${note.content}</p>

          ${note.keyPoints && note.keyPoints.length > 0 ? `
          <div class="key-points">
            <h4>Key Points</h4>
            <ul>
              ${note.keyPoints.map(point => `<li>${point}</li>`).join('')}
            </ul>
          </div>
          ` : ''}

          ${note.tips && note.tips.length > 0 ? `
          <div class="tips">
            <h4>💡 Tips</h4>
            <ul>
              ${note.tips.map(tip => `<li>${tip}</li>`).join('')}
            </ul>
          </div>
          ` : ''}

          ${note.duration ? `
          <div class="tips" style="border-color: #4299e1;">
            <h4 style="color: #4299e1;">⏱️ Suggested Duration</h4>
            <ul><li>${this.formatTime(note.duration)}</li></ul>
          </div>
          ` : ''}
        </div>
        ` : `
        <div class="no-notes">No speaker notes for this slide</div>
        `}
      </div>

      <!-- Next Slide -->
      ${nextSlideHTML ? `
      <div class="next-slide-panel">
        <h3>Next Slide</h3>
        <div class="next-slide-preview">
          ${nextSlideHTML}
        </div>
      </div>
      ` : ''}
    </div>
  </div>

  <script>
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        // Next slide - communicate with main window
        if (window.opener) {
          window.opener.postMessage({ action: 'nextSlide' }, '*');
        }
      } else if (e.key === 'ArrowLeft') {
        // Previous slide
        if (window.opener) {
          window.opener.postMessage({ action: 'prevSlide' }, '*');
        }
      } else if (e.key === 'Escape') {
        window.close();
      }
    });

    // Update timer every second
    setInterval(() => {
      location.reload();
    }, 1000);
  </script>
</body>
</html>
    `.trim();
  }

  /**
   * Open presenter view in new window
   */
  openPresenterWindow(presenterViewHTML: string): Window | null {
    const width = 1200;
    const height = 800;
    const left = window.screenX || 0;
    const top = window.screenY || 0;

    const presenterWindow = window.open(
      '',
      'PresenterView',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (presenterWindow) {
      presenterWindow.document.write(presenterViewHTML);
      presenterWindow.document.close();
    }

    return presenterWindow;
  }

  /**
   * Export notes to various formats
   */
  exportNotes(format: 'txt' | 'md' | 'json'): string {
    const notes = this.getAllNotes();

    switch (format) {
      case 'txt':
        return notes.map(note =>
          `Slide ${note.slideNumber}\n${'='.repeat(20)}\n${note.content}\n\n`
        ).join('');

      case 'md':
        return notes.map(note => {
          let md = `## Slide ${note.slideNumber}\n\n${note.content}\n\n`;
          if (note.keyPoints && note.keyPoints.length > 0) {
            md += `### Key Points\n${note.keyPoints.map(p => `- ${p}`).join('\n')}\n\n`;
          }
          if (note.tips && note.tips.length > 0) {
            md += `### Tips\n${note.tips.map(t => `💡 ${t}`).join('\n')}\n\n`;
          }
          return md;
        }).join('\n---\n\n');

      case 'json':
        return JSON.stringify(notes, null, 2);

      default:
        return '';
    }
  }

  /**
   * Import notes from JSON
   */
  importNotes(jsonData: string): boolean {
    try {
      const notes: SpeakerNote[] = JSON.parse(jsonData);
      notes.forEach(note => {
        this.notes.set(note.slideId, note);
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clear all notes
   */
  clearAllNotes(): void {
    this.notes.clear();
  }

  /**
   * Get notes count
   */
  getNotesCount(): number {
    return this.notes.size;
  }
}

// Singleton instance
export const speakerNotesManager = new SpeakerNotesManager();
