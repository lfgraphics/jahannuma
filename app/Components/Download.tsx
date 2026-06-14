"use client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import LoginRequiredDialog from "@/components/ui/login-required-dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import useAuthGuard from "@/hooks/useAuthGuard";
import { getLanguageFieldValue } from "@/lib/language-field-utils";
import { toPng } from 'html-to-image';
import { Baseline, ImagePlus, PaintBucket, Plus, Settings2 } from "lucide-react";
import React, { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import PromptDialog from "../../components/ui/prompt-dialog";

// Use the unified domain type
// Accept a minimal shaer-like shape to avoid strict coupling
type MinimalDownloadData = {
  id: string;
  fields?: {
    shaer?: string;
    enShaer?: string;
    hiShaer?: string;
    ghazalHead?: string | string[];
    enGhazalHead?: string | string[];
    hiGhazalHead?: string | string[];
  };
};

// Define the DynamicDownloadHandler component
const DynamicDownloadHandler: React.FC<{
  data: MinimalDownloadData;
  onCancel: () => void;
}> = ({ data, onCancel }) => {
  const { language } = useLanguage();
  const isRTL = language === "UR";
  const localizedShaer = useMemo(
    () => getLanguageFieldValue<string>(data.fields ?? {}, "shaer", language) ?? "",
    [data.fields, language]
  );
  const ghazalHeadLines = useMemo(() => {
    const head = getLanguageFieldValue<string | string[]>(
      data.fields ?? {},
      "ghazalHead",
      language
    );
    if (!head) return [] as string[];
    if (Array.isArray(head)) return head.filter(Boolean);
    return head.split("\n").map((line) => line.trim()).filter(Boolean);
  }, [data.fields, language]);
  const copy = useMemo(() => {
    switch (language) {
      case "EN":
        return {
          defaultFileName: "poetry",
          title: "Download Image",
          description: "Choose a background and save the quote image.",
          siteLabel: "Jahannuma",
          selectBackground: "Choose a background image",
          tweaks: "Customize",
          changeFontColor: "Change text color",
          changeBackgroundColor: "Change background color",
          uploadImage: "Upload your own image",
          comingSoon: "Coming soon",
          download: "Download",
          cancel: "Cancel",
          fileNameTitle: "File name",
          fileNameDescription: "Enter a file name without extension.",
          fileNamePlaceholder: "For example: poetry",
          save: "Save",
          downloadError: "Something went wrong while downloading the image.",
        };
      case "HI":
        return {
          defaultFileName: "kavita",
          title: "तस्वीर डाउनलोड करें",
          description: "पसंदीदा पृष्ठभूमि चुनें और तस्वीर सहेजें।",
          siteLabel: "जहाँ नुमा",
          selectBackground: "पृष्ठभूमि तस्वीर चुनें",
          tweaks: "संपादन",
          changeFontColor: "लिखावट का रंग बदलें",
          changeBackgroundColor: "पृष्ठभूमि का रंग बदलें",
          uploadImage: "अपनी तस्वीर अपलोड करें",
          comingSoon: "जल्द आ रहा है",
          download: "डाउनलोड करें",
          cancel: "रद्द करें",
          fileNameTitle: "फाइल का नाम",
          fileNameDescription: "बिना एक्सटेंशन के फाइल का नाम लिखें।",
          fileNamePlaceholder: "जैसे: kavita",
          save: "सहेजें",
          downloadError: "तस्वीर डाउनलोड करते समय गड़बड़ी हुई।",
        };
      default:
        return {
          defaultFileName: "poetry",
          title: "تصویر ڈاؤنلوڈ",
          description: "پس منظر منتخب کریں اور تصویر محفوظ کریں",
          siteLabel: "جہاں نما",
          selectBackground: "پس منظر تصویر منتخب کریں",
          tweaks: "ترمیم",
          changeFontColor: "خط کا رنگ تبدیل کریں",
          changeBackgroundColor: "پسِ منظر کا رنگ تبدیل کریں",
          uploadImage: "اپنی تصویر اپلوڈ کریں",
          comingSoon: "جلد آ رہا ہے",
          download: "ڈاؤنلوڈ کریں",
          cancel: "منسوخ کریں",
          fileNameTitle: "فائل کے نام",
          fileNameDescription: "براہ کرم فائل کے نام درج کریں (بغیر ایکسٹینشن)",
          fileNamePlaceholder: "مثلاً: poetry",
          save: "محفوظ کریں",
          downloadError: "تصویر ڈاؤنلوڈ کے وقت خرابی ہوئی ہے",
        };
    }
  }, [language]);
  // State for selected background image
  const [selectedImage, setSelectedImage] = useState<string | null>(
    "/backgrounds/1.jpeg"
  );
  const [fileName, setFileName] = useState<string>(copy.defaultFileName);
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
      const base = sanitizeFilename(fileName || copy.defaultFileName);
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.download = `${base}-jahannuma.png`;
      a.href = dataUrl;
      a.target = "_blank";
      a.click();
      a.remove();
      onCancel();
    } catch (error) {
      toast.error(copy.downloadError);
      console.error("Error generating image:", error);
    }
  };

  return (
    <>
      <Dialog open={true} onOpenChange={(open) => { if (!open) onCancel(); }}>
        <DialogContent className="sm:max-w-[380px] bg-background text-foreground border border-border p-0">
          <DialogHeader className="px-3 pt-3 mx-auto">
            <DialogTitle className="text-center">{copy.title}</DialogTitle>
            <DialogDescription>{copy.description}</DialogDescription>
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
                  <div className="m-3 text-xs">{localizedShaer}</div>
                  <div className={`absolute text-white text-sm top-3 ${isRTL ? "right-4" : "left-4"}`}>
                    {copy.siteLabel}
                  </div>
                  <div className="absolute text-white text-xl font-bold w-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-45 opacity-10 z-0">
                    Jahan Numa
                  </div>
                </div>
              </div>
            </div>

            {/* Display background image selection */}
            <div className={`flex flex-col mt-2 mb-2 items-center justify-center`}>
              <p className="text-base">{copy.selectBackground}</p>
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
              <Accordion dir={isRTL ? "rtl" : "ltr"} type="single" collapsible className="w-full mb-4">
                <AccordionItem value="tweaks">
                  <AccordionTrigger dir={isRTL ? "rtl" : "ltr"} className="px-3">
                    <span className="flex gap-2 items-center justify-between">{copy.tweaks} <Settings2 className="h-4 w-4" /></span>
                  </AccordionTrigger>
                  <AccordionContent className="border-t">
                    <div className="flex max-w-full overflow-x-auto flex-row h-[110px] gap-2 flex-wrap p-3">
                      <div onClick={() => toast.info(copy.comingSoon)} className="flex flex-col gap-2 border border-border rounded-md items-center p-2 w-[110px] cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-500 ease-in-out select-none">
                        <Baseline />
                        <p className="text-xs">{copy.changeFontColor}</p>
                      </div>
                      <div onClick={() => toast.info(copy.comingSoon)} className="flex flex-col gap-2 border border-border rounded-md items-center p-2 w-[110px] cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-500 ease-in-out select-none">
                        <PaintBucket />
                        <p className="text-xs">{copy.changeBackgroundColor}</p>
                      </div>
                      <div onClick={() => toast.info(copy.comingSoon)} className="flex flex-col gap-2 border border-border rounded-md items-center p-2 w-[110px] cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-500 ease-in-out select-none">
                        <ImagePlus />
                        <p className="text-xs">{copy.uploadImage}</p>
                      </div>
                      <div onClick={() => toast.info(copy.comingSoon)} className="flex flex-col gap-2 border border-border rounded-md items-center p-2 w-[110px] cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-500 ease-in-out select-none">
                        <Plus />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Display buttons for download and cancel */}
            <div className={`flex justify-around gap-3 mt-3 px-3 pb-3 ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
              <Button onClick={() => { setAskNameOpen(true); }} className="bg-primary text-primary-foreground hover:bg-primary/90">{copy.download}</Button>
              <Button onClick={onCancel} variant="outline">{copy.cancel}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Filename prompt dialog */}
      <PromptDialog
        open={askNameOpen}
        title={copy.fileNameTitle}
        description={copy.fileNameDescription}
        defaultValue={fileName}
        placeholder={copy.fileNamePlaceholder}
        confirmText={copy.save}
        cancelText={copy.cancel}
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
