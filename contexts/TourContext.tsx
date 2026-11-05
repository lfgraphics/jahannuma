"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { tourContent } from "@/lib/tour-content";
import { driver, DriveStep } from "driver.js";
import { usePathname, useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

interface TourContextType {
  startTour: (force?: boolean) => void;
  isTourActive: boolean;
  onDialogsClosed: () => void;
}

const TOUR_STORAGE_KEY = "website-tour-completed";
const PENDING_TOUR_NAV_KEY = "start-tour-after-nav";

const TourContext = createContext<TourContextType | undefined>(undefined);

export function TourProvider({ children }: { children: React.ReactNode }) {
  const { language, isRTL } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [isTourActive, setIsTourActive] = useState(false);
  const driverRef = useRef<ReturnType<typeof driver> | null>(null);

  const isHomePage = (path: string | null) => {
    if (!path) return true;
    const clean = path.replace(/\/$/, "");
    return clean === "" || clean === "/EN" || clean === "/HI" || clean === "/UR";
  };

  // Helper to pick visible DOM element when multiple elements share a selector (e.g., mobile vs desktop navbar)
  const getVisibleElement = (selector: string): Element | null => {
    if (typeof window === "undefined") return null;
    const elements = Array.from(document.querySelectorAll(selector));
    for (const el of elements) {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      if (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        style.opacity !== "0" &&
        rect.width > 0 &&
        rect.height > 0
      ) {
        return el;
      }
    }
    return elements[0] || null;
  };

  const startTour = (force = false) => {
    if (typeof window === "undefined") return;

    // If already active, clean up previous instance
    if (driverRef.current) {
      try {
        driverRef.current.destroy();
      } catch {}
      driverRef.current = null;
    }

    // If user is on a subpage and clicked restart, route to homepage first
    if (!isHomePage(pathname) && force) {
      try {
        sessionStorage.setItem(PENDING_TOUR_NAV_KEY, "true");
      } catch {}
      const targetHome = language === "UR" ? "/" : `/${language}`;
      router.push(targetHome);
      return;
    }

    const content = tourContent[language] || tourContent.UR;
    const isSmallScreen = window.innerWidth < 1024;
    const steps: DriveStep[] = [];

    // 1. Hamburger Menu (for small screens only)
    if (isSmallScreen) {
      const hamburgerEl = getVisibleElement('[data-tour="hamburger"]');
      if (hamburgerEl) {
        steps.push({
          element: hamburgerEl,
          popover: {
            title: content.steps.hamburger.title,
            description: content.steps.hamburger.description,
            side: "bottom",
            align: isRTL ? "end" : "start",
          },
        });
      }
    }

    // 2. Language Switcher
    const langEl = getVisibleElement('[data-tour="language-switcher"]');
    if (langEl) {
      steps.push({
        element: langEl,
        popover: {
          title: content.steps.language.title,
          description: content.steps.language.description,
          side: "bottom",
          align: "center",
        },
      });
    }

    // 3. Theme Changer
    const themeEl = getVisibleElement('[data-tour="theme-toggle"]');
    if (themeEl) {
      steps.push({
        element: themeEl,
        popover: {
          title: content.steps.theme.title,
          description: content.steps.theme.description,
          side: "bottom",
          align: "center",
        },
      });
    }

    // 4. Login Button
    const loginEl = getVisibleElement('[data-tour="login-button"]');
    if (loginEl) {
      steps.push({
        element: loginEl,
        popover: {
          title: content.steps.login.title,
          description: content.steps.login.description,
          side: "bottom",
          align: isRTL ? "start" : "end",
        },
      });
    }

    // 5. Donate Button
    const donateEl = getVisibleElement('[data-tour="donate-button"]');
    if (donateEl) {
      steps.push({
        element: donateEl,
        popover: {
          title: content.steps.donate.title,
          description: content.steps.donate.description,
          side: "bottom",
          align: isRTL ? "start" : "end",
        },
      });
    }

    // 6. Search Button
    const searchEl = getVisibleElement('[data-tour="search-button"]');
    if (searchEl) {
      steps.push({
        element: searchEl,
        popover: {
          title: content.steps.search.title,
          description: content.steps.search.description,
          side: "bottom",
          align: "center",
        },
      });
    }

    // 6b. Mobile Horizontal Category Navigation Bar (on small screens)
    if (isSmallScreen) {
      const mobileNavEl = getVisibleElement('[data-tour="mobile-category-nav"]');
      if (mobileNavEl) {
        steps.push({
          element: mobileNavEl,
          popover: {
            title: content.steps.mobileNav.title,
            description: content.steps.mobileNav.description,
            side: "bottom",
            align: "center",
          },
        });
      }
    }

    // 7. Like, Comment, Share & Download Features (on RandCard / Selected Couplet)
    const cardActionsEl = getVisibleElement('[data-tour="card-actions"]') || document.querySelector('[data-tour="card-actions"]');
    if (cardActionsEl) {
      steps.push({
        element: cardActionsEl,
        popover: {
          title: content.steps.cardActions.title,
          description: content.steps.cardActions.description,
          side: "top",
          align: "center",
        },
      });
    }

    // 8. Quiz section that changes questions daily
    const quizEl = getVisibleElement('[data-tour="daily-quiz"]') || document.querySelector('[data-tour="daily-quiz"]');
    if (quizEl) {
      steps.push({
        element: quizEl,
        popover: {
          title: content.steps.quiz.title,
          description: content.steps.quiz.description,
          side: "top",
          align: "center",
        },
      });
    }

    // 9. Contact Form
    const contactEl = getVisibleElement('[data-tour="contact-form"]') || document.querySelector('[data-tour="contact-form"]');
    if (contactEl) {
      steps.push({
        element: contactEl,
        popover: {
          title: content.steps.contact.title,
          description: content.steps.contact.description,
          side: "top",
          align: "center",
        },
      });
    }

    // 10. Follow Us (Social Handles)
    const socialEl = getVisibleElement('[data-tour="social-links"]') || document.querySelector('[data-tour="social-links"]');
    if (socialEl) {
      steps.push({
        element: socialEl,
        popover: {
          title: content.steps.social.title,
          description: content.steps.social.description,
          side: "top",
          align: isRTL ? "start" : "end",
        },
      });
    }

    // 11. Quick Links
    const quickLinksEl = getVisibleElement('[data-tour="quick-links"]') || document.querySelector('[data-tour="quick-links"]');
    if (quickLinksEl) {
      steps.push({
        element: quickLinksEl,
        popover: {
          title: content.steps.quickLinks.title,
          description: content.steps.quickLinks.description,
          side: "top",
          align: isRTL ? "start" : "end",
        },
      });
    }

    if (steps.length === 0) {
      console.warn("Tour: No visible tour elements found on page.");
      return;
    }

    const driverObj = driver({
      animate: true,
      allowClose: true,
      overlayColor: "#000000",
      overlayOpacity: 0.65,
      stagePadding: 6,
      stageRadius: 8,
      showProgress: true,
      progressText: content.progressText,
      nextBtnText: content.nextBtn,
      prevBtnText: content.prevBtn,
      doneBtnText: content.doneBtn,
      showButtons: ["next", "previous", "close"],
      popoverClass: isRTL ? "jahannuma-tour-popover tour-rtl" : "jahannuma-tour-popover",
      steps,
      onDestroyStarted: () => {
        try {
          localStorage.setItem(TOUR_STORAGE_KEY, "true");
        } catch {}
        setIsTourActive(false);
        driverObj.destroy();
      },
      onDestroyed: () => {
        try {
          localStorage.setItem(TOUR_STORAGE_KEY, "true");
        } catch {}
        setIsTourActive(false);
      },
    });

    driverRef.current = driverObj;
    setIsTourActive(true);
    driverObj.drive();
  };

  // Called when welcome dialog and alert dialogs have completed/closed
  const onDialogsClosed = () => {
    if (typeof window === "undefined") return;

    try {
      const hasCompleted = localStorage.getItem(TOUR_STORAGE_KEY);
      if (!hasCompleted && isHomePage(pathname)) {
        // Wait 600ms for modal overlay exit transition
        setTimeout(() => {
          startTour(false);
        }, 600);
      }
    } catch (err) {
      console.error("Error checking tour status:", err);
    }
  };

  // Check if tour was requested before navigation to home
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (isHomePage(pathname)) {
      try {
        const pending = sessionStorage.getItem(PENDING_TOUR_NAV_KEY);
        if (pending === "true") {
          sessionStorage.removeItem(PENDING_TOUR_NAV_KEY);
          setTimeout(() => {
            startTour(true);
          }, 600);
        }
      } catch {}
    }
  }, [pathname]);

  return (
    <TourContext.Provider value={{ startTour, isTourActive, onDialogsClosed }}>
      {children}
    </TourContext.Provider>
  );
}

export function useTour(): TourContextType {
  const ctx = useContext(TourContext);
  if (!ctx) {
    throw new Error("useTour must be used within a TourProvider");
  }
  return ctx;
}

