"use client";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { migrateLocalStorageLikes } from "@/lib/user-metadata-utils";

export default function InitLikesMigration() {
  const { user, isLoaded } = useUser();
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isLoaded) return;
      if (!user?.id) return;
      try {
        const res = await migrateLocalStorageLikes(user.id);
        if (!cancelled && res.migrated) {
          // Optional: we could trigger a soft reload of favorites-related views via custom event
          document.dispatchEvent(new CustomEvent("likes-migrated"));
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [user?.id, isLoaded]);
  return null;
}
