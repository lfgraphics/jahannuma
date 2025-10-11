/**
 * Shaer (Poet) feature types.
 * Defines the structure for poet records and related data.
 *
 * Note: These are legacy types maintained for backward compatibility.
 * New code should prefer the domain-specific types (AshaarRecord, etc.).
 */

/**
 * Legacy Shaer fields interface.
 * Kept for backward compatibility with existing components.
 *
 * @deprecated Use domain-specific types (AshaarRecord, GhazlenRecord, etc.) for new code.
 */
export interface ShaerFields {
  /** Poetry lines - some sources provide array, others provide string with line breaks */
  sher?: string[];
  /** Name of the poet */
  shaer: string;
  /**
   * Ghazal heading - can be string with line breaks or array.
   * Different data sources provide different formats.
   */
  ghazalHead: string | string[];
  /** Ghazal lines - some sources provide array, others provide string with line breaks */
  ghazal?: string[];
  /**
   * Title(s) - can be string with line breaks or array.
   * Different data sources provide different formats.
   */
  unwan?: string | string[];
  /** Number of likes */
  likes?: number;
  /** Number of comments */
  comments?: number;
  /** Number of shares */
  shares?: number;
  /** Custom ID */
  id?: string;
}

/**
 * Legacy Shaer record interface.
 * Kept for backward compatibility with existing components.
 *
 * @deprecated Use domain-specific types (AshaarRecord, GhazlenRecord, etc.) for new code.
 */
export interface Shaer {
  /** The poet's data */
  fields: ShaerFields;
  /** Airtable record ID */
  id: string;
  /** ISO timestamp when the record was created */
  createdTime: string;
}

/**
 * Route parameters for Shaer pages.
 * Used by dynamic routes like /shaer/[name].
 */
export interface ShaerPageParams {
  /** The poet's name or slug */
  name: string;
}
