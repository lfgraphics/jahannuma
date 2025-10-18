"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useOptimizedPerformance } from "@/lib/tree-shaking-optimizer";
import { useCallback, useMemo } from "react";
import { useDebouncedValue } from "./useDebouncedValue";

// Lazy load heavy dependencies
const loadSWRInfinite = () => import("swr/infinite");
const loadURLBuilder = () => import("@/lib/url-builder");
const loadCacheStrategies = () => import("@/lib/cache-strategies");

export interface OptimizedAshaarListParams {
  pageSize?: number;
  filterByFormula?: string;
  fields?: string[];
  sort?: { field: string; direction?: "asc" | "desc" }[];
  search?: string;
  extra?: Record<string, any>;
}

export interface UseOptimizedAshaarDataOptions {
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  debounceMs?: number;
  enabled?: boolean;
  cache?: boolean;
}

export function useOptimizedAshaarData(
  params: OptimizedAshaarListParams = {},
  options: UseOptimizedAshaarDataOptions = {}
) {
  const { language } = useLanguage();
  const { trackRender } = useOptimizedPerformance();

  // Track component performance
  const endRender = trackRender('useOptimizedAshaarData');

  const {
    pageSize = 20,
    filterByFormula,
    fields,
    sort,
    search,
    extra = {}
  } = params;

  const {
    revalidateOnFocus = false,
    revalidateOnReconnect = true,
    debounceMs = 300,
    enabled = true,
    cache = true
  } = options;

  // Debounce search and filter to reduce API calls
  const debouncedSearch = useDebouncedValue(search, debounceMs);
  const debouncedFilter = useDebouncedValue(filterByFormula, debounceMs);

  // Memoize query parameters to prevent unnecessary re-renders
  const queryParams = useMemo(() => {
    const p: Record<string, any> = {
      pageSize: pageSize.toString(),
      ...extra
    };

    if (debouncedFilter) p["filterByFormula"] = debouncedFilter;
    if (fields && fields.length) p.fields = fields;

    if (sort && sort.length) {
      sort.forEach((s, i) => {
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
    pageSize,
    debouncedFilter,
    JSON.stringify(fields),
    JSON.stringify(sort),
    debouncedSearch,
    JSON.stringify(extra),
    language
  ]);

  // Optimized fetcher with caching
  const fetcher = useCallback(async (url: string) => {
    const [
      { default: useSWRInfinite },
      { buildAirtableAPIURL },
      { cache: cacheManager }
    ] = await Promise.all([
      loadSWRInfinite(),
      loadURLBuilder(),
      loadCacheStrategies()
    ]);

    // Check cache first if enabled
    if (cache) {
      const cacheKey = `ashaar:${url}`;
      const cached = cacheManager.get('airtable', cacheKey);
      if (cached) {
        return cached;
      }
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Cache the result
    if (cache && data) {
      const cacheKey = `ashaar:${url}`;
      cacheManager.set('airtable', cacheKey, data);
    }

    return data;
  }, [cache]);

  // SWR key generator - optimized to prevent unnecessary requests
  const getKey = useCallback((pageIndex: number, previousPageData: any) => {
    if (!enabled) return null;
    if (previousPageData && !previousPageData.offset) return null; // reached end

    const offset = pageIndex === 0 ? undefined : previousPageData?.offset;

    // Lazy load URL builder only when needed
    return loadURLBuilder().then(({ buildAirtableAPIURL }) => {
      const params = offset ? { ...queryParams, offset } : queryParams;
      return buildAirtableAPIURL("Ashaar", params);
    });
  }, [enabled, queryParams]);

  // Use dynamic import for SWR to reduce initial bundle size
  const swr = useMemo(() => {
    let swrHook: any = null;

    const loadAndUseSWR = async () => {
      if (!swrHook) {
        const { default: useSWRInfinite } = await loadSWRInfinite();
        swrHook = useSWRInfinite;
      }
      return swrHook;
    };

    // Return a promise-based hook wrapper
    return {
      async getData() {
        const useSWRInfinite = await loadAndUseSWR();
        return useSWRInfinite(getKey, fetcher, {
          revalidateOnFocus,
          revalidateOnReconnect,
          revalidateIfStale: true,
          dedupingInterval: 5000, // Dedupe requests within 5 seconds
        });
      }
    };
  }, [getKey, fetcher, revalidateOnFocus, revalidateOnReconnect]);

  // End performance tracking
  endRender();

  return swr;
}

// Export optimized version as default
export default useOptimizedAshaarData;