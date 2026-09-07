'use client';

/**
 * S7 — Leadership.
 *
 * The founder's full letter is rendered into the DOM at all times and collapsed
 * with CSS, never conditionally rendered — brief §5 and §6. A <details> element
 * gives a keyboard-operable expander with no JavaScript, and search engines
 * index the closed content.
 *
 * ── Motion ────────────────────────────────────────────────────────────────
 *
 * The portrait is revealed by a vertical mask wipe travelling with scroll: a
 * cover panel scaled from the top down to nothing. transform only — no
 * clip-path, no height.
 *
 * The pull quote scales up from 0.94 with a short blur settling out. Blur is a
 * filter and therefore paint-heavy, so it runs ONCE on entry rather than being
 * played once on entry. Everything here is transform and opacity.
 */

import { RedLine } from '@/components/RedLine';
import {
  Eyebrow,
  PhotoPlaceholder,
  SECTION_SHELL,
  SectionBody,
  sectionTone,
} from '@/components/ui/primitives';
import { gsap } from '@/lib/gsap';
import { ITEM_REVEAL_START, guaranteeReveal } from '@/lib/scene';
import { useScrollScene } from '@/lib/useScrollScene';
import { leadership } from '@/content/site';

export function S7Leadership() {
  const { founder, team, talent } = leadership;

  const rootRef = useScrollScene<HTMLElement>({
    runOnMobile: true,

    build: ({ q, root }) => {
      const cover = q('[data-portrait-cover]')[0];
      const quote = q('[data-pull-quote]')[0];
      const cards = q('[data-leader-card]');

      if (cover) {
        // Vertical mask wipe travelling with scroll.
        gsap.set(cover, { transformOrigin: '50% 100%', scaleY: 1 });
        gsap.to(cover, {
          scaleY: 0,
          ease: 'none',
          scrollTrigger: { trigger: cover, start: ITEM_REVEAL_START, once: true, onEnter: guaranteeReveal },
        });
      }

      if (quote) {
        gsap.set(quote, { scale: 0.94, opacity: 0, filter: 'blur(4px)' });
        gsap.to(quote, {
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.8,
          ease: 'power4.out',
          scrollTrigger: { trigger: quote, start: ITEM_REVEAL_START, once: true, onEnter: guaranteeReveal },
        });
      }

      if (cards.length) {
        gsap.set(cards, { y: 20, opacity: 0 });
        gsap.to(cards, {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          stagger: 0.1,
          scrollTrigger: { trigger: root, start: 'top 55%', once: true, onEnter: guaranteeReveal },
        });
      }
    },

    settle: ({ q }) => {
      gsap.set(q('[data-portrait-cover]'), { scaleY: 0 });
      gsap.set(q('[data-pull-quote]'), { scale: 1, opacity: 1, filter: 'none' });
      gsap.set(q('[data-leader-card]'), { y: 0, opacity: 1 });
    },
  });

  return (
    <section
      ref={rootRef}
      id="leadership"
      aria-labelledby="leadership-heading"
      className={`${SECTION_SHELL} ${sectionTone.paper}`}
    >
      <RedLine id="leadership" />

      <SectionBody className="flex flex-col gap-20">
        <Eyebrow as="h2" id="leadership-heading">
          {leadership.eyebrow}
        </Eyebrow>

        {/* Founder */}
        <div className="grid gap-10 md:grid-cols-[minmax(0,20rem)_1fr] lg:gap-16">
          <div className="relative overflow-hidden">
            <PhotoPlaceholder slot={founder.portrait} />
            {/* The wipe. Scaled from the top down to nothing as the reader
                arrives — transform only, so it composites cleanly. */}
            <span
              data-portrait-cover
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-paper"
            />
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h3 className="font-display text-h2 uppercase text-navy">{founder.name}</h3>
              <p className="eyebrow text-red">{founder.role}</p>
            </div>

            <blockquote data-pull-quote className="border-l-2 border-red pl-6">
              <p className="text-h3 font-display font-semibold italic leading-snug text-navy">
                &ldquo;{founder.pullQuote}&rdquo;
              </p>
            </blockquote>

            <ul className="flex flex-col gap-2">
              {founder.points.map((point) => (
                <li key={point} className="flex gap-3 text-sm leading-relaxed text-grey">
                  <span aria-hidden="true" className="mt-2 h-px w-3 shrink-0 bg-red" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <details className="group border-t border-ink/10 pt-6">
              <summary className="cursor-pointer list-none font-display text-xs font-semibold uppercase tracking-widest text-navy transition-colors hover:text-red">
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden="true" className="text-red">
                    +
                  </span>
                  {founder.expanderLabel}
                </span>
              </summary>
              <div className="mt-6 flex max-w-2xl flex-col gap-4">
                {founder.letter.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)} className="text-sm leading-relaxed text-grey">
                    {paragraph}
                  </p>
                ))}
              </div>
            </details>
          </div>
        </div>

        {/* Management */}
        <div className="grid gap-10 border-t border-ink/10 pt-14 md:grid-cols-2">
          {team.map((member) => (
            <article key={member.name} data-leader-card className="flex flex-col gap-5">
              <PhotoPlaceholder slot={member.portrait} className="max-w-[14rem]" />
              <div className="flex flex-col gap-2">
                <h3 className="font-display text-h3 font-semibold uppercase tracking-tight text-navy">
                  {member.name}
                </h3>
                <p className="eyebrow text-red">{member.role}</p>
              </div>
              <p className="text-sm leading-relaxed text-grey">{member.body}</p>
              <div className="flex flex-col gap-1 border-t border-ink/10 pt-4 text-xs text-grey">
                <span>{member.experience}</span>
                <span>{member.credentials}</span>
              </div>
            </article>
          ))}
        </div>

        {/* Talent management */}
        <div className="flex flex-col gap-8 border-t border-ink/10 pt-14">
          <Eyebrow>{talent.eyebrow}</Eyebrow>
          <h3 className="max-w-3xl text-h2 uppercase text-navy">{talent.title}</h3>
          <p className="max-w-2xl text-sm leading-relaxed text-grey">{talent.body}</p>

          <ul className="grid gap-px bg-ink/10 sm:grid-cols-3">
            {talent.pillars.map((pillar) => (
              <li key={pillar.title} className="flex flex-col gap-3 bg-paper p-6">
                <span aria-hidden="true" className="rule-red" />
                <h4 className="font-display text-h3 font-semibold uppercase tracking-tight text-navy">
                  {pillar.title}
                </h4>
                <p className="text-sm leading-relaxed text-grey">{pillar.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </SectionBody>
    </section>
  );
}
