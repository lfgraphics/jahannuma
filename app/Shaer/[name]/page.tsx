import { escapeAirtableFormulaValue } from "@/lib/utils";
import { Metadata } from "next";
import { headers } from "next/headers";
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
  likes?: number;
  id?: string;
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

// #region debug-point A:report-helper
async function reportDebug(
  hypothesisId: string,
  msg: string,
  data: Record<string, unknown>
) {
  try {
    await fetch("http://127.0.0.1:7777/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "ur-shaer-404",
        runId: "pre-fix",
        hypothesisId,
        location: "app/Shaer/[name]/page.tsx",
        msg: `[DEBUG] ${msg}`,
        data,
        ts: Date.now(),
      }),
    });
  } catch {}
}
// #endregion

async function fetchShaerData(nameParam: string): Promise<ShaerRecord | null> {
  try {
    const decoded = decodeURIComponent(nameParam).replace(/-/g, " ").trim();
    const normalized = decoded.replace(/\s+/g, " ");
    const safe = escapeAirtableFormulaValue(normalized);
    const filterByFormula = `OR(TRIM({takhallus})='${safe}', TRIM({enTakhallus})='${safe}', TRIM({hiTakhallus})='${safe}')`;
    // #region debug-point A:input-normalization
    await reportDebug("A", "fetchShaerData-input", {
      nameParam,
      decoded,
      normalized,
      safe,
      filterByFormula,
    });
    // #endregion

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
        "likes",
      ].join(","),
    });

    // Use absolute URL for server-side fetching
    const requestHeaders = await headers();
    const forwardedHost = requestHeaders.get("x-forwarded-host");
    const host = forwardedHost || requestHeaders.get("host");
    const proto =
      requestHeaders.get("x-forwarded-proto") ||
      (host?.includes("localhost") ? "http" : "https");
    const requestOrigin = host ? `${proto}://${host}` : null;
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_BASE_URL || requestOrigin || "http://localhost:3000";
    // #region debug-point B:base-url
    await reportDebug("B", "fetchShaerData-baseUrl", {
      baseUrl,
      vercelUrl: process.env.VERCEL_URL ?? null,
      publicBaseUrl: process.env.NEXT_PUBLIC_BASE_URL ?? null,
      host: host ?? null,
      proto,
      requestOrigin,
    });
    // #endregion

    const response = await fetch(
      `${baseUrl}/api/airtable/shaer?${searchParams.toString()}`,
      {
        next: { revalidate: 300 } // Cache for 5 minutes
      }
    );
    // #region debug-point C:api-response
    await reportDebug("C", "fetchShaerData-response", {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      url: `${baseUrl}/api/airtable/shaer?${searchParams.toString()}`,
    });
    // #endregion

    if (!response.ok) {
      console.error(`Failed to fetch shaer data: ${response.status} ${response.statusText}`);
      return null;
    }

    const result = await response.json();
    const records = result.data?.records || [];
    // #region debug-point D:result-shape
    await reportDebug("D", "fetchShaerData-result", {
      keys: result && typeof result === "object" ? Object.keys(result) : [],
      dataKeys:
        result?.data && typeof result.data === "object"
          ? Object.keys(result.data)
          : [],
      recordsLength: Array.isArray(records) ? records.length : -1,
      firstRecordId:
        Array.isArray(records) && records.length > 0 ? records[0]?.id : null,
    });
    // #endregion

    return records.length > 0 ? records[0] : null;
  } catch (error) {
    // #region debug-point E:fetch-error
    await reportDebug("E", "fetchShaerData-error", {
      error: error instanceof Error ? error.message : String(error),
    });
    // #endregion
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
    // #region debug-point F:page-entry
    await reportDebug("F", "page-entry", { nameParam });
    // #endregion

    if (!nameParam) {
      // #region debug-point F:no-name
      await reportDebug("F", "page-notFound-no-name", {});
      // #endregion
      notFound();
    }

    const shaerData = await fetchShaerData(nameParam);
    // #region debug-point G:page-result
    await reportDebug("G", "page-fetch-result", {
      hasShaerData: !!shaerData,
      recordId: shaerData?.id ?? null,
      takhallus: shaerData?.fields?.takhallus ?? null,
      enTakhallus: shaerData?.fields?.enTakhallus ?? null,
      hiTakhallus: shaerData?.fields?.hiTakhallus ?? null,
    });
    // #endregion

    if (!shaerData) {
      // #region debug-point G:not-found-after-fetch
      await reportDebug("G", "page-notFound-no-data", { nameParam });
      // #endregion
      notFound();
    }

    // Pass the server-fetched data to the client component
    return <ShaerComponent params={resolvedParams} initialData={shaerData} />;
  } catch (error) {
    // #region debug-point H:page-error
    await reportDebug("H", "page-error", {
      error: error instanceof Error ? error.message : String(error),
    });
    // #endregion
    console.error("Error in Shaer page:", error);
    notFound();
  }
}
