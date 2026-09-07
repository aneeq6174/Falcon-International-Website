'use client';

/**
 * The full timeline, for /journey.
 *
 * Fourteen milestones, 1997 to 2026, hanging off the red line as their rail.
 * This used to sit inline on the home page at 3.2 screens — the second-longest
 * thing there after the capabilities list, and the same problem: detail a reader
 * scrolls through on the way somewhere else rather than reads.
 *
 * Before that it was 600vh of pinned horizontal camera, which is why the
 * milestones are a list now. Fourteen dated facts are a list.
 */

import { JourneyStructure } from '@/components/scenes/JourneyStructures';
import { gsap } from '@/lib/gsap';
import {
  ITEM_REVEAL_START,
  SCENE_BUILD_SELECTOR,
  buildScene,
  guaranteeReveal,
  settleScene,
} from '@/lib/scene';
import { useScrollScene } from '@/lib/useScrollScene';
import { journey } from '@/content/site';

export function JourneyDetail() {
  const rootRef = useScrollScene<HTMLDivElement>({
    build: ({ q }) => {
      const stations = q('[data-station]');
      if (stations.length === 0) return;

      stations.forEach((station) => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: station, start: ITEM_REVEAL_START, onEnter: guaranteeReveal },
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
      settleScene(q(SCENE_BUILD_SELECTOR));
      gsap.set(q('[data-station-card]'), { y: 0, opacity: 1 });
    },
  });

  return (
    <div ref={rootRef} className="bg-navy py-section text-white">
      <div className="shell">
        <ol className="relative md:pl-14">
          {/* The rail. A plain rule rather than a RedLine segment: this page is
              not part of the home page's thirteen-segment continuity contract. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 hidden w-[3px] bg-red md:block"
          />

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
                <h2 className="font-display text-lg font-semibold uppercase leading-tight tracking-tight text-white md:text-xl">
                  {m.title}
                </h2>
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
    </div>
  );
}
