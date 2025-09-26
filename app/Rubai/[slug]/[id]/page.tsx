"use client";
import Link from "next/link";
import React, { useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import AOS from "aos";
import "aos/dist/aos.css";
import Loader from "../../../Components/Loader";
import type { AirtableRecord } from "../../../types";
import { useAirtableList } from "@/hooks/useAirtableList";
import { useAirtableRecord } from "@/hooks/useAirtableRecord";
import { buildIdFilter } from "@/lib/airtable-utils";

type RubaiFields = {
  shaer: string;
  unwan: string;
  body: string;
  likes?: number;
  comments?: number;
  shares?: number;
  id?: string;
};

const BASE_ID = "appIewyeCIcAD4Y11";
const TABLE = "rubai";

export default function Page() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  useEffect(() => {
    AOS.init({ offset: 50, delay: 0, duration: 300 });
  }, []);

  const { records, isLoading: listLoading, error: listError } = useAirtableList<AirtableRecord<any>>(BASE_ID, TABLE, {
    filterByFormula: id ? buildIdFilter(id) : undefined,
    pageSize: 1,
  });
  const { data: recordData, isLoading: recordLoading, error: recordError } = useAirtableRecord<AirtableRecord<any>>(BASE_ID, TABLE, id || "");
  const rec = records?.[0] ?? (recordData as AirtableRecord<any> | undefined);
  const data = useMemo(() => rec?.fields as RubaiFields | undefined, [rec]);
  const visitRubai = () => {
    if (typeof window !== undefined) {
      const referrer = document.referrer || "";
      if (!referrer.includes("/Rubai")) {
        window.location.href = `${window.location.origin}/Rubai`;
      } else {
        window.history.back();
      }
    }
  };
  return (
    <div dir="rtl" className="flex justify-center">
      {(listLoading && recordLoading) ? (
        <div className="h-[90vh] w-full flex items-center justify-center">
          <Loader />
        </div>
      ) : (listError && recordError) || !data ? (
        <div className="p-4 mt-3 w-screen md:w-[400px] text-center">ریکارڈ دستیاب نہیں۔</div>
      ) : (
        <div className="p-4 mt-3 w-full md:w-[400px]">
          <div className="text-center text-2xl">
          <p>{data?.unwan}</p>
          </div>
          <div className="ghazalHead mb-3 text-primary">
            <Link href={{ pathname: "/Shaer/[name]", query: { name: data?.shaer ?? "" } }}>
              <h2>{data?.shaer}</h2>
            </Link>
          </div>
          <div className="text-2xl mb-4 flex flex-col justify-center">
            {String(data?.body ?? "").split("\n").map((line, index) => (
              <p
                data-aos="fade-up"
                key={index}
                className="justif w-full px-10 text-foreground pb-3 text-2xl"
              >
                {line}
              </p>
            ))}
          </div>
          <div className="mazeed flex justify-around" data-aos="fade-up">
            <button
              onClick={visitRubai}
              className="bg-background text-primary border active:bg-primary/70 active:text-primary-foreground border-primary px-4 py-2 rounded-md"
            >
              مزید رباعی
            </button>
            <Link
              href={{ pathname: "/Rubai/shaer/[name]", query: { name: data?.shaer?.replace(" ", "_") ?? "" } }}
              className="text-blue-600 underline"
              scroll={false}
            >
              {data?.shaer} کی مزید رباعی
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}