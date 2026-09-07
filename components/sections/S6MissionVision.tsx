'use client';

/**
 * S6 — Mission & Vision.
 *
 * Two full-height panels, navy and paper. Text rises on a per-line mask reveal,
 * OFFSET between the two panels so they read as a conversation rather than two
 * blocks animating in unison — that offset is the whole idea, and the brief says
 * so explicitly.
 *
 * Lines are the browser's real line boxes, found by `splitLines` (lib/scene.ts):
 * the copy is server-rendered and only re-wrapped, never injected. Under reduced
 * motion the split does not run at all — there is nothing to reveal and
 * rewrapping text for no reason is pure risk.
 *
 * Light parallax only. This sits between the Journey and Leadership and is the
 * second of the brief's two quiet sections.
 */

import { RedLine } from '@/components/RedLine';
import { Eyebrow } from '@/components/ui/primitives';
import { gsap } from '@/lib/gsap';
import { splitLines, guaranteeReveal } from '@/lib/scene';
import { useScrollScene } from '@/lib/useScrollScene';
import { missionVision } from '@/content/site';

/** How far the second panel trails the first. Enough to read as a reply. */
const PANEL_OFFSET = 0.18;

export function S6MissionVision() {
  const rootRef = useScrollScene<HTMLElement>({
    runOnMobile: true,

    build: ({ q, root }) => {
      const panels = q('[data-mv-panel]');
      if (panels.length === 0) return;

      panels.forEach((panel, i) => {
        const body = panel.querySelector<HTMLElement>('[data-mv-body]');
        const lines = body ? splitLines(body) : [];
        const head = panel.querySelectorAll('[data-mv-head]');

        // If splitting declined, reveal the block whole rather than not at all.
        const targets = lines.length > 0 ? lines : body ? [body] : [];
        if (targets.length === 0) return;

        gsap.set(targets, { yPercent: 110 });
        gsap.set(head, { opacity: 0, y: 14 });

        const tl = gsap.timeline({
          scrollTrigger: { trigger: root, start: 'top 68%', once: true, onEnter: guaranteeReveal },
        });

        tl.to(head, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, i * PANEL_OFFSET).to(
          targets,
          { yPercent: 0, duration: 0.7, ease: 'power4.out', stagger: 0.07 },
          i * PANEL_OFFSET + 0.1,
        );
      });
    },

    settle: ({ q }) => {
      // Reduced motion: never split. Just make sure nothing is left hidden.
      gsap.set(q('[data-mv-head]'), { opacity: 1, y: 0 });
      gsap.set(q('[data-mv-body]'), { opacity: 1, y: 0 });
    },
  });

  return (
    <section
      ref={rootRef}
      id="mission-vision"
      aria-label="Mission and vision"
      className="relative isolate overflow-hidden"
    >
      {/* Above: both panels are full-bleed and opaque, so a line behind them
          would never be seen. */}
      <RedLine id="mission-vision" layer="above" />

      <div className="relative z-10 grid md:grid-cols-2">
        <div
          data-mv-panel
          className="flex flex-col justify-center gap-6 bg-navy px-6 py-section text-white md:px-10 lg:px-14"
        >
          <div data-mv-head className="flex flex-col gap-6">
            <Eyebrow as="h2" tone="white" id="mission-heading">
              {missionVision.mission.eyebrow}
            </Eyebrow>
            <span aria-hidden="true" className="rule-red" />
          </div>
          <p
            data-mv-body
            className="max-w-xl text-h3 font-display font-semibold leading-snug tracking-tight"
          >
            {missionVision.mission.body}
          </p>
        </div>

        <div
          data-mv-panel
          className="flex flex-col justify-center gap-6 bg-paper px-6 py-section text-ink md:px-10 lg:px-14"
        >
          <div data-mv-head className="flex flex-col gap-6">
            <Eyebrow as="h2" id="vision-heading">
              {missionVision.vision.eyebrow}
            </Eyebrow>
            <span aria-hidden="true" className="rule-red" />
          </div>
          <p
            data-mv-body
            className="max-w-xl text-h3 font-display font-semibold leading-snug tracking-tight text-navy"
          >
            {missionVision.vision.body}
          </p>
        </div>
      </div>
    </section>
  );
}
