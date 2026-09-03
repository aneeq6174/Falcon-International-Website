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

/**
 * Health check. Visit /api/contact/ in a browser to see whether the SMTP
 * variables actually reached this function.
 *
 * Reports only whether each value is PRESENT — never the values themselves, so
 * this is safe on a public endpoint. `configured: false` here means the
 * variables were set in Vercel after the current deployment was built: they are
 * baked in at build time, so a redeploy is required.
 */
export async function GET() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  return NextResponse.json({
    configured: Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS),
    hasHost: Boolean(SMTP_HOST),
    hasUser: Boolean(SMTP_USER),
    hasPass: Boolean(SMTP_PASS),
    port: SMTP_PORT ?? '587 (default)',
  });
}

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
    // Shared cPanel mail servers very often present a certificate issued for the
    // hosting box (e.g. server42.hostprovider.com) rather than for the mail
    // domain, so the TLS name check fails and nodemailer aborts with
    // ERR_TLS_CERT_ALTNAME_INVALID / SELF_SIGNED_CERT_IN_CHAIN. Setting
    // SMTP_INSECURE_TLS=1 keeps the connection encrypted but stops verifying who
    // is on the other end. Only use it when the host is the client's own mail
    // server and the certificate mismatch has been confirmed as the cause.
    ...(process.env.SMTP_INSECURE_TLS === '1'
      ? { tls: { rejectUnauthorized: false } }
      : {}),
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
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
    // The full error goes to the server log only. The browser gets nodemailer's
    // short error CODE — never the message, which can echo the host, the
    // username, or the server's rejection text back to a stranger.
    //
    // The code is what identifies the fault:
    //   EAUTH      credentials rejected — wrong password, or the provider wants
    //              an App Password rather than the mailbox password
    //   ECONNECTION / ETIMEDOUT / ESOCKET
    //              could not reach the host — wrong host or port, or the mail
    //              server refuses connections from outside its own network
    //   ESOCKET with a certificate reason — TLS name mismatch, see SMTP_INSECURE_TLS
    //   EENVELOPE  the host refused the from/to addresses
    console.error('[contact] SMTP send failed:', error);
    const code =
      typeof error === 'object' && error !== null && 'code' in error
        ? String((error as { code: unknown }).code).slice(0, 40)
        : 'unknown';
    return NextResponse.json({ ok: false, reason: 'send-failed', code }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
