/** Lightweight client device categorization — not fingerprinting. */
export function getClientDeviceInfo() {
  if (typeof window === "undefined") {
    return {
      type: "unknown",
      os: "unknown",
      browser: "unknown",
      screenWidth: 0,
      screenHeight: 0,
      viewportWidth: 0,
      viewportHeight: 0,
      timezone: "unknown",
      language: "unknown",
    };
  }

  const ua = navigator.userAgent || "";
  const width = window.innerWidth || 0;

  let type = "desktop";
  if (width < 640) type = "mobile";
  else if (width < 1024) type = "tablet";

  let os = "other";
  if (/iPhone|iPad|iPod/i.test(ua)) os = "ios";
  else if (/Android/i.test(ua)) os = "android";
  else if (/Windows/i.test(ua)) os = "windows";
  else if (/Mac OS X/i.test(ua)) os = "macos";
  else if (/Linux/i.test(ua)) os = "linux";

  let browser = "other";
  if (/Edg\//i.test(ua)) browser = "edge";
  else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) browser = "chrome";
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = "safari";
  else if (/Firefox/i.test(ua)) browser = "firefox";

  return {
    type,
    os,
    browser,
    screenWidth: window.screen?.width || 0,
    screenHeight: window.screen?.height || 0,
    viewportWidth: width,
    viewportHeight: window.innerHeight || 0,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown",
    language: navigator.language || "unknown",
  };
}
