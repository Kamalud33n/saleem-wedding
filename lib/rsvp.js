import weddingConfig from "@/config/wedding.config";
import uiCopy from "@/config/ui.copy";
import { t as translate } from "@/lib/i18n";

const NAME_MIN = 2;
const NAME_MAX = 80;
const PHONE_MIN_DIGITS = 8;
const PHONE_MAX_DIGITS = 15;

const VALID_GUESS_IDS = new Set(
  (weddingConfig.rsvp?.options ?? []).map((o) => o.id)
);
const VALID_MOOD_IDS = new Set(
  (weddingConfig.rsvp?.moods ?? []).map((m) => m.id)
);

function phoneDigits(value) {
  return String(value ?? "").replace(/\D/g, "");
}

function msg(locale, key) {
  return translate(uiCopy.rsvp.validation[key], locale);
}

/**
 * Validate RSVP payload. Returns { ok: true, data } or { ok: false, errors }.
 * @param {Record<string, unknown>} raw
 * @param {"en"|"ta"} locale
 */
export function validateRsvpPayload(raw, locale = "en") {
  const errors = {};
  const name = String(raw?.name ?? "").trim();
  const phone = String(raw?.phone ?? "").trim();
  const guess =
    raw?.guess == null || raw?.guess === "" ? null : String(raw.guess);
  const mood =
    raw?.mood == null || raw?.mood === "" ? null : String(raw.mood);
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

  const digits = phoneDigits(phone);
  if (!phone) {
    errors.phone = msg(locale, "phoneRequired");
  } else if (digits.length < PHONE_MIN_DIGITS) {
    errors.phone = msg(locale, "phoneShort");
  } else if (digits.length > PHONE_MAX_DIGITS) {
    errors.phone = msg(locale, "phoneLong");
  }

  if (guess != null && !VALID_GUESS_IDS.has(guess)) {
    errors.guess = msg(locale, "invalidChoice");
  }

  if (mood != null && !VALID_MOOD_IDS.has(mood)) {
    errors.mood = msg(locale, "invalidChoice");
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      name,
      phone,
      guess,
      mood,
      locale: locale === "ta" ? "ta" : "en",
    },
  };
}

/** Resolve poll labels for email (English labels for host readability). */
export function resolveRsvpLabels({ guess, mood }) {
  const { question, options, moods } = weddingConfig.rsvp ?? {};
  const guessOption = options?.find((o) => o.id === guess);
  const moodOption = moods?.find((m) => m.id === mood);

  return {
    question: translate(question, "en"),
    guess: guessOption ? translate(guessOption.label, "en") : null,
    mood: moodOption ? translate(moodOption.label, "en") : null,
  };
}

export function buildRsvpEmailHtml({ name, phone, guess, mood, locale }) {
  const labels = resolveRsvpLabels({ guess, mood });
  const couple = weddingConfig.couple;
  const partnerOne = translate(couple?.partnerOne?.name, "en");
  const partnerTwo = translate(couple?.partnerTwo?.name, "en");

  const rows = [
    ["Guest name", name],
    ["Phone", phone],
    ["Language", locale === "ta" ? "Tamil" : "English"],
    [labels.question, labels.guess ?? "—"],
    ["I'm coming for…", labels.mood ?? "—"],
  ];

  const tableRows = rows
    .map(
      ([label, value]) =>
        `<tr>
          <td style="padding:10px 14px;border-bottom:1px solid #eadfc4;color:#5c4f3f;font-size:13px;width:38%;vertical-align:top;">${escapeHtml(label)}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #eadfc4;color:#1a1a1a;font-size:14px;vertical-align:top;">${escapeHtml(value)}</td>
        </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:24px;background:#f6eedd;font-family:Georgia,'Times New Roman',serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:#fffdf8;border:1px solid #d4c4a0;border-radius:4px;overflow:hidden;">
      <tr>
        <td style="padding:28px 24px 8px;background:linear-gradient(180deg,#0f3d3e 0%,#145a5c 100%);color:#f6eedd;">
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;opacity:0.85;">New wedding RSVP</p>
          <h1 style="margin:0;font-size:22px;font-weight:500;font-style:italic;">${escapeHtml(partnerOne)} &amp; ${escapeHtml(partnerTwo)}</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 8px 24px;">
          <p style="margin:0 0 16px;padding:0 16px;color:#5c4f3f;font-size:14px;line-height:1.5;">A guest has sent their RSVP through your wedding invitation.</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
            ${tableRows}
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
