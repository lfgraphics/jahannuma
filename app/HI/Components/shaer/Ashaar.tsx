"use client";
import DefaultAshaar from "@/app/Components/shaer/Ashaar";
import { LanguageProvider } from "@/contexts/LanguageContext";
import React from "react";

interface AshaareProps {
  takhallus: string;
}

const Ashaar: React.FC<AshaareProps> = ({ takhallus }) => {
  return (
    <LanguageProvider>
      <div dir="ltr">
        <DefaultAshaar takhallus={takhallus} />
      </div>
    </LanguageProvider>
  );
};

export default Ashaar;