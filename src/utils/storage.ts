/**
 * Local storage utilities with error handling and type safety.
 */

/**
 * Safely get item from localStorage with JSON parsing
 */
export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    if (typeof window === "undefined") return defaultValue;

    const item = window.localStorage.getItem(key);
    if (item === null) return defaultValue;

    return JSON.parse(item);
  } catch (error) {
    console.warn(`Failed to get localStorage item "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Safely set item in localStorage with JSON stringification
 */
export function setStorageItem<T>(key: string, value: T): boolean {
  try {
    if (typeof window === "undefined") return false;

    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Failed to set localStorage item "${key}":`, error);
    return false;
  }
}

/**
 * Remove item from localStorage
 */
export function removeStorageItem(key: string): boolean {
  try {
    if (typeof window === "undefined") return false;

    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Failed to remove localStorage item "${key}":`, error);
    return false;
  }
}

/**
 * Clear all localStorage items
 */
export function clearStorage(): boolean {
  try {
    if (typeof window === "undefined") return false;

    window.localStorage.clear();
    return true;
  } catch (error) {
    console.warn("Failed to clear localStorage:", error);
    return false;
  }
}

/**
 * Get localStorage size in bytes
 */
export function getStorageSize(): number {
  try {
    if (typeof window === "undefined") return 0;

    let total = 0;
    for (const key in window.localStorage) {
      if (window.localStorage.hasOwnProperty(key)) {
        total += window.localStorage[key].length + key.length;
      }
    }
    return total;
  } catch (error) {
    console.warn("Failed to calculate localStorage size:", error);
    return 0;
  }
}

/**
 * Check if localStorage is available
 */
export function isStorageAvailable(): boolean {
  try {
    if (typeof window === "undefined") return false;

    const test = "__storage_test__";
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Storage keys used throughout the app
 */
export const STORAGE_KEYS = {
  USER_PREFERENCES: "jahannuma_user_preferences",
  THEME: "jahannuma_theme",
  LANGUAGE: "jahannuma_language",
  LIKED_ITEMS: "jahannuma_liked_items",
  READING_HISTORY: "jahannuma_reading_history",
  SEARCH_HISTORY: "jahannuma_search_history",
  BOOKMARK_CACHE: "jahannuma_bookmark_cache",
} as const;
