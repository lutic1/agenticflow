/**
 * Version History (P1.10)
 * Git-style version control for presentations
 * Snapshots, diffs, restore, branching
 */

export interface Version {
  id: string;
  timestamp: Date;
  message: string;
  author: string;
  snapshot: PresentationSnapshot;
  parent?: string; // Parent version ID
  tags?: string[];
  metadata?: {
    slideCount: number;
    changedSlides: number[];
    addedSlides: number[];
    deletedSlides: number[];
  };
}

export interface PresentationSnapshot {
  slides: any[]; // Full slide data
  settings: any; // Presentation settings
  metadata: {
    title: string;
    createdAt: Date;
    lastModified: Date;
  };
}

export interface VersionDiff {
  added: any[];
  modified: any[];
  deleted: any[];
  unchanged: any[];
}

export interface RestoreOptions {
  keepCurrent?: boolean; // Create new version before restoring
  message?: string;
}

/**
 * Version History Manager
 * Git-style version control for presentations
 */
export class VersionHistoryManager {
  private versions: Map<string, Version>;
  private currentVersion: string | null = null;
  private maxVersions: number = 100;
  private autosaveEnabled: boolean = false;
  private autosaveInterval: number = 300000; // 5 minutes
  private autosaveTimer: any = null;

  constructor() {
    this.versions = new Map();
  }

  /**
   * Create a new version (snapshot)
   */
  createVersion(
    snapshot: PresentationSnapshot,
    message: string,
    author: string = 'User'
  ): Version {
    const parentVersion = this.currentVersion ? this.versions.get(this.currentVersion) : undefined;

    // Calculate changes from parent
    const metadata = parentVersion
      ? this.calculateChanges(parentVersion.snapshot, snapshot)
      : {
          slideCount: snapshot.slides.length,
          changedSlides: [],
          addedSlides: Array.from({ length: snapshot.slides.length }, (_, i) => i),
          deletedSlides: []
        };

    const version: Version = {
      id: this.generateId(),
      timestamp: new Date(),
      message,
      author,
      snapshot: this.deepCopy(snapshot),
      parent: this.currentVersion || undefined,
      metadata
    };

    this.versions.set(version.id, version);
    this.currentVersion = version.id;

    // Cleanup old versions if limit exceeded
    this.cleanupOldVersions();

    return version;
  }

  /**
   * Calculate changes between two snapshots
   */
  private calculateChanges(
    oldSnapshot: PresentationSnapshot,
    newSnapshot: PresentationSnapshot
  ): Version['metadata'] {
    const changedSlides: number[] = [];
    const addedSlides: number[] = [];
    const deletedSlides: number[] = [];

    // Find added and changed slides
    newSnapshot.slides.forEach((slide, index) => {
      if (index >= oldSnapshot.slides.length) {
        addedSlides.push(index);
      } else if (JSON.stringify(slide) !== JSON.stringify(oldSnapshot.slides[index])) {
        changedSlides.push(index);
      }
    });

    // Find deleted slides
    if (oldSnapshot.slides.length > newSnapshot.slides.length) {
      for (let i = newSnapshot.slides.length; i < oldSnapshot.slides.length; i++) {
        deletedSlides.push(i);
      }
    }

    return {
      slideCount: newSnapshot.slides.length,
      changedSlides,
      addedSlides,
      deletedSlides
    };
  }

  /**
   * Get version by ID
   */
  getVersion(versionId: string): Version | undefined {
    return this.versions.get(versionId);
  }

  /**
   * Get all versions (chronological)
   */
  getAllVersions(): Version[] {
    return Array.from(this.versions.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  /**
   * Get version history (linear chain from current to root)
   */
  getVersionHistory(): Version[] {
    const history: Version[] = [];
    let currentId = this.currentVersion;

    while (currentId) {
      const version = this.versions.get(currentId);
      if (!version) break;

      history.push(version);
      currentId = version.parent || null;
    }

    return history;
  }

  /**
   * Restore to specific version
   */
  restore(versionId: string, options: RestoreOptions = {}): PresentationSnapshot | null {
    const version = this.versions.get(versionId);
    if (!version) return null;

    // Optionally save current state before restoring
    if (options.keepCurrent && this.currentVersion) {
      const current = this.versions.get(this.currentVersion);
      if (current) {
        this.createVersion(
          current.snapshot,
          options.message || 'Saved before restore',
          current.author
        );
      }
    }

    // Set as current version
    this.currentVersion = versionId;

    return this.deepCopy(version.snapshot);
  }

  /**
   * Get diff between two versions
   */
  diff(fromVersionId: string, toVersionId: string): VersionDiff {
    const fromVersion = this.versions.get(fromVersionId);
    const toVersion = this.versions.get(toVersionId);

    if (!fromVersion || !toVersion) {
      return { added: [], modified: [], deleted: [], unchanged: [] };
    }

    const fromSlides = fromVersion.snapshot.slides;
    const toSlides = toVersion.snapshot.slides;

    const added: any[] = [];
    const modified: any[] = [];
    const deleted: any[] = [];
    const unchanged: any[] = [];

    // Check for changes and additions
    toSlides.forEach((slide, index) => {
      if (index >= fromSlides.length) {
        added.push({ index, slide });
      } else if (JSON.stringify(slide) !== JSON.stringify(fromSlides[index])) {
        modified.push({
          index,
          before: fromSlides[index],
          after: slide
        });
      } else {
        unchanged.push({ index, slide });
      }
    });

    // Check for deletions
    if (fromSlides.length > toSlides.length) {
      for (let i = toSlides.length; i < fromSlides.length; i++) {
        deleted.push({ index: i, slide: fromSlides[i] });
      }
    }

    return { added, modified, deleted, unchanged };
  }

  /**
   * Tag a version
   */
  tagVersion(versionId: string, tag: string): boolean {
    const version = this.versions.get(versionId);
    if (!version) return false;

    if (!version.tags) {
      version.tags = [];
    }

    if (!version.tags.includes(tag)) {
      version.tags.push(tag);
    }

    return true;
  }

  /**
   * Get versions by tag
   */
  getVersionsByTag(tag: string): Version[] {
    return this.getAllVersions().filter(v => v.tags?.includes(tag));
  }

  /**
   * Delete a version
   */
  deleteVersion(versionId: string): boolean {
    // Don't delete if it's the current version or has children
    if (versionId === this.currentVersion) return false;

    const hasChildren = Array.from(this.versions.values()).some(
      v => v.parent === versionId
    );

    if (hasChildren) return false;

    return this.versions.delete(versionId);
  }

  /**
   * Clean up old versions (keep most recent maxVersions)
   */
  private cleanupOldVersions(): void {
    const versions = this.getAllVersions();

    if (versions.length <= this.maxVersions) return;

    // Keep tagged versions and recent versions
    const toDelete = versions
      .filter(v => !v.tags || v.tags.length === 0)
      .slice(this.maxVersions);

    toDelete.forEach(v => {
      // Only delete if no children
      const hasChildren = Array.from(this.versions.values()).some(
        ver => ver.parent === v.id
      );
      if (!hasChildren) {
        this.versions.delete(v.id);
      }
    });
  }

  /**
   * Enable autosave
   */
  enableAutosave(snapshot: () => PresentationSnapshot, interval?: number): void {
    this.autosaveEnabled = true;
    if (interval) {
      this.autosaveInterval = interval;
    }

    this.autosaveTimer = setInterval(() => {
      try {
        const currentSnapshot = snapshot();
        this.createVersion(currentSnapshot, 'Autosave', 'System');
      } catch (error) {
        console.error('Autosave failed:', error);
      }
    }, this.autosaveInterval);
  }

  /**
   * Disable autosave
   */
  disableAutosave(): void {
    this.autosaveEnabled = false;
    if (this.autosaveTimer) {
      clearInterval(this.autosaveTimer);
      this.autosaveTimer = null;
    }
  }

  /**
   * Export version history
   */
  export(): string {
    return JSON.stringify({
      versions: Array.from(this.versions.entries()),
      currentVersion: this.currentVersion
    }, null, 2);
  }

  /**
   * Import version history
   */
  import(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      this.versions.clear();

      data.versions.forEach(([id, version]: [string, any]) => {
        this.versions.set(id, {
          ...version,
          timestamp: new Date(version.timestamp)
        });
      });

      this.currentVersion = data.currentVersion;
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get version timeline
   */
  getTimeline(): Array<{
    date: string;
    versions: Version[];
  }> {
    const timeline: Map<string, Version[]> = new Map();

    this.getAllVersions().forEach(version => {
      const dateKey = version.timestamp.toISOString().split('T')[0];
      if (!timeline.has(dateKey)) {
        timeline.set(dateKey, []);
      }
      timeline.get(dateKey)!.push(version);
    });

    return Array.from(timeline.entries())
      .map(([date, versions]) => ({ date, versions }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  /**
   * Search versions
   */
  searchVersions(query: string): Version[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllVersions().filter(
      v =>
        v.message.toLowerCase().includes(lowerQuery) ||
        v.author.toLowerCase().includes(lowerQuery) ||
        v.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalVersions: number;
    totalAuthors: number;
    averageChangesPerVersion: number;
    oldestVersion: Date | null;
    newestVersion: Date | null;
  } {
    const versions = this.getAllVersions();

    const authors = new Set(versions.map(v => v.author));

    const totalChanges = versions.reduce((sum, v) => {
      return sum + (v.metadata?.changedSlides.length || 0) +
        (v.metadata?.addedSlides.length || 0) +
        (v.metadata?.deletedSlides.length || 0);
    }, 0);

    return {
      totalVersions: versions.length,
      totalAuthors: authors.size,
      averageChangesPerVersion: versions.length > 0 ? totalChanges / versions.length : 0,
      oldestVersion: versions.length > 0 ? versions[versions.length - 1].timestamp : null,
      newestVersion: versions.length > 0 ? versions[0].timestamp : null
    };
  }

  /**
   * Deep copy object
   */
  private deepCopy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `v-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get version count
   */
  getCount(): number {
    return this.versions.size;
  }

  /**
   * Get current version ID
   */
  getCurrentVersionId(): string | null {
    return this.currentVersion;
  }

  /**
   * Clear all versions
   */
  clearAll(): void {
    this.disableAutosave();
    this.versions.clear();
    this.currentVersion = null;
  }
}

// Singleton instance
export const versionHistory = new VersionHistoryManager();
