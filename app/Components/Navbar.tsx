"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import InstallPWAButton from "./InstallAppBtn";
import { ModeToggle } from "@/components/theme-toggle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useLanguage } from "@/contexts/LanguageContext";
import { navPages, getButtonText } from "@/lib/multilingual-texts";
import { SignedOut, SignedIn, UserButton } from "@clerk/nextjs";

type Language = "EN" | "UR" | "HI";

const Navbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { language, setLanguage } = useLanguage();
  const [redirectHref, setRedirectHref] = useState("");
  const [currentUrl, setCurrentUrl] = useState<string>("/");

  const normalizePath = (path: string) => {
    if (!path) return "/";
    const p = path.replace(/^\/(EN|HI|UR)(?=\/|$)/, "");
    return p === "" ? "/" : p;
  };
  const currentPath = normalizePath(pathname || "/");

  const isActive = (slugEN: string) => {
    const base = `/${slugEN}`;
    return currentPath === base || currentPath.startsWith(base + "/");
  };

  const handleLanguageChange = (selectedLanguage: Language) => {
    if (typeof window !== "undefined") localStorage.setItem("lang", selectedLanguage);
    setLanguage(selectedLanguage);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = window.location.pathname + window.location.search + window.location.hash;
      setCurrentUrl(url);
      try { window.localStorage.setItem("lastVisited", url); } catch { }
    }
  }, [pathname]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      let stripped = currentPath.replace(/^\/(EN|HI|UR)(?=\/|$)/, "");
      if (stripped === "") stripped = "/";
      const newHref = language === "UR" ? stripped : (stripped === "/" ? `/${language}` : `/${language}${stripped}`);
      setRedirectHref(newHref);
      try { router.push(newHref); } catch { }
    }
  }, [language, router]);

  return (
    <div className="fixed w-full z-50 top-0 font-noto-nastaliq">
      <header className="bg-secondary text-primary shadow-none sticky top-0">
        <div className="container mx-auto px-2 sm:px-4 flex items-center gap-2">
          {/* Hamburger (mobile) */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden text-primary p-0 h-10 w-10" aria-label="menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-secondary text-primary min-h-screen">
              <SheetTitle />
              <div className="w-[80vw] max-w-sm flex flex-col gap-8 items-center">
                {/* Language quick switch */}
                <div className="langChange grid grid-flow-col gap-2 mt-4">
                  <span onClick={() => handleLanguageChange("EN")} className={`${language == "EN" ? "bg-primary text-primary-foreground cursor-context-menu" : "bg-transparent text-primary cursor-pointer"} p-2`}>English</span>
                  <span onClick={() => handleLanguageChange("UR")} className={`${language == "UR" ? "bg-primary text-primary-foreground cursor-context-menu" : "bg-transparent text-primary cursor-pointer"} p-2`}>Urdu</span>
                  <span onClick={() => handleLanguageChange("HI")} className={`${language == "HI" ? "bg-primary text-primary-foreground cursor-context-menu" : "bg-transparent text-primary cursor-pointer"} p-2`}>Hindi</span>
                </div>

                {/* Navigation Links (Mobile) */}
                <div className="flex gap-7">
                  <div>
                    <h3 className="font-bold text-black">Navs</h3>
                    <ul id="navelems" className="flex flex-col gap-3 text-center w-[80px]">
                      {navPages.map((page: any, index: number) => {
                        const active = isActive(page.EN);
                        return (
                          <Link key={index} className={`${active ? "text-accent-blue" : ""} hover:text-accent-blue p-1 rounded-sm`} href={{ pathname: `/${language == "UR" ? page.EN : language + "/" + page.EN}` }}>
                            <li>{page[language as Language]}</li>
                          </Link>
                        );
                      })}
                      <li><InstallPWAButton /></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-bold text-black">More</h3>
                    <nav className="flex flex-col space-y-2">
                      {["About_site", "About_owner", "Contact", "Programs"].map((item) => {
                        const active = isActive(item);
                        return (
                          <Link key={item} href={{ pathname: `/${language == "UR" ? item : language + "/" + item}` }} className={`${active ? "text-accent-blue" : "text-primary"} hover:text-accent-blue`}>
                            <span>{item}</span>
                          </Link>
                        );
                      })}
                    </nav>
                  </div>
                </div>

                {/* Auth CTA inside sheet */}
                <div className="flex flex-col items-center gap-3 mt-2 p-4 border-t border-border w-full">
                  <SignedOut>
                    <div className="flex gap-2">
                      <Link href={{ pathname: "/sign-in", query: { returnUrl: currentUrl } }}>
                        <Button variant="outline">{getButtonText("signIn" as any, language as any)}</Button>
                      </Link>
                    </div>
                  </SignedOut>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href={{ pathname: language !== "UR" ? `/${language}` : "/" }} className="ml-1">
            <Image className="w-11 sm:w-14" src="/logo.png" alt="Logo" height={88} width={66} priority />
          </Link>

          <Link href={{ pathname: `${redirectHref}` }} id="redirect" className="opacity-0 h-0 overflow-hidden">r</Link>


          {/* Desktop Nav (center) */}
          <div dir="rtl" className="hidden lg:flex flex-1 items-center justify-center">
            <ul className="flex md:text-xs justify-center gap-4">
              {navPages.map((page: any) => {
                const active = isActive(page.EN);
                return (
                  <li key={page.EN} className={`${active ? "text-blue-600" : "text-primary"} hover:text-accent-blue font-medium text-xl mr-2`}>
                    <Link href={{ pathname: `/${language === "UR" ? page.EN : `${language}/${page.EN}`}` }}>
                      {(page as any)[language]}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Desktop right controls: search | language | theme | login | donate */}
          <div className="hidden lg:flex items-center gap-3 ml-auto">
            <Select value={language} onValueChange={(val: string) => handleLanguageChange(val as Language)}>
              <SelectTrigger id="langChange" className="langChange h-9 px-3 shadow-none bg-transparent dark:bg-transparent focus:border-none border-none outline-none focus:outline-none rounded-none text-primary" aria-label="Select language">
                <SelectValue className="bg-transparent dark:bg-transparent shadow-none" />
              </SelectTrigger>
              <SelectContent className="bg-transparent text-primary dark:text-secondary backdrop-blur-sm border border-border w-fit">
                <SelectItem value="UR">اردو</SelectItem>
                <SelectItem value="EN">English</SelectItem>
                <SelectItem value="HI">हिंदी</SelectItem>
              </SelectContent>
            </Select>
            <Search className="h-6 w-6 text-primary" />
            <ModeToggle />
            <SignedOut>
              <Link href={{ pathname: "/sign-in", query: { returnUrl: currentUrl } }} className="text-primary underline text-sm">
                {getButtonText("signIn" as any, language as any)}
              </Link>
            </SignedOut>
            <Link href={`https://rzp.io/l/QpiIjiU`} className="bg-primary text-primary-foreground hover:text-primary hover:bg-background transition-all duration-500 ease-in-out px-3.5 py-2.5 rounded-sm text-[1rem]">
              {language === "UR" ? "ہمیں عطیہ کریں" : language == "EN" ? "Donate Us" : "हमें दान करें"}
            </Link>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>

          {/* Mobile right controls: search | language | theme | login */}
          <div className="lg:hidden ml-auto flex items-center gap-1.5">
            <Select value={language} onValueChange={(val: string) => handleLanguageChange(val as Language)}>
              <SelectTrigger id="langChange" className="langChange h-8 w-18 px-2.5 shadow-none bg-transparent dark:bg-transparent focus:border-none border-none outline-none focus:outline-none rounded-none text-primary" aria-label="Select language">
                <SelectValue className="bg-transparent dark:bg-transparent shadow-none" />
              </SelectTrigger>
              <SelectContent className="bg-transparent text-primary backdrop-blur-sm border border-border w-fit">
                <SelectItem value="UR">اردو</SelectItem>
                <SelectItem value="EN">EN</SelectItem>
                <SelectItem value="HI">HI</SelectItem>
              </SelectContent>
            </Select>
            <Search className="h-5 w-5 text-primary" />
            <ModeToggle />
            <SignedOut>
              <Link href={{ pathname: "/sign-in", query: { returnUrl: currentUrl } }} className="text-primary underline text-xs">
                {getButtonText("signIn" as any, language as any)}
              </Link>
            </SignedOut>
            <Link href={`https://rzp.io/l/QpiIjiU`} className="ml-1 bg-primary text-primary-foreground hover:text-primary hover:bg-background transition-all duration-500 ease-in-out px-2.5 py-1.5 rounded-sm text-[0.8rem] whitespace-nowrap">
              {language === "UR" ? "عطیہ" : language == "EN" ? "Donate" : "दान"}
            </Link>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Small-screen horizontal nav below header */}
      <div dir={language === 'UR' ? "rtl" : "ltr"} className="w-full lg:hidden py-2 px-3 overflow-x-auto bg-transparent border-border fixed top-[44px] sm:top-[55px] left-0 right-0 z-50 backdrop-blur-sm">
        <div className="flex text-[16px] gap-3">
          {navPages.map((page: any) => {
            const active = isActive(page.EN);
            return (
              <div key={page.EN} className={`${active ? "text-blue-600" : "text-primary dark:text-secondary"} font-medium min-w-[56px] text-center`}>
                <Link href={{ pathname: `/${language === "UR" ? page.EN : `${language}/${page.EN}`}` }}>
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
