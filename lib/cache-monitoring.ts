import { getCacheStats } from "@/lib/cache-utils";

type Counters = {
    // SWR counters disabled to avoid misleading metrics
    swrHits: number;
    swrMisses: number;
    sessionHits: number;
    sessionMisses: number;
};

const counters: Counters = {
    swrHits: 0,
    swrMisses: 0,
    sessionHits: 0,
    sessionMisses: 0,
};

// No-op: SWR hit/miss counters disabled
export function recordSWREvent(_hit: boolean) {
    // intentionally left blank
}

export function recordSessionEvent(hit: boolean) {
    if (hit) counters.sessionHits++;
    else counters.sessionMisses++;
}

export function getCacheReport() {
    const stats = getCacheStats();
    return {
        ...counters,
        sessionStats: stats,
    };
}

let debug = false;
export function setCacheDebugLogging(enabled: boolean) {
    debug = enabled;
}

export function logCacheEvent(kind: "session" | "cache", hit: boolean, key?: string) {
    if (!debug) return;
    const label = kind === "session" ? "SESSION" : "CACHE";
    // eslint-disable-next-line no-console
    console.info(`[${label}] ${hit ? "HIT" : "MISS"}${key ? ` ${key}` : ""}`);
}