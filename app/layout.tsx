"use client";
import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "@/app/Components/Navbar";
import Footer from "@/app/Components/Footer";
import { useEffect, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguage] = useState<string>("UR");

  const langChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    localStorage?.setItem("lang", event.target.value);
    setLanguage(event.target.value);
  };
  useEffect(() => {
    // Get the language from localStorage and set it in the state
    if (typeof window !== "undefined" && window.localStorage) {
      const storedLang = localStorage.getItem("lang");
      if (storedLang) {
        setLanguage(storedLang);
      } else {
        setLanguage("UR");
      }
    }
  }, []);
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />

        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#F0D586" />
      </head>
      <body className="bg-[#ffff] dark:bg-white text-black font-noto-nastaliq">
        <Navbar language={language} onLangChange={langChange} />
        <div className="mt-14">{children}</div>
        <Footer language={language} />
      </body>
    </html>
  );
}
