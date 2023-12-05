import React from "react";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  dataId: string | null;
  commentorName: string | null;
  timestamp: string;
  comment: string;
}

interface CommentSectionProps {
  dataId: string; // Add dataId to the props
  comments: Comment[];
  onCommentSubmit: (dataId: string) => Promise<void>;
  commentLoading: boolean;
  newComment: string;
  onNewCommentChange: (newComment: string) => void;
  onCloseComments: () => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  dataId, // Receive dataId from props
  comments,
  commentLoading,
  newComment,
  onNewCommentChange,
  onCommentSubmit,
  onCloseComments,
}) => {
  const handleCommentSubmit = async () => {
    // Pass the dataId from props to onCommentSubmit function
    await onCommentSubmit(dataId);
  };
  return (
    <div
      dir="rtl"
      className="sticky w-screen bottom-0 z-10 pb-16 shadow-lg min-h-[40svh] max-h-[55svh] overflow-y-scroll border-spacing-1 border-t-4 mt-4 p-4 bg-white text-lg"
      style={{ borderTop: "6px groove" }}
    >
      {commentLoading && (
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 border-t-4 border-[#984A02] m-3 rounded-full animate-spin"></div>
          <div className="ml-2 text-lg text-[#984A02]">Loading</div>
        </div>
      )}
      {comments.length === 0 && <div style={{lineHeight:'normal'}}>اس غزل پر اب تک کوئی تبصرہ نہیں ہے<br /> اس پر تبصرہ کر کے آپ تبصرہ کرنے والے پہلے شخص بنیں</div>}

      {comments.map((comment, index) => (
        <div key={index} className="mb-8" onClick={onCloseComments}>
          <div className="flex items-center justify-start gap-3 m-3">
            <span className="font-semibold text-md">
              {comment.commentorName}
            </span>{" "}
            <span className="bg-gray-500 h-2 w-2 rounded-full"></span>
            <span className="text-gray-500 text-md">
              {formatDistanceToNow(new Date(comment.timestamp), {
                addSuffix: true,
              })}
            </span>
          </div>
          <p>{comment.comment}</p>
          <div className="border-b my-2"></div>
        </div>
      ))}

      <div className="fixed z-40 justify-around items-end bottom-0 p-3 border-t bg-white flex w-[100vw] px-5">
        <textarea
          placeholder="آپ کا تبصرہ۔۔۔"
          value={newComment}
          onKeyUp={(e) => {
            // Check if the Enter key is pressed (key code 13) without the Shift key
            if (e.key === "Enter" && !e.shiftKey) {
              // Check if the text field is in focus and meets the minimum length requirement
              if (
                document.activeElement === e.target &&
                newComment.length >= 4
              ) {
                // Prevent the default Enter key behavior (creating a new line)
                e.preventDefault();
                // Call handleCommentSubmit
                handleCommentSubmit();
              }
            }
          }}
          onChange={(e) => onNewCommentChange(e.target.value)}
          className="w-[70%] h-[3rem] bg-gray-400 text-white rounded-sm focus:border-black placeholder:text-white p-2 focus:outline-none text-right"
          style={{

            padding: "5px",
            outline: "none",
            resize: "none", // Disable textarea resizing
            maxHeight: "6em", // Set max height to 5 lines
          }}
        />

        <button
          disabled={newComment.length < 4}
          onClick={handleCommentSubmit}
          className="bg-[#984A02] h-11 text-white p-2 rounded disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          تبصرہ کریں
        </button>
      </div>
    </div>
  );
};

export default CommentSection;
