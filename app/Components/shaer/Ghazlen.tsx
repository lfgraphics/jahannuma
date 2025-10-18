"use client";
import DataCard from "@/app/Components/DataCard";
import type { AirtableRecord, GhazlenRecord } from "@/app/types";
import { useGhazlenData } from "@/hooks/useGhazlenData";
import { useShareAction } from "@/hooks/useShareAction";
import { buildShaerFilter, formatGhazlenRecord } from "@/lib/airtable-utils";
import React, { useEffect, useMemo, useState } from "react";
import ComponentsLoader from "./ComponentsLoader";

interface Props {
  takhallus: string;
}

const BASE_ID = "appvzkf6nX376pZy6";
const TABLE = "Ghazlen";

const Ghazlen: React.FC<Props> = ({ takhallus }) => {
  const [loading, setLoading] = useState(true);

  const { records, isLoading } = useGhazlenData({
    filterByFormula: buildShaerFilter(takhallus),
    pageSize: 30,
  });
  const dataItems = useMemo(
    () => records.map(formatGhazlenRecord) as AirtableRecord<GhazlenRecord>[],
    [records]
  );

  const [openanaween, setOpenanaween] = useState<string | null>(null);
  const toggleanaween = (cardId: string | null) =>
    setOpenanaween((prev) => (prev === cardId ? null : cardId));
  const handleCardClick = (_rec: AirtableRecord<GhazlenRecord>) => {};
  const openComments = (_id: string) => {};

  const share = useShareAction({ section: "Ghazlen", title: "" });

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  return (
    <div
      dir="rtl"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 m-3"
    >
      {loading && <ComponentsLoader />}
      {!loading && dataItems.length === 0 && (
        <div className="h-[30vh] col-span-full grid place-items-center text-muted-foreground">
          کوئی مواد نہیں ملا
        </div>
      )}
      {!loading &&
        dataItems.map((rec, index) => (
          <DataCard
            key={rec.id}
            page="ghazal"
            shaerData={rec as any}
            index={index}
            download={false}
            storageKey="Ghazlen"
            toggleanaween={toggleanaween}
            openanaween={openanaween}
            handleCardClick={handleCardClick as any}
            handleShareClick={(r: any) => {
              const rr = r as AirtableRecord<GhazlenRecord>;
              const headArr = Array.isArray(rr.fields.ghazalHead)
                ? rr.fields.ghazalHead
                : String(rr.fields.ghazalHead || "").split("\n");
              return share.handleShare({
                baseId: BASE_ID,
                recordId: rr.id,
                title: rr.fields.shaer,
                textLines: headArr,
                slugId: rr.fields.slugId,
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

export default Ghazlen;
