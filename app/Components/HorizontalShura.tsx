"use client";
import { useMemo } from "react";
import Card from "./shaer/Profilecard";
import Link from "next/link";
import Loader from "./Loader";
import { ChevronRightCircle } from "lucide-react";
import { useAirtableList } from "@/hooks/useAirtableList";
import { TTL } from "@/lib/airtable-fetcher";

interface Photo {
  filename: string;
  height: number;
  id: string;
  size: number;
  thumbnails: {
    full: {
      height: number;
      url: string;
      width: number;
    };
    large: {
      height: number;
      url: string;
      width: number;
    };
    small: {
      height: number;
      url: string;
      width: number;
    };
  };
  type: string;
  url: string;
  width: number;
}

interface FormattedRecord {
  fields: {
    takhallus: string;
    dob: string;
    location: string;
    tafseel: string[];
    searchKeys: string[];
    enTakhallus: string[];
    hiTakhallus: string[];
    enName: string[];
    hiName: string[];
    enLocation: string[];
    hiLocation: string[];
    ghazal: boolean;
    eBooks: boolean;
    nazmen: boolean;
    likes: number;
    photo: Photo[];
  };
  id: string;
  createdTime: string;
}

const HorizontalShura = () => {
  const { records, isLoading } = useAirtableList<FormattedRecord>(
    "appgWv81tu4RT3uRB",
    "Intro",
    { pageSize: 10 },
    { ttl: TTL.static }
  );
  // Normalize/format without state to avoid re-render loops
  const data = useMemo(() => {
    // Return only string items; split strings by newline safely
    const toArray = (v: unknown): string[] => {
      if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string").map(s => s.trim()).filter(Boolean);
      if (typeof v === "string") return v.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
      return [];
    };

    type BaseRecord = { id: string; createdTime: string; fields: Record<string, unknown> };
    const isRecord = (x: unknown): x is BaseRecord => {
      return (
        typeof x === "object" && x !== null &&
        typeof (x as any).id === "string" &&
        typeof (x as any).createdTime === "string" &&
        typeof (x as any).fields === "object" && (x as any).fields !== null
      );
    };

    const safeNum = (v: unknown): number => {
      if (typeof v === "number") return v;
      const n = Number(v ?? 0);
      return Number.isFinite(n) ? n : 0;
    };

    const raw: unknown[] = Array.isArray(records) ? (records as unknown[]) : [];
    return raw.filter(isRecord).map((record) => {
      const f = record.fields;
      const photo = Array.isArray(f["photo"]) ? (f["photo"] as Photo[]) : [];
      return {
        id: record.id,
        createdTime: record.createdTime,
        fields: {
          takhallus: typeof f.takhallus === "string" ? (f.takhallus as string) : "",
          dob: typeof f.dob === "string" ? (f.dob as string) : "",
          location: typeof f.location === "string" ? (f.location as string) : "",
          tafseel: toArray(f["tafseel"]),
          searchKeys: toArray(f["searchKeys"]),
          enTakhallus: toArray(f["enTakhallus"]),
          hiTakhallus: toArray(f["hiTakhallus"]),
          enName: toArray(f["enName"]),
          hiName: toArray(f["hiName"]),
          enLocation: toArray(f["enLocation"]),
          hiLocation: toArray(f["hiLocation"]),
          ghazal: Boolean(f["ghazal"]),
          eBooks: Boolean(f["eBooks"]),
          nazmen: Boolean(f["nazmen"]),
          likes: safeNum(f["likes"]),
          photo,
        },
      } as FormattedRecord;
    });
  }, [records]);
  const loading = isLoading;
  return (
    <div dir="ltr">
      <h2 className="py-4 pb-0 text-center text-4xl">شعرا</h2>
      {loading && <Loader></Loader>}
      {!loading && (
        <div>
          <div
            id="section"
            dir="rtl"
            className="flex flex-row-reverse overflow-auto gap-4 py-6 pt-3 px-6 items-center bg-[#F3F4F6] dark:bg-[#2d2d2f]"
          >
            {data.map((item, index) => (
              <div className="w-[240px]" key={index}>
                <Card data={item} />
              </div>
            ))}
            <Link className=" text-white text-4xl font-bold" href={"/Shaer"}>
              <ChevronRightCircle color="#984A02" size={36} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default HorizontalShura;
