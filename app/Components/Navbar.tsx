"use client";
import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import Link from "next/link";
import Image from "next/image";
import InstallPWAButton from "./InstallAppBtn";

// export const [language, setLanguage] = useState("EN");
interface NavbarProps {
  language: string;
  onLangChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onLangClick?: (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void;
}

const Navbar: React.FC<NavbarProps> = ({ language, onLangChange }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pages = [
    { EN: "Shaer", UR: "شعراء", HI: "शेयर" },
    { EN: "Ashaar", UR: "اشعار", HI: "अशार" },
    { EN: "Ghazlen", UR: "غزلیں", HI: "ग़ज़लें" },
    { EN: "Nazmen", UR: "نظمیں", HI: "नज़्में" },
    { EN: "E-Books", UR: "ای-بکس", HI: "ई-बुक्स" },
    { EN: "Blogs", UR: "بلاگز", HI: "ब्लॉग्स" },
    { EN: "Interviews", UR: "انٹرویوز", HI: "इंटरव्यूज़" },
    { EN: "Faviorites", UR: "پسندیدہ", HI: "पसंदीदा" },
  ];
  type Language = "EN" | "UR" | "HI";
  const handleLanguageChange = (selectedLanguage: string) => {
    const customEvent = {
      target: {
        value: selectedLanguage,
      },
    } as React.ChangeEvent<HTMLSelectElement>;
    localStorage?.setItem("lang", selectedLanguage);
    onLangChange(customEvent);
  };
  const [redirectHref, setRedirectHref] = useState(""); // Initialize redirectHref with an empty string

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      let updatedRedirectHref = currentPath;

      if (language !== "UR") {
        // Check if the current path includes /HI or /EN
        if (currentPath === "/HI" || currentPath === "/EN") {
          // Remove /HI or /EN
          updatedRedirectHref = currentPath.replace(/\/(HI|EN)/, `${language}`);
        } else {
          // Check if the current path includes a language parameter
          const languageMatch = currentPath.match(/\/(EN|HI|UR)\//);
          if (languageMatch) {
            // Remove the existing language parameter and replace it with the selected language
            updatedRedirectHref = `${origin}${currentPath.replace(
              `/${languageMatch[1]}`,
              `/${language}`
            )}`;
          } else {
            // If the current path doesn't include a language parameter, add the selected language
            updatedRedirectHref = `${origin}/${language}${currentPath}`;
          }
        }
      } else if (language === "UR") {
        // Remove /EN or /HI
        updatedRedirectHref = `${origin}${currentPath.replace(
          /\/(EN|HI)/,
          ""
        )}`;
      }

      setRedirectHref(updatedRedirectHref); // Update the state variable with the new value
    }
  }, [language]);

    useEffect(() => {
    const handlePopstate = () => {
      // Get the current pathname
      const pathname = window.location.pathname;

      // Check if the pathname includes "/EN" or "/HI"
      const isLanguagePath = pathname.includes('/EN') || pathname.includes('/HI');

      // Check the allowed number of slashes based on whether it's a language path
      const allowedSlashCount = isLanguagePath ? 3 : 2;

      // Check if the pathname has the allowed number of slashes
      const hasAllowedSlashes = pathname.split('/').length === allowedSlashCount;

      // Get the element with the class 'langChange'
      const langChangeElement = document.querySelector('.langChange');

      // If it's a language path and includes the allowed number of slashes, hide the 'langChange'; otherwise, show it
      if (langChangeElement) {
        if (isLanguagePath && hasAllowedSlashes) {
          langChangeElement.classList.add('hidden');
        } else {
          langChangeElement.classList.remove('hidden');
        }
      }
    };

    // Add event listener for popstate (browser back/forward)
    window.addEventListener('popstate', handlePopstate);

    // Run the initial check
    handlePopstate();

    // Remove the event listener on component unmount
    return () => {
      window.removeEventListener('popstate', handlePopstate);
    };
  }, []);


  return (
    <div className="sticky w-screen z-50 top-0 font-noto-nastaliq">
      <AppBar
        position="static"
        className="bg-[#F0D586] text-[#984A02] shadow-none"
        style={{ backgroundColor: "#F0D586" }}
      >
        <Link
          href={`${redirectHref}`}
          id="redirect"
          className="opacity-0 h-0 overflow-hidden"
        >
          r
        </Link>
        <Container>
          <Toolbar className="justify-between pr-0 text-center text-[#984A02]">
            {/* Hamburger Menu Icon (Mobile) */}
            <IconButton
              className="lg:hidden text-[#984A02]"
              edge="start"
              aria-label="menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <CloseIcon className="top-4 ml-4" />
              ) : (
                <MenuIcon />
              )}
            </IconButton>
            <Link href={language !== "UR" ? `/${language}` : "/"}>
              <Image
                className="lg:w-20 md:w-16"
                src="/logo.png"
                alt="Logo"
                height={80}
                width={60}
                priority
              />
            </Link>
            <div className="w-0 lg:w-[100%]">
              <ul className="hidden lg:flex md:text-xs justify-center font-noto-nastaliq space-x-4">
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
            </div>

            {/* Language Select */}
            <div className="m-2 border-[#984A02] text-[#984A02] ">
              <select
                id="langChange"
                value={language}
                onChange={onLangChange}
                className="langChange bg-transparent focus:border-none border-none outline-none focus:outline-none rounded-none focus:rounded-none text-center"
              >
                <option className="bg-[#F0D586]" value="UR">
                  اردو
                </option>
                <option className="bg-[#F0D586]" value="EN">
                  English
                </option>
                <option className="bg-[#F0D586]" value="HI">
                  हिंदी
                </option>
              </select>
            </div>
            {/* donation button  */}
            <Link
              href={`${language == "UR" ? "/Donate" : language + "/Donate"}`}
              className="bg-[#984A02] text-white hover:text-[#984A02] hover:bg-white transition-all 500ms ease-in-out p-2 rounded-sm mr-3 w-32 text-[1rem]"
            >
              <button>Donate Us</button>
            </Link>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Menu (Drawer) */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        <div
          style={{
            background: "#F0D586",
            color: "#984A02",
          }}
          className="min-h-[100vh] h-[max-content]"
        >
          {/* Close Icon */}
          <IconButton
            onClick={() => setMobileMenuOpen(false)}
            className="top-4 left-5"
          >
            <CloseIcon className="text-[#984A02]" />
          </IconButton>
          <div
            style={{
              width: "80vw",
              display: "flex",
              flexDirection: "column",
              gap: "2rem",
              alignItems: "center",
            }}
          >
            {/* langchange */}
            <div className="langChange grid grid-flow-col gap-2 mt-12">
              <span
                onClick={() => handleLanguageChange("EN")}
                className={`${
                  language == "EN"
                    ? "bg-[#984A02] text-white"
                    : "bg-transparent text-[#984A02]"
                } p-2`}
              >
                English
              </span>
              <span
                onClick={() => handleLanguageChange("UR")}
                className={`${
                  language == "UR"
                    ? "bg-[#984A02] text-white"
                    : "bg-transparent text-[#984A02]"
                } p-2`}
              >
                Urdu
              </span>
              <span
                onClick={() => handleLanguageChange("HI")}
                className={`${
                  language == "HI"
                    ? "bg-[#984A02] text-white"
                    : "bg-transparent text-[#984A02]"
                } p-2`}
              >
                Hindi
              </span>
            </div>

            {/* Navigation Links (Mobile) */}
            <div
              className="flex gap-7"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div>
                <h3 className="text-black font-bold">Navs</h3>
                <ul
                  id="navelems"
                  className="flex flex-col gap-3 text-center w-[80px]"
                >
                  {pages.map((page, index) => (
                    <Link
                      className="hover:text-white hover:bg-yellow-900 p-1 rounded-sm"
                      key={index}
                      href={`/${
                        language == "UR" ? page.EN : language + "/" + page.EN
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <li>{page[language as Language]}</li>
                    </Link>
                  ))}
                  <li>
                    <InstallPWAButton />
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-black font-bold">More</h3>
                <List>
                  {["About_site", "About_owner", "Contact", "Programs"].map(
                    (item) => (
                      <Link
                        href={`/${
                          language == "UR" ? item : language + "/" + item
                        }`}
                        key={item}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <ListItem button>
                          <ListItemText primary={item} />
                        </ListItem>
                      </Link>
                    )
                  )}
                </List>
              </div>
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default Navbar;
