/**
 * Cache monitoring and debugging utilities.
 * Provides statistics and debugging information for cache performance.
 */

import { getCacheStats } from "./cache-utils";

type Counters = {
  apiHits: number;
  apiMisses: number;
  sessionHits: number;
  sessionMisses: number;
};

const counters: Counters = {
  apiHits: 0,
  apiMisses: 0,
  sessionHits: 0,
  sessionMisses: 0,
};

/**
 * Record an API cache event (hit or miss).
 */
export function recordApiEvent(hit: boolean) {
  if (hit) counters.apiHits++;
  else counters.apiMisses++;
}

/**
 * Record a session cache event (hit or miss).
 */
export function recordSessionEvent(hit: boolean) {
  if (hit) counters.sessionHits++;
  else counters.sessionMisses++;
}

/**
 * Get comprehensive cache report with statistics.
 */
export function getCacheReport() {
  const stats = getCacheStats();
  return {
    ...counters,
    sessionStats: stats,
    hitRates: {
      api:
        counters.apiHits + counters.apiMisses > 0
          ? (counters.apiHits / (counters.apiHits + counters.apiMisses)) * 100
          : 0,
      session:
        counters.sessionHits + counters.sessionMisses > 0
          ? (counters.sessionHits /
              (counters.sessionHits + counters.sessionMisses)) *
            100
          : 0,
    },
  };
}

/**
 * Reset all counters.
 */
export function resetCounters() {
  counters.apiHits = 0;
  counters.apiMisses = 0;
  counters.sessionHits = 0;
  counters.sessionMisses = 0;
}

let debug = false;

/**
 * Enable or disable cache debug logging.
 */
export function setCacheDebugLogging(enabled: boolean) {
  debug = enabled;
}

/**
 * Log a cache event if debug logging is enabled.
 */
export function logCacheEvent(
  kind: "api" | "session",
  hit: boolean,
  key?: string
) {
  if (!debug) return;
  const label = kind === "api" ? "API" : "SESSION";
  // eslint-disable-next-line no-console
  console.info(`[${label}] ${hit ? "HIT" : "MISS"}${key ? ` ${key}` : ""}`);
}

/**
 * Log cache statistics to console.
 */
export function logCacheStats() {
  if (!debug) return;
  const report = getCacheReport();
  // eslint-disable-next-line no-console
  console.table(report);
}
