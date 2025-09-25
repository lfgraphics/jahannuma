"use client";
/**
 * useAirtableRecord
 * Fetch a single Airtable record by ID with SWR + session cache.
 *
 * Example:
 *   const { data, isLoading, error } = useAirtableRecord<{ fields: MyType }>(
 *     "appBaseId",
 *     "MyTable",
 *     recordId,
 *     { ttl: TTL.fast }
 *   );
 */
import useSWR from "swr";
import { airtableSWRFetcher, buildAirtableCacheKey, TTL, type AirtableRecordKey } from "@/lib/airtable-fetcher";
import { useLanguage } from "@/contexts/LanguageContext";

export interface UseAirtableRecordOptions {
    ttl?: number;
    revalidateOnFocus?: boolean;
    revalidateOnReconnect?: boolean;
}

export function useAirtableRecord<T = any>(baseId: string, table: string, recordId?: string | null, options: UseAirtableRecordOptions = {}) {
    const { language } = useLanguage();
    const key: AirtableRecordKey | null = recordId
        ? { kind: "record", baseId, table, recordId, lang: language, ttl: options.ttl ?? TTL.fast }
        : null;
    const { data, error, isLoading, mutate } = useSWR<T>(key, airtableSWRFetcher, {
        revalidateOnFocus: options.revalidateOnFocus ?? false,
        revalidateOnReconnect: options.revalidateOnReconnect ?? true,
        dedupingInterval: 60_000,
    });

    return { data, error, isLoading, mutate, cacheKey: key ? buildAirtableCacheKey(key) : null } as const;
}
