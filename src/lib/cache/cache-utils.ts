/**
 * Client-side cache utilities for session-based caching with TTL and LRU eviction.
 * Updated to work with the new API routes architecture.
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number; // ms timestamp when expires
  used: number; // usage counter for naive LRU
}

export interface CacheOptions {
  ttl?: number; // ms
  maxSize?: number; // max entries
}

class SessionCache {
  private store = new Map<string, CacheEntry<any>>();
  private lastAccesses = new Map<string, number>();
  private ttl: number;
  private maxSize: number;

  constructor({ ttl = 1000 * 60 * 5, maxSize = 200 }: CacheOptions = {}) {
    this.ttl = ttl;
    this.maxSize = maxSize;
  }

  set<T>(key: string, data: T, ttl: number = this.ttl) {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiry: now + ttl,
      used: 0,
    };
    this.store.set(key, entry);
    this.lastAccesses.set(key, now);
    this.trim();
  }

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return undefined;
    if (Date.now() > entry.expiry) {
      this.store.delete(key);
      this.lastAccesses.delete(key);
      return undefined;
    }
    // keep usage counter for backwards compatibility, but use lastAccesses for LRU
    entry.used++;
    this.lastAccesses.set(key, Date.now());
    return entry.data;
  }

  // Return possibly expired entry without touching LRU; for stale-on-error
  getStale<T>(key: string): T | undefined {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return undefined;
    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiry) {
      this.store.delete(key);
      this.lastAccesses.delete(key);
      return false;
    }
    return true;
  }

  invalidate(pattern?: string) {
    if (!pattern) {
      this.store.clear();
      this.lastAccesses.clear();
      return;
    }
    try {
      const re = new RegExp(pattern);
      for (const k of Array.from(this.store.keys())) {
        if (re.test(k)) {
          this.store.delete(k);
          this.lastAccesses.delete(k);
        }
      }
    } catch (e) {
      console.error(`Invalid regex pattern: ${pattern}`, e);
    }
  }

  public stats() {
    // provide some insight into lastAccesses without exposing internals
    const lastAccessValues = Array.from(this.lastAccesses.values());
    const oldest = lastAccessValues.length
      ? Math.min(...lastAccessValues)
      : undefined;
    const newest = lastAccessValues.length
      ? Math.max(...lastAccessValues)
      : undefined;
    return {
      size: this.store.size,
      ttl: this.ttl,
      maxSize: this.maxSize,
      oldestLastAccess: oldest,
      newestLastAccess: newest,
    };
  }

  private trim() {
    if (this.store.size <= this.maxSize) return;
    // LRU by last access timestamp (oldest first)
    const entries = Array.from(this.lastAccesses.entries());
    entries.sort((a, b) => a[1] - b[1]);
    const removeCount = this.store.size - this.maxSize;
    const remove = entries.slice(0, removeCount);
    for (const [k] of remove) {
      this.store.delete(k);
      this.lastAccesses.delete(k);
    }
  }
}

export const sessionCache = new SessionCache();

// === API Specific Helpers ===

/**
 * Cache API response data with a specific key.
 */
export function cacheApiResponse<T>(key: string, data: T, ttl?: number) {
  sessionCache.set(`api:${key}`, data, ttl);
}

/**
 * Get cached API response data.
 */
export function getCachedResponse<T>(key: string): T | undefined {
  return sessionCache.get(`api:${key}`);
}

/**
 * Get potentially stale cached response (for error fallback).
 */
export function getStaleCachedResponse<T>(key: string): T | undefined {
  return sessionCache.getStale(`api:${key}`);
}

/**
 * Legacy aliases for backward compatibility.
 */
export function cacheAirtableRecord<T>(key: string, data: T, ttl?: number) {
  cacheApiResponse(key, data, ttl);
}

export function getCachedRecord<T>(key: string): T | undefined {
  return getCachedResponse(key);
}

export function getStaleCachedRecord<T>(key: string): T | undefined {
  return getStaleCachedResponse(key);
}

/**
 * Invalidate cached responses by pattern.
 */
export function invalidateCache(pattern?: string) {
  sessionCache.invalidate(pattern ? `api:${pattern}` : undefined);
}

/**
 * Get cache statistics.
 */
export function getCacheStats() {
  return sessionCache.stats();
}

// === Caching Strategies ===

/**
 * Cache-first strategy: Return cached data if available, otherwise fetch and cache.
 */
export async function cacheFirst<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cached = getCachedResponse<T>(key);
  if (cached !== undefined) return cached;
  const data = await fetcher();
  cacheApiResponse(key, data, ttl);
  return data;
}

/**
 * Network-first strategy: Try network first, fallback to cache on error.
 */
export async function networkFirst<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  try {
    const data = await fetcher();
    cacheApiResponse(key, data, ttl);
    return data;
  } catch (e) {
    const cached = getCachedResponse<T>(key);
    if (cached !== undefined) return cached;
    throw e;
  }
}

/**
 * Stale-while-revalidate strategy: Return cached data immediately, revalidate in background.
 */
export async function staleWhileRevalidate<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<{ data: T; revalidated: Promise<void> }> {
  const cached = getCachedResponse<T>(key);
  const revalidated = (async () => {
    try {
      const fresh = await fetcher();
      cacheApiResponse(key, fresh, ttl);
    } catch {
      // Silent fail for background revalidation
    }
  })();

  if (cached !== undefined) {
    return { data: cached, revalidated };
  }

  const fresh = await fetcher();
  cacheApiResponse(key, fresh, ttl);
  return { data: fresh, revalidated };
}
