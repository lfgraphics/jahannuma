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

interface Nazm {
  fields: {
    shaer: string;
    nazmHead: string[];
    nazm: string[];
    likes: number;
    comments: number;
    shares: number;
    id: string;
  };
  id: string;
  createdTime: string;
}

const Nazmen = ({ params }: { params: Promise<{ name: string }> }) => {
  const resolved = React.use(params);
  const rawName = decodeURIComponent(resolved.name).replace("_", " ");
  const name = rawName.includes("-") ? rawName.replace(/-/g, " ") : rawName;
  const [selectedCommentId, setSelectedCommentId] = React.useState<string | null>(null);
  const [selectedCard, setSelectedCard] = React.useState<{
    id: string;
    fields: { shaer: string; nazm: string[]; id: string };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataItems, setDataItems] = useState<Nazm[]>([]);
  const [openanaween, setOpenanaween] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");

  const { updateRecord: updateNazmen } = useAirtableMutation("appvzkf6nX376pZy6", "Nazmen");
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

  const filterByFormula = useMemo(() => {
    const escaped = escapeAirtableFormulaValue(name);
    return `({shaer}='${escaped}')`;
  }, [name]);

  const { records, isLoading, swrKey: listSWRKey } = useAirtableList<Nazm>(
    "appvzkf6nX376pZy6",
    "Nazmen",
    {
      pageSize: 30,
      fields: ["shaer", "body", "likes", "comments", "shares", "id", "nazmHead"],
      filterByFormula,
    },
    { ttl: TTL.list }
  );

  useEffect(() => {
    const formatted = (records ?? []).map((record: any) => ({
      ...record,
      fields: {
        ...record.fields,
        nazm: formatPoetryLines(record.fields?.body || ""),
        nazmHead: formatPoetryLines(record.fields?.nazmHead || ""),
      },
    }));
    setDataItems(formatted as any);
    setLoading(isLoading);
  }, [records, isLoading]);

  const handleHeartClick = async (_e: React.MouseEvent<HTMLButtonElement>, _nazmData: Nazm) => {
    return;
  };

  const share = useShareAction({
    baseId: "appvzkf6nX376pZy6",
    table: "Nazmen",
    recordId: "",
    section: "Nazmen",
    title: "",
    textLines: [],
    swrKey: listSWRKey,
  });

  const handleShareClick = async (nazmData: Nazm) => {
    const lines = (nazmData.fields.nazmHead || []) as string[];
    await share.handleShare({
      recordId: nazmData.id,
      title: nazmData.fields.shaer,
      textLines: lines,
      currentShares: nazmData.fields.shares,
    });
  };

  const handleCardClick = (nazmData: Nazm): void => {
    toggleanaween(null);
    setSelectedCard({
      id: nazmData.id,
      fields: {
        shaer: nazmData.fields.shaer,
        nazm: nazmData.fields.nazm,
        id: nazmData.fields.id,
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
        await updateNazmen([{ id: dataId, fields: { comments: nextCount } }]);
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
        {`${name} की नज़्में`}
      </div>
      {loading && <SkeletonLoader />}
      {!loading && (
        <section>
          <div
            id="section"
            dir="ltr"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 m-3"
          >
            {dataItems.map((nazmData, index) => (
              <div data-aos="fade-up" key={index}>
                <DataCard
                  page="nazm"
                  download={true}
                  shaerData={nazmData}
                  index={index}
                  handleCardClick={handleCardClick}
                  toggleanaween={toggleanaween}
                  openanaween={openanaween}
                  baseId="appvzkf6nX376pZy6"
                  table="Nazmen"
                  storageKey="Nazmen"
                  swrKey={listSWRKey}
                  handleHeartClick={handleHeartClick}
                  handleShareClick={(nd) => handleShareClick(nd as any)}
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
              {selectedCard.fields.nazm.map((line, index) => (
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

export default Nazmen;