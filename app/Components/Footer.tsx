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

  const linksByLanguage: Record<string, string[]> = {
    UR: ["صفحہ کی معلومات", "مالک کی معلومات", "پروگرامز"],
    EN: ["About_site", "About_owner", "Programs"],
    HI: ["साइट के बारे में", "मालिक के बारे में", "कार्यक्रम"],
  };

  const navs = {
    quicklinks: {
      bani: {
        UR: "بانی کا تعارف",
        EN: "Bani ka ta'aruf",
        HI: "बानी का तारुफ़",
        url: "",
      },
      srprst: {
        UR: "بانی کا تعارف",
        EN: "Bani ka ta'aruf",
        HI: "बानी का तारुफ़",
        url: "",
      },
    },
  };

  const linksToDisplay = linksByLanguage[language] || [];
  return (
    <footer className="bg-[#F0D586] p-10 text-[#984A02]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ContactForm language={language}></ContactForm>

        {/* <!-- Navigation Section --> */}
        <div>
          <h6 className="text-xl font-semibold mb-4">Navigation</h6>
          <ul className="space-y-2">
            {NavsToDisplay.map((item) => (
              <li key={item}>
                <a href={`/${item}`} className="hover:underline">
                  {item}
                </a>
              </li>
            ))}
          </ul>

          {/* <!-- Contact Info --> */}
          <h6 className="text-xl font-semibold mt-8 mb-4">Contact Info</h6>
          <address>
            <p>123 Main Street</p>
            <p>City, Country</p>
            <p>Email: example@example.com</p>
            <p>Phone: +123 456 789</p>
          </address>
        </div>

        {/* <!-- Quick Links & Social Media --> */}
        <div>
          <h6 className="text-xl font-semibold mb-4">Quick Links</h6>
          <ul className="space-y-2">
            {linksToDisplay.map((item) => (
              <li key={item}>
                <a href={`/${item}`} className="hover:underline">
                  {item}
                </a>
              </li>
            ))}
          </ul>

          <h6 className="text-xl font-semibold mt-8 mb-4">Follow Us</h6>
          <div className="flex space-x-4">
            <a
              href="https://www.facebook.com/profile.php?id=61555317448004&mibextid=ZbWKwL"
              className="hover:text-[#984A02]"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                {/* <!-- Facebook Icon SVG --> */}
              </svg>
            </a>
            <a
              href="https://www.instagram.com/jahannuma_official?igsh=aDdhdXV6OWtmZzRt"
              className="hover:text-[#984A02]"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                {/* <!-- Instagram Icon SVG --> */}
              </svg>
            </a>
            <a href="#" className="hover:text-[#984A02]">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                {/* <!-- Twitter Icon SVG --> */}
              </svg>
            </a>
            <a href="#" className="hover:text-[#984A02]">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                {/* <!-- LinkedIn Icon SVG --> */}
              </svg>
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
