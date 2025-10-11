/**
 * Shared component exports.
 * Common components used across multiple features.
 */

export { default as AuthorCard } from "./AuthorCard";
export { default as BackButton } from "./BackButton";
export { default as Breadcrumbs } from "./Breadcrumbs";
export { default as CommentSection } from "./CommentSection";
export { default as ErrorBoundary } from "./ErrorBoundary";
export { default as LanguageToggle } from "./LanguageToggle";
export { default as LikeButton } from "./LikeButton";
export { default as LoadingSpinner } from "./LoadingSpinner";
export { default as ShareButton } from "./ShareButton";
export { default as TagsList } from "./TagsList";

// Export types
export type {
  AuthorCardProps,
  BackButtonProps,
  BreadcrumbsProps,
  CommentSectionProps,
  ErrorBoundaryProps,
  LanguageToggleProps,
  LikeButtonProps,
  LoadingSpinnerProps,
  ShareButtonProps,
  TagsListProps,
} from "./types";
