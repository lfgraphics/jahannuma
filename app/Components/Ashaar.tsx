"use client";
import DataCard from "@/app/Components/DataCard";
import type { AirtableRecord, AshaarRecord } from "@/app/types";
import { useAirtableList } from "@/hooks/airtable/useAirtableList";
import { useShareAction } from "@/hooks/useShareAction";
import { formatAshaarRecord } from "@/lib/airtable-utils";
import { useMemo } from "react";

const BASE_ID = "appeI2xzzyvUN5bR7";
const TABLE = "Ashaar";

export default function Ashaar() {
  const { records, isLoading } = useAirtableList<AirtableRecord<AshaarRecord>>(
    "ashaar",
    { pageSize: 30 }
  );
  const items = useMemo(
    () => (records || []).map(formatAshaarRecord),
    [records]
  );
  const share = useShareAction({ section: "Ashaar", title: "" });

  return (
    <div
      dir="rtl"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 m-3"
    >
      {!isLoading &&
        items.map((rec, index) => (
          <DataCard
            key={rec.id}
            page="rand"
            shaerData={rec as any}
            index={index}
            download={false}
            baseId={BASE_ID}
            table={TABLE}
            storageKey="Ashaar"
            toggleanaween={() => {}}
            openanaween={null}
            handleCardClick={() => {}}
            handleShareClick={(rec: any) =>
              share.handleShare({
                baseId: BASE_ID,
                table: TABLE,
                recordId: (rec as AirtableRecord<AshaarRecord>).id,
                title: (rec as AirtableRecord<AshaarRecord>).fields.shaer,
                textLines:
                  (rec as AirtableRecord<AshaarRecord>).fields.ghazalHead || [],
                slugId: (rec as AirtableRecord<AshaarRecord>).fields.slugId,
                currentShares:
                  (rec as AirtableRecord<AshaarRecord>).fields.shares ?? 0,
              })
            }
            openComments={() => {}}
          />
        ))}
    </div>
  );
}
