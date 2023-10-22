"use client";
import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "@/app/Components/Navbar";
import Footer from "@/app/Components/Footer";
import { useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguage] = useState<string>("EN");

  const langChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(event.target.value);
  };
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#F0D586" />
      </head>
      <body className={inter.className}>
        <Navbar language={language} onLangChange={langChange} />
        {children}
        <Footer language={language} />
      </body>
    </html>
  );
}
