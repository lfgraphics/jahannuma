/**
 * Hooks barrel export file.
 * Provides convenient single-import access to all hooks.
 */

// Enhanced Airtable hooks (new infrastructure)
export {
  useAirtableList // Backward compatibility wrapper
  , useEnhancedAirtableList
} from "./useEnhancedAirtableList";
export {
  useAirtableMutation // Backward compatibility wrapper
  , useEnhancedAirtableMutation
} from "./useEnhancedAirtableMutation";

// Legacy Airtable hooks (for gradual migration)
export { useAirtableCreate } from "./useAirtableCreate";
export { useAirtableRecord } from "./useAirtableRecord";

// Authentication hooks
export { default as useAuthGuard } from "./useAuthGuard";
export { useSafeAuth } from "./useSafeAuth";

// Social hooks
export { useLikeButton } from "./useLikeButton";
export { useShareAction } from "./useShareAction";
export { useSocialActions } from "./useSocialActions";

// Comment hooks
export { useCommentSystem } from "./useCommentSystem";

// Utility hooks
export { useDebouncedValue } from "./useDebouncedValue";
