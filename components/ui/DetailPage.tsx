/**
 * The shell every detail page shares.
 *
 * The site is one long page carrying the story. Two sections had genuine depth
 * behind them — the six capabilities and the full project index — and leaving
 * them inline made the home page 21 screens, most of it detail that a reader
 * scrolls past on the way to something else. They live on their own pages now,
 * summarised on the home page with a link.
 *
 * The rule those pages follow: a reader who lands here from search, rather than
 * from the home page, must still be able to get to an enquiry without going
 * back. So every one of them ends with the contact CTA, and the crumb at the top
 * goes home rather than relying on the browser's back button.
 */

import { Button, Eyebrow } from '@/components/ui/primitives';
import { contact } from '@/content/site';

export function DetailPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <>
      {/* pt-32 clears the fixed nav, which is 4rem tall. */}
      <header className="relative isolate overflow-hidden bg-navy pb-16 pt-32 text-white md:pb-20 md:pt-40">
        <div className="shell flex flex-col gap-10">
          {/* The nav mark above already goes home; this is the orientation
              crumb, so it says where you are going rather than repeating the
              company name back at the reader. */}
          <a
            href="/"
            className="inline-flex w-max items-center gap-2 rounded-sm border border-white/20 bg-white/5 px-4 py-2.5 font-display text-xs font-semibold uppercase tracking-widest text-white/80 transition-colors duration-200 hover:border-red hover:bg-red hover:text-white"
          >
            <span aria-hidden="true">←</span>
            Home
          </a>

          <div className="flex flex-col gap-4">
            <Eyebrow tone="white">{eyebrow}</Eyebrow>
            <h1 className="text-h1 uppercase">{title}</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-white/70">{intro}</p>
          </div>
        </div>

        {/* The red line's identity, without joining the home page's continuity
            contract — this page is not one of its thirteen segments. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-1/2 h-16 w-[3px] -translate-x-1/2 bg-red"
        />
      </header>

      {children}

      <section
        aria-labelledby="detail-cta-heading"
        className="border-t border-ink/10 bg-paper py-section"
      >
        <div className="shell flex flex-col items-start gap-6">
          <h2 id="detail-cta-heading" className="text-h2 uppercase text-navy">
            {contact.title}
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-grey">
            {contact.form.note}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button href="/#contact">{contact.form.submit}</Button>
            <Button href="/" variant="secondary">
              Back to the main page
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
