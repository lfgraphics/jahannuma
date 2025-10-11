"use client";
import { RouteSlug } from "@/lib/airtable/airtable-constants";
import { useState } from "react";
import { mutate } from "swr";

export function useAirtableCreate(table: RouteSlug) {
  const [isCreating, setCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function createRecord(fields: Record<string, any>) {
    setCreating(true);
    setError(null);

    try {
      const response = await fetch(`/api/airtable/${table}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields }),
      });

      if (!response.ok) {
        throw new Error(
          `Create failed: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();

      // Revalidate all keys for this table to include the new record
      await mutate(
        (key: any) =>
          typeof key === "string" && key.includes(`/api/airtable/${table}`),
        undefined,
        { revalidate: true }
      );

      return result;
    } catch (e: any) {
      setError(e);
      throw e;
    } finally {
      setCreating(false);
    }
  }

  return { createRecord, isCreating, error } as const;
}
