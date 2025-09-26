"use client";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import ComponentsLoader from "./ComponentsLoader";
import { Heart, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useAirtableList } from "@/hooks/useAirtableList";
import { useAirtableMutation } from "@/hooks/useAirtableMutation";
import type { AirtableRecord, NazmenRecord } from "@/app/types";
import { buildShaerFilter, formatNazmenRecord, isItemLiked, toggleLikedItem, prepareLikeUpdate, prepareShareUpdate, generateListCacheKey } from "@/lib/airtable-utils";

interface Props { takhallus: string }

const BASE_ID = "app5Y2OsuDgpXeQdz";
const TABLE = "nazmen";

const Nazmen: React.FC<Props> = ({ takhallus }) => {
  const [loading, setLoading] = useState(true);

  const { records, isLoading } = useAirtableList<AirtableRecord<any>>(BASE_ID, TABLE, {
    filterByFormula: buildShaerFilter(takhallus),
    pageSize: 30,
  });
  const items = useMemo(() => records.map(formatNazmenRecord) as AirtableRecord<NazmenRecord>[], [records]);
  useEffect(() => { setLoading(isLoading); }, [isLoading]);

  const { updateRecord } = useAirtableMutation(BASE_ID, TABLE);

  const handleHeartClick = async (shaerData: AirtableRecord<NazmenRecord>, index: number, id: string) => {
    if (typeof window === "undefined") return;
    try {
      const { liked } = toggleLikedItem("Nazmen", { id: shaerData.id });
      const inc = liked ? 1 : -1;
      await updateRecord([{ id: shaerData.id, fields: prepareLikeUpdate(shaerData.fields.likes, inc) }]);
    } catch (e) {
      toggleLikedItem("Nazmen", { id });
      console.error(e);
    }
  };

  const handleShareClick = async (shaerData: AirtableRecord<NazmenRecord>, index: number) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: shaerData.fields.shaer,
          text: (shaerData.fields.ghazalLines ?? []).join("\n") + `\nFound this on Jahannuma webpage\nCheckout there webpage here>> `,
          url: `${window.location.href + "/" + shaerData.id}`,
        });
      }
      await updateRecord([{ id: shaerData.id, fields: prepareShareUpdate(shaerData.fields.shares) }]);
    } catch (error) {
      console.error("Error updating shares:", error);
    }
  };

  return (
    <div>
      {loading && <ComponentsLoader />}
      {items.map((shaerData, index) => (
        <div
          key={shaerData.id}
          id={`card${index}`}
          className="bg-white rounded-sm border-b relative flex flex-col justify-between m-5 pt-0 md:mx-36 lg:mx-36"
        >
          <div className="flex justify-between items-center">
            <div className="mr-5">
              <Link href={"/Nazmen/" + (shaerData.fields.slugId ?? shaerData.fields.id ?? shaerData.id)}>
                <p className="text-2xl mb-3 text-[#984A02]">{shaerData.fields.unwan}</p>
                {(shaerData.fields.ghazalLines ?? []).map((lin, i) => (
                  <p style={{ lineHeight: "normal" }} key={i} className="text-black line-normal text-xl">
                    {lin}
                  </p>
                ))}
              </Link>
            </div>
            <div className="flex items-center justify-center">
              <button
                id={`${shaerData.id}`}
                className={`btn ml-5 ${isItemLiked("Nazmen", shaerData.id) ? "text-red-600" : "text-gray-500"} transition-all duration-500 text-lg`}
                onClick={() => handleHeartClick(shaerData, index, `${shaerData.id}`)}
              >
                <Heart className="cursor-pointer" size={18} />
              </button>
              <button className="m-3 flex items-center justify-center gap-2" onClick={() => handleShareClick(shaerData, index)}>
                <Share2 fill="gray" color="gray" />
                <span>{`${shaerData.fields?.shares ?? 0}`}</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Nazmen;
