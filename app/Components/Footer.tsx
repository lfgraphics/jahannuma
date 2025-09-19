"use client";
import React, { useState } from "react";
import {
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import ContactForm from "./ContactForm";
import { pages } from "./Navbar";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

// import { language, setLanguage } from "@/app/Components/Navbar"; // Import the exported variables
interface FooterProps {
  language: string;
}

const Footer: React.FC<FooterProps> = ({ language }) => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // This provides a smooth scrolling effect
    });
  };

  const urduNavs = [
    "پسندیدہ",
    "شاعر",
    "آشار",
    "ای-بکس",
    "غزلیں",
    "نظمیں",
    "بلاگز",
    "انٹرویوز",
  ];

  const englishNavs = [
    "Favorites",
    "Poet",
    "Verses",
    "E-Books",
    "Ghazals",
    "Poems",
    "Blogs",
    "Interviews",
  ];

  const hindiNavs = [
    "पसंदीदा",
    "कवि",
    "छंद",
    "ई-बुक्स",
    "ग़ज़लें",
    "कविताएँ",
    "ब्लॉग्स",
    "साक्षात्कार",
  ];

  const NavsToDisplay =
    language === "EN" ? englishNavs : language === "HI" ? hindiNavs : urduNavs;

  const quickLinks = [
    { EN: "Founders", HI: "मालिक की मालूमात", UR: "بانی و سرپرست" },
    { EN: "", HI: "", UR: "" },
    { EN: "", HI: "", UR: "" },
  ];

  return (
    <footer
      dir={language === "UR" ? "rtl" : "ltr"}
      className="bg-[#F0D586] p-10 text-[#984A02]"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ContactForm language={language}></ContactForm>

        {/* <!-- Navigation Section --> */}
        <div>
          <h6 className="text-xl font-semibold mb-4">Navigation</h6>
          <ul className="space-y-2">
            {pages.map((page) => (
              <li
                key={page.EN}
                className="text-[#984A02] hover:text-[#0E88D6] font-medium text-xl mr-2"
              >
                <Link
                  href={`/${
                    language === "UR" ? page.EN : `${language}/${page.EN}`
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
                <Link
                  href={`/${
                    language === "UR" ? link.EN : `${language}/${link.EN}`
                  }`}
                  className="hover:underline"
                >
                  {(link as any)[language]}
                </Link>
              </li>
            ))}
          </ul>

          <h6 className="text-xl font-semibold mt-8 mb-4">Follow Us</h6>
          <div className="flex space-x-4 text-[#984A02]">
            <a
              href="https://www.facebook.com/profile.php?id=61555317448004&mibextid=ZbWKwL"
              className="hover:text-[#984A02]"
            >
              <Facebook />
            </a>
            <a
              href="https://www.instagram.com/jahannuma_official?igsh=aDdhdXV6OWtmZzRt"
              className="hover:text-[#984A02]"
            >
              <Instagram />
            </a>
            <a
              href="https://x.com/Jahan_Numa_?t=ivx39tbEyxGPMqV86zjviQ&s=08"
              className="hover:text-[#984A02]"
            >
              <Twitter />
            </a>
            <a href="#" className="hover:text-[#984A02]">
              <Linkedin />
            </a>
          </div>
        </div>
      </div>

      {/* <!-- Copyright Notice --> */}
      <div className="text-center mt-8">
        <p>&copy; 2024 JahanNuman. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
