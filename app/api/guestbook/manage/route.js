import { NextResponse } from "next/server";
import {
  isGuestbookAdminConfigured,
  verifyGuestbookAdminPassword,
} from "@/lib/guestbook-admin";
import {
  deleteGuestbookEntry,
  listGuestbookEntries,
} from "@/lib/guestbook-store";

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
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 }
    );
  }

  const password = String(payload?.password ?? "");
  if (!verifyGuestbookAdminPassword(password)) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 }
    );
  }

  const action = String(payload?.action ?? "");

  try {
    if (action === "list") {
      const entries = await listGuestbookEntries();
      return NextResponse.json({ ok: true, entries });
    }

    if (action === "delete") {
      const id = String(payload?.id ?? "").trim();
      if (!id) {
        return NextResponse.json(
          { ok: false, error: "missing_id" },
          { status: 400 }
        );
      }

      const deleted = await deleteGuestbookEntry(id);
      if (!deleted) {
        return NextResponse.json(
          { ok: false, error: "not_found" },
          { status: 404 }
        );
      }

      const entries = await listGuestbookEntries();
      return NextResponse.json({ ok: true, deleted: true, entries });
    }

    return NextResponse.json(
      { ok: false, error: "invalid_action" },
      { status: 400 }
    );
  } catch (error) {
    if (error?.code === "storage_unavailable") {
      return NextResponse.json(
        { ok: false, error: "storage_unavailable" },
        { status: 503 }
      );
    }

    console.error("[guestbook/manage] failed:", error?.message || error);
    return NextResponse.json(
      { ok: false, error: "server_error" },
      { status: 500 }
    );
  }
}
