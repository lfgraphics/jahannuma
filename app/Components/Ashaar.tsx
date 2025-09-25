"use client";
import { useEffect, useState } from "react";
import LocalGhazalCard from "./LocalDataCard";
import { toast } from "sonner";
import { XCircle } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "../../components/ui/drawer";

// import React {useEffect} from 'react'
interface Shaer {
  fields: {
    sher: string[];
    shaer: string;
    ghazalHead: string[];
    ghazal: string[];
    unwan: string[];
    likes: number;
    comments: number;
    shares: number;
    id: string;
  };
  id: string;
  createdTime: string;
}

const Ashaar = () => {
  const [data, setData] = useState<Shaer[] | null>(null);
  const [selectedCard, setSelectedCard] = useState<{
    id: string;
    fields: { shaer: string; ghazal: string[]; id: string };
  } | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openanaween, setOpenanaween] = useState<string | null>(null);
  // notifications handled by global Sonner Toaster
  const [insideBrowser, setInsideBrowser] = useState(false);

  useEffect(() => {
    let retrivedData = localStorage.getItem("Ashaar");
    let parsedData = retrivedData ? JSON.parse(retrivedData) : null;
    setData(parsedData);
  }, []);
  useEffect(() => {
    setInsideBrowser(true);
  }, []);
  const showToast = (
    msgtype: "success" | "error" | "invalid",
    message: string
  ) => {
    if (msgtype === "success") toast.success(message);
    else if (msgtype === "error") toast.error(message);
    else toast.warning(message);
  };

  const handleHeartClick = async (
    shaerData: Shaer,
    index: any,
    id: string
  ): Promise<void> => {
    toggleanaween(null);
    if (typeof window !== undefined && window.localStorage) {
      try {
        // Get the existing data from Local Storage (if any)
        const existingDataJSON = localStorage.getItem("Ashaar");

        // Parse the existing data into an array or initialize an empty array if it doesn't exist
        const existingData: Shaer[] = existingDataJSON
          ? JSON.parse(existingDataJSON)
          : [];

        // Check if the shaerData is already in the existing data
        const isDuplicate = existingData.some(
          (data) => data.id === shaerData.id
        );

        if (!isDuplicate) {
          // Add the new shaerData to the existing data array
          existingData.push(shaerData);

          // Serialize the updated data back to JSON
          const updatedDataJSON = JSON.stringify(existingData);

          // Toggle the color between "#984A02" and "grey" based on the current color
          document.getElementById(`${id}`)!.classList.remove("text-gray-500");
          document.getElementById(`${id}`)!.classList.add("text-red-600");

          localStorage.setItem("Ashaar", updatedDataJSON);
          // Optionally, you can update the UI or show a success message
          showToast(
            "success",
            "آپ کی پروفائل میں یہ شعر کامیابی کے ساتھ جوڑ دی گئی ہے۔ "
          );
          console.log(
            "آپ کی پروفائل میں یہ شعر کامیابی کے ساتھ جوڑ دی گئی ہے۔ ."
          );
        } else {
          if (
            confirm(
              "کیا آپ سچ میں اس شعر کو اپنے پسندیدہ میں سے ہٹانا چاہتے ہیں؟"
            )
          ) {
            const updatedData = existingData.filter(
              (data) => data.id !== shaerData.id
            );

            // Serialize the updated data back to JSON
            const updatedDataJSON = JSON.stringify(updatedData);

            // Toggle the color between "#984A02" and "grey" based on the current color
            document.getElementById(`${id}`)!.classList.remove("text-red-600");
            document.getElementById(`${id}`)!.classList.add("text-gray-500");

            localStorage.setItem("Ashaar", updatedDataJSON);

            // Optionally, you can update the UI or show a success message
            showToast(
              "invalid",
              "آپ کی پروفائل سے یہ شعر کامیابی کے ساتھ ہٹا دی گئی ہے۔"
            );
            console.log(
              "آپ کی پروفائل سے یہ شعر کامیابی کے ساتھ ہٹا دی گئی ہے۔"
            );
          }
        }
      } catch (error) {
        // Handle any errors that may occur when working with Local Storage
        console.error(
          "Error adding/removing data to/from Local Storage:",
          error
        );
      }
    }
  };
  //handeling sahre
  const handleShareClick = async (
    shaerData: Shaer,
    index: number
  ): Promise<void> => {
    toggleanaween(null);
    try {
      if (navigator.share) {
        navigator
          .share({
            title: shaerData.fields.shaer, // Use the shaer's name as the title
            text:
              shaerData.fields.ghazalHead.map((line) => line).join("\n") +
              `\nFound this on Jahannuma webpage\nCheckout there webpage here>> `, // Join ghazalHead lines with line breaks
            url: `${window.location.origin + "/Ashaar" + shaerData.id}`, // Get the current page's URL
          })

          .then(() => console.info("Successful share"))
          .catch((error) => console.error("Error sharing", error));
      } else {
        console.warn("Web Share API is not supported.");
      }
    } catch (error) {
      // Handle any errors that may occur when using the Web Share API
      console.error("Error sharing:", error);
    }
  };
  //opening and closing ghazal
  const handleCardClick = (shaerData: Shaer): void => {
    toggleanaween(null);
    setSelectedCard({
      id: shaerData.id,
      fields: {
        shaer: shaerData.fields.shaer,
        ghazal: shaerData.fields.ghazal,
        id: shaerData.fields.id,
      },
    });
    setDrawerOpen(true);
  };
  const handleCloseModal = (): void => {
    setSelectedCard(null);
    setDrawerOpen(false);
  };
  //checking while render, if the data is in the loacstorage then make it's heart red else leave it grey
  useEffect(() => {
    if (window !== undefined && window.localStorage) {
      const storedData = localStorage.getItem("Ashaar");
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          data &&
            data.forEach((shaerData, index) => {
              const shaerId = shaerData.id; // Get the id of the current shaerData

              // Check if the shaerId exists in the stored data
              const storedShaer = parsedData.find(
                (data: { id: string }) => data.id === shaerId
              );

              if (storedShaer) {
                // If shaerId exists in the stored data, update the card's appearance
                const cardElement = document.getElementById(shaerId);
                if (cardElement) {
                  cardElement.classList.add("text-red-600");
                }
              }
            });
        } catch (error) {
          console.error("Error parsing stored data:", error);
        }
      }
    }
  }, [data]);
  //toggling anaween box
  const toggleanaween = (cardId: string | null) => {
    setOpenanaween((prev) => (prev === cardId ? null : cardId));
  };

  return (
    <>
      {insideBrowser && (data === null || data.length === 0) && (
        <div className="w-screen h-screen grid place-items-center">
          آپ کے پسندیدہ میں کوئی شعر موجود نہیں ہیں
        </div>
      )}
      <div
        id="section"
        dir="rtl"
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 m-3`}
      >
        {insideBrowser &&
          data &&
          data.map((shaerData, index) => (
            <LocalGhazalCard
              page="ashaar"
              download={false}
              key={index}
              shaerData={shaerData}
              index={index}
              handleCardClick={handleCardClick}
              toggleanaween={toggleanaween}
              openanaween={openanaween}
              handleHeartClick={handleHeartClick}
              handleShareClick={handleShareClick}
            />
          ))}
      </div>
      <Drawer open={drawerOpen} onOpenChange={(open: boolean) => (open ? setDrawerOpen(true) : handleCloseModal())}>
        <DrawerContent className="max-h-[80vh]">
          <DrawerHeader className="sticky top-0 bg-background z-10">
            <DrawerTitle dir="rtl" className="text-center text-2xl">
              {selectedCard?.fields.shaer}
            </DrawerTitle>
            <DrawerClose className="absolute right-4 top-4" aria-label="Close">
              <XCircle className="h-6 w-6 text-muted-foreground hover:text-primary" />
            </DrawerClose>
          </DrawerHeader>
          <div dir="rtl" className="px-4 pb-6 overflow-y-auto">
            {selectedCard?.fields.ghazal.map((line, index) => (
              <p key={index} className="justif w-[320px] text-foreground pb-3 pr-4 text-2xl">
                {line}
              </p>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Ashaar;
