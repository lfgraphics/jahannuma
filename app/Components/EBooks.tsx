"use client";
import React, { useMemo } from "react";
import { useAirtableList } from "@/hooks/useAirtableList";
import Card from "./BookCard";
import { formatBookRecord } from "@/lib/airtable-utils";

const BASE_ID = "appXcBoNMGdIaSUyA";
const TABLE = "E-Books";

export default function EBooks() {
  const { records, isLoading, swrKey } = useAirtableList<any>(BASE_ID, TABLE, { pageSize: 30 });
  const items = useMemo(() => (records || []).map(formatBookRecord), [records]);

  return (
    <div id="section" dir="rtl" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 m-3">
      {!isLoading && items.map((rec: any) => (
        <Card key={rec.id} data={rec} showLikeButton baseId={BASE_ID} table={TABLE} storageKey="Books" swrKey={swrKey} />
      ))}
    </div>
  );
}
