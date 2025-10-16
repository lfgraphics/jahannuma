/**
 * Comments feature types.
 * Defines the structure for comment records and form data.
 */

/**
 * Comment record from Airtable.
 * Represents a user comment on a poetry record.
 */
export interface CommentRecord {
  /**
   * The ID of the record this comment belongs to.
   * References the ID field of Ashaar, Ghazlen, Nazmen, or Rubai records.
   */
  dataId: string;
  /**
   * Display name of the person who made the comment.
   * Retrieved from Clerk user metadata.
   */
  commentorName: string;
  /**
   * ISO timestamp when the comment was created.
   * Automatically set when the comment is created.
   */
  timestamp: string;
  /** The actual comment text */
  comment: string;
}

/**
 * Form data for creating a new comment.
 * Used by comment forms and the comments API endpoint.
 */
export interface CommentFormData {
  /** The ID of the record to comment on */
  dataId: string;
  /**
   * Display name of the commenter.
   * Usually retrieved from Clerk user metadata automatically.
   */
  commentorName: string;
  /** The comment text */
  comment: string;
  /** The content type to determine which comment base to use */
  contentType?: string;
}
