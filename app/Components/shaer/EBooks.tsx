"use client";
import Link from "next/link";
import React, { useEffect, useMemo } from "react";
import Card from "../../Components/BookCard";
import ComponentsLoader from "./ComponentsLoader";
import { Heart } from "lucide-react";
import { useAirtableList } from "@/hooks/useAirtableList";
import { useAirtableMutation } from "@/hooks/useAirtableMutation";
import type { AirtableRecord } from "@/app/types";
import { buildShaerFilter, isItemLiked, toggleLikedItem, prepareLikeUpdate } from "@/lib/airtable-utils";

interface Props { takhallus: string }

const BASE_ID = "appXcBoNMGdIaSUyA";
const TABLE = "E-Books";

const EBooks: React.FC<Props> = ({ takhallus }) => {
  const { records, isLoading } = useAirtableList<AirtableRecord<any>>(BASE_ID, TABLE, {
    filterByFormula: buildShaerFilter(takhallus),
    pageSize: 30,
  });
  const dataItems = records;
  const { updateRecord } = useAirtableMutation(BASE_ID, TABLE);

  const handleHeartClick = async (shaerData: AirtableRecord<any>, index: number, id: string) => {
    if (typeof window === "undefined") return;
    try {
      const { liked } = toggleLikedItem("Books", { id: shaerData.id });
      const inc = liked ? 1 : -1;
      await updateRecord([{ id: shaerData.id, fields: prepareLikeUpdate(shaerData.fields?.likes, inc) }]);
    } catch (error) {
      toggleLikedItem("Books", { id });
      console.error("Error updating likes:", error);
    }
  };

  return (
    <>
      {isLoading && <ComponentsLoader />}
      {!isLoading && (
        <div id="section" dir="rtl" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 m-3">
          {dataItems.map((item, index) => (
            <div className="relative" key={item.id}>
              <button
                className={`heart cursor-pointer ${isItemLiked("Books", item.id) ? "text-red-600" : "text-gray-500"} pr-3 absolute top-0 right-0 w-[80px] max-w-[120px] h-10 flex items-center justify-center border rounded-full m-2 bg-white bg-opacity-30 backdrop-blur-sm z-10`}
                onClick={() => handleHeartClick(item, index, `${item.id}`)}
                id={`${item.id}`}
              >
                <Heart fill="gray" color="gray" />
                <span className="text-black">{`${item.fields?.likes ?? 0}`}</span>
              </button>
              <Card data={item} />
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default EBooks;
