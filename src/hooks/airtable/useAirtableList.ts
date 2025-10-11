"use client";
import { useMemo } from "react";
import useSWRInfinite from "swr/infinite";
import { useLanguage } from "../../../contexts/LanguageContext";
import { useDebouncedValue } from "../utils/useDebouncedValue";

export interface ListParams {
  pageSize?: number;
  filterByFormula?: string;
  fields?: string[];
  sort?: { field: string; direction?: "asc" | "desc" }[];
  search?: string;
  extra?: Record<string, any>;
}

export interface UseAirtableListOptions {
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  debounceMs?: number;
  enabled?: boolean;
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`
    );
  }
  return response.json();
};

export function useAirtableList<T = any>(
  table: string,
  params: ListParams = {},
  options: UseAirtableListOptions = {}
) {
  const { language } = useLanguage();

  // Debounce search/filter to avoid per-keystroke requests
  const debounceMs = options.debounceMs ?? 300;
  const debouncedSearch = useDebouncedValue(params.search, debounceMs);
  const debouncedFilter = useDebouncedValue(params.filterByFormula, debounceMs);

  const queryParams = useMemo(() => {
    const searchParams = new URLSearchParams();

    // Add pagination
    searchParams.set("pageSize", String(params.pageSize ?? 50));

    // Add filter
    if (debouncedFilter) {
      searchParams.set("filterByFormula", debouncedFilter);
    }

    // Add fields
    if (params.fields && params.fields.length) {
      searchParams.set("fields", params.fields.join(","));
    }

    // Add sort
    if (params.sort && params.sort.length) {
      const sortStr = params.sort
        .map((s) => `${s.field}:${s.direction || "asc"}`)
        .join(",");
      searchParams.set("sort", sortStr);
    }

    // Add search
    if (debouncedSearch) {
      searchParams.set("search", debouncedSearch);
    }

    // Add language
    searchParams.set("lang", language);

    // Add extra params
    if (params.extra) {
      Object.entries(params.extra).forEach(([key, value]) => {
        searchParams.set(key, String(value));
      });
    }

    return searchParams.toString();
  }, [
    params.pageSize,
    debouncedFilter,
    JSON.stringify(params.fields),
    JSON.stringify(params.sort),
    debouncedSearch,
    JSON.stringify(params.extra),
    language,
  ]);

  const getKey = (pageIndex: number, previousPageData: any) => {
    if (options.enabled === false) return null;
    if (previousPageData && !previousPageData.offset) return null; // reached end

    const baseUrl = `/api/airtable/${table}`;
    const searchParams = new URLSearchParams(queryParams);

    if (pageIndex > 0 && previousPageData?.offset) {
      searchParams.set("offset", previousPageData.offset);
    }

    return `${baseUrl}?${searchParams.toString()}`;
  };

  const swr = useSWRInfinite<any>(getKey, fetcher, {
    revalidateOnFocus: options.revalidateOnFocus ?? false,
    revalidateOnReconnect: options.revalidateOnReconnect ?? true,
    dedupingInterval: 60_000,
  });

  // Memoize derived arrays/values so consumers don't get a new reference each render
  const records = useMemo(() => {
    return (swr.data ?? []).flatMap((page: any) => page?.records ?? []);
  }, [swr.data]);

  const hasMore = useMemo(() => {
    return !!(swr.data && swr.data[swr.data.length - 1]?.offset);
  }, [swr.data]);

  const loadMore = () => swr.setSize((size) => size + 1);

  return {
    ...swr,
    records: records as T[],
    hasMore,
    loadMore,
  } as const;
}
