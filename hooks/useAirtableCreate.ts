"use client";
import { useState } from "react";
import { invalidateAirtable } from "@/lib/airtable-fetcher";

type CreatePayload = {
  records: Array<{ fields: Record<string, any> }>;
};

async function postAirtable(baseId: string, table: string, body: CreatePayload) {
  const res = await fetch(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_Api_Token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Airtable POST failed: ${res.status} ${text}`);
  }
  return res.json();
}

export function useAirtableCreate(baseId: string, table: string) {
  const [isCreating, setCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function createRecord(records: Array<{ fields: Record<string, any> }>) {
    setCreating(true);
    setError(null);
    try {
      const payload: CreatePayload = { records };
      const json = await postAirtable(baseId, table, payload);
      // Invalidate caches for this table
      invalidateAirtable(baseId, table);
      return json;
    } catch (e: any) {
      setError(e);
      throw e;
    } finally {
      setCreating(false);
    }
  }

  return { createRecord, isCreating, error } as const;
}
