'use client';

/**
 * S9 — Clients.
 *
 * The line flattens into three horizontal rails. Logos slide in along them and
 * lock, then the rails drift slowly in opposite directions as an infinite
 * marquee that pauses on hover.
 *
 * ── The marquee ───────────────────────────────────────────────────────────
 *
 * Each rail renders its clients TWICE and translates from 0 to -50% on a linear
 * repeat, so the wrap is seamless with no measuring and no jump. One transform
 * per rail, three rails — the whole effect costs three composited layers.
 *
 * It is paused whenever the section is off-screen. A marquee is the one thing on
 * this site that would otherwise run forever whether or not anyone is looking,
 * and on the mid-range Android the brief targets that is a battery cost for
 * nothing.
 *
 * No logo artwork has been supplied, so each cell is the client's name set in
 * the display face. "Greyscale at rest, full colour on hover" becomes muted at
 * rest, full navy on hover — the same intent, and it will survive the swap to
 * real artwork unchanged.
 */

import { RedLine } from '@/components/RedLine';
import {
  Eyebrow,
  SECTION_SHELL,
  SectionBody,
  sectionTone,
} from '@/components/ui/primitives';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { SECTION_REVEAL_START, guaranteeReveal } from '@/lib/scene';
import { useScrollScene } from '@/lib/useScrollScene';
import { clients } from '@/content/site';

const RAILS = 3;

/** Seconds for one full cycle. Slow enough to read as drift, not as motion. */
const CYCLE = 46;

/** Split the roster into three rails, preserving order across them. */
function toRails(items: readonly string[]): string[][] {
  const rails: string[][] = Array.from({ length: RAILS }, () => []);
  items.forEach((item, i) => rails[i % RAILS].push(item));
  return rails;
}

export function S9Clients() {
  const rails = toRails(clients.logos);

  const rootRef = useScrollScene<HTMLElement>({
    runOnMobile: true,

    build: ({ q, root }) => {
      const tracks = q('[data-rail-track]');
      const cells = q('[data-client-cell]');
      if (tracks.length === 0) return;

      // Logos slide in along the rails and lock.
      gsap.set(cells, { xPercent: 18, opacity: 0 });
      gsap.to(cells, {
        xPercent: 0,
        opacity: 1,
        duration: 0.7,
        ease: 'power2.out',
        stagger: 0.03,
        scrollTrigger: { trigger: root, start: SECTION_REVEAL_START, once: true, onEnter: guaranteeReveal },
      });

      // Then the rails drift, alternate directions.
      const drifts = tracks.map((track, i) => {
        const reverse = i % 2 === 1;
        gsap.set(track, { xPercent: reverse ? -50 : 0 });
        return gsap.to(track, {
          xPercent: reverse ? 0 : -50,
          duration: CYCLE,
          ease: 'none',
          repeat: -1,
          paused: true,
        });
      });

      /**
       * Only run while the section is on screen. A marquee is the one thing here
       * that would otherwise animate forever behind fourteen other sections.
       */
      const gate = ScrollTrigger.create({
        trigger: root,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: ({ isActive }) =>
          drifts.forEach((d) => (isActive ? d.play() : d.pause())),
      });

      // Pause on hover, per the brief.
      const rails = q('[data-rail]');
      const enter = () => drifts.forEach((d) => d.timeScale(0));
      const leave = () => drifts.forEach((d) => d.timeScale(1));
      rails.forEach((rail) => {
        rail.addEventListener('mouseenter', enter);
        rail.addEventListener('mouseleave', leave);
      });

      return () => {
        gate.kill();
        rails.forEach((rail) => {
          rail.removeEventListener('mouseenter', enter);
          rail.removeEventListener('mouseleave', leave);
        });
      };
    },

    settle: ({ q }) => {
      // Reduced motion: no marquee at all. A static, readable grid of clients.
      gsap.set(q('[data-client-cell]'), { xPercent: 0, opacity: 1 });
      gsap.set(q('[data-rail-track]'), { xPercent: 0 });
    },
  });

  return (
    <section
      ref={rootRef}
      id="clients"
      aria-labelledby="clients-heading"
      className={`${SECTION_SHELL} ${sectionTone.paper}`}
    >
      <RedLine id="clients" />

      <SectionBody className="flex flex-col gap-14">
        <header className="flex max-w-4xl flex-col gap-6">
          <Eyebrow>{clients.eyebrow}</Eyebrow>
          <h2 id="clients-heading" className="text-h2 uppercase text-navy">
            {clients.headline}
          </h2>
        </header>
      </SectionBody>

      {/*
        Full-bleed, outside the shell: the rails run edge to edge so the marquee
        has somewhere to come from and go to.
      */}
      <div className="relative z-10 mt-2 flex flex-col gap-px overflow-hidden border-y border-ink/10 bg-ink/10">
        {rails.map((rail, i) => (
          <div key={i} data-rail className="overflow-hidden bg-paper">
            <ul
              data-rail-track
              className="flex w-max items-center"
              /* Rendered twice; the tween runs 0 → -50%, so the wrap is seamless. */
            >
              {[...rail, ...rail].map((client, j) => (
                <li
                  key={`${client}-${j}`}
                  data-client-cell
                  aria-hidden={j >= rail.length ? true : undefined}
                  className="flex min-h-[6.5rem] shrink-0 items-center justify-center px-10"
                >
                  <span className="whitespace-nowrap font-display text-xs font-semibold uppercase tracking-widest text-navy/45 transition-colors duration-200 hover:text-navy">
                    {client}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
