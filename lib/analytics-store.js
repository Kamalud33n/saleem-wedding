import { get, put } from "@vercel/blob";
import {
  buildAdminReport,
  createEmptySummary,
  mergeAnalyticsBatch,
} from "@/lib/analytics/aggregate";
import { isAnalyticsEnabled } from "@/lib/analytics/constants";

const SUMMARY_PATH = "analytics/summary.json";

function usesBlob() {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID
  );
}

async function readJson(pathname, fallback) {
  try {
    const result = await get(pathname, { access: "private" });
    if (!result?.stream) return fallback;
    const text = await new Response(result.stream).text();
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

async function writeJson(pathname, data) {
  await put(pathname, JSON.stringify(data), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

export function deriveLocationFromRequest(request) {
  const country =
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry") ||
    "unavailable";
  const region =
    request.headers.get("x-vercel-ip-country-region") || "unavailable";
  const city = request.headers.get("x-vercel-ip-city") || "unavailable";

  return {
    country,
    region,
    city,
    isp: "unavailable",
  };
}

export async function ingestAnalyticsBatch(batch, location) {
  if (!isAnalyticsEnabled()) {
    return { ok: true, skipped: true };
  }

  if (!usesBlob()) {
    const error = new Error("Analytics storage not configured");
    error.code = "storage_unavailable";
    throw error;
  }

  const summary = (await readJson(SUMMARY_PATH, null)) || createEmptySummary();
  const sessionRecord = summary.sessionState?.[batch.sessionId] || null;

  const { summary: updatedSummary } = mergeAnalyticsBatch(
    summary,
    sessionRecord,
    batch,
    location
  );

  await writeJson(SUMMARY_PATH, updatedSummary);
  return { ok: true };
}

export async function getAnalyticsReport() {
  if (!usesBlob()) {
    return buildAdminReport(createEmptySummary());
  }

  const summary = (await readJson(SUMMARY_PATH, null)) || createEmptySummary();
  return buildAdminReport(summary);
}
