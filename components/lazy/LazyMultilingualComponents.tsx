/**
 * Lazy-loaded multilingual components for better performance
 * Provides code splitting for language-specific routes
 */

// import { MultilingualPageWrapper } from '@/components/MultilingualPageWrapper';
import type { Language } from '@/lib/multilingual-texts';
import { ComponentType, Suspense } from 'react';

/**
 * Loading component for lazy-loaded pages
 */
export function LazyPageLoader({ language }: { language: Language }) {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-sm text-gray-600">
          {language === 'EN' && 'Loading...'}
          {language === 'HI' && 'लोड हो रहा है...'}
          {language === 'UR' && 'لوڈ ہو رہا ہے...'}
        </p>
      </div>
    </div>
  );
}

/**
 * Error boundary for lazy-loaded components
 */
export function LazyComponentError({
  error,
  retry,
  language
}: {
  error: Error;
  retry: () => void;
  language: Language;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
      <div className="text-center space-y-4">
        <h2 className="text-lg font-semibold text-red-600">
          {language === 'EN' && 'Failed to load page'}
          {language === 'HI' && 'पेज लोड नहीं हो सका'}
          {language === 'UR' && 'صفحہ لوڈ نہیں ہو سکا'}
        </h2>
        <p className="text-sm text-gray-600">
          {error.message}
        </p>
        <button
          onClick={retry}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          {language === 'EN' && 'Try Again'}
          {language === 'HI' && 'फिर से कोशिश करें'}
          {language === 'UR' && 'دوبارہ کوشش کریں'}
        </button>
      </div>
    </div>
  );
}

/**
 * Higher-order component for lazy-loaded multilingual pages
 */
/*
export function withLazyMultilingualPage<P extends object>(
  LazyComponent: ComponentType<P>,
  language: Language,
  config?: LazyLoadConfig
) {
  return function LazyMultilingualPage(props: P) {
    // Preload critical chunks for this language
    if (typeof window !== 'undefined') {
      BundleOptimizer.preloadCriticalChunks(language);
    }

    return (
      <MultilingualPageWrapper
        language={language}
        config={{
          syncLanguageWithRoute: true,
          applyFontConfig: true,
          enableErrorBoundaries: true,
        }}
      >
        <Suspense fallback={<LazyPageLoader language={language} />}>
          <LazyComponent {...props} />
        </Suspense>
      </MultilingualPageWrapper>
    );
  };
}
*/

/**
 * Lazy component wrapper with error boundary
 */
export function LazyComponentWrapper<P extends object>({
  LazyComponent,
  language,
  fallback,
  ...props
}: {
  LazyComponent: ComponentType<P>;
  language: Language;
  fallback?: ComponentType;
} & P) {
  const FallbackComponent = fallback || (() => <LazyPageLoader language={language} />);

  return (
    <Suspense fallback={<FallbackComponent />}>
      <LazyComponent {...(props as P)} />
    </Suspense>
  );
}