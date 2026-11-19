"use client";

import { LOCALES } from "@/lib/i18n";
import uiCopy from "@/config/ui.copy";
import { useLocale } from "@/context/LocaleProvider";
import { ta } from "@/lib/tamil-type";

/** Shows only the other language — tap to switch. */
export default function LanguageToggle() {
  const { locale, setLocale, t } = useLocale();
  const other = LOCALES.find((item) => item.id !== locale);
  if (!other) return null;

  return (
    <button
      type="button"
      onClick={() => setLocale(other.id)}
      aria-label={t(uiCopy.language.group)}
      className={`inline-flex h-9 min-w-9 items-center justify-center rounded-full px-2.5 text-peacock transition-colors hover:text-peacock-light ${
        other.id === "ta" ? ta.chip : "font-label text-[9px] uppercase tracking-[0.14em]"
      }`}
    >
      {other.label}
    </button>
  );
}
