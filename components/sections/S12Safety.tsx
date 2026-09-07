'use client';

/**
 * S12 — Safety / ZERO. ★ THE EMOTIONAL PEAK
 *
 * Pinned for 200vh. Everything else is gone; full navy.
 *
 * The line closes into one enormous 0 over the whole scroll. When it closes — and
 * only then — the day counter runs up and stops. Then, and only then, the four
 * HSE points arrive one at a time.
 *
 * ── Restraint is the point ────────────────────────────────────────────────
 *
 * Three cues, in strict sequence, and nothing else. No particles, no camera
 * move, no flourish, no parallax, no counter-rotation on the ring. This is the
 * strongest sales argument on the page and the brief is explicit that
 * over-animating it would destroy it: the confidence is in the stillness.
 *
 * The one deliberate silence is between the ring closing and the counter
 * starting. It is a gap in the timeline, so the reader keeps
 * scrolling and nothing moves — the same device as S2's beat, used here on the
 * fact that matters most.
 *
 * ── The day count ─────────────────────────────────────────────────────────
 *
 * Recomputed on the client, because a static export bakes its build date and the
 * number would drift by a day for every day between deploys. The server-rendered
 * value stays as the no-JS fallback.
 */

import { useCallback, useState } from 'react';
import { RedLine } from '@/components/RedLine';
import { Eyebrow } from '@/components/ui/primitives';
import { gsap } from '@/lib/gsap';
import { hideStrand, revealStrand } from '@/lib/redline';
import { SECTION_REVEAL_START, countTween, formatCount, guaranteeReveal, readCounters } from '@/lib/scene';
import { useScrollScene } from '@/lib/useScrollScene';
import { safety } from '@/content/site';

const MS_PER_DAY = 86_400_000;

function daysSince(iso: string): number {
  const start = Date.parse(iso);
  if (Number.isNaN(start)) return 0;
  return Math.max(0, Math.floor((Date.now() - start) / MS_PER_DAY));
}

/** The ring draws across most of the scroll. It is the section. */
const RING = { at: 0, dur: 0.6 };
/** Then nothing, for a while. */
const COUNTER_AT = 0.68;
/** Then the four points, one at a time. */
const POINTS_AT = 0.83;
const POINT_STAGGER = 0.035;

export function S12Safety() {
  const [strandStructure, setStrandStructure] = useState('');
  const onStrands = useCallback((s: string) => setStrandStructure(s), []);

  // Build-time value; the client corrects it on mount. See the header.
  const days = daysSince(safety.since);

  const rootRef = useScrollScene<HTMLElement>(
    {
      runOnMobile: true,

      build: ({ conditions, q, root }) => {
        const strands = q('[data-strand]') as SVGPathElement[];
        const points = q('[data-hse-point]');
        const counterEl = q('[data-count-to]')[0] as HTMLElement | undefined;
        if (strands.length === 0) return;

        // Correct the build-time value before anything animates to it.
        if (counterEl) counterEl.dataset.countTo = String(daysSince(safety.since));
        const counters = readCounters(q('[data-count-to]'));
        counters.forEach((c) => {
          c.el.textContent = formatCount(c.from);
        });

        strands.forEach(hideStrand);
        gsap.set(points, { opacity: 0, y: 10 });

        /* ---- Mobile: no pin. The ring draws on the section's own travel. -- */
        gsap.to(strands, {
          strokeDashoffset: 0,
          ease: 'power1.inOut',
          scrollTrigger: { trigger: root, start: SECTION_REVEAL_START, once: true, onEnter: guaranteeReveal },
          duration: 0.9,
        });
        const tl = gsap.timeline({
          scrollTrigger: { trigger: root, start: 'top 55%', once: true, onEnter: guaranteeReveal },
        });
        counters.forEach((c) => tl.add(countTween(c, 1.4), 0));
        tl.to(points, { opacity: 1, y: 0, duration: 0.4, stagger: 0.4 }, 1.5);

      },

      settle: ({ q }) => {
        (q('[data-strand]') as SVGPathElement[]).forEach(revealStrand);
        gsap.set(q('[data-hse-point]'), { opacity: 1, y: 0 });
        const el = q('[data-count-to]')[0] as HTMLElement | undefined;
        if (el) {
          const n = daysSince(safety.since);
          el.dataset.countTo = String(n);
          el.textContent = formatCount(n);
        }
      },
    },
    [strandStructure],
  );

  return (
    <section
      ref={rootRef}
      id="safety"
      aria-labelledby="safety-heading"
      className="relative isolate overflow-hidden bg-navy py-section text-white"
    >
      <RedLine id="safety" driven onStrands={onStrands} />

      {/*
        Two groups, deliberately separated on desktop.

        The headline and the day count sit INSIDE the ring, centred on it — the
        ring is the zero, so putting a second giant numeral beside it would be
        the same word twice. Everything else sits below the ring's lower arc, at
        78%, because the ring is drawn at 0.30 of the viewport's shorter side and
        anything centred in the section runs straight through it.
      */}
      {/*
        A full-height positioning layer. The percentages below have to resolve
        against the SECTION, not against a shell whose height collapses once its
        children go absolute.
      */}
      <div className="relative z-10 flex flex-col items-center gap-12 text-center md:gap-16">
        <div
          className="shell flex flex-col items-center gap-3"
        >
          <Eyebrow tone="white">{safety.eyebrow}</Eyebrow>
          <h2
            id="safety-heading"
            className="font-display text-h2 font-bold uppercase leading-none text-red"
          >
            {safety.headline}
          </h2>
          <p className="font-display text-h3 font-semibold uppercase tracking-tight text-white">
            {safety.headlineSub}
          </p>

          <div className="mt-5 flex flex-col items-center gap-1">
            <p className="tabular font-display text-h2 font-bold text-white">
              <span data-count-to={days} data-count-from={0}>
                {days.toLocaleString('en-US')}
              </span>
            </p>
            <p className="eyebrow text-white/50">{safety.dayCounterLabel}</p>
          </div>
        </div>

        <div
          className="shell flex flex-col items-center gap-6"
        >
          <p className="max-w-2xl text-sm leading-relaxed text-white/65">{safety.sub}</p>

          <ul className="mx-auto grid max-w-4xl gap-x-10 gap-y-3 text-left sm:grid-cols-2">
            {safety.points.map((point) => (
              <li
                key={point}
                data-hse-point
                className="flex gap-3 text-sm leading-relaxed text-white/65"
              >
                <span aria-hidden="true" className="mt-2 h-px w-3 shrink-0 bg-red" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
