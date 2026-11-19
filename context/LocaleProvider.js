"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  LOCALES,
  t as translate,
} from "@/lib/i18n";
import { trackEvent } from "@/lib/analytics/client";

const LocaleContext = createContext({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (value) => translate(value, DEFAULT_LOCALE),
  isTamil: false,
});

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(DEFAULT_LOCALE);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(LOCALE_STORAGE_KEY);
      if (stored && LOCALES.some((l) => l.id === stored)) {
        setLocaleState(stored);
      }
    } catch {
      /* private mode / blocked storage */
    }
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale === "ta" ? "ta" : "en";
    }
  }, [locale]);

  const setLocale = useCallback((next) => {
    if (!LOCALES.some((l) => l.id === next)) return;
    setLocaleState((prev) => {
      if (prev !== next) {
        trackEvent("language_changed", { from: prev, to: next });
      }
      return next;
    });
    try {
      sessionStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: (v) => translate(v, locale),
      isTamil: locale === "ta",
    }),
    [locale, setLocale]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
