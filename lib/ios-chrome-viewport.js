/** Class on `<html>` — all iOS Chrome viewport overrides are scoped to this. */
export const IOS_CHROME_VIEWPORT_CLASS = "ios-chrome-viewport";

export function isIOSDevice() {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

/** Chrome or Edge on iOS (WebKit, not Safari). */
export function isIOSChromeBrowser() {
  if (!isIOSDevice()) return false;
  return /CriOS|EdgiOS/i.test(navigator.userAgent);
}

export function isIOSChromeViewportMode() {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains(IOS_CHROME_VIEWPORT_CLASS);
}
