"use client";
import DataCard from "@/app/Components/DataCard";
import type { AirtableRecord, NazmenRecord } from "@/app/types";
import { useAirtableList } from "@/hooks/airtable/useAirtableList";
import { useShareAction } from "@/hooks/useShareAction";
import { formatNazmenRecord } from "@/lib/airtable-utils";
import { useMemo } from "react";

const BASE_ID = "app5Y2OsuDgpXeQdz";
const TABLE = "nazmen";

export default function Nazmen() {
  const { records, isLoading } = useAirtableList<AirtableRecord<NazmenRecord>>(
    "nazmen",
    { pageSize: 30 }
  );
  const items = useMemo(
    () => (records || []).map(formatNazmenRecord),
    [records]
  );
  const share = useShareAction({ section: "Nazmen", title: "" });

  return (
    <div
      dir="rtl"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 m-3"
    >
      {!isLoading &&
        items.map((rec, index) => (
          <DataCard
            key={rec.id}
            page="nazm"
            shaerData={rec as any}
            index={index}
            download={false}
            storageKey="Nazmen"
            toggleanaween={() => {}}
            openanaween={null}
            handleCardClick={() => {}}
            handleShareClick={(rec: any) => {
              const r = rec as AirtableRecord<NazmenRecord>;
              const headArr = Array.isArray(r.fields.ghazalLines)
                ? r.fields.ghazalLines
                : String(r.fields.nazm || "").split("\n");
              return share.handleShare({
                baseId: BASE_ID,
                table: TABLE,
                recordId: r.id,
                title: r.fields.shaer,
                textLines: headArr,
                slugId: r.fields.slugId,
                currentShares: r.fields.shares ?? 0,
              });
            }}
            openComments={() => {}}
          />
        ))}
    </div>
  );
}
