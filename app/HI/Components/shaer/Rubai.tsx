"use client";
import DefaultRubai from "@/app/Components/shaer/Rubai";
import { LanguageProvider } from "@/contexts/LanguageContext";
import React from "react";

interface RubaiProps {
  takhallus: string;
}

const Rubai: React.FC<RubaiProps> = ({ takhallus }) => {
  return (
    <LanguageProvider>
      <div dir="ltr">
        <DefaultRubai takhallus={takhallus} />
      </div>
    </LanguageProvider>
  );
};

export default Rubai;