"use client";

import { Language } from "@/lib/multilingual-texts";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavigationItem {
  /** Display label for the navigation item */
  label: string;
  /** URL for the navigation link */
  href: string;
  /** Whether this item is currently active */
  isActive?: boolean;
  /** Child navigation items */
  children?: NavigationItem[];
}

export interface MultilingualNavigationProps {
  /** Current language */
  language: Language;
  /** Navigation items */
  items: NavigationItem[];
  /** Additional CSS classes */
  className?: string;
  /** Whether to show active states */
  showActiveStates?: boolean;
}

/**
 * Multilingual navigation component that handles language-specific routing
 */
export function MultilingualNavigation({
  language,
  items,
  className = "",
  showActiveStates = true,
}: MultilingualNavigationProps) {
  const pathname = usePathname();

  return (
    <nav className={`multilingual-navigation ${className}`}>
      <ul className="flex space-x-6">
        {items.map((item, index) => {
          const isActive = showActiveStates && (item.isActive || pathname === item.href);

          return (
            <li key={index} className="relative">
              <Link
                href={item.href}
                className={`
                  px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${isActive
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }
                `}
              >
                {item.label}
              </Link>

              {/* Render child items if present */}
              {item.children && item.children.length > 0 && (
                <ul className="absolute top-full left-0 mt-1 bg-white shadow-lg rounded-md py-2 min-w-48 z-10 hidden group-hover:block">
                  {item.children.map((child, childIndex) => (
                    <li key={childIndex}>
                      <Link
                        href={child.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/**
 * Generate main navigation items for a specific language
 */
export function generateMainNavigation(language: Language): NavigationItem[] {
  const baseUrl = getLanguageBaseUrl(language);

  // Navigation labels for each language
  const navLabels = {
    home: { ur: "ہوم", en: "Home", hi: "होम" },
    ashaar: { ur: "اشعار", en: "Ashaar", hi: "अशार" },
    ghazlen: { ur: "غزلیں", en: "Ghazlen", hi: "ग़ज़ल" },
    nazmen: { ur: "نظمیں", en: "Nazmen", hi: "नज़्म" },
    rubai: { ur: "رباعیاں", en: "Rubai", hi: "रुबाई" },
    ebooks: { ur: "کتابیں", en: "E-Books", hi: "पुस्तकें" },
    poets: { ur: "شعراء", en: "Poets", hi: "कवि" },
    favorites: { ur: "پسندیدہ", en: "Favorites", hi: "पसंदीदा" },
    about: { ur: "تعارف", en: "About", hi: "परिचय" },
    contact: { ur: "رابطہ", en: "Contact", hi: "संपर्क" },
  };

  const langKey = language.toLowerCase() as keyof typeof navLabels.home;

  return [
    {
      label: navLabels.home[langKey],
      href: baseUrl,
    },
    {
      label: navLabels.ashaar[langKey],
      href: `${baseUrl}/Ashaar`,
      children: [
        {
          label: navLabels.poets[langKey],
          href: `${baseUrl}/Ashaar/shaer`,
        },
      ],
    },
    {
      label: navLabels.ghazlen[langKey],
      href: `${baseUrl}/Ghazlen`,
      children: [
        {
          label: navLabels.poets[langKey],
          href: `${baseUrl}/Ghazlen/shaer`,
        },
      ],
    },
    {
      label: navLabels.nazmen[langKey],
      href: `${baseUrl}/Nazmen`,
      children: [
        {
          label: navLabels.poets[langKey],
          href: `${baseUrl}/Nazmen/shaer`,
        },
      ],
    },
    {
      label: navLabels.rubai[langKey],
      href: `${baseUrl}/Rubai`,
      children: [
        {
          label: navLabels.poets[langKey],
          href: `${baseUrl}/Rubai/shaer`,
        },
      ],
    },
    {
      label: navLabels.ebooks[langKey],
      href: `${baseUrl}/E-Books`,
    },
    {
      label: navLabels.favorites[langKey],
      href: `${baseUrl}/Favorites`,
    },
  ];
}

/**
 * Generate footer navigation items for a specific language
 */
export function generateFooterNavigation(language: Language): NavigationItem[] {
  const baseUrl = getLanguageBaseUrl(language);

  // Footer navigation labels
  const footerLabels = {
    about: { ur: "تعارف", en: "About", hi: "परिचय" },
    founders: { ur: "بانی", en: "Founders", hi: "संस्थापक" },
    interview: { ur: "انٹرویو", en: "Interview", hi: "साक्षात्कार" },
    contact: { ur: "رابطہ", en: "Contact", hi: "संपर्क" },
    privacy: { ur: "پرائیویسی پالیسی", en: "Privacy Policy", hi: "गोपनीयता नीति" },
    terms: { ur: "شرائط و ضوابط", en: "Terms & Conditions", hi: "नियम और शर्तें" },
    cancellation: { ur: "منسوخی اور واپسی", en: "Cancellation & Refund", hi: "रद्दीकरण और वापसी" },
    shipping: { ur: "شپنگ اور ڈیلیوری", en: "Shipping & Delivery", hi: "शिपिंग और डिलीवरी" },
  };

  return [
    // {
    //   label: footerLabels.about[language.toLowerCase() as keyof typeof footerLabels.about],
    //   href: `${baseUrl}/About_site`,
    // },
    {
      label: footerLabels.founders[language.toLowerCase() as keyof typeof footerLabels.founders],
      href: `${baseUrl}/Founders`,
    },
    {
      label: footerLabels.interview[language.toLowerCase() as keyof typeof footerLabels.interview],
      href: `${baseUrl}/Interview`,
    },
    {
      label: footerLabels.contact[language.toLowerCase() as keyof typeof footerLabels.contact],
      href: `${baseUrl}/Contact`,
    },
    {
      label: footerLabels.privacy[language.toLowerCase() as keyof typeof footerLabels.privacy],
      href: `${baseUrl}/privacypolicy`,
    },
    {
      label: footerLabels.terms[language.toLowerCase() as keyof typeof footerLabels.terms],
      href: `${baseUrl}/terms&conditions`,
    },
    {
      label: footerLabels.cancellation[language.toLowerCase() as keyof typeof footerLabels.cancellation],
      href: `${baseUrl}/cancellation&refund`,
    },
    {
      label: footerLabels.shipping[language.toLowerCase() as keyof typeof footerLabels.shipping],
      href: `${baseUrl}/shipping&delivery`,
    },
  ];
}

/**
 * Generate language switcher navigation
 */
export function generateLanguageSwitcher(currentPath: string): NavigationItem[] {
  // Remove language prefix from current path
  const cleanPath = currentPath.replace(/^\/(EN|HI)/, "");

  return [
    {
      label: "اردو",
      href: cleanPath || "/",
    },
    {
      label: "English",
      href: `/EN${cleanPath}`,
    },
    {
      label: "हिंदी",
      href: `/HI${cleanPath}`,
    },
  ];
}

/**
 * Get base URL for a specific language
 */
function getLanguageBaseUrl(language: Language): string {
  switch (language) {
    case "EN":
      return "/EN";
    case "HI":
      return "/HI";
    case "UR":
    default:
      return "";
  }
}

/**
 * Language switcher component
 */
export function LanguageSwitcher({ currentPath }: { currentPath: string }) {
  const languages = generateLanguageSwitcher(currentPath);

  return (
    <div className="language-switcher flex space-x-2">
      {languages.map((lang, index) => (
        <Link
          key={index}
          href={lang.href}
          className="px-2 py-1 text-sm rounded border hover:bg-gray-100 transition-colors"
        >
          {lang.label}
        </Link>
      ))}
    </div>
  );
}

/**
 * Responsive mobile navigation component
 */
export function MobileMultilingualNavigation({
  language,
  items,
  isOpen,
  onToggle,
}: {
  language: Language;
  items: NavigationItem[];
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={`mobile-navigation ${isOpen ? "open" : ""}`}>
      <button
        onClick={onToggle}
        className="mobile-nav-toggle p-2 rounded-md hover:bg-gray-100"
        aria-label="Toggle navigation"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {isOpen && (
        <div className="mobile-nav-menu absolute top-full left-0 right-0 bg-white shadow-lg border-t">
          <ul className="py-2">
            {items.map((item, index) => (
              <li key={index}>
                <Link
                  href={item.href}
                  className="block px-4 py-3 text-gray-700 hover:bg-gray-100"
                  onClick={onToggle}
                >
                  {item.label}
                </Link>
                {item.children && (
                  <ul className="bg-gray-50">
                    {item.children.map((child, childIndex) => (
                      <li key={childIndex}>
                        <Link
                          href={child.href}
                          className="block px-8 py-2 text-sm text-gray-600 hover:bg-gray-100"
                          onClick={onToggle}
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}