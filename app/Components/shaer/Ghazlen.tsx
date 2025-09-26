"use client";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import ComponentsLoader from "./ComponentsLoader";
import { Heart } from "lucide-react";
import { useAirtableList } from "@/hooks/useAirtableList";
import { useAirtableMutation } from "@/hooks/useAirtableMutation";
import type { AirtableRecord, GhazlenRecord } from "@/app/types";
import { buildShaerFilter, formatGhazlenRecord, isItemLiked, toggleLikedItem, prepareLikeUpdate, generateListCacheKey } from "@/lib/airtable-utils";
import { buildAirtableCacheKey } from "@/lib/airtable-fetcher";

interface Props { takhallus: string }

const BASE_ID = "appvzkf6nX376pZy6";
const TABLE = "Ghazlen";

const Ghazlen: React.FC<Props> = ({ takhallus }) => {
  const [loading, setLoading] = useState(true);
  const [disableHearts, setDisableHearts] = useState(false);

  const { records, isLoading } = useAirtableList<AirtableRecord<any>>(BASE_ID, TABLE, {
    filterByFormula: buildShaerFilter(takhallus),
    pageSize: 30,
  });

  const dataItems = useMemo(() => records.map(formatGhazlenRecord) as AirtableRecord<GhazlenRecord>[], [records]);

  useEffect(() => { setLoading(isLoading); }, [isLoading]);

  // Like mutation handler
  const { updateRecord } = useAirtableMutation(BASE_ID, TABLE);

  const handleHeartClick = async (shaerData: AirtableRecord<GhazlenRecord>, index: number, id: string) => {
    if (typeof window === "undefined") return;
    try {
      setDisableHearts(true);
      const storageKey = "Ghazlen";
      const { liked } = toggleLikedItem(storageKey, { id: shaerData.id });
      const increment = liked ? 1 : -1;
      const updated = prepareLikeUpdate(shaerData.fields.likes, increment);

      // Optimistic update by revalidating list key
      const listKey = generateListCacheKey(BASE_ID, TABLE, { filterByFormula: buildShaerFilter(takhallus), pageSize: 30 });
      await updateRecord([{ id: shaerData.id, fields: updated }], {
        optimistic: false,
        affectedKeys: [
          (key: any) => typeof key === "object" && key?.baseId === BASE_ID && key?.table === TABLE,
          listKey,
        ],
      });
    } catch (e) {
      // rollback like in localStorage by toggling again
      toggleLikedItem("Ghazlen", { id });
      console.error(e);
    } finally {
      setDisableHearts(false);
    }
  };

  return (
    <div>
      {loading && <ComponentsLoader />}
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
              <button
                id={`${shaerData.id}`}
                disabled={disableHearts}
                className={`btn ml-5 ${isItemLiked("Ghazlen", shaerData.id) ? "text-red-600" : "text-gray-500"} transition-all duration-500 text-lg cursor-pointer flex items-center justify-center gap-2`}
                onClick={() => handleHeartClick(shaerData, index, `${shaerData.id}`)}
              >
                <Heart fill="gray" color="gray" />
                <span>{`${shaerData.fields?.likes ?? 0}`}</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Ghazlen;
