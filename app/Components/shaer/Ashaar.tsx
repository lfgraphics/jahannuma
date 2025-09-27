"use client";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import ComponentsLoader from "./ComponentsLoader";
import { Heart } from "lucide-react";
import { useAirtableList } from "@/hooks/useAirtableList";
import type { AirtableRecord, AshaarRecord } from "@/app/types";
import { buildShaerFilter, formatAshaarRecord } from "@/lib/airtable-utils";
import { useLikeButton } from "@/hooks/useLikeButton";

interface Props { takhallus: string }

const BASE_ID = "appeI2xzzyvUN5bR7";
const TABLE = "Ashaar";

const Ashaar: React.FC<Props> = ({ takhallus }) => {
  const { records, isLoading, swrKey } = useAirtableList<AirtableRecord<AshaarRecord>>(BASE_ID, TABLE, {
    filterByFormula: buildShaerFilter(takhallus),
    pageSize: 30,
  });

  // Format records for UI
  const dataItems: AirtableRecord<AshaarRecord>[] = useMemo(() => {
    return (records || []).map((r: AirtableRecord<AshaarRecord>) => formatAshaarRecord(r));
  }, [records]);

  // Inline like button using centralized hook
  const LikeBtn: React.FC<{ rec: AirtableRecord<AshaarRecord> }> = ({ rec }) => {
    const like = useLikeButton({
      baseId: BASE_ID,
      table: TABLE,
      storageKey: "Ashaar",
      recordId: rec.id,
      currentLikes: rec.fields.likes ?? 0,
      swrKey,
    });
    return (
      <button
        id={rec.id}
        className={`ml-5 transition-all duration-300 text-lg flex items-center gap-1 ${like.isLiked ? "text-red-600" : "text-gray-500"}`}
        onClick={() => like.handleLikeClick()}
        disabled={like.isDisabled}
        aria-disabled={like.isDisabled}
        title={like.isLiked ? "پسندیدہ" : "پسند کریں"}
      >
        <Heart size={22} />
        <span className="text-sm text-foreground">{like.likesCount}</span>
      </button>
    );
  };

  return (
    <div>
      {isLoading && <ComponentsLoader />}
      {!isLoading && dataItems.length === 0 && (
        <div className="h-[30vh] grid place-items-center text-muted-foreground">کوئی مواد نہیں ملا</div>
      )}
      {dataItems.map((shaerData: AirtableRecord<AshaarRecord>, index: number) => {
        // rely on formatted outputs: ghazalHead is string[] via formatAshaarRecord
        const head: string[] = shaerData.fields.ghazalHead || [];
        return (
          <div
            key={shaerData.id}
            id={`card${index}`}
            className="bg-white dark:bg-[#2d2d2f] rounded-sm border-b relative flex flex-col justify-between m-5 pt-0 md:mx-36 lg:mx-36"
          >
            <div className="flex justify-between items-center">
              <div className="mr-5">
                <Link href={"/Ashaar/" + encodeURIComponent(((shaerData?.fields as any)?.slugId ?? shaerData.id))}>
                  {head.map((lin: string, i: number) => (
                    <p style={{ lineHeight: "normal" }} key={i} className="line-normal text-xl">
                      {lin}
                    </p>
                  ))}
                </Link>
              </div>
              <LikeBtn rec={shaerData} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Ashaar;
