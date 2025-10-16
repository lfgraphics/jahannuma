import DataCard from "@/app/Components/DataCard";
import type { AirtableRecord, GhazlenRecord } from "@/app/types";
import { useAirtableList } from "@/hooks/airtable/useAirtableList";
import { useShareAction } from "@/hooks/useShareAction";
import { formatGhazlenRecord } from "@/lib/airtable-utils";
import { useMemo } from "react";

export default function Ghazlen() {
  const { records, isLoading } = useAirtableList<AirtableRecord<GhazlenRecord>>(
    "ghazlen",
    { pageSize: 30 }
  );
  const items = useMemo(
    () => (records || []).map(formatGhazlenRecord),
    [records]
  );
  const share = useShareAction({ section: "Ghazlen", title: "" });

  return (
    <div
      dir="rtl"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 m-3"
    >
      {!isLoading &&
        items.map((rec, index) => (
          <DataCard
            key={rec.id}
            page="ghazal"
            shaerData={rec as any}
            index={index}
            download={false}
            storageKey="Ghazlen"
            toggleanaween={() => {}}
            openanaween={null}
            handleCardClick={() => {}}
            handleShareClick={(rec: any) => {
              const r = rec as AirtableRecord<GhazlenRecord>;
              const headArr = Array.isArray(r.fields.ghazalHead)
                ? r.fields.ghazalHead
                : String(r.fields.ghazalHead || "").split("\n");
              return share.handleShare({
                recordId: r.id,
                title: r.fields.shaer,
                textLines: headArr,
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
