"use client";
import React, { useEffect, useMemo, useState } from "react";
import { XCircle } from "lucide-react";
import CommentSection from "../../../Components/CommentSection";
import SkeletonLoader from "../../../Components/SkeletonLoader";
import DataCard from "../../../Components/DataCard";
import AOS from "aos";
import "aos/dist/aos.css";
import { useAirtableList } from "@/hooks/useAirtableList";
import { useAirtableMutation } from "@/hooks/useAirtableMutation";
import { escapeAirtableFormulaValue, formatPoetryLines } from "@/lib/utils";
import { TTL } from "@/lib/airtable-fetcher";
import useAuthGuard from "@/hooks/useAuthGuard";
import { useShareAction } from "@/hooks/useShareAction";
import { useCommentSystem } from "@/hooks/useCommentSystem";

interface Shaer {
  fields: {
    shaer: string;
    sher: string[];
    ghazalHead: string[];
    ghazal: string[];
    unwan: string[];
    likes: number;
    comments: number;
    shares: number;
    id: string;
  };
  id: string;
  createdTime: string;
}
interface ApiResponse {
  records: any[];
  offset: string | null;
}
interface Pagination {
  offset: string | null;
  pageSize: number;
}
interface Comment {
  dataId: string | null;
  commentorName: string | null;
  timestamp: string;
  comment: string;
}

const Ashaar = ({ params }: { params: Promise<{ name: string }> }) => {
  const resolved = React.use(params);
  // Handle both old format (plain name) and new slug format (name-with-hyphens)
  const rawName = decodeURIComponent(resolved.name).replace("_", " ");
  // Convert slug back to normal name by replacing hyphens with spaces
  const name = rawName.includes("-") ? rawName.replace(/-/g, " ") : rawName;
  const [selectedCommentId, setSelectedCommentId] = React.useState<string | null>(null);
  const [selectedCard, setSelectedCard] = React.useState<{
    id: string;
    fields: { shaer: string; ghazal: string[]; id: string };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataItems, setDataItems] = useState<Shaer[]>([]);
  const [openanaween, setOpenanaween] = useState<string | null>(null);
  // comments
  const [newComment, setNewComment] = useState("");

  // Hooks (top-level usage only)
  const { updateRecord: updateAshaar } = useAirtableMutation("appeI2xzzyvUN5bR7", "Ashaar");
  // Centralized comments via hook (Clerk name + Airtable). We'll set recordId when a card is opened.
  const {
    comments,
    isLoading: commentsLoading,
    submitComment,
    setRecordId,
  } = useCommentSystem("appzB656cMxO0QotZ", "Comments", null);

  useEffect(() => {
    AOS.init({
      offset: 50,
      delay: 0,
      duration: 300,
    });
  }, []);
  const { requireAuth } = useAuthGuard();
  // Build formula safely
  const filterByFormula = useMemo(() => {
    const escaped = escapeAirtableFormulaValue(name);
    return `({shaer}='${escaped}')`;
  }, [name]);

  const { records, isLoading, swrKey: listSWRKey } = useAirtableList<Shaer>(
    "appeI2xzzyvUN5bR7",
    "Ashaar",
    {
      pageSize: 30,
      fields: ["shaer", "unwan", "body", "likes", "comments", "shares", "id", "sher"],
      filterByFormula,
    },
    { ttl: TTL.list }
  );

  useEffect(() => {
    // transform to match local expected shape
    const formatted = (records ?? []).map((record: any) => ({
      ...record,
      fields: {
        ...record.fields,
        ghazal: formatPoetryLines(record.fields?.body || ""),
        ghazalHead: formatPoetryLines(record.fields?.sher || ""),
        unwan: formatPoetryLines(record.fields?.unwan || ""),
      },
    }));
    setDataItems(formatted as any);
    setLoading(isLoading);
  }, [records, isLoading]);

  // Centralized like via hook is handled inside DataCard (baseId/table/storageKey/swrKey)
  const handleHeartClick = async (_e: React.MouseEvent<HTMLButtonElement>, _shaerData: Shaer) => {
    // noop: DataCard will use useLikeButton when baseId/table/storageKey/swrKey are provided
    return;
  };
  //handeling sahre
  // Centralized share using hook
  const share = useShareAction({
    baseId: "appeI2xzzyvUN5bR7",
    table: "Ashaar",
    recordId: "",
    section: "Ashaar",
    title: "",
    textLines: [],
    swrKey: listSWRKey,
  });
  const handleShareClick = async (shaerData: Shaer) => {
    const lines = (shaerData.fields.ghazalHead || []) as string[];
    await share.handleShare({
      recordId: shaerData.id,
      title: shaerData.fields.shaer,
      textLines: lines,
      currentShares: shaerData.fields.shares,
    });
  };
  //opening and closing ghazal
  const handleCardClick = (shaerData: Shaer): void => {
    toggleanaween(null);
    setSelectedCard({
      id: shaerData.id,
      fields: {
        shaer: shaerData.fields.shaer,
        ghazal: shaerData.fields.ghazal,
        id: shaerData.fields.id,
      },
    });

    // open modal instantly without GSAP
  };
  const handleCloseModal = (): void => {
    setSelectedCard(null);
  };
  // Remove localStorage-driven heart coloration
  useEffect(() => {}, [dataItems]);
  //toggling anaween box
  const toggleanaween = (cardId: string | null) => {
    setOpenanaween((prev) => (prev === cardId ? null : cardId));
  };
  const handleNewCommentChange = (comment: string) => {
    setNewComment(comment);
  };
  const handleCommentSubmit = async (dataId: string) => {
    if (!newComment || newComment.trim().length === 0) return;
    // Enforce authentication before submitting a comment
    if (!requireAuth("comment")) return;
    try {
      await submitComment({ recordId: dataId, content: newComment });
      // Clear input
      setNewComment("");
      // Optimistically bump comments count in local list and persist to Airtable
      setDataItems((prev) => prev.map((item) => (
        item.id === dataId
          ? { ...item, fields: { ...item.fields, comments: (item.fields.comments || 0) + 1 } }
          : item
      )));
      try {
        const nextCount = (dataItems.find((i) => i.id === dataId)?.fields.comments || 0) + 1;
        await updateAshaar([{ id: dataId, fields: { comments: nextCount } }]);
      } catch (err) {
        console.error("Failed to persist comment count:", err);
      }
    } catch (e) {
      console.error("Failed to submit comment:", e);
    }
  };
  const openComments = (dataId: string) => {
    toggleanaween(null);
    setSelectedCommentId(dataId);
    setRecordId(dataId);
    // setIsModleOpen(true);
  };
  const closeComments = () => {
    setSelectedCommentId(null);
  };

  return (
    <div>
      {/* Clerk-based comment system: name dialog removed */}
      <div className="flex flex-row w-screen bg-white p-3 justify-center items-center top-14 z-10">{`${name} کے اشعار`}</div>
      {loading && <SkeletonLoader />}
      {!loading && (
        <section>
          <div
            id="section"
            dir="rtl"
            className={`
              grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 m-3`}
          >
            {dataItems.map((shaerData, index) => (
              <div data-aos="fade-up">
                <DataCard
                  page="ashaar"
                  download={true}
                  key={index}
                  shaerData={shaerData}
                  index={index}
                  handleCardClick={handleCardClick}
                  toggleanaween={toggleanaween}
                  openanaween={openanaween}
                  // Enable internal like via Clerk metadata + Airtable
                  baseId="appeI2xzzyvUN5bR7"
                  table="Ashaar"
                  storageKey="Ashaar"
                  swrKey={listSWRKey}
                  handleHeartClick={handleHeartClick}
                  handleShareClick={(sd) => handleShareClick(sd as any)}
                  openComments={openComments}
                />
              </div>
            ))}
          </div>
        </section>
      )}
  {/* Share no longer requires login */}
      {selectedCard && (
        <div
          onClick={handleCloseModal}
          id="modal"
          className="bg-black bg-opacity-50 backdrop-blur-[2px] h-[100vh] w-[100vw] fixed top-0 z-20 overflow-hidden pb-5"
        >
          <div
            dir="rtl"
            className="opacity-100 fixed bottom-0 left-0 right-0  bg-white transition-all ease-in-out min-h-[60svh] max-h-[70svh] overflow-y-scroll z-50 rounded-lg rounded-b-none w-[98%] mx-auto border-2 border-b-0"
          >
            <div className="p-4 pr-0 relative">
              <button
                id="modlBtn"
                className="sticky top-4 right-7 z-50"
                onClick={handleCloseModal}
              >
                <XCircle className="text-muted-foreground text-3xl hover:text-primary transition-all duration-500 ease-in-out" />
              </button>
              <h2 className="text-black text-4xl text-center top-0 bg-white sticky pt-3 -mt-8 pb-3 border-b-2 mb-3">
                {selectedCard.fields.shaer}
              </h2>
              {selectedCard.fields.ghazal.map((line, index) => (
                <p
                  key={index}
                  className="justif w-[320px] text-black pb-3 pr-4 text-2xl"
                >
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* //commetcard */}
      {selectedCommentId && (
        <CommentSection
          dataId={selectedCommentId}
          comments={comments as any}
          onCommentSubmit={handleCommentSubmit}
          commentLoading={commentsLoading}
          newComment={newComment}
          onNewCommentChange={handleNewCommentChange}
          onCloseComments={closeComments}
        />
      )}
    </div>
  );
};

export default Ashaar;