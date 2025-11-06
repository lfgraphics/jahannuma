"use client";
import type { AirtableRecord, AshaarRecord, LikedMap, MozuPageParams, SelectedCard } from "@/app/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAirtableMutation } from "@/hooks/useAirtableMutation";
import { useAshaarData } from "@/hooks/useAshaarData";
import useAuthGuard from "@/hooks/useAuthGuard";
import { useCommentSystem } from "@/hooks/useCommentSystem";
import { ASHAAR_COMMENTS_BASE, COMMENTS_TABLE } from "@/lib/airtable-constants";
import { buildUnwanFilter, formatAshaarRecord } from "@/lib/airtable-utils";
import { shareRecordWithCount } from "@/lib/social-utils";
import { updatePagedListField } from "@/lib/swr-updater";
import AOS from "aos";
import "aos/dist/aos.css";
import { XCircle } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import CommentSection from "../../../../Components/CommentSection";
import DataCard from "../../../../Components/DataCard";

const ASHAAR_BASE = "appeI2xzzyvUN5bR7";
const ASHAAR_TABLE = "Ashaar";
const COMMENTS_BASE = ASHAAR_COMMENTS_BASE || "appzB656cMxO0QotZ";
const COMMENTS_TABLE_NAME = COMMENTS_TABLE;

const SkeletonLoader = () => (
  <div className="flex flex-col items-center">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 m-3">
      {[...Array(12)].map((_, index) => (
        <div key={index} role="status" className="flex items-center justify-center h-56 w-[350px] max-w-sm bg-gray-300 rounded-lg animate-pulse dark:bg-gray-700"></div>
      ))}
    </div>
  </div>
);

export default function Page({ params }: { params: MozuPageParams }) {
  const encodedUnwan = params.unwan;
  const decodedUnwan = decodeURIComponent(encodedUnwan);

  const { records, isLoading, cacheKey: listSWRKey, mutate } = useAshaarData({
    filterByFormula: buildUnwanFilter(decodedUnwan),
    pageSize: 30,
  });
  const { updateRecord } = useAirtableMutation(ASHAAR_BASE, ASHAAR_TABLE);
  const { language } = useLanguage();

  const dataItems = useMemo(() => (records || []).map((r) => formatAshaarRecord(r)), [records]);

  const [selectedCommentId, setSelectedCommentId] = React.useState<string | null>(null);
  const [selectedCard, setSelectedCard] = React.useState<SelectedCard | null>(null);
  const [openanaween, setOpenanaween] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const { comments, isLoading: commentLoading, submitComment, setRecordId } = useCommentSystem(COMMENTS_BASE, COMMENTS_TABLE_NAME, null);
  const { requireAuth } = useAuthGuard();
  const [disableHearts, setDisableHearts] = useState(false);
  const [likedMap, setLikedMap] = useState<LikedMap>({});

  useEffect(() => {
    AOS.init({ offset: 50, delay: 0, duration: 300 });
  }, []);

  useEffect(() => { setLikedMap({}); }, [dataItems]);

  const handleCardClick = (shaerData: AirtableRecord<AshaarRecord>) => {
    toggleanaween(null);
    const ghazalArr = Array.isArray(shaerData.fields.ghazal)
      ? shaerData.fields.ghazal
      : String(shaerData.fields.ghazal || "").split("\n");
    setSelectedCard({ id: shaerData.id, fields: { shaer: shaerData.fields.shaer, ghazal: ghazalArr, id: (shaerData.fields as any).id || shaerData.id } });
  };

  const handleCloseModal = () => setSelectedCard(null);

  const toggleanaween = (cardId: string | null) => setOpenanaween((prev) => (prev === cardId ? null : cardId));

  const handleNewCommentChange = (comment: string) => setNewComment(comment);

  const handleCommentSubmit = async (dataId: string) => {
    if (!requireAuth("comment")) return;
    if (newComment !== "") {
      try {
        await submitComment({ recordId: dataId, content: newComment });
        setNewComment("");
        try {
          await updateRecord([
            { id: dataId, fields: { comments: (dataItems.find((d: AirtableRecord<AshaarRecord>) => d.id === dataId)?.fields.comments ?? 0) + 1 } }
          ], {
            optimistic: true,
            affectedKeys: listSWRKey ? [listSWRKey] : undefined,
            updater: (current: any) => updatePagedListField(current, dataId, "comments", 1),
          });
        } catch (err) {
          try {
            await mutate(
              (current: any) => updatePagedListField(current, dataId, "comments", -1),
              { revalidate: false }
            );
          } catch { }
        }
      } catch { }
    }
  };

  const handleShareClick = async (shaerData: AirtableRecord<AshaarRecord>, index: number) => {
    toggleanaween(null);
    await shareRecordWithCount(
      {
        section: "Ashaar",
        id: shaerData.id,
        title: shaerData.fields.shaer,
        textLines: Array.isArray(shaerData.fields.ghazalHead)
          ? shaerData.fields.ghazalHead
          : String(shaerData.fields.ghazalHead || "").split("\n"),
        fallbackSlugText:
          (Array.isArray(shaerData.fields.ghazalHead)
            ? shaerData.fields.ghazalHead[0]
            : String(shaerData.fields.ghazalHead || "").split("\n")[0]) ||
          (Array.isArray(shaerData.fields.unwan) ? shaerData.fields.unwan[0] : String(shaerData.fields.unwan || "")) ||
          "",
        language,
      },
      {
        onShared: async () => {
          try {
            await updateRecord([
              { id: shaerData.id, fields: { shares: (shaerData.fields.shares ?? 0) + 1 } },
            ]);
          } catch (e) {
            console.error("Error updating shares:", e);
          }
        },
      }
    );
  };

  const openComments = (dataId: string) => {
    toggleanaween(null);
    setSelectedCommentId(dataId);
    setRecordId(dataId);
  };

  const closeComments = () => {
    setSelectedCommentId(null);
    setRecordId(null);
  };

  return (
    <div className="min-h-screen">
      <div className="flex flex-row w-full border-b border-slate-700 p-3 justify-center items-center">
        <div className="text-2xl sm:text-3xl md:text-4xl m-5">{`विषय पर कविताएं: ${decodedUnwan}`}</div>
      </div>

      {isLoading && <SkeletonLoader />}

      {!isLoading && (
        <section>
          <div id="section" dir="ltr" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-3">
            {dataItems.map((shaerData, index) => (
              <div data-aos="fade-up" key={shaerData.id || index}>
                <DataCard<AirtableRecord<AshaarRecord>>
                  page="ashaar"
                  download={false}
                  shaerData={shaerData}
                  index={index}
                  baseId={ASHAAR_BASE}
                  table={ASHAAR_TABLE}
                  storageKey="Ashaar"
                  swrKey={listSWRKey as any}
                  handleCardClick={handleCardClick}
                  toggleanaween={toggleanaween}
                  openanaween={openanaween}
                  handleShareClick={handleShareClick}
                  openComments={openComments}
                  heartLiked={undefined}
                  heartDisabled={disableHearts}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {selectedCommentId && (
        <button className="fixed bottom-24 left-7 z-50 rounded-full h-10 w-10 pt-2" id="modlBtn" onClick={() => closeComments()}>
          <XCircle className="text-slate-200 h-8 w-8 hover:text-[#984A02] transition-all duration-500 ease-in-out" />
        </button>
      )}

      {selectedCommentId && (
        <CommentSection
          dataId={selectedCommentId}
          comments={comments}
          onCommentSubmit={handleCommentSubmit}
          commentLoading={commentLoading}
          newComment={newComment}
          onNewCommentChange={setNewComment}
          onCloseComments={closeComments}
        />
      )}
    </div>
  );
}