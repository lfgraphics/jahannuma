"use client";
import { RouteSlug } from "@/lib/airtable/airtable-constants";
import { useState } from "react";
import { mutate } from "swr";

type MutationOptions = {
  optimistic?: boolean;
  affectedKeys?: string[];
  updater?: (current: any) => any;
};

export function useAirtableMutation(table: RouteSlug) {
  const [isUpdating, setUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function updateRecord(
    recordId: string,
    fields: Record<string, any>,
    options: MutationOptions = {}
  ) {
    setUpdating(true);
    setError(null);

    try {
      const { optimistic, affectedKeys, updater } = options;

      // Perform optimistic updates across listed keys
      let rollbackSnapshots: Array<{ key: string; snapshot: any }> = [];
      if (optimistic && affectedKeys && affectedKeys.length) {
        for (const key of affectedKeys) {
          const snapshot = mutate(
            key,
            (current: any) => {
              if (!updater) return current;
              return updater(current);
            },
            { revalidate: false }
          );

          const current = (await Promise.resolve(snapshot)) as any;
          rollbackSnapshots.push({ key, snapshot: current });
        }
      }

      const response = await fetch(`/api/airtable/${table}/${recordId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields }),
      });

      if (!response.ok) {
        throw new Error(
          `Update failed: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();

      // Revalidate affected keys
      if (affectedKeys && affectedKeys.length) {
        for (const key of affectedKeys) {
          await mutate(key);
        }
      } else {
        // Revalidate all keys for this table
        await mutate(
          (key: any) =>
            typeof key === "string" && key.includes(`/api/airtable/${table}`),
          undefined,
          { revalidate: true }
        );
      }

      return result;
    } catch (e: any) {
      setError(e);

      // If failed and we performed optimistic updates, rollback by revalidating keys
      if (options.optimistic && options.affectedKeys?.length) {
        for (const key of options.affectedKeys) {
          await mutate(key);
        }
      }
      throw e;
    } finally {
      setUpdating(false);
    }
  }

  async function createRecord(fields: Record<string, any>) {
    setUpdating(true);
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
      setUpdating(false);
    }
  }

  return { updateRecord, createRecord, isUpdating, error } as const;
}
