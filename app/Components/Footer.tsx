"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { navPages } from "@/lib/multilingual-texts";
import { Facebook, Instagram, Twitter, YoutubeIcon } from "lucide-react";
import Link from "next/link";
import React from "react";
import ContactForm from "./ContactForm";

const Footer: React.FC = () => {
  const { language } = useLanguage();
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // This provides a smooth scrolling effect
    });
  };

  const quickLinks = [
    { EN: "Founders", HI: "मालिक की मालूमात", UR: "بانی و سرپرست" },
    { EN: "", HI: "", UR: "" },
    { EN: "", HI: "", UR: "" },
  ];

  return (
    <footer dir={language === "UR" ? "rtl" : "ltr"} className="bg-secondary p-10 text-primary">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ContactForm language={language}></ContactForm>

        {/* <!-- Navigation Section --> */}
        <div>
          <h6 className="text-xl font-semibold mb-4">Navigation</h6>
          <ul className="space-y-2">
            {navPages.map((page) => (
              <li
                key={page.EN}
                className="text-primary hover:text-accent-blue font-medium text-xl mr-2"
              >
                <Link
                  href={`/${language === "UR" ? page.EN : `${language}/${page.EN}`
                    }`}
                >
                  {(page as any)[language]}
                </Link>
              </li>
            ))}
          </ul>

          {/* <!-- Contact Info --> */}
          <h6 className="text-xl font-semibold mt-8 mb-4">Contact Info</h6>
          <address>
            <p>Email: jahannuma1.7@gmail.com</p>
            {/* <p>Phone: +123 456 789</p> */}
          </address>
        </div>

        {/* <!-- Quick Links & Social Media --> */}
        <div>
          <h6 className="text-xl font-semibold mb-4">Quick Links</h6>
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
                {language === "UR" ? "پرائیویسی پالیسی" : language === "HI" ? "गोपनीयता नीति" : "Privacy Policy"}
              </Link>
            </li>
            <li>
              <Link
                href={`/${language === "UR" ? "terms&conditions" : `${language}/terms&conditions`}`}
                className="hover:underline"
              >
                {language === "UR" ? "شرائط و ضوابط" : language === "HI" ? "नियम और शर्तें" : "Terms & Conditions"}
              </Link>
            </li>
          </ul>

          <h6 className="text-xl font-semibold mt-8 mb-4">Follow Us</h6>
          <div className="flex space-x-4 text-primary">
            <a
              href="https://www.facebook.com/profile.php?id=61555317448004&mibextid=ZbWKwL"
              className="hover:text-primary"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href="https://www.instagram.com/jahan_numa_official_"
              className="hover:text-primary"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="https://x.com/Jahan_Numa_?t=ivx39tbEyxGPMqV86zjviQ&s=08"
              className="hover:text-primary"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a href="https://www.youtube.com/@jahannuma." className="hover:text-primary">
              <YoutubeIcon className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>

      {/* <!-- Copyright Notice --> */}
      <div className="text-center mt-8">
        <p>&copy; 2024 JahanNuman. All Rights Reserved.</p>
        <br />
        <a href="https://www.codvista.com" target="_blank">
          <p className="text-sm">Under Development by <span className="text-purple-700"> Cod Vista</span></p>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
