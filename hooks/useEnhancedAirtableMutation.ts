/**
 * Enhanced Airtable Mutation Hook
 * 
 * Updated version of useAirtableMutation that works with the new universal
 * data fetching infrastructure and enhanced error handling.
 */

"use client";

import { invalidateAirtable } from "@/lib/airtable-fetcher";
import {
  ErrorContext,
  createClientError,
  handleError,
  withRetry,
  type EnhancedError
} from "@/lib/error-handling";
import { useCallback, useState } from "react";
import { mutate } from "swr";

// Mutation payload types
export interface MutationRecord {
  id: string;
  fields: Record<string, any>;
}

export interface MutationPayload {
  records: MutationRecord[];
}

export interface MutationOptions {
  optimistic?: boolean;
  affectedKeys?: any[];
  updater?: (current: any) => any;
  retryCount?: number;
  retryDelay?: number;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

export interface MutationResult {
  updateRecord: (
    records: MutationRecord[],
    options?: MutationOptions
  ) => Promise<any>;
  createRecord: (
    fields: Record<string, any>,
    options?: MutationOptions
  ) => Promise<any>;
  deleteRecord: (
    recordId: string,
    options?: MutationOptions
  ) => Promise<any>;
  isUpdating: boolean;
  error: EnhancedError | null;
  clearError: () => void;
}

// Enhanced Airtable API client with proper error handling
class EnhancedAirtableClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(baseId: string, table: string) {
    this.baseUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`;
    this.headers = {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_Api_Token}`,
      "Content-Type": "application/json",
    };
  }

  async patch(payload: MutationPayload): Promise<any> {
    const response = await fetch(this.baseUrl, {
      method: "PATCH",
      headers: this.headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw createClientError(
        `Airtable PATCH failed: ${response.status} ${response.statusText}`,
        {
          code: 'AIRTABLE_PATCH_ERROR',
          statusCode: response.status,
          debugInfo: {
            url: this.baseUrl,
            payload,
            responseText: errorText
          }
        }
      );
    }

    return response.json();
  }

  async post(fields: Record<string, any>): Promise<any> {
    const payload = { fields };
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw createClientError(
        `Airtable POST failed: ${response.status} ${response.statusText}`,
        {
          code: 'AIRTABLE_POST_ERROR',
          statusCode: response.status,
          debugInfo: {
            url: this.baseUrl,
            payload,
            responseText: errorText
          }
        }
      );
    }

    return response.json();
  }

  async delete(recordId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/${recordId}`, {
      method: "DELETE",
      headers: this.headers,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw createClientError(
        `Airtable DELETE failed: ${response.status} ${response.statusText}`,
        {
          code: 'AIRTABLE_DELETE_ERROR',
          statusCode: response.status,
          debugInfo: {
            url: `${this.baseUrl}/${recordId}`,
            recordId,
            responseText: errorText
          }
        }
      );
    }

    return response.json();
  }
}

export function useEnhancedAirtableMutation(
  baseId: string,
  table: string
): MutationResult {
  const [isUpdating, setUpdating] = useState(false);
  const [error, setError] = useState<EnhancedError | null>(null);

  const client = new EnhancedAirtableClient(baseId, table);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Optimistic update helper
  const performOptimisticUpdates = useCallback(
    async (affectedKeys: any[], updater?: (current: any) => any) => {
      const rollbackSnapshots: Array<{ key: any; snapshot: any }> = [];

      if (affectedKeys && affectedKeys.length && updater) {
        for (const key of affectedKeys) {
          try {
            const currentData = await mutate(key, updater, { revalidate: false });
            rollbackSnapshots.push({ key, snapshot: currentData });
          } catch (optimisticError) {
            console.warn('Optimistic update failed for key:', key, optimisticError);
          }
        }
      }

      return rollbackSnapshots;
    },
    []
  );

  // Rollback optimistic updates
  const rollbackOptimisticUpdates = useCallback(
    async (affectedKeys: any[]) => {
      if (affectedKeys && affectedKeys.length) {
        for (const key of affectedKeys) {
          try {
            await mutate(key); // Revalidate to fetch fresh data
          } catch (rollbackError) {
            console.warn('Rollback failed for key:', key, rollbackError);
          }
        }
      }
    },
    []
  );

  // Invalidate caches after successful mutation
  const invalidateCaches = useCallback(
    async (affectedKeys?: any[]) => {
      // Invalidate session cache for this table
      invalidateAirtable(baseId, table);

      if (affectedKeys && affectedKeys.length) {
        // Revalidate specific keys
        for (const key of affectedKeys) {
          try {
            await mutate(key);
          } catch (revalidateError) {
            console.warn('Cache revalidation failed for key:', key, revalidateError);
          }
        }
      } else {
        // Revalidate all SWR caches for this base/table
        await mutate(
          (key: any) =>
            typeof key === "object" && key?.baseId === baseId && key?.table === table,
          undefined,
          { revalidate: true }
        );
      }
    },
    [baseId, table]
  );

  // Update records
  const updateRecord = useCallback(
    async (records: MutationRecord[], options: MutationOptions = {}) => {
      setUpdating(true);
      setError(null);

      const {
        optimistic = false,
        affectedKeys = [],
        updater,
        retryCount = 3,
        retryDelay = 1000,
        showSuccessToast = false,
        showErrorToast = true,
        successMessage = "کامیابی سے اپ ڈیٹ ہو گیا",
        errorMessage = "اپ ڈیٹ کرنے میں خرابی"
      } = options;

      let rollbackSnapshots: Array<{ key: any; snapshot: any }> = [];

      try {
        // Perform optimistic updates
        if (optimistic) {
          rollbackSnapshots = await performOptimisticUpdates(affectedKeys, updater);
        }

        // Perform the actual mutation with retry logic
        const payload: MutationPayload = { records };
        const result = await withRetry(
          () => client.patch(payload),
          retryCount,
          retryDelay,
          ErrorContext.CLIENT_SIDE
        );

        // Invalidate caches on success
        await invalidateCaches(affectedKeys);

        // Show success toast if requested
        if (showSuccessToast) {
          const { toast } = await import("sonner");
          toast.success(successMessage);
        }

        return result;
      } catch (mutationError) {
        const enhancedError = mutationError as EnhancedError;
        setError(enhancedError);

        // Rollback optimistic updates on failure
        if (optimistic) {
          await rollbackOptimisticUpdates(affectedKeys);
        }

        // Show error toast if requested
        if (showErrorToast) {
          handleError(enhancedError);
        }

        throw enhancedError;
      } finally {
        setUpdating(false);
      }
    },
    [client, performOptimisticUpdates, rollbackOptimisticUpdates, invalidateCaches]
  );

  // Create record
  const createRecord = useCallback(
    async (fields: Record<string, any>, options: MutationOptions = {}) => {
      setUpdating(true);
      setError(null);

      const {
        retryCount = 3,
        retryDelay = 1000,
        showSuccessToast = false,
        showErrorToast = true,
        successMessage = "کامیابی سے بنایا گیا",
        errorMessage = "بنانے میں خرابی"
      } = options;

      try {
        const result = await withRetry(
          () => client.post(fields),
          retryCount,
          retryDelay,
          ErrorContext.CLIENT_SIDE
        );

        // Invalidate caches on success
        await invalidateCaches(options.affectedKeys);

        // Show success toast if requested
        if (showSuccessToast) {
          const { toast } = await import("sonner");
          toast.success(successMessage);
        }

        return result;
      } catch (mutationError) {
        const enhancedError = mutationError as EnhancedError;
        setError(enhancedError);

        // Show error toast if requested
        if (showErrorToast) {
          handleError(enhancedError);
        }

        throw enhancedError;
      } finally {
        setUpdating(false);
      }
    },
    [client, invalidateCaches]
  );

  // Delete record
  const deleteRecord = useCallback(
    async (recordId: string, options: MutationOptions = {}) => {
      setUpdating(true);
      setError(null);

      const {
        retryCount = 3,
        retryDelay = 1000,
        showSuccessToast = false,
        showErrorToast = true,
        successMessage = "کامیابی سے ڈیلیٹ ہو گیا",
        errorMessage = "ڈیلیٹ کرنے میں خرابی"
      } = options;

      try {
        const result = await withRetry(
          () => client.delete(recordId),
          retryCount,
          retryDelay,
          ErrorContext.CLIENT_SIDE
        );

        // Invalidate caches on success
        await invalidateCaches(options.affectedKeys);

        // Show success toast if requested
        if (showSuccessToast) {
          const { toast } = await import("sonner");
          toast.success(successMessage);
        }

        return result;
      } catch (mutationError) {
        const enhancedError = mutationError as EnhancedError;
        setError(enhancedError);

        // Show error toast if requested
        if (showErrorToast) {
          handleError(enhancedError);
        }

        throw enhancedError;
      } finally {
        setUpdating(false);
      }
    },
    [client, invalidateCaches]
  );

  return {
    updateRecord,
    createRecord,
    deleteRecord,
    isUpdating,
    error,
    clearError,
  };
}

// Backward compatibility wrapper
export function useAirtableMutation(baseId: string, table: string) {
  const enhanced = useEnhancedAirtableMutation(baseId, table);

  // Return only the updateRecord function for backward compatibility
  return {
    updateRecord: enhanced.updateRecord,
    isUpdating: enhanced.isUpdating,
    error: enhanced.error,
  };
}