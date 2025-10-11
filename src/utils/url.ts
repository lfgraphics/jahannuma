/**
 * URL and navigation utilities.
 */

/**
 * Build URL with query parameters
 */
export function buildUrl(
  base: string,
  params: Record<string, string | number | boolean>
): string {
  const url = new URL(base, window.location.origin);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

/**
 * Get current URL parameters as object
 */
export function getUrlParams(): Record<string, string> {
  const params: Record<string, string> = {};
  const searchParams = new URLSearchParams(window.location.search);

  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
}

/**
 * Share content via Web Share API or fallback
 */
export async function shareContent(data: {
  title: string;
  text?: string;
  url?: string;
}): Promise<void> {
  if (navigator.share && navigator.canShare && navigator.canShare(data)) {
    try {
      await navigator.share(data);
    } catch (error) {
      // User cancelled or error occurred
      console.log("Share cancelled or failed:", error);
    }
  } else {
    // Fallback: copy to clipboard
    const shareText = `${data.title}${data.text ? "\n" + data.text : ""}${
      data.url ? "\n" + data.url : ""
    }`;
    await navigator.clipboard.writeText(shareText);
  }
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
}

/**
 * Open URL in new tab/window
 */
export function openInNewTab(url: string): void {
  window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * Check if URL is external
 */
export function isExternalUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname !== window.location.hostname;
  } catch {
    return false;
  }
}

/**
 * Generate social media share URLs
 */
export const socialShareUrls = {
  twitter: (text: string, url: string) =>
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}&url=${encodeURIComponent(url)}`,

  facebook: (url: string) =>
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,

  whatsapp: (text: string, url: string) =>
    `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,

  telegram: (text: string, url: string) =>
    `https://t.me/share/url?url=${encodeURIComponent(
      url
    )}&text=${encodeURIComponent(text)}`,

  linkedin: (url: string, title: string) =>
    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      url
    )}&title=${encodeURIComponent(title)}`,
};
