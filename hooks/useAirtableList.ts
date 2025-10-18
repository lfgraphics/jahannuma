"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { TTL, airtableSWRFetcher, buildAirtableCacheKey, type AirtableListKey } from "@/lib/airtable-fetcher";
import { useMemo } from "react";
import useSWRInfinite from "swr/infinite";
import { useDebouncedValue } from "./useDebouncedValue";

export interface ListParams {
    pageSize?: number;
    filterByFormula?: string;
    fields?: string[];
    sort?: { field: string; direction?: "asc" | "desc" }[];
    search?: string;
    extra?: Record<string, any>;
}

export interface UseAirtableListOptions {
    ttl?: number;
    revalidateOnFocus?: boolean;
    revalidateOnReconnect?: boolean;
    debounceMs?: number;
    enabled?: boolean;
}

export function useAirtableList<T = any>(baseId: string, table: string, params: ListParams = {}, options: UseAirtableListOptions = {}) {
    const { language } = useLanguage();

    // Debounce search/filter to avoid per-keystroke requests
    const debounceMs = options.debounceMs ?? 300;
    const debouncedSearch = useDebouncedValue(params.search, debounceMs);
    const debouncedFilter = useDebouncedValue(params.filterByFormula, debounceMs);

    const queryParams = useMemo(() => {
        const p: Record<string, any> = { pageSize: params.pageSize ?? 30, ...(params.extra || {}) };
        if (debouncedFilter) p["filterByFormula"] = debouncedFilter;
        // pass raw array; fetcher will serialize as fields[] multiple params
        if (params.fields && params.fields.length) p.fields = params.fields;
        if (params.sort && params.sort.length) {
            params.sort.forEach((s, i) => {
            p[`sort[${i}][field]`] = s.field;
            if (s.direction) p[`sort[${i}][direction]`] = s.direction;
            });
        } else {
            // No default sorting - let Airtable return records in natural order
            // This avoids errors with non-existent fields like "createdTime" or "id"
        }
        if (debouncedSearch) {
            p["search"] = debouncedSearch; // for keying; actual formula to be provided by caller when needed
        }
        p.lang = language;
        return p;
    }, [params.pageSize, debouncedFilter, JSON.stringify(params.fields), JSON.stringify(params.sort), debouncedSearch, JSON.stringify(params.extra), language]);

    const getKey = (pageIndex: number, previousPageData: any): AirtableListKey | null => {
        if (options.enabled === false) return null;

      // Handle new data structure where offset is nested under 'data'
      const pageData = previousPageData?.data || previousPageData;
      if (previousPageData && !pageData?.offset) return null; // reached end

      const offset = pageIndex === 0 ? undefined : pageData?.offset;
        return { kind: "list", baseId, table, params: queryParams, lang: language, offset, ttl: options.ttl ?? TTL.list };
    };

    const swr = useSWRInfinite<any>(getKey, airtableSWRFetcher, {
        revalidateOnFocus: options.revalidateOnFocus ?? false,
        revalidateOnReconnect: options.revalidateOnReconnect ?? true,
        dedupingInterval: 60_000,
    });

    // Memoize derived arrays/values so consumers don't get a new reference each render
    const records = useMemo(() => {
      return (swr.data ?? []).flatMap((page: any) => {
        // Handle new data structure where records are nested under 'data'
        const pageData = page?.data || page;
        return pageData?.records ?? [];
      });
    }, [swr.data]);

    const hasMore = useMemo(() => {
      if (!swr.data || swr.data.length === 0) return false;
      const lastPage = swr.data[swr.data.length - 1];
      // Handle new data structure where offset is nested under 'data'
      const pageData = lastPage?.data || lastPage;
      return !!(pageData?.offset);
    }, [swr.data]);

    const loadMore = () => swr.setSize((size) => size + 1);

    // Expose the first page key and its string cache key for optimistic updates
    const firstPageKey = getKey(0, undefined as any);
    const cacheKey = firstPageKey ? buildAirtableCacheKey(firstPageKey) : null;

    return {
        ...swr,
        records: records as T[],
        hasMore,
        loadMore,
        swrKey: firstPageKey,
        cacheKey,
    } as const;
}