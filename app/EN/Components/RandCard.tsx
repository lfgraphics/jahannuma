"use client";
import React, { useEffect, useState } from "react";
import * as data from "../Ghazlen/data";
import { Download, Share2 } from "lucide-react";
import Loader from "./Loader";
import { useLanguage } from "@/contexts/LanguageContext";
import { useShareAction } from "@/hooks/useShareAction";
import DynamicDownloadHandler from "@/app/Components/Download";
import useAuthGuard from "@/hooks/useAuthGuard";
import LoginRequiredDialog from "@/components/ui/login-required-dialog";

interface Shaer {
  shaer: string;
  sherHead: string[];
  wholeSher: string[];
}

const EnduRandcard: React.FC<{}> = () => {
  const dataItems: Shaer[] = data.getAllShaers();
  const randomIndex = dataItems.length > 0 ? Math.floor(Math.random() * dataItems.length) : 0;
  const randomData = dataItems.length > 0 ? dataItems[randomIndex] : undefined;

  const { language } = useLanguage();
  const { requireAuth, showLoginDialog, setShowLoginDialog, pendingAction } = useAuthGuard();
  const [downloadData, setDownloadData] = useState<{
    id: string;
    fields: { shaer?: string; ghazalHead?: string[] };
  } | null>(null);

  const handleDownload = (shaerData: Shaer) => {
    if (!requireAuth("download")) return;
    setDownloadData({
      id: `rand-${shaerData.shaer}`,
      fields: { shaer: shaerData.shaer, ghazalHead: shaerData.sherHead },
    });
  };

  const share = useShareAction({ section: "EN", title: "Random sher", textLines: [], url: "" });
  const handleShareClick = async (shaerData: Shaer, id: string): Promise<void> => {
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const url = `${origin}/EN#${id}`;
      const title = shaerData.shaer;
      const textLines = [...shaerData.sherHead];
      await share.handleShare({ url, title, textLines });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };
  const [insideBrowser, setInsideBrowser] = useState(false);

  useEffect(() => {
    if (typeof window !== undefined) {
      // Code is running in a browser
      setInsideBrowser(true);
    } else {
      // Code is running on the server
      setInsideBrowser(false);
    }
  }, []);

  return (
    <div className="justify-center flex flex-col items-center m-4">
      <h4
        className="text-xl m-4 font-semibold text-[#984A02] tracking-[5px]"
        // style={{ letterSpacing: "5px" }}
      >
        Random sher
      </h4>
      {!insideBrowser && <Loader></Loader>}
  {insideBrowser && randomData && (
        <div
          id={"sherCard"}
          className="bg-white p-4 rounded-sm w-[95vw] justify-center flex flex-col items-center"
        >
          <h2
            className="text-black text-2xl font-bold mb-2"
            style={{ lineHeight: "normal" }}
          >
            {randomData.shaer}
          </h2>
          {randomData.sherHead.map((line, index) => (
            <p
              key={index}
              className="text-black text-center"
              style={{ lineHeight: "normal" }}
            >
              {line}
            </p>
          ))}
          <div className="felx text-center">
            {/* Your buttons and actions here */}
            <div className="flex flex-row items-center icons gap-3">
              <button
                className="m-3 flex gap-2 items-center"
                onClick={() => randomData && handleShareClick(randomData, "sherCard")}
              >
                <Share2 color="#984A02" />
                <p className="pb-[11px]">Share this</p>
              </button>
              <button
                className="m-3 flex gap-2 items-center"
                onClick={() => randomData && handleDownload(randomData)}
              >
                <Download color="#984A02" />
                <p className="pb-[11px]">Download this</p>
              </button>
              {/* <button
                className="m-3 text-[20px] flex gap-2 items-center"
                onClick={() => handleDownload("sherCard")}
              >
                <ArrowDown
                  style={{ color: "#984A02" }}
                />
              </button> */}
            </div>
          </div>
        </div>
      )}
      {downloadData && (
        <DynamicDownloadHandler
          data={downloadData}
          onCancel={() => setDownloadData(null)}
        />
      )}
      <LoginRequiredDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} actionType={pendingAction || "download"} />
    </div>
  );
};

export default EnduRandcard;
