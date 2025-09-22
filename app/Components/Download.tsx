"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { toPng } from 'html-to-image';
import { Baseline, ImagePlus, PaintBucket, Plus, Settings2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/dialog";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../../components/ui/accordion";
import { Button } from "../../components/ui/button";

// Use the unified domain type
import type { Shaer } from "../types";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { getButtonText } from "@/lib/multilingual-texts";

// Define the DynamicDownloadHandler component
const DynamicDownloadHandler: React.FC<{
  data: Shaer;
  onCancel: () => void;
}> = ({ data, onCancel }) => {
  const ghazalHeadLines = useMemo(() => {
    const head = data.fields?.ghazalHead;
    if (!head) return [] as string[];
    if (Array.isArray(head)) return head.filter(Boolean);
    return head.split("\n").filter(Boolean);
  }, [data]);
  const { language } = useLanguage();
  // State for selected background image
  const [selectedImage, setSelectedImage] = useState<string | null>(
    "/backgrounds/1.jpeg"
  );
  const [fileName, setFileName] = useState<string>("poetry");

  // Ref for the download handler container
  const downloadHandlerRef = useRef<HTMLDivElement>(null);

  // Define the array of local images
  const images: string[] = [
    "/backgrounds/1.jpeg",
    "/backgrounds/2.jpeg",
    "/backgrounds/3.jpeg",
    "/backgrounds/4.jpeg",
    "/backgrounds/5.jpeg",
    "/backgrounds/6.jpeg",
    "/backgrounds/7.jpeg",
    "/backgrounds/8.jpeg",
    "/backgrounds/9.jpeg",
    "/backgrounds/10.jpeg",
    "/backgrounds/11.jpeg",
    "/backgrounds/12.jpeg",
    "/backgrounds/13.jpeg",
    "/backgrounds/14.jpeg",
    "/backgrounds/15.jpeg",
  ];

  // Function to handle image selection
  const handleImageSelect = (image: string) => {
    setSelectedImage(image);
  };

  // Function to handle the download button click
  const download = async () => {
    // Logic to convert the selected area to image using html-to-image
    if (!downloadHandlerRef.current) return;

    // Strict filename sanitizer
    const sanitizeFilename = (input: string): string => {
      let name = (input ?? "").trim();
      // Strip common image extensions at the end
      name = name.replace(/\.(png|jpe?g|webp|gif|bmp|tiff)$/i, "");
      // Convert spaces to underscores
      name = name.replace(/\s+/g, "_");
      // Remove any character not in [A-Za-z0-9_-]
      name = name.replace(/[^A-Za-z0-9_-]/g, "");
      // Collapse multiple underscores or hyphens
      name = name.replace(/[_-]{2,}/g, (m) => m[0]);
      // Trim leading/trailing separators
      name = name.replace(/^[_-]+|[_-]+$/g, "");
      // Limit length
      if (name.length > 100) name = name.slice(0, 100);
      // Fallback
      if (!name) name = "poetry";
      return name;
    };

    // html-to-image options
    const options = {
      pixelRatio: 2,
      quality: 2,
      canvasWidth: 1080,
      canvasHeight: 1080,
      innerWidth: 1080,
      innerHeight: 1080,
    } as const;

    const downloadArea = document.getElementById("downloadArea");
    if (!downloadArea) return;

    try {
      const dataUrl = await toPng(downloadArea as HTMLElement, options as any);
      const base = sanitizeFilename(fileName || "poetry");
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.download = `${base} جہاں نما کی ویبسائٹ سے.png`;
      a.href = dataUrl;
      a.target = "_blank";
      a.click();
      a.remove();
      onCancel();
    } catch (error) {
      toast.error("تصویر ڈاؤنلوڈ کے وقت خرابی ہوئی ہے");
      console.error("Error generating image:", error);
    }
  };


  // accordian
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent className="sm:max-w-[420px] bg-background text-foreground border border-border p-0">
        <DialogHeader className="px-4 pt-4">
          <DialogTitle>تصویر ڈاؤنلوڈ</DialogTitle>
          <DialogDescription>پس منظر منتخب کریں اور تصویر محفوظ کریں</DialogDescription>
        </DialogHeader>
        <div ref={downloadHandlerRef} className="max-h-[75svh] overflow-y-auto px-4 pb-4">
          {/* Display shaer information */}
          <div
            id="downloadArea"
            className="relative text-center bg-cover bg-center text-foreground overflow-hidden aspect-square w-full max-w-[360px] mx-auto"
            style={{ backgroundImage: `url(${selectedImage || images[0]})` }}
          >
            <div className="bg-black/70 flex flex-col justify-center bg-opacity-60 relative text-white w-full h-full pt-12 p-8">
              <div>
                <p className="text-center pl-2">
                  {ghazalHeadLines.map((line, index) => (
                    <React.Fragment key={index}>
                      {line}
                      <br />
                    </React.Fragment>
                  ))}
                </p>
                <div className="m-4 text-sm">{data.fields.shaer}</div>
                <div className="absolute text-white text-lg top-4 right-6">
                  جہاں نما
                </div>
                <div className="absolute text-white text-2xl font-bold w-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-45 opacity-10 z-0">
                  Jahan Numa
                </div>
              </div>
            </div>
          </div>

          {/* Display background image selection */}
          <div className={`flex flex-col mt-2 mb-2 items-center justify-center`}>
            <p className="text-lg">پس منظر تصویر منتخب کریں </p>
            <div className="images_wraper flex w-[280px] overflow-x-auto">
              {images.map((image, index) => (
                <img
                  width={280}
                  height={280}
                  key={index}
                  src={image}
                  alt={`Image ${index}`}
                  className={`w-8 h-8 m-1 cursor-pointer transition-all duration-500 rounded-sm mt-4 ${image == selectedImage ? "border-2 border-primary scale-125" : ""}`}
                  onClick={() => handleImageSelect(image)}
                ></img>
              ))}
            </div>
            <div className="w-full mt-3">
              <label htmlFor="file-name" className="text-sm">فائل کے نام</label>
              <input
                id="file-name"
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="مثلاً: poetry"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
              />
            </div>
            <Accordion dir="rtl" type="single" collapsible className="w-full mb-4">
              <AccordionItem value="tweaks">
                <AccordionTrigger dir="rtl" className="px-3">
                  <span className="flex gap-2 items-center justify-between">مزید ترمیمی <Settings2 className="h-4 w-4" /></span>
                </AccordionTrigger>
                <AccordionContent className="border-t">
                  <div className="flex max-w-full overflow-x-auto flex-row h-[120px] gap-3 flex-wrap p-3">
                    <div onClick={() => toast.info("Coming Soon!\nجلد ہی آ رہا ہے")} className="flex flex-col gap-2 border border-border rounded-md items-center p-3 w-[120px] cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-500 ease-in-out select-none">
                      <Baseline />
                      <p className="text-xs">خط کا رنگ تبدیل کریں</p>
                    </div>
                    <div onClick={() => toast.info("Coming Soon!\nجلد ہی آ رہا ہے")} className="flex flex-col gap-2 border border-border rounded-md items-center p-3 w-[120px] cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-500 ease-in-out select-none">
                      <PaintBucket />
                      <p className="text-xs">پسِ منظر کا رنگ تبدیل کریں</p>
                    </div>
                    <div onClick={() => toast.info("Coming Soon!\nجلد ہی آ رہا ہے")} className="flex flex-col gap-2 border border-border rounded-md items-center p-3 w-[120px] cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-500 ease-in-out select-none">
                      <ImagePlus />
                      <p className="text-xs">اپنی تصویل اپلوڈ کریں</p>
                    </div>
                    <div onClick={() => toast.info("Coming Soon!\nجلد ہی آ رہا ہے")} className="flex flex-col gap-2 border border-border rounded-md items-center p-3 w-[120px] cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-500 ease-in-out select-none">
                      <Plus />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Display buttons for download and cancel */}
          <div className="flex justify-around gap-3 mt-4 px-4 pb-4 flex-row-reverse">
            <Button onClick={download} className="bg-primary text-primary-foreground hover:bg-primary/90">ڈاؤنلوڈ کریں</Button>
            <Button onClick={onCancel} variant="outline">منسوخ کریں</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DynamicDownloadHandler;