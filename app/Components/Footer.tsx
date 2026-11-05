"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTour } from "@/contexts/TourContext";
import { navPages } from "@/lib/multilingual-texts";
import { tourContent } from "@/lib/tour-content";
import { Compass, Facebook, Instagram, Twitter, YoutubeIcon } from "lucide-react";
import Link from "next/link";
import React from "react";
import ContactForm from "./ContactForm";

const Footer: React.FC = () => {
  const { language } = useLanguage();
  const { startTour } = useTour();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // This provides a smooth scrolling effect
    });
  };

  const quickLinks = [
    { EN: "Founders", HI: "मालिक की मालूماत", UR: "بانی و سرپرست" },
    { EN: "About_us", HI: "हमारे बारे में", UR: "ہمارے بارے میں" },
  ];

  return (
    <>
      <footer dir={language === "UR" ? "rtl" : "ltr"} className="bg-secondary p-10 text-primary">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ContactForm language={language}></ContactForm>

          {/* <!-- Navigation Section --> */}
          <div>
            <h6 className="text-xl font-semibold mb-4">
              {language === "UR" ? "نیویگیشن" : language === "HI" ? "नेविगेशन" : "Navigation"}
            </h6>
            <ul className="space-y-2">
              {navPages.map((page) => (
                <li
                  key={page.EN}
                  className="text-primary hover:text-accent-blue font-medium text-xl mr-2"
                >
                  <Link
                    href={`/${language === "UR" ? page.EN : `${language}/${page.EN}`}`}
                  >
                    {(page as any)[language]}
                  </Link>
                </li>
              ))}
            </ul>

            {/* <!-- Contact Info --> */}
            <h6 className="text-xl font-semibold mt-8 mb-4">
              {language === "UR" ? "رابطہ کی تفصیلات" : language === "HI" ? "राबते की जानकारी" : "Contact Info"}
            </h6>
            <address className="not-italic">
              <p>Email: <a href="mailto:jahannuma1.7@gmail.com">jahannuma1.7@gmail.com</a></p>
            </address>
          </div>

          {/* <!-- Quick Links & Social Media --> */}
          <div>
            <div data-tour="quick-links">
              <h6 className="text-xl font-semibold mb-4">
                {language === "UR" ? "فوری روابط" : language === "HI" ? "फ़ौरी लिंक" : "Quick Links"}
              </h6>
              <ul className="space-y-2">
                {quickLinks?.map((link, index) => (
                  <li key={index + link.EN}>
                    <Link href={`/${language === "UR" ? link.EN : `${language}/${link.EN}`}`} className="hover:underline">
                      {(link as any)[language]}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href={`/${language === "UR" ? "privacypolicy" : `${language}/privacypolicy`}`}
                    className="hover:underline"
                  >
                    {language === "UR" ? "پرائیویسی پالیسی" : language === "HI" ? "प्राइवेसी पॉलिसी" : "Privacy Policy"}
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => startTour(true)}
                    className="hover:underline flex items-center gap-1.5 cursor-pointer text-primary"
                  >
                    <Compass className="h-4 w-4" />
                    <span>{tourContent[language]?.restartTourLabel || "Website Tour"}</span>
                  </button>
                </li>
              </ul>
            </div>

            <div data-tour="social-links" className="mt-8">
              <h6 className="text-xl font-semibold mb-4">
                {language === "UR" ? "ہمیں فالو کریں" : language === "HI" ? "हमें फॉलो करें" : "Follow Us"}
              </h6>
              <div className="flex space-x-4 text-primary">
                <a
                  href="https://www.facebook.com/profile.php?id=61555317448004&mibextid=ZbWKwL"
                  className="hover:text-primary"
                  aria-label="Facebook"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="https://www.instagram.com/jahan_numa_official_"
                  className="hover:text-primary"
                  aria-label="Instagram"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="https://x.com/Jahan_Numa_?t=ivx39tbEyxGPMqV86zjviQ&s=08"
                  className="hover:text-primary"
                  aria-label="Twitter"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="https://www.youtube.com/@jahannuma."
                  className="hover:text-primary"
                  aria-label="YouTube"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <YoutubeIcon className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* <!-- Copyright Notice --> */}
      </footer>
      <div className="text-center bg-gray-800 text-white">
        <p>&copy; {new Date().getFullYear()} JahanNuman. All Rights Reserved.</p>
        <a href="https://www.codvista.com" target="_blank" rel="noopener noreferrer">
          <p className="text-sm p-2">Under Development by <span className="text-purple-700"> Cod Vista</span></p>
        </a>
      </div>
    </>
  );
};

export default Footer;
