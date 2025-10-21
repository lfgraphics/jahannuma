"use client";
import DefaultNazmen from "@/app/Components/shaer/Nazmen";
import { LanguageProvider } from "@/contexts/LanguageContext";
import React from "react";

interface NazmenProps {
  takhallus: string;
}

const Nazmen: React.FC<NazmenProps> = ({ takhallus }) => {
  return (
    <LanguageProvider>
      <div dir="ltr">
        <DefaultNazmen takhallus={takhallus} />
      </div>
    </LanguageProvider>
  );
};

export default Nazmen;