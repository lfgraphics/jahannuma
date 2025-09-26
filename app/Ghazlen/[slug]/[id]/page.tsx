"use client";
import Link from "next/link";
import React, { useEffect, useMemo, useRef } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import ComponentsLoader from "@/app/Components/shaer/ComponentsLoader";
import { toPng } from "html-to-image";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useAirtableList } from "@/hooks/useAirtableList";
import { useAirtableRecord } from "@/hooks/useAirtableRecord";
import type { AirtableRecord, GhazlenRecord } from "@/app/types";
import { buildIdFilter, formatGhazlenRecord } from "@/lib/airtable-utils";

const BASE_ID = "appvzkf6nX376pZy6";
const TABLE = "Ghazlen";

const Page: React.FC = () => {
  const params = useParams();
  const id = params?.id as string | undefined;
  const mainRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    AOS.init({ offset: 50, delay: 0, duration: 300 });
  }, []);

  const { records, isLoading: listLoading, error: listError } = useAirtableList<AirtableRecord<any>>(BASE_ID, TABLE, {
    filterByFormula: id ? buildIdFilter(id) : undefined,
    pageSize: 1,
  });
  const { data: recordData, isLoading: recordLoading, error: recordError } = useAirtableRecord<AirtableRecord<any>>(BASE_ID, TABLE, id || "");

  const rec = (records?.[0] ?? (recordData as AirtableRecord<any> | undefined));
  const formatted = useMemo(() => (rec ? formatGhazlenRecord(rec) : undefined), [rec]);
  const data = formatted?.fields as GhazlenRecord | undefined;
  const ghazalLines = useMemo(() => (Array.isArray(data?.ghazal) ? data?.ghazal : String(data?.ghazal ?? "").split("\n")), [data?.ghazal]);
  const anaween = useMemo(() => (Array.isArray(data?.unwan) ? data?.unwan : String(data?.unwan ?? "").split("\n")), [data?.unwan]);

  const visitGhazlen = () => {
    if (typeof window !== "undefined") {
      const referrer = document.referrer || "";
      if (!referrer.includes("/Ghazlen")) {
        window.location.href = `${window.location.origin}/Ghazlen`;
      } else {
        window.history.back();
      }
    }
  };

  // Sanitize filename to safe ASCII with underscore separators
  const sanitizeFilename = (input: string): string => {
    let name = (input ?? "").trim();
    name = name.replace(/\.(png|jpe?g|webp|gif|bmp|tiff)$/i, "");
    name = name.replace(/\s+/g, "_");
    name = name.replace(/[^A-Za-z0-9_-]/g, "");
    name = name.replace(/[_-]{2,}/g, (m) => m[0]);
    name = name.replace(/^[_-]+|[_-]+$/g, "");
    if (name.length > 100) name = name.slice(0, 100);
    if (!name) name = "ghazal";
    return name;
  };

  const downloadImageWithWatermark = async () => {
    // Hide elements we don't want in the capture
    const elementsToHide = document.querySelectorAll<HTMLElement>(".ghazalHead, .unwan");
    elementsToHide.forEach((el) => (el.style.visibility = "hidden"));

    const mainElement = mainRef.current;
    if (!mainElement) {
      console.error("Main content element not found.");
      return;
    }

    // Ensure good contrast regardless of theme: temporary overlay while capturing
    const overlay = document.createElement("div");
    overlay.style.position = "absolute";
    overlay.style.inset = "0";
    overlay.style.background = "var(--background, transparent)"; // respects Tailwind theme tokens if present
    overlay.style.opacity = "0"; // keep invisible; presence can help layout stabilize in some cases
    overlay.setAttribute("aria-hidden", "true");
    mainElement.style.position = mainElement.style.position || "relative";
    mainElement.appendChild(overlay);

    try {
      // High quality capture with html-to-image
      const pixelRatio = 2; // upscale for sharper output
      const dataUrl = await toPng(mainElement, {
        cacheBust: true,
        pixelRatio,
        style: {
          // Normalize colors to theme tokens so both themes stay legible
          color: "rgb(var(--foreground))",
          backgroundColor: "rgb(var(--background))",
        },
        filter: (node: HTMLElement) => {
          // Exclude elements explicitly hidden or marked decorative
          const el = node as HTMLElement;
          if (el && (el.classList?.contains("sr-only") || el.getAttribute?.("aria-hidden") === "true")) return false;
          return true;
        },
      } as any);

      // If a diagonal watermark is desired, draw it on a canvas over the image
      const baseImage = new Image();
      baseImage.crossOrigin = "anonymous";
      const loaded = await new Promise<HTMLImageElement>((resolve, reject) => {
        baseImage.onload = () => resolve(baseImage);
        baseImage.onerror = (e) => reject(e);
        baseImage.src = dataUrl;
      });

      const canvas = document.createElement("canvas");
      canvas.width = loaded.naturalWidth;
      canvas.height = loaded.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context not available");

      ctx.drawImage(loaded, 0, 0);

      const watermarkText = "jahan-numa.org";
      const fontSize = Math.max(16, Math.floor(canvas.width / 40));
      const opacity = 0.1;
      const angle = (-30 * Math.PI) / 180; // radians
      const diagonal = Math.sqrt(canvas.width ** 2 + canvas.height ** 2);
      const step = Math.max(160, Math.floor(canvas.width / 6));

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(angle);
      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let x = -diagonal; x < diagonal; x += step) {
        for (let y = -diagonal; y < diagonal; y += step) {
          ctx.fillText(watermarkText, x, y);
        }
      }
      ctx.restore();

      const finalUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      document.body.appendChild(a);
  const base = sanitizeFilename((Array.isArray(data?.ghazalHead) ? data?.ghazalHead[0] : String(data?.ghazalHead ?? "")) || "ghazal");
      a.download = `${base}.png`;
      a.href = finalUrl;
      a.target = "_blank";
      a.click();
      a.remove();
    } catch (error) {
      console.error("Failed to generate and download image:", error);
      toast.error("تصویر ڈاؤنلوڈ کے وقت خرابی ہوئی ہے");
    } finally {
      // Restore hidden elements and cleanup
      elementsToHide.forEach((el) => (el.style.visibility = "visible"));
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }
  };

  return (
    <div dir="rtl" className="flex flex-col items-center">
      <div className="w-full sm:w-[400px]">
        {(listLoading && recordLoading) ? (
          <ComponentsLoader />
        ) : (
          <div id="main" ref={mainRef} className="p-4 mt-3 relative bg-background text-foreground">
            <div className={`ghazalHead text-2xl text-foreground text-center leading-[3rem]`}>
              {(Array.isArray(data?.ghazalHead) ? data?.ghazalHead : String(data?.ghazalHead ?? "").split("\n")).map((line, index) => (
                <h2 key={index} className="text-foreground">
                  {line}
                </h2>
              ))}
            </div>
            <div className="shaer mb-3 text-[#984A02]">
              <Link href={`/Shaer/${data?.shaer ?? ""}`}>
                <h2>{data?.shaer}</h2>
              </Link>
            </div>
            <div className="w-[100%] h-[1px] mb-4 bg-gray-500 "></div>
            <div className="text-2xl mb-4 flex flex-col justify-center">
              {ghazalLines?.map((line, index) => (
                <p
                  data-aos="fade-up"
                  key={index}
                  className="justif w-full px-10 text-foreground pb-3 text-2xl [&]:text-[length:clamp(1rem,2vw,1.5rem)] break-words"
                >
                  {line}
                </p>
              ))}
            </div>
            <div className="flex gap-5 text-md mb-4 justify-center" data-aos="fade-up">
              {anaween?.map((unwan, index) => (
                <Link
                  href={`/Ghazlen/mozu/${unwan}`}
                  className={`unwan text-blue-500 underline cursor-pointer`}
                  style={{ lineHeight: "normal" }}
                  key={index}
                >
                  {unwan}
                </Link>
              ))}
            </div>
          </div>
        )}
        {!(listLoading && recordLoading) && (
          <div className="mazeed flex mb-4 justify-around" data-aos="fade-up">
            <button
              onClick={visitGhazlen}
              className="bg-white text-[#984A02] border active:bg-[#984a02ac] active:text-white border-[#984A02] px-4 py-2 rounded-md"
            >
              مزید غزلیں
            </button>
            <Link
              scroll={false}
              href={`/Ghazlen/shaer/${(data?.shaer || "").replace(" ", "_")}`}
              className="text-blue-600 underline"
            >
              {data?.shaer} کی مزید غزلیں
            </Link>
            <button
              onClick={downloadImageWithWatermark}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
            >
              تصویر ڈاؤن لوڈ کریں
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
