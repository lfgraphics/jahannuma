"use client";
import DataCard from "@/app/Components/DataCard";
import type { AirtableRecord, GhazlenRecord } from "@/app/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAirtableMutation } from "@/hooks/airtable/useAirtableMutation";
import { useGhazlenData } from "@/hooks/useGhazlenData";
import { buildShaerFilter, formatGhazlenRecord } from "@/lib/airtable-utils";
import { shareRecordWithCount } from "@/lib/social-utils";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import ComponentsLoader from "./ComponentsLoader";

interface Props {
  takhallus: string;
}



const Ghazlen: React.FC<Props> = ({ takhallus }) => {
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  const { records, isLoading, optimisticUpdate } = useGhazlenData({
    filterByFormula: buildShaerFilter(takhallus),
    pageSize: 30,
  });
  const dataItems = useMemo(
    () => records.map(formatGhazlenRecord) as AirtableRecord<GhazlenRecord>[],
    [records]
  );

  const { updateRecord: updateGhazlen } = useAirtableMutation("ghazlen");

  const [openanaween, setOpenanaween] = useState<string | null>(null);
  const toggleanaween = (cardId: string | null) =>
    setOpenanaween((prev) => (prev === cardId ? null : cardId));
  const handleCardClick = (_rec: AirtableRecord<GhazlenRecord>) => {};
  const openComments = (_id: string) => {};

  const handleShareClick = async (shaerData: any): Promise<void> => {
    toggleanaween(null);
    await shareRecordWithCount(
      {
        section: "Ghazlen",
        id: shaerData.id,
        title: shaerData.fields.shaer,
        textLines: shaerData.fields.ghazalHead || [],
        fallbackSlugText:
          (shaerData.fields.ghazalHead?.[0]) ||
          (shaerData.fields.unwan?.[0]) ||
          "",
        language,
      },
      {
        onShared: async () => {
          try {
            const updatedShares = (shaerData.fields.shares ?? 0) + 1;
            optimisticUpdate.updateRecord(shaerData.id, { shares: updatedShares });
            await updateGhazlen(shaerData.id, { shares: updatedShares });
          } catch {
            optimisticUpdate.revert();
            toast.error("شیئر کرنے میں خرابی");
          }
        },
      }
    );
  };

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
            baseId="appvzkf6nX376pZy6"
            table="Ghazlen"
            storageKey="Ghazlen"
            toggleanaween={toggleanaween}
            openanaween={openanaween}
            handleCardClick={handleCardClick as any}
            handleShareClick={handleShareClick}
            openComments={openComments}
            onLikeChange={({ id, likes }) => {
              optimisticUpdate.updateRecord(id, { likes });
            }}
          />
        ))}
      {/* Share no longer requires login */}
    </div>
  );
};

export default Ghazlen;
