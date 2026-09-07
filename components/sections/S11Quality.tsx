'use client';

/**
 * S11 — Quality & Compliance.
 *
 * Each badge stamps onto the page: scale 1.4 → 1.0 with a 2° rotation settling
 * out, staggered 120ms, and a 2px shake of the grid on each impact.
 *
 * Mechanical, not bouncy. `power4.out` throughout and no overshoot — the brief
 * rules out back, elastic and bounce everywhere on this site, and a stamp is
 * exactly where the temptation to reach for them is strongest. The weight comes
 * from the speed of the arrival, not from a rebound.
 *
 * ── The bloom ─────────────────────────────────────────────────────────────
 *
 * The brief asks for a soft shadow bloom on impact. Animating `box-shadow` is a
 * paint on every frame, so instead each badge carries a ring element that scales
 * up and fades out — transform and opacity, composited, and it reads the same.
 */

import { RedLine } from '@/components/RedLine';
import {
  Eyebrow,
  SECTION_SHELL,
  SectionBody,
  sectionTone,
} from '@/components/ui/primitives';
import { gsap } from '@/lib/gsap';
import { guaranteeReveal } from '@/lib/scene';
import { useScrollScene } from '@/lib/useScrollScene';
import { quality } from '@/content/site';

/** The brief's number. */
const STAGGER = 0.12;

/** How far the grid kicks on each impact. Subtle enough to feel, not to notice. */
const SHAKE = 2;

export function S11Quality() {
  const rootRef = useScrollScene<HTMLElement>({
    runOnMobile: true,

    build: ({ q, root }) => {
      const badges = q('[data-badge]');
      const grid = q('[data-badge-grid]')[0];
      if (badges.length === 0) return;

      gsap.set(badges, { transformOrigin: '50% 50%', scale: 1.4, rotate: 2, opacity: 0 });
      gsap.set(q('[data-badge-bloom]'), { transformOrigin: '50% 50%', scale: 0.7, opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: 'top 76%', once: true, onEnter: guaranteeReveal },
      });

      badges.forEach((badge, i) => {
        const at = i * STAGGER;
        const bloom = badge.querySelector('[data-badge-bloom]');

        tl.to(
          badge,
          { scale: 1, rotate: 0, opacity: 1, duration: 0.42, ease: 'power4.out' },
          at,
        );

        if (bloom) {
          tl.to(bloom, { scale: 1, opacity: 0.5, duration: 0.1, ease: 'power4.out' }, at + 0.24).to(
            bloom,
            { scale: 1.35, opacity: 0, duration: 0.5, ease: 'power2.out' },
            at + 0.34,
          );
        }

        // The impact, felt through the whole grid.
        if (grid) {
          tl.to(grid, { y: SHAKE, duration: 0.05, ease: 'power4.out' }, at + 0.26).to(
            grid,
            { y: 0, duration: 0.18, ease: 'power2.out' },
            at + 0.31,
          );
        }
      });
    },

    settle: ({ q }) => {
      gsap.set(q('[data-badge]'), { scale: 1, rotate: 0, opacity: 1 });
      gsap.set(q('[data-badge-bloom]'), { opacity: 0 });
      gsap.set(q('[data-badge-grid]'), { y: 0 });
    },
  });

  return (
    <section
      ref={rootRef}
      id="quality"
      aria-labelledby="quality-heading"
      className={`${SECTION_SHELL} ${sectionTone.paper}`}
    >
      <RedLine id="quality" />

      <SectionBody className="flex flex-col gap-12">
        <header className="flex max-w-3xl flex-col gap-6">
          <Eyebrow as="h2" id="quality-heading">
            {quality.eyebrow}
          </Eyebrow>
          <p className="text-h3 font-display font-semibold leading-snug tracking-tight text-navy">
            {quality.intro}
          </p>
        </header>

        <ul
          data-badge-grid
          className="grid gap-px bg-ink/10 sm:grid-cols-2 lg:grid-cols-4"
        >
          {quality.badges.map((badge) => (
            <li key={badge.title} className="relative bg-paper">
              <div data-badge className="relative flex flex-col gap-3 p-6 lg:p-8">
                {/* The bloom. Behind the content, transform and opacity only. */}
                <span
                  data-badge-bloom
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-3 -z-10 rounded-sm bg-red/20"
                />
                <span aria-hidden="true" className="rule-red" />
                <h3 className="font-display text-h3 font-semibold uppercase tracking-tight text-navy">
                  {badge.title}
                </h3>
                <p className="text-sm leading-relaxed text-grey">{badge.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </SectionBody>
    </section>
  );
}
