/**
 * Multilingual Cache Manager
 * 
 * Provides language-aware caching strategies to optimize API calls
 * and prevent redundant data fetching for multilingual content.
 */

import { Language } from "@/lib/multilingual-texts";
import { AdvancedCache } from "./cache-strategies";
import { CONTENT_TYPE_FIELDS } from "./language-field-utils";
import { logger } from "./logging";

// Language-specific cache configurations
export const MULTILINGUAL_CACHE_CONFIGS = {
  // Short TTL for frequently changing content
  dynamic: {
    ttl: 2 * 60 * 1000, // 2 minutes
    maxSize: 50,
    strategy: 'lru' as const
  },
  // Medium TTL for semi-static content
  content: {
    ttl: 10 * 60 * 1000, // 10 minutes
    maxSize: 200,
    strategy: 'lru' as const
  },
  // Long TTL for static metadata
  metadata: {
    ttl: 30 * 60 * 1000, // 30 minutes
    maxSize: 100,
    strategy: 'lfu' as const
  },
  // Very long TTL for rarely changing data
  static: {
    ttl: 2 * 60 * 60 * 1000, // 2 hours
    maxSize: 50,
    strategy: 'fifo' as const
  }
} as const;

export interface LanguageCacheKey {
  contentType: string;
  language: Language;
  recordId?: string;
  params?: Record<string, any>;
  fields?: string[];
}

export interface CachedLanguageData<T = any> {
  data: T;
  language: Language;
  availableLanguages: Language[];
  fallbackUsed?: Language;
  timestamp: number;
  fields: string[];
}

export interface LanguageCacheOptions {
  ttl?: number;
  includeAllLanguages?: boolean;
  optimizeForLanguage?: Language;
  prefetchLanguages?: Language[];
  strategy?: 'aggressive' | 'conservative' | 'balanced';
}

/**
 * Multilingual Cache Manager for optimizing language-specific data fetching
 */
export class MultilingualCacheManager {
  private static instance: MultilingualCacheManager;
  private languageCaches = new Map<string, AdvancedCache<CachedLanguageData>>();
  private fieldRequirements = new Map<string, Set<string>>();
  private languageUsageStats = new Map<Language, number>();

  constructor() {
    // Initialize caches for different cache types
    for (const [type, config] of Object.entries(MULTILINGUAL_CACHE_CONFIGS)) {
      this.languageCaches.set(type, new AdvancedCache<CachedLanguageData>(config));
    }

    // Track language usage for optimization
    this.initializeLanguageTracking();
  }

  static getInstance(): MultilingualCacheManager {
    if (!MultilingualCacheManager.instance) {
      MultilingualCacheManager.instance = new MultilingualCacheManager();
    }
    return MultilingualCacheManager.instance;
  }

  /**
   * Generate a cache key for language-specific data
   */
  generateCacheKey(key: LanguageCacheKey): string {
    const parts = [
      key.contentType,
      key.language,
      key.recordId || 'list',
      key.params ? JSON.stringify(key.params) : '',
      key.fields ? key.fields.sort().join(',') : ''
    ];

    return parts.filter(Boolean).join(':');
  }

  /**
   * Get cached data for a specific language
   */
  get<T>(
    key: LanguageCacheKey,
    cacheType: keyof typeof MULTILINGUAL_CACHE_CONFIGS = 'content'
  ): CachedLanguageData<T> | null {
    const cache = this.languageCaches.get(cacheType);
    if (!cache) return null;

    const cacheKey = this.generateCacheKey(key);
    const cached = cache.get(cacheKey);

    if (cached) {
      // Update language usage stats
      this.updateLanguageUsage(key.language);

      logger.debug('MULTILINGUAL_CACHE', 'Cache hit', {
        key: cacheKey,
        language: key.language,
        contentType: key.contentType
      });

      return cached as CachedLanguageData<T>;
    }

    logger.debug('MULTILINGUAL_CACHE', 'Cache miss', {
      key: cacheKey,
      language: key.language,
      contentType: key.contentType
    });

    return null;
  }

  /**
   * Set cached data for a specific language
   */
  set<T>(
    key: LanguageCacheKey,
    data: T,
    options: LanguageCacheOptions & {
      availableLanguages?: Language[];
      fallbackUsed?: Language;
    } = {},
    cacheType: keyof typeof MULTILINGUAL_CACHE_CONFIGS = 'content'
  ): void {
    const cache = this.languageCaches.get(cacheType);
    if (!cache) return;

    const cacheKey = this.generateCacheKey(key);
    const cachedData: CachedLanguageData<T> = {
      data,
      language: key.language,
      availableLanguages: options.availableLanguages || [key.language],
      fallbackUsed: options.fallbackUsed,
      timestamp: Date.now(),
      fields: key.fields || []
    };

    cache.set(cacheKey, cachedData, options.ttl);

    // Track field requirements for this content type
    this.trackFieldRequirements(key.contentType, key.fields || []);

    logger.debug('MULTILINGUAL_CACHE', 'Cache set', {
      key: cacheKey,
      language: key.language,
      contentType: key.contentType,
      availableLanguages: options.availableLanguages
    });

    // Prefetch related languages if requested
    if (options.prefetchLanguages && options.prefetchLanguages.length > 0) {
      this.schedulePrefetch(key, options.prefetchLanguages, data);
    }
  }

  /**
   * Get data with intelligent fallback to other languages
   */
  getWithFallback<T>(
    key: LanguageCacheKey,
    fallbackLanguages: Language[] = ['UR', 'EN', 'HI'],
    cacheType: keyof typeof MULTILINGUAL_CACHE_CONFIGS = 'content'
  ): { data: CachedLanguageData<T> | null; fallbackUsed?: Language } {
    // Try primary language first
    let cached = this.get<T>(key, cacheType);
    if (cached) {
      return { data: cached };
    }

    // Try fallback languages
    for (const fallbackLang of fallbackLanguages) {
      if (fallbackLang === key.language) continue;

      const fallbackKey = { ...key, language: fallbackLang };
      cached = this.get<T>(fallbackKey, cacheType);

      if (cached) {
        logger.debug('MULTILINGUAL_CACHE', 'Using fallback language', {
          requested: key.language,
          fallback: fallbackLang,
          contentType: key.contentType
        });

        return { data: cached, fallbackUsed: fallbackLang };
      }
    }

    return { data: null };
  }

  /**
   * Optimize field selection based on language and usage patterns
   */
  optimizeFieldSelection(
    contentType: string,
    language: Language,
    requestedFields?: string[]
  ): string[] {
    const baseFields = CONTENT_TYPE_FIELDS[contentType as keyof typeof CONTENT_TYPE_FIELDS] || [];
    const trackedFields = this.fieldRequirements.get(contentType) || new Set();

    // Start with base fields for the content type
    const optimizedFields = new Set<string>(baseFields);

    // Add language-specific fields
    for (const field of baseFields) {
      if (language !== 'UR') {
        const langField = `${language.toLowerCase()}${field.charAt(0).toUpperCase()}${field.slice(1)}`;
        optimizedFields.add(langField);
      }
    }

    // Add frequently requested fields
    for (const field of trackedFields) {
      optimizedFields.add(field);
    }

    // Add specifically requested fields
    if (requestedFields) {
      for (const field of requestedFields) {
        optimizedFields.add(field);
      }
    }

    // Add common metadata fields
    const metadataFields = ['id', 'createdTime', 'likes', 'shares', 'comments'];
    for (const field of metadataFields) {
      optimizedFields.add(field);
    }

    return Array.from(optimizedFields);
  }

  /**
   * Batch cache multiple records efficiently
   */
  batchSet<T>(
    records: Array<{
      key: LanguageCacheKey;
      data: T;
      options?: LanguageCacheOptions;
    }>,
    cacheType: keyof typeof MULTILINGUAL_CACHE_CONFIGS = 'content'
  ): void {
    const cache = this.languageCaches.get(cacheType);
    if (!cache) return;

    for (const record of records) {
      this.set(record.key, record.data, record.options || {}, cacheType);
    }

    logger.debug('MULTILINGUAL_CACHE', 'Batch cache set', {
      count: records.length,
      cacheType
    });
  }

  /**
   * Invalidate cache entries by pattern or language
   */
  invalidate(options: {
    contentType?: string;
    language?: Language;
    recordId?: string;
    pattern?: string;
  }): void {
    for (const [cacheType, cache] of this.languageCaches.entries()) {
      const keysToDelete: string[] = [];

      // Get all cache entries to check against criteria
      for (const [cacheKey] of (cache as any).cache.entries()) {
        let shouldDelete = false;

        if (options.pattern) {
          const regex = new RegExp(options.pattern);
          shouldDelete = regex.test(cacheKey);
        } else {
          const keyParts = cacheKey.split(':');
          const [keyContentType, keyLanguage, keyRecordId] = keyParts;

          if (options.contentType && keyContentType !== options.contentType) continue;
          if (options.language && keyLanguage !== options.language) continue;
          if (options.recordId && keyRecordId !== options.recordId) continue;

          shouldDelete = true;
        }

        if (shouldDelete) {
          keysToDelete.push(cacheKey);
        }
      }

      // Delete matching keys
      for (const key of keysToDelete) {
        cache.delete(key);
      }

      if (keysToDelete.length > 0) {
        logger.info('MULTILINGUAL_CACHE', `Invalidated ${keysToDelete.length} entries from ${cacheType} cache`, options);
      }
    }
  }

  /**
   * Get cache statistics by language
   */
  getLanguageStats(): Record<Language, {
    cacheHits: number;
    usage: number;
    availableContent: number;
  }> {
    const stats: Record<Language, any> = {
      EN: { cacheHits: 0, usage: 0, availableContent: 0 },
      UR: { cacheHits: 0, usage: 0, availableContent: 0 },
      HI: { cacheHits: 0, usage: 0, availableContent: 0 }
    };

    // Get usage stats
    for (const [lang, usage] of this.languageUsageStats.entries()) {
      if (stats[lang]) {
        stats[lang].usage = usage;
      }
    }

    // Count available content by language
    for (const cache of this.languageCaches.values()) {
      for (const [, entry] of (cache as any).cache.entries()) {
        const cachedData = entry.data as CachedLanguageData;
        if (stats[cachedData.language]) {
          stats[cachedData.language].availableContent++;
        }
      }
    }

    return stats;
  }

  /**
   * Preload content for multiple languages
   */
  async preloadLanguages<T>(
    key: Omit<LanguageCacheKey, 'language'>,
    languages: Language[],
    fetcher: (lang: Language) => Promise<T>,
    options: LanguageCacheOptions = {}
  ): Promise<void> {
    const promises = languages.map(async (lang) => {
      const langKey = { ...key, language: lang };
      const cached = this.get(langKey);

      if (!cached) {
        try {
          const data = await fetcher(lang);
          this.set(langKey, data, options);
        } catch (error) {
          logger.warn('MULTILINGUAL_CACHE', `Failed to preload ${key.contentType} for language ${lang}`, error);
        }
      }
    });

    await Promise.allSettled(promises);

    logger.debug('MULTILINGUAL_CACHE', 'Preload completed', {
      contentType: key.contentType,
      languages,
      recordId: key.recordId
    });
  }

  /**
   * Clear all caches
   */
  clearAll(): void {
    for (const cache of this.languageCaches.values()) {
      cache.clear();
    }
    this.fieldRequirements.clear();
    this.languageUsageStats.clear();

    logger.info('MULTILINGUAL_CACHE', 'All caches cleared');
  }

  /**
   * Get comprehensive cache statistics
   */
  getAllStats(): Record<string, any> {
    const stats: Record<string, any> = {};

    for (const [cacheType, cache] of this.languageCaches.entries()) {
      stats[cacheType] = cache.getStats();
    }

    stats.languageStats = this.getLanguageStats();
    stats.fieldRequirements = Object.fromEntries(
      Array.from(this.fieldRequirements.entries()).map(([key, set]) => [key, Array.from(set)])
    );

    return stats;
  }

  // Private helper methods
  private initializeLanguageTracking(): void {
    this.languageUsageStats.set('EN', 0);
    this.languageUsageStats.set('UR', 0);
    this.languageUsageStats.set('HI', 0);
  }

  private updateLanguageUsage(language: Language): void {
    const current = this.languageUsageStats.get(language) || 0;
    this.languageUsageStats.set(language, current + 1);
  }

  private trackFieldRequirements(contentType: string, fields: string[]): void {
    if (!this.fieldRequirements.has(contentType)) {
      this.fieldRequirements.set(contentType, new Set());
    }

    const tracked = this.fieldRequirements.get(contentType)!;
    for (const field of fields) {
      tracked.add(field);
    }
  }

  private schedulePrefetch<T>(
    baseKey: LanguageCacheKey,
    languages: Language[],
    baseData: T
  ): void {
    // Schedule prefetch for next tick to avoid blocking current operation
    setTimeout(() => {
      for (const lang of languages) {
        if (lang === baseKey.language) continue;

        const langKey = { ...baseKey, language: lang };
        const existing = this.get(langKey);

        if (!existing) {
          // This would typically trigger a background fetch
          // For now, we just log the intent
          logger.debug('MULTILINGUAL_CACHE', 'Scheduling prefetch', {
            contentType: baseKey.contentType,
            language: lang,
            recordId: baseKey.recordId
          });
        }
      }
    }, 0);
  }
}

// Export singleton instance and convenience functions
export const multilingualCacheManager = MultilingualCacheManager.getInstance();

// Convenience functions
export function getCachedLanguageData<T>(
  key: LanguageCacheKey,
  cacheType?: keyof typeof MULTILINGUAL_CACHE_CONFIGS
): CachedLanguageData<T> | null {
  return multilingualCacheManager.get<T>(key, cacheType);
}

export function setCachedLanguageData<T>(
  key: LanguageCacheKey,
  data: T,
  options?: LanguageCacheOptions,
  cacheType?: keyof typeof MULTILINGUAL_CACHE_CONFIGS
): void {
  multilingualCacheManager.set(key, data, options || {}, cacheType);
}

export function invalidateLanguageCache(options: {
  contentType?: string;
  language?: Language;
  recordId?: string;
  pattern?: string;
}): void {
  multilingualCacheManager.invalidate(options);
}

export function optimizeFieldsForLanguage(
  contentType: string,
  language: Language,
  requestedFields?: string[]
): string[] {
  return multilingualCacheManager.optimizeFieldSelection(contentType, language, requestedFields);
}