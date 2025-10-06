"use client";
import React, { useEffect, useMemo, useState } from "react";
import ComponentsLoader from "../../Components/SkeletonLoader";
import RubaiCard from "../../Components/RubaiCard";
import AOS from "aos";
import "aos/dist/aos.css";
// icons were handled inside child components; no direct icon usage here
import { useAirtableList } from "@/hooks/useAirtableList";
import type { AirtableRecord, Rubai as RubaiType } from "@/app/types";
import { buildShaerFilter } from "@/lib/airtable-utils";
import { useLikeButton } from "@/hooks/useLikeButton";
import useAuthGuard from "@/hooks/useAuthGuard";
import { useShareAction } from "@/hooks/useShareAction";

interface Props { takhallus: string }

const RUBAI_BASE = "appIewyeCIcAD4Y11";
const RUBAI_TABLE = "rubai";
// comment system is not wired on this page; constants removed

const Rubai: React.FC<Props> = ({ takhallus }) => {
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);

  const { records, isLoading, swrKey } = useAirtableList<AirtableRecord<any>>(RUBAI_BASE, RUBAI_TABLE, {
    filterByFormula: buildShaerFilter(takhallus),
    pageSize: 30,
  });
  const dataItems = records;

  const { requireAuth } = useAuthGuard();
  const share = useShareAction({ section: "Rubai", title: "", baseId: RUBAI_BASE, table: RUBAI_TABLE });
  const CardItem: React.FC<{ rec: AirtableRecord<RubaiType>; index: number }>= ({ rec, index }) => {
    const like = useLikeButton({
      baseId: RUBAI_BASE,
      table: RUBAI_TABLE,
      storageKey: "Rubai",
      recordId: rec.id,
      currentLikes: (rec as any).fields?.likes ?? 0,
      swrKey: undefined,
    });
    const onHeart = async (_e: React.MouseEvent<HTMLButtonElement>) => { if (!requireAuth("like")) return; await like.handleLikeClick(); };
    return (
      <RubaiCard
        RubaiData={rec as any}
        index={index}
        handleShareClick={handleShareClick}
        handleHeartClick={onHeart as any}
        openComments={openComments}
        isLiking={like.isDisabled}
      />
    );
  };

  const openComments = (dataId: string) => {
    setSelectedCommentId(dataId);
  };

  const handleShareClick = async (item: RubaiType, _index: number) => {
    await share.handleShare({
      recordId: item.id,
      title: item.fields?.shaer,
      textLines: [String(item.fields?.body ?? "")],
      fallbackSlugText: (String(item.fields?.body ?? "").split("\n").find(l => l.trim().length > 0) ?? ""),
      swrKey,
      currentShares: (item as any).fields?.shares ?? 0,
    });
  };

  return (
    <>
  {/* Share no longer requires login */}
      {isLoading && <ComponentsLoader />}
      {!isLoading && (
        <div id="section" dir="rtl" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 m-3">
          {dataItems.length === 0 && (
            <div className="col-span-full h-[30vh] grid place-items-center text-muted-foreground">کوئی مواد نہیں ملا</div>
          )}
          {dataItems.map((item, index) => (
            <div className="relative" key={item.id}>
              <CardItem rec={item as any} index={index} />
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default Rubai;
