"use client";
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Container,
  InputBase,
  Drawer,
  List,
  ListItem,
  ListItemText,

} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import Link from "next/link";

// export const [language, setLanguage] = useState("EN");
interface NavbarProps {
  language: string;
  onLangChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

const Navbar: React.FC<NavbarProps> = ({ language, onLangChange }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Function to handle search input focus
  const handleSearchFocus = () => {
    // Add your logic to change opacity here
  };

  const urduItems = [
    "شاعر",
    "آشار",
    "ای-بکس",
    "غزلیں",
    "نظمیں",
    "بلاگز",
    "انٹرویوز",
  ];
  const englishItems = [
    "Shaer",
    "Ashaar",
    "Ghazlen",
    "Nazmen",
    "E-Books",
    "Blogs",
    "Interviews",
  ];
  const hindiItems = [
    "कवि",
    "छंद",
    "ई-बुक्स",
    "ग़ज़लें",
    "कविताएँ",
    "ब्लॉग्स",
    "साक्षात्कार",
  ];
  const itemsToDisplay =
    language === "UR"
      ? urduItems
      : language === "EN"
      ? englishItems
      : hindiItems;

  return (
    <div>
      <AppBar
        position="static"
        className="bg-[#F0D586] text-[#984A02]"
        style={{ backgroundColor: "#F0D586" }}
      >
        <Container maxWidth="lg">
          <Toolbar className="justify-between pr-0 text-center text-[#984A02] lg:hidden md:hidden">
            {/* Hamburger Menu Icon (Mobile) */}
            <IconButton
              className="lg:hidden md:hidden "
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
                <img src="/logo.svg" alt="Logo" width="80" />
              </a>
            </Typography>

            <List className="hidden lg:flex md:text-xs w-[68%] justify-center">
              {itemsToDisplay.map((item) => (
                <Link href={`/${item}`} key={item}>
                  <ListItem button>
                    <ListItemText primary={item} className="text-[#984A02]" />
                  </ListItem>
                </Link>
              ))}
            </List>
            {/* Language Select */}
            <div className="m-2 border-[#984A02] text-[#984A02] hidden lg:block md:hidden sm:hidden">
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
              className="bg-[#984A02] text-white hover:text-[#984A02] hover:bg-white transition-all p-2 rounded-sm mr-3 hidden lg:block md:block w-32"
            >
              <button>Donate Us</button>
            </a>
            {/* Search Bar (Desktop) */}
            <div className="">
              <div className="bg-opacity-30 bg-white rounded-md p-1 flex items-center">
                <SearchIcon />
                <InputBase
                  className="w-36"
                  placeholder="Search..."
                  onFocus={handleSearchFocus}
                />
              </div>
            </div>
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
              width: "100vw",
              display: "flex",
              flexDirection: "column",
              gap: "2rem",
              alignItems: "center",
            }}
          >
            {/* faviorites */}

            <Link
              href="/Faviorites"
              className="border-b-2 mt-3 border-black w-[100vw] text-center"
            >
              <Typography className="text-red-500 hover:text-[#984A02]">
                <h3>Faviorites</h3>
              </Typography>
            </Link>

            {/* donation button  */}
            <div className="w-[100%] border-b-2 border-black text-center pb-3 md:hidden lg:hidden">
              <a
                href="/donate"
                className="bg-[#984A02] text-white hover:text-[#984A02] hover:bg-white transition-all p-3 rounded-sm"
              >
                <button>Donate Us</button>
              </a>
            </div>
            {/* Language Select (Mobile) */}
            <div className="w-[100%] border-b-2 border-black text-center pb-3">
              <select
                value={language}
                onChange={onLangChange}
                className="text-[#984A02] lg:border-[#984A02] lg:hidden md:hidden sm:hidden w-56 bg-transparent"
              >
                <option value="UR">Urdu</option>
                <option value="EN">English</option>
                <option value="HI">Hindi</option>
              </select>
            </div>

            {/* Navigation Links (Mobile) */}
            <div className="flex gap-7">
              <div>
                <h3 className="text-black font-bold">Navs</h3>
                <List id="navelems" className="flex flex-col">
                  {itemsToDisplay.map((item) => (
                    <Link href={`/${item}`} key={item}>
                      <ListItem button>
                        <ListItemText
                          primary={item}
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