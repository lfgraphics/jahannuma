"use client";
import { useState, useCallback } from "react";
import type { AuthActionType } from "@/components/ui/login-required-dialog";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export function useAuthGuard() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<AuthActionType | null>(null);

  const requireAuth = useCallback((action: AuthActionType): boolean => {
    // Shares are allowed for everyone (no auth required)
    if (action === "share") return true;
    // Everything else requires authentication
    if (isSignedIn) return true;
    // For comments, redirect straight to sign-in to satisfy strict policy
    if (action === "comment") {
      router.push("/sign-in");
      return false;
    }
    // Otherwise, show the login-required dialog
    setPendingAction(action);
    setShowLoginDialog(true);
    return false;
  }, [isSignedIn]);

  return { isSignedIn: !!isSignedIn, requireAuth, showLoginDialog, setShowLoginDialog, pendingAction } as const;
}

export default useAuthGuard;
