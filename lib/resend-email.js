/**
 * Shared Resend sender used by RSVP and guestbook notifications.
 */
export async function sendViaResend({ to, from, subject, html, replyTo }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
      reply_to: replyTo,
    }),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail =
      body?.message || body?.error || `Resend error (${response.status})`;
    throw new Error(detail);
  }

  return body;
}

export function getHostNotifyEmail() {
  return {
    to: process.env.RSVP_TO_EMAIL || "",
    from:
      process.env.RSVP_FROM_EMAIL || "Wedding RSVP <onboarding@resend.dev>",
  };
}
