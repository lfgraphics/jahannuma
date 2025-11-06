"use client";
import Loader from "@/app/Components/Loader";
import type { AirtableRecord, GhazlenRecord } from "@/app/types";
import { useAirtableList } from "@/hooks/useAirtableList";
import { useAirtableRecord } from "@/hooks/useAirtableRecord";
import { buildIdFilter, formatGhazlenRecord } from "@/lib/airtable-utils";
import type { GhazlenPageParams } from "@/types/routes";
import AOS from "aos";
import "aos/dist/aos.css";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const BASE_ID = "appvzkf6nX376pZy6";
const TABLE = "Ghazlen";

// Helper function to ensure we have an array of strings
const ensureStringArray = (value: string | string[] | undefined): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
};

export default function Page() {
  const params = useParams() as unknown as GhazlenPageParams;
  const id = params?.id;
  const slug = params?.slug;

  // Extract ID from slug if available, otherwise use the id parameter
  const effectiveId = useMemo(() => {
    if (slug) {
      const extractedId = id;
      if (extractedId) return extractedId;
    }
    return id;
  }, [slug, id]);

  useEffect(() => {
    AOS.init({ offset: 50, delay: 0, duration: 300 });
  }, []);

  // Conditionally enable only one hook at a time to avoid extra API calls
  // Strict Airtable recordId matcher: 'rec' + 14 base62 chars
  const isRecordId = !!effectiveId && /^rec[a-zA-Z0-9]{14}$/.test(effectiveId);
  // if record lookup fails for an id that looks like a recordId, force list query on next render
  const [forceList, setForceList] = useState(false);
  const enableList = !!effectiveId && (!isRecordId || forceList);

  // First: try to resolve by custom {id} when not a direct record id
  const { records, isLoading: listLoading, error: listError } = useAirtableList<AirtableRecord<GhazlenRecord>>(
    BASE_ID,
    TABLE,
    {
      filterByFormula: effectiveId ? buildIdFilter(effectiveId) : undefined,
      pageSize: 1,
    },
    { enabled: enableList }
  );

  // Second: enable record fetch if it looks like a recordId OR list finished with no records; disable when forceList is active
  const shouldTryRecord = !!effectiveId && !forceList && (isRecordId || (enableList && !listLoading && (!records || records.length === 0)));
  const recordIdForHook = shouldTryRecord ? effectiveId! : null;
  const { data: recordData, isLoading: recordLoading, error: recordError } = useAirtableRecord<AirtableRecord<GhazlenRecord>>(BASE_ID, TABLE, recordIdForHook);

  // If effectiveId looked like a record id but record fetch failed or returned no data, fall back to list query
  useEffect(() => {
    if (!effectiveId || !isRecordId || forceList) return;
    if (recordLoading) return; // wait until settled
    if (recordError || !recordData) {
      setForceList(true);
    }
  }, [effectiveId, isRecordId, forceList, recordLoading, recordError, recordData]);

  const rec = records?.[0] ?? (recordData as AirtableRecord<any> | undefined);
  const formatted = useMemo(() => (rec ? formatGhazlenRecord(rec) : undefined), [rec]);
  const fields = formatted?.fields as GhazlenRecord | undefined;

  const visitGhazlen = () => {
    if (typeof window !== "undefined") {
      const referrer = document.referrer || "";
      if (!referrer.includes("/HI/Ghazlen")) {
        window.location.href = `${window.location.origin}/HI/Ghazlen`;
      } else {
        window.history.back();
      }
    }
  };

  const attemptsSettled = (!enableList || !listLoading) && (!shouldTryRecord || !recordLoading);
  const noResult = attemptsSettled && !rec;

  return (
    <div dir="ltr" className="flex justify-center">
      {!effectiveId ? (
        <div className="h-[90vh] w-full flex items-center justify-center">अमान्य रिकॉर्ड आईडी</div>
      ) : (listLoading || recordLoading) ? (
        <div className="h-[90vh] w-full flex items-center justify-center">
          <Loader />
        </div>
      ) : (listError || recordError) ? (
        <div className="p-4 mt-3 w-screen md:w-[400px] text-center">रिकॉर्ड उपलब्ध नहीं है।</div>
      ) : noResult ? (
        <div className="p-4 mt-3 w-screen md:w-[400px] text-center">रिकॉर्ड उपलब्ध नहीं है।</div>
      ) : (
        <div className="p-4 mt-3 w-screen md:w-[400px]">
          <div className="ghazalHead text-2xl text-center leading-[3rem]">
            {ensureStringArray(fields?.ghazalHead).map((line: string, index: number) => (
              <h2 key={index}>{line}</h2>
            ))}
          </div>
          <div className="ghazalHead mb-3 text-[#984A02]">
            <Link href={`/HI/Shaer/${encodeURIComponent(fields?.shaer ?? "")}`}>
              <h2>{fields?.shaer}</h2>
            </Link>
          </div>
          <div className="w-[100%] h-[1px] mb-4 bg-gray-500 "></div>
          <div className="text-2xl mb-4 flex flex-col justify-center ">
            {ensureStringArray(fields?.ghazal).map((line: string, index: number) => (
              <p data-aos="fade-up" key={index} className="justif w-full px-10 pb-3 text-2xl">
                {line}
              </p>
            ))}
          </div>
          <div className="flex gap-5 text-md mb-4 justify-center" data-aos="fade-up">
            {ensureStringArray(fields?.unwan).map((unwan: string, index: number) => (
              <Link href={`/HI/Ghazlen/mozu/${encodeURIComponent(unwan)}`} className="text-blue-500 underline cursor-pointer" style={{ lineHeight: "normal" }} key={index}>
                {unwan}
              </Link>
            ))}
          </div>
          {(fields?.hiRef || fields?.ref) && (
            <div className="reference mb-4 text-left border-l-4 border-gray-400 pl-3" data-aos="fade-up">
              <h3 className="text-gray-500 text-sm mb-1">مآخذ:</h3>
              <p className="text-gray-700 text-sm">{fields.hiRef || fields.ref}</p>
            </div>
          )}
          <div className="mazeed flex justify-around" data-aos="fade-up">
            <button onClick={visitGhazlen} className="bg-white text-[#984A02] border active:bg-[#984a02ac] active:text-white border-[#984A02] px-4 py-2 rounded-md">
              और ग़ज़लें
            </button>
            <Link scroll={false} href={`/HI/Ghazlen/shaer/${fields?.shaer?.replace(" ", "_")}`} className="text-blue-600 underline">
              {fields?.shaer} की और ग़ज़लें
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}