"use client";
import { RouteSlug } from "@/lib/airtable/airtable-constants";
import useSWR from "swr";

export interface UseAirtableRecordOptions {
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  enabled?: boolean; // when false, do not fetch even if recordId is provided
}

export interface UserMetadata {
  userId: string;
  isLiked: boolean;
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

export function useAirtableRecord<T = any>(
  table: RouteSlug,
  recordId?: string | null,
  options: UseAirtableRecordOptions = {}
) {
  const key =
    options.enabled === false || !recordId
      ? null
      : `/api/airtable/${table}/${recordId}`;

  const {
    data: rawData,
    error,
    isLoading,
    mutate,
  } = useSWR<any>(key, fetcher, {
    revalidateOnFocus: options.revalidateOnFocus ?? false,
    revalidateOnReconnect: options.revalidateOnReconnect ?? true,
    dedupingInterval: 60_000,
  });

  // Extract the actual record and userMetadata from the wrapped response
  const data = rawData?.data?.record || rawData;
  const userMetadata = rawData?.data?.userMetadata;

  return {
    data: data as T,
    userMetadata: userMetadata as UserMetadata | undefined,
    error,
    isLoading,
    mutate,
  } as const;
}
