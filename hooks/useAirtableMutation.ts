"use client";
import { useState } from "react";
import { mutate } from "swr";
import { invalidateAirtable } from "@/lib/airtable-fetcher";

type PatchPayload = {
  records: Array<{ id: string; fields: Record<string, any> }>;
};

async function patchAirtable(baseId: string, table: string, body: PatchPayload) {
  const res = await fetch(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_Api_Token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Airtable PATCH failed: ${res.status} ${text}`);
  }
  return res.json();
}

type OptimisticOptions = {
  optimistic?: boolean;
  // SWR keys to update optimistically. Can be AirtableSWRKey objects or string keys used in components
  affectedKeys?: any[];
  // Optional updater to transform existing data shape per key
  updater?: (current: any) => any;
};

export function useAirtableMutation(baseId: string, table: string) {
  const [isUpdating, setUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function updateRecord(records: Array<{ id: string; fields: Record<string, any> }>, options: OptimisticOptions = {}) {
    setUpdating(true);
    setError(null);
    try {
      const { optimistic, affectedKeys, updater } = options;

      // Perform optimistic updates across listed keys
      let rollbackSnapshots: Array<{ key: any; snapshot: any }> = [];
      if (optimistic && affectedKeys && affectedKeys.length) {
        for (const key of affectedKeys) {
          const snapshot = mutate(key, (current: any) => {
            if (!updater) return current; // if no updater supplied, leave as is for now
            return updater(current);
          }, { revalidate: false });
          // mutate returns a Promise of new value; we also want to be able to rollback
          // Store the current value synchronously by separate get call
          const current = (await Promise.resolve(snapshot)) as any;
          rollbackSnapshots.push({ key, snapshot: current });
        }
      }

      const payload: PatchPayload = { records };
      const json = await patchAirtable(baseId, table, payload);
      // Invalidate session cache for this table and trigger SWR revalidation
      invalidateAirtable(baseId, table);
      if (affectedKeys && affectedKeys.length) {
        for (const key of affectedKeys) {
          await mutate(key); // revalidate each explicitly affected key
        }
      } else {
        // No explicit keys provided: revalidate all SWR caches for this base/table
        await mutate(
          (key: any) =>
            typeof key === "object" && key?.baseId === baseId && key?.table === table,
          undefined,
          { revalidate: true }
        );
      }
      return json;
    } catch (e: any) {
      setError(e);
      // If failed and we performed optimistic updates, rollback by revalidating keys to refetch
      if (options.optimistic && options.affectedKeys?.length) {
        for (const key of options.affectedKeys) {
          await mutate(key); // Revalidate to fetch fresh data from server
        }
      }
      throw e;    } finally {
      setUpdating(false);
    }
  }

  return { updateRecord, isUpdating, error } as const;
}
