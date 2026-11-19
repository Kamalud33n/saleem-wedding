const RSVP_STORAGE_KEY = "wedding-invite-rsvp-v1";

/** @returns {{ submitted: true, name: string, submittedAt?: string } | null} */
export function readStoredRsvp() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(RSVP_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.submitted !== true) return null;
    const name = String(parsed.name ?? "").trim();
    if (!name) return null;
    return {
      submitted: true,
      name,
      submittedAt: parsed.submittedAt,
    };
  } catch {
    return null;
  }
}

/** Persist RSVP success — call only after server confirms submission. */
export function writeStoredRsvp({ name }) {
  if (typeof window === "undefined") return;
  const trimmed = String(name ?? "").trim();
  if (!trimmed) return;
  try {
    localStorage.setItem(
      RSVP_STORAGE_KEY,
      JSON.stringify({
        submitted: true,
        name: trimmed,
        submittedAt: new Date().toISOString(),
      })
    );
  } catch {
    /* private mode / quota */
  }
}
