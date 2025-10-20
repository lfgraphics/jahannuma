import { escapeAirtableFormulaValue } from "@/lib/utils";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import ShaerComponent from "./component";

interface IntroFields {
  description: string;
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
  photo?: string | string[];
}

interface ShaerRecord {
  fields: IntroFields;
  id: string;
}

async function fetchShaerData(nameParam: string): Promise<ShaerRecord | null> {
  try {
    const decoded = decodeURIComponent(nameParam).replace(/-/g, " ").trim();
    const safe = escapeAirtableFormulaValue(decoded);
    const filterByFormula = `({takhallus}='${safe}')`;

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

    // Decode the name parameter to get poet name
    const decoded = decodeURIComponent(nameParam).replace(/-/g, " ").trim();
    const poetName = decoded || "نامعلوم شاعر";
    const description = `${poetName} کی شاعری اور تخلیقات - جہاں نما`;

    // Basic metadata without server-side fetch to avoid errors
    return {
      title: `${poetName} - جہاں نما`,
      description,
      openGraph: {
        title: `${poetName} - جہاں نما`,
        description,
        type: "profile",
        locale: "ur_PK",
        siteName: "جہاں نما",
      },
      twitter: {
        card: "summary_large_image",
        title: `${poetName} - جہاں نما`,
        description,
      },
      alternates: {
        canonical: `/Shaer/${nameParam}`,
      },
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
