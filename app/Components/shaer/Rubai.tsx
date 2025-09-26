"use client";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import ComponentsLoader from "../../Components/SkeletonLoader";
import RubaiCard from "../../Components/RubaiCard";
import AOS from "aos";
import "aos/dist/aos.css";
import { Heart, Share2 } from "lucide-react";
import { useAirtableList } from "@/hooks/useAirtableList";
import { useAirtableCreate } from "@/hooks/useAirtableCreate";
import { useAirtableMutation } from "@/hooks/useAirtableMutation";
import type { AirtableRecord, Rubai as RubaiType } from "@/app/types";
import { buildShaerFilter, buildDataIdFilter, isItemLiked, toggleLikedItem, prepareLikeUpdate, prepareShareUpdate } from "@/lib/airtable-utils";

interface Props { takhallus: string }

const RUBAI_BASE = "appIewyeCIcAD4Y11";
const RUBAI_TABLE = "rubai";
const COMMENTS_BASE = "appseIUI98pdLBT1K";
const COMMENTS_TABLE = "comments";

const Rubai: React.FC<Props> = ({ takhallus }) => {
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);

  const { records, isLoading } = useAirtableList<AirtableRecord<any>>(RUBAI_BASE, RUBAI_TABLE, {
    filterByFormula: buildShaerFilter(takhallus),
    pageSize: 30,
  });
  const dataItems = records;

  const { createRecord, isCreating } = useAirtableCreate(COMMENTS_BASE, COMMENTS_TABLE);
  const { updateRecord } = useAirtableMutation(RUBAI_BASE, RUBAI_TABLE);

  const handleHeartClick = async (e: React.MouseEvent<HTMLButtonElement>, item: RubaiType, index: number, id: string) => {
    if (typeof window === "undefined") return;
    if ((window.localStorage, e.detail == 1)) {
      try {
  const { liked } = toggleLikedItem("Rubai", { id: item.id });
  const inc = liked ? 1 : -1;
  await updateRecord([{ id: item.id, fields: prepareLikeUpdate(item.fields?.likes, inc) }]);
      } catch (error) {
        toggleLikedItem("Rubai", { id });
        console.error("Error updating likes:", error);
      }
    }
  };

  const openComments = (dataId: string) => {
    setSelectedCommentId(dataId);
  };

  const handleShareClick = async (item: RubaiType, index: number) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: item.fields?.shaer,
          text: String(item.fields?.body ?? "") + `\nFound this on Jahannuma webpage\nCheckout there webpage here>> `,
          url: `${window.location.href + "/" + item.id}`,
        });
      }
  await updateRecord([{ id: item.id, fields: prepareShareUpdate(item.fields?.shares) }]);
    } catch (error) {
      console.error("Error updating shres:", error);
    }
  };

  return (
    <>
      {isLoading && <ComponentsLoader />}
      {!isLoading && (
        <div id="section" dir="rtl" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 m-3">
          {dataItems.map((item, index) => (
            <div className="relative" key={item.id}>
              <RubaiCard
                RubaiData={item as unknown as RubaiType}
                index={index}
                handleShareClick={handleShareClick}
                handleHeartClick={handleHeartClick}
                openComments={openComments}
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default Rubai;
