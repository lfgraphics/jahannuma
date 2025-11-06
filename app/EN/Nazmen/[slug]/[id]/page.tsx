"use client";
import ComponentsLoader from "@/app/Components/shaer/ComponentsLoader";
import type { AirtableRecord, NazmenRecord } from "@/app/types";
import { useAirtableList } from "@/hooks/useAirtableList";
import { useAirtableRecord } from "@/hooks/useAirtableRecord";
import { buildIdFilter, formatNazmenRecord } from "@/lib/airtable-utils";
import type { AshaarPageParams } from "@/types/routes";
import AOS from "aos";
import "aos/dist/aos.css";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const { getClientBaseId } = require("@/lib/airtable-client-utils");
const BASE_ID = getClientBaseId("NAZMEN");
const TABLE = "nazmen";

export default function Page() {
  const params = useParams() as unknown as AshaarPageParams;
  const id = params?.id;

  useEffect(() => {
    AOS.init({ offset: 50, delay: 0, duration: 300 });
  }, []);

  // Conditionally enable only one hook at a time
  const isRecordId = !!id && /^rec[a-zA-Z0-9]{14}$/.test(id);
  // robust fallback: if record-shaped id fails, force the list attempt
  const [forceList, setForceList] = useState(false);
  const enableList = !!id && (!isRecordId || forceList);

  // First: try to resolve by custom {id}
  const {
    records,
    isLoading: listLoading,
    error: listError,
  } = useAirtableList<AirtableRecord<NazmenRecord>>(
    BASE_ID,
    TABLE,
    {
      filterByFormula: id ? buildIdFilter(id) : undefined,
      pageSize: 1,
    },
    { enabled: enableList }
  );
  // Second (fallback): try record fetch if it looks like recordId OR list finished with no results; disable when forcing list
  const shouldTryRecord =
    !!id &&
    !forceList &&
    (isRecordId ||
      (enableList && !listLoading && (!records || records.length === 0)));
  const recordIdForHook = shouldTryRecord ? id! : null;
  const {
    data: recordData,
    isLoading: recordLoading,
    error: recordError,
  } = useAirtableRecord<AirtableRecord<NazmenRecord>>(
    BASE_ID,
    TABLE,
    recordIdForHook
  );

  // If record lookup settles with error or empty for record-shaped id, force list on next render
  useEffect(() => {
    if (!id || !isRecordId || forceList) return;
    if (recordLoading) return;
    if (recordError || !recordData) setForceList(true);
  }, [id, isRecordId, forceList, recordLoading, recordError, recordData]);

  const rec = records?.[0] ?? (recordData as AirtableRecord<any> | undefined);
  const formatted = useMemo(
    () => (rec ? formatNazmenRecord(rec) : undefined),
    [rec]
  );
  const fields = formatted?.fields as NazmenRecord | undefined;
  const ghazalLines = fields?.ghazalLines;

  const visitNazmen = () => {
    if (typeof window !== "undefined") {
      const referrer = document.referrer || "";
      if (!referrer.includes("/Nazmen")) {
        window.location.href = `${window.location.origin}/Nazmen`;
      } else {
        window.history.back();
      }
    }
  };

  const attemptsSettled =
    (!enableList || !listLoading) && (!shouldTryRecord || !recordLoading);
  const noResult = attemptsSettled && !rec;

  return (
    <div dir="rtl" className="flex justify-center">
      {!id ? (
        <div className="p-4 mt-3 w-screen md:w-[400px] text-center">
          Invalid record id
        </div>
      ) : listLoading || recordLoading ? (
        <ComponentsLoader />
      ) : listError || recordError ? (
        <div className="p-4 mt-3 w-screen md:w-[400px] text-center">
          ریکاڑڈ دستیاب نہیں۔
        </div>
      ) : noResult ? (
        <div className="p-4 mt-3 w-screen md:w-[400px] text-center">
          ریکارڈ دستیاب نہیں۔
        </div>
      ) : (
        <div className="p-4 mt-3 w-screen md:w-[400px]">
          <div
            className="ghazalHead text-3xl text-center mb-2"
            style={{ lineHeight: "46px" }}
          >
            <h2>{fields?.unwan}</h2>
          </div>
          <div className="ghazalHead mb-3 text-[#984A02]">
            <Link href={`/Shaer/${encodeURIComponent(fields?.shaer ?? "")}`}>
              <h2>{fields?.shaer}</h2>
            </Link>
          </div>
          <div className="w-[100%] h-[1px] mb-4 bg-gray-500 "></div>
          {!fields?.paband && (
            <div className="text-2xl mb-4 text-center">
              {ghazalLines?.map((line: string, index: number) => (
                <p
                  className={`${line == "****" ? "my-12 md:my-9 opacity-0" : ""
                    }`}
                  style={{ lineHeight: "normal" }}
                  key={index}
                >
                  {line}
                </p>
              ))}
            </div>
          )}
          {fields?.paband && (
            <div className="text-2xl mb-4 flex flex-col justify-center">
              {ghazalLines?.map((line: string, index: number) => (
                <p
                  data-aos="fade-up"
                  key={index}
                  className={`justif w-full px-10 pb-3 text-2xl ${line == "****" ? "text-transparent my-3 select-none" : ""
                    } [&]:text-[length:clamp(1rem,2vw,1.5rem)] break-words`}
                >
                  {line}
                </p>
              ))}
            </div>
          )}
          {(fields?.enRef || fields?.ref) && (
            <div className="reference mb-4 text-left border-l-4 border-gray-400 pl-3" data-aos="fade-up">
              <h3 className="text-gray-500 text-sm mb-1">مآخذ:</h3>
              <p className="text-gray-700 text-sm">{fields.enRef || fields.ref}</p>
            </div>
          )}
          <div className="mazeed flex justify-around">
            <button
              onClick={visitNazmen}
              className="bg-white text-[#984A02] border active:bg-[#984A02] active:text-white border-[#984A02] px-4 py-2 rounded-md"
            >
              مزید نظمیں
            </button>
            <Link
              href={`/Nazmen/shaer/${encodeURIComponent(
                (fields?.shaer ?? "").replace(/\s+/g, "_")
              )}`}
              className="text-blue-600 underline"
            >
              {fields?.shaer} کی مزید نظمیں
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
