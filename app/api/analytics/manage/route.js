import { NextResponse } from "next/server";
import {
  isGuestbookAdminConfigured,
  verifyGuestbookAdminPassword,
} from "@/lib/guestbook-admin";
import { getAnalyticsReport } from "@/lib/analytics-store";

export const runtime = "nodejs";

export async function POST(request) {
  if (!isGuestbookAdminConfigured()) {
    return NextResponse.json(
      { ok: false, error: "admin_not_configured" },
      { status: 503 }
    );
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!verifyGuestbookAdminPassword(String(payload?.password ?? ""))) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const report = await getAnalyticsReport();
    return NextResponse.json({ ok: true, report });
  } catch (error) {
    console.error("[analytics/manage] failed:", error?.message || error);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
