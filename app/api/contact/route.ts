import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { org } from '@/content/site';

/**
 * Contact form endpoint.
 *
 * Sends the enquiry through the company's OWN mailbox over SMTP — no form
 * service, no mail API, no third party holding the data. The credentials are the
 * same ones the business already has for business@falconinternational.net.pk.
 *
 * ── Requires a server ─────────────────────────────────────────────────────
 *
 * This route only exists when the site is built as a server app. `next.config.mjs`
 * drops `output: 'export'` automatically on Vercel (which sets VERCEL=1) or when
 * SMTP_HOST is present. On a plain static build the route is not emitted and the
 * form falls back to composing mail in the visitor's own app.
 *
 * ── Environment ───────────────────────────────────────────────────────────
 *
 * SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and optionally CONTACT_TO.
 * See .env.example. Nothing is hardcoded and nothing is logged.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Trimmed, length-capped, and stripped of header-injection characters. */
function clean(value: FormDataEntryValue | null, max: number): string {
  return String(value ?? '')
    .replace(/[\r\n]+/g, ' ')
    .trim()
    .slice(0, max);
}

export async function POST(request: Request) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_TO } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    // Deliberately vague to the client, explicit in the server log. The form
    // treats this as a signal to fall back to the visitor's mail app.
    console.error('[contact] SMTP is not configured; refusing to accept the enquiry.');
    return NextResponse.json({ ok: false, reason: 'unconfigured' }, { status: 503 });
  }

  let body: Record<string, string>;
  try {
    const data = await request.formData();

    // Honeypot: a field no human ever sees. Bots fill everything, so anything
    // in here is automated. Answer 200 so the bot believes it succeeded and
    // does not retry with a different shape.
    if (clean(data.get('website'), 100)) {
      return NextResponse.json({ ok: true });
    }

    body = {
      name: clean(data.get('name'), 120),
      company: clean(data.get('company'), 160),
      email: clean(data.get('email'), 200),
      phone: clean(data.get('phone'), 60),
      service: clean(data.get('service'), 80),
      // The message keeps its line breaks; only its length is capped.
      message: String(data.get('message') ?? '').trim().slice(0, 5000),
    };
  } catch {
    return NextResponse.json({ ok: false, reason: 'malformed' }, { status: 400 });
  }

  if (!body.name || !body.email || !body.message) {
    return NextResponse.json({ ok: false, reason: 'incomplete' }, { status: 400 });
  }

  const port = Number(SMTP_PORT ?? 587);

  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    // 465 is implicit TLS; 587 upgrades with STARTTLS.
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  const lines = [
    `Name:             ${body.name}`,
    `Company:          ${body.company || '—'}`,
    `Email:            ${body.email}`,
    `Phone:            ${body.phone || '—'}`,
    `Service required: ${body.service || '—'}`,
    '',
    'Message:',
    body.message,
    '',
    '—',
    `Sent from the enquiry form at ${org.web}`,
  ];

  try {
    await transport.sendMail({
      // From must be the authenticated mailbox or the provider will reject it.
      from: `"${org.name} website" <${SMTP_USER}>`,
      to: CONTACT_TO || org.emails[0],
      // So a reply in the inbox goes straight back to the enquirer.
      replyTo: `"${body.name}" <${body.email}>`,
      subject: `Project enquiry — ${body.company || body.name}`,
      text: lines.join('\n'),
    });
  } catch (error) {
    // Never surface SMTP internals to the browser.
    console.error('[contact] SMTP send failed:', error instanceof Error ? error.message : error);
    return NextResponse.json({ ok: false, reason: 'send-failed' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
