/**
 * Enhanced Airtable List Hook
 * 
 * Updated version of useAirtableList that works with the new universal
 * data fetching infrastructure and enhanced error handling.
 */

"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { cache } from "@/lib/cache-strategies";
import {
  ErrorContext,
  createClientError,
  handleError,
  withRetry,
  type EnhancedError
} from "@/lib/error-handling";
import {
  getUniversalFetcher,
  type AirtableListKey,
  type DataFetcherOptions
} from "@/lib/universal-data-fetcher";
import { useCallback, useMemo } from "react";
import useSWRInfinite from "swr/infinite";
import { useDebouncedValue } from "./useDebouncedValue";

export interface EnhancedListParams {
  pageSize?: number;
  filterByFormula?: string;
  fields?: string[];
  sort?: { field: string; direction?: "asc" | "desc" }[];
  search?: string;
  extra?: Record<string, any>;
}

export interface UseEnhancedAirtableListOptions extends DataFetcherOptions {
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  debounceMs?: number;
  enabled?: boolean;
  retryCount?: number;
  retryDelay?: number;
}

export interface EnhancedListResult<T> {
  records: T[];
  error: EnhancedError | null;
  isLoading: boolean;
  isValidating: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  mutate: (data?: any, shouldRevalidate?: boolean) => Promise<any>;
  size: number;
  setSize: (size: number | ((size: number) => number)) => Promise<any>;
  swrKey: AirtableListKey | null;
  cacheKey: string | null;
}

export function useEnhancedAirtableList<T = any>(
  baseId: string,
  table: string,
  params: EnhancedListParams = {},
  options: UseEnhancedAirtableListOptions = {}
): EnhancedListResult<T> {
  const { language } = useLanguage();
  const universalFetcher = getUniversalFetcher();

  // Debounce search/filter to avoid per-keystroke requests
  const debounceMs = options.debounceMs ?? 300;
  const debouncedSearch = useDebouncedValue(params.search, debounceMs);
  const debouncedFilter = useDebouncedValue(params.filterByFormula, debounceMs);

  // Prepare query parameters
  const queryParams = useMemo(() => {
    const p: Record<string, any> = {
      pageSize: params.pageSize ?? 30,
      ...(params.extra || {})
    };

    if (debouncedFilter) p["filterByFormula"] = debouncedFilter;
    if (params.fields && params.fields.length) p.fields = params.fields;

    if (params.sort && params.sort.length) {
      params.sort.forEach((s, i) => {
        p[`sort[${i}][field]`] = s.field;
        if (s.direction) p[`sort[${i}][direction]`] = s.direction;
      });
    }

    if (debouncedSearch) {
      p["search"] = debouncedSearch;
    }

    p.lang = language;
    return p;
  }, [
    params.pageSize,
    debouncedFilter,
    JSON.stringify(params.fields),
    JSON.stringify(params.sort),
    debouncedSearch,
    JSON.stringify(params.extra),
    language
  ]);

  // SWR key generator
  const getKey = useCallback((pageIndex: number, previousPageData: any): AirtableListKey | null => {
    if (options.enabled === false) return null;

    // Handle new data structure where offset is nested under 'data'
    const pageData = previousPageData?.data || previousPageData;
    if (previousPageData && !pageData?.offset) return null; // reached end

    const offset = pageIndex === 0 ? undefined : pageData?.offset;

    return {
      kind: "list",
      baseId,
      table,
      params: queryParams,
      lang: language,
      offset,
      ttl: options.revalidate ?? 300000 // 5 minutes default
    };
  }, [baseId, table, queryParams, language, options.enabled, options.revalidate]);

  // Enhanced fetcher with error handling and retry logic
  const enhancedFetcher = useCallback(async (key: AirtableListKey) => {
    // Generate cache key
    const cacheKey = `${baseId}:${table}:${JSON.stringify(key.params)}:${key.offset || 0}`;

    // Try to get from cache first
    if (options.cache !== false) {
      const cachedData = cache.get<any>('airtable', cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    try {
      const result = await withRetry(
        () => universalFetcher.fetchList(key, {
          cache: options.cache,
          revalidate: options.revalidate,
          fallback: options.fallback,
          throwOnError: true,
          debug: options.debug
        }),
        options.retryCount ?? 3,
        options.retryDelay ?? 1000,
        ErrorContext.CLIENT_SIDE
      );

      // Cache the result if caching is enabled
      if (options.cache !== false && result) {
        cache.set('airtable', cacheKey, result);
      }

      return result;
    } catch (error) {
      const enhancedError = createClientError(
        `Failed to fetch ${table} data: ${(error as Error).message}`,
        {
          code: 'AIRTABLE_FETCH_ERROR',
          debugInfo: {
            baseId,
            table,
            params: queryParams,
            key
          }
        }
      );

      handleError(enhancedError, false); // Don't show toast, let component handle it
      throw enhancedError;
    }
  }, [universalFetcher, baseId, table, queryParams, options]);

  // SWR Infinite hook
  const swr = useSWRInfinite<any, EnhancedError>(
    getKey,
    enhancedFetcher,
    {
      revalidateOnFocus: options.revalidateOnFocus ?? false,
      revalidateOnReconnect: options.revalidateOnReconnect ?? true,
      dedupingInterval: 60_000,
      errorRetryCount: 0, // We handle retries in our fetcher
      shouldRetryOnError: false,
    }
  );

  // Memoized derived values
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

  // Enhanced load more with error handling
  const loadMore = useCallback(async () => {
    try {
      await swr.setSize((size) => size + 1);
    } catch (error) {
      const enhancedError = createClientError(
        `Failed to load more ${table} data: ${(error as Error).message}`,
        {
          code: 'LOAD_MORE_ERROR',
          debugInfo: { baseId, table, currentSize: swr.size }
        }
      );

      handleError(enhancedError);
      throw enhancedError;
    }
  }, [swr.setSize, swr.size, baseId, table]);

  // Enhanced refresh with error handling
  const refresh = useCallback(async () => {
    try {
      await swr.mutate();
    } catch (error) {
      const enhancedError = createClientError(
        `Failed to refresh ${table} data: ${(error as Error).message}`,
        {
          code: 'REFRESH_ERROR',
          debugInfo: { baseId, table }
        }
      );

      handleError(enhancedError);
      throw enhancedError;
    }
  }, [swr.mutate, baseId, table]);

  // Determine if we're loading more data (not initial load)
  const isLoadingMore = useMemo(() => {
    return swr.isValidating && !swr.isLoading && records && records.length > 0;
  }, [swr.isValidating, swr.isLoading, records]);

  // Get cache key for optimistic updates
  const firstPageKey = getKey(0, undefined as any);
  const cacheKey = firstPageKey ? `${firstPageKey.baseId}:${firstPageKey.table}:${JSON.stringify(firstPageKey.params)}` : null;

  return {
    records: records as T[],
    error: swr.error || null,
    isLoading: swr.isLoading,
    isValidating: swr.isValidating,
    isLoadingMore,
    hasMore,
    loadMore,
    refresh,
    mutate: swr.mutate,
    size: swr.size,
    setSize: swr.setSize,
    swrKey: firstPageKey,
    cacheKey,
  };
}

// Backward compatibility wrapper
export function useAirtableList<T = any>(
  baseId: string,
  table: string,
  params: EnhancedListParams = {},
  options: UseEnhancedAirtableListOptions = {}
) {
  return useEnhancedAirtableList<T>(baseId, table, params, options);
}