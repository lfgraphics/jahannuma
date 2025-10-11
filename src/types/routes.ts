/**
 * Route parameter types for Next.js dynamic routes.
 * Defines the shape of parameters passed to page components.
 */

/**
 * Parameters for Ashaar dynamic routes.
 * Used by pages like /ashaar/[id] and /ashaar/[slug].
 */
export interface AshaarPageParams {
  /** The record ID or URL slug */
  id: string;
  /** Optional SEO-friendly slug */
  slug?: string;
}

/**
 * Parameters for Mozu (theme) dynamic routes.
 * Used by pages that display content by theme or topic.
 */
export interface MozuPageParams {
  /** The theme or title to filter by */
  unwan: string;
}

/**
 * Parameters for Shaer (poet) dynamic routes.
 * Used by pages like /shaer/[name].
 */
export interface ShaerPageParams {
  /** The poet's name or URL slug */
  name: string;
}
