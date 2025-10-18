"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { getHydrationBridge, useHydration } from "@/lib/hydration-bridge";
import { getUniversalFetcher } from "@/lib/universal-data-fetcher";
import { buildAirtableAPIURL } from "@/lib/url-builder";
import { useCallback, useEffect, useMemo } from "react";
import useSWRInfinite from "swr/infinite";
import { useDebouncedValue } from "./useDebouncedValue";

export interface NazmenListParams {
  pageSize?: number;
  filterByFormula?: string;
  fields?: string[];
  sort?: { field: string; direction?: "asc" | "desc" }[];
  search?: string;
  extra?: Record<string, any>;
}

export interface UseNazmenDataOptions {
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  debounceMs?: number;
  enabled?: boolean;
  initialData?: any;
  /** Server-side hydration data */
  hydrationData?: string;
  /** Enable debug logging */
  debug?: boolean;
  /** Cache revalidation time in milliseconds */
  cacheRevalidate?: number;
  /** Whether to throw errors or use fallbacks */
  throwOnError?: boolean;
}

// Enhanced fetcher that uses absolute URLs for client-side requests
const nazmenFetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

export function useNazmenData(
  params: NazmenListParams = {},
  options: UseNazmenDataOptions = {}
) {
  const { language } = useLanguage();

  // Debounce search/filter to avoid per-keystroke requests
  const debounceMs = options.debounceMs ?? 300;
  const debouncedSearch = useDebouncedValue(params.search, debounceMs);
  const debouncedFilter = useDebouncedValue(params.filterByFormula, debounceMs);

  // Handle hydration from server-side data
  const { isHydrated, data: hydratedData, error: hydrationError } = useHydration(
    options.hydrationData,
    options.initialData
  );

  // Debug logging
  const debug = options.debug ?? (process.env.NODE_ENV === 'development');

  useEffect(() => {
    if (debug && hydrationError) {
      console.error('Nazmen hydration error:', hydrationError);
    }
    if (debug && hydratedData) {
      console.debug('Nazmen hydrated with data:', {
        recordCount: hydratedData?.records?.length,
        source: 'server'
      });
    }
  }, [debug, hydrationError, hydratedData]);

  const queryParams = useMemo(() => {
    const p: Record<string, any> = {
      pageSize: params.pageSize ?? 30,
      ...(params.extra || {})
    };

    if (debouncedFilter) p["filterByFormula"] = debouncedFilter;

    // Handle fields array
    if (params.fields && params.fields.length) {
      p.fields = params.fields.join(',');
    }

    // Handle sort array
    if (params.sort && params.sort.length) {
      const sortString = params.sort
        .map(s => `${s.field}:${s.direction || 'desc'}`)
        .join(',');
      p.sort = sortString;
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

  const getKey = (pageIndex: number, previousPageData: any): string | null => {
    if (options.enabled === false) return null;

    // Handle new data structure where offset is nested under 'data'
    const pageData = previousPageData?.data || previousPageData;
    if (previousPageData && !pageData?.offset) return null; // reached end

    const offset = pageIndex === 0 ? undefined : pageData?.offset;
    const urlParams = { ...queryParams };
    if (offset) {
      urlParams.offset = offset;
    }

    // Use absolute URL for client-side requests
    return buildAirtableAPIURL('nazmen', urlParams);
  };

  // Enhanced SWR configuration with caching and revalidation strategies
  const swrConfig = useMemo(() => ({
    revalidateOnFocus: options.revalidateOnFocus ?? false,
    revalidateOnReconnect: options.revalidateOnReconnect ?? true,
    dedupingInterval: 60_000, // 1 minute deduplication
    refreshInterval: options.cacheRevalidate ?? 300_000, // 5 minutes background refresh
    errorRetryCount: 3,
    errorRetryInterval: 5000,
    fallbackData: (() => {
      // Prioritize hydrated data over initial data
      if (hydratedData) {
        return [hydratedData];
      }
      if (options.initialData) {
        return [options.initialData];
      }
      return undefined;
    })(),
    onError: (error: Error, key: string) => {
      console.error('Nazmen SWR error:', error, { key });

      // Don't throw errors in production unless explicitly requested
      if (options.throwOnError && process.env.NODE_ENV === 'production') {
        throw error;
      }
    },
    onSuccess: (data: any, key: string) => {
      if (debug) {
        console.debug('Nazmen SWR success:', {
          key,
          recordCount: data?.records?.length
        });
      }
    },
  }), [
    options.revalidateOnFocus,
    options.revalidateOnReconnect,
    options.cacheRevalidate,
    options.throwOnError,
    hydratedData,
    options.initialData,
    debug
  ]);

  const swr = useSWRInfinite<any>(
    getKey,
    nazmenFetcher,
    swrConfig
  );

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

  // Generate cache key for optimistic updates and hydration
  const cacheKey = useMemo(() => {
    const firstPageKey = getKey(0, undefined as any);
    return firstPageKey || null;
  }, [queryParams]);

  // Enhanced cache management with hydration bridge
  const cacheManager = useMemo(() => {
    const hydrationBridge = getHydrationBridge();

    return {
      // Serialize current data for potential server-side use
      serialize: () => {
        if (swr.data && swr.data.length > 0) {
          return hydrationBridge.serializeServerData(
            swr.data[0],
            cacheKey || 'nazmen-fallback',
            {
              baseId: 'nazmen',
              table: 'nazmen',
              params: queryParams,
            }
          );
        }
        return null;
      },

      // Check if current data needs revalidation
      needsRevalidation: () => {
        if (!hydratedData) return false;

        const hydrationData = {
          data: hydratedData,
          cacheKey: cacheKey || 'nazmen-fallback',
          timestamp: Date.now() - (options.cacheRevalidate ?? 300_000),
          source: 'server' as const,
        };

        return hydrationBridge.needsRevalidation(hydrationData);
      },
    };
  }, [swr.data, cacheKey, queryParams, hydratedData, options.cacheRevalidate]);

  // Enhanced optimistic update functions with better error handling
  const optimisticUpdate = useMemo(() => ({
    // Update a single record optimistically
    updateRecord: (recordId: string, updates: Record<string, any>) => {
      if (debug) {
        console.debug('Nazmen optimistic update:', { recordId, updates });
      }

      swr.mutate(
        (pages: any[] | undefined) => {
          if (!pages) return pages;
          return pages.map((page: any) => {
            // Handle new data structure where records are nested under 'data'
            const pageData = page?.data || page;
            const updatedRecords = (pageData?.records || []).map((record: any) =>
              record.id === recordId
                ? { ...record, fields: { ...record.fields, ...updates } }
                : record
            );

            // Preserve the original structure
            if (page?.data) {
              return {
                ...page,
                data: {
                  ...pageData,
                  records: updatedRecords,
                }
              };
            } else {
              return {
                ...page,
                records: updatedRecords,
              };
            }
          });
        },
        { revalidate: false }
      );
    },

    // Add a new record optimistically
    addRecord: (newRecord: any) => {
      if (debug) {
        console.debug('Nazmen optimistic add:', { recordId: newRecord.id });
      }

      swr.mutate(
        (pages: any[] | undefined) => {
          if (!pages || pages.length === 0) {
            return [{ data: { records: [newRecord], offset: undefined } }];
          }

          const updatedPages = [...pages];
          const firstPage = updatedPages[0];
          const firstPageData = firstPage?.data || firstPage;

          if (firstPage?.data) {
            updatedPages[0] = {
              ...firstPage,
              data: {
                ...firstPageData,
                records: [newRecord, ...(firstPageData?.records || [])],
              }
            };
          } else {
            updatedPages[0] = {
              ...firstPage,
              records: [newRecord, ...(firstPageData?.records || [])],
            };
          }

          return updatedPages;
        },
        { revalidate: false }
      );
    },

    // Remove a record optimistically
    removeRecord: (recordId: string) => {
      if (debug) {
        console.debug('Nazmen optimistic remove:', { recordId });
      }

      swr.mutate(
        (pages: any[] | undefined) => {
          if (!pages) return pages;
          return pages.map((page: any) => {
            // Handle new data structure where records are nested under 'data'
            const pageData = page?.data || page;
            const filteredRecords = (pageData?.records || []).filter((record: any) => record.id !== recordId);

            // Preserve the original structure
            if (page?.data) {
              return {
                ...page,
                data: {
                  ...pageData,
                  records: filteredRecords,
                }
              };
            } else {
              return {
                ...page,
                records: filteredRecords,
              };
            }
          });
        },
        { revalidate: false }
      );
    },

    // Revert optimistic updates by revalidating
    revert: () => {
      if (debug) {
        console.debug('Nazmen reverting optimistic updates');
      }
      swr.mutate();
    },

    // Batch update multiple records
    batchUpdate: (updates: Array<{ recordId: string; updates: Record<string, any> }>) => {
      if (debug) {
        console.debug('Nazmen batch optimistic update:', { count: updates.length });
      }

      swr.mutate(
        (pages: any[] | undefined) => {
          if (!pages) return pages;

          const updateMap = new Map(updates.map(u => [u.recordId, u.updates]));

          return pages.map((page: any) => {
            // Handle new data structure where records are nested under 'data'
            const pageData = page?.data || page;
            const updatedRecords = (pageData?.records || []).map((record: any) => {
              const recordUpdates = updateMap.get(record.id);
              return recordUpdates
                ? { ...record, fields: { ...record.fields, ...recordUpdates } }
                : record;
            });

            // Preserve the original structure
            if (page?.data) {
              return {
                ...page,
                data: {
                  ...pageData,
                  records: updatedRecords,
                }
              };
            } else {
              return {
                ...page,
                records: updatedRecords,
              };
            }
          });
        },
        { revalidate: false }
      );
    },
  }), [swr, debug]);

  // Enhanced return object with additional utilities
  return {
    ...swr,
    records,
    hasMore,
    loadMore,
    cacheKey,
    optimisticUpdate,
    cacheManager,
    // Hydration status
    isHydrated,
    hydrationError,
    // Enhanced loading states
    isInitialLoading: !swr.data && !swr.error,
    isLoadingMore: swr.isValidating && swr.data && swr.data.length > 0,
    isEmpty: swr.data?.[0]?.records?.length === 0,
    // Enhanced error handling
    hasError: !!(swr.error || hydrationError),
    errorMessage: swr.error?.message || hydrationError?.message,
    // Revalidation utilities
    refresh: useCallback(() => {
      if (debug) {
        console.debug('Nazmen manual refresh triggered');
      }
      return swr.mutate();
    }, [swr, debug]),
    // Cache utilities
    clearCache: useCallback(() => {
      if (debug) {
        console.debug('Nazmen cache cleared');
      }
      swr.mutate(undefined, { revalidate: true });
    }, [swr, debug]),
  } as const;
}/**
 * 
Server-side data fetching function for Nazmen
 * This function can be used in getServerSideProps or Server Components
 */
export async function fetchNazmenDataServer(
  params: NazmenListParams = {},
  options: {
    debug?: boolean;
    fallbackData?: any;
    throwOnError?: boolean;
  } = {}
) {
  try {
    const universalFetcher = getUniversalFetcher();
    const { debug = false, fallbackData = null, throwOnError = false } = options;

    if (debug) {
      console.log('Server-side Nazmen fetch:', params);
    }

    // Prepare Airtable list parameters
    const airtableParams: Record<string, any> = {
      pageSize: params.pageSize ?? 30,
      ...(params.extra || {}),
    };

    if (params.filterByFormula) {
      airtableParams.filterByFormula = params.filterByFormula;
    }

    if (params.fields && params.fields.length) {
      airtableParams.fields = params.fields.join(',');
    }

    if (params.sort && params.sort.length) {
      const sortString = params.sort
        .map(s => `${s.field}:${s.direction || 'desc'}`)
        .join(',');
      airtableParams.sort = sortString;
    }

    if (params.search) {
      airtableParams.search = params.search;
    }

    // Use universal fetcher for server-side data fetching
    const data: any = await universalFetcher.fetchList({
      kind: 'list',
      baseId: process.env.AIRTABLE_BASE_ID || 'default',
      table: 'nazmen',
      params: airtableParams,
    }, {
      cache: true,
      revalidate: 300000, // 5 minutes
      fallback: fallbackData,
      throwOnError,
      debug,
    });

    if (debug) {
      console.log('Server-side Nazmen fetch successful:', {
        recordCount: data?.records?.length,
      });
    }

    return data;
  } catch (error) {
    console.error('Server-side Nazmen fetch failed:', error);

    if (options.throwOnError) {
      throw error;
    }

    return options.fallbackData || { records: [], offset: null };
  }
}

/**
 * Create hydration data for client-side use
 * This function serializes server-fetched data for hydration
 */
export function createNazmenHydrationData(
  serverData: any,
  params: NazmenListParams = {}
): string {
  try {
    const hydrationBridge = getHydrationBridge();

    // Generate the cache key that would be used on client-side
    const queryParams: Record<string, any> = {
      pageSize: params.pageSize ?? 30,
      ...(params.extra || {}),
    };

    if (params.filterByFormula) queryParams.filterByFormula = params.filterByFormula;
    if (params.fields?.length) queryParams.fields = params.fields.join(',');
    if (params.sort?.length) {
      queryParams.sort = params.sort
        .map(s => `${s.field}:${s.direction || 'desc'}`)
        .join(',');
    }
    if (params.search) queryParams.search = params.search;

    const cacheKey = buildAirtableAPIURL('nazmen', queryParams);

    return hydrationBridge.serializeServerData(
      serverData,
      cacheKey,
      {
        baseId: 'nazmen',
        table: 'nazmen',
        params: queryParams,
      }
    );
  } catch (error) {
    console.error('Failed to create Nazmen hydration data:', error);
    return '';
  }
}