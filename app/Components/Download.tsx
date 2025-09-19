"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import html2canvas from "html2canvas";
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
  // State for selected background image
  const [selectedImage, setSelectedImage] = useState<string | null>(
    "/backgrounds/1.jpeg"
  );

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
  const download = () => {
    // Logic to convert the selected area to image using html2canvas
    if (downloadHandlerRef.current) {
      const options = {
        quality: 10, // Adjust this value as needed
      };

      html2canvas(
        document.getElementById("downloadArea")!,
        { ...options, scale: 2 } // Increase the scale here
      ).then(function (canvas) {
        var anchorTag = document.createElement("a");
        document.body.appendChild(anchorTag);
        anchorTag.download = `${prompt(
          "محفوظ کرنے کے لیے تصویر کا نام درج کریں"
        )} جہاں نما کی ویبسائٹ سے.png`;
        anchorTag.href = canvas.toDataURL();
        anchorTag.target = "_blank";
        anchorTag.click();
        onCancel();
      });
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
        <div ref={downloadHandlerRef} className="max-h-[85svh] overflow-y-auto px-4 pb-4">
          {/* Display shaer information */}
          <div
            id="downloadArea"
            className="relative text-center bg-cover bg-center text-black overflow-hidden aspect-square w-full max-w-[360px] mx-auto"
            style={{ backgroundImage: `url(${selectedImage || images[0]})` }}
          >
            <div className="bg-black flex flex-col justify-center bg-opacity-60 relative text-white w-full h-full pt-12 p-8">
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
                  className={`w-8 h-8 m-1 cursor-pointer transition-all duration-500 rounded-sm mt-4 ${image == selectedImage
                      ? "border-2 border-[#984A02] scale-125"
                      : ""
                    }`}
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
                  <div className="flex max-w-full overflow-x-auto flex-row h-[120px] gap-3 flex-wrap p-3">
                    <div onClick={() => alert("Coming Soon!\nجلد ہی آ رہا ہے")} className="flex flex-col gap-2 border border-border rounded-md items-center p-3 w-[120px] cursor-pointer hover:bg-[#984A02] hover:text-white transition-all duration-500 ease-in-out select-none">
                      <Baseline />
                      <p className="text-xs">خط کا رنگ تبدیل کریں</p>
                    </div>
                    <div onClick={() => alert("Coming Soon!\nجلد ہی آ رہا ہے")} className="flex flex-col gap-2 border border-border rounded-md items-center p-3 w-[120px] cursor-pointer hover:bg-[#984A02] hover:text-white transition-all duration-500 ease-in-out select-none">
                      <PaintBucket />
                      <p className="text-xs">پسِ منظر کا رنگ تبدیل کریں</p>
                    </div>
                    <div onClick={() => alert("Coming Soon!\nجلد ہی آ رہا ہے")} className="flex flex-col gap-2 border border-border rounded-md items-center p-3 w-[120px] cursor-pointer hover:bg-[#984A02] hover:text-white transition-all duration-500 ease-in-out select-none">
                      <ImagePlus />
                      <p className="text-xs">اپنی تصویل اپلوڈ کریں</p>
                    </div>
                    <div onClick={() => alert("Coming Soon!\nجلد ہی آ رہا ہے")} className="flex flex-col gap-2 border border-border rounded-md items-center p-3 w-[120px] cursor-pointer hover:bg-[#984A02] hover:text-white transition-all duration-500 ease-in-out select-none">
                      <Plus />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Display buttons for download and cancel */}
          <div className="flex justify-around gap-3 mt-4 px-4 pb-4 flex-row-reverse">
            <Button onClick={download} className="bg-[#984A02] text-white hover:bg-[#8a4202]">ڈاؤنلوڈ کریں</Button>
            <Button onClick={onCancel} variant="outline">منسوخ کریں</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DynamicDownloadHandler;
