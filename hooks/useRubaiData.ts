"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { buildAirtableAPIURL } from "@/lib/url-builder";
import { useMemo } from "react";
import useSWRInfinite from "swr/infinite";
import { useDebouncedValue } from "./useDebouncedValue";

export interface RubaiListParams {
  pageSize?: number;
  filterByFormula?: string;
  fields?: string[];
  sort?: { field: string; direction?: "asc" | "desc" }[];
  search?: string;
  extra?: Record<string, any>;
}

export interface UseRubaiDataOptions {
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  debounceMs?: number;
  enabled?: boolean;
  initialData?: any;
}

// Enhanced fetcher that uses absolute URLs for client-side requests
const rubaiFetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

export function useRubaiData(
  params: RubaiListParams = {},
  options: UseRubaiDataOptions = {}
) {
  const { language } = useLanguage();

  // Debounce search/filter to avoid per-keystroke requests
  const debounceMs = options.debounceMs ?? 300;
  const debouncedSearch = useDebouncedValue(params.search, debounceMs);
  const debouncedFilter = useDebouncedValue(params.filterByFormula, debounceMs);

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
    return buildAirtableAPIURL('rubai', urlParams);
  };

  const swr = useSWRInfinite<any>(
    getKey,
    rubaiFetcher,
    {
      revalidateOnFocus: options.revalidateOnFocus ?? false,
      revalidateOnReconnect: options.revalidateOnReconnect ?? true,
      dedupingInterval: 60_000,
      fallbackData: options.initialData && options.initialData.records ? [options.initialData] : undefined,
    }
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

  // Generate cache key for optimistic updates
  const cacheKey = useMemo(() => {
    const firstPageKey = getKey(0, undefined as any);
    return firstPageKey || null;
  }, [queryParams]);

  // Optimistic update functions
  const optimisticUpdate = useMemo(() => ({
    // Update a single record optimistically
    updateRecord: (recordId: string, updates: Record<string, any>) => {
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
      swr.mutate();
    },
  }), [swr]);

  return {
    ...swr,
    records,
    hasMore,
    loadMore,
    cacheKey,
    optimisticUpdate,
  } as const;
}