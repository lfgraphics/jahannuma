import { Metadata } from "next";

export interface PageMetadataOptions {
  title: string;
  description: string;
  keywords?: string[];
  url: string;
  image?: string;
  language?: string;
  alternateLanguages?: Record<string, string>;
  type?: "website" | "article";
  siteName?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  wordCount?: number;
}

export interface DynamicContentMetadata {
  contentType: "ashaar" | "ghazlen" | "nazmen" | "rubai" | "ebooks";
  totalCount?: number;
  featuredAuthors?: string[];
  recentContent?: Array<{
    title: string;
    author: string;
    excerpt?: string;
  }>;
  popularTags?: string[];
}

export function generatePageMetadata(options: PageMetadataOptions): Metadata {
  const {
    title,
    description,
    keywords = [],
    url,
    image = "/logo.png",
    language = "ur",
    alternateLanguages = {},
    type = "website",
    siteName = "Jahannuma",
    author,
    publishedTime,
    modifiedTime,
    section,
    tags = [],
    wordCount,
  } = options;

  const baseUrl = "https://jahan-numa.org";
  const fullUrl = `${baseUrl}${url}`;
  const fullImageUrl = image.startsWith("http") ? image : `${baseUrl}${image}`;

  // Enhanced keywords with content-specific terms
  const enhancedKeywords = [
    ...keywords,
    "جہان نما",
    "اردو ادب",
    "urdu literature",
    "poetry",
    "شاعری",
  ];

  const metadata: Metadata = {
    title,
    description,
    keywords: enhancedKeywords.join(", "),
    authors: author ? [{ name: author }] : undefined,
    creator: siteName,
    publisher: siteName,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: fullUrl,
      languages: Object.keys(alternateLanguages).length > 0 ? alternateLanguages : undefined,
    },
    openGraph: {
      title,
      description,
      url: fullUrl,
      siteName,
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: language === "ur" ? "ur_PK" : language === "hi" ? "hi_IN" : "en_US",
      type,
      publishedTime,
      modifiedTime,
      authors: author ? [author] : undefined,
      section,
      tags: tags.length > 0 ? tags : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [fullImageUrl],
      creator: "@jahannuma",
      site: "@jahannuma",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
    other: {
      // Additional meta tags for better SEO
      ...(wordCount && { "article:word_count": wordCount.toString() }),
      ...(section && { "article:section": section }),
      "og:locale:alternate": language === "ur" ? "en_US" : "ur_PK",
    },
  };

  return metadata;
}

export function generateDynamicContentMetadata(
  baseOptions: PageMetadataOptions,
  dynamicContent: DynamicContentMetadata
): Metadata {
  const { contentType, totalCount, featuredAuthors, recentContent, popularTags } = dynamicContent;

  // Content type specific enhancements
  const contentTypeNames = {
    ashaar: { ur: "اشعار", en: "Poetry Couplets", hi: "अशार" },
    ghazlen: { ur: "غزلیں", en: "Ghazals", hi: "ग़ज़ल" },
    nazmen: { ur: "نظمیں", en: "Poems", hi: "नज़्म" },
    rubai: { ur: "رباعیاں", en: "Quatrains", hi: "रुबाई" },
    ebooks: { ur: "کتابیں", en: "E-Books", hi: "पुस्तकें" },
  };

  const language = (baseOptions.language || "ur") as keyof typeof contentTypeNames[typeof contentType];
  const typeName = contentTypeNames[contentType][language];

  // Enhanced title with dynamic content
  let enhancedTitle = baseOptions.title;
  if (totalCount) {
    enhancedTitle += ` - ${totalCount} ${typeName}`;
  }

  // Enhanced description with dynamic content
  let enhancedDescription = baseOptions.description;
  if (featuredAuthors && featuredAuthors.length > 0) {
    const authorsText = featuredAuthors.slice(0, 3).join(", ");
    enhancedDescription += ` Featured poets include ${authorsText}.`;
  }
  if (totalCount) {
    enhancedDescription += ` Browse ${totalCount} ${typeName.toLowerCase()} in our collection.`;
  }

  // Enhanced keywords with dynamic content
  const dynamicKeywords = [
    ...baseOptions.keywords || [],
    typeName,
    ...(featuredAuthors || []).slice(0, 5),
    ...(popularTags || []).slice(0, 5),
  ];

  // Add recent content titles as keywords
  if (recentContent) {
    const recentTitles = recentContent
      .slice(0, 3)
      .map(item => item.title)
      .filter(title => title && title.length < 50);
    dynamicKeywords.push(...recentTitles);
  }

  return generatePageMetadata({
    ...baseOptions,
    title: enhancedTitle,
    description: enhancedDescription,
    keywords: dynamicKeywords,
    tags: popularTags,
  });
}

export function generateArticleMetadata(options: PageMetadataOptions & {
  author: string;
  publishedTime: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}): Metadata {
  const baseMetadata = generatePageMetadata({
    ...options,
    type: "article",
  });

  return {
    ...baseMetadata,
    openGraph: {
      ...baseMetadata.openGraph,
      type: "article",
      authors: [options.author],
      section: options.section,
      tags: options.tags,
    },
  };
}

export function generateContentPageMetadata(options: {
  contentType: "ashaar" | "ghazlen" | "nazmen" | "rubai" | "ebooks";
  language?: "ur" | "en" | "hi";
  totalCount?: number;
  featuredContent?: Array<{
    title: string;
    author: string;
    excerpt?: string;
  }>;
  featuredAuthors?: string[];
}): Metadata {
  const { contentType, language = "ur", totalCount, featuredContent, featuredAuthors } = options;

  const contentConfig = {
    ashaar: {
      title: { ur: "اشعار", en: "Ashaar - Poetry Couplets", hi: "अशार" },
      description: {
        ur: "خوبصورت اشعار اور شعری اقوال کا مجموعہ۔ مشہور شعراء کے بہترین اشعار پڑھیں۔",
        en: "Beautiful poetry couplets and verses from renowned poets. Explore timeless Urdu literature.",
        hi: "प्रसिद्ध कवियों के सुंदर अशार और काव्य पंक्तियों का संग्रह।"
      },
      keywords: ["اشعار", "شعری اقوال", "poetry couplets", "urdu poetry", "ashaar"],
      image: "/metaImages/ashaar.jpg"
    },
    ghazlen: {
      title: { ur: "غزلیں", en: "Ghazlen - Urdu Ghazals", hi: "ग़ज़ल" },
      description: {
        ur: "کلاسیکی اور جدید غزلوں کا خزانہ۔ مشہور شعراء کی بہترین غزلیں پڑھیں۔",
        en: "Treasury of classical and modern Urdu ghazals from renowned poets.",
        hi: "प्रसिद्ध कवियों की क्लासिकल और आधुनिक ग़ज़लों का खजाना।"
      },
      keywords: ["غزلیں", "اردو غزل", "ghazal", "urdu ghazal", "classical poetry"],
      image: "/metaImages/ghazlen.jpg"
    },
    nazmen: {
      title: { ur: "نظمیں", en: "Nazmen - Urdu Poems", hi: "नज़्म" },
      description: {
        ur: "اردو نظموں کا بہترین مجموعہ۔ مختلف موضوعات پر لکھی گئی نظمیں پڑھیں۔",
        en: "Finest collection of Urdu poems on various themes and subjects.",
        hi: "विभिन्न विषयों पर लिखी गई उर्दू नज़्मों का बेहतरीन संग्रह।"
      },
      keywords: ["نظمیں", "اردو نظم", "nazm", "urdu poems", "poetry"],
      image: "/metaImages/nazme.jpg"
    },
    rubai: {
      title: { ur: "رباعیاں", en: "Rubai - Quatrains", hi: "रुबाई" },
      description: {
        ur: "چار مصرعوں کی خوبصورت رباعیاں۔ حکیمانہ اور فلسفیانہ اشعار پڑھیں۔",
        en: "Beautiful four-line quatrains with wisdom and philosophical insights.",
        hi: "चार पंक्तियों की सुंदर रुबाइयां। ज्ञान और दर्शन से भरे अशार।"
      },
      keywords: ["رباعیاں", "چار مصرعے", "rubai", "quatrains", "wisdom poetry"],
      image: "/metaImages/rubai.jpg"
    },
    ebooks: {
      title: { ur: "کتابیں", en: "E-Books - Digital Library", hi: "पुस्तकें" },
      description: {
        ur: "ڈیجیٹل کتابوں کا مجموعہ۔ شاعری، ادب اور تاریخ کی کتابیں پڑھیں اور ڈاؤن لوڈ کریں۔",
        en: "Digital library of books on poetry, literature and history. Read and download for free.",
        hi: "शायरी, साहित्य और इतिहास की डिजिटल पुस्तकों का संग्रह।"
      },
      keywords: ["کتابیں", "ڈیجیٹل لائبریری", "ebooks", "digital books", "urdu books"],
      image: "/metaImages/ebooks.jpg"
    }
  };

  const config = contentConfig[contentType];
  const title = config.title[language];
  const description = config.description[language];

  // Add dynamic content to description
  let enhancedDescription = description;
  if (totalCount) {
    enhancedDescription += ` ${totalCount} items available.`;
  }
  if (featuredAuthors && featuredAuthors.length > 0) {
    const authors = featuredAuthors.slice(0, 3).join(", ");
    enhancedDescription += ` Featured: ${authors}.`;
  }

  // Generate dynamic keywords
  const dynamicKeywords = [
    ...config.keywords,
    ...(featuredAuthors || []).slice(0, 5),
  ];

  // Add featured content titles as keywords
  if (featuredContent) {
    const contentTitles = featuredContent
      .slice(0, 3)
      .map(item => item.title)
      .filter(title => title && title.length < 50);
    dynamicKeywords.push(...contentTitles);
  }

  return generatePageMetadata({
    title,
    description: enhancedDescription,
    keywords: dynamicKeywords,
    url: `/${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`,
    image: config.image,
    language,
    alternateLanguages: {
      ur: `https://jahan-numa.org/${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`,
      en: `https://jahan-numa.org/EN/${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`,
      hi: `https://jahan-numa.org/HI/${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`,
    },
  });
}

export function generateIndividualContentMetadata(options: {
  contentType: "ashaar" | "ghazlen" | "nazmen" | "rubai";
  title: string;
  author: string;
  content: string;
  id: string;
  language?: "ur" | "en" | "hi";
  datePublished?: string;
  tags?: string[];
}): Metadata {
  const { contentType, title, author, content, id, language = "ur", datePublished, tags = [] } = options;

  // Extract excerpt from content (first 150 characters)
  const excerpt = content.length > 150 ? content.substring(0, 150) + "..." : content;

  const contentTypeNames = {
    ashaar: { ur: "شعر", en: "Poetry", hi: "अशार" },
    ghazlen: { ur: "غزل", en: "Ghazal", hi: "ग़ज़ल" },
    nazmen: { ur: "نظم", en: "Nazm", hi: "नज़्म" },
    rubai: { ur: "رباعی", en: "Rubai", hi: "रुबाई" },
  };

  const typeName = contentTypeNames[contentType][language];
  const fullTitle = `${title} - ${typeName} by ${author}`;
  const description = `${excerpt} Read this beautiful ${typeName.toLowerCase()} by ${author} on Jahannuma.`;

  return generatePageMetadata({
    title: fullTitle,
    description,
    keywords: [
      typeName,
      author,
      title,
      "اردو شاعری",
      "urdu poetry",
      "جہان نما",
      ...tags,
    ],
    url: `/${contentType}/${id}`,
    image: `/metaImages/${contentType}.jpg`,
    language,
    type: "article",
    author,
    publishedTime: datePublished,
    section: "Poetry",
    tags,
    wordCount: content.split(/\s+/).length,
  });
}

export function generateAuthorMetadata(options: {
  name: string;
  bio?: string;
  worksCount?: number;
  language?: "ur" | "en" | "hi";
  birthYear?: string;
  deathYear?: string;
  genres?: string[];
}): Metadata {
  const { name, bio, worksCount, language = "ur", birthYear, deathYear, genres = [] } = options;

  const titles = {
    ur: `${name} - شاعر`,
    en: `${name} - Poet`,
    hi: `${name} - कवि`,
  };

  const descriptions = {
    ur: `${name} کی مکمل شاعری پڑھیں۔ ${worksCount ? `${worksCount} تخلیقات` : "تمام کلام"} جہان نما پر دستیاب۔`,
    en: `Complete poetry collection of ${name}. ${worksCount ? `${worksCount} works` : "All works"} available on Jahannuma.`,
    hi: `${name} की संपूर्ण शायरी पढ़ें। ${worksCount ? `${worksCount} रचनाएं` : "सभी रचनाएं"} जहाननुमा पर उपलब्ध।`,
  };

  let description = descriptions[language];
  if (bio) {
    description = bio.length > 150 ? bio.substring(0, 150) + "..." : bio;
    description += ` ${descriptions[language]}`;
  }

  const lifeSpan = birthYear && deathYear ? `${birthYear}-${deathYear}` :
    birthYear ? `b. ${birthYear}` : "";

  return generatePageMetadata({
    title: titles[language],
    description,
    keywords: [
      name,
      "شاعر",
      "poet",
      "اردو شاعری",
      "urdu poetry",
      lifeSpan,
      ...genres,
    ].filter(Boolean),
    url: `/shaer/${encodeURIComponent(name)}`,
    language,
    author: name,
    type: "article",
    section: "Author",
  });
}