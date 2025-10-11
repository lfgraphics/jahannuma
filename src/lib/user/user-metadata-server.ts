/**
 * Server-side user metadata operations for Clerk.
 * Handles likes, comments, and other user preferences with proper concurrency control.
 */

import { auth, clerkClient } from "@clerk/nextjs/server";
import type { LikesMetadata, LikesTableKey } from "./user-metadata-utils";
import {
  mergeLikesMetadata,
  toggleLikeInMetadata,
  validateLikesMetadata,
} from "./user-metadata-utils";

type UserMetadata = {
  likes?: LikesMetadata;
};

// Provide a minimal typed view of the Clerk client
type MinimalClerkUsers = {
  getUser: (
    userId: string
  ) => Promise<{ publicMetadata?: Record<string, unknown> } | null>;
  updateUser: (
    userId: string,
    data: { publicMetadata?: Record<string, unknown> }
  ) => Promise<unknown>;
};

async function getClerkUsers(): Promise<MinimalClerkUsers> {
  const anyClient = clerkClient as unknown as any;
  if (typeof anyClient === "function") {
    // Some Clerk SDK versions export a function returning a client
    const c = await anyClient();
    return (c as any).users as MinimalClerkUsers;
  }
  return (anyClient as any).users as MinimalClerkUsers;
}

// Simple per-user concurrency guard to avoid overlapping writes
const userLocks = new Map<string, Promise<any>>();

async function withUserLock<T>(
  userId: string,
  task: () => Promise<T>,
  { rejectOnBusy = true }: { rejectOnBusy?: boolean } = {}
): Promise<T> {
  if (!userId) throw new Error("userId required");

  const inFlight = userLocks.get(userId);
  if (inFlight) {
    if (rejectOnBusy) {
      const err = new Error("CONCURRENT_UPDATE");
      (err as any).code = "CONCURRENT_UPDATE";
      throw err;
    } else {
      await inFlight;
    }
  }

  const promise = task().finally(() => {
    userLocks.delete(userId);
  });

  userLocks.set(userId, promise);
  return promise;
}

/**
 * Get the current authenticated user ID from Clerk.
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const { userId } = auth();
    return userId;
  } catch {
    return null;
  }
}

/**
 * Get user metadata from Clerk.
 */
export async function getUserMetadata(userId: string): Promise<UserMetadata> {
  const users = await getClerkUsers();
  const user = await users.getUser(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const metadata = (user.publicMetadata as UserMetadata) || {};
  return {
    likes: validateLikesMetadata(metadata.likes),
  };
}

/**
 * Update user metadata in Clerk.
 */
export async function updateUserMetadata(
  userId: string,
  updates: Partial<UserMetadata>
): Promise<UserMetadata> {
  return withUserLock(userId, async () => {
    const users = await getClerkUsers();
    const user = await users.getUser(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const currentMetadata = (user.publicMetadata as UserMetadata) || {};
    const newMetadata = {
      ...currentMetadata,
      ...updates,
    };

    // Validate likes if being updated
    if (updates.likes) {
      newMetadata.likes = validateLikesMetadata(updates.likes);
    }

    await users.updateUser(userId, {
      publicMetadata: newMetadata,
    });

    return newMetadata;
  });
}

/**
 * Toggle a like for a specific record.
 */
export async function toggleUserLike(
  userId: string,
  table: LikesTableKey,
  recordId: string
): Promise<{ liked: boolean; metadata: LikesMetadata }> {
  return withUserLock(userId, async () => {
    const currentMetadata = await getUserMetadata(userId);
    const currentLikes = currentMetadata.likes || {};

    const result = toggleLikeInMetadata(currentLikes, table, recordId);

    await updateUserMetadata(userId, {
      likes: result.metadata,
    });

    return {
      liked: result.liked,
      metadata: result.metadata,
    };
  });
}

/**
 * Merge likes metadata (for migration purposes).
 */
export async function mergeLikesIntoUserMetadata(
  userId: string,
  likesToMerge: LikesMetadata
): Promise<LikesMetadata> {
  return withUserLock(userId, async () => {
    const currentMetadata = await getUserMetadata(userId);
    const currentLikes = currentMetadata.likes || {};

    const mergedLikes = mergeLikesMetadata(currentLikes, likesToMerge);

    await updateUserMetadata(userId, {
      likes: mergedLikes,
    });

    return mergedLikes;
  });
}

/**
 * Get fresh user metadata (bypassing any caches).
 */
export async function getFreshUserMetadata(
  userId: string
): Promise<UserMetadata> {
  // This is the same as getUserMetadata for now, but can be extended
  // to include cache-busting if needed
  return getUserMetadata(userId);
}
