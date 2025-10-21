"use client";
import DefaultEBooks from "@/app/Components/shaer/EBooks";
import { LanguageProvider } from "@/contexts/LanguageContext";
import React from "react";

interface EBooksProps {
  takhallus: string;
}

const EBooks: React.FC<EBooksProps> = ({ takhallus }) => {
  return (
    <LanguageProvider>
      <div dir="ltr">
        <DefaultEBooks takhallus={takhallus} />
      </div>
    </LanguageProvider>
  );
};

export default EBooks;