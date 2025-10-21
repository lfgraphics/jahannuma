"use client";
import DynamicDownloadHandler from "@/app/Components/Download";
import LoginRequiredDialog from "@/components/ui/login-required-dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import useAuthGuard from "@/hooks/useAuthGuard";
import { useGhazlenData } from "@/hooks/useGhazlenData";
import { useShareAction } from "@/hooks/useShareAction";
import { getLanguageFieldValue } from "@/lib/language-field-utils";
import { Download, Share2 } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import Loader from "../../Components/Loader";

interface Shaer {
  shaer: string;
  sherHead: string[];
  wholeSher: string[];
}

const RandCard: React.FC<{}> = () => {
  // Use real API data instead of mock data
  const { records, isLoading } = useGhazlenData(
    { pageSize: 10 }, // Get a small sample for random selection
    { debounceMs: 300 }
  );

  // Transform and select random data with language-aware field selection
  const randomData = useMemo(() => {
    if (!records || records.length === 0) return undefined;

    const randomIndex = Math.floor(Math.random() * records.length);
    const record = records[randomIndex];

    if (!record) return undefined;

    // Use Hindi fields if available, fallback to default fields
    const shaerName = getLanguageFieldValue(record.fields, 'shaer', 'HI') || record.fields.shaer;
    const ghazalHead = getLanguageFieldValue(record.fields, 'ghazalHead', 'HI') || record.fields.ghazalHead;
    const ghazal = getLanguageFieldValue(record.fields, 'ghazal', 'HI') || record.fields.ghazal;

    return {
      shaer: shaerName || '',
      sherHead: Array.isArray(ghazalHead) ? ghazalHead : [ghazalHead].filter(Boolean),
      wholeSher: String(ghazal || "").replace(/\r\n?/g, "\n").split("\n").filter(Boolean),
    };
  }, [records]);

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
  const share = useShareAction({ section: "HI", title: "Random sher", textLines: [], url: "" });
  const handleShareClick = async (shaerData: Shaer, id: string): Promise<void> => {
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const url = `${origin}/HI#${id}`;
      const title = shaerData.shaer;
      const textLines = [...shaerData.sherHead];
      await share.handleShare({ url, title, textLines });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };
  const [insideBrowser, setInsideBrowser] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
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
      {(isLoading || !insideBrowser) && <Loader></Loader>}
      {insideBrowser && !isLoading && randomData && (
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

export default RandCard;
