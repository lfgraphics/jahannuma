/**
 * Font optimization utilities for better Core Web Vitals and reduced layout shift.
 * Focuses on optimizing Urdu fonts and reducing CLS.
 */

export interface FontConfig {
  family: string;
  weight: number | string;
  style: "normal" | "italic";
  display: "auto" | "block" | "swap" | "fallback" | "optional";
  src: string;
  format: string;
  unicodeRange?: string;
}

export interface FontOptimizationOptions {
  preloadCriticalFonts: boolean;
  useFontDisplay: "swap" | "fallback" | "optional";
  enableFontSubsetting: boolean;
  fallbackFonts: string[];
}

/**
 * Generate optimized font CSS with proper fallbacks and display strategies
 */
export function generateOptimizedFontCSS(
  fonts: FontConfig[],
  options: FontOptimizationOptions
): string {
  const { useFontDisplay, fallbackFonts } = options;

  const fontFaceRules = fonts
    .map(
      (font) => `
    @font-face {
      font-family: '${font.family}';
      font-style: ${font.style};
      font-weight: ${font.weight};
      font-display: ${font.display || useFontDisplay};
      src: url('${font.src}') format('${font.format}');
      ${font.unicodeRange ? `unicode-range: ${font.unicodeRange};` : ""}
    }
  `
    )
    .join("\n");

  const fallbackCSS = `
    /* Font fallback stack */
    .font-urdu {
      font-family: '${fonts[0]?.family}', ${fallbackFonts.join(", ")};
    }
    
    /* Prevent layout shift during font loading */
    .font-urdu {
      font-size-adjust: 0.5;
      text-rendering: optimizeLegibility;
    }
    
    /* Optimize for Urdu text */
    .urdu-text {
      direction: rtl;
      text-align: right;
      line-height: 1.8;
      word-spacing: 0.1em;
    }
  `;

  return fontFaceRules + fallbackCSS;
}

/**
 * Generate font preload links for critical fonts
 */
export function generateFontPreloadLinks(fonts: FontConfig[]): string[] {
  return fonts.map(
    (font) =>
      `<link rel="preload" href="${font.src}" as="font" type="font/${font.format}" crossorigin="anonymous">`
  );
}

/**
 * Urdu font configuration with optimizations
 */
export const urduFontConfig: FontConfig[] = [
  {
    family: "Noto Nastaliq Urdu",
    weight: 400,
    style: "normal",
    display: "swap",
    src: "/Mehr_Nastaliq.ttf",
    format: "truetype",
    unicodeRange: "U+0600-06FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE80-FEFC",
  },
];

/**
 * Font optimization configuration for Jahannuma
 */
export const fontOptimizationConfig: FontOptimizationOptions = {
  preloadCriticalFonts: true,
  useFontDisplay: "swap",
  enableFontSubsetting: true,
  fallbackFonts: [
    "Noto Nastaliq Urdu",
    "Arabic Typesetting",
    "Times New Roman",
    "serif",
    "system-ui",
  ],
};

/**
 * Generate critical font CSS for inline inclusion
 */
export function generateCriticalFontCSS(): string {
  return generateOptimizedFontCSS(urduFontConfig, fontOptimizationConfig);
}

/**
 * Generate font metrics for layout shift prevention
 */
export function generateFontMetrics() {
  return {
    // Font metrics to prevent layout shift
    fallbackMetrics: {
      "Noto Nastaliq Urdu": {
        ascent: 1.2,
        descent: 0.3,
        lineGap: 0.1,
        sizeAdjust: "100%",
      },
    },
    // CSS for font metrics
    metricsCSS: `
      @font-face {
        font-family: 'Noto Nastaliq Urdu Fallback';
        src: local('Times New Roman'), local('serif');
        ascent-override: 120%;
        descent-override: 30%;
        line-gap-override: 10%;
        size-adjust: 100%;
      }
      
      .font-urdu {
        font-family: 'Noto Nastaliq Urdu', 'Noto Nastaliq Urdu Fallback', serif;
      }
    `,
  };
}

/**
 * Font loading strategy for better performance
 */
export function generateFontLoadingStrategy(): string {
  return `
    // Font loading optimization
    (function() {
      // Check if font is already loaded
      if (document.fonts && document.fonts.check) {
        if (document.fonts.check('1em "Noto Nastaliq Urdu"')) {
          document.documentElement.classList.add('fonts-loaded');
          return;
        }
      }
      
      // Load font with timeout
      const fontTimeout = setTimeout(() => {
        document.documentElement.classList.add('fonts-failed');
      }, 3000);
      
      if (document.fonts && document.fonts.load) {
        document.fonts.load('1em "Noto Nastaliq Urdu"').then(() => {
          clearTimeout(fontTimeout);
          document.documentElement.classList.add('fonts-loaded');
        }).catch(() => {
          clearTimeout(fontTimeout);
          document.documentElement.classList.add('fonts-failed');
        });
      }
      
      // Fallback for older browsers
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/fonts.css';
      link.onload = () => {
        clearTimeout(fontTimeout);
        document.documentElement.classList.add('fonts-loaded');
      };
      link.onerror = () => {
        clearTimeout(fontTimeout);
        document.documentElement.classList.add('fonts-failed');
      };
      document.head.appendChild(link);
    })();
  `;
}

/**
 * Generate CSS for different font loading states
 */
export function generateFontLoadingCSS(): string {
  return `
    /* Default state - use fallback font */
    .font-urdu {
      font-family: 'Times New Roman', serif;
      font-size-adjust: 0.5;
    }
    
    /* Font loaded successfully */
    .fonts-loaded .font-urdu {
      font-family: 'Noto Nastaliq Urdu', 'Times New Roman', serif;
      font-size-adjust: auto;
    }
    
    /* Font failed to load - stick with fallback */
    .fonts-failed .font-urdu {
      font-family: 'Times New Roman', serif;
      font-size-adjust: 0.5;
    }
    
    /* Prevent invisible text during font swap */
    .font-urdu {
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    /* Optimize for Urdu text rendering */
    .urdu-content {
      direction: rtl;
      text-align: right;
      line-height: 1.8;
      word-spacing: 0.1em;
      hyphens: none;
      word-break: keep-all;
      overflow-wrap: break-word;
    }
    
    /* Responsive font sizes */
    @media (max-width: 768px) {
      .urdu-content {
        font-size: 0.9rem;
        line-height: 1.7;
      }
    }
    
    @media (min-width: 1200px) {
      .urdu-content {
        font-size: 1.1rem;
        line-height: 1.9;
      }
    }
  `;
}

/**
 * Generate font subset configuration for better performance
 */
export function generateFontSubsetConfig() {
  return {
    // Urdu Unicode ranges for subsetting
    urduRanges: [
      "U+0600-06FF", // Arabic block
      "U+0750-077F", // Arabic Supplement
      "U+08A0-08FF", // Arabic Extended-A
      "U+FB50-FDFF", // Arabic Presentation Forms-A
      "U+FE70-FEFF", // Arabic Presentation Forms-B
      "U+200C-200E", // Zero Width Non-Joiner, Zero Width Joiner, Left-to-Right Mark
      "U+2010-2011", // Hyphens
      "U+204F", // Reversed Semicolon
      "U+2E41", // Reversed Question Mark
    ],

    // Common punctuation and numbers
    commonRanges: [
      "U+0020-007F", // Basic Latin
      "U+00A0-00FF", // Latin-1 Supplement
      "U+2000-206F", // General Punctuation
      "U+20A0-20CF", // Currency Symbols
    ],

    // Subset strategy
    strategy: {
      critical: ["U+0600-06FF", "U+0020-007F"], // Most important ranges
      extended: ["U+0750-077F", "U+FB50-FDFF"], // Extended Urdu support
      optional: ["U+08A0-08FF", "U+FE70-FEFF"], // Additional features
    },
  };
}

/**
 * Generate performance hints for font optimization
 */
export function generateFontPerformanceHints(): string[] {
  return [
    '<link rel="dns-prefetch" href="//fonts.googleapis.com">',
    '<link rel="dns-prefetch" href="//fonts.gstatic.com">',
    '<link rel="preconnect" href="//fonts.googleapis.com" crossorigin>',
    '<link rel="preconnect" href="//fonts.gstatic.com" crossorigin>',
    '<link rel="preload" href="/Mehr_Nastaliq.ttf" as="font" type="font/truetype" crossorigin="anonymous">',
  ];
}