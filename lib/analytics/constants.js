/** Stable section IDs — must match SectionTracker wrappers on the page. */
import weddingConfig from "@/config/wedding.config";

export const SECTION_IDS = [
  "hero",
  "discover-date",
  "countdown",
  "cinematic",
  "story",
  "ceremonies",
  "rsvp",
  "guestbook",
  "footer",
];

export const VISITOR_STORAGE_KEY = "wedding-invite-visitor-v1";
export const SESSION_STORAGE_KEY = "wedding-invite-session-v1";
/** New session after 30 minutes of inactivity. */
export const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

export const SCREENSHOT_CAPABILITY =
  "unavailable_web_no_reliable_os_screenshot_api";

/** Guestbook memories are independent of this flag. */
export function isAnalyticsEnabled() {
  return weddingConfig.analytics?.enabled === true;
}
