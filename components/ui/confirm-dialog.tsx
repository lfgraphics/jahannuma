"use client";
import * as React from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { getButtonText, type Language } from "@/lib/multilingual-texts";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  variant?: "default" | "destructive";
  loading?: boolean;
}

export function ConfirmDialog({ open, onOpenChange, title, description, confirmText, cancelText, onConfirm, variant = "default", loading = false, }: ConfirmDialogProps) {
  const { language } = useLanguage();
  const confirmLabel = confirmText ?? getButtonText("confirm", language);
  const cancelLabel = cancelText ?? getButtonText("cancel", language);
  const [internalLoading, setInternalLoading] = React.useState(false);

  const isLoading = loading || internalLoading;
  const actionClass = variant === "destructive"
    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
    : undefined;

  const handleConfirmClick = async () => {
    try {
      setInternalLoading(true);
      await onConfirm();
    } catch (err) {
      // Surface/log errors so failures aren't swallowed silently
      console.error("ConfirmDialog onConfirm error:", err);
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            className={actionClass}
            onClick={handleConfirmClick}
            disabled={isLoading}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default ConfirmDialog;
