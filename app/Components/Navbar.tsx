"use client";
import React, { useState } from "react";
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

// export const [language, setLanguage] = useState("EN");
interface NavbarProps {
  language: string;
  onLangChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onLangClick?: (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void;
}

const Navbar: React.FC<NavbarProps> = ({ language, onLangChange }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pages = [
    { EN: "Shaer", UR: "شاعر", HI: "शेयर" },
    { EN: "Ashaar", UR: "اشعار", HI: "अशार" },
    { EN: "Ghazlen", UR: "غزلیں", HI: "ग़ज़लें" },
    { EN: "Nazmen", UR: "نظمیں", HI: "नज़्में" },
    { EN: "E-Books", UR: "ای بکس", HI: "ई-बुक्स" },
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

  return (
    <div className="fixed w-screen z-50 top-0">
      <AppBar
        position="static"
        className="bg-[#F0D586] text-[#984A02] shadow-none"
        style={{ backgroundColor: "#F0D586" }}
      >
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
            {/* Logo */}
            <Typography variant="h6">
              <Link
                href={
                  language !== "UR" && !window.location.href.includes(language)
                    ? `/${language}`
                    : "/"
                }
                id="redirect"
              >
                <Image src="/logo.svg" alt="Logo" width="80" height="60" />
              </Link>
            </Typography>

            <List className="hidden lg:flex md:text-xs w-[68%] justify-center">
              {pages.map((page) => (
                <Link
                  href={`/${
                    language == "UR" ? page.EN : language + "/" + page.EN
                  }`}
                  key={page.EN}
                >
                  {/* language == "UR"? page.EN: language + "/" + */}
                  <ListItem button>
                    <ListItemText
                      primary={page[language as Language]}
                      className="text-[#984A02]"
                    />
                  </ListItem>
                </Link>
              ))}
            </List>
            {/* Language Select */}
            <div className="m-2 border-[#984A02] text-[#984A02] ">
              <select
                id="langChange"
                value={language}
                onChange={onLangChange}
                className="bg-transparent focus:border-none border-none outline-none focus:outline-none rounded-none focus:rounded-none pb-[11px]"
              >
                <option className="bg-[#F0D586]" value="UR">
                  Urdu
                </option>
                <option className="bg-[#F0D586]" value="EN">
                  English
                </option>
                <option className="bg-[#F0D586]" value="HI">
                  Hindi
                </option>
              </select>
            </div>
            {/* donation button  */}
            <Link
              href="/donate"
              className="bg-[#984A02] text-white hover:text-[#984A02] hover:bg-white transition-all p-2 rounded-sm mr-3 w-32 text-[1rem] pb-[13px]"
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
            <div className="grid grid-flow-col gap-2 mt-12">
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
                <List id="navelems" className="flex flex-col">
                  {pages.map((page, index) => (
                    <Link
                      key={index}
                      href={`/${
                        language == "UR" ? page.EN : language + "/" + page.EN
                      }`}
                    >
                      <ListItem button>
                        <ListItemText
                          primary={page[language as Language]}
                          className="text-[#984A02]"
                        />
                      </ListItem>
                    </Link>
                  ))}
                </List>
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
