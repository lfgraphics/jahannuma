"use client";
import { useAuth, useUser } from "@clerk/nextjs";

/**
 * useSafeAuth provides resilient auth flags for UI contexts.
 * If Clerk keys are not configured or hooks throw during prerender/dev,
 * it returns a conservative signed-out state instead of throwing.
 */
export function useSafeAuth() {
    try {
        const { isSignedIn, isLoaded } = useAuth();
        const { user } = useUser();
        return { isSignedIn: !!isSignedIn, isLoaded: !!isLoaded, user, userId: user?.id ?? null } as const;
    } catch {
        return { isSignedIn: false, isLoaded: true, user: null, userId: null } as const;
    }
}

export default useSafeAuth;
