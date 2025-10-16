"use client";
import { RouteSlug } from "@/lib/airtable/airtable-constants";
import type { AirtableListParams } from "@/types";
import { useMemo } from "react";
import useSWRInfinite from "swr/infinite";
import { useDebouncedValue } from "../utils/useDebouncedValue";

export type ListParams = AirtableListParams;

export interface UseAirtableListOptions {
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  debounceMs?: number;
  enabled?: boolean;
}
// }

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
  table: RouteSlug,
  params: ListParams = {},
  options: UseAirtableListOptions = {}
) {
  // Debounce search/filter to avoid per-keystroke requests
  const debounceMs = options.debounceMs ?? 300;
  const debouncedSearch = useDebouncedValue(params.search, debounceMs);
  const debouncedFilter = useDebouncedValue(params.filterByFormula, debounceMs);

  // Pre-normalize fields and sort into stable strings for better memoization
  const fieldsKey = useMemo(() => {
    return params.fields && params.fields.length
      ? params.fields.slice().sort().join(",")
      : "";
  }, [params.fields]);

  const sortKey = useMemo(() => {
    return params.sort && params.sort.length
      ? params.sort
          .map((s) => `${s.field}:${s.direction || "asc"}`)
          .sort()
          .join(",")
      : "";
  }, [params.sort]);

  const extraKey = useMemo(() => {
    return params.extra && Object.keys(params.extra).length > 0
      ? Object.keys(params.extra)
          .sort()
          .map((key) => `${key}=${params.extra![key]}`)
          .join("&")
      : "";
  }, [params.extra]);

  const queryParams = useMemo(() => {
    const searchParams = new URLSearchParams();

    // Add pagination
    searchParams.set("pageSize", String(params.pageSize ?? 50));

    // Add filter
    if (debouncedFilter) {
      searchParams.set("filterByFormula", debouncedFilter);
    }

    // Add fields
    if (fieldsKey) {
      searchParams.set("fields", fieldsKey);
    }

    // Add sort
    if (sortKey) {
      searchParams.set("sort", sortKey);
    }

    // Add search
    if (debouncedSearch) {
      searchParams.set("search", debouncedSearch);
    }

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
    fieldsKey,
    sortKey,
    debouncedSearch,
    extraKey,
  ]);

  const getKey = (pageIndex: number, previousPageData: any) => {
    if (options.enabled === false) return null;
    if (previousPageData && !previousPageData.data?.offset) return null; // reached end

    const baseUrl = `/api/airtable/${table}`;
    const searchParams = new URLSearchParams(queryParams);

    if (pageIndex > 0 && previousPageData?.data?.offset) {
      searchParams.set("offset", previousPageData.data.offset);
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
    return (swr.data ?? []).flatMap((page: any) => page?.data?.records ?? []);
  }, [swr.data]);

  const hasMore = useMemo(() => {
    return !!(swr.data && swr.data[swr.data.length - 1]?.data?.offset);
  }, [swr.data]);

  const loadMore = () => swr.setSize((size) => size + 1);

  return {
    ...swr,
    records: records as T[],
    hasMore,
    loadMore,
  } as const;
}
