"use client";

import { useEffect, useState } from "react";
import { LANGUAGE_STORAGE_KEY, type Language } from "./i18n";

export function useLanguage() {
  const [language, setLanguage] = useState<Language>("th");

  useEffect(() => {
    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved === "th" || saved === "en") {
      document.documentElement.lang = saved;
      // Restoring a browser-only preference necessarily happens after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLanguage(saved);
    }
  }, []);

  function toggleLanguage() {
    const next = language === "th" ? "en" : "th";
    setLanguage(next);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    document.documentElement.lang = next;
  }

  return { language, toggleLanguage };
}

