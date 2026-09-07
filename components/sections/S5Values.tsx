'use client';

/**
 * S5 — Values.
 *
 * Never pinned, never scrubbed. This is the brief's deliberate pacing relief:
 * the reader has just come through 600vh of the Journey and needs to breathe.
 *
 * So the whole section does exactly one thing — each card's icon draws itself on
 * entry, staggered 80ms — and then stops. The red line threads the grid's row
 * gutter and is the only other movement. Resisting the urge to add more here is
 * the point; §9 warns that if everything animates at the same intensity, nothing
 * reads as animated at all.
 */

import { RedLine } from '@/components/RedLine';
import { ValueIcon } from '@/components/scenes/ValueIcons';
import {
  Eyebrow,
  SECTION_SHELL,
  SectionBody,
  sectionTone,
} from '@/components/ui/primitives';
import { gsap } from '@/lib/gsap';
import { SCENE_BUILD_SELECTOR, SECTION_REVEAL_START, guaranteeReveal, settleScene } from '@/lib/scene';
import { useScrollScene } from '@/lib/useScrollScene';
import { values } from '@/content/site';

/** The brief's number. Calm, and slow enough to read as deliberate. */
const STAGGER = 0.08;

export function S5Values() {
  const rootRef = useScrollScene<HTMLElement>({
    runOnMobile: true,

    build: ({ q, root }) => {
      const icons = q('[data-value-card] [data-build="draw"]');
      if (icons.length === 0) return;

      gsap.set(icons, { strokeDasharray: 100, strokeDashoffset: 100 });
      gsap.to(icons, {
        strokeDashoffset: 0,
        duration: 0.7,
        ease: 'power2.out',
        stagger: STAGGER,
        scrollTrigger: { trigger: root, start: SECTION_REVEAL_START, once: true, onEnter: guaranteeReveal },
      });
    },

    settle: ({ q }) => settleScene(q(SCENE_BUILD_SELECTOR)),
  });

  return (
    <section
      ref={rootRef}
      id="values"
      aria-labelledby="values-heading"
      className={`${SECTION_SHELL} ${sectionTone.paper}`}
    >
      <RedLine id="values" />

      <SectionBody className="flex flex-col gap-14">
        <Eyebrow as="h2" id="values-heading">
          {values.eyebrow}
        </Eyebrow>

        <ul data-values-grid className="grid grid-cols-2 gap-px bg-ink/10 lg:grid-cols-4">
          {values.items.map((value) => (
            <li
              key={value.title}
              data-value-card
              className="flex flex-col gap-4 bg-paper p-6 lg:p-8"
            >
              <ValueIcon title={value.title} />
              <h3 className="font-display text-h3 font-semibold uppercase tracking-tight text-navy">
                {value.title}
              </h3>
              <p className="text-sm leading-relaxed text-grey">{value.body}</p>
            </li>
          ))}
        </ul>
      </SectionBody>
    </section>
  );
}
