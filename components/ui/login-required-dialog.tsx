"use client";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  getButtonText,
  getMessageText,
  uiTexts,
} from "@/lib/multilingual-texts";
import Link from "next/link";
// Note: We intentionally avoid Clerk's styled buttons here per request.

export type AuthActionType = "download" | "like" | "comment" | "share";

export interface LoginRequiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionType: AuthActionType;
}

const messageKeyByAction: Record<
  AuthActionType,
  keyof typeof uiTexts.messages
> = {
  download: "loginToDownload",
  like: "loginToLike",
  comment: "loginToComment",
  share: "shareRequired",
};

export function LoginRequiredDialog({
  open,
  onOpenChange,
  actionType,
}: LoginRequiredDialogProps) {
  const { language } = useLanguage();
  const dir = language === "UR" ? "rtl" : "ltr";
  const currentUrl =
    typeof window !== "undefined"
      ? window.location.pathname + window.location.search + window.location.hash
      : "/";
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        dir={dir}
        className="bg-background text-foreground border border-border"
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">
            {getMessageText("loginRequired", language)}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center mx-auto">
            {getMessageText(messageKeyByAction[actionType], language)}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-2 flex-col-reverse sm:flex-row sm:justify-between">
          <AlertDialogCancel>
            {getButtonText("cancel", language)}
          </AlertDialogCancel>
          <Button>
            <Link
              href={{ pathname: "/sign-up", query: { returnUrl: currentUrl } }}
            >
              {getButtonText("signUp", language)}
            </Link>
          </Button>
          <Button>
            <Link
              href={{ pathname: "/sign-in", query: { returnUrl: currentUrl } }}
            >
              {getButtonText("signIn", language)}
            </Link>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default LoginRequiredDialog;
