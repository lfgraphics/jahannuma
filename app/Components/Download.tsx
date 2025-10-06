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
import PromptDialog from "../../components/ui/prompt-dialog";
import useAuthGuard from "@/hooks/useAuthGuard";
import LoginRequiredDialog from "@/components/ui/login-required-dialog";

// Use the unified domain type
// Accept a minimal shaer-like shape to avoid strict coupling
type MinimalDownloadData = {
  id: string;
  fields?: {
    shaer?: string;
    ghazalHead?: string | string[];
  };
};
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { getButtonText } from "@/lib/multilingual-texts";

// Define the DynamicDownloadHandler component
const DynamicDownloadHandler: React.FC<{
  data: MinimalDownloadData;
  onCancel: () => void;
}> = ({ data, onCancel }) => {
  // This component assumes the parent gated rendering with requireAuth("download").
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
  const [askNameOpen, setAskNameOpen] = useState<boolean>(false);
  const { requireAuth, showLoginDialog, setShowLoginDialog, pendingAction } = useAuthGuard();

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

  // Strict filename sanitizer
  const sanitizeFilename = (input: string): string => {
    let name = (input ?? "").trim();
    name = name.replace(/\.(png|jpe?g|webp|gif|bmp|tiff)$/i, "");
    name = name.replace(/\s+/g, "_");
    name = name.replace(/[^A-Za-z0-9_-]/g, "");
    name = name.replace(/[_-]{2,}/g, (m) => m[0]);
    name = name.replace(/^[_-]+|[_-]+$/g, "");
    if (name.length > 100) name = name.slice(0, 100);
    if (!name) name = "poetry";
    return name;
  };

  // Function to handle the download button click
  const runDownload = async () => {
    // Logic to convert the selected area to image using html-to-image
    if (!downloadHandlerRef.current) return;

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
    <>
      <Dialog open={true} onOpenChange={(open) => { if (!open) onCancel(); }}>
        <DialogContent className="sm:max-w-[380px] bg-background text-foreground border border-border p-0">
          <DialogHeader className="px-3 pt-3 mx-auto">
            <DialogTitle className="text-center" >تصویر ڈاؤنلوڈ</DialogTitle>
            <DialogDescription>پس منظر منتخب کریں اور تصویر محفوظ کریں</DialogDescription>
          </DialogHeader>
          <div ref={downloadHandlerRef} className="max-h-[70svh] overflow-y-auto px-3 pb-3">
            {/* Display shaer information */}
            <div
              id="downloadArea"
              className="relative text-center bg-cover bg-center text-foreground overflow-hidden aspect-square w-full max-w-[320px] mx-auto"
              style={{ backgroundImage: `url(${selectedImage || images[0]})` }}
            >
              <div className="bg-black/70 flex flex-col justify-center bg-opacity-60 relative text-white w-full h-full pt-10 p-6">
                <div>
                  <p className="text-center pl-2 text-sm leading-7">
                    {ghazalHeadLines.map((line, index) => (
                      <React.Fragment key={index}>
                        {line}
                        <br />
                      </React.Fragment>
                    ))}
                  </p>
                  <div className="m-3 text-xs">{data.fields?.shaer}</div>
                  <div className="absolute text-white text-sm top-3 right-4">
                    جہاں نما
                  </div>
                  <div className="absolute text-white text-xl font-bold w-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-45 opacity-10 z-0">
                    Jahan Numa
                  </div>
                </div>
              </div>
            </div>

            {/* Display background image selection */}
            <div className={`flex flex-col mt-2 mb-2 items-center justify-center`}>
              <p className="text-base">پس منظر تصویر منتخب کریں </p>
              <div className="images_wraper flex w-[260px] overflow-x-auto">
                {images.map((image, index) => (
                  <img
                    width={260}
                    height={260}
                    key={index}
                    src={image}
                    alt={`Image ${index}`}
                    className={`w-7 h-7 m-1 cursor-pointer transition-all duration-500 rounded-sm mt-3 ${image == selectedImage ? "border-2 border-primary scale-125" : ""}`}
                    onClick={() => handleImageSelect(image)}
                  ></img>
                ))}
              </div>
              <Accordion dir="rtl" type="single" collapsible className="w-full mb-4">
                <AccordionItem value="tweaks">
                  <AccordionTrigger dir="rtl" className="px-3">
                    <span className="flex gap-2 items-center justify-between">مزید ترمیمی <Settings2 className="h-4 w-4" /></span>
                  </AccordionTrigger>
                  <AccordionContent className="border-t">
                    <div className="flex max-w-full overflow-x-auto flex-row h-[110px] gap-2 flex-wrap p-3">
                      <div onClick={() => toast.info("Coming Soon!\nجلد ہی آ رہا ہے")} className="flex flex-col gap-2 border border-border rounded-md items-center p-2 w-[110px] cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-500 ease-in-out select-none">
                        <Baseline />
                        <p className="text-xs">خط کا رنگ تبدیل کریں</p>
                      </div>
                      <div onClick={() => toast.info("Coming Soon!\nجلد ہی آ رہا ہے")} className="flex flex-col gap-2 border border-border rounded-md items-center p-2 w-[110px] cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-500 ease-in-out select-none">
                        <PaintBucket />
                        <p className="text-xs">پسِ منظر کا رنگ تبدیل کریں</p>
                      </div>
                      <div onClick={() => toast.info("Coming Soon!\nجلد ہی آ رہا ہے")} className="flex flex-col gap-2 border border-border rounded-md items-center p-2 w-[110px] cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-500 ease-in-out select-none">
                        <ImagePlus />
                        <p className="text-xs">اپنی تصویل اپلوڈ کریں</p>
                      </div>
                      <div onClick={() => toast.info("Coming Soon!\nجلد ہی آ رہا ہے")} className="flex flex-col gap-2 border border-border rounded-md items-center p-2 w-[110px] cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-500 ease-in-out select-none">
                        <Plus />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Display buttons for download and cancel */}
            <div className="flex justify-around gap-3 mt-3 px-3 pb-3 flex-row-reverse">
              <Button onClick={() => { setAskNameOpen(true); }} className="bg-primary text-primary-foreground hover:bg-primary/90">ڈاؤنلوڈ کریں</Button>
              <Button onClick={onCancel} variant="outline">منسوخ کریں</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Filename prompt dialog */}
      <PromptDialog
        open={askNameOpen}
        title="فائل کے نام"
        description="براہ کرم فائل کے نام درج کریں (بغیر ایکسٹینشن)"
        defaultValue={fileName}
        placeholder="مثلاً: poetry"
        confirmText="محفوظ کریں"
        cancelText="منسوخ کریں"
        onSubmit={(val) => {
          setFileName(val);
          setAskNameOpen(false);
          // defer runDownload to next tick so dialog fully closes before capture
          setTimeout(() => runDownload(), 50);
        }}
        onCancel={() => setAskNameOpen(false)}
      />
      <LoginRequiredDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} actionType={pendingAction || "download"} />
    </>
  );
};

export default DynamicDownloadHandler;