"use client";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import ComponentsLoader from "./ComponentsLoader";
import { Heart } from "lucide-react";
import { useAirtableList } from "@/hooks/useAirtableList";
import type { AirtableRecord, GhazlenRecord } from "@/app/types";
import { buildShaerFilter, formatGhazlenRecord } from "@/lib/airtable-utils";
import { useLikeButton } from "@/hooks/useLikeButton";

interface Props { takhallus: string }

const BASE_ID = "appvzkf6nX376pZy6";
const TABLE = "Ghazlen";

const Ghazlen: React.FC<Props> = ({ takhallus }) => {
  const [loading, setLoading] = useState(true);

  const { records, isLoading, swrKey } = useAirtableList<AirtableRecord<any>>(BASE_ID, TABLE, {
    filterByFormula: buildShaerFilter(takhallus),
    pageSize: 30,
  });

  const dataItems = useMemo(() => records.map(formatGhazlenRecord) as AirtableRecord<GhazlenRecord>[], [records]);

  useEffect(() => { setLoading(isLoading); }, [isLoading]);

  // Inline like button via centralized hook
  const LikeBtn: React.FC<{ rec: AirtableRecord<GhazlenRecord> }> = ({ rec }) => {
    const like = useLikeButton({
      baseId: BASE_ID,
      table: TABLE,
      storageKey: "Ghazlen",
      recordId: rec.id,
      currentLikes: rec.fields.likes ?? 0,
      swrKey,
    });
    return (
      <button
        id={rec.id}
        disabled={like.isDisabled}
        className={`btn ml-5 transition-all duration-300 text-lg cursor-pointer flex items-center justify-center gap-2 ${like.isLiked ? "text-red-600" : "text-gray-500"}`}
        onClick={() => like.handleLikeClick()}
      >
        <Heart />
        <span className="text-sm text-foreground">{like.likesCount}</span>
      </button>
    );
  };

  return (
    <div>
      {loading && <ComponentsLoader />}
      {!loading && dataItems.length === 0 && (
        <div className="h-[30vh] grid place-items-center text-muted-foreground">کوئی مواد نہیں ملا</div>
      )}
      {dataItems.map((shaerData, index) => {
        return (
          <div
            key={shaerData.id}
            id={`card${index}`}
            className="bg-white dark:bg-[#2d2d2f] rounded-sm border-b relative flex flex-col justify-between m-5 pt-0 md:mx-36 lg:mx-36"
          >
            <div className="flex justify-between items-center">
              <div className="mr-5">
                <Link href={"/Ghazlen/" + (shaerData.fields.slugId ?? shaerData.fields.id ?? shaerData.id)}>
                  {(Array.isArray(shaerData.fields.ghazalHead) ? shaerData.fields.ghazalHead : String(shaerData.fields.ghazalHead ?? "").split("\n")).map((lin, i) => (
                    <p
                      style={{ lineHeight: "normal" }}
                      key={i}
                      className="line-normal text-xl"
                    >
                      {lin}
                    </p>
                  ))}
                </Link>
              </div>
              <LikeBtn rec={shaerData as any} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Ghazlen;
