"use client";
import DefaultGhazlen from "@/app/Components/shaer/Ghazlen";
import { LanguageProvider } from "@/contexts/LanguageContext";
import React from "react";

interface GhazlenProps {
  takhallus: string;
}

const Ghazlen: React.FC<GhazlenProps> = ({ takhallus }) => {
  return (
    <LanguageProvider>
      <div dir="ltr">
        <DefaultGhazlen takhallus={takhallus} />
      </div>
    </LanguageProvider>
  );
};

export default Ghazlen;