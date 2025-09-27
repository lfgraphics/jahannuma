"use client";
import React, { useMemo } from "react";
import Card from "../../Components/BookCard";
import ComponentsLoader from "./ComponentsLoader";
import { useAirtableList } from "@/hooks/useAirtableList";
import type { AirtableRecord } from "@/app/types";

interface Props { takhallus: string }

const BASE_ID = "appXcBoNMGdIaSUyA";
const TABLE = "E-Books";

const EBooks: React.FC<Props> = ({ takhallus }) => {
  console.log("EBooks component rendered with takhallus:", takhallus);
  // E-Books uses writer fields, not {shaer}; build a safe filter for multiple locales
  const filterByFormula = useMemo(() => {
    // Normalize takhallus: decode URI, convert hyphens to spaces, strip ZWNJ/tatweel, collapse spaces
    let raw = takhallus || "";
    try { raw = decodeURIComponent(raw); } catch {}
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

  const { records, isLoading, swrKey } = useAirtableList<AirtableRecord<any>>(BASE_ID, TABLE, {
    filterByFormula,
    pageSize: 30,
  });
  const dataItems = records;

  return (
    <>
      {isLoading && <ComponentsLoader />}
      {!isLoading && (
        <div id="section" dir="rtl" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 m-3">
          {dataItems.length === 0 && (
            <div className="col-span-full h-[30vh] grid place-items-center text-muted-foreground">کوئی مواد نہیں ملا</div>
          )}
          {dataItems.map((item) => (
            <div className="relative" key={item.id}>
              <Card data={item} showLikeButton baseId={BASE_ID} table={TABLE} storageKey="Books" swrKey={swrKey} />
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default EBooks;
