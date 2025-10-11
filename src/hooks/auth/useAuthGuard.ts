"use client";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useState } from "react";

export type AuthActionType = "like" | "comment" | "download" | "share";

export function useAuthGuard() {
  const { isSignedIn } = useAuth();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<AuthActionType | null>(
    null
  );

  const requireAuth = useCallback(
    (action: AuthActionType): boolean => {
      // Shares are allowed for everyone (no auth required)
      if (action === "share") return true;
      // Everything else requires authentication
      if (isSignedIn) return true;
      // Not signed-in: show the login-required dialog for this action
      setPendingAction(action);
      setShowLoginDialog(true);
      return false;
    },
    [isSignedIn]
  );

  return {
    isSignedIn: !!isSignedIn,
    requireAuth,
    showLoginDialog,
    setShowLoginDialog,
    pendingAction,
  } as const;
}

export default useAuthGuard;
