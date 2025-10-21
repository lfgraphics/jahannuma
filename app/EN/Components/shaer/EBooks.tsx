"use client";
import DefaultEBooks from "@/app/Components/shaer/EBooks";
import React from "react";

interface EBooksProps {
  takhallus: string;
}

const EBooks: React.FC<EBooksProps> = ({ takhallus }) => {
  return (
    <div dir="ltr">
      <DefaultEBooks takhallus={takhallus} />
    </div>
  );
};

export default EBooks;