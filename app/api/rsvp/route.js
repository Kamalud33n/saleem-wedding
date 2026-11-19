import { NextResponse } from "next/server";
import weddingConfig from "@/config/wedding.config";
import { t as translate } from "@/lib/i18n";
import { getHostNotifyEmail, sendViaResend } from "@/lib/resend-email";
import {
  buildRsvpEmailHtml,
  validateRsvpPayload,
} from "@/lib/rsvp";

export const runtime = "nodejs";

const RATE_LIMIT_MS = 12_000;
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
    const result = validateRsvpPayload(payload, locale);

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, errors: result.errors },
        { status: 400 }
      );
    }

    const { to, from } = getHostNotifyEmail();

    if (!to) {
      console.error("[rsvp] RSVP_TO_EMAIL is not configured");
      return NextResponse.json(
        { ok: false, error: "server_misconfigured" },
        { status: 500 }
      );
    }

    const { name, phone, guess, mood } = result.data;
    const couple = weddingConfig.couple;
    const partnerOne = translate(couple?.partnerOne?.name, "en");
    const partnerTwo = translate(couple?.partnerTwo?.name, "en");

    const subject = `New RSVP — ${name} · ${partnerOne} & ${partnerTwo}`;
    const html = buildRsvpEmailHtml(result.data);

    await sendViaResend({
      to,
      from,
      subject,
      html,
      replyTo: undefined,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[rsvp] submission failed:", error?.message || error);
    return NextResponse.json(
      { ok: false, error: "send_failed" },
      { status: 500 }
    );
  }
}
