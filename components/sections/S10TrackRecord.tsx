'use client';

/**
 * S10 — Track record, in summary.
 *
 * The most recent contracts and the size of the book. The full filterable index
 * — every project since 1998 — lives at /track-record.
 *
 * All thirty-plus rows used to be here, server-rendered behind a filter, which
 * was 2.9 screens of table on a page a reader was already scrolling a long way
 * down. The filter is the reason to have a page of its own: it is a tool, and
 * people reach for a tool deliberately rather than meeting one in passing.
 */

import { RedLine } from '@/components/RedLine';
import {
  Button,
  Eyebrow,
  SECTION_SHELL,
  SectionBody,
  sectionTone,
} from '@/components/ui/primitives';
import { gsap } from '@/lib/gsap';
import { SECTION_REVEAL_START, guaranteeReveal } from '@/lib/scene';
import { useScrollScene } from '@/lib/useScrollScene';
import { trackRecord } from '@/content/site';

/** The most recent contracts. The rest are one click away. */
const HIGHLIGHTS = trackRecord.projects.slice(-6).reverse();

export function S10TrackRecord() {
  const rootRef = useScrollScene<HTMLElement>({
    build: ({ q, root }) => {
      const rows = q('[data-highlight-row]');
      if (rows.length === 0) return;

      gsap.fromTo(
        rows,
        { y: 14, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
          stagger: 0.06,
          scrollTrigger: {
            trigger: root,
            start: SECTION_REVEAL_START,
            onEnter: guaranteeReveal,
          },
        },
      );
    },

    settle: ({ q }) => {
      gsap.set(q('[data-highlight-row]'), { y: 0, opacity: 1 });
    },
  });

  return (
    <section
      ref={rootRef}
      id="track-record"
      aria-labelledby="track-record-heading"
      className={`${SECTION_SHELL} ${sectionTone.white}`}
    >
      <RedLine id="track-record" />

      <SectionBody className="flex flex-col gap-10">
        <header className="flex flex-col gap-4">
          <Eyebrow>{trackRecord.eyebrow}</Eyebrow>
          <h2 id="track-record-heading" className="text-h2 uppercase text-navy">
            {trackRecord.title}
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-grey">
            {trackRecord.summary}
          </p>
        </header>

        <div className="flex flex-col gap-4">
          <p className="eyebrow text-grey">{trackRecord.highlightsLabel}</p>

          <ul className="flex flex-col border-t border-ink/10">
            {HIGHLIGHTS.map((project) => (
              <li
                key={`${project.year}-${project.client}-${project.scope}`}
                data-highlight-row
                className="grid grid-cols-[5.5rem_1fr] gap-x-6 gap-y-1 border-b border-ink/10 py-5 md:grid-cols-[7rem_minmax(0,14rem)_1fr]"
              >
                <span className="tabular font-display text-sm font-bold text-red">
                  {project.year}
                </span>
                <span className="font-display text-sm font-semibold uppercase tracking-tight text-navy">
                  {project.client}
                </span>
                <span className="col-start-2 text-sm leading-relaxed text-grey md:col-start-3">
                  {project.scope}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
          <Button href="/track-record/">{trackRecord.cta}</Button>
          <p className="text-xs uppercase tracking-widest text-grey">
            {trackRecord.projects.length} projects since {trackRecord.projects[0].year}
          </p>
        </div>
      </SectionBody>
    </section>
  );
}
