/**
 * User utilities barrel export.
 * Provides convenient access to all user-related utilities.
 */

// Client-side utilities
export {
  isRecordLiked,
  mapTableToLikesKey,
  mergeLikesMetadata,
  migrateLocalStorageLikes,
  toggleLikeInMetadata,
  validateLikesMetadata,
} from "./user-metadata-utils";

export type { LikesMetadata, LikesTableKey } from "./user-metadata-utils";

// Server-side utilities
export {
  getCurrentUserId,
  getFreshUserMetadata,
  getUserMetadata,
  mergeLikesIntoUserMetadata,
  toggleUserLike,
  updateUserMetadata,
} from "./user-metadata-server";
