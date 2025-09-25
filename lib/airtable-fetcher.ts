import { cacheAirtableRecord, getCachedRecord, getStaleCachedRecord, invalidateCache } from "@/lib/cache-utils";
import { generateCacheKey } from "@/lib/utils";
import { recordSessionEvent, logCacheEvent } from "@/lib/cache-monitoring";

export type AirtableKeyBase = {
    baseId: string;
    table: string;
    lang?: string;
    params?: Record<string, any>;
    ttl?: number;
};

export type AirtableRecordKey = AirtableKeyBase & {
    kind: "record";
    recordId: string;
};

export type AirtableListKey = AirtableKeyBase & {
    kind: "list";
    offset?: string | null;
};

export type AirtableSWRKey = AirtableRecordKey | AirtableListKey;

export const TTL = {
    list: 1000 * 60 * 5, // 5m
    static: 1000 * 60 * 15, // 15m
    fast: 1000 * 60 * 2, // 2m
};

function normalizeParams(params?: Record<string, any>) {
    if (!params) return undefined;
    // remove undefined values for stable keying
    const copy: Record<string, any> = {};
    for (const k of Object.keys(params)) {
        const v = (params as any)[k];
        if (v !== undefined) copy[k] = v;
    }
    return copy;
}

export function buildAirtableCacheKey(key: AirtableSWRKey): string {
    const { baseId, table, lang, params } = key;
    const cleanParams = normalizeParams({ ...(params || {}), lang });
    const suffix = cleanParams ? generateCacheKey(cleanParams) : "";
    const off = (key as AirtableListKey).offset ?? undefined;
    const offPart = off ? `:o=${off}` : "";
    const rec = (key as AirtableRecordKey).recordId;
    const recPart = rec ? `:id=${rec}` : "";
    // Do NOT include the 'airtable:' prefix here; cache-utils adds it
    return `${baseId}:${table}${recPart}${offPart}:${suffix}`;
}

function getAuthHeader() {
    const token = process.env.NEXT_PUBLIC_Api_Token;
    return { Authorization: `Bearer ${token}` } as const;
}

async function delay(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
}

async function doFetch(url: string, init?: RequestInit, retries = 2): Promise<any> {
    let lastErr: any;
    for (let i = 0; i <= retries; i++) {
        try {
            const res = await fetch(url, init);
            if (!res.ok) {
                const text = await res.text().catch(() => "");
                throw new Error(`HTTP ${res.status} ${res.statusText} ${text}`);
            }
            const json = await res.json();
            return json;
        } catch (e) {
            lastErr = e;
            if (i < retries) await delay(200 * (i + 1));
        }
    }
    throw lastErr;
}

function buildUrl(key: AirtableSWRKey): string {
    const { baseId, table } = key;
    // record endpoint
    if (key.kind === "record") {
        return `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}/${key.recordId}`;
    }
    // list endpoint
    const qs = new URLSearchParams();
    const p = key.params || {};
    for (const [k, v] of Object.entries(p)) {
        if (v == null) continue;
        // exclude non-API params from the URL; keep for cache keying only
        if (k === "lang" || k === "search") continue;
        if (k === "fields" && Array.isArray(v)) {
            for (const f of v) qs.append("fields[]", String(f));
            continue;
        }
        qs.append(k, String(v));
    }
    if (key.kind === 'list' && key.offset) qs.set('offset', String(key.offset));
    const query = qs.toString();
    return `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}${query ? `?${query}` : ""}`;
}

export async function airtableFetchJson(key: AirtableSWRKey): Promise<any> {
    const cacheKey = buildAirtableCacheKey(key);
    const fresh = getCachedRecord<any>(cacheKey);
    if (fresh !== undefined) {
        recordSessionEvent(true);
        logCacheEvent("session", true, cacheKey);
        return fresh;
    }
    // attempt stale read (even if expired)
    // attempt stale read (even if expired)
    let stale: any;
    try {
        stale = getStaleCachedRecord<any>(cacheKey);
    } catch (e) {
        // Stale cache read failed, will proceed without it
        console.debug('Failed to read stale cache:', e);
    }
    const url = buildUrl(key);
    try {
        const json = await doFetch(url, { method: "GET", headers: { ...getAuthHeader() } });
        const ttl = key.ttl ?? (key.kind === "list" ? TTL.list : TTL.fast);
        cacheAirtableRecord(cacheKey, json, ttl);
        recordSessionEvent(false); // miss served fresh
        logCacheEvent("session", false, cacheKey);
        return json;
    } catch (e) {
        if (stale !== undefined) {
            // return stale on error
            recordSessionEvent(true);
            logCacheEvent("session", true, cacheKey);
            return stale;
        }
        recordSessionEvent(false);
        logCacheEvent("session", false, cacheKey);
        throw e;
    }
}

// SWR global fetcher: accepts only our typed keys; if given a string, fallback to direct GET
export async function airtableSWRFetcher(arg: unknown): Promise<any> {
    // Accept array keys: use first element
    if (Array.isArray(arg) && arg.length > 0) {
        const first = arg[0];
        if (first && typeof first === "object" && (first as any).baseId && (first as any).table && (first as any).kind) {
            return airtableFetchJson(first as AirtableSWRKey);
        }
        if (typeof first === "string") {
            return doFetch(first, { method: "GET", headers: { ...getAuthHeader() } });
        }
    }
    // our hooks pass an object key
    if (arg && typeof arg === "object" && (arg as any).baseId && (arg as any).table && (arg as any).kind) {
        return airtableFetchJson(arg as AirtableSWRKey);
    }
    // fallback: URL string
    if (typeof arg === "string") {
        return doFetch(arg, { method: "GET", headers: { ...getAuthHeader() } });
    }
    throw new Error("Unsupported SWR key");
}

export function invalidateAirtable(baseId?: string, table?: string) {
    if (!baseId && !table) return invalidateCache(".*");
    const pattern = `${baseId ?? ".*"}:${table ?? ".*"}`;
    invalidateCache(pattern);
}
