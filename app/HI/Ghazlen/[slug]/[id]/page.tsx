"use client";
import ComponentsLoader from "@/app/Components/shaer/ComponentsLoader";
import type { GhazlenRecord } from "@/app/types";
import LoginRequiredDialog from "@/components/ui/login-required-dialog";
import useAuthGuard from "@/hooks/useAuthGuard";
import { useGhazlenData } from "@/hooks/useGhazlenData";
import { buildIdFilter, formatGhazlenRecord } from "@/lib/airtable-utils";
import AOS from "aos";
import "aos/dist/aos.css";
import { toJpeg } from "html-to-image";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";

const Page: React.FC = () => {
  const params = useParams();
  const id = params?.id as string | undefined;
  const mainRef = useRef<HTMLDivElement | null>(null);
  const { requireAuth, showLoginDialog, setShowLoginDialog, pendingAction } = useAuthGuard();
  const [isDownloading, setIsDownloading] = React.useState(false);

  // Early return if no ID is provided
  if (!id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-red-600 mb-4" dir="rtl">
            غلط لنک
          </h2>
          <p className="text-gray-600 mb-6" dir="rtl">
            غزل کی شناخت نہیں ملی۔ براہ کرم صحیح لنک استعمال کریں۔
          </p>
          <Link
            href="/Ghazlen"
            className="px-4 py-2 bg-[#984A02] text-white rounded hover:bg-[#7a3a02] transition-colors"
          >
            تمام غزلیں دیکھیں
          </Link>
        </div>
      </div>
    );
  }

  useEffect(() => {
    AOS.init({ offset: 50, delay: 0, duration: 300 });
  }, []);

  // Use the more efficient useGhazlenData hook with ID filter
  const { records, isLoading, error } = useGhazlenData({
    filterByFormula: buildIdFilter(id),
    pageSize: 1,
  });

  const rec = records?.[0];
  const formatted = useMemo(() => (rec ? formatGhazlenRecord(rec) : undefined), [rec]);
  const data = formatted?.fields as GhazlenRecord | undefined;

  // Improved loading and error state logic
  const hasError = !!error;
  const hasData = !!data;
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
    setIsDownloading(true);
    try {
      // Hide elements we don't want in the capture
      const elementsToHide = document.querySelectorAll<HTMLElement>(".ghazalHead, .unwan");
      elementsToHide.forEach((el) => (el.style.visibility = "hidden"));

      const mainElement = mainRef.current;
      if (!mainElement) {
        console.error("Main content element not found.");
        toast.error("تصویر ڈاؤنلوڈ کے وقت خرابی ہوئی ہے");
        return;
      }

      // Read computed colors from the element so the capture matches the current theme exactly
      const cs = window.getComputedStyle(mainElement);
      const computedBg = cs.backgroundColor || "#ffffff";
      const computedFg = cs.color || "#000000";

      // Helper: parse rgb/rgba/hsl/hsla strings to [r,g,b] in 0..255
      const parseToRgb = (input: string): [number, number, number] => {
        try {
          // Quick path for rgb/rgba
          const mRgb = input.match(/rgba?\(([^)]+)\)/i);
          if (mRgb) {
            const parts = mRgb[1].split(",").map((s) => s.trim());
            const r = Math.max(0, Math.min(255, parseFloat(parts[0])));
            const g = Math.max(0, Math.min(255, parseFloat(parts[1])));
            const b = Math.max(0, Math.min(255, parseFloat(parts[2])));
            return [r, g, b];
          }
          // hsl/hsla: hsl(0 0% 100%) or hsl(0, 0%, 100%) variants
          const mHsl = input.match(/hsla?\(([^)]+)\)/i);
          if (mHsl) {
            const raw = mHsl[1].replace(/,/g, " ").split(/\s+/).filter(Boolean);
            const h = parseFloat(raw[0]) || 0;
            const s = parseFloat((raw[1] || "0").replace("%", "")) / 100;
            const l = parseFloat((raw[2] || "0").replace("%", "")) / 100;
            // convert HSL to RGB
            const c = (1 - Math.abs(2 * l - 1)) * s;
            const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
            const m = l - c / 2;
            let r1 = 0, g1 = 0, b1 = 0;
            if (h < 60) { r1 = c; g1 = x; b1 = 0; }
            else if (h < 120) { r1 = x; g1 = c; b1 = 0; }
            else if (h < 180) { r1 = 0; g1 = c; b1 = x; }
            else if (h < 240) { r1 = 0; g1 = x; b1 = c; }
            else if (h < 300) { r1 = x; g1 = 0; b1 = c; }
            else { r1 = c; g1 = 0; b1 = x; }
            const r = Math.round((r1 + m) * 255);
            const g = Math.round((g1 + m) * 255);
            const b = Math.round((b1 + m) * 255);
            return [r, g, b];
          }
        } catch { }
        // Fallback default
        return [255, 255, 255];
      };

      const [br, bgc, bb] = parseToRgb(computedBg);
      const bgIsLight = (0.2126 * (br / 255) + 0.7152 * (bgc / 255) + 0.0722 * (bb / 255)) > 0.6;

      // Ensure good contrast regardless of theme: temporary overlay while capturing
      const overlay = document.createElement("div");
      overlay.style.position = "absolute";
      overlay.style.inset = "0";
      overlay.style.background = computedBg; // force the computed background
      overlay.style.opacity = "0"; // keep invisible so it doesn't cover text
      overlay.style.zIndex = "-1"; // place behind content
      overlay.setAttribute("aria-hidden", "true");
      mainElement.style.position = mainElement.style.position || "relative";
      mainElement.appendChild(overlay);

      // Force inline colors on the container to avoid CSS variable resolution issues in html-to-image
      const prevBg = mainElement.style.backgroundColor;
      const prevColor = mainElement.style.color;
      mainElement.style.backgroundColor = computedBg;
      mainElement.style.color = computedFg;

      try {
        // High quality capture with html-to-image
        const pixelRatio = 2; // upscale for sharper output
        const dataUrl = await toJpeg(mainElement, {
          cacheBust: true,
          pixelRatio,
          // No extra style overrides; we inlined resolved colors on the container instead
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
        // Resolve muted-foreground color for better visibility in dark mode
        const resolveMutedColor = (alpha: number) => {
          try {
            const tmp = document.createElement("span");
            tmp.style.position = "absolute";
            tmp.style.visibility = "hidden";
            // Try rgb(var(--muted-foreground)) first (Tailwind v4 tokens)
            tmp.style.color = "rgb(var(--muted-foreground))";
            document.body.appendChild(tmp);
            let c = window.getComputedStyle(tmp).color || "";
            if (!c || c === "rgba(0, 0, 0, 0)") {
              // Fallback to hsl(var(--muted-foreground))
              tmp.style.color = "hsl(var(--muted-foreground))";
              c = window.getComputedStyle(tmp).color || c;
            }
            tmp.remove();
            const [r, g, b] = parseToRgb(c);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
          } catch {
            // Fallback to computed text color with requested alpha
            const [r, g, b] = parseToRgb(computedFg);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
          }
        };
        // 60% opacity for watermark in dark mode; keep prior 0.18 in light mode
        const wmFillStyle = bgIsLight ? `rgba(0,0,0,0.18)` : resolveMutedColor(0.6);
        const angle = (-30 * Math.PI) / 180; // radians
        const diagonal = Math.sqrt(canvas.width ** 2 + canvas.height ** 2);
        const baseStep = Math.max(150, Math.floor(canvas.width / 5));
        // Reduce density by 30% => increase spacing by 30%
        const step = Math.floor(baseStep * 1.3);

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(angle);
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = wmFillStyle;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        for (let x = -diagonal; x < diagonal; x += step) {
          for (let y = -diagonal; y < diagonal; y += step) {
            ctx.fillText(watermarkText, x, y);
          }
        }
        ctx.restore();

        const finalUrl = canvas.toDataURL("image/jpeg");
        const a = document.createElement("a");
        document.body.appendChild(a);
        const base = sanitizeFilename((Array.isArray(data?.ghazalHead) ? data?.ghazalHead[0] : String(data?.ghazalHead ?? "")) || "ghazal");
        a.download = `${base}.jpeg`;
        a.href = finalUrl;
        a.target = "_blank";
        a.click();
        a.remove();
      } catch (error) {
        console.error("Failed to generate and download image:", error);
        toast.error("تصویر ڈاؤنلوڈ کے وقت خرابی ہوئی ہے");
      } finally {
        // Restore hidden elements and cleanup
        const elementsToHide = document.querySelectorAll<HTMLElement>(".ghazalHead, .unwan");
        elementsToHide.forEach((el) => (el.style.visibility = "visible"));
        if (overlay?.parentNode) overlay.parentNode.removeChild(overlay);
        // Restore inline styles
        if (mainElement) {
          mainElement.style.backgroundColor = prevBg;
          mainElement.style.color = prevColor;
        }
      }
    } catch (error) {
      console.error("Failed to generate and download image:", error);
      toast.error("تصویر ڈاؤنلوڈ کے وقت خرابی ہوئی ہے");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div dir="rtl" className="flex flex-col items-center">
      <div className="w-full sm:w-[400px]">
        {isLoading ? (
          <ComponentsLoader />
        ) : hasError ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-red-600 mb-4" dir="rtl">
                خرابی ہوئی ہے
              </h2>
              <p className="text-gray-600 mb-6" dir="rtl">
                غزل لوڈ کرنے میں مسئلہ ہوا ہے۔ براہ کرم دوبارہ کوشش کریں۔
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-[#984A02] text-white rounded hover:bg-[#7a3a02] transition-colors"
                >
                  دوبارہ کوشش کریں
                </button>
                <button
                  onClick={() => window.history.back()}
                  className="px-4 py-2 border border-[#984A02] text-[#984A02] rounded hover:bg-[#984A02] hover:text-white transition-colors"
                >
                  واپس جائیں
                </button>
              </div>
            </div>
          </div>
        ) : !hasData ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-gray-600 mb-4" dir="rtl">
                غزل نہیں ملی
              </h2>
              <p className="text-gray-500 mb-6" dir="rtl">
                یہ غزل دستیاب نہیں ہے یا ہٹا دی گئی ہے۔
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/Ghazlen"
                  className="px-4 py-2 bg-[#984A02] text-white rounded hover:bg-[#7a3a02] transition-colors"
                >
                  تمام غزلیں دیکھیں
                </Link>
                <button
                  onClick={() => window.history.back()}
                  className="px-4 py-2 border border-[#984A02] text-[#984A02] rounded hover:bg-[#984A02] hover:text-white transition-colors"
                >
                  واپس جائیں
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div id="main" ref={mainRef} className="p-4 mt-3 relative bg-background text-foreground">
            <div className={`ghazalHead text-2xl text-foreground text-center leading-[3rem]`}>
              {(Array.isArray(data?.ghazalHead) ? data?.ghazalHead : String(data?.ghazalHead ?? "").split("\n"))?.map((line, index) => (
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
            {(data?.enRef || data?.ref) && (
              <div className="reference mb-4 text-left border-l-4 border-gray-400 pl-3" data-aos="fade-up">
                      <h3 className="text-gray-500 text-sm mb-1">مأخذ:</h3>
                <p className="text-gray-700 text-sm">{data.enRef || data.ref}</p>
              </div>
            )}
          </div>
        )}
        {!isLoading && hasData && (
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
              onClick={() => { if (requireAuth("download")) downloadImageWithWatermark(); }}
              disabled={isDownloading}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? "ڈاؤن لوڈ ہو رہا ہے..." : "تصویر ڈاؤن لوڈ کریں"}
            </button>
          </div>
        )}
        <LoginRequiredDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} actionType={pendingAction || "download"} />
      </div>
    </div>
  );
};

export default Page;
