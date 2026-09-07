'use client';

/**
 * The six capabilities in full, for /capabilities.
 *
 * This used to sit inline on the home page, where it was 4.6 screens — the
 * single longest thing on a 21-screen page, and mostly scope lists that a reader
 * scrolls past on the way somewhere else. The home page now carries a summary
 * and links here.
 *
 * Each panel builds once as it comes into view and stays. No red line: this page
 * is not one of the home page's thirteen continuity segments, and threading a
 * fourteenth through it would mean the contract no longer describes one line.
 */

import { CapabilityScene } from '@/components/scenes/CapabilityScenes';
import { ScopeList } from '@/components/ui/primitives';
import { gsap } from '@/lib/gsap';
import {
  ITEM_REVEAL_START,
  SCENE_BUILD_SELECTOR,
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

const STEPS = capabilities.items.length;

export function CapabilitiesDetail() {
  const rootRef = useScrollScene<HTMLDivElement>({
    build: ({ q }) => {
      const panels = q('[data-capability-panel]');
      const counters = readCounters(q('[data-count-to]'));
      if (panels.length === 0) return;

      resetCounters(counters);

      panels.forEach((panel) => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: panel, start: ITEM_REVEAL_START, onEnter: guaranteeReveal },
        });
        buildScene(tl, panel, 0, 0.5);
        counters
          .filter((c) => panel.contains(c.el))
          .forEach((c) => tl.add(countTween(c, 1.2), 0.15));
      });
    },

    settle: ({ q }) => {
      settleScene(q(SCENE_BUILD_SELECTOR));
      settleCounters(readCounters(q('[data-count-to]')));
      gsap.set(q('[data-capability-panel]'), { opacity: 1 });
    },
  });

  return (
    <div ref={rootRef} className="bg-navy py-section text-white">
      <div className="shell flex flex-col gap-16 md:gap-24">
        {capabilities.items.map((capability, i) => (
          <article
            key={capability.id}
            id={capability.id}
            data-capability-panel
            className="relative border-t border-white/12 pt-10 md:pt-12"
          >
            <div className="grid gap-x-10 gap-y-8 md:items-center lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
              <div className="flex flex-col gap-5">
                <p
                  aria-hidden="true"
                  className="tabular font-display text-xs font-bold tracking-widest text-red"
                >
                  {String(i + 1).padStart(2, '0')} / {String(STEPS).padStart(2, '0')}
                </p>

                <h2 className="font-display text-h2 uppercase leading-none text-white">
                  {capability.title}
                </h2>

                {capability.counter ? (
                  <p className="tabular font-display text-h2 font-bold leading-none text-red">
                    <span data-count-to={capability.counter.value} data-count-from={0}>
                      {capability.counter.value.toLocaleString('en-US')}
                    </span>
                    {capability.counter.suffix ? (
                      <span aria-hidden="true">{capability.counter.suffix}</span>
                    ) : null}
                    <span className="ml-3 align-middle font-body text-sm font-normal uppercase tracking-widest text-white/50">
                      {capability.counter.label}
                    </span>
                  </p>
                ) : null}

                <p className="max-w-xl text-sm leading-relaxed text-white/70">
                  {capability.body}
                </p>

                <ScopeList
                  items={capability.scope}
                  label={capabilities.scopeLabel}
                  tone="white"
                />
              </div>

              {/*
                Explicit height below the breakpoint. In the single-column
                layout the scene is its own grid row, so the row height is
                content-driven and an `h-full` SVG resolves against zero and
                collapses.
              */}
              <div className="h-56 sm:h-64 lg:h-auto">
                <CapabilityScene scene={capability.scene} className="h-full w-full" />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
