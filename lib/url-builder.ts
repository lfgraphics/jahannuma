/**
 * Environment-aware URL building infrastructure
 * 
 * This module provides utilities for constructing URLs that work correctly
 * in both server-side rendering (SSR) and client-side contexts, addressing
 * the "Failed to parse URL" errors during build time.
 */

// TypeScript interfaces for URL configuration
export interface URLBuilderConfig {
  /** Base URL for the application (optional, auto-detected if not provided) */
  baseUrl?: string;
  /** API path relative to base URL */
  apiPath: string;
  /** Query parameters to append to the URL */
  params?: Record<string, any>;
  /** Whether to force absolute URL construction */
  forceAbsolute?: boolean;
}

export interface EnvironmentContext {
  /** Whether code is running on server */
  isServer: boolean;
  /** Whether code is running on client */
  isClient: boolean;
  /** Whether code is running during build process */
  isBuild: boolean;
  /** Detected base URL for the current environment */
  baseUrl: string;
  /** Default API endpoint prefix */
  apiEndpoint: string;
}

export interface URLBuilder {
  /** Build URL for server-side use (always absolute) */
  buildServerURL(config: URLBuilderConfig): string;
  /** Build URL for client-side use (relative by default) */
  buildClientURL(config: URLBuilderConfig): string;
  /** Get the current base URL */
  getBaseURL(): string;
  /** Get current environment context */
  getEnvironmentContext(): EnvironmentContext;
  /** Check if running in server environment */
  isServer(): boolean;
  /** Check if running in client environment */
  isClient(): boolean;
}

// Environment detection utilities
function detectEnvironment(): EnvironmentContext {
  // Server-side detection
  const isServer = typeof window === 'undefined';
  const isClient = !isServer;
  
  // Build-time detection (during Next.js build process)
  const isBuild = isServer && (
    process.env.NODE_ENV === 'production' && 
    !process.env.VERCEL_URL && 
    !process.env.NEXT_PUBLIC_VERCEL_URL
  );

  // Base URL detection for different environments
  let baseUrl = '';
  let apiEndpoint = '/api';

  if (isServer) {
    // Server-side base URL detection
    if (process.env.VERCEL_URL) {
      // Vercel deployment
      baseUrl = `https://${process.env.VERCEL_URL}`;
    } else if (process.env.NEXT_PUBLIC_VERCEL_URL) {
      // Vercel with public URL
      baseUrl = `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
    } else if (process.env.NEXT_PUBLIC_APP_URL) {
      // Custom app URL
      baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    } else if (process.env.NODE_ENV === 'development') {
      // Development environment
      baseUrl = 'http://localhost:3000';
    } else {
      // Production fallback - this should be configured
      baseUrl = 'https://jahannuma.vercel.app';
      console.warn('No base URL configured for production. Using fallback:', baseUrl);
    }
  } else {
    // Client-side - use current origin
    baseUrl = window.location.origin;
  }

  return {
    isServer,
    isClient,
    isBuild,
    baseUrl,
    apiEndpoint,
  };
}

// URL parameter serialization
function serializeParams(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  for (const [key, value] of Object.entries(params)) {
    if (value == null) continue;
    
    if (Array.isArray(value)) {
      // Handle array parameters (e.g., fields[])
      for (const item of value) {
        searchParams.append(`${key}[]`, String(item));
      }
    } else if (typeof value === 'object') {
      // Handle nested objects (e.g., sort[0][field])
      for (const [subKey, subValue] of Object.entries(value)) {
        if (subValue != null) {
          searchParams.append(`${key}[${subKey}]`, String(subValue));
        }
      }
    } else {
      searchParams.append(key, String(value));
    }
  }
  
  return searchParams.toString();
}

// URL validation
function validateURL(url: string): void {
  try {
    new URL(url);
  } catch (error) {
    throw new Error(`Invalid URL constructed: ${url}. ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Main URL builder implementation
class URLBuilderImpl implements URLBuilder {
  private environmentContext: EnvironmentContext;

  constructor() {
    this.environmentContext = detectEnvironment();
  }

  getEnvironmentContext(): EnvironmentContext {
    return { ...this.environmentContext };
  }

  isServer(): boolean {
    return this.environmentContext.isServer;
  }

  isClient(): boolean {
    return this.environmentContext.isClient;
  }

  getBaseURL(): string {
    return this.environmentContext.baseUrl;
  }

  buildServerURL(config: URLBuilderConfig): string {
    const { apiPath, params, baseUrl: customBaseUrl } = config;
    
    // Always use absolute URLs for server-side
    const baseUrl = customBaseUrl || this.environmentContext.baseUrl;
    
    if (!baseUrl) {
      throw new Error(
        'Base URL is required for server-side URL construction. ' +
        'Please set NEXT_PUBLIC_APP_URL, VERCEL_URL, or provide baseUrl in config.'
      );
    }

    // Ensure apiPath starts with /
    const normalizedPath = apiPath.startsWith('/') ? apiPath : `/${apiPath}`;
    
    // Construct base URL
    let url = `${baseUrl}${normalizedPath}`;
    
    // Add query parameters if provided
    if (params && Object.keys(params).length > 0) {
      const queryString = serializeParams(params);
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    // Validate the constructed URL
    validateURL(url);
    
    return url;
  }

  buildClientURL(config: URLBuilderConfig): string {
    const { apiPath, params, forceAbsolute, baseUrl: customBaseUrl } = config;
    
    // Use absolute URL if forced or custom base URL provided
    if (forceAbsolute || customBaseUrl) {
      return this.buildServerURL(config);
    }

    // Use relative URLs for client-side by default
    const normalizedPath = apiPath.startsWith('/') ? apiPath : `/${apiPath}`;
    let url = normalizedPath;
    
    // Add query parameters if provided
    if (params && Object.keys(params).length > 0) {
      const queryString = serializeParams(params);
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return url;
  }
}

// Singleton instance
let urlBuilderInstance: URLBuilder | null = null;

/**
 * Get the URL builder instance
 * Creates a new instance if one doesn't exist
 */
export function getURLBuilder(): URLBuilder {
  if (!urlBuilderInstance) {
    urlBuilderInstance = new URLBuilderImpl();
  }
  return urlBuilderInstance;
}

/**
 * Convenience function to build URLs based on current environment
 * Automatically chooses server or client URL building based on context
 */
export function buildURL(config: URLBuilderConfig): string {
  const builder = getURLBuilder();
  
  if (builder.isServer()) {
    return builder.buildServerURL(config);
  } else {
    return builder.buildClientURL(config);
  }
}

/**
 * Build URL specifically for API routes
 * Handles the common pattern of /api/* endpoints
 */
export function buildAPIURL(endpoint: string, params?: Record<string, any>): string {
  const apiPath = endpoint.startsWith('/api/') ? endpoint : `/api/${endpoint}`;
  
  return buildURL({
    apiPath,
    params,
  });
}

/**
 * Build URL for Airtable API endpoints
 * Handles the specific pattern used by the application
 */
export function buildAirtableAPIURL(
  table: string, 
  params?: Record<string, any>
): string {
  return buildAPIURL(`airtable/${table}`, params);
}

// Export environment detection for external use
export { detectEnvironment };
