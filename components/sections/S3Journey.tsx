'use client';

/**
 * S3 — The Journey. ★ THE CENTREPIECE
 *
 * Vertical scroll input, lateral world movement. 600vh of pinned scrub drives a
 * camera horizontally through one continuous world, 1997 → 2026. Structures
 * assemble as they enter frame, their content travels with them, and once they
 * pass they settle into a back layer that accumulates into the 29-year skyline.
 *
 * ── The camera ────────────────────────────────────────────────────────────
 *
 * The world is fourteen stations wide (1400%), one viewport each, and the whole
 * camera move is a single `xPercent` tween on a single element:
 *
 *     xPercent: 0 → -(13 / 14) * 100
 *
 * Thirteen viewport widths of travel. Expressed as a percentage of the world's
 * own width it needs no measurement, so it survives any viewport size and any
 * resize without the timeline being rebuilt — which matters here more than
 * anywhere, because rebuilding a 600vh pin mid-page throws the reader's
 * position.
 *
 * Station i therefore fills the screen at progress i / 13. That single fact
 * drives every other cue in the section: see `stationAt()`.
 *
 * ── The ground ────────────────────────────────────────────────────────────
 *
 * The red line is the ground. It lives inside the world so it travels with the
 * camera, and it carries the three moments the brief hangs on it: the charge
 * running white along it in 2016, the warm gold at the solar array in 2024, and
 * the thickening into armoured cable in 2026. The vertical stubs that join it to
 * S2 above and S4 below come from the `journey` segment — see journeyStrands.
 *
 * ── One DOM, two layouts ──────────────────────────────────────────────────
 *
 * Below 768px the same markup stacks vertically via CSS alone: no pin, no scrub,
 * no camera, a plain on-enter build per milestone. Same content, same artwork.
 * There is no second tree to keep in sync.
 */

import { useCallback, useState } from 'react';
import { RedLine } from '@/components/RedLine';
import {
  JourneyStructure,
  SKYLINE,
  SkylineSilhouette,
} from '@/components/scenes/JourneyStructures';
import { Eyebrow } from '@/components/ui/primitives';
import { gsap } from '@/lib/gsap';
import { JOURNEY_GROUND_Y, hideStrand, revealStrand } from '@/lib/redline';
import { SCENE_BUILD_SELECTOR, buildScene, settleScene } from '@/lib/scene';
import { useScrollScene } from '@/lib/useScrollScene';
import { journey } from '@/content/site';

const COUNT = journey.milestones.length; // 14
const TRAVEL = ((COUNT - 1) / COUNT) * 100; // 92.857% — thirteen viewport widths

/**
 * A held beat before the camera starts moving.
 *
 * Station 0 fills the screen at the very start, so without this its structure
 * would have nowhere to build — the reader would arrive on an empty 1997 and
 * watch it assemble only after the camera had already left. The camera holds
 * still while the workshop goes up, then travels.
 */
const INTRO = 0.04;

/** Progress at which station i fills the screen. */
const stationAt = (i: number) => INTRO + ((1 - INTRO) * i) / (COUNT - 1);

/** A station's build starts as it enters frame from the right and lands by centre. */
const buildAt = (i: number) => (i === 0 ? 0.002 : stationAt(i) - 0.055);
const BUILD_DUR = 0.048;

/** Milestone indices the brief hangs a line effect on. */
const CHARGE_AT = 6; // 2016 — electric charge runs along the line
const GOLD_AT = 9; // 2024 — the line warms to gold at the solar array
const CABLE_AT = 11; // 2026 — the line thickens into armoured cable

export function S3Journey() {
  const [strandStructure, setStrandStructure] = useState('');
  const onStrands = useCallback((s: string) => setStrandStructure(s), []);

  const rootRef = useScrollScene<HTMLElement>(
    {
      runOnMobile: true,

      build: ({ conditions, q, root }) => {
        const world = q('[data-journey-world]')[0];
        const camera = q('[data-journey-camera]')[0];
        const back = q('[data-journey-back]')[0];
        const stations = q('[data-station]');
        const cards = q('[data-station-card]');
        const backItems = q('[data-skyline-item]');
        const strands = q('[data-strand]') as SVGPathElement[];
        if (!world || stations.length === 0) return;

        /* ---- Mobile: no pin, no camera. One build per milestone. -------- */
        if (conditions.mobile) {
          strands.forEach(hideStrand);
          gsap.to(strands, {
            strokeDashoffset: 0,
            ease: 'none',
            scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom 35%', scrub: true },
          });

          stations.forEach((station) => {
            const tl = gsap.timeline({
              scrollTrigger: { trigger: station, start: 'top 78%', once: true },
            });
            // 400ms, per the brief's mobile note.
            buildScene(tl, station, 0, 0.4);
            tl.fromTo(
              station.querySelector('[data-station-card]'),
              { y: 18, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' },
              0,
            );
          });
          return;
        }

        /* ---- Desktop: one master trigger, 600vh of pinned scrub --------- */
        strands.forEach(hideStrand);
        const entry = strands.find((s) => s.dataset.strand === 'entry');
        const exit = strands.find((s) => s.dataset.strand === 'exit');

        const promote = () => {
          [world, camera, back].forEach((el) => {
            if (el) (el as HTMLElement).style.willChange = 'transform';
          });
        };
        const release = () => {
          [world, camera, back].forEach((el) => {
            if (el) (el as HTMLElement).style.willChange = 'auto';
          });
        };

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: '+=600%',
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

        // The camera. One tween, one element, the whole section.
        gsap.set(world, { xPercent: 0 });
        tl.to(world, { xPercent: -TRAVEL, duration: 1 - INTRO }, INTRO);

        // Back layer drifts slower than the world — three layers total, which is
        // the most the brief allows before parallax reads as mush (§9).
        if (back) {
          gsap.set(back, { xPercent: 0 });
          tl.to(back, { xPercent: -6, duration: 1 - INTRO }, INTRO);
        }

        // The line comes down and becomes the ground; at the very end, once the
        // camera has stopped, it drops away toward S4.
        if (entry) {
          // Arrives during the held intro, then clears once it has handed over
          // to the ground. Leaving it up would park a red vertical through the
          // middle of every structure for the whole 600vh.
          tl.to(entry, { strokeDashoffset: 0, duration: 0.028 }, 0);
          tl.to(entry, { opacity: 0, duration: 0.03 }, INTRO + 0.01);
        }
        if (exit) {
          gsap.set(exit, { opacity: 1 });
          tl.to(exit, { strokeDashoffset: 0, duration: 0.03 }, 0.965);
        }

        stations.forEach((station, i) => {
          const at = buildAt(i);
          buildScene(tl, station, at, BUILD_DUR);

          // Content is anchored to its structure and travels with it. It arrives
          // as the structure assembles and clears out once the camera is past,
          // so the final wide shot is not littered with fourteen cards.
          const card = cards[i];
          if (card) {
            gsap.set(card, { y: 26, opacity: 0 });
            tl.to(card, { y: 0, opacity: 1, duration: BUILD_DUR * 0.8, ease: 'power2.out' }, at + BUILD_DUR * 0.25);
            if (i < COUNT - 1) {
              tl.to(card, { opacity: 0, duration: 0.03 }, stationAt(i) + 0.036);
            }
          }

          // As each structure is passed, its silhouette joins the skyline behind.
          const backItem = backItems[i];
          if (backItem) {
            gsap.set(backItem, { yPercent: 22, opacity: 0 });
            tl.to(
              backItem,
              { yPercent: 0, opacity: 1, duration: 0.05, ease: 'power2.out' },
              // Clamped: the last station centres at progress 1, and a cue past
              // the end stretches the timeline's duration beyond 1, which shifts
              // every other cue's position. See the terminator below.
              Math.min(stationAt(i) + 0.012, 0.93),
            );
          }
        });

        /* ---- The three moments carried by the line itself --------------- */

        const charge = q('[data-line-charge]')[0];
        if (charge) {
          gsap.set(charge, { xPercent: -100, opacity: 0 });
          const t = stationAt(CHARGE_AT) - 0.02;
          tl.to(charge, { opacity: 1, duration: 0.006 }, t)
            .to(charge, { xPercent: 320, duration: 0.05, ease: 'power2.in' }, t)
            .to(charge, { opacity: 0, duration: 0.008 }, t + 0.05);
        }

        const gold = q('[data-line-gold]')[0];
        if (gold) {
          gsap.set(gold, { opacity: 0 });
          const t = stationAt(GOLD_AT) - 0.025;
          tl.to(gold, { opacity: 1, duration: 0.02 }, t).to(
            gold,
            { opacity: 0, duration: 0.03 },
            t + 0.05,
          );
        }

        const cable = q('[data-line-cable]')[0];
        if (cable) {
          gsap.set(cable, { scaleY: 0, transformOrigin: '50% 50%', opacity: 0 });
          const t = stationAt(CABLE_AT) - 0.03;
          tl.to(cable, { scaleY: 1, opacity: 1, duration: 0.03, ease: 'power2.out' }, t);
        }

        // TODAY: the camera pulls back and the whole 29-year skyline is revealed
        // in one wide shot.
        if (camera) {
          gsap.set(camera, { scale: 1, transformOrigin: '50% 62%' });
          tl.to(camera, { scale: 0.78, duration: 0.06, ease: 'power2.inOut' }, 0.93);
        }
        if (back) {
          tl.to(back, { opacity: 1, duration: 0.06 }, 0.93);
        }

        /**
         * Pins the timeline's duration to exactly 1 so `progress(p)` and the cue
         * constants agree. Every position above is authored as a fraction of the
         * whole; if any tween is allowed to end past 1 the mapping silently
         * shifts and every milestone lands off-centre.
         */
        tl.set({}, {}, 1);
      },

      settle: ({ q }) => {
        // Reduced motion: everything built, nothing mid-assembly. The camera sits
        // at the start and the section reads as a vertical list of milestones.
        (q('[data-strand]') as SVGPathElement[]).forEach(revealStrand);
        settleScene(q(SCENE_BUILD_SELECTOR));
        gsap.set(q('[data-station-card]'), { y: 0, opacity: 1 });
        gsap.set(q('[data-journey-world]'), { xPercent: 0 });
        gsap.set(q('[data-skyline-item]'), { opacity: 0 });
        gsap.set(q('[data-line-charge],[data-line-gold],[data-line-cable]'), { opacity: 0 });
      },
    },
    [strandStructure],
  );

  return (
    <section
      ref={rootRef}
      id="journey"
      aria-labelledby="journey-heading"
      className="relative isolate overflow-hidden bg-navy py-section text-white md:h-[var(--vh)] md:py-0"
    >
      <RedLine id="journey" driven onStrands={onStrands} />

      {/* Heading. Fixed to the frame on desktop — the world moves past it. */}
      <div className="shell relative z-30 md:absolute md:inset-x-0 md:top-0 md:pt-24">
        <header className="flex flex-col gap-3">
          <Eyebrow tone="white">{journey.eyebrow}</Eyebrow>
          <h2 id="journey-heading" className="text-h2 uppercase">
            {journey.title}
          </h2>
        </header>
      </div>

      {/* The accumulating skyline, behind everything. */}
      <div
        data-journey-back
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 z-0 hidden md:block"
        style={{ top: 0, height: `${JOURNEY_GROUND_Y * 100}%` }}
      >
        {SKYLINE.map((item, i) => (
          <div key={i} data-skyline-item className="absolute inset-0">
            <SkylineSilhouette item={item} />
          </div>
        ))}
      </div>

      <div data-journey-camera className="relative z-10 md:h-full">
        {/*
          The world. 1400% wide on desktop — fourteen stations, one viewport
          each — and a plain vertical stack below the breakpoint.
        */}
        <div
          data-journey-world
          className="flex flex-col md:h-full md:w-[1400%] md:flex-row"
        >
          {journey.milestones.map((m, i) => (
            <article
              key={`${m.year}-${m.title}`}
              data-station
              data-station-index={i}
              data-scene={m.scene}
              className="relative flex w-full shrink-0 flex-col justify-end border-t border-white/10 py-10 md:h-full md:w-[calc(100%/14)] md:border-t-0 md:py-0"
            >
              {/* Structure, standing on the horizon. */}
              <div
                className="pointer-events-none order-2 mt-6 h-44 w-full md:absolute md:inset-x-0 md:order-none md:mt-0 md:h-auto"
                style={{ bottom: `${(1 - JOURNEY_GROUND_Y) * 100}%`, top: '17%' }}
              >
                <JourneyStructure scene={m.scene} className="h-full w-full" />
              </div>

              {/* Content, anchored to the structure and travelling with it. */}
              <div
                data-station-card
                className="relative z-20 flex max-w-md flex-col gap-3 px-6 md:absolute md:bottom-[9%] md:left-[11%] md:w-[78%] md:max-w-none md:px-0"
              >
                <p className="tabular font-display text-h3 font-bold leading-none text-red">
                  {m.year}
                </p>
                <h3 className="font-display text-h3 font-semibold uppercase tracking-tight text-white">
                  {m.title}
                </h3>
                <p className="text-sm leading-relaxed text-white/65">{m.body}</p>
              </div>
            </article>
          ))}

          {/* The ground: the red line, running the full width of the world. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-0 z-10 hidden w-[112%] md:block"
            style={{ top: `${JOURNEY_GROUND_Y * 100}%` }}
          >
            {/* Wider than the world: the closing pull-back scales the camera to
                0.78, which reveals frame beyond the last station. A ground line
                stopping mid-shot would break the horizon exactly at the payoff. */}
            <div className="h-[3px] w-full bg-red" />

            {/* 2016 — a charge runs white along the line. */}
            <div
              data-line-charge
              className="absolute -top-px h-[5px] w-[14%]"
              style={{
                left: `${(CHARGE_AT / COUNT) * 100}%`,
                background:
                  'linear-gradient(90deg, rgba(255,255,255,0) 0%, #FFFFFF 45%, rgba(255,255,255,0) 100%)',
              }}
            />

            {/* 2024 — the line warms to gold at the solar array. */}
            <div
              data-line-gold
              className="absolute top-0 h-[3px] w-[9%]"
              style={{
                left: `${(GOLD_AT / COUNT) * 100}%`,
                background:
                  'linear-gradient(90deg, rgba(226,51,39,0) 0%, #E8A33D 50%, rgba(226,51,39,0) 100%)',
              }}
            />

            {/* 2026 — the line thickens into armoured cable. */}
            <div
              data-line-cable
              className="absolute -top-[3px] h-[9px] w-[9%] bg-red"
              style={{
                left: `${(CABLE_AT / COUNT) * 100}%`,
                backgroundImage:
                  'repeating-linear-gradient(115deg, rgba(0,0,0,0.38) 0 3px, rgba(255,255,255,0.14) 3px 7px)',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
