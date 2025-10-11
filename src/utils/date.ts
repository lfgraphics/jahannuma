/**
 * Date utility functions for consistent date handling across the app.
 */

/**
 * Format a date string for display in the UI
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  } catch (error) {
    return dateString;
  }
}

/**
 * Format a date string for Urdu display
 */
export function formatDateUrdu(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ur-PK", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  } catch (error) {
    return dateString;
  }
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      return `${diffInDays} days ago`;
    }
  } catch (error) {
    return "Unknown time";
  }
}

/**
 * Check if a date is recent (within last 7 days)
 */
export function isRecentDate(dateString: string): boolean {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    return diffInDays <= 7;
  } catch (error) {
    return false;
  }
}
