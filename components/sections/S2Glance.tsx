'use client';

/**
 * S2 — At a Glance. Pinned for 100vh.
 *
 * The red line drops from S1, forks to the four statistics, each counts as its
 * branch lands, and the branches rejoin below.
 *
 * ── The beat ──────────────────────────────────────────────────────────────
 *
 * The fourth statistic runs DOWN to zero and holds. Then the whole section
 * pauses before the branches reunite — an actual gap in the timeline, so under
 * scrub the reader keeps scrolling and nothing moves. That stillness is the
 * point: it is the only place in the section where the page stops answering,
 * and it lands on the zero-fatalities figure.
 *
 * ── Counters ──────────────────────────────────────────────────────────────
 *
 * Tweened through a proxy object, writing textContent on update. Durations are
 * in timeline units, so under scrub they read as scroll distance rather than
 * seconds — a scrubbed counter that ran on a wall clock would finish while the
 * reader was still arriving. Tabular numerals keep the width from jittering.
 */

import { useCallback, useState } from 'react';
import { RedLine } from '@/components/RedLine';
import {
  Eyebrow,
  SECTION_SHELL,
  SectionBody,
  Stat,
  TermRun,
  sectionTone,
} from '@/components/ui/primitives';
import { gsap } from '@/lib/gsap';
import { hideStrand, revealStrand } from '@/lib/redline';
import {
  countTween,
  readCounters,
  resetCounters,
  settleCounters,
} from '@/lib/scene';
import { useScrollScene } from '@/lib/useScrollScene';
import { glance } from '@/content/site';

/** Timeline positions, as fractions of the whole. */
const T = {
  trunkIn: 0,
  trunkInDur: 0.1,
  branchOut: 0.08,
  branchOutDur: 0.2,
  branchStagger: 0.05,
  countStart: 0.2,
  countStagger: 0.07,
  countDur: 0.2,
  /** The gap. Nothing animates between the last count and the reunion. */
  reunite: 0.74,
  reuniteDur: 0.16,
  trunkOut: 0.9,
  trunkOutDur: 0.1,
} as const;

export function S2Glance() {
  const [strandStructure, setStrandStructure] = useState('');
  const onStrands = useCallback((structure: string) => setStrandStructure(structure), []);

  const rootRef = useScrollScene<HTMLElement>(
    {
      runOnMobile: true,

      build: ({ conditions, q }) => {
        const counters = readCounters(q('[data-count-to]'));

        const strand = (id: string) =>
          q(`[data-strand="${id}"]`)[0] as SVGPathElement | undefined;

        const trunkIn = strand('trunk-in');
        const trunkOut = strand('trunk-out');
        const outs = [0, 1, 2, 3].map((i) => strand(`out-${i}`)).filter(Boolean) as SVGPathElement[];
        const ins = [0, 1, 2, 3].map((i) => strand(`in-${i}`)).filter(Boolean) as SVGPathElement[];
        const collector = strand('collector');

        // The fork only exists on a single-row layout. When the builder fell
        // back to the plain spine there is nothing to sequence, so drive that
        // one path and let the counters carry the section.
        const forked = Boolean(trunkIn && trunkOut && outs.length > 0 && ins.length > 0);
        const linePaths = (
          forked
            ? [trunkIn!, ...outs, ...ins, ...(collector ? [collector] : []), trunkOut!]
            : (q('[data-strand]') as SVGPathElement[])
        ) as SVGPathElement[];

        if (linePaths.length === 0) return;
        linePaths.forEach(hideStrand);

        resetCounters(counters);

        const promote = () =>
          linePaths.forEach((p) => (p.style.willChange = 'stroke-dashoffset'));
        const release = () => linePaths.forEach((p) => (p.style.willChange = 'auto'));

        /* ---- Mobile: no pin, no scrub. One on-enter reveal. ------------ */
        if (conditions.mobile) {
          const tl = gsap.timeline({
            scrollTrigger: { trigger: rootRef.current, start: 'top 75%', once: true },
            onStart: promote,
            onComplete: release,
          });

          tl.to(linePaths, {
            strokeDashoffset: 0,
            ease: 'power2.out',
            duration: 0.7,
            stagger: 0.05,
          });

          counters.forEach((c, i) => {
            tl.add(countTween(c, 1.2), 0.3 + i * 0.12);
          });

          return;
        }

        /* ---- Desktop: one master trigger, 100vh of pinned scrub -------- */
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top top',
            end: '+=100%',
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

        if (forked) {
          tl.to(trunkIn!, { strokeDashoffset: 0, duration: T.trunkInDur }, T.trunkIn)
            .to(
              outs,
              { strokeDashoffset: 0, duration: T.branchOutDur, stagger: T.branchStagger },
              T.branchOut,
            );
        } else {
          tl.to(linePaths, { strokeDashoffset: 0, duration: 0.4 }, 0);
        }

        // Each statistic counts as its branch arrives. The fourth runs down to
        // zero and then simply stops — the hold is the absence of anything after.
        counters.forEach((c, i) => {
          tl.add(countTween(c, T.countDur), T.countStart + i * T.countStagger);
        });

        if (forked) {
          tl.to(
            ins,
            { strokeDashoffset: 0, duration: T.reuniteDur, stagger: T.branchStagger },
            T.reunite,
          );
          if (collector) {
            tl.to(
              collector,
              { strokeDashoffset: 0, duration: T.reuniteDur * 0.8 },
              T.reunite + T.reuniteDur * 0.5,
            );
          }
          tl.to(trunkOut!, { strokeDashoffset: 0, duration: T.trunkOutDur }, T.trunkOut);
        }

        // Holds the timeline open to a full 1.0 so the beat before the reunion
        // is real scroll distance rather than being trimmed off the end.
        tl.set({}, {}, 1);
      },

      settle: ({ q }) => {
        // Reduced motion: line drawn, counters at their final values. The
        // server already rendered those values, so this only has to undo the
        // starting state a previous condition may have left behind.
        (q('[data-strand]') as SVGPathElement[]).forEach(revealStrand);
        settleCounters(readCounters(q('[data-count-to]')));
      },
    },
    [strandStructure],
  );

  return (
    <section
      ref={rootRef}
      id="glance"
      aria-labelledby="glance-heading"
      className={`${SECTION_SHELL} ${sectionTone.paper} flex min-h-[var(--vh)] flex-col justify-center`}
    >
      <RedLine id="glance" driven onStrands={onStrands} />

      <SectionBody className="flex flex-col gap-16">
        <Eyebrow as="h2" id="glance-heading">
          {glance.eyebrow}
        </Eyebrow>

        <div className="grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {glance.stats.map((stat) => (
            <Stat
              key={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              countFrom={stat.countFrom}
              label={stat.label}
              sub={stat.sub}
            />
          ))}
        </div>

        <div data-glance-footer className="grid gap-10 border-t border-ink/10 pt-12 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <Eyebrow>{glance.sectorsTitle}</Eyebrow>
            <TermRun items={glance.sectors} />
          </div>

          <div className="flex flex-col gap-4">
            <Eyebrow>{glance.clientsTitle}</Eyebrow>
            <ul className="flex flex-col gap-2">
              {glance.keyClients.map((client) => (
                <li key={client} className="flex gap-3 text-sm leading-relaxed text-grey">
                  <span aria-hidden="true" className="mt-2 h-px w-3 shrink-0 bg-red" />
                  <span>{client}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SectionBody>
    </section>
  );
}
