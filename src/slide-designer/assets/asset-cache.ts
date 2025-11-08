/**
 * Asset Cache - Local Caching and Optimization System
 * Manages caching, optimization, and CDN integration for assets
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export interface CacheEntry<T> {
  key: string;
  data: T;
  timestamp: number;
  expiresAt: number;
  size?: number;
  metadata?: Record<string, any>;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Max cache size in bytes
  persistToDisk?: boolean;
  cacheDir?: string;
}

export interface AssetOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export class AssetCache {
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private cacheDir: string;
  private defaultTTL: number;
  private maxSize: number;
  private currentSize: number = 0;
  private persistToDisk: boolean;

  constructor(options: CacheOptions = {}) {
    this.defaultTTL = options.ttl || 3600000; // 1 hour default
    this.maxSize = options.maxSize || 100 * 1024 * 1024; // 100MB default
    this.persistToDisk = options.persistToDisk ?? true;
    this.cacheDir = options.cacheDir || path.join(process.cwd(), '.cache', 'assets');

    if (this.persistToDisk) {
      this.ensureCacheDir();
    }
  }

  /**
   * Set cache entry
   */
  async set<T>(key: string, data: T, options?: { ttl?: number; metadata?: Record<string, any> }): Promise<void> {
    const ttl = options?.ttl || this.defaultTTL;
    const entry: CacheEntry<T> = {
      key,
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
      metadata: options?.metadata,
    };

    // Calculate size if data is a buffer or string
    if (Buffer.isBuffer(data)) {
      entry.size = data.length;
    } else if (typeof data === 'string') {
      entry.size = Buffer.byteLength(data);
    } else {
      entry.size = Buffer.byteLength(JSON.stringify(data));
    }

    // Check if we need to evict entries
    if (this.currentSize + (entry.size || 0) > this.maxSize) {
      await this.evictOldest();
    }

    // Store in memory
    this.memoryCache.set(key, entry);
    this.currentSize += entry.size || 0;

    // Persist to disk if enabled
    if (this.persistToDisk) {
      await this.persistEntry(entry);
    }
  }

  /**
   * Get cache entry
   */
  async get<T>(key: string): Promise<T | null> {
    // Check memory cache first
    let entry = this.memoryCache.get(key);

    // Check if expired
    if (entry && entry.expiresAt < Date.now()) {
      await this.delete(key);
      return null;
    }

    // If not in memory, try disk
    if (!entry && this.persistToDisk) {
      entry = await this.loadFromDisk<T>(key);
    }

    return entry ? entry.data : null;
  }

  /**
   * Check if key exists and is valid
   */
  async has(key: string): Promise<boolean> {
    const data = await this.get(key);
    return data !== null;
  }

  /**
   * Delete cache entry
   */
  async delete(key: string): Promise<void> {
    const entry = this.memoryCache.get(key);
    if (entry) {
      this.currentSize -= entry.size || 0;
      this.memoryCache.delete(key);
    }

    if (this.persistToDisk) {
      const filePath = this.getCacheFilePath(key);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.memoryCache.clear();
    this.currentSize = 0;

    if (this.persistToDisk && fs.existsSync(this.cacheDir)) {
      const files = fs.readdirSync(this.cacheDir);
      for (const file of files) {
        fs.unlinkSync(path.join(this.cacheDir, file));
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      entries: this.memoryCache.size,
      size: this.currentSize,
      maxSize: this.maxSize,
      utilizationPercent: (this.currentSize / this.maxSize) * 100,
    };
  }

  /**
   * Cache an image with optimization
   */
  async cacheImage(
    url: string,
    imageBuffer: Buffer,
    options?: AssetOptimizationOptions
  ): Promise<string> {
    const key = this.generateKey(url);

    // Store original
    await this.set(key, imageBuffer, {
      metadata: {
        url,
        type: 'image',
        optimized: false,
      },
    });

    // TODO: Implement actual image optimization with sharp or similar
    // For now, just store the buffer
    const optimizedKey = `${key}-optimized`;
    await this.set(optimizedKey, imageBuffer, {
      metadata: {
        url,
        type: 'image',
        optimized: true,
        options,
      },
    });

    return optimizedKey;
  }

  /**
   * Get cached image
   */
  async getCachedImage(url: string, optimized: boolean = true): Promise<Buffer | null> {
    const key = this.generateKey(url);
    const cacheKey = optimized ? `${key}-optimized` : key;
    return await this.get<Buffer>(cacheKey);
  }

  /**
   * Generate CDN URL for asset
   */
  getCDNUrl(assetKey: string, cdnBase?: string): string {
    const base = cdnBase || process.env.CDN_BASE_URL || '';
    if (!base) return assetKey;

    return `${base}/${assetKey}`;
  }

  /**
   * Generate cache key from input
   */
  private generateKey(input: string): string {
    return crypto.createHash('md5').update(input).digest('hex');
  }

  /**
   * Ensure cache directory exists
   */
  private ensureCacheDir(): void {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * Get cache file path
   */
  private getCacheFilePath(key: string): string {
    return path.join(this.cacheDir, `${key}.cache`);
  }

  /**
   * Persist entry to disk
   */
  private async persistEntry(entry: CacheEntry<any>): Promise<void> {
    try {
      const filePath = this.getCacheFilePath(entry.key);
      const data = JSON.stringify(entry);
      fs.writeFileSync(filePath, data);
    } catch (error) {
      console.error('Failed to persist cache entry:', error);
    }
  }

  /**
   * Load entry from disk
   */
  private async loadFromDisk<T>(key: string): Promise<CacheEntry<T> | null> {
    try {
      const filePath = this.getCacheFilePath(key);
      if (!fs.existsSync(filePath)) {
        return null;
      }

      const data = fs.readFileSync(filePath, 'utf-8');
      const entry: CacheEntry<T> = JSON.parse(data);

      // Check if expired
      if (entry.expiresAt < Date.now()) {
        fs.unlinkSync(filePath);
        return null;
      }

      // Load into memory cache
      this.memoryCache.set(key, entry);
      this.currentSize += entry.size || 0;

      return entry;
    } catch (error) {
      console.error('Failed to load cache entry from disk:', error);
      return null;
    }
  }

  /**
   * Evict oldest entries to make room
   */
  private async evictOldest(): Promise<void> {
    const entries = Array.from(this.memoryCache.entries())
      .map(([key, entry]) => ({ key, entry }))
      .sort((a, b) => a.entry.timestamp - b.entry.timestamp);

    // Evict until we have 20% free space
    const targetSize = this.maxSize * 0.8;
    for (const { key } of entries) {
      if (this.currentSize <= targetSize) break;
      await this.delete(key);
    }
  }

  /**
   * Clean expired entries
   */
  async cleanExpired(): Promise<number> {
    let cleaned = 0;
    const now = Date.now();

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.expiresAt < now) {
        await this.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }
}

export default AssetCache;
