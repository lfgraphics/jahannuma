"use client";
import { useAirtableList } from "@/hooks/useAirtableList";
import { useAirtableMutation } from "@/hooks/useAirtableMutation";
import useAuthGuard from "@/hooks/useAuthGuard";
import { useCommentSystem } from "@/hooks/useCommentSystem";
import { useShareAction } from "@/hooks/useShareAction";
import { TTL } from "@/lib/airtable-fetcher";
import { escapeAirtableFormulaValue, formatPoetryLines } from "@/lib/utils";
import AOS from "aos";
import "aos/dist/aos.css";
import { XCircle } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import CommentSection from "../../../../Components/CommentSection";
import DataCard from "../../../../Components/DataCard";
import SkeletonLoader from "../../../../Components/SkeletonLoader";

interface Ghazal {
  fields: {
    shaer: string;
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

const Ghazlen = ({ params }: { params: Promise<{ name: string }> }) => {
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
  const [dataItems, setDataItems] = useState<Ghazal[]>([]);
  const [openanaween, setOpenanaween] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");

  // Hooks (top-level usage only)
  const { updateRecord: updateGhazlen } = useAirtableMutation("appvzkf6nX376pZy6", "Ghazlen");
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

  const { records, isLoading, swrKey: listSWRKey } = useAirtableList<Ghazal>(
    "appvzkf6nX376pZy6",
    "Ghazlen",
    {
      pageSize: 30,
      fields: ["shaer", "unwan", "body", "likes", "comments", "shares", "id", "ghazalHead"],
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
        ghazalHead: formatPoetryLines(record.fields?.ghazalHead || ""),
        unwan: formatPoetryLines(record.fields?.unwan || ""),
      },
    }));
    setDataItems(formatted as any);
    setLoading(isLoading);
  }, [records, isLoading]);

  const handleHeartClick = async (_e: React.MouseEvent<HTMLButtonElement>, _ghazalData: Ghazal) => {
    return;
  };

  // Centralized share using hook
  const share = useShareAction({
    baseId: "appvzkf6nX376pZy6",
    table: "Ghazlen",
    recordId: "",
    section: "Ghazlen",
    title: "",
    textLines: [],
    swrKey: listSWRKey,
  });

  const handleShareClick = async (ghazalData: Ghazal) => {
    const lines = (ghazalData.fields.ghazalHead || []) as string[];
    await share.handleShare({
      recordId: ghazalData.id,
      title: ghazalData.fields.shaer,
      textLines: lines,
      currentShares: ghazalData.fields.shares,
    });
  };

  const handleCardClick = (ghazalData: Ghazal): void => {
    toggleanaween(null);
    setSelectedCard({
      id: ghazalData.id,
      fields: {
        shaer: ghazalData.fields.shaer,
        ghazal: ghazalData.fields.ghazal,
        id: ghazalData.fields.id,
      },
    });
  };

  const handleCloseModal = (): void => {
    setSelectedCard(null);
  };

  const toggleanaween = (cardId: string | null) => {
    setOpenanaween((prev) => (prev === cardId ? null : cardId));
  };

  const handleNewCommentChange = (comment: string) => {
    setNewComment(comment);
  };

  const handleCommentSubmit = async (dataId: string) => {
    if (!newComment || newComment.trim().length === 0) return;
    if (!requireAuth("comment")) return;
    try {
      await submitComment({ recordId: dataId, content: newComment });
      setNewComment("");
      setDataItems((prev) => prev.map((item) => (
        item.id === dataId
          ? { ...item, fields: { ...item.fields, comments: (item.fields.comments || 0) + 1 } }
          : item
      )));
      try {
        const nextCount = (dataItems.find((i) => i.id === dataId)?.fields.comments || 0) + 1;
        await updateGhazlen([{ id: dataId, fields: { comments: nextCount } }]);
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
  };

  const closeComments = () => {
    setSelectedCommentId(null);
  };

  return (
    <div>
      <div className="flex flex-row w-screen bg-white p-3 justify-center items-center top-14 z-10">
        {`${name} की ग़ज़लें`}
      </div>
      {loading && <SkeletonLoader />}
      {!loading && (
        <section>
          <div
            id="section"
            dir="ltr"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 m-3"
          >
            {dataItems.map((ghazalData, index) => (
              <div data-aos="fade-up" key={index}>
                <DataCard
                  page="ghazal"
                  download={true}
                  shaerData={ghazalData}
                  index={index}
                  handleCardClick={handleCardClick}
                  toggleanaween={toggleanaween}
                  openanaween={openanaween}
                  baseId="appvzkf6nX376pZy6"
                  table="Ghazlen"
                  storageKey="Ghazlen"
                  swrKey={listSWRKey}
                  handleHeartClick={handleHeartClick}
                  handleShareClick={(gd) => handleShareClick(gd as any)}
                  openComments={openComments}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {selectedCard && (
        <div
          onClick={handleCloseModal}
          id="modal"
          className="bg-black bg-opacity-50 backdrop-blur-[2px] h-[100vh] w-[100vw] fixed top-0 z-20 overflow-hidden pb-5"
        >
          <div
            dir="ltr"
            className="opacity-100 fixed bottom-0 left-0 right-0 bg-white transition-all ease-in-out min-h-[60svh] max-h-[70svh] overflow-y-scroll z-50 rounded-lg rounded-b-none w-[98%] mx-auto border-2 border-b-0"
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

export default Ghazlen;