import { isIOSChromeViewportMode } from "@/lib/ios-chrome-viewport";

/**
 * Deterministic scroll position for the invitation opening experience.
 * Browser scroll restoration (bfcache, refresh, shared links) can restore
 * a mid-page position while the envelope overlay is visible.
 */

export function lockInvitationScrollRestoration() {
  if (typeof window === "undefined") return;
  try {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  } catch {
    /* ignore */
  }
}

export function resetInvitationScroll() {
  if (typeof window === "undefined") return;

  lockInvitationScrollRestoration();

  const scrollOptions = { top: 0, left: 0, behavior: "auto" };

  try {
    window.scrollTo(scrollOptions);
  } catch {
    window.scrollTo(0, 0);
  }

  try {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  } catch {
    /* ignore */
  }

  try {
    if (isIOSChromeViewportMode()) {
      const region =
        document.getElementById("app-scroll-region") ||
        document.getElementById("app-visual-frame");
      if (region) region.scrollTop = 0;
    }
  } catch {
    /* ignore */
  }
}

/** Run after layout/paint so scroll sticks after envelope removal. */
export function resetInvitationScrollAfterPaint() {
  resetInvitationScroll();
  if (typeof window === "undefined") return;

  window.requestAnimationFrame(() => {
    resetInvitationScroll();
    window.requestAnimationFrame(resetInvitationScroll);
  });
}

export function installInvitationScrollGuards() {
  if (typeof window === "undefined") return () => {};

  lockInvitationScrollRestoration();
  resetInvitationScroll();

  const onPageShow = (event) => {
    if (event.persisted) {
      resetInvitationScrollAfterPaint();
    }
  };

  window.addEventListener("pageshow", onPageShow);
  return () => window.removeEventListener("pageshow", onPageShow);
}
