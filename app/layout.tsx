"use client";
import "./globals.css";
import Navbar from "@/app/Components/Navbar";
import Footer from "@/app/Components/Footer";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguage] = useState<string>("UR");

  const changeLang = () => {
    if (typeof window !== "undefined" && window.localStorage) {
      document.getElementById("redirect")?.click();
    }
  };

  const langChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (typeof window !== "undefined") {
      localStorage?.setItem("lang", event.target.value);
      setLanguage(event.target.value);
      setTimeout(changeLang, 1500);
    }
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (
        window.localStorage &&
        language !== "UR" &&
        !window.location.href.includes(language)
      ) {
        setTimeout(changeLang, 1500);
      }
    }
  }, [language]);

  const [pageTitle, setPageTitle] = useState("Jahan Numa");

  // useEffect(() => {
  //   // Update the title based on the route or URL
  //   if (window.location.href.includes("Ashaar")) {
  //     setPageTitle("Ashaar - Jahan Numa");
  //   } else if (window.location.href.includes("Ghazlen")) {
  //     setPageTitle("Ghazlen - Jahan Numa");
  //   }
  // }, [window.location.href]);
  return (
    <html lang="en">
      <head>
        <title>{pageTitle}</title>
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
        <div className="mt-[4.5rem]">{children}</div>
        <Footer language={language} />
      </body>
    </html>
  );
}
