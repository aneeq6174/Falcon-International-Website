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
 * If that endpoint is missing or unconfigured — a static build, or SMTP env vars
 * not set yet — the form FALLS BACK to composing the same enquiry in the
 * visitor's own mail app, addressed to the business address. So the form is
 * never a dead control, whatever the deployment looks like.
 *
 * The WhatsApp route sits beside it either way, and is likely the channel most
 * enquirers actually use.
 */

import { useCallback, useRef, useState } from 'react';
import { RedLine } from '@/components/RedLine';
import { FalconMark } from '@/components/scenes/FalconMark';
import { Button, Eyebrow } from '@/components/ui/primitives';
import { gsap } from '@/lib/gsap';
import { CONTACT_MARK_Y, hideStrand, revealStrand } from '@/lib/redline';
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
  /** Set when we fell back to the visitor's mail app and nothing happened. */
  const [mailStalled, setMailStalled] = useState(false);

  /** Compose the enquiry in the visitor's own mail app. The fallback path. */
  const openMailClient = useCallback(
    (data: FormData) => {
      const value = (k: string) => String(data.get(k) ?? '').trim();
      const lines = [
        `Name: ${value('name')}`,
        `Company: ${value('company')}`,
        `Email: ${value('email')}`,
        `Phone: ${value('phone') || '—'}`,
        `Service required: ${value('service')}`,
        '',
        'Message:',
        value('message'),
      ];
      const subject = `${form.mailSubject} — ${value('company') || value('name')}`;
      const href =
        `mailto:${org.emails[0]}` +
        `?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(lines.join('\n'))}`;

      // If the tab still has focus a moment later, no mail app took the link.
      const stalled = window.setTimeout(() => setMailStalled(true), 1200);
      const cancel = () => window.clearTimeout(stalled);
      window.addEventListener('blur', cancel, { once: true });
      window.addEventListener('pagehide', cancel, { once: true });

      window.location.href = href;
    },
    [form.mailSubject],
  );

  const onSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const el = formRef.current;
      if (!el || status === 'sending') return;

      const data = new FormData(el);
      setMailStalled(false);
      setStatus('sending');

      try {
        // Trailing slash deliberately: `trailingSlash: true` in next.config
        // would otherwise 308-redirect this POST on every submission.
        const response = await fetch('/api/contact/', { method: 'POST', body: data });

        if (response.ok) {
          setStatus('sent');
          el.reset();
          return;
        }

        // 503 means the endpoint exists but has no SMTP configured yet. Anything
        // else server-side is still better handled by letting them send it
        // themselves than by showing a dead end.
        setStatus('idle');
        openMailClient(data);
      } catch {
        // No endpoint at all (static build) or the network failed.
        setStatus('idle');
        openMailClient(data);
      }
    },
    [openMailClient, status],
  );

  const rootRef = useScrollScene<HTMLElement>(
    {
      runOnMobile: true,

      build: ({ conditions, q, root }) => {
        const strands = q('[data-strand]') as SVGPathElement[];
        const body = q('[data-falcon-body]')[0];
        const wings = q('[data-falcon-wing]') as SVGPathElement[];
        const word = q('[data-falcon-word]')[0];
        const panel = q('[data-contact-panel]')[0];
        if (!body || !panel) return;

        gsap.set(body, { transformOrigin: '50% 100%', scaleY: 0, opacity: 0 });
        wings.forEach((wing) => {
          const left = wing.dataset.side === 'left';
          // Inner edge: the left wing opens rightward, the right leftward.
          gsap.set(wing, { transformOrigin: left ? '100% 0%' : '0% 0%', scaleX: 0, opacity: 0 });
        });
        gsap.set(word, { opacity: 0, scale: 0.94, transformOrigin: '50% 100%' });
        gsap.set(panel, { opacity: 0, y: 24 });

        strands.forEach(hideStrand);

        /* ---- Mobile: no pin. One reveal on entry. ---------------------- */
        if (conditions.mobile) {
          gsap.to(strands, {
            strokeDashoffset: 0,
            ease: 'none',
            scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom 60%', scrub: true },
          });
          const tl = gsap.timeline({
            scrollTrigger: { trigger: root, start: 'top 72%', once: true },
          });
          tl.to(body, { scaleY: 1, opacity: 1, duration: 0.5, ease: 'power4.out' }, 0)
            .to(
              wings,
              { scaleX: 1, opacity: 1, duration: 0.6, ease: 'power4.out', stagger: 0.1 },
              0.3,
            )
            .to(word, { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }, 0.8)
            .to(panel, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 1.0);
          return;
        }

        /* ---- Desktop: one master trigger, 150vh of pinned scrub -------- */
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: '+=150%',
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            scrub: 1,
          },
        });

        // The line rises to meet the mark.
        tl.to(strands, { strokeDashoffset: 0, duration: 0.12 }, 0);

        // The mark redraws out of it: body, wings, wordmark.
        tl.to(body, { scaleY: 1, opacity: 1, duration: 0.16, ease: 'power4.out' }, BODY_AT);
        tl.to(
          wings,
          { scaleX: 1, opacity: 1, duration: 0.18, ease: 'power4.out', stagger: 0.05 },
          WINGS_AT,
        );
        tl.to(word, { opacity: 1, scale: 1, duration: 0.14, ease: 'power2.out' }, WORD_AT);

        // Only once the mark is complete.
        tl.to(panel, { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out' }, PANEL_AT);

        tl.set({}, {}, 1);
      },

      settle: ({ q }) => {
        (q('[data-strand]') as SVGPathElement[]).forEach(revealStrand);
        gsap.set(q('[data-falcon-body]'), { scaleY: 1, opacity: 1 });
        gsap.set(q('[data-falcon-wing]'), { scaleX: 1, opacity: 1 });
        gsap.set(q('[data-falcon-word]'), { opacity: 1, scale: 1 });
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
      className="relative isolate overflow-hidden bg-navy pt-section text-white md:h-[var(--vh)] md:pt-0"
    >
      <RedLine id="contact" driven onStrands={onStrands} />

      {/* The mark, where the line resolves. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 z-10 hidden justify-center md:flex"
        style={{ top: '7%', height: '27%' }}
      >
        <FalconMark className="h-full w-auto" />
      </div>

      <div
        data-contact-panel
        className="shell relative z-20 flex flex-col gap-10 md:absolute md:inset-x-0 md:bottom-0 md:gap-6 md:pb-4"
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
            /* No-JS fallback: the browser still hands the fields to a mail app. */
            action={`mailto:${org.emails[0]}`}
            method="post"
            encType="text/plain"
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
              ) : mailStalled ? (
                <span className="text-red">{form.noMailClient}</span>
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
