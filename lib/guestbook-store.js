import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { get, put } from "@vercel/blob";
import { normalizeGuestbookEntries } from "@/lib/guestbook";

const BLOB_PATHNAME = "guestbook-data.json";
const FILE_PATH = path.join(process.cwd(), "data", "guestbook.json");

function usesBlob() {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID
  );
}

function isVercelProduction() {
  return process.env.VERCEL === "1" && process.env.NODE_ENV === "production";
}

async function readFromFilesystem() {
  try {
    const raw = await readFile(FILE_PATH, "utf8");
    return normalizeGuestbookEntries(JSON.parse(raw));
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
}

async function writeToFilesystem(entries) {
  await mkdir(path.dirname(FILE_PATH), { recursive: true });
  await writeFile(
    FILE_PATH,
    `${JSON.stringify({ entries }, null, 2)}\n`,
    "utf8"
  );
}

async function readFromBlob() {
  try {
    const result = await get(BLOB_PATHNAME, { access: "private" });
    if (!result?.stream) return null;
    const text = await new Response(result.stream).text();
    return normalizeGuestbookEntries(JSON.parse(text));
  } catch {
    return null;
  }
}

async function writeToBlob(entries) {
  await put(BLOB_PATHNAME, JSON.stringify({ entries }), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

/**
 * Read all guestbook entries (newest first).
 * Production on Vercel: reads from Vercel Blob when configured, else bundled JSON (read-only).
 * Local dev: reads/writes data/guestbook.json.
 */
export async function listGuestbookEntries() {
  if (usesBlob()) {
    const blobEntries = await readFromBlob();
    if (blobEntries) return blobEntries;

    const seed = await readFromFilesystem();
    if (seed.length > 0) {
      await writeToBlob(seed);
      return seed;
    }
    return [];
  }

  return readFromFilesystem();
}

async function saveEntries(entries) {
  const normalized = normalizeGuestbookEntries({ entries });

  if (usesBlob()) {
    await writeToBlob(normalized);
    return;
  }

  if (isVercelProduction()) {
    const error = new Error(
      "Guestbook storage is not configured for production. Set BLOB_READ_WRITE_TOKEN on Vercel."
    );
    error.code = "storage_unavailable";
    throw error;
  }

  await writeToFilesystem(normalized);
}

/**
 * Persist a new entry. Throws with code `storage_unavailable` on Vercel without Blob.
 */
export async function appendGuestbookEntry(entry) {
  const entries = await listGuestbookEntries();

  if (entries.some((item) => item.id === entry.id)) {
    return entry;
  }

  const updated = [entry, ...entries];
  await saveEntries(updated);
  return entry;
}

/** Remove one entry by id. Returns whether an entry was removed. */
export async function deleteGuestbookEntry(id) {
  const entries = await listGuestbookEntries();
  const updated = entries.filter((item) => item.id !== id);

  if (updated.length === entries.length) {
    return false;
  }

  await saveEntries(updated);
  return true;
}

export function getGuestbookStorageMode() {
  if (usesBlob()) return "blob";
  if (isVercelProduction()) return "vercel_readonly";
  return "filesystem";
}
