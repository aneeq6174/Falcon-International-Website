'use client';

/**
 * S8 — Capabilities, in summary.
 *
 * The six disciplines as a grid: what each one is, and the number that matters
 * about it. The scope lists, the full copy and the larger artwork live at
 * /capabilities.
 *
 * This was 4.6 screens inline — the longest thing on the page by some way, and
 * most of it scope lists a reader scrolls past on the way to something else.
 * Before that it was 500vh of pinned scroll with the six panels stacked and
 * cross-faded, so only the one at the current scroll offset existed at all.
 *
 * The red line still runs through here: this is one of the thirteen segments of
 * the continuous line, and shortening the section does not change that contract.
 */

import { useCallback, useState } from 'react';
import { RedLine } from '@/components/RedLine';
import { CapabilityScene } from '@/components/scenes/CapabilityScenes';
import { Button, Eyebrow } from '@/components/ui/primitives';
import { gsap } from '@/lib/gsap';
import { hideStrand, revealStrand } from '@/lib/redline';
import {
  ITEM_REVEAL_START,
  SCENE_BUILD_SELECTOR,
  SECTION_REVEAL_START,
  buildScene,
  countTween,
  guaranteeReveal,
  readCounters,
  resetCounters,
  settleCounters,
  settleScene,
} from '@/lib/scene';
import { useScrollScene } from '@/lib/useScrollScene';
import { capabilities } from '@/content/site';

export function S8Capabilities() {
  const [strandStructure, setStrandStructure] = useState('');
  const onStrands = useCallback((s: string) => setStrandStructure(s), []);

  const rootRef = useScrollScene<HTMLElement>(
    {
      build: ({ q, root }) => {
        const cards = q('[data-capability-card]');
        const strands = q('[data-strand]') as SVGPathElement[];
        const counters = readCounters(q('[data-count-to]'));
        if (cards.length === 0) return;

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

        resetCounters(counters);

        cards.forEach((card) => {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: card,
              start: ITEM_REVEAL_START,
              onEnter: guaranteeReveal,
            },
          });
          buildScene(tl, card, 0, 0.45);
          counters
            .filter((c) => card.contains(c.el))
            .forEach((c) => tl.add(countTween(c, 1.1), 0.12));
        });
      },

      settle: ({ q }) => {
        (q('[data-strand]') as SVGPathElement[]).forEach(revealStrand);
        settleScene(q(SCENE_BUILD_SELECTOR));
        settleCounters(readCounters(q('[data-count-to]')));
      },
    },
    [strandStructure],
  );

  return (
    <section
      ref={rootRef}
      id="capabilities"
      aria-labelledby="capabilities-heading"
      className="relative isolate overflow-hidden bg-navy py-section text-white"
    >
      <RedLine id="capabilities" driven onStrands={onStrands} />

      <div className="shell relative z-10 flex flex-col gap-12">
        <header className="flex flex-col gap-4">
          <Eyebrow tone="white">{capabilities.eyebrow}</Eyebrow>
          <h2 id="capabilities-heading" className="text-h2 uppercase">
            {capabilities.title}
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-white/70">
            {capabilities.summary}
          </p>
        </header>

        <ul className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.items.map((capability, i) => (
            <li
              key={capability.id}
              data-capability-card
              className="flex flex-col gap-4 border-t border-white/12 pt-6"
            >
              <div aria-hidden="true" className="h-20">
                <CapabilityScene scene={capability.scene} className="h-full w-full" />
              </div>

              <p
                aria-hidden="true"
                className="tabular font-display text-xs font-bold tracking-widest text-red"
              >
                {String(i + 1).padStart(2, '0')}
              </p>

              <h3 className="font-display text-lg font-semibold uppercase leading-tight tracking-tight text-white">
                {capability.title}
              </h3>

              {capability.counter ? (
                <p className="tabular font-display text-2xl font-bold leading-none text-red">
                  <span data-count-to={capability.counter.value} data-count-from={0}>
                    {capability.counter.value.toLocaleString('en-US')}
                  </span>
                  {capability.counter.suffix ? (
                    <span aria-hidden="true">{capability.counter.suffix}</span>
                  ) : null}
                  <span className="ml-2 align-middle font-body text-xs font-normal uppercase tracking-widest text-white/50">
                    {capability.counter.label}
                  </span>
                </p>
              ) : null}

              <p className="text-sm leading-relaxed text-white/65">{capability.body}</p>
            </li>
          ))}
        </ul>

        <div>
          <Button href="/capabilities/">{capabilities.cta}</Button>
        </div>
      </div>
    </section>
  );
}
