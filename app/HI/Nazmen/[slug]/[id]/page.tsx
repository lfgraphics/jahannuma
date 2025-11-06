"use client";
import Loader from "@/app/Components/Loader";
import type { AirtableRecord, NazmenRecord } from "@/app/types";
import { useAirtableList } from "@/hooks/useAirtableList";
import { useAirtableRecord } from "@/hooks/useAirtableRecord";
import { buildIdFilter, formatNazmenRecord } from "@/lib/airtable-utils";
import AOS from "aos";
import "aos/dist/aos.css";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const BASE_ID = "appvzkf6nX376pZy6";
const TABLE = "Nazmen";

// Helper function to ensure we have an array of strings
const ensureStringArray = (value: string | string[] | undefined): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
};

export default function Page() {
  const params = useParams();
  const id = params?.id as string;
  const slug = params?.slug as string;

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

  const isRecordId = !!effectiveId && /^rec[a-zA-Z0-9]{14}$/.test(effectiveId);
  const [forceList, setForceList] = useState(false);
  const enableList = !!effectiveId && (!isRecordId || forceList);

  const { records, isLoading: listLoading, error: listError } = useAirtableList<AirtableRecord<NazmenRecord>>(
    BASE_ID,
    TABLE,
    {
      filterByFormula: effectiveId ? buildIdFilter(effectiveId) : undefined,
      pageSize: 1,
    },
    { enabled: enableList }
  );

  const shouldTryRecord = !!effectiveId && !forceList && (isRecordId || (enableList && !listLoading && (!records || records.length === 0)));
  const recordIdForHook = shouldTryRecord ? effectiveId! : null;
  const { data: recordData, isLoading: recordLoading, error: recordError } = useAirtableRecord<AirtableRecord<NazmenRecord>>(BASE_ID, TABLE, recordIdForHook);

  useEffect(() => {
    if (!effectiveId || !isRecordId || forceList) return;
    if (recordLoading) return;
    if (recordError || !recordData) {
      setForceList(true);
    }
  }, [effectiveId, isRecordId, forceList, recordLoading, recordError, recordData]);

  const rec = records?.[0] ?? (recordData as AirtableRecord<any> | undefined);
  const formatted = useMemo(() => (rec ? formatNazmenRecord(rec) : undefined), [rec]);
  const fields = formatted?.fields as NazmenRecord | undefined;

  const visitNazmen = () => {
    if (typeof window !== "undefined") {
      const referrer = document.referrer || "";
      if (!referrer.includes("/HI/Nazmen")) {
        window.location.href = `${window.location.origin}/HI/Nazmen`;
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
            {ensureStringArray(fields?.nazmHead).map((line: string, index: number) => (
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
            {(typeof fields?.nazm === 'string' ? fields.nazm.split('\n') : []).map((line: string, index: number) => (
              <p data-aos="fade-up" key={index} className="justif w-full px-10 pb-3 text-2xl">
                {line}
              </p>
            ))}
          </div>
          {(fields?.hiRef || fields?.ref) && (
            <div className="reference mb-4 text-left border-l-4 border-gray-400 pl-3" data-aos="fade-up">
              <h3 className="text-gray-500 text-sm mb-1">مآخذ:</h3>
              <p className="text-gray-700 text-sm">{fields.hiRef || fields.ref}</p>
            </div>
          )}
          <div className="mazeed flex justify-around" data-aos="fade-up">
            <button onClick={visitNazmen} className="bg-white text-[#984A02] border active:bg-[#984a02ac] active:text-white border-[#984A02] px-4 py-2 rounded-md">
              और नज़्में
            </button>
            <Link scroll={false} href={`/HI/Nazmen/shaer/${fields?.shaer?.replace(" ", "_")}`} className="text-blue-600 underline">
              {fields?.shaer} की और नज़्में
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}