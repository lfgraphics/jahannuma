"use client";
import React, { useEffect, useMemo, useState } from "react";
import { XCircle } from "lucide-react";
import CommentSection from "../../../Components/CommentSection";
import DataCard from "../../../Components/DataCard";
import AOS from "aos";
import "aos/dist/aos.css";
import { toast } from "sonner";
import { useAirtableList } from "@/hooks/useAirtableList";
import { useAirtableMutation } from "@/hooks/useAirtableMutation";
import type { AirtableRecord, GhazlenRecord, LikedMap, MozuPageParams, SelectedCard } from "@/app/types";
import { buildUnwanFilter, formatGhazlenRecord } from "@/lib/airtable-utils";
import { updatePagedListField } from "@/lib/swr-updater";
import { useCommentSystem } from "@/hooks/useCommentSystem";
import { GHAZLEN_COMMENTS_BASE, COMMENTS_TABLE } from "@/lib/airtable-constants";
import useAuthGuard from "@/hooks/useAuthGuard";
import { shareRecordWithCount } from "@/lib/social-utils";
import { useLanguage } from "@/contexts/LanguageContext";

const GHAZLEN_BASE = "appvzkf6nX376pZy6";
const GHAZLEN_TABLE = "Ghazlen";
const COMMENTS_BASE = GHAZLEN_COMMENTS_BASE;
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

  const { records, isLoading, swrKey: listSWRKey, mutate } = useAirtableList<AirtableRecord<any>>(GHAZLEN_BASE, GHAZLEN_TABLE, {
    filterByFormula: buildUnwanFilter(decodedUnwan),
    pageSize: 30,
  });
  const { updateRecord } = useAirtableMutation(GHAZLEN_BASE, GHAZLEN_TABLE);
  const { language } = useLanguage();

  const dataItems = useMemo(() => (records || []).map((r) => formatGhazlenRecord(r)), [records]);

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

  // Liked map no longer initializes from localStorage; likes come from Clerk metadata via DataCard/useLikeButton
  useEffect(() => { setLikedMap({}); }, [dataItems]);

  // Legacy localStorage like handling removed; DataCard will manage likes via useLikeButton

  const handleCardClick = (shaerData: AirtableRecord<GhazlenRecord>) => {
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
            { id: dataId, fields: { comments: (dataItems.find((d: AirtableRecord<GhazlenRecord>) => d.id === dataId)?.fields.comments ?? 0) + 1 } }
          ], {
            optimistic: true,
            affectedKeys: listSWRKey ? [listSWRKey] : undefined,
            updater: (current: any) => updatePagedListField(current, dataId, "comments", 1),
          });
        } catch (err) {
          // Rollback the optimistic increment on failure
          try {
            await mutate(
              (current: any) => updatePagedListField(current, dataId, "comments", -1),
              { revalidate: false }
            );
          } catch {}
        }
      } catch {}
    }
  };

  const handleShareClick = async (shaerData: AirtableRecord<GhazlenRecord>, index: number) => {
    toggleanaween(null);
    await shareRecordWithCount(
      {
        section: "Ghazlen",
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
        <div className="text-2xl sm:text-3xl md:text-4xl m-5">{`غزلیں بعنوان : ${decodedUnwan}`}</div>
      </div>

      {isLoading && <SkeletonLoader />}

      {!isLoading && (
        <section>
          <div id="section" dir="rtl" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-3">
            {dataItems.map((shaerData, index) => (
              <div data-aos="fade-up" key={shaerData.id || index}>
                <DataCard<AirtableRecord<GhazlenRecord>>
                  page="ghazal"
                  download={false}
                  shaerData={shaerData}
                  index={index}
                  baseId={GHAZLEN_BASE}
                  table={GHAZLEN_TABLE}
                  storageKey="Ghazlen"
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
        <button className=" fixed bottom-24 left-7 z-50 rounded-full  h-10 w-10 pt-2 " id="modlBtn" onClick={() => closeComments()}>
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
