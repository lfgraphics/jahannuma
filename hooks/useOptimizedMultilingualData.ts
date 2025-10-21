"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import {
  multilingualErrorHandler,
  type MultilingualError
} from "@/lib/multilingual-error-handler";
import { Language } from "@/lib/multilingual-texts";
import {
  optimizedMultilingualFetcher,
  type FetchResult,
  type OptimizedFetchOptions
} from "@/lib/optimized-multilingual-fetcher";
import { useCallback, useMemo } from "react";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
import { useDebouncedValue } from "./useDebouncedValue";

export interface OptimizedDataParams {
  pageSize?: number;
  filterByFormula?: string;
  fields?: string[];
  sort?: { field: string; direction?: "asc" | "desc" }[];
  search?: string;
  extra?: Record<string, any>;
}

export interface UseOptimizedDataOptions {
  contentType: string;
  fields?: string[];
  cacheStrategy?: 'aggressive' | 'conservative' | 'balanced';
  fallbackLanguages?: Language[];
  prefetchLanguages?: Language[];
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  debounceMs?: number;
  enabled?: boolean;
  validateContent?: boolean;
  maxRetries?: number;
  timeout?: number;
}

export interface OptimizedDataResult<T> {
  records: T[];
  error: MultilingualError | null;
  isLoading: boolean;
  isValidating: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  mutate: (data?: any, shouldRevalidate?: boolean) => Promise<any>;
  performance: {
    averageFetchTime: number;
    cacheHitRate: number;
    totalRequests: number;
  };
  language: Language;
  fallbackUsed?: Language;
  availableLanguages?: Language[];
}

/**
 * Hook for optimized multilingual data fetching with intelligent caching
 */
export function useOptimizedMultilingualData<T = any>(
  endpoint: string,
  params: OptimizedDataParams = {},
  options: UseOptimizedDataOptions
): OptimizedDataResult<T> {
  const { language } = useLanguage();

  // Debounce search/filter to avoid per-keystroke requests
  const debounceMs = options.debounceMs ?? 300;
  const debouncedSearch = useDebouncedValue(params.search, debounceMs);
  const debouncedFilter = useDebouncedValue(params.filterByFormula, debounceMs);

  // Prepare fetch options
  const fetchOptions: OptimizedFetchOptions = useMemo(() => ({
    language,
    contentType: options.contentType,
    fields: params.fields,
    cacheStrategy: options.cacheStrategy || 'balanced',
    fallbackLanguages: options.fallbackLanguages || ['UR', 'EN', 'HI'],
    prefetchLanguages: options.prefetchLanguages,
    validateContent: options.validateContent,
    maxRetries: options.maxRetries || 3,
    timeout: options.timeout || 10000
  }), [
    language,
    options.contentType,
    params.fields,
    options.cacheStrategy,
    options.fallbackLanguages,
    options.prefetchLanguages,
    options.validateContent,
    options.maxRetries,
    options.timeout
  ]);

  // Prepare query parameters
  const queryParams = useMemo(() => {
    const p: Record<string, any> = {
      pageSize: params.pageSize ?? 30,
      ...(params.extra || {})
    };

    if (debouncedFilter) p["filterByFormula"] = debouncedFilter;
    if (debouncedSearch) p["search"] = debouncedSearch;

    if (params.sort && params.sort.length) {
      params.sort.forEach((s, i) => {
        p[`sort[${i}][field]`] = s.field;
        if (s.direction) p[`sort[${i}][direction]`] = s.direction;
      });
    }

    return p;
  }, [
    params.pageSize,
    debouncedFilter,
    debouncedSearch,
    JSON.stringify(params.sort),
    JSON.stringify(params.extra)
  ]);

  // SWR key generator for infinite loading
  const getKey = useCallback((pageIndex: number, previousPageData: any): string | null => {
    if (options.enabled === false) return null;

    const pageData = previousPageData?.data || previousPageData;
    if (previousPageData && !pageData?.offset) return null; // reached end

    const offset = pageIndex === 0 ? undefined : pageData?.offset;
    const keyParams = { ...queryParams };
    if (offset) keyParams.offset = offset;

    // Create a stable key for SWR
    return `${endpoint}:${JSON.stringify(keyParams)}:${language}:${options.contentType}`;
  }, [endpoint, queryParams, language, options.contentType, options.enabled]);

  // Enhanced fetcher with optimizations
  const optimizedFetcher = useCallback(async (key: string): Promise<FetchResult<T[]>> => {
    // Parse the key to get parameters
    const [, paramsStr] = key.split(':');
    const parsedParams = JSON.parse(paramsStr);

    try {
      return await optimizedMultilingualFetcher.fetchList<T>(
        endpoint,
        parsedParams,
        fetchOptions
      );
    } catch (error) {
      // Handle multilingual-specific errors
      multilingualErrorHandler.handleMultilingualError(error as MultilingualError);
      throw error;
    }
  }, [endpoint, fetchOptions]);

  // SWR Infinite hook
  const swr = useSWRInfinite<FetchResult<T[]>, MultilingualError>(
    getKey,
    optimizedFetcher,
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
    return (swr.data ?? []).flatMap((result: FetchResult<T[]>) => result.data);
  }, [swr.data]);

  const hasMore = useMemo(() => {
    if (!swr.data || swr.data.length === 0) return false;
    const lastResult = swr.data[swr.data.length - 1];
    // This would need to be determined based on the actual API response structure
    return lastResult.data.length === (queryParams.pageSize || 30);
  }, [swr.data, queryParams.pageSize]);

  const isLoadingMore = useMemo(() => {
    return swr.isValidating && !swr.isLoading && records && records.length > 0;
  }, [swr.isValidating, swr.isLoading, records]);

  // Performance metrics
  const performance = useMemo(() => {
    const metrics = optimizedMultilingualFetcher.getPerformanceMetrics();
    const endpointMetrics = metrics[endpoint];

    if (!endpointMetrics) {
      return {
        averageFetchTime: 0,
        cacheHitRate: 0,
        totalRequests: 0
      };
    }

    // Calculate cache hit rate from SWR data
    const totalFetches = swr.data?.length || 0;
    const cacheHits = swr.data?.filter(result => result.fromCache).length || 0;
    const cacheHitRate = totalFetches > 0 ? cacheHits / totalFetches : 0;

    return {
      averageFetchTime: endpointMetrics.averageTime,
      cacheHitRate,
      totalRequests: endpointMetrics.requestCount
    };
  }, [swr.data, endpoint]);

  // Language and fallback information
  const languageInfo = useMemo(() => {
    const firstResult = swr.data?.[0];
    return {
      language: firstResult?.language || language,
      fallbackUsed: firstResult?.fallbackUsed,
      availableLanguages: firstResult?.availableLanguages
    };
  }, [swr.data, language]);

  // Enhanced load more with error handling
  const loadMore = useCallback(async () => {
    try {
      await swr.setSize((size) => size + 1);
    } catch (error) {
      multilingualErrorHandler.handleMultilingualError(error as MultilingualError);
      throw error;
    }
  }, [swr.setSize]);

  // Enhanced refresh with error handling
  const refresh = useCallback(async () => {
    try {
      await swr.mutate();
    } catch (error) {
      multilingualErrorHandler.handleMultilingualError(error as MultilingualError);
      throw error;
    }
  }, [swr.mutate]);

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
    performance,
    language: languageInfo.language,
    fallbackUsed: languageInfo.fallbackUsed,
    availableLanguages: languageInfo.availableLanguages,
  };
}

/**
 * Hook for optimized single record fetching
 */
export function useOptimizedRecord<T = any>(
  endpoint: string,
  recordId: string,
  options: UseOptimizedDataOptions
): {
  data: T | null;
  error: MultilingualError | null;
  isLoading: boolean;
  isValidating: boolean;
  mutate: (data?: any, shouldRevalidate?: boolean) => Promise<any>;
  performance: {
    fetchTime: number;
    fromCache: boolean;
    fieldsOptimized: boolean;
  };
  language: Language;
  fallbackUsed?: Language;
  availableLanguages?: Language[];
} {
  const { language } = useLanguage();

  // Prepare fetch options
  const fetchOptions: OptimizedFetchOptions = useMemo(() => ({
    language,
    contentType: options.contentType,
    fields: options.fields,
    cacheStrategy: options.cacheStrategy || 'balanced',
    fallbackLanguages: options.fallbackLanguages || ['UR', 'EN', 'HI'],
    prefetchLanguages: options.prefetchLanguages,
    validateContent: options.validateContent,
    maxRetries: options.maxRetries || 3,
    timeout: options.timeout || 10000
  }), [
    language,
    options.contentType,
    options.fields,
    options.cacheStrategy,
    options.fallbackLanguages,
    options.prefetchLanguages,
    options.validateContent,
    options.maxRetries,
    options.timeout
  ]);

  // SWR key
  const swrKey = options.enabled !== false ?
    `${endpoint}:${recordId}:${language}:${options.contentType}` : null;

  // Enhanced fetcher
  const optimizedFetcher = useCallback(async (): Promise<FetchResult<T>> => {
    try {
      return await optimizedMultilingualFetcher.fetchRecord<T>(
        endpoint,
        recordId,
        fetchOptions
      );
    } catch (error) {
      multilingualErrorHandler.handleMultilingualError(error as MultilingualError);
      throw error;
    }
  }, [endpoint, recordId, fetchOptions]);

  // SWR hook
  const swr = useSWR<FetchResult<T>, MultilingualError>(
    swrKey,
    optimizedFetcher,
    {
      revalidateOnFocus: options.revalidateOnFocus ?? false,
      revalidateOnReconnect: options.revalidateOnReconnect ?? true,
      dedupingInterval: 60_000,
      errorRetryCount: 0,
      shouldRetryOnError: false,
    }
  );

  return {
    data: swr.data?.data || null,
    error: swr.error || null,
    isLoading: swr.isLoading,
    isValidating: swr.isValidating,
    mutate: swr.mutate,
    performance: swr.data?.performance ? {
      fetchTime: swr.data.performance.fetchTime,
      fromCache: swr.data.performance.cacheHit,
      fieldsOptimized: swr.data.performance.fieldsOptimized || false
    } : {
      fetchTime: 0,
      fromCache: false,
      fieldsOptimized: false
    },
    language: swr.data?.language || language,
    fallbackUsed: swr.data?.fallbackUsed,
    availableLanguages: swr.data?.availableLanguages,
  };
}

// Convenience hooks for specific content types
export function useOptimizedAshaarData(
  params: OptimizedDataParams = {},
  options: Omit<UseOptimizedDataOptions, 'contentType'> = {}
) {
  return useOptimizedMultilingualData('ashaar', params, {
    ...options,
    contentType: 'ashaar'
  });
}

export function useOptimizedGhazlenData(
  params: OptimizedDataParams = {},
  options: Omit<UseOptimizedDataOptions, 'contentType'> = {}
) {
  return useOptimizedMultilingualData('ghazlen', params, {
    ...options,
    contentType: 'ghazlen'
  });
}

export function useOptimizedNazmenData(
  params: OptimizedDataParams = {},
  options: Omit<UseOptimizedDataOptions, 'contentType'> = {}
) {
  return useOptimizedMultilingualData('nazmen', params, {
    ...options,
    contentType: 'nazmen'
  });
}

export function useOptimizedRubaiData(
  params: OptimizedDataParams = {},
  options: Omit<UseOptimizedDataOptions, 'contentType'> = {}
) {
  return useOptimizedMultilingualData('rubai', params, {
    ...options,
    contentType: 'rubai'
  });
}

export function useOptimizedShaerData(
  params: OptimizedDataParams = {},
  options: Omit<UseOptimizedDataOptions, 'contentType'> = {}
) {
  return useOptimizedMultilingualData('shaer', params, {
    ...options,
    contentType: 'shaer'
  });
}