"use client";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import LoginRequiredDialog from "@/components/ui/login-required-dialog";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { XCircle } from "lucide-react";
import React from "react";

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
  const { requireAuth, showLoginDialog, setShowLoginDialog } = useAuthGuard();
  // Track when the keyboard is likely open so we can expand the drawer while typing
  const [isInputFocused, setIsInputFocused] = React.useState(false);

  // Use VisualViewport (when available) to infer keyboard open/close and adjust height accordingly
  React.useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;
    const onResize = () => {
      const vv = window.visualViewport!;
      const keyboardOpen = window.innerHeight - vv.height > 100; // heuristic
      setIsInputFocused((prev) =>
        prev !== keyboardOpen ? keyboardOpen : prev
      );
    };
    window.visualViewport.addEventListener("resize", onResize);
    window.visualViewport.addEventListener("scroll", onResize);
    return () => {
      window.visualViewport?.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("scroll", onResize);
    };
  }, []);

  const handleCommentSubmit = async () => {
    // Gate comment submission behind auth
    if (!requireAuth("comment")) return;
    await onCommentSubmit(dataId);
  };
  return (
    <Drawer
      open={true}
      onOpenChange={(open) => {
        if (!open) onCloseComments();
      }}
    >
      {/* Login dialog for unauthenticated users attempting to comment */}
      <LoginRequiredDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        actionType="comment"
      />
      <DrawerContent
        dir="rtl"
        className={`z-50 sm:max-w-[800px] mx-auto ${isInputFocused ? "max-h-[92dvh]" : "max-h-[65dvh]"
          }`}
      >
        {/* Top-right close button */}
        <DrawerClose
          className="absolute top-2 right-2 z-50 rounded-full h-10 w-10 flex items-center justify-center"
          // onClick={onCloseComments}
          aria-label="Close comments"
        >
          <XCircle className="text-foreground/80 text-2xl hover:text-primary transition-all duration-300 ease-in-out" />
        </DrawerClose>
        {/* </div> */}
        <DrawerHeader className="pt-6 pb-2">
          <DrawerTitle className="text-foreground text-center">
            تبصرے
          </DrawerTitle>
          <DrawerDescription className="text-muted-foreground text-center w-fit mx-auto">
            اپنی رائے کا اظہار کریں
          </DrawerDescription>
        </DrawerHeader>
        {/* Use dvh so height reacts to mobile browser UI, and expand while typing so the composer stays visible */}
        <div
          className={`flex flex-col min-h-0 overflow-y-auto overscroll-contain ${isInputFocused ? "h-[92dvh]" : "h-[65dvh]"
            }`}
        >
          {/* Comments list */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 pb-4">
            {commentLoading && (
              <div className="flex items-center justify-center">
                <div className="w-6 h-6 border-t-4 border-[#984A02] m-3 rounded-full animate-spin"></div>
                <div className="ml-2 text-lg text-[#984A02]">Loading...</div>
              </div>
            )}
            <div className="pr-1">
              {comments?.length === 0 && !commentLoading && (
                <div className="leading-normal text-muted-foreground">
                  اب تک کوئی تبصرہ نہیں ہے
                  <br /> اس پر تبصرہ کر کے آپ تبصرہ کرنے والے پہلے شخص بنیں
                </div>
              )}
              {comments
                ?.sort(
                  (a, b) =>
                    Number(new Date(b.timestamp)) -
                    Number(new Date(a.timestamp))
                )
                .map((comment, index) => (
                  <div key={index} className="mb-4">
                    <div className="flex items-center justify-start gap-3 m-3">
                      <span className="font-semibold text-md">
                        {comment.commentorName}
                      </span>
                      <span className="bg-muted-foreground/50 h-1 w-1 rounded-full"></span>
                      <span className="text-muted-foreground text-xs mt-0.5">
                        {new Date(comment.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-foreground">{comment.comment}</p>
                    <div className="border-b border-border my-2"></div>
                  </div>
                ))}
            </div>
          </div>
          {/* Composer in DrawerFooter */}
          <DrawerFooter className="border-t border-border bg-background p-3">
            <div className="flex w-full gap-3 items-end">
              <textarea
                placeholder="آپ کا تبصرہ۔۔۔"
                value={newComment}
                onKeyUp={(e) => {
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    window.innerWidth > 490
                  ) {
                    if (
                      document.activeElement === e.target &&
                      newComment.length >= 4
                    ) {
                      e.preventDefault();
                      handleCommentSubmit();
                    }
                  }
                }}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                onChange={(e) => onNewCommentChange(e.target.value)}
                className="w-full h-[3rem] rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground p-2 focus:outline-none text-right"
                style={{
                  resize: "none",
                  maxHeight: "6em",
                }}
              />

              <button
                disabled={newComment.length < 4}
                onClick={handleCommentSubmit}
                className="bg-[#984A02] h-11 text-white px-4 py-2 rounded disabled:bg-gray-500 disabled:cursor-not-allowed w-40"
              >
                تبصرہ کریں
              </button>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CommentSection;
