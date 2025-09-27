"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Loader from "./Loader";
import DataCard from "./DataCard";
import { toast } from "sonner";
import { useAirtableList } from "@/hooks/useAirtableList";
import { useAirtableMutation } from "@/hooks/useAirtableMutation";
import { airtableFetchJson, TTL } from "@/lib/airtable-fetcher";

interface Shaer {
  fields: {
    sher: string[];
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

// Local comment shape used by comment list/state for this component
interface Comment {
  dataId: string;
  commentorName: string | null;
  timestamp: string;
  comment: string;
}

const RandCard: React.FC<{}> = () => {
  // Fetch Ashaar list via SWR and randomly pick one; caching ensures instant loads on revisit
  const { records, isLoading, swrKey } = useAirtableList<Shaer>(
    "appeI2xzzyvUN5bR7",
    "Ashaar",
    { pageSize: 50 },
    { ttl: TTL.static }
  );
  const loading = isLoading;
  const randomIndexRef = useRef<number | null>(null);
  //comments
  const [selectedCommentId, setSelectedCommentId] = React.useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [commentorName, setCommentorName] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  // likes are now handled inside DataCard via useLikeButton
  // toast via sonner

  //function ot show toast
  const showToast = (
    msgtype: "success" | "error" | "invalid",
    message: string
  ) => {
    if (msgtype === "success") return toast.success(message);
    if (msgtype === "error") return toast.error(message);
    return toast.warning(message);
  };

  // keep the same random item until the dataset changes
  useEffect(() => {
    if (records && records.length > 0 && randomIndexRef.current === null) {
      randomIndexRef.current = Math.floor(Math.random() * records.length);
    }
    if (
      records &&
      randomIndexRef.current !== null &&
      randomIndexRef.current >= records.length
    ) {
      // dataset shrank; re-roll
      randomIndexRef.current = Math.floor(Math.random() * records.length);
    }
  }, [records]);

  const randomItem = useMemo(() => {
    if (!records || records.length === 0) return undefined as unknown as Shaer | undefined;
    const idx = randomIndexRef.current ?? 0;
    const rec = records[idx];
    // normalize to match component expectations
    const ghazal = (rec as any)?.fields?.body
      ? String((rec as any).fields.body).replace(/\r\n?/g, "\n").split("\n")
      : (rec as any)?.fields?.ghazal ?? [];
    const ghazalHead = (rec as any)?.fields?.sher
      ? String((rec as any).fields.sher).replace(/\r\n?/g, "\n").split("\n")
      : (rec as any)?.fields?.ghazalHead ?? [];
    return { ...rec, fields: { ...(rec as any).fields, ghazal, ghazalHead } } as Shaer;
  }, [records]);

  // Mutations aligned to Ashaar table for likes/shares
  const { updateRecord: updateAshaar } = useAirtableMutation(
    "appeI2xzzyvUN5bR7",
    "Ashaar"
  );
  const [openanaween, setOpenanaween] = useState<string | null>(null);

  const toggleanaween = (cardId: string | null) => {
    setOpenanaween((prev) => (prev === cardId ? null : cardId));
  };

  const visitSher = () => {
    // window.location.href = `/Ghazlen/${randomItem?.fields.id}`;
  };
  const fetchComments = async (dataId: string) => {
    const storedName = localStorage.getItem("commentorName");
    try {
      setCommentLoading(true);
      if (!commentorName && storedName === null) {
        setShowDialog(true);
      } else {
        setCommentorName(commentorName || storedName);
      }
      const result = await airtableFetchJson({
        kind: "list",
        baseId: "appzB656cMxO0QotZ",
        table: "Comments",
        params: { filterByFormula: `dataId="${dataId}"` },
        ttl: TTL.fast,
      });
      const fetchedComments = (result.records ?? []).map(
        (record: { fields: { dataId: string; commentorName: string | null; timestamp: string | Date; comment: string } }) => ({
          dataId: record.fields.dataId,
          commentorName: record.fields.commentorName,
          timestamp: String(record.fields.timestamp),
          comment: record.fields.comment,
        })
      );
      setCommentLoading(false);
      setComments(fetchedComments);
    } catch (error) {
      setCommentLoading(false);
      console.error(`Failed to fetch comments: ${error}`);
    }
  };

  const openComments = (dataId: string) => {
    toggleanaween(null);
    setSelectedCommentId(dataId);
    fetchComments(dataId);
  };

  const handleShareClick = async (shaerData: Shaer, index: number): Promise<void> => {
    toggleanaween(null);
    try {
      if (typeof navigator !== "undefined" && (navigator as any).share) {
        await (navigator as any).share({
          title: shaerData.fields.shaer,
          text:
            (shaerData.fields.ghazalHead ?? []).map((line) => line).join("\n") +
            `\nFound this on Jahannuma webpage\nCheckout there webpage here>> `,
          url:
            typeof window !== "undefined"
              ? `${window.location.origin}/Ghazlen/${shaerData.id}`
              : "",
        });
        try {
          const updatedShares = (shaerData.fields.shares ?? 0) + 1;
          await updateAshaar([{ id: shaerData.id, fields: { shares: updatedShares } }]);
        } catch (error) {
          console.error("Error updating shares:", error);
        }
      } else {
        console.warn("Web Share API is not supported.");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const closeComments = () => {
    setSelectedCommentId(null);
  };

  const handleCardClick = (shaerData: Shaer) => {
    toggleanaween(null);
  };

  if (loading || !randomItem) return <Loader />;

  return (
    <div className="justify-center flex flex-col items-center m-4">
      <h4 className="text-2xl my-4">ایک منتخب شعر</h4>
      {loading && <Loader></Loader>} {/* Show loader while fetching */}
      {!loading && (
        <div className="relative">
          {/* <div className="bg-white absolute left-0 top-0 bg-opacity-10 w-screen h-[300px] z-auto"></div> */}
          <img
            src="https://jahan-numa.org/carousel/jnd.jpeg"
            className="object-cover bg-center absolute top-0 left-0 w-screen opacity-[0.09] rounded-lg overflow-clip scale-x-125 scale-y-110 translate-y-3 select-none z-0 touch-none h-[220px]"
            draggable="false"
          />
          <DataCard
            page="rand"
            download={true}
            key={randomItem.id}
            shaerData={randomItem}
            index={0}
            handleCardClick={visitSher}
            baseId="appeI2xzzyvUN5bR7"
            table="Ashaar"
            storageKey="Ashaar"
            toggleanaween={toggleanaween}
            openanaween={openanaween}
            handleShareClick={handleShareClick}
            openComments={openComments}
            swrKey={swrKey}
            onLikeChange={() => {
              // placeholder analytics
            }}
          />
        </div>
      )}
    </div>
  );
};
export default RandCard;