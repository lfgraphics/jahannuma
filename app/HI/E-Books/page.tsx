import { type EBooksType } from "@/hooks/useEbooksData";
import { getLanguageFieldValue } from "@/lib/language-field-utils";
import { generateCollectionPageSEO, generateSEOBreadcrumbs, SEOContentItem } from "@/lib/seo/comprehensive-seo";
import { generatePerformanceOptimizedMetadata, generateResourcePreloadConfig } from "@/lib/seo/performance-optimization";
import { fetchList } from "@/lib/universal-data-fetcher";
import { Metadata } from "next";
import Page from "./Component";
import EBooksErrorBoundary from "./ErrorBoundary";

// Server-side data fetching
async function getEbooksData(): Promise<EBooksType[]> {
  try {
    const response = await fetchList<{ records: EBooksType[] }>(
      "appXcBoNMGdIaSUyA", // Base ID
      "E-Books", // Table name
      {
        pageSize: 30,
        sort: [{ field: "createdTime", direction: "desc" }]
      },
      {
        cache: true,
        revalidate: 300000, // 5 minutes
        fallback: { records: [] },
        throwOnError: false
      }
    );

    return response?.records || [];
  } catch (error) {
    console.error("Failed to fetch ebooks data:", error);
    return [];
  }
}

// Generate comprehensive metadata with performance optimization
export async function generateMetadata(): Promise<Metadata> {
  const ebooks = await getEbooksData();

  // Convert to SEO format with Hindi field preference
  const seoItems: SEOContentItem[] = ebooks.slice(0, 10).map(book => ({
    id: book.id,
    title: getLanguageFieldValue(book.fields, 'bookName', 'HI', ['HI', 'UR', 'EN']) || "शीर्षकहीन",
    author: getLanguageFieldValue(book.fields, 'writer', 'HI', ['HI', 'UR', 'EN']) || "अज्ञात लेखक",
    excerpt: getLanguageFieldValue(book.fields, 'desc', 'HI', ['HI', 'UR', 'EN']),
    datePublished: book.fields.publishingDate,
    image: book.fields.book?.[0]?.thumbnails?.large?.url,
    url: `/HI/E-Books/${book.id}`,
  }));

  // Get featured authors with Hindi preference
  const featuredAuthors = [...new Set(
    ebooks
      .map(book => getLanguageFieldValue(book.fields, 'writer', 'HI', ['HI', 'UR', 'EN']))
      .filter(Boolean)
      .slice(0, 5)
  )];

  // Generate breadcrumbs
  const breadcrumbs = generateSEOBreadcrumbs({
    contentType: "ebooks",
    language: "hi",
  });

  // Generate comprehensive SEO
  const { metadata: baseMetadata } = await generateCollectionPageSEO({
    contentType: "ebooks",
    language: "hi",
    items: seoItems,
    totalCount: ebooks.length,
    featuredAuthors,
    breadcrumbs,
  });

  // Add performance optimizations
  const criticalResources = generateResourcePreloadConfig({
    contentType: "ebooks",
    hasImages: true,
    hasFonts: true,
  });

  return generatePerformanceOptimizedMetadata({
    baseMetadata: {
      ...baseMetadata,
      title: "ई-बुक्स - जहान नुमा",
      description: "हिंदी में कविता और साहित्य की पुस्तकों का डिजिटल पुस्तकालय",
    },
    criticalResources,
    enableDNSPrefetch: true,
  });
}

const EBooksPage = async () => {
  // Fetch data on server-side
  const initialData = await getEbooksData();

  // Convert to SEO format for structured data with Hindi preference
  const seoItems: SEOContentItem[] = initialData.slice(0, 10).map(book => ({
    id: book.id,
    title: getLanguageFieldValue(book.fields, 'bookName', 'HI', ['HI', 'UR', 'EN']) || "शीर्षकहीन",
    author: getLanguageFieldValue(book.fields, 'writer', 'HI', ['HI', 'UR', 'EN']) || "अज्ञात लेखक",
    excerpt: getLanguageFieldValue(book.fields, 'desc', 'HI', ['HI', 'UR', 'EN']),
    datePublished: book.fields.publishingDate,
    image: book.fields.book?.[0]?.thumbnails?.large?.url,
    url: `/HI/E-Books/${book.id}`,
  }));

  // Get featured authors with Hindi preference
  const featuredAuthors = [...new Set(
    initialData
      .map(book => getLanguageFieldValue(book.fields, 'writer', 'HI', ['HI', 'UR', 'EN']))
      .filter(Boolean)
      .slice(0, 5)
  )];

  // Generate breadcrumbs
  const breadcrumbs = generateSEOBreadcrumbs({
    contentType: "ebooks",
    language: "hi",
  });

  // Generate comprehensive structured data
  const { structuredData } = await generateCollectionPageSEO({
    contentType: "ebooks",
    language: "hi",
    items: seoItems,
    totalCount: initialData.length,
    featuredAuthors,
    breadcrumbs,
  });

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredData }}
      />
      <EBooksErrorBoundary>
        <Page initialData={initialData} />
      </EBooksErrorBoundary>
    </div>
  );
};

export default EBooksPage;
