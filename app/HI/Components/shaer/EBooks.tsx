"use client";
import type { AirtableRecord } from "@/app/types";
import React, { useEffect, useMemo, useState } from "react";
import Card from "../BookCard";
import ComponentsLoader from "./ComponentsLoader";

interface Props {
  takhallus: string;
}

const { getClientBaseId } = require("@/lib/airtable-client-utils");
const BASE_ID = getClientBaseId("EBOOKS");
const TABLE = "E-Books";

const EBooks: React.FC<Props> = ({ takhallus }) => {
  console.log("EBooks component rendered with takhallus:", takhallus);
  // E-Books uses writer fields, not {shaer}; build a safe filter for multiple locales
  const filterByFormula = useMemo(() => {
    // Normalize takhallus: decode URI, convert hyphens to spaces, strip ZWNJ/tatweel, collapse spaces
    let raw = takhallus || "";
    try {
      raw = decodeURIComponent(raw);
    } catch {}
    const normalized = raw
      .replace(/[\-–—]/g, " ")
      .replace(/[\u200C\u0640]/g, "") // strip ZWNJ and Tatweel
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
    if (!normalized) return undefined;
    const safe = normalized.replace(/\\/g, "\\\\").replace(/'/g, "''");
    console.log("EBooks filterByFormula:", safe);
    return `OR( FIND('${safe}', LOWER({writer})), FIND('${safe}', LOWER({enWriter})), FIND('${safe}', LOWER({hiWriter})) )`;
  }, [takhallus]);

  const [records, setRecords] = useState<AirtableRecord<any>[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!filterByFormula) {
        setRecords([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const params = new URLSearchParams({
          filterByFormula,
          pageSize: "30",
        });

        const response = await fetch(`/api/airtable/ebooks?${params}`);
        if (!response.ok) throw new Error("Failed to fetch");

        const result = await response.json();
        setRecords(result.data?.records || []);
      } catch (error) {
        console.error("Error fetching ebooks data:", error);
        setRecords([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [filterByFormula]);

  const dataItems = records;

  return (
    <>
      {isLoading && <ComponentsLoader />}
      {!isLoading && (
        <div
          id="section"
          dir="rtl"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 m-3"
        >
          {dataItems.length === 0 && (
            <div className="col-span-full h-[30vh] grid place-items-center text-muted-foreground">
              کوئی مواد نہیں ملا
            </div>
          )}
          {dataItems.map((item) => (
            <div className="relative" key={item.id}>
              <Card data={item} showLikeButton storageKey="Books" />
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default EBooks;
