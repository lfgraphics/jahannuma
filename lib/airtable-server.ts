/**
 * Server-side Airtable API client for SSR and build-time data fetching
 * This module provides direct Airtable API access with proper error handling,
 * timeouts, and retry logic for server-side rendering contexts.
 */

import type { AirtableListKey, AirtableRecordKey, AirtableSWRKey } from './airtable-fetcher';

// Server-side configuration
interface ServerAirtableConfig {
  apiKey: string;
  timeout: number;
  retries: number;
  retryDelay: number;
}

// Error types for better error handling
export class AirtableServerError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public isRetryable: boolean = false
  ) {
    super(message);
    this.name = 'AirtableServerError';
  }
}

export class AirtableBuildTimeError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'AirtableBuildTimeError';
  }
}

// Default configuration
const DEFAULT_CONFIG: ServerAirtableConfig = {
  apiKey: process.env.AIRTABLE_API_KEY || process.env.NEXT_PUBLIC_Api_Token || '',
  timeout: 10000, // 10 seconds
  retries: 3,
  retryDelay: 1000, // 1 second base delay
};

/**
 * Server-side Airtable API client
 */
export class AirtableServerClient {
  private config: ServerAirtableConfig;

  constructor(config?: Partial<ServerAirtableConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    if (!this.config.apiKey) {
      throw new AirtableServerError(
        'Airtable API key is required. Set AIRTABLE_API_KEY or NEXT_PUBLIC_Api_Token environment variable.',
        500,
        false
      );
    }
  }

  /**
   * Get authentication headers
   */
  private getAuthHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Build Airtable API URL from key
   */
  private buildUrl(key: AirtableSWRKey): string {
    const { baseId, table } = key;
    
    // Record endpoint
    if (key.kind === 'record') {
      return `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}/${key.recordId}`;
    }
    
    // List endpoint
    const qs = new URLSearchParams();
    const params = key.params || {};
    
    for (const [k, v] of Object.entries(params)) {
      if (v == null) continue;
      
      // Exclude non-API params from the URL
      if (k === 'lang' || k === 'search') continue;
      
      if (k === 'fields' && Array.isArray(v)) {
        for (const field of v) {
          qs.append('fields[]', String(field));
        }
        continue;
      }
      
      qs.append(k, String(v));
    }
    
    if (key.kind === 'list' && key.offset) {
      qs.set('offset', String(key.offset));
    }
    
    const query = qs.toString();
    return `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}${query ? `?${query}` : ''}`;
  }

  /**
   * Delay function for retry logic
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Determine if an error is retryable
   */
  private isRetryableError(error: any): boolean {
    // Network errors are retryable
    if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      return true;
    }
    
    // HTTP status codes that are retryable
    if (error.statusCode) {
      const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
      return retryableStatusCodes.includes(error.statusCode);
    }
    
    return false;
  }

  /**
   * Make HTTP request with timeout and retry logic
   */
  private async makeRequest(url: string, options: RequestInit = {}): Promise<any> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= this.config.retries; attempt++) {
      try {
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
        
        const response = await fetch(url, {
          ...options,
          headers: {
            ...this.getAuthHeaders(),
            ...options.headers,
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => '');
          const error = new AirtableServerError(
            `HTTP ${response.status} ${response.statusText}: ${errorText}`,
            response.status,
            this.isRetryableError({ statusCode: response.status })
          );
          
          if (!error.isRetryable || attempt === this.config.retries) {
            throw error;
          }
          
          lastError = error;
        } else {
          const data = await response.json();
          return data;
        }
      } catch (error: any) {
        // Handle abort/timeout errors
        if (error.name === 'AbortError') {
          lastError = new AirtableServerError(
            `Request timeout after ${this.config.timeout}ms`,
            408,
            true
          );
        } else if (error instanceof AirtableServerError) {
          lastError = error;
        } else {
          lastError = new AirtableServerError(
            `Network error: ${error.message}`,
            0,
            this.isRetryableError(error)
          );
        }
        
        // Don't retry on the last attempt or non-retryable errors
        if (attempt === this.config.retries || !this.isRetryableError(lastError)) {
          throw lastError;
        }
      }
      
      // Wait before retrying (exponential backoff)
      if (attempt < this.config.retries) {
        const delayMs = this.config.retryDelay * Math.pow(2, attempt);
        await this.delay(delayMs);
      }
    }
    
    throw lastError!;
  }

  /**
   * Fetch data using Airtable SWR key
   */
  async fetchData(key: AirtableSWRKey): Promise<any> {
    try {
      const url = this.buildUrl(key);
      const data = await this.makeRequest(url, { method: 'GET' });
      return data;
    } catch (error) {
      if (error instanceof AirtableServerError) {
        throw error;
      }
      
      throw new AirtableServerError(
        `Failed to fetch data: ${error instanceof Error ? error.message : String(error)}`,
        500,
        false
      );
    }
  }

  /**
   * Fetch a single record by ID
   */
  async fetchRecord(baseId: string, table: string, recordId: string): Promise<any> {
    const key: AirtableRecordKey = {
      kind: 'record',
      baseId,
      table,
      recordId,
    };
    
    return this.fetchData(key);
  }

  /**
   * Fetch a list of records
   */
  async fetchList(
    baseId: string, 
    table: string, 
    params?: Record<string, any>, 
    offset?: string
  ): Promise<any> {
    const key: AirtableListKey = {
      kind: 'list',
      baseId,
      table,
      params,
      offset,
    };
    
    return this.fetchData(key);
  }

  /**
   * Fetch all records (handles pagination automatically)
   */
  async fetchAllRecords(
    baseId: string, 
    table: string, 
    params?: Record<string, any>
  ): Promise<any[]> {
    const allRecords: any[] = [];
    let offset: string | undefined;
    
    do {
      try {
        const response = await this.fetchList(baseId, table, params, offset);
        
        if (response.records && Array.isArray(response.records)) {
          allRecords.push(...response.records);
        }
        
        offset = response.offset;
      } catch (error) {
        // Log the error but don't throw to allow partial data recovery
        console.error(`Failed to fetch page with offset ${offset}:`, error);
        break;
      }
    } while (offset);
    
    return allRecords;
  }

  /**
   * Test connection to Airtable API
   */
  async testConnection(baseId?: string): Promise<boolean> {
    try {
      const testBaseId = baseId || process.env.AIRTABLE_BASE_ID || 'appeI2xzzyvUN5bR7';
      
      // Try to fetch base metadata (this is a lightweight operation)
      const url = `https://api.airtable.com/v0/meta/bases/${testBaseId}/tables`;
      await this.makeRequest(url, { method: 'GET' });
      
      return true;
    } catch (error) {
      console.error('Airtable connection test failed:', error);
      return false;
    }
  }
}

// Singleton instance for server-side use
let serverClientInstance: AirtableServerClient | null = null;

/**
 * Get singleton server client instance
 */
export function getServerClient(config?: Partial<ServerAirtableConfig>): AirtableServerClient {
  if (!serverClientInstance) {
    serverClientInstance = new AirtableServerClient(config);
  }
  return serverClientInstance;
}

/**
 * Server-side data fetching function that handles build-time errors gracefully
 */
export async function fetchServerData(
  key: AirtableSWRKey,
  options?: {
    fallbackData?: any;
    throwOnError?: boolean;
    logErrors?: boolean;
  }
): Promise<any> {
  const {
    fallbackData = null,
    throwOnError = false,
    logErrors = true,
  } = options || {};
  
  try {
    const client = getServerClient();
    const data = await client.fetchData(key);
    return data;
  } catch (error) {
    if (logErrors) {
      console.error('Server-side data fetching failed:', {
        key,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
    
    if (throwOnError) {
      throw new AirtableBuildTimeError(
        `Build-time data fetching failed for ${key.baseId}/${key.table}`,
        error instanceof Error ? error : new Error(String(error))
      );
    }
    
    return fallbackData;
  }
}

/**
 * Utility function to check if we're in a server environment
 */
export function isServerEnvironment(): boolean {
  return typeof window === 'undefined';
}

/**
 * Utility function to check if we're in build time
 */
export function isBuildTime(): boolean {
  return process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build';
}