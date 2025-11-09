"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAirtableCreate } from "@/hooks/useAirtableCreate";
import { useAirtableMutation } from "@/hooks/useAirtableMutation";
import useAuthGuard from "@/hooks/useAuthGuard";
import { useCommentSystem } from "@/hooks/useCommentSystem";
import { useGhazlenData } from "@/hooks/useGhazlenData";
import {
  COMMENTS_TABLE,
  GHAZLEN_COMMENTS_BASE,
} from "@/lib/airtable-constants";
import { shareRecordWithCount } from "@/lib/social-utils";
import { updatePagedListField } from "@/lib/swr-updater";
import AOS from "aos";
import "aos/dist/aos.css";
import { XCircle } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import type { AirtableRecord, GhazlenRecord } from "../../../../../app/types";
import {
  buildShaerFilter,
  formatGhazlenRecord,
  prepareShareUpdate,
} from "../../../../../lib/airtable-utils";
import CommentSection from "../../../Components/CommentSection";
import DataCard from "../../../Components/DataCard";
import SkeletonLoader from "../../../Components/SkeletonLoader";

const GH_BASE = "appvzkf6nX376pZy6";
const GH_TABLE = "Ghazlen";
const COMMENTS_BASE = GHAZLEN_COMMENTS_BASE;
const COMMENTS_TABLE_NAME = COMMENTS_TABLE;

const Page = ({ params }: { params: Promise<{ name: string }> }) => {
  const resolved = React.use(params);
  // Handle both old format (plain name) and new slug format (name-with-hyphens)
  const rawName = decodeURIComponent(resolved.name).replace("_", " ");
  // Convert slug back to normal name by replacing hyphens with spaces
  const displayName = rawName.includes("-") ? rawName.replace(/-/g, " ") : rawName;

  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<{ id: string; fields: { shaer: string; ghazal: string[]; id: string } } | null>(null);
  const [openanaween, setOpenanaween] = useState<string | null>(null);
  const [disableHearts, setDisableHearts] = useState(false);
  const [newComment, setNewComment] = useState("");
  const { comments, isLoading: commentLoading, submitComment, setRecordId } = useCommentSystem(COMMENTS_BASE, COMMENTS_TABLE_NAME, null);
  const { requireAuth } = useAuthGuard();

  useEffect(() => { AOS.init({ offset: 50, delay: 0, duration: 300 }); }, []);

  const { records, isLoading, isValidating, cacheKey: swrKey, mutate } = useGhazlenData({
    filterByFormula: buildShaerFilter(displayName),
    pageSize: 30,
  });
  const dataItems = useMemo(() => (records || []).map(formatGhazlenRecord) as AirtableRecord<GhazlenRecord>[], [records]);

  const { updateRecord } = useAirtableMutation(GH_BASE, GH_TABLE);
  const { language } = useLanguage();
  const { createRecord } = useAirtableCreate(COMMENTS_BASE, COMMENTS_TABLE);


  const handleShareClick = async (shaerData: AirtableRecord<GhazlenRecord>, index: number) => {
    toggleanaween(null);
    await shareRecordWithCount(
      {
        section: "Ghazlen",
        id: shaerData.id,
        title: shaerData.fields.shaer,
        textLines: Array.isArray(shaerData.fields.ghazalHead) ? shaerData.fields.ghazalHead : String(shaerData.fields.ghazalHead ?? "").split("\n"),
        fallbackSlugText: (Array.isArray(shaerData.fields.ghazalHead) ? shaerData.fields.ghazalHead[0] : String(shaerData.fields.ghazalHead ?? "").split("\n")[0]) || (shaerData.fields.unwan || [])[0] || "",
        language,
      },
      {
        onShared: async () => {
          try {
            await updateRecord([{ id: shaerData.id, fields: prepareShareUpdate(shaerData.fields.shares) }]);
          } catch (error) {
            console.error("Error updating shares:", error);
          }
        },
      }
    );
  };

  const handleCardClick = (shaerData: AirtableRecord<GhazlenRecord>) => {
    toggleanaween(null);
    const gh = Array.isArray(shaerData.fields.ghazal)
      ? shaerData.fields.ghazal
      : (shaerData.fields.ghazal ? String(shaerData.fields.ghazal).split("\n") : []);
    setSelectedCard({ id: shaerData.id, fields: { shaer: shaerData.fields.shaer, ghazal: gh, id: shaerData.fields.id || shaerData.id } });
  };
  const handleCloseModal = () => setSelectedCard(null);

  const toggleanaween = (cardId: string | null) => setOpenanaween((prev) => (prev === cardId ? null : cardId));
  const handleNewCommentChange = (comment: string) => setNewComment(comment);
  const handleCommentSubmit = async (dataId: string) => {
    if (!requireAuth("comment")) return;
    if (!newComment) return;
    try {
      await submitComment({ recordId: dataId, content: newComment });
      setNewComment("");
      try {
        await updateRecord([
          { id: dataId, fields: { comments: ((dataItems.find(d => d.id === dataId)?.fields.comments ?? 0) + 1) as number } }
        ], {
          optimistic: true,
          affectedKeys: swrKey ? [swrKey] : undefined,
          updater: (current: any) => updatePagedListField(current, dataId, "comments", 1),
        });
      } catch (err) {
        // Rollback optimistic increment
        try { await mutate((current: any) => updatePagedListField(current, dataId, "comments", -1), { revalidate: false }); } catch { }
      }
    } catch { }
  };

  const openComments = (dataId: string) => { toggleanaween(null); setSelectedCommentId(dataId); setRecordId(dataId); };
  const closeComments = () => { setSelectedCommentId(null); setRecordId(null); };

  return (
    <div>
      {/* Removed legacy name dialog; comments rely on authenticated user */}
      <div className="flex flex-row w-screen p-3 justify-center items-center top-14 z-10">{`${displayName} کی غزلیں`}</div>
      {isLoading && <SkeletonLoader />}
      {!isLoading && (
        <section>
          <div id="section" dir="rtl" className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4`}>
            {dataItems.map((shaerData, index) => (
              <div data-aos="fade-up" key={shaerData.id}>
                <DataCard
                  page="ghazal"
                  download={false}
                  key={index}
                  shaerData={shaerData}
                  index={index}
                  baseId={GH_BASE}
                  table={GH_TABLE}
                  storageKey="Ghazlen"
                  swrKey={swrKey as any}
                  handleCardClick={handleCardClick}
                  toggleanaween={toggleanaween}
                  openanaween={openanaween}
                  handleShareClick={handleShareClick as any}
                  openComments={openComments}
                  heartDisabled={disableHearts}
                />
              </div>
            ))}
          </div>
        </section>
      )}
      {selectedCard && (
        <div onClick={handleCloseModal} id="modal" className="bg-black bg-opacity-50 backdrop-blur-[2px] h-[100vh] w-[100vw] fixed top-0 z-20 overflow-hidden pb-5">
          <div dir="rtl" className="opacity-100 fixed bottom-0 left-0 right-0  bg-white transition-all ease-in-out min-h-[60svh] max-h-[70svh] overflow-y-scroll z-50 rounded-lg rounded-b-none w-[98%] mx-auto border-2 border-b-0">
            <div className="p-4 pr-0 relative">
              <button id="modlBtn" className="sticky top-4 right-7 z-50" onClick={handleCloseModal}>
                <XCircle className="text-foreground/80 text-3xl hover:text-primary transition-all duration-500 ease-in-out" />
              </button>
              <h2 className="text-black text-4xl text-center top-0 bg-white sticky pt-3 -mt-8 pb-3 border-b-2 mb-3">{selectedCard.fields.shaer}</h2>
              {selectedCard.fields.ghazal.map((line, index) => (
                <p key={index} className="justif w-[320px] text-black pb-3 pr-4 text-2xl">{line}</p>
              ))}
            </div>
          </div>
        </div>
      )}
      {selectedCommentId && (
        <button className=" fixed bottom-24 left-7 z-50 rounded-full  h-10 w-10 pt-2 " id="modlBtn" onClick={() => closeComments()}>
          <XCircle className="text-foreground/80 text-3xl hover:text-primary transition-all duration-500 ease-in-out" />
        </button>
      )}
      {selectedCommentId && (
        <CommentSection
          dataId={selectedCommentId}
          comments={comments}
          onCommentSubmit={handleCommentSubmit}
          commentLoading={commentLoading}
          newComment={newComment}
          onNewCommentChange={handleNewCommentChange}
          onCloseComments={closeComments}
        />
      )}
    </div>
  );
};

export default Page;