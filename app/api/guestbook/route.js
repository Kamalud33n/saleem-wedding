import { NextResponse } from "next/server";
import weddingConfig from "@/config/wedding.config";
import { t as translate } from "@/lib/i18n";
import {
  buildGuestbookEmailHtml,
  createGuestbookEntry,
  validateGuestbookPayload,
} from "@/lib/guestbook";
import {
  appendGuestbookEntry,
  getGuestbookStorageMode,
  listGuestbookEntries,
} from "@/lib/guestbook-store";
import { getHostNotifyEmail, sendViaResend } from "@/lib/resend-email";

export const runtime = "nodejs";

const RATE_LIMIT_MS = 8000;
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
  if (recentByIp.size > 500) {
    for (const [key, ts] of recentByIp) {
      if (now - ts > RATE_LIMIT_MS * 2) recentByIp.delete(key);
    }
  }
  return false;
}

export async function GET() {
  try {
    const entries = await listGuestbookEntries();
    return NextResponse.json({
      ok: true,
      entries,
      storage: getGuestbookStorageMode(),
    });
  } catch (error) {
    console.error("[guestbook] read failed:", error?.message || error);
    return NextResponse.json(
      { ok: false, error: "read_failed" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const ip = clientIp(request);
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { ok: false, error: "rate_limited" },
        { status: 429 }
      );
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: "invalid_json" },
        { status: 400 }
      );
    }

    const locale = payload?.locale === "ta" ? "ta" : "en";
    const result = validateGuestbookPayload(payload, locale);

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, errors: result.errors },
        { status: 400 }
      );
    }

    const entry = createGuestbookEntry(result.data);

    try {
      await appendGuestbookEntry(entry);
    } catch (error) {
      if (error?.code === "storage_unavailable") {
        return NextResponse.json(
          { ok: false, error: "storage_unavailable" },
          { status: 503 }
        );
      }
      throw error;
    }

    const { to, from } = getHostNotifyEmail();
    if (to) {
      try {
        const couple = weddingConfig.couple;
        const partnerOne = translate(couple?.partnerOne?.name, "en");
        const partnerTwo = translate(couple?.partnerTwo?.name, "en");
        const typeLabel = entry.type === "advice" ? "Advice" : "Wish";
        await sendViaResend({
          to,
          from,
          subject: `New memory — ${entry.name} (${typeLabel}) · ${partnerOne} & ${partnerTwo}`,
          html: buildGuestbookEmailHtml(entry),
          replyTo: undefined,
        });
      } catch (error) {
        console.error("[guestbook] email failed:", error?.message || error);
      }
    } else {
      console.error("[guestbook] RSVP_TO_EMAIL is not configured");
    }

    return NextResponse.json({ ok: true, entry });
  } catch (error) {
    console.error("[guestbook] write failed:", error?.message || error);
    return NextResponse.json(
      { ok: false, error: "write_failed" },
      { status: 500 }
    );
  }
}
