"use client";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import ComponentsLoader from "./ComponentsLoader";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useAirtableList } from "@/hooks/useAirtableList";
import { useAirtableMutation } from "@/hooks/useAirtableMutation";
import type { AirtableRecord, AshaarRecord } from "@/app/types";
import { buildShaerFilter, formatAshaarRecord, getLikedItems, toggleLikedItem, showMutationToast } from "@/lib/airtable-utils";
import { updatePagedListField } from "@/lib/swr-updater";

interface Props { takhallus: string }

const BASE_ID = "appeI2xzzyvUN5bR7";
const TABLE = "Ashaar";

const Ashaar: React.FC<Props> = ({ takhallus }) => {
  const { records, isLoading, swrKey } = useAirtableList<AirtableRecord<AshaarRecord>>(BASE_ID, TABLE, {
    filterByFormula: buildShaerFilter(takhallus),
    pageSize: 30,
  });
  const { updateRecord } = useAirtableMutation(BASE_ID, TABLE);

  // Format records for UI
  const dataItems: AirtableRecord<AshaarRecord>[] = useMemo(() => {
    return (records || []).map((r: AirtableRecord<AshaarRecord>) => formatAshaarRecord(r));
  }, [records]);

  // liked map derived from localStorage
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [disableHearts, setDisableHearts] = useState(false);
  useEffect(() => {
    try {
      const saved = getLikedItems<{ id: string }>("Ashaar");
      const map: Record<string, boolean> = {};
      for (const item of dataItems) map[item.id] = saved.some((d: { id: string }) => d.id === item.id);
      setLikedMap(map);
    } catch {}
  }, [dataItems]);

  // Use shared toast helper

  const handleHeartClick = async (shaerData: AirtableRecord<AshaarRecord>, index: number, id: string) => {
    const prev = likedMap[id];
    if (disableHearts) return;
    setDisableHearts(true);
    try {
      const { liked } = toggleLikedItem("Ashaar", shaerData);
      setLikedMap((prevMap) => ({ ...prevMap, [id]: liked }));
      showMutationToast(liked ? "success" : "warning", liked ? "آپ کی پروفائل میں یہ شعر کامیابی کے ساتھ جوڑ دی گئی ہے۔" : "آپ کی پروفائل سے یہ شعر کامیابی کے ساتھ ہٹا دی گئی ہے۔");

      const inc = liked ? 1 : -1;
      const nextLikes = (shaerData.fields.likes ?? 0) + inc;
      await updateRecord([
        { id: shaerData.id, fields: { likes: nextLikes } },
      ], {
        optimistic: true,
        affectedKeys: swrKey ? [swrKey] : undefined,
        updater: (current: any) => updatePagedListField(current, shaerData.id, 'likes', inc),
      });
    } catch (e) {
      setLikedMap((prevMap) => ({ ...prevMap, [id]: prev }));
      toast.error("لائیک اپڈیٹ میں مسئلہ آیا۔");
    } finally {
      setDisableHearts(false);
    }
  };

  return (
    <div>
      {isLoading && <ComponentsLoader />}
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
              <button
                id={`${shaerData.id}`}
                className={`btn ml-5 transition-all duration-500 text-lg ${likedMap[shaerData.id] ? "text-red-600" : "text-gray-500"}`}
                onClick={() => handleHeartClick(shaerData, index, `${shaerData.id}`)}
                disabled={disableHearts}
              >
                <Heart size={24} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Ashaar;
