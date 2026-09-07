'use client';

/**
 * S3 — The Journey. 1997 → 2026, fourteen milestones.
 *
 * ── Why this is no longer a horizontal camera ─────────────────────────────
 *
 * It used to be 600vh of pinned scroll driving a camera sideways through one
 * continuous world. It demonstrated well and read badly. Six screen-heights of
 * scrolling produced no downward movement, and because every card was tied to
 * an exact scroll offset, each milestone was legible only in a narrow band —
 * scroll at a natural speed and 1997 to 2026 went by in a blur you could not
 * get back without hunting for the pixel it lived at.
 *
 * Fourteen dated facts are a list. So this is a list: a vertical timeline
 * hanging off the red line, which is the rail. Each milestone assembles once as
 * it comes into view and then stays put, so the reader can stop anywhere, go
 * back, or skim the whole 29 years in one pass.
 *
 * ── The rail ──────────────────────────────────────────────────────────────
 *
 * The red line runs down the left of the list rather than through the middle of
 * it, and `journeyStrands` measures `[data-journey-rail]` to find that edge so
 * the line and the layout cannot drift apart. Each milestone's top rule meets
 * it as a tick.
 */

import { useCallback, useState } from 'react';
import { RedLine } from '@/components/RedLine';
import { JourneyStructure } from '@/components/scenes/JourneyStructures';
import { Eyebrow } from '@/components/ui/primitives';
import { gsap } from '@/lib/gsap';
import { hideStrand, revealStrand } from '@/lib/redline';
import { ITEM_REVEAL_START, SCENE_BUILD_SELECTOR, SECTION_REVEAL_START, buildScene, guaranteeReveal, settleScene } from '@/lib/scene';
import { useScrollScene } from '@/lib/useScrollScene';
import { journey } from '@/content/site';

export function S3Journey() {
  const [strandStructure, setStrandStructure] = useState('');
  const onStrands = useCallback((s: string) => setStrandStructure(s), []);

  const rootRef = useScrollScene<HTMLElement>(
    {
      build: ({ q, root }) => {
        const stations = q('[data-station]');
        const strands = q('[data-strand]') as SVGPathElement[];
        if (stations.length === 0) return;

        // The rail draws itself once as the section arrives, and stays drawn.
        // It used to be scrubbed, which meant scrolling back up un-drew it —
        // the same "where did it go" problem as the pins, in miniature.
        strands.forEach(hideStrand);
        gsap.to(strands, {
          strokeDashoffset: 0,
          ease: 'power1.inOut',
          scrollTrigger: { trigger: root, start: SECTION_REVEAL_START, once: true, onEnter: guaranteeReveal },
          duration: 0.9,
        });

        // One short build per milestone, played once on entry and left alone.
        stations.forEach((station) => {
          const tl = gsap.timeline({
            scrollTrigger: { trigger: station, start: ITEM_REVEAL_START, once: true, onEnter: guaranteeReveal },
          });
          buildScene(tl, station, 0, 0.45);
          tl.fromTo(
            station.querySelector('[data-station-card]'),
            { y: 14, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.45, ease: 'power2.out' },
            0,
          );
        });
      },

      settle: ({ q }) => {
        (q('[data-strand]') as SVGPathElement[]).forEach(revealStrand);
        settleScene(q(SCENE_BUILD_SELECTOR));
        gsap.set(q('[data-station-card]'), { y: 0, opacity: 1 });
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

      <div className="shell relative z-10">
        <header className="flex flex-col gap-3">
          <Eyebrow tone="white">{journey.eyebrow}</Eyebrow>
          <h2 id="journey-heading" className="text-h2 uppercase">
            {journey.title}
          </h2>
        </header>

        {/*
          The list sits to the right of the rail. `journeyStrands` measures this
          element's left edge, so the padding below and the red line stay in
          agreement without either knowing the other's number.
        */}
        <ol data-journey-rail className="mt-12 md:mt-16 md:pl-14">
          {journey.milestones.map((m, i) => (
            <li
              key={`${m.year}-${m.title}`}
              data-station
              data-station-index={i}
              data-scene={m.scene}
              className="grid grid-cols-1 items-center gap-x-8 gap-y-4 border-t border-white/12 py-8 md:grid-cols-12 md:py-10"
            >
              <p className="tabular font-display text-[clamp(1.6rem,2.4vw,2.25rem)] font-bold leading-none text-red md:col-span-2">
                {m.year}
              </p>

              <div data-station-card className="flex flex-col gap-2 md:col-span-6">
                <h3 className="font-display text-lg font-semibold uppercase leading-tight tracking-tight text-white md:text-xl">
                  {m.title}
                </h3>
                <p className="max-w-prose text-sm leading-relaxed text-white/65">{m.body}</p>
              </div>

              {/* Decorative: the copy already says what happened. */}
              <div
                aria-hidden="true"
                className="pointer-events-none hidden h-24 w-full md:col-span-4 md:block"
              >
                <JourneyStructure scene={m.scene} className="h-full w-full" />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
