export function sentryConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);
}

export function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.info("[email] skipped (no RESEND_API_KEY)", input.to, input.subject);
    return { ok: false as const, skipped: true as const };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "Brasamind <noreply@brasamind.com.br>",
      to: input.to,
      subject: input.subject,
      html: input.html,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return { ok: false as const, error: text };
  }
  return { ok: true as const };
}
