"use client";
import React, { useEffect, useMemo, useState } from "react";
import ComponentsLoader from "./ComponentsLoader";
import { useAirtableList } from "@/hooks/useAirtableList";
import type { AirtableRecord, NazmenRecord } from "@/app/types";
import { buildShaerFilter, formatNazmenRecord } from "@/lib/airtable-utils";
import DataCard from "@/app/Components/DataCard";
import { useShareAction } from "@/hooks/useShareAction";

interface Props { takhallus: string }

const BASE_ID = "app5Y2OsuDgpXeQdz";
const TABLE = "nazmen";

const Nazmen: React.FC<Props> = ({ takhallus }) => {
  const [loading, setLoading] = useState(true);

  const { records, isLoading, swrKey } = useAirtableList<AirtableRecord<any>>(BASE_ID, TABLE, {
    filterByFormula: buildShaerFilter(takhallus),
    pageSize: 30,
  });
  const items = useMemo(() => records.map(formatNazmenRecord) as AirtableRecord<NazmenRecord>[], [records]);
  useEffect(() => { setLoading(isLoading); }, [isLoading]);

  const share = useShareAction({ section: "Nazmen", title: "" });

  const [openanaween, setOpenanaween] = useState<string | null>(null);
  const toggleanaween = (cardId: string | null) => setOpenanaween((prev) => (prev === cardId ? null : cardId));
  const handleCardClick = (_rec: AirtableRecord<NazmenRecord>) => {};
  const openComments = (_id: string) => {};

  return (
    <div dir="rtl" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 m-3">
      {loading && <ComponentsLoader />}
      {!loading && items.length === 0 && (
        <div className="h-[30vh] col-span-full grid place-items-center text-muted-foreground">کوئی مواد نہیں ملا</div>
      )}
      {!loading && items.map((rec, index) => (
        <DataCard
          key={rec.id}
          page="nazm"
          shaerData={rec as any}
          index={index}
          download={false}
          baseId={BASE_ID}
          table={TABLE}
          storageKey="Nazmen"
          swrKey={swrKey}
          toggleanaween={toggleanaween}
          openanaween={openanaween}
          handleCardClick={handleCardClick as any}
          handleShareClick={(r: any) => {
            const rr = r as AirtableRecord<NazmenRecord>;
            const lines = Array.isArray(rr.fields.ghazalLines) ? rr.fields.ghazalLines : String(rr.fields.nazm || "").split("\n");
            return share.handleShare({
              baseId: BASE_ID,
              table: TABLE,
              recordId: rr.id,
              title: rr.fields.shaer,
              textLines: lines,
              slugId: rr.fields.slugId,
              swrKey,
              currentShares: rr.fields.shares ?? 0,
            });
          }}
          openComments={openComments}
        />
      ))}
  {/* Share no longer requires login */}
    </div>
  );
};

export default Nazmen;
