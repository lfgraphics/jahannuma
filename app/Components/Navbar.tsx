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
}

const Navbar: React.FC<NavbarProps> = ({ language, onLangChange }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pages = [
    { EN: "Share", UR: "شئر", HI: "शेयर" },
    { EN: "Ashaar", UR: "اشعار", HI: "अशार" },
    { EN: "Ghazlen", UR: "غزلیں", HI: "ग़ज़लें" },
    { EN: "Nazmen", UR: "نظمیں", HI: "नज़्में" },
    { EN: "e-books", UR: "ای بکس", HI: "ई-बुक्स" },
    { EN: "Blogs", UR: "بلاگز", HI: "ब्लॉग्स" },
    { EN: "Interviews", UR: "انٹرویوز", HI: "इंटरव्यूज़" },
    { EN: "Favorites", UR: "پسندیدہ", HI: "पसंदीदा" },
  ];
  type Language = "EN" | "UR" | "HI";
  const handleLangChange = (selectedLanguage: string) => {
    // Perform any additional actions specific to click events here

    // Call the onLangChange function
    onLangChange({ target: { value: selectedLanguage } });
  };

  return (
    <div>
      <AppBar
        position="static"
        className="bg-[#F0D586] text-[#984A02]"
        style={{ backgroundColor: "#F0D586" }}
      >
        <Container>
          <Toolbar className="justify-between pr-0 text-center text-[#984A02]">
            {/* Hamburger Menu Icon (Mobile) */}
            <IconButton
              className="lg:hidden"
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
              <a href="/">
                <Image src="/logo.svg" alt="Logo" width="80" height="60" />
              </a>
            </Typography>

            <List className="hidden lg:flex md:text-xs w-[68%] justify-center">
              {pages.map((page) => (
                <Link href={`/${page.EN}`} key={page.EN}>
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
                value={language}
                onChange={onLangChange}
                className="bg-transparent"
              >
                <option value="UR">Urdu</option>
                <option value="EN">English</option>
                <option value="HI">Hindi</option>
              </select>
            </div>
            {/* donation button  */}
            <a
              href="/donate"
              className="bg-[#984A02] text-white hover:text-[#984A02] hover:bg-white transition-all p-2 rounded-sm mr-3 w-32 text-[1rem]"
            >
              <button>Donate Us</button>
            </a>
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
            height: "100vh",
            background: "#F0D586",
            color: "#984A02",
          }}
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
                onClick={() => handleLangChange("EN")}
                className={`${
                  language == "EN"
                    ? "bg-[#984A02] text-white"
                    : "bg-transparent text-[#984A02]"
                } p-2`}
              >
                English
              </span>
              <span
                onClick={() => handleLangChange("UR")}
                className={`${
                  language == "UR"
                    ? "bg-[#984A02] text-white"
                    : "bg-transparent text-[#984A02]"
                } p-2`}
              >
                Urdu
              </span>
              <span
                onClick={() => handleLangChange("HI")}
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
            <div className="flex gap-7">
              <div>
                <h3 className="text-black font-bold">Navs</h3>
                <List id="navelems" className="flex flex-col">
                  {pages.map((page) => (
                    <Link href={`/${page.EN}`} key={page.EN}>
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
                        href={`/${item == "Contact" ? "#contact" : item}`}
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
