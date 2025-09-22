// Simple session cache with TTL and LRU-like eviction
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
        const entry: CacheEntry<T> = { data, timestamp: now, expiry: now + ttl, used: 0 };
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
        const oldest = lastAccessValues.length ? Math.min(...lastAccessValues) : undefined;
        const newest = lastAccessValues.length ? Math.max(...lastAccessValues) : undefined;
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

// API specific helpers
export function cacheAirtableRecord<T>(key: string, data: T, ttl?: number) {
  sessionCache.set(`airtable:${key}`, data, ttl);
}

export function getCachedRecord<T>(key: string): T | undefined {
  return sessionCache.get(`airtable:${key}`);
}

export function invalidateCache(pattern?: string) {
  sessionCache.invalidate(pattern ? `airtable:${pattern}` : undefined);
}

export function getCacheStats() {
  return sessionCache.stats();
}

// Strategies
export async function cacheFirst<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T> {
  const cached = getCachedRecord<T>(key);
  if (cached !== undefined) return cached;
  const data = await fetcher();
  cacheAirtableRecord(key, data, ttl);
  return data;
}

export async function networkFirst<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T> {
  try {
    const data = await fetcher();
    cacheAirtableRecord(key, data, ttl);
    return data;
  } catch (e) {
    const cached = getCachedRecord<T>(key);
    if (cached !== undefined) return cached;
    throw e;
  }
}

export async function staleWhileRevalidate<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<{ data: T; revalidated: Promise<void> }>{
  const cached = getCachedRecord<T>(key);
  const revalidated = (async () => {
    try {
      const fresh = await fetcher();
      cacheAirtableRecord(key, fresh, ttl);
    } catch {}
  })();
  if (cached !== undefined) {
    return { data: cached, revalidated };
  }
  const fresh = await fetcher();
  cacheAirtableRecord(key, fresh, ttl);
  return { data: fresh, revalidated };
}
