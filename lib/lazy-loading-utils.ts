/**
 * Lazy loading utilities for multilingual components
 * Provides code splitting and performance optimization for language-specific routes
 */

import type { Language } from '@/lib/multilingual-texts';
import React, { ComponentType, LazyExoticComponent, lazy } from 'react';

/**
 * Configuration for lazy loading components
 */
export interface LazyLoadConfig {
  /** Preload the component on hover/focus */
  preloadOnHover?: boolean;
  /** Preload delay in milliseconds */
  preloadDelay?: number;
  /** Chunk name for webpack */
  chunkName?: string;
  /** Loading component */
  fallback?: ComponentType;
  /** Error boundary component */
  errorBoundary?: ComponentType<{ error: Error; retry: () => void }>;
}

/**
 * Language-specific component loader
 */
export interface LanguageComponentLoader<T = any> {
  /** Component loader function */
  loader: () => Promise<{ default: ComponentType<T> }>;
  /** Language this component is for */
  language: Language;
  /** Loading configuration */
  config?: LazyLoadConfig;
}

/**
 * Cache for lazy-loaded components to avoid duplicate loading
 */
const componentCache = new Map<string, LazyExoticComponent<any>>();

/**
 * Create a lazy-loaded component with language-specific optimizations
 */
export function createLazyComponent<T = any>(
  loader: () => Promise<{ default: ComponentType<T> }>,
  config: LazyLoadConfig = {}
): LazyExoticComponent<ComponentType<T>> {
  const cacheKey = loader.toString();

  if (componentCache.has(cacheKey)) {
    return componentCache.get(cacheKey)!;
  }

  const LazyComponent = lazy(loader);
  componentCache.set(cacheKey, LazyComponent);

  return LazyComponent;
}

/**
 * Create language-specific lazy components
 */
export function createLanguageComponents<T = any>(
  loaders: Record<Language, LanguageComponentLoader<T>>
): Record<Language, LazyExoticComponent<ComponentType<T>>> {
  const components: Partial<Record<Language, LazyExoticComponent<ComponentType<T>>>> = {};

  Object.entries(loaders).forEach(([language, { loader, config }]) => {
    const lang = language as Language;
    components[lang] = createLazyComponent(loader, config);
  });

  return components as Record<Language, LazyExoticComponent<ComponentType<T>>>;
}

/**
 * Preload a component for better performance
 */
export function preloadComponent(
  loader: () => Promise<{ default: ComponentType<any> }>
): Promise<void> {
  return loader().then(() => {
    // Component is now loaded and cached
  }).catch((error) => {
    console.warn('Failed to preload component:', error);
  });
}

/**
 * Preload components for a specific language
 */
export function preloadLanguageComponents(
  language: Language,
  loaders: Record<string, () => Promise<{ default: ComponentType<any> }>>
): Promise<void[]> {
  const preloadPromises = Object.values(loaders).map(preloadComponent);
  return Promise.all(preloadPromises);
}

/**
 * Dynamic import helper with better error handling
 */
export function createDynamicImport<T = any>(
  importPath: string,
  chunkName?: string
): () => Promise<{ default: ComponentType<T> }> {
  return () => {
    const importPromise = import(
      /* webpackChunkName: "[request]" */
      importPath
    );

    return importPromise.catch((error) => {
      console.error(`Failed to load component from ${importPath}:`, error);
      // Return a fallback component
      return {
        default: (() => {
          return function ErrorFallback() {
            return React.createElement('div', {
              className: 'p-4 text-center text-red-600'
            }, [
              React.createElement('p', { key: 'error' }, 'Failed to load component'),
              React.createElement('button', {
                key: 'retry',
                onClick: () => window.location.reload(),
                className: 'mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200'
              }, 'Retry')
            ]);
          };
        })() as ComponentType<T>
      };
    });
  };
}

/**
 * Route-based code splitting for multilingual pages
 */
export interface RouteBasedSplitConfig {
  /** Base path for the route */
  basePath: string;
  /** Supported languages */
  languages: Language[];
  /** Component name for chunk naming */
  componentName: string;
}

/**
 * Create route-based lazy components for all languages
 */
export function createRouteBasedComponents<T = any>(
  config: RouteBasedSplitConfig
): Record<Language, LazyExoticComponent<ComponentType<T>>> {
  const { basePath, languages, componentName } = config;
  const components: Partial<Record<Language, LazyExoticComponent<ComponentType<T>>>> = {};

  languages.forEach((language) => {
    const importPath = `@/app/${language}/${basePath}/page`;
    const chunkName = `${language.toLowerCase()}-${componentName}`;

    components[language] = createLazyComponent(
      createDynamicImport<T>(importPath, chunkName),
      {
        chunkName,
        preloadOnHover: true,
        preloadDelay: 100,
      }
    );
  });

  return components as Record<Language, LazyExoticComponent<ComponentType<T>>>;
}

/**
 * Bundle size optimization utilities
 */
export class BundleOptimizer {
  private static preloadedChunks = new Set<string>();

  /**
   * Preload critical chunks for better performance
   */
  static preloadCriticalChunks(language: Language): void {
    const criticalChunks = [
      `${language.toLowerCase()}-ashaar`,
      `${language.toLowerCase()}-ghazlen`,
      `${language.toLowerCase()}-nazmen`,
      `${language.toLowerCase()}-rubai`,
    ];

    criticalChunks.forEach((chunkName) => {
      if (!this.preloadedChunks.has(chunkName)) {
        this.preloadChunk(chunkName);
        this.preloadedChunks.add(chunkName);
      }
    });
  }

  /**
   * Preload a specific chunk
   */
  private static preloadChunk(chunkName: string): void {
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = `/_next/static/chunks/${chunkName}.js`;
      document.head.appendChild(link);
    }
  }

  /**
   * Get bundle size information for monitoring
   */
  static getBundleInfo(): {
    loadedChunks: string[];
    preloadedChunks: string[];
    totalChunks: number;
  } {
    return {
      loadedChunks: Array.from(this.preloadedChunks),
      preloadedChunks: Array.from(this.preloadedChunks),
      totalChunks: this.preloadedChunks.size,
    };
  }
}

/**
 * Language-specific bundle splitting configuration
 */
export const LANGUAGE_BUNDLE_CONFIG = {
  EN: {
    criticalComponents: ['ashaar', 'ghazlen', 'nazmen', 'rubai'],
    preloadDelay: 100,
    chunkPrefix: 'en',
  },
  HI: {
    criticalComponents: ['ashaar', 'ghazlen', 'nazmen', 'rubai'],
    preloadDelay: 100,
    chunkPrefix: 'hi',
  },
  UR: {
    criticalComponents: ['ashaar', 'ghazlen', 'nazmen', 'rubai'],
    preloadDelay: 50, // Faster for default language
    chunkPrefix: 'ur',
  },
} as const;