"use client";
import DataCard from "@/app/Components/DataCard";
import type { AirtableRecord, AshaarRecord } from "@/app/types";
import { useAirtableList } from "@/hooks/airtable/useAirtableList";
import { useShareAction } from "@/hooks/useShareAction";
import { buildShaerFilter, formatAshaarRecord } from "@/lib/airtable-utils";
import React, { useMemo, useState } from "react";
import ComponentsLoader from "./ComponentsLoader";

interface Props {
  takhallus: string;
}

const BASE_ID = "appeI2xzzyvUN5bR7";
const TABLE = "Ashaar";

const Ashaar: React.FC<Props> = ({ takhallus }) => {
  const { records, isLoading } = useAirtableList<AirtableRecord<AshaarRecord>>(
    "ashaar",
    {
      filterByFormula: buildShaerFilter(takhallus),
      pageSize: 30,
    }
  );

  // Format records for UI
  const dataItems: AirtableRecord<AshaarRecord>[] = useMemo(() => {
    return (records || []).map((r: AirtableRecord<AshaarRecord>) =>
      formatAshaarRecord(r)
    );
  }, [records]);

  const [openanaween, setOpenanaween] = useState<string | null>(null);
  const toggleanaween = (cardId: string | null) =>
    setOpenanaween((prev) => (prev === cardId ? null : cardId));
  const handleCardClick = (_rec: AirtableRecord<AshaarRecord>) => {};
  const openComments = (_id: string) => {};
  const share = useShareAction({ section: "Ashaar", title: "" });

  return (
    <div
      dir="rtl"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 m-3"
    >
      {isLoading && <ComponentsLoader />}
      {!isLoading && dataItems.length === 0 && (
        <div className="h-[30vh] col-span-full grid place-items-center text-muted-foreground">
          کوئی مواد نہیں ملا
        </div>
      )}
      {!isLoading &&
        dataItems.map((rec, index) => (
          <DataCard
            key={rec.id}
            page="rand"
            shaerData={rec as any}
            index={index}
            download={false}
            storageKey="Ashaar"
            toggleanaween={toggleanaween}
            openanaween={openanaween}
            handleCardClick={handleCardClick as any}
            handleShareClick={(r: any) =>
              share.handleShare({
                recordId: (r as AirtableRecord<AshaarRecord>).id,
                title: (r as AirtableRecord<AshaarRecord>).fields.shaer,
                textLines:
                  (r as AirtableRecord<AshaarRecord>).fields.ghazalHead || [],
                slugId: (r as AirtableRecord<AshaarRecord>).fields.slugId,
                currentShares:
                  (r as AirtableRecord<AshaarRecord>).fields.shares ?? 0,
              })
            }
            openComments={openComments}
          />
        ))}
      {/* Share no longer requires login */}
    </div>
  );
};

export default Ashaar;
