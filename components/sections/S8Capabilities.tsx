'use client';

/**
 * S8 — Capabilities. ★ SECOND CENTREPIECE
 *
 * 500vh of pinned scrub. The red line runs across the top as a manifold header
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
import { CapabilityScene, ManifoldValve } from '@/components/scenes/CapabilityScenes';
import { Eyebrow, ScopeList } from '@/components/ui/primitives';
import { gsap } from '@/lib/gsap';
import {
  MANIFOLD_DROP_Y,
  MANIFOLD_HEADER_Y,
  MANIFOLD_VALVE_X,
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
        if (conditions.mobile) {
          strands.forEach(hideStrand);
          gsap.to(strands, {
            strokeDashoffset: 0,
            ease: 'none',
            scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom 35%', scrub: true },
          });

          resetCounters(counters);

          panels.forEach((panel, i) => {
            const tl = gsap.timeline({
              scrollTrigger: { trigger: panel, start: 'top 78%', once: true },
            });
            buildScene(tl, panel, 0, 0.5);
            const own = counters.filter((c) => panel.contains(c.el));
            own.forEach((c) => tl.add(countTween(c, 1.2), 0.15));
            void i;
          });
          return;
        }

        /* ---- Desktop: one master trigger, 500vh of pinned scrub -------- */
        const header = strands.find((s) => s.dataset.strand === 'header');
        const trunkOut = strands.find((s) => s.dataset.strand === 'trunk-out');
        const branches = MANIFOLD_VALVE_X.map((_, i) =>
          strands.find((s) => s.dataset.strand === `branch-${i}`),
        );

        strands.forEach(hideStrand);
        resetCounters(counters);

        gsap.set(handles, { transformOrigin: '50% 50%', rotate: 0 });
        gsap.set(fills, { opacity: 0 });
        // Every panel starts clear of the stage; step 0 brings the first in.
        gsap.set(panels, { yPercent: 0, opacity: 0 });

        const promote = () =>
          panels.forEach((p) => ((p as HTMLElement).style.willChange = 'transform, opacity'));
        const release = () =>
          panels.forEach((p) => ((p as HTMLElement).style.willChange = 'auto'));

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: '+=500%',
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            scrub: 1,
            onEnter: promote,
            onEnterBack: promote,
            onLeave: release,
            onLeaveBack: release,
          },
        });

        // The header pipe arrives first.
        if (header) tl.to(header, { strokeDashoffset: 0, duration: INTRO * 0.8 }, 0);

        panels.forEach((panel, i) => {
          const at = stepAt(i);

          // Valve quarter-turns open, then red charges down its branch.
          if (handles[i]) {
            tl.to(
              handles[i],
              { rotate: 90, duration: STEP_DUR * 0.14, ease: 'power4.out' },
              at,
            );
          }
          if (fills[i]) {
            tl.to(fills[i], { opacity: 1, duration: STEP_DUR * 0.1 }, at + STEP_DUR * 0.08);
          }
          const branch = branches[i];
          if (branch) {
            tl.to(
              branch,
              { strokeDashoffset: 0, duration: STEP_DUR * 0.16 },
              at + STEP_DUR * 0.1,
            );
          }

          // The service takes the stage and assembles.
          tl.fromTo(
            panel,
            { yPercent: 6, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: STEP_DUR * 0.18, ease: 'power2.out' },
            at + STEP_DUR * 0.14,
          );
          buildScene(tl, panel, at + STEP_DUR * 0.2, STEP_DUR * 0.46);

          const own = counters.filter((c) => panel.contains(c.el));
          own.forEach((c) => tl.add(countTween(c, STEP_DUR * 0.42), at + STEP_DUR * 0.24));

          // Previous service wipes downward out of frame as the next arrives.
          if (i < STEPS - 1) {
            tl.to(
              panel,
              { yPercent: 14, opacity: 0, duration: STEP_DUR * 0.16, ease: 'power2.in' },
              stepAt(i + 1) + STEP_DUR * 0.02,
            );
          }
        });

        // Out to S9 once the last service has had its beat.
        if (trunkOut) tl.to(trunkOut, { strokeDashoffset: 0, duration: 0.05 }, 0.94);

        /**
         * Pins the duration to exactly 1 so `progress(p)` and `stepAt(i)` agree.
         * See the same guard in S3.
         */
        tl.set({}, {}, 1);
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
      className="relative isolate overflow-hidden bg-navy py-section text-white md:h-[var(--vh)] md:py-0"
    >
      <RedLine id="capabilities" driven onStrands={onStrands} />

      {/* Heading, fixed to the frame. The services move past it. */}
      <div className="shell relative z-30 md:absolute md:inset-x-0 md:top-0 md:pt-24">
        <header className="flex flex-col gap-3">
          <Eyebrow tone="white">{capabilities.eyebrow}</Eyebrow>
          <h2 id="capabilities-heading" className="text-h2 uppercase">
            {capabilities.title}
          </h2>
        </header>
      </div>

      {/* The six valves, seated on the header pipe. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 z-20 hidden md:block"
        style={{ top: `${MANIFOLD_HEADER_Y * 100}%` }}
      >
        {MANIFOLD_VALVE_X.map((x, i) => (
          <div
            key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${x * 100}%` }}
          >
            <ManifoldValve />
          </div>
        ))}
      </div>

      {/*
        The stage. On desktop it is a fixed box between the valve drops and the
        foot of the frame, with all six panels stacked absolutely inside it so
        one can wipe out while the next builds. On mobile it is ordinary flow.
      */}
      <div
        className="relative z-10 md:absolute md:inset-x-0"
        style={{ top: `${MANIFOLD_DROP_Y * 100}%`, bottom: '8%' }}
      >
        <div className="shell flex flex-col gap-16 md:relative md:block md:h-full md:gap-0">
          {capabilities.items.map((capability, i) => (
            <article
              key={capability.id}
              id={capability.id}
              data-capability-panel
              data-step={i}
              className="relative border-t border-white/10 pt-10 md:absolute md:inset-0 md:border-t-0 md:pt-0"
            >
              <div className="grid h-full gap-x-10 gap-y-8 md:content-start lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
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
