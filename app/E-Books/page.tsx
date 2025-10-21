import { type EBooksType } from "@/hooks/useEbooksData";
import { generateCollectionPageSEO, generateSEOBreadcrumbs, SEOContentItem } from "@/lib/seo/comprehensive-seo";
import { generatePerformanceOptimizedMetadata, generateResourcePreloadConfig } from "@/lib/seo/performance-optimization";
import { fetchList } from "@/lib/universal-data-fetcher";
import { getBaseIdForTable } from "@/src/lib/airtable";
import { Metadata } from "next";
import Page from "./Component";
import EBooksErrorBoundary from "./ErrorBoundary";

// Server-side data fetching
async function getEbooksData(): Promise<EBooksType[]> {
  try {const response = await fetchList<{ records: EBooksType[] }>(
      getBaseIdForTable("E-Books"), // Base ID
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

  // Convert to SEO format
  const seoItems: SEOContentItem[] = ebooks.slice(0, 10).map(book => ({
    id: book.id,
    title: book.fields.bookName || book.fields.enBookName || book.fields.hiBookName || "Untitled",
    author: book.fields.writer || book.fields.enWriter || book.fields.hiWriter || "Unknown Author",
    excerpt: book.fields.desc || book.fields.enDesc || book.fields.hiDesc,
    datePublished: book.fields.publishingDate,
    image: book.fields.book?.[0]?.thumbnails?.large?.url,
    url: `/E-Books/${book.id}`,
  }));

  // Get featured authors
  const featuredAuthors = [...new Set(
    ebooks
      .map(book => book.fields.writer || book.fields.enWriter || book.fields.hiWriter)
      .filter(Boolean)
      .slice(0, 5)
  )];

  // Generate breadcrumbs
  const breadcrumbs = generateSEOBreadcrumbs({
    contentType: "ebooks",
    language: "ur",
  });

  // Generate comprehensive SEO
  const { metadata: baseMetadata } = await generateCollectionPageSEO({
    contentType: "ebooks",
    language: "ur",
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
    baseMetadata,
    criticalResources,
    enableDNSPrefetch: true,
  });
}

const EBooksPage = async () => {
  // Fetch data on server-side
  const initialData = await getEbooksData();

  // Convert to SEO format for structured data
  const seoItems: SEOContentItem[] = initialData.slice(0, 10).map(book => ({
    id: book.id,
    title: book.fields.bookName || book.fields.enBookName || book.fields.hiBookName || "Untitled",
    author: book.fields.writer || book.fields.enWriter || book.fields.hiWriter || "Unknown Author",
    excerpt: book.fields.desc || book.fields.enDesc || book.fields.hiDesc,
    datePublished: book.fields.publishingDate,
    image: book.fields.book?.[0]?.thumbnails?.large?.url,
    url: `/E-Books/${book.id}`,
  }));

  // Get featured authors
  const featuredAuthors = [...new Set(
    initialData
      .map(book => book.fields.writer || book.fields.enWriter || book.fields.hiWriter)
      .filter(Boolean)
      .slice(0, 5)
  )];

  // Generate breadcrumbs
  const breadcrumbs = generateSEOBreadcrumbs({
    contentType: "ebooks",
    language: "ur",
  });

  // Generate comprehensive structured data
  const { structuredData } = await generateCollectionPageSEO({
    contentType: "ebooks",
    language: "ur",
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
