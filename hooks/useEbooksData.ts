"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { buildAirtableAPIURL } from "@/lib/url-builder";
import { useMemo } from "react";
import useSWRInfinite from "swr/infinite";
import { useDebouncedValue } from "./useDebouncedValue";

export interface EbooksListParams {
  pageSize?: number;
  filterByFormula?: string;
  fields?: string[];
  sort?: { field: string; direction?: "asc" | "desc" }[];
  search?: string;
  extra?: Record<string, any>;
}

export interface UseEbooksDataOptions {
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  debounceMs?: number;
  enabled?: boolean;
  initialData?: any;
}

// Book interface for type safety
export interface Book {
  filename: string;
  height: number;
  id: string;
  size: number;
  thumbnails: {
    full: { height: number; url: string; width: number; };
    large: { height: number; url: string; width: number; };
    small: { height: number; url: string; width: number; };
  };
  type: string;
  url: string;
  width: number;
}

export interface EBooksType {
  fields: {
    bookName: string;
    enBookName: string;
    hiBookName: string;
    publishingDate: string;
    writer: string;
    enWriter: string;
    hiWriter: string;
    desc: string;
    enDesc: string;
    hiDesc: string;
    book: Book[];
    likes: number;
  };
  id: string;
  createdTime: string;
}

// Enhanced fetcher that uses absolute URLs for client-side requests
const ebooksFetcher = async (url: string) => {
  try {
    console.log('Ebooks fetcher - URL:', url);
    const response = await fetch(url);
    console.log('Ebooks fetcher - Response status:', response.status);
    if (!response.ok) {
      console.error('Ebooks fetcher - Error response:', response.status, response.statusText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    console.log('Ebooks fetcher - Data received:', data);
    return data;
  } catch (error) {
    console.error("Ebooks fetch error:", error);
    throw error;
  }
};

export function useEbooksData(
  params: EbooksListParams = {},
  options: UseEbooksDataOptions = {}
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

    // Handle sort array - default to creation time descending for ebooks
    if (params.sort && params.sort.length) {
      const sortString = params.sort
        .map(s => `${s.field}:${s.direction || 'desc'}`)
        .join(',');
      p.sort = sortString;
    } else {
      // Default sort by publishing date
      p.sort = 'publishingDate:desc';
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
    return buildAirtableAPIURL('ebooks', urlParams);
  };

  const swr = useSWRInfinite<any>(
    getKey,
    ebooksFetcher,
    {
      revalidateOnFocus: options.revalidateOnFocus ?? false,
      revalidateOnReconnect: options.revalidateOnReconnect ?? true,
      dedupingInterval: 60_000,
      fallbackData: options.initialData ? [{ records: options.initialData }] : undefined,
      onError: (error) => {
        console.error("Ebooks SWR error:", error);
      },
    }
  );

  // Memoize derived arrays/values so consumers don't get a new reference each render
  const records = useMemo(() => {
    console.log('Ebooks hook - SWR data:', swr.data);
    const result = (swr.data ?? []).flatMap((page: any) => {
      console.log('Ebooks hook - Processing page:', page);
      // Handle new data structure where records are nested under 'data'
      const pageData = page?.data || page;
      return pageData?.records ?? [];
    });
    console.log('Ebooks hook - Final records:', result);
    return result;
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

  // Optimistic update functions for ebooks
  const optimisticUpdate = useMemo(() => ({
    // Update a single ebook record optimistically (e.g., likes count)
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

    // Update download count optimistically
    incrementDownloads: (recordId: string) => {
      swr.mutate(
        (pages: any[] | undefined) => {
          if (!pages) return pages;
          return pages.map((page: any) => {
            // Handle new data structure where records are nested under 'data'
            const pageData = page?.data || page;
            const updatedRecords = (pageData?.records || []).map((record: any) =>
              record.id === recordId
                ? {
                  ...record,
                  fields: {
                    ...record.fields,
                    downloads: (record.fields.downloads || 0) + 1
                  }
                }
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

    // Update likes count optimistically
    updateLikes: (recordId: string, newLikesCount: number) => {
      swr.mutate(
        (pages: any[] | undefined) => {
          if (!pages) return pages;
          return pages.map((page: any) => {
            // Handle new data structure where records are nested under 'data'
            const pageData = page?.data || page;
            const updatedRecords = (pageData?.records || []).map((record: any) =>
              record.id === recordId
                ? {
                  ...record,
                  fields: {
                    ...record.fields,
                    likes: newLikesCount
                  }
                }
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

    // Revert optimistic updates by revalidating
    revert: () => {
      swr.mutate();
    },
  }), [swr]);

  // Download tracking function with error handling
  const trackDownload = useMemo(() => ({
    // Track download with proper error handling
    trackBookDownload: async (recordId: string, bookUrl: string) => {
      try {
        // Optimistically increment download count
        optimisticUpdate.incrementDownloads(recordId);

        // Track the download on the server (if you have analytics)
        // This is optional and can be implemented based on your needs
        if (typeof window !== 'undefined') {
          // Client-side download tracking
          console.log(`Download tracked for book ${recordId}: ${bookUrl}`);

          // You can add analytics tracking here
          // Example: gtag('event', 'download', { book_id: recordId });
        }

        return true;
      } catch (error) {
        console.error("Failed to track download:", error);
        // Revert optimistic update on error
        optimisticUpdate.revert();
        return false;
      }
    },

    // Handle download failures
    handleDownloadError: (recordId: string, error: Error) => {
      console.error(`Download failed for book ${recordId}:`, error);

      // You can implement user notification here
      // Example: toast.error("Download failed. Please try again.");

      // Revert any optimistic updates
      optimisticUpdate.revert();
    },
  }), [optimisticUpdate]);

  return {
    ...swr,
    records: records as EBooksType[],
    hasMore,
    loadMore,
    cacheKey,
    optimisticUpdate,
    trackDownload,
  } as const;
}