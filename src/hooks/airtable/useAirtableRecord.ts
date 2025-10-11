"use client";
import useSWR from "swr";
import { useLanguage } from "../../../contexts/LanguageContext";

export interface UseAirtableRecordOptions {
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  enabled?: boolean; // when false, do not fetch even if recordId is provided
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
  table: string,
  recordId?: string | null,
  options: UseAirtableRecordOptions = {}
) {
  const { language } = useLanguage();

  const key =
    options.enabled === false || !recordId
      ? null
      : `/api/airtable/${table}/${recordId}?lang=${language}`;

  const { data, error, isLoading, mutate } = useSWR<T>(key, fetcher, {
    revalidateOnFocus: options.revalidateOnFocus ?? false,
    revalidateOnReconnect: options.revalidateOnReconnect ?? true,
    dedupingInterval: 60_000,
  });

  return { data, error, isLoading, mutate } as const;
}
