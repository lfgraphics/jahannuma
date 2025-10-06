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
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent dir={dir} className="bg-background text-foreground border border-border">
        <AlertDialogHeader>
          <AlertDialogTitle>{getMessageText("loginRequired", language)}</AlertDialogTitle>
          <AlertDialogDescription>
            {getMessageText(messageKeyByAction[actionType], language)}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-2">
          <AlertDialogCancel>{getButtonText("cancel", language)}</AlertDialogCancel>
          <Link href="/sign-up">
            <AlertDialogAction className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
              {getButtonText("signUp", language)}
            </AlertDialogAction>
          </Link>
          <Link href="/sign-in">
            <AlertDialogAction>
              {getButtonText("signIn", language)}
            </AlertDialogAction>
          </Link>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default LoginRequiredDialog;
