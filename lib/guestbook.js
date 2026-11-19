import weddingConfig from "@/config/wedding.config";
import uiCopy from "@/config/ui.copy";
import { t as translate } from "@/lib/i18n";

const NAME_MIN = 2;
const NAME_MAX = 60;
const MESSAGE_MIN = 4;
const MESSAGE_MAX = 600;
const VALID_TYPES = new Set(["wish", "advice"]);

function msg(locale, key) {
  return translate(uiCopy.guestbook.validation[key], locale);
}

/**
 * @param {unknown} raw
 * @param {"en"|"ta"} locale
 */
export function validateGuestbookPayload(raw, locale = "en") {
  const errors = {};
  const name = String(raw?.name ?? "").trim();
  const message = String(raw?.message ?? "").trim();
  const type = String(raw?.type ?? "").trim();
  const website = String(raw?.website ?? "").trim();

  if (website) {
    errors._form = msg(locale, "spam");
  }

  if (!name) {
    errors.name = msg(locale, "nameRequired");
  } else if (name.length < NAME_MIN) {
    errors.name = msg(locale, "nameShort");
  } else if (name.length > NAME_MAX) {
    errors.name = msg(locale, "nameLong");
  }

  if (!message) {
    errors.message = msg(locale, "messageRequired");
  } else if (message.length < MESSAGE_MIN) {
    errors.message = msg(locale, "messageShort");
  } else if (message.length > MESSAGE_MAX) {
    errors.message = msg(locale, "messageLong");
  }

  if (!type) {
    errors.type = msg(locale, "typeRequired");
  } else if (!VALID_TYPES.has(type)) {
    errors.type = msg(locale, "typeInvalid");
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      name,
      message,
      type,
      locale: locale === "ta" ? "ta" : "en",
    },
  };
}

/** Normalize stored entries and sort newest first. */
export function normalizeGuestbookEntries(raw) {
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.entries)
      ? raw.entries
      : [];

  return list
    .filter(
      (entry) =>
        entry &&
        typeof entry.id === "string" &&
        typeof entry.name === "string" &&
        typeof entry.message === "string" &&
        (entry.type === "wish" || entry.type === "advice")
    )
    .map((entry) => ({
      id: entry.id,
      name: entry.name.trim(),
      type: entry.type,
      message: entry.message.trim(),
      createdAt: entry.createdAt || new Date(0).toISOString(),
    }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function createGuestbookEntry({ name, message, type, locale }) {
  return {
    id: crypto.randomUUID(),
    name,
    type,
    message,
    locale: locale === "ta" ? "ta" : "en",
    createdAt: new Date().toISOString(),
  };
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildGuestbookEmailHtml(entry) {
  const couple = weddingConfig.couple;
  const partnerOne = translate(couple?.partnerOne?.name, "en");
  const partnerTwo = translate(couple?.partnerTwo?.name, "en");
  const typeLabel = entry.type === "advice" ? "Advice" : "Wish";
  const messageHtml = escapeHtml(entry.message).replace(/\n/g, "<br />");

  const rows = [
    ["Guest name", entry.name],
    ["Type", typeLabel],
    ["Language", entry.locale === "ta" ? "Tamil" : "English"],
    ["Message", entry.message],
  ];

  const tableRows = rows
    .map(([label, value]) => {
      const cell =
        label === "Message"
          ? messageHtml
          : escapeHtml(value);
      return `<tr>
          <td style="padding:10px 14px;border-bottom:1px solid #eadfc4;color:#5c4f3f;font-size:13px;width:38%;vertical-align:top;">${escapeHtml(label)}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #eadfc4;color:#1a1a1a;font-size:14px;vertical-align:top;">${cell}</td>
        </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:24px;background:#f6eedd;font-family:Georgia,'Times New Roman',serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:#fffdf8;border:1px solid #d4c4a0;border-radius:4px;overflow:hidden;">
      <tr>
        <td style="padding:28px 24px 8px;background:linear-gradient(180deg,#0f3d3e 0%,#145a5c 100%);color:#f6eedd;">
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;opacity:0.85;">New guestbook memory</p>
          <h1 style="margin:0;font-size:22px;font-weight:500;font-style:italic;">${escapeHtml(partnerOne)} &amp; ${escapeHtml(partnerTwo)}</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 8px 24px;">
          <p style="margin:0 0 16px;padding:0 16px;color:#5c4f3f;font-size:14px;line-height:1.5;">A guest has added a memory to your wedding invitation guestbook.</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
            ${tableRows}
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
