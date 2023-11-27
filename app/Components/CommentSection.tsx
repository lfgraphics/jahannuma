"use client";
import { format, formatDistanceToNow } from "date-fns";
import React, { useState, useEffect } from "react";

interface CommentSectionProps {
  dataId: string; // Assuming dataId is a string, adjust it according to your actual type
}
interface Comment {
  dataId: string;
  commentorName: string | null;
  timestamp: string;
  comment: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ dataId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentorName, setCommentorName] = useState<string | null>(null); // Set initial value to null
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      const storedName = localStorage.getItem("commentorName");
      try {
        setLoading(true)
        const BASE_ID = "appzB656cMxO0QotZ";
        const TABLE_NAME = "Comments";
        const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?filterByFormula=dataId="${dataId}"`;
        const headers = {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_Api_Token}`,
        };

        const response = await fetch(url, { headers });
        const result = await response.json();

        const fetchedComments = result.records.map(
          (record: {
            fields: {
              dataId: string;
              commentorName: string | null;
              timestamp: string | Date;
              comment: string;
            };
          }) => ({
            dataId: record.fields.dataId,
            commentorName: record.fields.commentorName,
            timestamp: record.fields.timestamp,
            comment: record.fields.comment,
          })
        );
        setLoading(false);
        setComments(fetchedComments);
      } catch (error) {
        setLoading(false);
        console.error(`Failed to fetch comments: ${error}`);
      }
      if (!commentorName && storedName === null) {
        // Prompt the user for their name
        const name = prompt(
          `Please enter your name\nWe'll use this name for your later comments to track your comments only:`
        );

        if (name !== null) {
          // Save the name to localStorage first
          localStorage.setItem("commentorName", name);

          // Then set the state
          setCommentorName(name);
        } else if (name === null) {
          alert("It's your name, we won't use it")
          return;
        }
      } else {
        // Use the stored name
        console.log("Using stored name:", commentorName || storedName);
        setCommentorName(commentorName || storedName);
      }
    };

    fetchComments();
  }, [dataId]);

  const handleCommentSubmit = async () => {
    // Check if the user has provided a name
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("commentorName");

      if (!commentorName && storedName === null) {
        // Prompt the user for their name
        const name = prompt(
          `Please enter your name\nWe'll use this name for your later comments to track your comments only:`
        );

        if (name !== null) {
          // Save the name to localStorage first
          localStorage.setItem("commentorName", name);

          // Then set the state
          setCommentorName(name);
        } else if (name === null) {
          console.log("User canceled the prompt.");
          return;
        }
      } else {
        // Use the stored name
        console.log("Using stored name:", commentorName || storedName);
        setCommentorName(commentorName || storedName);
      }
    }

    try {
      const BASE_ID = "appzB656cMxO0QotZ";
      const TABLE_NAME = "Comments";
      const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;
      const headers = {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_Api_Token}`,
        "Content-Type": "application/json",
      };

      const timestamp = new Date().toISOString();
      const date = new Date(timestamp);

      const formattedDate = format(date, "MMMM dd, yyyy h:mm", {});

      const commentData = {
        dataId,
        commentorName,
        timestamp: formattedDate,
        comment: newComment,
      };

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({ records: [{ fields: commentData }] }),
      });

      if (response.ok) {
        // Update the UI with the new comment
        setComments((prevComments: Comment[]) => [
          ...prevComments,
          commentData,
        ]);

        // Clear the input field
        setNewComment("");
      } else {
        console.error(`Failed to add comment: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Error adding comment: ${error}`);
    }
  };

  return (
    <div
      dir="rtl"
      className="sticky w-[100vw]  bottom-0 z-10 shadow-lg min-h-[60vh] max-h-[70vh] overflow-y-scroll border-t mt-4 pb-7 p-4 bg-white text-lg"
    >
      {loading&&(
       <div>Loading.....</div> 
      )}
      {comments.map((comment, index) => (
        <div key={index} className="mb-8">
          <div className="flex items-center justify-start gap-3 m-3">
            <span className="font-semibold">{comment.commentorName}</span>
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

      <div className="fixed justify-around bottom-0 pb-3 bg-white text-black flex w-[100vw] px-5">
        <input
          type="text"
          placeholder="آپکا تبسرہ۔۔۔"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-[70%] border-b-2 p-2 focus:outline-none text-right"
        />
        <button
          onClick={handleCommentSubmit}
          className="bg-[#984A02] text-white p-2 rounded"
        >
          {/* Add your arrow icon here */}
          تبسرہ کریں
        </button>
      </div>
    </div>
  );
};

export default CommentSection;
