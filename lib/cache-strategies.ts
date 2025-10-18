/**
 * Comprehensive caching strategies for performance optimization
 * Implements client-side cache management, API response caching, and cache invalidation
 */

import { logger } from './logging';

// Cache configuration types
export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of entries
  strategy: 'lru' | 'fifo' | 'lfu'; // Cache eviction strategy
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  maxSize: number;
  hitRate: number;
}

// Default cache configurations for different data types
export const CACHE_CONFIGS = {
  airtable: {
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 100,
    strategy: 'lru' as const
  },
  metadata: {
    ttl: 15 * 60 * 1000, // 15 minutes
    maxSize: 50,
    strategy: 'lru' as const
  },
  images: {
    ttl: 60 * 60 * 1000, // 1 hour
    maxSize: 200,
    strategy: 'lfu' as const
  },
  static: {
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    maxSize: 50,
    strategy: 'fifo' as const
  }
} as const;

/**
 * Advanced in-memory cache with multiple eviction strategies
 */
export class AdvancedCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private stats = {
    hits: 0,
    misses: 0,
    size: 0,
    maxSize: 0,
    hitRate: 0
  };

  constructor(private config: CacheConfig) {
    this.stats.maxSize = config.maxSize;
  }

  /**
   * Get item from cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.size--;
      this.updateHitRate();
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.stats.hits++;
    this.updateHitRate();

    return entry.data;
  }

  /**
   * Set item in cache
   */
  set(key: string, data: T, customTtl?: number): void {
    const ttl = customTtl || this.config.ttl;
    const now = Date.now();

    // If cache is full, evict based on strategy
    if (this.cache.size >= this.config.maxSize && !this.cache.has(key)) {
      this.evict();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      ttl,
      accessCount: 1,
      lastAccessed: now
    };

    const wasNew = !this.cache.has(key);
    this.cache.set(key, entry);

    if (wasNew) {
      this.stats.size++;
    }
  }

  /**
   * Delete item from cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.size--;
    }
    return deleted;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.stats.size = 0;
    this.stats.hits = 0;
    this.stats.misses = 0;
    this.stats.hitRate = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Evict entries based on configured strategy
   */
  private evict(): void {
    if (this.cache.size === 0) return;

    let keyToEvict: string;

    switch (this.config.strategy) {
      case 'lru': // Least Recently Used
        keyToEvict = this.findLRU();
        break;
      case 'lfu': // Least Frequently Used
        keyToEvict = this.findLFU();
        break;
      case 'fifo': // First In, First Out
        keyToEvict = this.findFIFO();
        break;
      default:
        const firstKey = this.cache.keys().next().value;
        keyToEvict = firstKey || '';
    }

    if (keyToEvict) {
      this.cache.delete(keyToEvict);
      this.stats.size--;
    }
  }

  private findLRU(): string {
    if (this.cache.size === 0) return '';

    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  private findLFU(): string {
    if (this.cache.size === 0) return '';

    let leastUsedKey = '';
    let leastCount = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.accessCount < leastCount) {
        leastCount = entry.accessCount;
        leastUsedKey = key;
      }
    }

    return leastUsedKey;
  }

  private findFIFO(): string {
    if (this.cache.size === 0) return '';

    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        this.stats.size--;
        cleaned++;
      }
    }

    return cleaned;
  }
}

/**
 * Cache manager for different data types
 */
export class CacheManager {
  private caches = new Map<string, AdvancedCache<any>>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Initialize caches for different data types
    for (const [type, config] of Object.entries(CACHE_CONFIGS)) {
      this.caches.set(type, new AdvancedCache(config));
    }

    // Start cleanup interval
    this.startCleanup();
  }

  /**
   * Get cache for specific type
   */
  getCache<T>(type: keyof typeof CACHE_CONFIGS): AdvancedCache<T> {
    const cache = this.caches.get(type);
    if (!cache) {
      throw new Error(`Cache type '${type}' not found`);
    }
    return cache;
  }

  /**
   * Get item from specific cache
   */
  get<T>(type: keyof typeof CACHE_CONFIGS, key: string): T | null {
    return this.getCache<T>(type).get(key);
  }

  /**
   * Set item in specific cache
   */
  set<T>(type: keyof typeof CACHE_CONFIGS, key: string, data: T, customTtl?: number): void {
    this.getCache<T>(type).set(key, data, customTtl);
  }

  /**
   * Delete item from specific cache
   */
  delete(type: keyof typeof CACHE_CONFIGS, key: string): boolean {
    return this.getCache(type).delete(key);
  }

  /**
   * Clear specific cache
   */
  clearCache(type: keyof typeof CACHE_CONFIGS): void {
    this.getCache(type).clear();
  }

  /**
   * Clear all caches
   */
  clearAll(): void {
    for (const cache of this.caches.values()) {
      cache.clear();
    }
  }

  /**
   * Get statistics for all caches
   */
  getAllStats(): Record<string, CacheStats> {
    const stats: Record<string, CacheStats> = {};
    for (const [type, cache] of this.caches.entries()) {
      stats[type] = cache.getStats();
    }
    return stats;
  }

  /**
   * Start periodic cleanup of expired entries
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      let totalCleaned = 0;
      for (const [type, cache] of this.caches.entries()) {
        const cleaned = cache.cleanup();
        if (cleaned > 0) {
          logger.debug('CACHE_CLEANUP', `Cleaned ${cleaned} expired entries from ${type} cache`);
          totalCleaned += cleaned;
        }
      }

      if (totalCleaned > 0) {
        logger.info('CACHE_CLEANUP', `Total cleaned entries: ${totalCleaned}`);
      }
    }, 60000); // Run every minute
  }

  /**
   * Stop cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Global cache manager instance
export const cacheManager = new CacheManager();

/**
 * Cache invalidation strategies
 */
export class CacheInvalidation {
  /**
   * Invalidate cache entries by pattern
   */
  static invalidateByPattern(pattern: string): void {
    const regex = new RegExp(pattern);

    for (const cacheType of Object.keys(CACHE_CONFIGS)) {
      const cache = cacheManager.getCache(cacheType as keyof typeof CACHE_CONFIGS);
      const keysToDelete: string[] = [];

      // Find keys matching pattern
      for (const [key] of (cache as any).cache.entries()) {
        if (regex.test(key)) {
          keysToDelete.push(key);
        }
      }

      // Delete matching keys
      for (const key of keysToDelete) {
        cache.delete(key);
      }

      if (keysToDelete.length > 0) {
        logger.info('CACHE_INVALIDATION', `Invalidated ${keysToDelete.length} entries matching pattern: ${pattern}`);
      }
    }
  }

  /**
   * Invalidate cache entries by tags
   */
  static invalidateByTags(tags: string[]): void {
    for (const tag of tags) {
      this.invalidateByPattern(`.*${tag}.*`);
    }
  }

  /**
   * Invalidate all Airtable data caches
   */
  static invalidateAirtableData(): void {
    cacheManager.clearCache('airtable');
    logger.info('CACHE_INVALIDATION', 'Invalidated all Airtable data caches');
  }

  /**
   * Invalidate metadata caches
   */
  static invalidateMetadata(): void {
    cacheManager.clearCache('metadata');
    logger.info('CACHE_INVALIDATION', 'Invalidated all metadata caches');
  }

  /**
   * Smart invalidation based on content type
   */
  static invalidateByContentType(contentType: string): void {
    this.invalidateByPattern(`${contentType}.*`);
    this.invalidateByPattern(`.*/${contentType}/.*`);
    logger.info('CACHE_INVALIDATION', `Invalidated caches for content type: ${contentType}`);
  }
}

/**
 * HTTP cache headers utility
 */
export class HTTPCacheHeaders {
  /**
   * Generate cache headers for API responses
   */
  static generateHeaders(options: {
    maxAge?: number;
    staleWhileRevalidate?: number;
    mustRevalidate?: boolean;
    noCache?: boolean;
    private?: boolean;
  }): Record<string, string> {
    const {
      maxAge = 300, // 5 minutes default
      staleWhileRevalidate = 60,
      mustRevalidate = false,
      noCache = false,
      private: isPrivate = false
    } = options;

    const headers: Record<string, string> = {};

    if (noCache) {
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      headers['Pragma'] = 'no-cache';
      headers['Expires'] = '0';
    } else {
      const cacheDirectives = [
        isPrivate ? 'private' : 'public',
        `max-age=${maxAge}`,
        `stale-while-revalidate=${staleWhileRevalidate}`
      ];

      if (mustRevalidate) {
        cacheDirectives.push('must-revalidate');
      }

      headers['Cache-Control'] = cacheDirectives.join(', ');
    }

    // Add ETag for better cache validation
    headers['ETag'] = `"${Date.now()}"`;

    return headers;
  }

  /**
   * Generate headers for static content
   */
  static staticContentHeaders(): Record<string, string> {
    return this.generateHeaders({
      maxAge: 31536000, // 1 year
      mustRevalidate: false,
      private: false
    });
  }

  /**
   * Generate headers for dynamic content
   */
  static dynamicContentHeaders(): Record<string, string> {
    return this.generateHeaders({
      maxAge: 300, // 5 minutes
      staleWhileRevalidate: 60,
      mustRevalidate: true,
      private: false
    });
  }

  /**
   * Generate headers for user-specific content
   */
  static privateContentHeaders(): Record<string, string> {
    return this.generateHeaders({
      maxAge: 0,
      noCache: true,
      private: true
    });
  }
}

// Export convenience functions
export const cache = {
  get: <T>(type: keyof typeof CACHE_CONFIGS, key: string) => cacheManager.get<T>(type, key),
  set: <T>(type: keyof typeof CACHE_CONFIGS, key: string, data: T, ttl?: number) =>
    cacheManager.set(type, key, data, ttl),
  delete: (type: keyof typeof CACHE_CONFIGS, key: string) => cacheManager.delete(type, key),
  clear: (type: keyof typeof CACHE_CONFIGS) => cacheManager.clearCache(type),
  stats: () => cacheManager.getAllStats(),
  invalidate: CacheInvalidation,
  headers: HTTPCacheHeaders
};