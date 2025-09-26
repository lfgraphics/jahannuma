"use client";
import React, { useEffect, useMemo, useState } from "react";
import { XCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import CommentSection from "../../../Components/CommentSection";
import SkeletonLoader from "../../../Components/SkeletonLoader";
import RubaiCard from "../../../Components/RubaiCard";
import AOS from "aos";
import "aos/dist/aos.css";
import { useAirtableList } from "../../../../hooks/useAirtableList";
import { useAirtableMutation } from "../../../../hooks/useAirtableMutation";
import { useAirtableCreate } from "../../../../hooks/useAirtableCreate";
import type { AirtableRecord, CommentRecord, Rubai } from "../../../../app/types";
import { buildDataIdFilter, buildShaerFilter, isItemLiked, prepareLikeUpdate, prepareShareUpdate, toggleLikedItem } from "../../../../lib/airtable-utils";

const RUBAI_BASE = "appIewyeCIcAD4Y11";
const RUBAI_TABLE = "rubai";
const COMMENTS_BASE = "appseIUI98pdLBT1K";
const COMMENTS_TABLE = "comments";

const Page = ({ params }: { params: Promise<{ name: string }> }) => {
  const resolved = React.use(params);
  // Handle both old format (plain name) and new slug format (name-with-hyphens)
  const rawName = decodeURIComponent(resolved.name).replace("_", " ");
  // Convert slug back to normal name by replacing hyphens with spaces
  const displayName = rawName.includes("-") ? rawName.replace(/-/g, " ") : rawName;

  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [commentorName, setCommentorName] = useState<string | null>(null);
  const [comments, setComments] = useState<CommentRecord[]>([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [newComment, setNewComment] = useState("");

  useEffect(() => { AOS.init({ offset: 50, delay: 0, duration: 300 }); }, []);

  const { records, isLoading } = useAirtableList<AirtableRecord<any>>(RUBAI_BASE, RUBAI_TABLE, {
    filterByFormula: buildShaerFilter(displayName),
    pageSize: 30,
  });
  const dataItems = records as unknown as Rubai[];

  const { updateRecord } = useAirtableMutation(RUBAI_BASE, RUBAI_TABLE);
  const { createRecord } = useAirtableCreate(COMMENTS_BASE, COMMENTS_TABLE);

  const handleHeartClick = async (
    e: React.MouseEvent<HTMLButtonElement>,
    item: Rubai,
    index: number,
    id: string
  ) => {
    if (typeof window === "undefined" || e.detail !== 1) return;
    try {
      const { liked } = toggleLikedItem("Rubai", { id: item.id });
      const inc = liked ? 1 : -1;
      await updateRecord([{ id: item.id, fields: prepareLikeUpdate(item.fields?.likes, inc) }]);
      toast[liked ? "success" : "warning"](liked ? "آپ کی پروفائل میں یہ غزل کامیابی کے ساتھ جوڑ دی گئی ہے۔" : "آپ کی پروفائل سے یہ غزل کامیابی کے ساتھ ہٹا دی گئی ہے۔");
    } catch (error) {
      toggleLikedItem("Rubai", { id });
      console.error("Error updating likes:", error);
    }
  };

  const handleShareClick = async (item: Rubai, index: number) => {
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

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setNameInput(e.target.value);
  const handleNameSubmission = () => { if (typeof window !== "undefined") localStorage.setItem("commentorName", nameInput); setCommentorName(nameInput); setShowDialog(false); };

  const { records: commentRecords, isLoading: commentsLoading } = useAirtableList<AirtableRecord<CommentRecord>>(
    COMMENTS_BASE,
    COMMENTS_TABLE,
    { filterByFormula: selectedCommentId ? buildDataIdFilter(selectedCommentId) : undefined, pageSize: 30 }
  );
  useEffect(() => {
    if (!selectedCommentId) return;
    const storedName = typeof window !== "undefined" ? localStorage.getItem("commentorName") : null;
    if (!commentorName && storedName === null) setShowDialog(true);
    else setCommentorName(commentorName || storedName);
  }, [selectedCommentId]);
  useEffect(() => {
    setCommentLoading(commentsLoading);
    setComments((commentRecords || []).map((r: AirtableRecord<CommentRecord>) => r.fields) as CommentRecord[]);
  }, [commentRecords, commentsLoading]);

  const handleNewCommentChange = (comment: string) => setNewComment(comment);
  const handleCommentSubmit = async (dataId: string) => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("commentorName");
      if (!commentorName && storedName === null) setShowDialog(true);
      else setCommentorName(commentorName || storedName);
    }
    if (!newComment) return;
    try {
      const timestamp = new Date().toISOString();
      const date = new Date(timestamp);
      const formattedDate = format(date, "MMMM dd, yyyy h:mm", {});
      const commentData: CommentRecord = { dataId, commentorName: commentorName || "Anonymous", timestamp: formattedDate, comment: newComment };
      await createRecord([{ fields: commentData as any }]);
      setComments((prev) => [...prev, commentData]);
      setNewComment("");
      await updateRecord([{ id: dataId, fields: { comments: ((dataItems.find(d => d.id === dataId)?.fields?.comments ?? 0) + 1) as number } }]);
    } catch (error) {
      console.error(`Error adding comment: ${error}`);
    }
  };
  const openComments = (dataId: string) => { setSelectedCommentId(dataId); };
  const closeComments = () => { setSelectedCommentId(null); setComments([]); };

  return (
    <div>
      {showDialog && (
        <div className="w-screen h-screen bg-black bg-opacity-60 flex flex-col justify-center fixed z-[60]">
          <div dir="rtl" className="dialog-container h-max p-9 -mt-20 w-max max-w-[380px] rounded-md text-center block mx-auto bg-white">
            <div className="dialog-content">
              <p className="text-lg font-bold pb-3 border-b">براہ کرم اپنا نام درج کریں</p>
              <p className="pt-2">آپ کا نام۔صرف آپ کے تبصروں کو آپ کے نام سے دکھانے کے لیے استعمال کریں گے۔</p>
              <input type="text" id="nameInput" className="mt-2 p-2 border" value={nameInput} onChange={handleNameChange} />
              <div className=" mt-4">
                <button id="submitBtn" disabled={nameInput.length < 4} className="px-4 py-2 bg-[#984A02] disabled:bg-gray-500 text-white rounded" onClick={handleNameSubmission}>محفوظ کریں</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-row w-screen bg-white p-3 justify-center items-center top-14 z-10">{`${displayName} رباعی `}</div>
      {isLoading && <SkeletonLoader />}
      {!isLoading && (
        <section>
          <div id="section" dir="rtl" className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4`}>
            {dataItems.map((data, index) => (
              <div data-aos="fade-up" key={data.id}>
                <RubaiCard
                  RubaiData={data}
                  index={index}
                  handleHeartClick={handleHeartClick as any}
                  openComments={openComments}
                  handleShareClick={handleShareClick as any}
                  isLiking={false}
                />
              </div>
            ))}
          </div>
        </section>
      )}
      {selectedCommentId && !showDialog && (
        <button className=" fixed  bottom-[48svh] right-3 z-50 rounded-full  h-10 w-10 pt-2 " id="modlBtn" onClick={() => closeComments()}>
          <XCircle className="text-gray-700 text-3xl hover:text-[#984A02] transition-all duration-500 ease-in-out" />
        </button>
      )}
      {selectedCommentId && !showDialog && (
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