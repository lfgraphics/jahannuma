"use client";
import type { AirtableRecord, NazmenRecord } from "@/app/types";
import { useNazmenData } from "@/hooks/useNazmenData";
import { useShareAction } from "@/hooks/useShareAction";
import { formatNazmenRecord } from "@/lib/airtable-utils";
import { useMemo } from "react";
import DataCard from "./DataCard";

const { getClientBaseId } = require("@/lib/airtable-client-utils");
const BASE_ID = getClientBaseId("NAZMEN");
const TABLE = "nazmen";

export default function Nazmen() {
  const { records, isLoading } = useNazmenData(
    { pageSize: 30 }
  );
  const items = useMemo(
    () => (records || []).map(formatNazmenRecord),
    [records]
  );
  const share = useShareAction({ section: "Nazmen", title: "" });

  return (
    <div
      dir="ltr"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 m-3"
    >
      {!isLoading &&
        items.map((rec, index) => (
          <DataCard
            key={rec.id}
            page="nazm"
            shaerData={rec as any}
            index={index}
            download={false}
            storageKey="Nazmen"
            toggleanaween={() => {}}
            openanaween={null}
            handleCardClick={() => {}}
            handleShareClick={(rec: any) => {
              const r = rec as AirtableRecord<NazmenRecord>;
              const headArr = Array.isArray(r.fields.ghazalLines)
                ? r.fields.ghazalLines
                : String(r.fields.nazm || "").split("\n");
              return share.handleShare({
                baseId: BASE_ID,
                table: TABLE,
                recordId: r.id,
                title: r.fields.enShaer || r.fields.shaer,
                textLines: r.fields.enNazm ? String(r.fields.enNazm || "").split("\n") : headArr,
                slugId: r.fields.slugId,
                currentShares: r.fields.shares ?? 0,
              });
            }}
            openComments={() => {}}
          />
        ))}
    </div>
  );
}
