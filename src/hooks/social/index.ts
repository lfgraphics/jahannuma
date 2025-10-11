/**
 * Social interaction hooks barrel export.
 * Provides convenient access to all social-related hooks.
 */

export { useCommentSystem } from "./useCommentSystem";
export { useLikeButton } from "./useLikeButton";
export { useShareAction } from "./useShareAction";
export { useSocialActions } from "./useSocialActions";

export type {
  UseCommentSystemOptions,
  UseCommentSystemReturn,
} from "./useCommentSystem";
export type {
  UseLikeButtonOptions,
  UseLikeButtonReturn,
} from "./useLikeButton";
export type {
  UseShareActionArgs,
  UseShareActionReturn,
} from "./useShareAction";
export type { UseSocialActionsReturn } from "./useSocialActions";
