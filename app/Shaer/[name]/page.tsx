import { escapeAirtableFormulaValue } from "@/lib/utils";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import ShaerComponent from "./component";

interface IntroFields {
  description?: string;
  enDescription?: string;
  hiDescription?: string;
  takhallus: string;
  name?: string;
  dob?: string;
  location?: string;
  tafseel?: string | string[];
  searchKeys?: string | string[];
  enTakhallus?: string | string[];
  hiTakhallus?: string | string[];
  enName?: string | string[];
  hiName?: string | string[];
  enLocation?: string | string[];
  hiLocation?: string | string[];
  ghazlen?: boolean;
  eBooks?: boolean;
  nazmen?: boolean;
  ashaar?: boolean;
  rubai?: boolean;
  photo?: Array<{
    id: string;
    url: string;
    filename: string;
    size: number;
    type: string;
    width: number;
    height: number;
    thumbnails?: {
      small: { url: string; width: number; height: number };
      large: { url: string; width: number; height: number };
      full: { url: string; width: number; height: number };
    };
  }>;
}

interface ShaerRecord {
  fields: IntroFields;
  id: string;
}

async function fetchShaerData(nameParam: string): Promise<ShaerRecord | null> {
  try {
    const decoded = decodeURIComponent(nameParam).replace(/-/g, " ").trim();
    const safe = escapeAirtableFormulaValue(decoded);
    const filterByFormula = `OR({takhallus}='${safe}', {enTakhallus}='${safe}', {hiTakhallus}='${safe}')`;

    const searchParams = new URLSearchParams({
      pageSize: "1",
      filterByFormula,
      fields: [
        "photo",
        "takhallus",
        "ghazlen",
        "eBooks",
        "nazmen",
        "ashaar",
        "rubai",
        "name",
        "dob",
        "location",
        "tafseel",
        "searchKeys",
        "enTakhallus",
        "hiTakhallus",
        "enName",
        "hiName",
        "enLocation",
        "hiLocation",
        "description",
        "enDescription",
        "hiDescription",
      ].join(","),
    });

    // Use absolute URL for server-side fetching
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const response = await fetch(
      `${baseUrl}/api/airtable/shaer?${searchParams.toString()}`,
      {
        next: { revalidate: 300 } // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch shaer data: ${response.status} ${response.statusText}`);
      return null;
    }

    const result = await response.json();
    const records = result.data?.records || [];

    return records.length > 0 ? records[0] : null;
  } catch (error) {
    console.error("Error fetching shaer data:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  try {
    // Handle Next.js 15 params promise
    const resolvedParams = await params;
    const nameParam = resolvedParams.name;

    if (!nameParam) {
      return {
        title: "شاعر - جہاں نما",
        description: "اردو شاعری کا خزانہ",
      };
    }

    // Fetch poet data for enhanced metadata
    const shaerData = await fetchShaerData(nameParam);

    // Use actual poet data if available, otherwise fallback to decoded name
    const poetName = shaerData?.fields?.takhallus ||
      shaerData?.fields?.name ||
      decodeURIComponent(nameParam).replace(/-/g, " ").trim() ||
      "نامعلوم شاعر";

    // Ensure description is always a string for metadata
    const getStringDescription = (field?: string | string[]): string => {
      if (Array.isArray(field)) {
        return field.join(' ');
      }
      return field || '';
    };

    const description = shaerData?.fields?.description ||
      shaerData?.fields?.enDescription ||
      shaerData?.fields?.hiDescription ||
      getStringDescription(shaerData?.fields?.tafseel) ||
      `${poetName} کی شاعری اور تخلیقات - جہاں نما`;

    // Get poet's image for social media sharing
    const poetImage = shaerData?.fields?.photo && Array.isArray(shaerData.fields.photo) && shaerData.fields.photo.length > 0
      ? shaerData.fields.photo[0]?.thumbnails?.large?.url || shaerData.fields.photo[0]?.url
      : null;

    const baseMetadata = {
      title: `${poetName} - جہاں نما`,
      description,
      alternates: {
        canonical: `/Shaer/${nameParam}`,
      },
    };

    // Enhanced Open Graph metadata with poet's image
    const openGraphMetadata = {
      title: `${poetName} - جہاں نما`,
      description,
      type: "profile" as const,
      locale: "ur_PK",
      siteName: "جہاں نما",
      ...(poetImage && { images: [{ url: poetImage, alt: `${poetName} کی تصویر` }] }),
    };

    // Enhanced Twitter metadata with poet's image
    const twitterMetadata = {
      card: "summary_large_image" as const,
      title: `${poetName} - جہاں نما`,
      description,
      ...(poetImage && { images: [poetImage] }),
    };

    return {
      ...baseMetadata,
      openGraph: openGraphMetadata,
      twitter: twitterMetadata,
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "شاعر - جہاں نما",
      description: "اردو شاعری کا خزانہ",
    };
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  try {
    // Handle Next.js 15 params promise
    const resolvedParams = await params;
    const nameParam = resolvedParams.name;

    if (!nameParam) {
      notFound();
    }

    const shaerData = await fetchShaerData(nameParam);

    if (!shaerData) {
      notFound();
    }

    // Pass the server-fetched data to the client component
    return <ShaerComponent params={resolvedParams} initialData={shaerData} />;
  } catch (error) {
    console.error("Error in Shaer page:", error);
    notFound();
  }
}
