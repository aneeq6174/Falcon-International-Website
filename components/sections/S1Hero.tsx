'use client';

/**
 * S1 — Hero. The plant constructs itself once, as the page opens.
 *
 * ── The build ─────────────────────────────────────────────────────────────
 *
 * One master ScrollTrigger (§6 — never dozens of independent ones) drives a
 * single timeline. Stages run in the order the brief specifies, overlapping
 * slightly so the structure grows continuously rather than in five visible
 * chunks:
 *
 *   foundation → columns rising → pipe runs → boiler stack → distillation tower
 *
 * At ~60% the blueprint linework crossfades to solid silhouette and the horizon
 * glow rises behind. At the end the red line is born at the base of the
 * structure and descends toward S2.
 *
 * Both halves of the crossfade animate GROUP opacity rather than per-path stroke
 * values: one property, compositor-friendly, and it keeps the two drawings in
 * register.
 *
 * ── Why the copy does not animate ─────────────────────────────────────────
 *
 * The h1 is the LCP element. Animating it in would trade the site's largest
 * paint metric for an effect the brief did not ask for, and §9 warns against
 * fade-up applied to everything. The structure moves; the words hold still.
 */

import { useCallback, useState } from 'react';
import { RedLine } from '@/components/RedLine';
import { PlantScene } from '@/components/scenes/PlantScene';
import { Button, TermRun } from '@/components/ui/primitives';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { hideStrand, revealStrand } from '@/lib/redline';
import { guaranteeReveal } from '@/lib/scene';
import { useScrollScene } from '@/lib/useScrollScene';
import { hero, org } from '@/content/site';

/** Stage windows as fractions of the master timeline. */
const STAGES: Array<{ part: string; at: number; duration: number; stagger: number }> = [
  { part: 'foundation', at: 0, duration: 0.14, stagger: 0.004 },
  { part: 'columns', at: 0.1, duration: 0.22, stagger: 0.008 },
  { part: 'pipes', at: 0.26, duration: 0.2, stagger: 0.01 },
  { part: 'stack', at: 0.4, duration: 0.16, stagger: 0.008 },
  { part: 'tower', at: 0.46, duration: 0.18, stagger: 0.008 },
];

/** Where the blueprint resolves into solid structure. Brief says ~60%. */
const CROSSFADE_AT = 0.6;

/** Resting opacity of the linework once the silhouette is up. */
const STROKE_RESTING_OPACITY = 0.35;

export function S1Hero() {
  /**
   * The strand structure, not a resize counter. Dash maths uses a fixed
   * pathLength unit, so a resize needs no rebuild — only a change in which
   * strands exist does.
   */
  const [strandStructure, setStrandStructure] = useState('');
  const onStrands = useCallback((structure: string) => setStrandStructure(structure), []);

  const rootRef = useScrollScene<HTMLElement>(
    {
      runOnMobile: true,

      build: ({ conditions, q }) => {
        const strokeGroup = q('[data-plant-stroke]');
        const fillGroup = q('[data-plant-fill]');
        const glow = q('[data-plant-glow]');
        const linePaths = q('[data-strand]') as SVGPathElement[];

        const drawables = STAGES.map(({ part }) => ({
          part,
          paths: q(`[data-plant-part="${part}"] [data-draw]`) as SVGPathElement[],
        }));

        // Undrawn starting state for every stroke in the scene.
        drawables.forEach(({ paths }) => paths.forEach(hideStrand));
        linePaths.forEach(hideStrand);
        if (linePaths.length === 0) return;

        gsap.set(fillGroup, { opacity: 0 });
        gsap.set(strokeGroup, { opacity: 1 });
        gsap.set(glow, { opacity: 0, yPercent: 8 });

        /**
         * No will-change on these. `stroke-dashoffset` is not compositable, so
         * the hint creates no layer and buys nothing — see the same note in
         * RedLine. Promotion is reserved for transform and opacity.
         */

        /* One build on entry, at every width. Nothing pins, nothing scrubs. */
        const tl = gsap.timeline({
          scrollTrigger: { trigger: rootRef.current, start: 'top 75%', once: true, onEnter: guaranteeReveal },
        });

        drawables.forEach(({ paths }, i) => {
          tl.to(
            paths,
            { strokeDashoffset: 0, ease: 'power2.out', duration: 0.5, stagger: 0.012 },
            i * 0.18,
          );
        });

        tl.to(fillGroup, { opacity: 1, duration: 0.5 }, 0.7)
          .to(strokeGroup, { opacity: STROKE_RESTING_OPACITY, duration: 0.5 }, 0.7)
          .to(glow, { opacity: 1, yPercent: 0, duration: 0.6 }, 0.65)
          .to(linePaths, { strokeDashoffset: 0, ease: 'power2.out', duration: 0.5 }, 0.95);

      },

      settle: ({ q }) => {
        // Reduced motion: the finished frame. Built plant, silhouette up, glow
        // in place, line drawn. Intentional and complete on its own (§6).
        const paths = q('[data-draw]') as SVGPathElement[];
        paths.forEach(revealStrand);
        (q('[data-strand]') as SVGPathElement[]).forEach(revealStrand);

        gsap.set(q('[data-plant-fill]'), { opacity: 1 });
        gsap.set(q('[data-plant-stroke]'), { opacity: STROKE_RESTING_OPACITY });
        gsap.set(q('[data-plant-glow]'), { opacity: 1, yPercent: 0 });
      },
    },
    [strandStructure],
  );

  return (
    <section
      ref={rootRef}
      id="hero"
      aria-labelledby="hero-heading"
      className="relative isolate flex min-h-[var(--vh)] flex-col justify-end overflow-hidden bg-navy pb-section pt-32 text-white"
    >
      {/* Blueprint grid the plant is drawn onto. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #FFF 1px, transparent 1px), linear-gradient(to bottom, #FFF 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <PlantScene className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[78%] w-full" />

      <RedLine id="hero" driven onStrands={onStrands} />

      <div className="shell relative z-10">
        <div className="flex max-w-4xl flex-col gap-8">
          <p className="eyebrow text-red">{hero.eyebrow}</p>

          <h1 id="hero-heading" className="text-h1 uppercase">
            {hero.h1}
          </h1>

          <p className="text-h3 font-display font-semibold uppercase tracking-tight text-white/85">
            {hero.sub}
          </p>

          <span aria-hidden="true" className="rule-red" />

          <TermRun items={org.services} tone="white" />

          <div className="mt-2 flex flex-wrap items-center gap-4">
            <Button href="#contact" variant="primary">
              {hero.ctaPrimary}
            </Button>
            <Button href="#track-record" variant="secondary">
              {hero.ctaSecondary}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
