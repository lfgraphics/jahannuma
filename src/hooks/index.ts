/**
 * Main hooks barrel export file.
 * Provides convenient single-import access to all hooks.
 *
 * Import patterns:
 * - `import { useAirtableList, useAuthGuard } from '@/hooks'` - Common hooks
 * - `import { useAirtableList } from '@/hooks/airtable'` - Category-specific
 * - `import { useLikeButton } from '@/hooks/social'` - Specific hook
 */

// === Airtable Hooks ===
export {
  useAirtableCreate,
  useAirtableList,
  useAirtableMutation,
  useAirtableRecord,
} from "./airtable";

export type {
  ListParams,
  UseAirtableListOptions,
  UseAirtableRecordOptions,
} from "./airtable";

// === Authentication Hooks ===
export { useAuthGuard, useSafeAuth } from "./auth";

export type { AuthActionType } from "./auth";

// === Social Hooks ===
export {
  useCommentSystem,
  useLikeButton,
  useShareAction,
  useSocialActions,
} from "./social";

export type {
  UseCommentSystemOptions,
  UseCommentSystemReturn,
  UseLikeButtonOptions,
  UseLikeButtonReturn,
  UseShareActionArgs,
  UseShareActionReturn,
  UseSocialActionsReturn,
} from "./social";

// === Utility Hooks ===
export { useDebouncedValue } from "./utils";
