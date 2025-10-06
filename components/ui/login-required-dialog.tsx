"use client";
import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { uiTexts, getMessageText, getButtonText } from "@/lib/multilingual-texts";
import Link from "next/link";

export type AuthActionType = "download" | "like" | "comment" | "share";

export interface LoginRequiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionType: AuthActionType;
}

const messageKeyByAction: Record<AuthActionType, keyof typeof uiTexts.messages> = {
  download: "loginToDownload",
  like: "loginToLike",
  comment: "loginToComment",
  share: "shareRequired",
};

export function LoginRequiredDialog({ open, onOpenChange, actionType }: LoginRequiredDialogProps) {
  const { language } = useLanguage();
  const dir = language === "UR" ? "rtl" : "ltr";
  const currentUrl =
    typeof window !== "undefined"
      ? window.location.pathname + window.location.search + window.location.hash
      : "/";
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent dir={dir} className="bg-background text-foreground border border-border">
        <AlertDialogHeader>
          <AlertDialogTitle>{getMessageText("loginRequired", language)}</AlertDialogTitle>
          <AlertDialogDescription>
            {getMessageText(messageKeyByAction[actionType], language)}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-2 flex-col-reverse sm:flex-row">
          <AlertDialogCancel>{getButtonText("cancel", language)}</AlertDialogCancel>
          <AlertDialogAction className="p-0">
            <Link
              href={{ pathname: "/sign-up", query: { returnUrl: currentUrl } }}
              className="inline-flex items-center justify-center h-10 px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              {getButtonText("signUp", language)}
            </Link>
          </AlertDialogAction>
          <AlertDialogAction className="p-0">
            <Link
              href={{ pathname: "/sign-in", query: { returnUrl: currentUrl } }}
              className="inline-flex items-center justify-center h-10 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90"
            >
              {getButtonText("signIn", language)}
            </Link>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default LoginRequiredDialog;
