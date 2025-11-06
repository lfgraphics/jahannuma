"use client";

import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Language } from '@/lib/multilingual-texts';
import { AlertCircle, ArrowLeft, Globe, Home } from 'lucide-react';
import Link from 'next/link';
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Language for which content is missing */
  language?: Language;
  /** Available languages for this content */
  availableLanguages?: Language[];
  /** Content type (for better error messages) */
  contentType?: string;
  /** Fallback URL to redirect to */
  fallbackUrl?: string;
  /** Custom error message */
  customMessage?: string;
}

interface State {
  hasMissingContent: boolean;
  error?: Error;
}

/**
 * Specialized error boundary for handling missing language content.
 * Provides user-friendly fallback options when content is not available in the requested language.
 */
export class MissingContentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasMissingContent: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Check if this is a missing content error
    if (
      error.message.includes('Missing translation') ||
      error.message.includes('Content not available') ||
      error.message.includes('MISSING_TRANSLATION') ||
      error.message.includes('CONTENT_LOCALIZATION_ERROR')
    ) {
      return {
        hasMissingContent: true,
        error,
      };
    }

    // Let other errors bubble up to parent error boundaries
    throw error;
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('Missing content detected:', {
      error: error.message,
      language: this.props.language,
      contentType: this.props.contentType,
      availableLanguages: this.props.availableLanguages,
      componentStack: errorInfo.componentStack,
    });
  }

  private getLanguageName(lang: Language): string {
    switch (lang) {
      case 'EN': return 'English';
      case 'HI': return 'हिंदी (Hindi)';
      case 'UR': return 'اردو (Urdu)';
      default: return lang;
    }
  }

  private getLanguageUrl(targetLanguage: Language): string {
    if (typeof window === 'undefined') return '/';

    const currentPath = window.location.pathname;
    const pathWithoutLang = currentPath.replace(/^\/(EN|HI)/, '');

    if (targetLanguage === 'UR') {
      return pathWithoutLang || '/';
    }

    return `/${targetLanguage}${pathWithoutLang}`;
  }

  render() {
    if (this.state.hasMissingContent) {
      const { language, availableLanguages = [], contentType, fallbackUrl, customMessage } = this.props;

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="text-center max-w-lg mx-auto">
            <div className="mb-6">
              <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />

              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {language === 'EN' && "Content Not Available"}
                {language === 'UR' && "مواد دستیاب نہیں"}
                {language === 'HI' && "सामग्री उपलब्ध नहीं"}
              </h2>

              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {customMessage || (
                  <>
                    {language === 'EN' && `This ${contentType || 'content'} is not available in English yet.`}
                    {language === 'UR' && `یہ ${contentType || 'مواد'} ابھی اردو میں دستیاب نہیں ہے۔`}
                    {language === 'HI' && `यह ${contentType || 'सामग्री'} अभी तक हिंदी में उपलब्ध नहीं है।`}
                  </>
                )}
              </p>

              {availableLanguages.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-3">
                    {language === 'EN' && "Available in:"}
                    {language === 'UR' && "دستیاب زبانیں:"}
                    {language === 'HI' && "उपलब्ध भाषाएं:"}
                  </p>

                  <div className="flex flex-wrap gap-2 justify-center">
                    {availableLanguages.map((lang) => (
                      <Link
                        key={lang}
                        href={this.getLanguageUrl(lang)}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                      >
                        <Globe className="h-4 w-4" />
                        {this.getLanguageName(lang)}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {fallbackUrl && (
                <Link href={fallbackUrl}>
                  <Button variant="default" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    {language === 'EN' && "Go Back"}
                    {language === 'UR' && "واپس جائیں"}
                    {language === 'HI' && "वापस जाएं"}
                  </Button>
                </Link>
              )}

              <Link href="/">
                <Button variant="outline" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  {language === 'EN' && "Home"}
                  {language === 'UR' && "ہوم"}
                  {language === 'HI' && "होम"}
                </Button>
              </Link>

              {availableLanguages.includes('UR') && (
                <Link href={this.getLanguageUrl('UR')}>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    {language === 'EN' && "View in Urdu"}
                    {language === 'UR' && "اردو میں دیکھیں"}
                    {language === 'HI' && "उर्दू में देखें"}
                  </Button>
                </Link>
              )}
            </div>

            <p className="text-xs text-gray-400 mt-6">
              {language === 'EN' && "We're working on adding more content in different languages."}
              {language === 'UR' && "ہم مختلف زبانوں میں مزید مواد شامل کرنے پر کام کر رہے ہیں۔"}
              {language === 'HI' && "हम विभिन्न भाषाओं में अधिक सामग्री जोड़ने पर काम कर रहे हैं।"}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook version for functional components
 */
export function useMissingContentHandler(
  language?: Language,
  availableLanguages?: Language[],
  contentType?: string
) {
  const { language: contextLanguage } = useLanguage();
  const effectiveLanguage = language || contextLanguage;

  const [hasMissingContent, setHasMissingContent] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const handleMissingContent = React.useCallback((error: Error) => {
    if (
      error.message.includes('Missing translation') ||
      error.message.includes('Content not available') ||
      error.message.includes('MISSING_TRANSLATION') ||
      error.message.includes('CONTENT_LOCALIZATION_ERROR')
    ) {
      setHasMissingContent(true);
      setError(error);
      return true; // Handled
    }
    return false; // Not handled, let other error boundaries handle it
  }, []);

  const resetMissingContent = React.useCallback(() => {
    setHasMissingContent(false);
    setError(null);
  }, []);

  const checkContentAvailability = React.useCallback(
    (record: Record<string, any>, requiredFields: string[]): boolean => {
      for (const field of requiredFields) {
        const fieldName = effectiveLanguage === 'UR'
          ? field
          : `${effectiveLanguage.toLowerCase()}${field.charAt(0).toUpperCase()}${field.slice(1)}`;

        const value = record[fieldName];
        if (!value || value === '' || (Array.isArray(value) && value.length === 0)) {
          return false;
        }
      }
      return true;
    },
    [effectiveLanguage]
  );

  return {
    hasMissingContent,
    error,
    handleMissingContent,
    resetMissingContent,
    checkContentAvailability,
    language: effectiveLanguage,
    availableLanguages,
    contentType,
  };
}