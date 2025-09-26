"use client";
import React, { useEffect, useMemo, useState } from "react";
import { XCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import CommentSection from "../../../Components/CommentSection";
import SkeletonLoader from "../../../Components/SkeletonLoader";
import DataCard from "../../../Components/DataCard";
import AOS from "aos";
import "aos/dist/aos.css";
import { useAirtableList } from "../../../../hooks/useAirtableList";
import { useAirtableMutation } from "../../../../hooks/useAirtableMutation";
import { useAirtableCreate } from "../../../../hooks/useAirtableCreate";
import type { AirtableRecord, CommentRecord, GhazlenRecord } from "../../../../app/types";
import { buildDataIdFilter, buildShaerFilter, formatGhazlenRecord, isItemLiked, prepareLikeUpdate, prepareShareUpdate, toggleLikedItem } from "../../../../lib/airtable-utils";

const GH_BASE = "appvzkf6nX376pZy6";
const GH_TABLE = "Ghazlen";
const COMMENTS_BASE = "appzB656cMxO0QotZ";
const COMMENTS_TABLE = "Comments";

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
  const [showDialog, setShowDialog] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [commentorName, setCommentorName] = useState<string | null>(null);
  const [comments, setComments] = useState<CommentRecord[]>([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [newComment, setNewComment] = useState("");

  useEffect(() => { AOS.init({ offset: 50, delay: 0, duration: 300 }); }, []);

  const { records, isLoading, isValidating } = useAirtableList<AirtableRecord<any>>(GH_BASE, GH_TABLE, {
    filterByFormula: buildShaerFilter(displayName),
    pageSize: 30,
  });
  const dataItems = useMemo(() => (records || []).map(formatGhazlenRecord) as AirtableRecord<GhazlenRecord>[], [records]);

  const { updateRecord } = useAirtableMutation(GH_BASE, GH_TABLE);
  const { createRecord } = useAirtableCreate(COMMENTS_BASE, COMMENTS_TABLE);

  const handleHeartClick = async (
    e: React.MouseEvent<HTMLButtonElement>,
    shaerData: AirtableRecord<GhazlenRecord>,
    index: number,
    id: string
  ) => {
    toggleanaween(null);
    setDisableHearts(true);
    if (typeof window !== "undefined" && e.detail === 1) {
      try {
        const { liked } = toggleLikedItem("Ghazlen", { id: shaerData.id });
        const inc = liked ? 1 : -1;
        await updateRecord([{ id: shaerData.id, fields: prepareLikeUpdate(shaerData.fields.likes, inc) }]);
        toast[liked ? "success" : "warning"](liked ? "آپ کی پروفائل میں یہ غزل کامیابی کے ساتھ جوڑ دی گئی ہے۔" : "آپ کی پروفائل سے یہ غزل کامیابی کے ساتھ ہٹا دی گئی ہے۔");
      } catch (error) {
        toggleLikedItem("Ghazlen", { id });
        console.error("Error updating likes:", error);
      } finally {
        setDisableHearts(false);
      }
    }
  };

  const handleShareClick = async (shaerData: AirtableRecord<GhazlenRecord>, index: number) => {
    toggleanaween(null);
    try {
      if (navigator.share) {
        await navigator.share({
          title: shaerData.fields.shaer,
          text: (Array.isArray(shaerData.fields.ghazalHead) ? shaerData.fields.ghazalHead : String(shaerData.fields.ghazalHead ?? "").split("\n")).join("\n") + `\nFound this on Jahannuma webpage\nCheckout there webpage here>> `,
          url: `${window.location.href + "/" + shaerData.id}`,
        });
      }
      await updateRecord([{ id: shaerData.id, fields: prepareShareUpdate(shaerData.fields.shares) }]);
    } catch (error) {
      console.error("Error updating shares:", error);
    }
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
  const hideDialog = () => setShowDialog(false);
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setNameInput(e.target.value);
  const handleNameSubmission = () => { if (typeof window !== "undefined") localStorage.setItem("commentorName", nameInput); setCommentorName(nameInput); hideDialog(); };

  // Comments via hook (gated by selection)
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
      // increment comments count
      await updateRecord([{ id: dataId, fields: { comments: ((dataItems.find(d => d.id === dataId)?.fields.comments ?? 0) + 1) as number } }]);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const openComments = (dataId: string) => { toggleanaween(null); setSelectedCommentId(dataId); };
  const closeComments = () => { setSelectedCommentId(null); setComments([]); };

  return (
    <div>
      {showDialog && (
        <div className="w-screen h-screen bg-black bg-opacity-60 flex flex-col justify-center fixed z-50">
          <div dir="rtl" className="dialog-container h-max p-9 -mt-20 w-max max-w-[380px] rounded-md text-center block mx-auto bg-white">
            <div className="dialog-content">
              <p className="text-lg font-bold pb-3 border-b">براہ کرم اپنا نام درج کریں</p>
              <p className="pt-2">ہم آپ کا نام صرف آپ کے تبصروں کو آپ کے نام سے دکھانے کے لیے استعمال کریں گے</p>
              <input type="text" id="nameInput" className="mt-2 p-2 border" value={nameInput} onChange={handleNameChange} />
              <div className=" mt-4">
                <button id="submitBtn" disabled={nameInput.length < 4} className="px-4 py-2 bg-[#984A02] disabled:bg-gray-500 text-white rounded" onClick={handleNameSubmission}>محفوظ کریں</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-row w-screen bg-white p-3 justify-center items-center top-14 z-10">{`${displayName} کی غزلیں`}</div>
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
                  handleCardClick={handleCardClick}
                  toggleanaween={toggleanaween}
                  openanaween={openanaween}
                  handleHeartClick={handleHeartClick as any}
                  handleShareClick={handleShareClick as any}
                  openComments={openComments}
                  heartLiked={isItemLiked("Ghazlen", shaerData.id)}
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