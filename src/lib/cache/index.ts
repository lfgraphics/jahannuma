/**
 * Cache utilities barrel export.
 * Provides convenient access to all cache-related utilities.
 */

// Cache utilities
export {
  cacheAirtableRecord,
  cacheApiResponse,
  cacheFirst,
  getCacheStats,
  getCachedRecord,
  getCachedResponse,
  getStaleCachedRecord,
  getStaleCachedResponse,
  invalidateCache,
  networkFirst,
  sessionCache,
  staleWhileRevalidate,
} from "./cache-utils";

export type { CacheEntry, CacheOptions } from "./cache-utils";

// Cache monitoring
export {
  getCacheReport,
  logCacheEvent,
  logCacheStats,
  recordApiEvent,
  recordSessionEvent,
  resetCounters,
  setCacheDebugLogging,
} from "./cache-monitoring";

// SWR updaters
export {
  addCommentToList,
  updateMultipleRecords,
  updatePagedListField,
  updateRecordField,
  updateRecordFields,
} from "./swr-updater";
