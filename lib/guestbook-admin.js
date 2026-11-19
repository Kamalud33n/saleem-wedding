import { timingSafeEqual } from "crypto";

export function verifyGuestbookAdminPassword(password) {
  const expected = process.env.GUESTBOOK_ADMIN_PASSWORD;
  if (!expected || !password) return false;

  const a = Buffer.from(String(password));
  const b = Buffer.from(String(expected));
  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b);
}

export function isGuestbookAdminConfigured() {
  return Boolean(process.env.GUESTBOOK_ADMIN_PASSWORD);
}
