"use client";
import DataCard from "@/app/Components/DataCard";
import type { AirtableRecord, AshaarRecord } from "@/app/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAirtableMutation } from "@/hooks/airtable/useAirtableMutation";
import { buildShaerFilter, formatAshaarRecord } from "@/lib/airtable-utils";
import { shareRecordWithCount } from "@/lib/social-utils";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import ComponentsLoader from "./ComponentsLoader";

interface Props {
  takhallus: string;
}



const Ashaar: React.FC<Props> = ({ takhallus }) => {
  const [records, setRecords] = useState<AirtableRecord<AshaarRecord>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { language } = useLanguage();
  const { updateRecord: updateAshaar } = useAirtableMutation("ashaar");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams({
          filterByFormula: buildShaerFilter(takhallus),
          pageSize: "30",
        });

        const response = await fetch(`/api/airtable/ashaar?${params}`);
        if (!response.ok) throw new Error("Failed to fetch");

        const result = await response.json();
        setRecords(result.data?.records || []);
      } catch (error) {
        console.error("Error fetching ashaar data:", error);
        setRecords([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (takhallus) {
      fetchData();
    }
  }, [takhallus]);

  // Format records for UI
  const dataItems: AirtableRecord<AshaarRecord>[] = useMemo(() => {
    return (records || []).map((r: AirtableRecord<AshaarRecord>) =>
      formatAshaarRecord(r)
    );
  }, [records]);

  const [openanaween, setOpenanaween] = useState<string | null>(null);
  const toggleanaween = (cardId: string | null) =>
    setOpenanaween((prev) => (prev === cardId ? null : cardId));
  const handleCardClick = (_rec: AirtableRecord<AshaarRecord>) => { };
  const openComments = (_id: string) => { };

  const handleShareClick = async (shaerData: any): Promise<void> => {
    toggleanaween(null);
    await shareRecordWithCount(
      {
        section: "Ashaar",
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
            // Note: This component doesn't have optimistic updates like the others
            // We could add them if needed
            await updateAshaar(shaerData.id, { shares: updatedShares });
            // Update local state to reflect the change
            setRecords(prev => prev.map(record =>
              record.id === shaerData.id
                ? { ...record, fields: { ...record.fields, shares: updatedShares } }
                : record
            ));
          } catch (error) {
            console.error("Error updating shares:", error);
            toast.error("شیئر کرنے میں خرابی");
          }
        },
      }
    );
  };

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
            baseId="appeI2xzzyvUN5bR7"
            table="Ashaar"
            storageKey="Ashaar"
            toggleanaween={toggleanaween}
            openanaween={openanaween}
            handleCardClick={handleCardClick as any}
            handleShareClick={handleShareClick}
            openComments={openComments}
            onLikeChange={({ id, likes }) => {
              // Update local state to reflect the like change
              setRecords(prev => prev.map(record =>
                record.id === id
                  ? { ...record, fields: { ...record.fields, likes } }
                  : record
              ));
            }}
          />
        ))}
      {/* Share no longer requires login */}
    </div>
  );
};

export default Ashaar;
