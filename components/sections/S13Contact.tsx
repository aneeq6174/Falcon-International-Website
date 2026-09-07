'use client';

/**
 * S13 — Contact. THE LOOP CLOSES.
 *
 * Pinned for 150vh. The red line rises from S12 and, over the scroll, the Falcon
 * mark redraws itself out of it: the body first, then each wing sweeping outward
 * from the centre, then the arced wordmark. Only once the mark is complete does
 * the contact panel come up beneath it.
 *
 * That order matters. The line has run the entire length of the page as one
 * continuous thing, and this is where it resolves into the company's own mark —
 * so the mark has to finish before anything else asks for attention.
 *
 * ── The wings ─────────────────────────────────────────────────────────────
 *
 * Each wing sweeps from its INNER edge outward, so transform-origin is set per
 * side: the left wing opens from its right edge, the right from its left. That
 * is what makes it read as wings spreading rather than two shapes scaling up.
 *
 * ── How the enquiry is delivered ──────────────────────────────────────────
 *
 * Posted to `/api/contact`, which sends it through the company's own mailbox
 * over SMTP. No form service, no third party holding the data. The visitor gets
 * a real confirmation and never leaves the page.
 *
 * There is deliberately NO mailto fallback anywhere in this form — not on
 * failure, not as a no-JS action. Handing the fields to the visitor's mail app
 * surfaces a misconfiguration as a confusing "choose an application" dialog, and
 * an enquiry the business never receives. If the send fails, the form says so and
 * points at WhatsApp and the address, both of which are on the page anyway.
 */

import { useCallback, useRef, useState } from 'react';
import { RedLine } from '@/components/RedLine';
import { FalconMark } from '@/components/scenes/FalconMark';
import { Button, Eyebrow } from '@/components/ui/primitives';
import { gsap } from '@/lib/gsap';
import { CONTACT_MARK_Y, hideStrand, revealStrand } from '@/lib/redline';
import { SECTION_REVEAL_START, guaranteeReveal } from '@/lib/scene';
import { useScrollScene } from '@/lib/useScrollScene';
import { contact, org, whatsapp } from '@/content/site';

const fieldClasses =
  'w-full border border-white/20 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-red focus:outline-none';

const labelClasses = 'eyebrow text-white/60';

/** The mark redraws over the first two thirds; the panel follows. */
const BODY_AT = 0.12;
const WINGS_AT = 0.3;
const WORD_AT = 0.52;
const PANEL_AT = 0.66;

export function S13Contact() {
  const [strandStructure, setStrandStructure] = useState('');
  const onStrands = useCallback((s: string) => setStrandStructure(s), []);
  const { blocks, form, footer } = contact;

  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  /** The server's `reason`, surfaced to the console for diagnosis. */
  const [failure, setFailure] = useState<string>('');

  /**
   * Submits to /api/contact, which sends through the company's own mailbox.
   *
   * There is deliberately NO automatic mailto fallback. An earlier version opened
   * the visitor's mail app whenever the endpoint failed, which meant a
   * misconfiguration surfaced as a confusing "choose an application" dialog
   * instead of an error anyone could act on. If sending fails the form says so
   * and points at WhatsApp — the channel that always works.
   *
   * The failure `reason` is logged to the console so a misconfiguration can be
   * diagnosed from the browser without reading server logs.
   */
  const onSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const el = formRef.current;
      if (!el || status === 'sending') return;

      setFailure('');
      setStatus('sending');

      try {
        // Trailing slash deliberately: `trailingSlash: true` in next.config
        // would otherwise 308-redirect this POST on every submission.
        const response = await fetch('/api/contact/', {
          method: 'POST',
          body: new FormData(el),
        });

        if (response.ok) {
          setStatus('sent');
          el.reset();
          return;
        }

        const { reason, code } = await response
          .json()
          .then((body: { reason?: string; code?: string }) => ({
            reason: body?.reason ?? String(response.status),
            code: body?.code,
          }))
          .catch(() => ({ reason: String(response.status), code: undefined }));

        console.error(
          `[contact] send failed — HTTP ${response.status}, reason: ${reason}` +
            `${code ? `, code: ${code}` : ''}\n` +
            'unconfigured → the SMTP variables are not reaching the function; they are\n' +
            '  baked in at build time, so redeploy after setting them.\n' +
            'send-failed → the variables arrived but the mail server refused. Read the code:\n' +
            '  EAUTH = wrong password (or the provider wants an App Password)\n' +
            '  ECONNECTION / ETIMEDOUT / ESOCKET = wrong host or port, or the mail\n' +
            '  server will not accept connections from outside its own network.',
        );
        setFailure(reason);
        setStatus('error');
      } catch (error) {
        console.error('[contact] request failed:', error);
        setFailure('network');
        setStatus('error');
      }
    },
    [status],
  );

  const rootRef = useScrollScene<HTMLElement>(
    {
      runOnMobile: true,

      build: ({ conditions, q, root }) => {
        const strands = q('[data-strand]') as SVGPathElement[];
        const glyph = q('[data-falcon-mark]')[0];
        const panel = q('[data-contact-panel]')[0];
        if (!glyph || !panel) return;

        gsap.set(glyph, { opacity: 0, scale: 0.94, transformOrigin: '50% 50%' });
        gsap.set(panel, { opacity: 0, y: 24 });

        strands.forEach(hideStrand);

        /* One reveal on entry, at every width. Nothing pins, nothing scrubs. */
        gsap.to(strands, {
          strokeDashoffset: 0,
          ease: 'power1.inOut',
          scrollTrigger: { trigger: root, start: SECTION_REVEAL_START, once: true, onEnter: guaranteeReveal },
          duration: 0.9,
        });
        const tl = gsap.timeline({
          scrollTrigger: { trigger: root, start: SECTION_REVEAL_START, once: true, onEnter: guaranteeReveal },
        });
        tl.to(glyph, { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' }, 0)
          .to(panel, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.35);

      },

      settle: ({ q }) => {
        (q('[data-strand]') as SVGPathElement[]).forEach(revealStrand);
        gsap.set(q('[data-falcon-mark]'), { opacity: 1, scale: 1 });
        gsap.set(q('[data-contact-panel]'), { opacity: 1, y: 0 });
      },
    },
    [strandStructure],
  );

  return (
    <section
      ref={rootRef}
      id="contact"
      aria-labelledby="contact-heading"
      className="relative isolate overflow-hidden bg-navy py-section text-white"
    >
      <RedLine id="contact" driven onStrands={onStrands} />

      {/* The mark, where the line resolves. */}
      <div
        aria-hidden="true"
        className="pointer-events-none relative z-10 mb-12 hidden h-32 justify-center md:flex lg:h-40"
      >
        <FalconMark className="h-full w-auto" />
      </div>

      <div
        data-contact-panel
        className="shell relative z-20 flex flex-col gap-10"
      >
        <header className="flex flex-col gap-2">
          <Eyebrow tone="white">{contact.eyebrow}</Eyebrow>
          <h2 id="contact-heading" className="text-h2 uppercase">
            {contact.title}
          </h2>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,18rem)_1fr] lg:gap-14">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            <div className="flex flex-col gap-1">
              <Eyebrow tone="white">{blocks.headOfficeLabel}</Eyebrow>
              <p className="text-sm leading-relaxed text-white/75">{blocks.headOffice}</p>
            </div>

            <div className="flex flex-col gap-1">
              <Eyebrow tone="white">{blocks.contactLabel}</Eyebrow>
              {org.phones.map((phone) => (
                <a
                  key={phone}
                  href={`tel:${phone.replace(/\s/g, '')}`}
                  className="text-sm text-white/75 transition-colors hover:text-red"
                >
                  {phone}
                </a>
              ))}
            </div>

            <div className="flex flex-col gap-1">
              <Eyebrow tone="white">{blocks.emailLabel}</Eyebrow>
              {org.emails.map((email) => (
                <a
                  key={email}
                  href={`mailto:${email}`}
                  className="break-all text-sm text-white/75 transition-colors hover:text-red"
                >
                  {email}
                </a>
              ))}
            </div>

            <div className="flex flex-col gap-1">
              <Eyebrow tone="white">{blocks.webLabel}</Eyebrow>
              <a href={org.url} className="text-sm text-white/75 transition-colors hover:text-red">
                {org.web}
              </a>
            </div>
          </div>

          <form
            ref={formRef}
            onSubmit={onSubmit}
            className="flex flex-col gap-4"
          >
            <fieldset className="flex flex-col gap-4 border-0 p-0">
              <legend className="sr-only">{form.legend}</legend>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" className={labelClasses}>
                    {form.fields.name.label}
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder={form.fields.name.placeholder}
                    className={fieldClasses}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="company" className={labelClasses}>
                    {form.fields.company.label}
                  </label>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    required
                    autoComplete="organization"
                    placeholder={form.fields.company.placeholder}
                    className={fieldClasses}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className={labelClasses}>
                    {form.fields.email.label}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder={form.fields.email.placeholder}
                    className={fieldClasses}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="phone" className={labelClasses}>
                    {form.fields.phone.label}
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder={form.fields.phone.placeholder}
                    className={fieldClasses}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="service" className={labelClasses}>
                    {form.fields.service.label}
                  </label>
                  <select id="service" name="service" required className={fieldClasses}>
                    {form.serviceOptions.map((option) => (
                      <option key={option} value={option} className="bg-navy">
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="message" className={labelClasses}>
                    {form.fields.message.label}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={2}
                    required
                    placeholder={form.fields.message.placeholder}
                    className={`${fieldClasses} resize-y`}
                  />
                </div>
              </div>
            </fieldset>

            {/*
              Honeypot. Invisible to people, irresistible to bots — anything in
              here means the submission is automated. Cheaper and less hostile
              than a captcha, and it costs a real visitor nothing.
            */}
            <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden">
              <label htmlFor="website">Do not fill this in</label>
              <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Button type="submit" variant="primary">
                {status === 'sending' ? form.sending : status === 'sent' ? form.sent : form.submit}
              </Button>
              <a
                href={`https://wa.me/${org.whatsapp}?text=${encodeURIComponent(whatsapp.message)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-display text-xs font-semibold uppercase tracking-widest text-white/70 underline underline-offset-4 transition-colors hover:text-red"
              >
                {whatsapp.label}
              </a>
              <p className="text-xs text-white/50">{form.note}</p>
            </div>

            <p aria-live="polite" className="text-xs leading-relaxed">
              {status === 'sent' ? (
                <span className="text-white">{form.sentNote}</span>
              ) : status === 'error' ? (
                <span className="text-red">
                  {form.failed}{' '}
                  <a
                    href={`https://wa.me/${org.whatsapp}?text=${encodeURIComponent(whatsapp.message)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4"
                  >
                    {whatsapp.label}
                  </a>
                  {' · '}
                  <a href={`mailto:${org.emails[0]}`} className="underline underline-offset-4">
                    {org.emails[0]}
                  </a>
                  {/* Only visible to whoever is debugging; never to a visitor. */}
                  <span className="sr-only">{failure}</span>
                </span>
              ) : (
                <span className="sr-only" />
              )}
            </p>
          </form>
        </div>

        <footer className="flex flex-col gap-1.5 border-t border-white/10 py-4">
          <p className="font-display text-sm font-semibold uppercase tracking-wider text-white">
            {footer.line1}
          </p>
          <p className="text-xs uppercase tracking-widest text-white/50">{footer.line2}</p>
          <p className="text-xs text-white/40">{footer.line3}</p>
        </footer>
      </div>
    </section>
  );
}
