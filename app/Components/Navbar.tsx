"use client";
import React, { useEffect, useState } from "react";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import InstallPWAButton from "./InstallAppBtn";
import { ModeToggle } from "@/components/theme-toggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Menu, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { useLanguage } from "@/contexts/LanguageContext";
import { navPages } from "@/lib/multilingual-texts";

type Language = "EN" | "UR" | "HI";

const Navbar: React.FC = () => {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [redirectHref, setRedirectHref] = useState(""); // Initialize redirectHref with an empty string
  const pathname = usePathname();

  // Normalize current path to compare against section slugs, handling language prefixes.
  const normalizePath = (path: string) => {
    if (!path) return "/";
    // Remove language prefix like /EN, /HI, /UR once at the start
    let p = path.replace(/^\/(EN|HI|UR)(?=\/|$)/, "");
    if (p === "") p = "/";
    return p;
  };

  const currentPath = normalizePath(pathname || "/");

  // Determine if a given top-level section (e.g., "E-Books") is active.
  // We map section EN slug (the pathname segment) to active state by checking:
  //  - exact match: "/E-Books"
  //  - nested route: "/E-Books/..."
  const isActive = (slugEN: string) => {
    const base = `/${slugEN}`;
    return currentPath === base || currentPath.startsWith(base + "/");
  };

  const handleLanguageChange = (selectedLanguage: Language) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("lang", selectedLanguage);
    }
    setLanguage(selectedLanguage);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;

      // Remove the existing language code at the start only (e.g., /EN, /HI, /UR)
      let stripped = currentPath.replace(/^\/(EN|HI|UR)(?=\/|$)/, "");
      // Ensure we have a single leading slash
      if (stripped === "") stripped = "/";

      // Compose the new href based on selected language
      let newHref: string;
      if (language === "UR") {
        // For Urdu, we do not add a language prefix
        newHref = stripped; // already starts with '/'
      } else {
        // For EN/HI, add language prefix; avoid double slashes
        newHref = stripped === "/" ? `/${language}` : `/${language}${stripped}`;
      }
      setRedirectHref(newHref);
      // Navigate to the new language URL
      try { router.push(newHref); } catch {}
    }
  }, [language]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handlePopstate = () => {
        const pathname = window.location.pathname;
        const isLanguagePath = pathname.match(/\/(EN|HI)/);
        const allowedSlashCount = isLanguagePath ? 3 : 2;
        const hasAllowedSlashes = pathname.split("/").length === allowedSlashCount;

        const langChangeElement = document.querySelector(".langChange");
        if (langChangeElement) {
          if (isLanguagePath && hasAllowedSlashes) {
            langChangeElement.classList.add("hidden");
          } else {
            langChangeElement.classList.remove("hidden");
          }
        }
      };

      window.addEventListener("popstate", handlePopstate);
      handlePopstate();
      return () => {
        window.removeEventListener("popstate", handlePopstate);
      };
    }
  }, []);

  return (
    <div className="fixed w-full z-50 top-0 font-noto-nastaliq">
      <header className="bg-secondary text-primary shadow-none sticky top-0">
        <div className="container mx-auto px-4 flex">
          <Link href={{ pathname: `${redirectHref}` }} id="redirect" className="opacity-0 h-0 overflow-hidden">
            r
          </Link>
          <div className="flex justify-between items-center text-primary w-full">
            {/* Navigation Drawer (Mobile) */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden text-primary"
                  aria-label="menu"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-secondary text-primary min-h-screen">
                <div className="flex justify-between items-center mb-4">
                  <Button variant="ghost" size="icon" aria-label="close" onClick={() => setMobileMenuOpen(false)}>
                    <X className="h-6 w-6" />
                  </Button>
                </div>
                <div className="w-[80vw] max-w-sm flex flex-col gap-8 items-center">
                  {/* langchange */}
                  <div className="langChange grid grid-flow-col gap-2 mt-4">
                    <span
                      onClick={() => handleLanguageChange("EN")}
                      className={`${language == "EN" ? "bg-primary text-primary-foreground cursor-context-menu" : "bg-transparent text-primary cursor-pointer"} p-2`}
                    >
                      English
                    </span>
                    <span
                      onClick={() => handleLanguageChange("UR")}
                      className={`${language == "UR" ? "bg-primary text-primary-foreground cursor-context-menu" : "bg-transparent text-primary cursor-pointer"} p-2`}
                    >
                      Urdu
                    </span>
                    <span
                      onClick={() => handleLanguageChange("HI")}
                      className={`${language == "HI" ? "bg-primary text-primary-foreground cursor-context-menu" : "bg-transparent text-primary cursor-pointer"} p-2`}
                    >
                      Hindi
                    </span>
                  </div>

                  {/* Navigation Links (Mobile) */}
                  <div className="flex gap-7" onClick={() => setMobileMenuOpen(false)}>
                    <div>
                      <h3 className="text-foreground font-bold">Navs</h3>
                      <ul id="navelems" className="flex flex-col gap-3 text-center w-[80px]">
                        {navPages.map((page, index) => {
                          const active = isActive(page.EN);
                          return (
                            <Link
                              className={`${active ? "text-accent-blue" : ""} hover:text-accent-blue p-1 rounded-sm`}
                              key={index}
                              href={{ pathname: `/${language == "UR" ? page.EN : language + "/" + page.EN}` }}
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <li>{page[language as Language]}</li>
                            </Link>
                          );
                        })}
                        <li>
                          <InstallPWAButton />
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-foreground font-bold">More</h3>
                      <nav className="flex flex-col space-y-2">
                        {["About_site", "About_owner", "Contact", "Programs"].map((item) => {
                          const active = isActive(item);
                          return (
                            <Link
                              key={item}
                              href={{ pathname: `/${language == "UR" ? item : language + "/" + item}` }}
                              className={`${active ? "text-accent-blue" : "text-primary"} hover:text-accent-blue`}
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <span>{item}</span>
                            </Link>
                          );
                        })}
                      </nav>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link href={{ pathname: language !== "UR" ? `/${language}` : "/" }}>
              <Image className="lg:w-20 md:w-16 h-auto" src="/logo.png" alt="Logo" height={80} width={60} priority />
            </Link>

            {/* Desktop Nav */}
            <div dir="rtl" className="w-0 lg:w-max flex gap-2 items-center justify-center">
              <div className="hidden lg:flex items-center justify-between">
                <ul className="flex md:text-xs justify-center gap-4">
                  {navPages.map((page) => {
                    const active = isActive(page.EN);
                    return (
                      <li
                        key={page.EN}
                        className={`${active ? "text-accent-blue" : "text-primary"} hover:text-accent-blue font-medium text-xl mr-2`}
                      >
                        <Link href={{ pathname: `/${language === "UR" ? page.EN : `${language}/${page.EN}`}` }}>
                          {(page as any)[language]}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="lg:flex items-center gap-2 hidden">
                <ModeToggle />
              </div>
            </div>

            {/* Language Select */}
            <div className="m-2">
              <Select value={language} onValueChange={(val) => handleLanguageChange(val as Language)}>
                <SelectTrigger
                  id="langChange"
                  className="langChange shadow-none bg-transparent dark:bg-transparent focus:border-none border-none outline-none focus:outline-none rounded-none focus:rounded-none text-primary"
                  aria-label="Select language"
                >
                  <SelectValue className="bg-transparent dark:bg-transparent shadow-none" />
                </SelectTrigger>
                <SelectContent className="bg-transparent text-primary backdrop-blur-sm border border-border w-fit">
                  <SelectItem value="UR">اردو</SelectItem>
                  <SelectItem value="EN">English</SelectItem>
                  <SelectItem value="HI">हिंदी</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <Search className="h-6 w-6 text-primary" />

            {/* donation button  */}
            <Link
              href={`https://rzp.io/l/QpiIjiU`}
              className="bg-primary text-primary-foreground hover:text-primary hover:bg-background transition-all duration-500 ease-in-out p-2 rounded-sm mr-3 text-[1rem]"
            >
              <button>
                {language === "UR" ? "ہمیں عطیہ کریں" : language == "EN" ? "Donate Us" : "हमें दान करें"}
              </button>
            </Link>
            <div className="lg:hidden">
              <ModeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu (Sheet) */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="bg-secondary text-primary min-h-screen">
          <div className="flex justify-between items-center mb-4">
            <Button variant="ghost" size="icon" aria-label="close" onClick={() => setMobileMenuOpen(false)}>
              <X className="h-6 w-6" />
            </Button>
          </div>
          <div className="w-[80vw] max-w-sm flex flex-col gap-8 items-center">
            {/* langchange */}
            <div className="mt-4">
              <Select value={language} onValueChange={(val) => handleLanguageChange(val as Language)}>
                <SelectTrigger
                  className="w-full bg-background border border-border text-foreground"
                  aria-label="Select language"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border text-foreground">
                  <SelectItem value="UR">اردو</SelectItem>
                  <SelectItem value="EN">English</SelectItem>
                  <SelectItem value="HI">हिंदी</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Navigation Links (Mobile) */}
            <div className="flex gap-7" onClick={() => setMobileMenuOpen(false)}>
              <div>
                <h3 className="text-foreground font-bold">Navs</h3>
                <ul id="navelems" className="flex flex-col gap-3 text-center w-[80px]">
                  {navPages.map((page, index) => {
                    const active = isActive(page.EN);
                    return (
                      <Link
                        className={`${active ? "text-accent-blue" : ""} hover:text-accent-blue p-1 rounded-sm`}
                        key={index}
                        href={{ pathname: `/${language == "UR" ? page.EN : language + "/" + page.EN}` }}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <li>{page[language as Language]}</li>
                      </Link>
                    );
                  })}
                  <li>
                    <InstallPWAButton />
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-foreground font-bold">More</h3>
                <nav className="flex flex-col space-y-2">
                  {["About_site", "About_owner", "Contact", "Programs"].map((item) => {
                    const active = isActive(item);
                    return (
                      <Link
                        key={item}
                        href={{ pathname: `/${language == "UR" ? item : language + "/" + item}` }}
                        className={`${active ? "text-accent-blue" : "text-primary"} hover:text-accent-blue`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span>{item}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Top horizontal nav for small screens */}
      <div dir={language === 'UR' ? "rtl" : "ltr"} className="w-full lg:hidden p-4 overflow-x-scroll px-4 bg-transparent border-border fixed top-[59px] left-0 right-0 z-50 backdrop-blur-sm">
        <div className="flex text-xs gap-3 justify-between">
                        {navPages.map((page) => {
            const active = isActive(page.EN);
            return (
              <div
                key={page.EN}
                className={`${active ? "text-accent" : "text-primary"} hover:text-accent-blue font-medium text-sm min-w-[60px] text-center`}
              >
                <Link
                  href={{
                    pathname: `/${language === "UR" ? page.EN : `${language}/${page.EN}`}`,
                  }}
                >
                  {(page as any)[language]}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Navbar;