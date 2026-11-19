import { NextResponse } from "next/server";
import {
  deriveLocationFromRequest,
  ingestAnalyticsBatch,
} from "@/lib/analytics-store";
import { isAnalyticsEnabled } from "@/lib/analytics/constants";

export const runtime = "nodejs";

const RATE_LIMIT_MS = 3000;
const recentByIp = new Map();

function clientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(ip) {
  const now = Date.now();
  const last = recentByIp.get(ip);
  if (last && now - last < RATE_LIMIT_MS) return true;
  recentByIp.set(ip, now);
  return false;
}

export async function POST(request) {
  try {
    if (!isAnalyticsEnabled()) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const ip = clientIp(request);
    if (isRateLimited(ip)) {
      return NextResponse.json({ ok: false }, { status: 429 });
    }

    let batch;
    try {
      batch = await request.json();
    } catch {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    if (!batch?.sessionId || !batch?.visitorId || !Array.isArray(batch.events)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    batch.lastSeenAt = new Date().toISOString();
    const location = deriveLocationFromRequest(request);

    await ingestAnalyticsBatch(batch, location);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error?.code === "storage_unavailable") {
      return NextResponse.json({ ok: false }, { status: 503 });
    }
    console.error("[analytics] ingest failed:", error?.message || error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
