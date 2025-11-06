"use client";
import { useAirtableList } from "@/hooks/airtable/useAirtableList";
import { formatBookRecord } from "@/lib/airtable-utils";
import { useMemo } from "react";
import Card from "./BookCard";

export default function EBooks() {
  const { records, isLoading } = useAirtableList<any>("ebooks", {
    pageSize: 30,
  });
  const items = useMemo(() => (records || []).map(formatBookRecord), [records]);

  return (
    <div
      id="section"
      dir="rtl"
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 m-3"
    >
      {!isLoading &&
        items.map((rec: any) => (
          <Card key={rec.id} data={rec} showLikeButton storageKey="Books" />
        ))}
    </div>
  );
}
