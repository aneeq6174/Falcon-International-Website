'use client';

/**
 * S3 — The Journey, in summary.
 *
 * Four milestones out of fourteen: where the company started, and the three
 * most recent things it has done. The full timeline is at /journey.
 *
 * It has been three things now, and the direction of travel is the point. It
 * started as 600vh of pinned horizontal camera, which meant each milestone was
 * legible only at one exact scroll offset. It became a vertical list of all
 * fourteen, which was correct but 3.2 screens long — the second-longest thing
 * on the home page. Fourteen dated facts are worth reading deliberately, and a
 * reader passing through on the way to the contact form is not doing that.
 */

import { useCallback, useState } from 'react';
import { RedLine } from '@/components/RedLine';
import { Button, Eyebrow } from '@/components/ui/primitives';
import { gsap } from '@/lib/gsap';
import { hideStrand, revealStrand } from '@/lib/redline';
import { SECTION_REVEAL_START, guaranteeReveal } from '@/lib/scene';
import { useScrollScene } from '@/lib/useScrollScene';
import { journey } from '@/content/site';

/**
 * The founding, then the three most recent. Sliced rather than hand-picked, so
 * adding a milestone to the content file updates this without anyone having to
 * remember that it exists.
 */
const HIGHLIGHTS = [journey.milestones[0], ...journey.milestones.slice(-3)];

export function S3Journey() {
  const [strandStructure, setStrandStructure] = useState('');
  const onStrands = useCallback((s: string) => setStrandStructure(s), []);

  const rootRef = useScrollScene<HTMLElement>(
    {
      build: ({ q, root }) => {
        const rows = q('[data-milestone]');
        const strands = q('[data-strand]') as SVGPathElement[];
        if (rows.length === 0) return;

        strands.forEach(hideStrand);
        gsap.to(strands, {
          strokeDashoffset: 0,
          ease: 'power1.inOut',
          duration: 0.9,
          scrollTrigger: {
            trigger: root,
            start: SECTION_REVEAL_START,
            onEnter: guaranteeReveal,
          },
        });

        gsap.fromTo(
          rows,
          { y: 14, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: 'power2.out',
            stagger: 0.07,
            scrollTrigger: {
              trigger: root,
              start: SECTION_REVEAL_START,
              onEnter: guaranteeReveal,
            },
          },
        );
      },

      settle: ({ q }) => {
        (q('[data-strand]') as SVGPathElement[]).forEach(revealStrand);
        gsap.set(q('[data-milestone]'), { y: 0, opacity: 1 });
      },
    },
    [strandStructure],
  );

  return (
    <section
      ref={rootRef}
      id="journey"
      aria-labelledby="journey-heading"
      className="relative isolate overflow-hidden bg-navy py-section text-white"
    >
      <RedLine id="journey" driven onStrands={onStrands} />

      <div className="shell relative z-10 flex flex-col gap-10">
        <header className="flex flex-col gap-4">
          <Eyebrow tone="white">{journey.eyebrow}</Eyebrow>
          <h2 id="journey-heading" className="text-h2 uppercase">
            {journey.title}
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-white/70">{journey.summary}</p>
        </header>

        <div className="flex flex-col gap-4">
          <p className="eyebrow text-white/50">{journey.highlightsLabel}</p>

          <ol className="flex flex-col border-t border-white/12">
            {HIGHLIGHTS.map((m) => (
              <li
                key={`${m.year}-${m.title}`}
                data-milestone
                className="grid grid-cols-1 items-baseline gap-x-8 gap-y-2 border-b border-white/12 py-6 md:grid-cols-12"
              >
                <p className="tabular font-display text-2xl font-bold leading-none text-red md:col-span-2">
                  {m.year}
                </p>
                <h3 className="font-display text-base font-semibold uppercase leading-tight tracking-tight text-white md:col-span-4">
                  {m.title}
                </h3>
                <p className="text-sm leading-relaxed text-white/65 md:col-span-6">{m.body}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
          <Button href="/journey/">{journey.cta}</Button>
          <p className="text-xs uppercase tracking-widest text-white/50">
            {journey.milestones.length} milestones since {journey.milestones[0].year}
          </p>
        </div>
      </div>
    </section>
  );
}
