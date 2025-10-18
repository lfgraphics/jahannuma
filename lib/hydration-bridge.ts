/**
 * Hydration Bridge for Seamless Server-to-Client Transition
 * 
 * This module provides utilities to serialize server-fetched data for client hydration,
 * prevent hydration mismatches, and initialize client-side SWR cache with server data.
 */

import React from 'react';
import { mutate } from 'swr';

// Hydration data structure
export interface HydrationData<T = any> {
  /** The serialized data */
  data: T;
  /** Cache key for SWR */
  cacheKey: string;
  /** Timestamp when data was fetched on server */
  timestamp: number;
  /** Source of the data */
  source: 'server' | 'fallback' | 'cache';
  /** Metadata about the request */
  metadata?: {
    baseId: string;
    table: string;
    params?: Record<string, any>;
  };
}

// Hydration bridge interface
export interface HydrationBridge {
  /** Serialize server data for client hydration */
  serializeServerData<T>(data: T, cacheKey: string, metadata?: any): string;
  /** Deserialize server data on client */
  deserializeServerData<T>(serialized: string): HydrationData<T> | null;
  /** Hydrate client state with server data */
  hydrateClientState<T>(hydrationData: HydrationData<T>): void;
  /** Check if data needs revalidation */
  needsRevalidation(hydrationData: HydrationData): boolean;
}

// Default hydration bridge implementation
class HydrationBridgeImpl implements HydrationBridge {
  private maxAge: number;

  constructor(maxAge: number = 300000) { // 5 minutes default
    this.maxAge = maxAge;
  }

  serializeServerData<T>(
    data: T, 
    cacheKey: string, 
    metadata?: any
  ): string {
    const hydrationData: HydrationData<T> = {
      data,
      cacheKey,
      timestamp: Date.now(),
      source: 'server',
      metadata,
    };

    try {
      return JSON.stringify(hydrationData);
    } catch (error) {
      console.error('Failed to serialize server data:', error);
      return JSON.stringify({
        data: null,
        cacheKey,
        timestamp: Date.now(),
        source: 'fallback',
        metadata,
      });
    }
  }

  deserializeServerData<T>(serialized: string): HydrationData<T> | null {
    try {
      const hydrationData: HydrationData<T> = JSON.parse(serialized);
      
      // Validate the structure
      if (!hydrationData.cacheKey || !hydrationData.timestamp) {
        console.warn('Invalid hydration data structure');
        return null;
      }

      return hydrationData;
    } catch (error) {
      console.error('Failed to deserialize server data:', error);
      return null;
    }
  }

  hydrateClientState<T>(hydrationData: HydrationData<T>): void {
    try {
      // Initialize SWR cache with server data
      mutate(hydrationData.cacheKey, hydrationData.data, {
        revalidate: this.needsRevalidation(hydrationData),
      });

      console.debug('Hydrated client state', {
        cacheKey: hydrationData.cacheKey,
        source: hydrationData.source,
        age: Date.now() - hydrationData.timestamp,
      });
    } catch (error) {
      console.error('Failed to hydrate client state:', error);
    }
  }

  needsRevalidation(hydrationData: HydrationData): boolean {
    const age = Date.now() - hydrationData.timestamp;
    
    // Always revalidate fallback data
    if (hydrationData.source === 'fallback') {
      return true;
    }

    // Revalidate if data is older than maxAge
    return age > this.maxAge;
  }
}

// Singleton instance
let hydrationBridgeInstance: HydrationBridge | null = null;

/**
 * Get the hydration bridge instance
 */
export function getHydrationBridge(): HydrationBridge {
  if (!hydrationBridgeInstance) {
    hydrationBridgeInstance = new HydrationBridgeImpl();
  }
  return hydrationBridgeInstance;
}

/**
 * Convenience function to serialize data for hydration
 */
export function serializeForHydration<T>(
  data: T,
  cacheKey: string,
  metadata?: any
): string {
  const bridge = getHydrationBridge();
  return bridge.serializeServerData(data, cacheKey, metadata);
}

/**
 * Convenience function to hydrate client state
 */
export function hydrateFromServer<T>(serializedData: string): void {
  const bridge = getHydrationBridge();
  const hydrationData = bridge.deserializeServerData<T>(serializedData);
  
  if (hydrationData) {
    bridge.hydrateClientState(hydrationData);
  }
}

/**
 * React hook for client-side hydration
 */
export function useHydration<T>(
  serializedData?: string,
  fallbackData?: T
): {
  isHydrated: boolean;
  data: T | null;
  error: Error | null;
} {
  const [state, setState] = React.useState<{
    isHydrated: boolean;
    data: T | null;
    error: Error | null;
  }>({
    isHydrated: false,
    data: fallbackData || null,
    error: null,
  });

  React.useEffect(() => {
    if (!serializedData) {
      setState(prev => ({ ...prev, isHydrated: true }));
      return;
    }

    try {
      const bridge = getHydrationBridge();
      const hydrationData = bridge.deserializeServerData<T>(serializedData);
      
      if (hydrationData) {
        bridge.hydrateClientState(hydrationData);
        setState({
          isHydrated: true,
          data: hydrationData.data,
          error: null,
        });
      } else {
        setState({
          isHydrated: true,
          data: fallbackData || null,
          error: new Error('Failed to deserialize hydration data'),
        });
      }
    } catch (error) {
      setState({
        isHydrated: true,
        data: fallbackData || null,
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }, [serializedData, fallbackData]);

  return state;
}

/**
 * Higher-order component for automatic hydration
 */
export function withHydration<P extends object>(
  Component: React.ComponentType<P>,
  getHydrationData?: (props: P) => string | undefined
) {
  return function HydratedComponent(props: P) {
    const serializedData = getHydrationData?.(props);
    const { isHydrated, error } = useHydration(serializedData);

    if (!isHydrated) {
      return React.createElement('div', null, 'Loading...');
    }

    if (error) {
      console.error('Hydration error:', error);
    }

    return React.createElement(Component, props);
  };
}