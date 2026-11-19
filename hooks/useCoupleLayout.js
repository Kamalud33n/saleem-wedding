"use client";

import { useEffect, useState } from "react";
import {
  coupleLayout,
  resolveCoupleLayoutKey,
} from "@/lib/hero-motion";

/** One width source everywhere — mixing visualViewport/clientWidth remounts couple mid-reveal. */
function getViewportWidth() {
  if (typeof window === "undefined") return 0;
  return window.innerWidth;
}

/**
 * Live couple layout for the current viewport.
 * Resolves width on the client before consumers treat layout as ready,
 * so CoupleReveal never enters with the SSR mobile bucket on desktop.
 */
export default function useCoupleLayout() {
  const [key, setKey] = useState(() =>
    resolveCoupleLayoutKey(getViewportWidth())
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const pick = () => setKey(resolveCoupleLayoutKey(getViewportWidth()));
    pick();
    setReady(true);
    window.addEventListener("resize", pick);
    return () => window.removeEventListener("resize", pick);
  }, []);

  const layout = coupleLayout[key] || coupleLayout.mobile;
  return { key, layout, ready };
}
