"use client";

import { Button } from '@/components/ui/button';
import { Language } from '@/lib/multilingual-texts';
import { AlertCircle, ArrowLeft, Globe } from 'lucide-react';
import React from 'react';

interface ContentNotAvailableProps {
  language: Language;
  contentType?: string;
  availableLanguages?: Language[];
  onLanguageSwitch?: (language: Language) => void;
  onGoBack?: () => void;
  showLanguageSwitcher?: boolean;
  className?: string;
}

const languageNames = {
  EN: { EN: "English", UR: "انگریزی", HI: "अंग्रेजी" },
  UR: { EN: "Urdu", UR: "اردو", HI: "उर्दू" },
  HI: { EN: "Hindi", UR: "ہندی", HI: "हिंदी" }
};

export function ContentNotAvailable({
  language,
  contentType,
  availableLanguages = [],
  onLanguageSwitch,
  onGoBack,
  showLanguageSwitcher = true,
  className = ""
}: ContentNotAvailableProps) {
  const getLocalizedText = (key: string) => {
    const texts = {
      contentNotAvailable: {
        EN: "Content Not Available",
        UR: "مواد دستیاب نہیں",
        HI: "सामग्री उपलब्ध नहीं"
      },
      contentNotAvailableMessage: {
        EN: `This ${contentType || 'content'} is not available in ${languageNames[language][language]}.`,
        UR: `یہ ${contentType || 'مواد'} ${languageNames[language][language]} میں دستیاب نہیں ہے۔`,
        HI: `यह ${contentType || 'सामग्री'} ${languageNames[language][language]} में उपलब्ध नहीं है।`
      },
      availableIn: {
        EN: "Available in:",
        UR: "دستیاب زبانیں:",
        HI: "उपलब्ध भाषाएं:"
      },
      switchLanguage: {
        EN: "Switch Language",
        UR: "زبان تبدیل کریں",
        HI: "भाषा बदलें"
      },
      goBack: {
        EN: "Go Back",
        UR: "واپس جائیں",
        HI: "वापस जाएं"
      },
      noAlternativeLanguages: {
        EN: "This content is not available in any language at the moment.",
        UR: "یہ مواد فی الوقت کسی بھی زبان میں دستیاب نہیں ہے۔",
        HI: "यह सामग्री फिलहाल किसी भी भाषा में उपलब्ध नहीं है।"
      }
    };

    return texts[key as keyof typeof texts]?.[language] || texts[key as keyof typeof texts]?.EN || '';
  };

  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <div className="text-center max-w-md mx-auto">
        <div className="mb-6">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {getLocalizedText('contentNotAvailable')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {getLocalizedText('contentNotAvailableMessage')}
          </p>
        </div>

        {availableLanguages.length > 0 && showLanguageSwitcher && onLanguageSwitch ? (
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {getLocalizedText('availableIn')}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {availableLanguages.map((availableLang) => (
                <Button
                  key={availableLang}
                  onClick={() => onLanguageSwitch(availableLang)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Globe className="h-3 w-3" />
                  {languageNames[availableLang][language]}
                </Button>
              ))}
            </div>
          </div>
        ) : availableLanguages.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {getLocalizedText('noAlternativeLanguages')}
          </p>
        ) : null}

        {onGoBack && (
          <Button
            onClick={onGoBack}
            variant="default"
            className="flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            {getLocalizedText('goBack')}
          </Button>
        )}
      </div>
    </div>
  );
}

// Compact version for inline use
export function ContentNotAvailableInline({
  language,
  contentType,
  className = ""
}: {
  language: Language;
  contentType?: string;
  className?: string;
}) {
  const getMessage = () => {
    switch (language) {
      case 'EN':
        return `${contentType || 'Content'} not available in English`;
      case 'UR':
        return `${contentType || 'مواد'} اردو میں دستیاب نہیں`;
      case 'HI':
        return `${contentType || 'सामग्री'} हिंदी में उपलब्ध नहीं`;
      default:
        return 'Content not available';
    }
  };

  return (
    <div className={`flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 ${className}`}>
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span>{getMessage()}</span>
    </div>
  );
}

// Hook for managing content availability state
export function useContentAvailability(
  record: Record<string, any>,
  language: Language,
  requiredFields: string[]
) {
  const [isAvailable, setIsAvailable] = React.useState(true);
  const [availableLanguages, setAvailableLanguages] = React.useState<Language[]>([]);

  React.useEffect(() => {
    // Check if content is available in the current language
    const hasContent = requiredFields.some(field => {
      const fieldName = language === 'UR' ? field : `${language.toLowerCase()}${field.charAt(0).toUpperCase()}${field.slice(1)}`;
      const value = record[fieldName];
      return value !== undefined && value !== null && value !== '';
    });

    setIsAvailable(hasContent);

    // Find available languages
    const available: Language[] = [];
    const languages: Language[] = ['UR', 'EN', 'HI'];

    for (const lang of languages) {
      const hasLangContent = requiredFields.some(field => {
        const fieldName = lang === 'UR' ? field : `${lang.toLowerCase()}${field.charAt(0).toUpperCase()}${field.slice(1)}`;
        const value = record[fieldName];
        return value !== undefined && value !== null && value !== '';
      });

      if (hasLangContent) {
        available.push(lang);
      }
    }

    setAvailableLanguages(available);
  }, [record, language, requiredFields]);

  return {
    isAvailable,
    availableLanguages
  };
}