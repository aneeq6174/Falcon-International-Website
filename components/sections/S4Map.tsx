'use client';

/**
 * S4 — Where We Work. Pinned for 150vh.
 *
 * The map draws itself, the line arrives from S3 and plants the head office at
 * Lahore, three routes fire outward to the provinces — each dropping a pin and
 * spinning its counter as it lands — and finally two dashed arcs leave the
 * western edge for the Gulf and Egypt.
 *
 * ── Ordering ──────────────────────────────────────────────────────────────
 *
 * A route landing and its counter starting are the same event, so they share a
 * cue: `routeAt(i)`. Reading a number that starts climbing before the line
 * reaches its province would undo the whole point of drawing the routes.
 *
 * The arcs are dashed, so they cannot be drawn with the usual dashoffset trick —
 * the dash pattern IS the dashoffset. They fade in and their dashes travel
 * outward instead, which reads as flow leaving the country.
 */

import { useCallback, useState } from 'react';
import { RedLine } from '@/components/RedLine';
import { PakistanMap, REGION_PINS } from '@/components/scenes/PakistanMap';
import { Eyebrow, Stat } from '@/components/ui/primitives';
import { gsap } from '@/lib/gsap';
import { hideStrand, revealStrand } from '@/lib/redline';
import {
  SCENE_BUILD_SELECTOR,
  buildScene,
  countTween,
  readCounters,
  resetCounters,
  settleCounters,
  settleScene,
  guaranteeReveal,
  SECTION_REVEAL_START,
  ITEM_REVEAL_START,
} from '@/lib/scene';
import { useScrollScene } from '@/lib/useScrollScene';
import { map } from '@/content/site';

/** The map is drawn first; everything else lands on top of it. */
const MAP_DRAW = { at: 0.02, dur: 0.3 };

/** The line reaches Lahore and the head office marker plants. */
const HQ_AT = 0.3;

/** Each route fires, drops its pin and starts its counter. */
const routeAt = (i: number) => 0.4 + i * 0.14;
const ROUTE_DUR = 0.11;

/** The Gulf and Egypt links leave last. */
const ARCS_AT = 0.84;

export function S4Map() {
  const [strandStructure, setStrandStructure] = useState('');
  const onStrands = useCallback((s: string) => setStrandStructure(s), []);

  const rootRef = useScrollScene<HTMLElement>(
    {
      runOnMobile: true,

      build: ({ conditions, q, root }) => {
        const strands = q('[data-strand]') as SVGPathElement[];
        const counters = readCounters(q('[data-count-to]'));
        const mapRoot = q('[data-map]')[0];
        if (!mapRoot) return;

        const routes = REGION_PINS.map((_, i) => q(`[data-route="${i}"]`)[0]).filter(Boolean);
        const pins = REGION_PINS.map((_, i) => q(`[data-pin="${i}"]`)[0]).filter(Boolean);
        const arcs = q('[data-arc]');
        const hq = q('[data-hq]')[0];
        const pulse = q('[data-hq-pulse]')[0];

        const resetMap = () => {
          gsap.set(routes, { strokeDasharray: 100, strokeDashoffset: 100 });
          gsap.set(pins, { transformOrigin: '50% 50%', scale: 0, opacity: 0 });
          gsap.set(arcs, { opacity: 0, strokeDashoffset: 0 });
          gsap.set(hq, { transformOrigin: '50% 50%', scale: 0, opacity: 0 });
          gsap.set(pulse, { transformOrigin: '50% 50%', scale: 0.5, opacity: 0.18 });
        };

        /* One reveal on entry, at every width. Nothing pins, nothing scrubs. */
        strands.forEach(hideStrand);
        gsap.to(strands, {
          strokeDashoffset: 0,
          ease: 'power1.inOut',
          scrollTrigger: { trigger: root, start: SECTION_REVEAL_START, once: true, onEnter: guaranteeReveal },
          duration: 0.9,
        });

        resetMap();
        resetCounters(counters);

        const tl = gsap.timeline({
          scrollTrigger: { trigger: mapRoot, start: ITEM_REVEAL_START, once: true, onEnter: guaranteeReveal },
        });
        buildScene(tl, mapRoot, 0, 0.7);
        tl.to(hq, { scale: 1, opacity: 1, duration: 0.4, ease: 'power2.out' }, 0.5)
          .to(routes, { strokeDashoffset: 0, duration: 0.5, stagger: 0.12 }, 0.7)
          .to(pins, { scale: 1, opacity: 1, duration: 0.3, stagger: 0.12 }, 0.95)
          .to(arcs, { opacity: 1, duration: 0.4 }, 1.3)
          .to(arcs, { strokeDashoffset: -48, duration: 1.4, ease: 'none' }, 1.3);
        counters.forEach((c, i) => tl.add(countTween(c, 1.1), 0.95 + i * 0.12));

      },

      settle: ({ q }) => {
        (q('[data-strand]') as SVGPathElement[]).forEach(revealStrand);
        settleScene(q(SCENE_BUILD_SELECTOR));
        settleCounters(readCounters(q('[data-count-to]')));
        gsap.set(q('[data-route]'), { strokeDasharray: 'none', strokeDashoffset: 0 });
        gsap.set(q('[data-pin],[data-hq]'), { scale: 1, opacity: 1 });
        gsap.set(q('[data-hq-pulse]'), { scale: 1, opacity: 0.18 });
        gsap.set(q('[data-arc]'), { opacity: 1, strokeDashoffset: 0 });
      },
    },
    [strandStructure],
  );

  return (
    <section
      ref={rootRef}
      id="where-we-work"
      aria-labelledby="map-heading"
      className="relative isolate overflow-hidden bg-navy py-section text-white"
    >
      <RedLine id="map" driven onStrands={onStrands} />

      <div className="shell relative z-10 grid w-full gap-x-12 gap-y-12 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:items-center">
        <div className="flex flex-col gap-6">
          <header className="flex flex-col gap-3">
            <Eyebrow tone="white">{map.eyebrow}</Eyebrow>
            <h2 id="map-heading" className="text-h2 uppercase">
              {map.title}
            </h2>
          </header>

          <div className="flex flex-col gap-5">
            {map.regions.map((region) => (
              <Stat
                key={region.label}
                value={region.value}
                suffix={region.suffix}
                label={region.label}
                tone="white"
                size="compact"
              />
            ))}
          </div>

          <div className="grid gap-6 border-t border-white/10 pt-6 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Eyebrow tone="white">{map.headOfficeLabel}</Eyebrow>
              <p className="font-display text-h3 font-semibold uppercase tracking-tight text-white">
                {map.headOffice}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Eyebrow tone="white">{map.beyondTitle}</Eyebrow>
              <p className="text-sm leading-relaxed text-white/65">{map.beyond}</p>
            </div>
          </div>
        </div>

        <div data-map className="h-72 w-full sm:h-96 md:h-[68vh]">
          <PakistanMap className="h-full w-full" />
        </div>
      </div>
    </section>
  );
}
