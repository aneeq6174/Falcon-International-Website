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

        /* ---- Mobile: no pin, no scrub. One reveal on entry. ------------ */
        if (conditions.mobile) {
          strands.forEach(hideStrand);
          gsap.to(strands, {
            strokeDashoffset: 0,
            ease: 'none',
            scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom 35%', scrub: true },
          });

          resetMap();
          resetCounters(counters);

          const tl = gsap.timeline({
            scrollTrigger: { trigger: mapRoot, start: 'top 78%', once: true },
          });
          buildScene(tl, mapRoot, 0, 0.7);
          tl.to(hq, { scale: 1, opacity: 1, duration: 0.4, ease: 'power2.out' }, 0.5)
            .to(routes, { strokeDashoffset: 0, duration: 0.5, stagger: 0.12 }, 0.7)
            .to(pins, { scale: 1, opacity: 1, duration: 0.3, stagger: 0.12 }, 0.95)
            .to(arcs, { opacity: 1, duration: 0.4 }, 1.3)
            .to(arcs, { strokeDashoffset: -48, duration: 1.4, ease: 'none' }, 1.3);
          counters.forEach((c, i) => tl.add(countTween(c, 1.1), 0.95 + i * 0.12));
          return;
        }

        /* ---- Desktop: one master trigger, 150vh of pinned scrub -------- */
        strands.forEach(hideStrand);
        const entry = strands.find((s) => s.dataset.strand === 'entry');
        const exit = strands.find((s) => s.dataset.strand === 'exit');

        resetMap();
        resetCounters(counters);

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: '+=150%',
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            scrub: 1,
          },
        });

        // The map draws itself.
        buildScene(tl, mapRoot, MAP_DRAW.at, MAP_DRAW.dur);

        // The line arrives and plants the head office.
        if (entry) tl.to(entry, { strokeDashoffset: 0, duration: 0.14 }, 0.16);
        tl.to(hq, { scale: 1, opacity: 1, duration: 0.06, ease: 'power4.out' }, HQ_AT);
        // One slow breath, not a repeating pulse — this is scrubbed, so a loop
        // would fight the reader for control of it.
        tl.to(pulse, { scale: 1.6, opacity: 0, duration: 0.34, ease: 'power2.out' }, HQ_AT + 0.04);

        // Routes fire outward; each pin and counter lands with its own route.
        routes.forEach((route, i) => {
          const at = routeAt(i);
          tl.to(route, { strokeDashoffset: 0, duration: ROUTE_DUR }, at);
          if (pins[i]) {
            tl.to(
              pins[i],
              { scale: 1, opacity: 1, duration: 0.05, ease: 'power4.out' },
              at + ROUTE_DUR * 0.85,
            );
          }
          if (counters[i]) {
            tl.add(countTween(counters[i], 0.1), at + ROUTE_DUR * 0.85);
          }
        });

        // Beyond Pakistan.
        tl.to(arcs, { opacity: 1, duration: 0.05 }, ARCS_AT).to(
          arcs,
          { strokeDashoffset: -48, duration: 0.16, ease: 'none' },
          ARCS_AT,
        );

        if (exit) tl.to(exit, { strokeDashoffset: 0, duration: 0.06 }, 0.93);

        tl.set({}, {}, 1);
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
      className="relative isolate overflow-hidden bg-navy py-section text-white md:flex md:h-[var(--vh)] md:items-center md:pb-8 md:pt-20"
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
