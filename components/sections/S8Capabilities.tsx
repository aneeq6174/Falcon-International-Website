'use client';

/**
 * S8 — Capabilities. ★ SECOND CENTREPIECE
 *
 * Six services, listed down the page. This was 500vh of pinned scroll with the
 * pipe with six valves; each scroll step quarter-turns the next valve open, red
 * charges down that branch, and the matching service takes the stage below while
 * the previous one wipes downward out of frame.
 *
 * ── The step model ────────────────────────────────────────────────────────
 *
 * One master ScrollTrigger. The timeline is authored as fractions of a duration
 * pinned to exactly 1, and `stepAt(i)` is the single source of truth for where
 * service i begins — the same discipline as S3, and for the same reason: a cue
 * placed past 1 stretches the duration and silently shifts every other cue.
 *
 * Valves stay open once turned. By the last step the manifold is visibly feeding
 * all six branches, which is the point of drawing it as a manifold at all.
 *
 * ── The wipe ──────────────────────────────────────────────────────────────
 *
 * Panels are stacked absolutely on one stage. The outgoing panel translates down
 * and fades; the incoming one BUILDS rather than sliding in, using the shared
 * `data-build` vocabulary. Transform and opacity only — no clip-path, no height.
 *
 * ── One DOM, two layouts ──────────────────────────────────────────────────
 *
 * Below 768px the panels stop being absolute and simply stack, each building
 * once on entry. No pin, no scrub, no manifold. Same markup.
 */

import { useCallback, useState } from 'react';
import { RedLine } from '@/components/RedLine';
import { CapabilityScene } from '@/components/scenes/CapabilityScenes';
import { Eyebrow, ScopeList } from '@/components/ui/primitives';
import { gsap } from '@/lib/gsap';
import {
  hideStrand,
  revealStrand,
} from '@/lib/redline';
import {
  SCENE_BUILD_SELECTOR,
  buildScene,
  countTween,
  readCounters,
  resetCounters,
  settleCounters,
  settleScene,
  guaranteeReveal,
} from '@/lib/scene';
import { useScrollScene } from '@/lib/useScrollScene';
import { capabilities } from '@/content/site';

const STEPS = capabilities.items.length; // 6

/**
 * A held beat while the header pipe draws across, before the first valve opens.
 * Without it the first service would have to assemble on a manifold that is not
 * there yet.
 */
const INTRO = 0.07;

const STEP_DUR = (1 - INTRO) / STEPS;

/** Progress at which service i takes the stage. */
const stepAt = (i: number) => INTRO + i * STEP_DUR;

export function S8Capabilities() {
  const [strandStructure, setStrandStructure] = useState('');
  const onStrands = useCallback((s: string) => setStrandStructure(s), []);

  const rootRef = useScrollScene<HTMLElement>(
    {
      runOnMobile: true,

      build: ({ conditions, q, root }) => {
        const panels = q('[data-capability-panel]');
        const strands = q('[data-strand]') as SVGPathElement[];
        const counters = readCounters(q('[data-count-to]'));
        if (panels.length === 0) return;

        const handles = q('[data-valve-handle]');
        const fills = q('[data-valve-fill]');

        /* ---- Mobile: no pin, no manifold. One build per panel. --------- */
        strands.forEach(hideStrand);
        gsap.to(strands, {
          strokeDashoffset: 0,
          ease: 'power1.inOut',
          scrollTrigger: { trigger: root, start: 'top 85%', once: true, onEnter: guaranteeReveal },
          duration: 0.9,
        });

        resetCounters(counters);

        panels.forEach((panel, i) => {
          const tl = gsap.timeline({
            scrollTrigger: { trigger: panel, start: 'top 78%', once: true, onEnter: guaranteeReveal },
          });
          buildScene(tl, panel, 0, 0.5);
          const own = counters.filter((c) => panel.contains(c.el));
          own.forEach((c) => tl.add(countTween(c, 1.2), 0.15));
          void i;
        });

      },

      settle: ({ q }) => {
        // Reduced motion: manifold drawn, every valve open, every service built
        // and readable at once — the section as a plain list of six capabilities.
        (q('[data-strand]') as SVGPathElement[]).forEach(revealStrand);
        settleScene(q(SCENE_BUILD_SELECTOR));
        settleCounters(readCounters(q('[data-count-to]')));
        gsap.set(q('[data-valve-handle]'), { rotate: 90, transformOrigin: '50% 50%' });
        gsap.set(q('[data-valve-fill]'), { opacity: 1 });
        gsap.set(q('[data-capability-panel]'), { yPercent: 0, opacity: 1 });
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

      <div className="shell relative z-30">
        <header className="flex flex-col gap-3">
          <Eyebrow tone="white">{capabilities.eyebrow}</Eyebrow>
          <h2 id="capabilities-heading" className="text-h2 uppercase">
            {capabilities.title}
          </h2>
        </header>
      </div>


      {/*
        Six capabilities, one after another down the page. They used to be
        stacked absolutely and cross-faded by a 500vh pin, which meant only the
        one at the current scroll offset existed — the rest were invisible and
        unreachable. They are a list, so they are laid out as one.
      */}
      <div className="relative z-10 mt-14 md:mt-20">
        <div className="shell flex flex-col gap-16 md:gap-24">
          {capabilities.items.map((capability, i) => (
            <article
              key={capability.id}
              id={capability.id}
              data-capability-panel
              data-step={i}
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

                  <h3 className="font-display text-h2 uppercase leading-none text-white">
                    {capability.title}
                  </h3>

                  {capability.counter ? (
                    <p className="tabular font-display text-h2 font-bold leading-none text-red">
                      <span
                        data-count-to={capability.counter.value}
                        data-count-from={0}
                      >
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
                  mobile layout the scene is its own grid row, so the row height
                  is content-driven and an `h-full` SVG resolves against zero and
                  collapses. On desktop the row is sized by the text column and
                  the scene stretches into it.
                */}
                <div className="h-56 sm:h-64 lg:h-auto">
                  <CapabilityScene scene={capability.scene} className="h-full w-full" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
