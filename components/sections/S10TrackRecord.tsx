'use client';

/**
 * S10 — Track Record.
 *
 * A filterable index of thirty-two projects. Rows stagger in on entry, and
 * filtering REORDERS rather than re-rendering — the rows that survive a filter
 * glide to their new positions instead of the list flashing.
 *
 * ── The FLIP ──────────────────────────────────────────────────────────────
 *
 * Standard First-Last-Invert-Play, done by hand rather than pulling in another
 * plugin for one interaction:
 *
 *   1. record every row's position BEFORE the filter changes
 *   2. let React apply the filter
 *   3. record positions AFTER, in a layout effect, before the browser paints
 *   4. set each survivor's transform to (first − last) — so it is painted where
 *      it used to be — then animate that offset to zero
 *
 * Rows entering the filter fade up; rows leaving are simply gone, because they
 * are what the reader asked to remove.
 *
 * ── What stays in the DOM ─────────────────────────────────────────────────
 *
 * Every row is server-rendered and filtered rows keep their markup, hidden. The
 * full index is always crawlable, and with JS off the list renders complete with
 * no filter applied.
 */

import { useLayoutEffect, useRef, useState } from 'react';
import { RedLine } from '@/components/RedLine';
import {
  Eyebrow,
  SECTION_SHELL,
  SectionBody,
  sectionTone,
} from '@/components/ui/primitives';
import { gsap } from '@/lib/gsap';
import { SECTION_REVEAL_START, guaranteeReveal } from '@/lib/scene';
import { useScrollScene } from '@/lib/useScrollScene';
import { trackRecord } from '@/content/site';

type Rects = Map<string, DOMRect>;

export function S10TrackRecord() {
  const [active, setActive] = useState<string>('all');
  const listRef = useRef<HTMLUListElement>(null);
  /** Positions captured just before the filter changed. */
  const firstRects = useRef<Rects | null>(null);
  const reduced = useRef(false);

  const rootRef = useScrollScene<HTMLElement>({
    runOnMobile: true,

    build: ({ q, root }) => {
      reduced.current = false;
      const rows = q('[data-project-row]');
      if (rows.length === 0) return;

      gsap.set(rows, { y: 16, opacity: 0 });
      gsap.to(rows, {
        y: 0,
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out',
        stagger: 0.02,
        scrollTrigger: { trigger: root, start: SECTION_REVEAL_START, once: true, onEnter: guaranteeReveal },
      });
    },

    settle: ({ q }) => {
      reduced.current = true;
      gsap.set(q('[data-project-row]'), { y: 0, opacity: 1, clearProps: 'transform' });
    },
  });

  /** Snapshot positions before React re-renders with the new filter. */
  const onFilter = (id: string) => {
    if (id === active) return;
    const list = listRef.current;
    if (list && !reduced.current) {
      const rects: Rects = new Map();
      list.querySelectorAll<HTMLElement>('[data-project-row]').forEach((row) => {
        if (row.hidden) return;
        rects.set(row.dataset.rowKey ?? '', row.getBoundingClientRect());
      });
      firstRects.current = rects;
    }
    setActive(id);
  };

  // Runs after the filter is applied but before paint, which is what makes the
  // inverted transform invisible.
  useLayoutEffect(() => {
    const list = listRef.current;
    const first = firstRects.current;
    firstRects.current = null;
    if (!list || !first || reduced.current) return;

    const entering: HTMLElement[] = [];

    list.querySelectorAll<HTMLElement>('[data-project-row]').forEach((row) => {
      if (row.hidden) return;
      const key = row.dataset.rowKey ?? '';
      const last = row.getBoundingClientRect();
      const prev = first.get(key);

      if (!prev) {
        entering.push(row);
        return;
      }

      const dy = prev.top - last.top;
      if (Math.abs(dy) < 1) return;

      gsap.fromTo(
        row,
        { y: dy },
        { y: 0, duration: 0.45, ease: 'power2.out', overwrite: 'auto' },
      );
    });

    if (entering.length) {
      gsap.fromTo(
        entering,
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out', stagger: 0.015 },
      );
    }
  }, [active]);

  const visibleCount =
    active === 'all'
      ? trackRecord.projects.length
      : trackRecord.projects.filter((p) => p.category === active).length;

  return (
    <section
      ref={rootRef}
      id="track-record"
      aria-labelledby="track-record-heading"
      className={`${SECTION_SHELL} ${sectionTone.white}`}
    >
      <RedLine id="track-record" />

      <SectionBody className="flex flex-col gap-12">
        <header className="flex flex-col gap-4">
          <Eyebrow>{trackRecord.eyebrow}</Eyebrow>
          <h2 id="track-record-heading" className="text-h2 uppercase text-navy">
            {trackRecord.title}
          </h2>
        </header>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter projects by discipline">
          {trackRecord.filters.map((filter) => {
            const isActive = active === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => onFilter(filter.id)}
                className={`border px-4 py-2 font-display text-xs font-semibold uppercase tracking-widest transition-colors duration-200 ${
                  isActive
                    ? 'border-red bg-red text-white'
                    : 'border-ink/15 text-navy hover:border-navy'
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        <p aria-live="polite" className="text-xs uppercase tracking-widest text-grey">
          {visibleCount} {visibleCount === 1 ? 'project' : 'projects'}
        </p>

        <ul ref={listRef} className="flex flex-col border-t border-ink/10">
          {trackRecord.projects.map((project) => {
            const key = `${project.year}-${project.client}-${project.scope}`;
            const hidden = active !== 'all' && project.category !== active;
            return (
              <li
                key={key}
                data-project-row
                data-row-key={key}
                data-category={project.category}
                hidden={hidden}
                className="grid grid-cols-[5.5rem_1fr] gap-x-6 gap-y-1 border-b border-ink/10 py-5 md:grid-cols-[7rem_minmax(0,14rem)_1fr]"
              >
                <span className="tabular font-display text-sm font-bold text-red">
                  {project.year}
                </span>
                <span className="font-display text-sm font-semibold uppercase tracking-tight text-navy">
                  {project.client}
                </span>
                <span className="col-start-2 text-sm leading-relaxed text-grey md:col-start-3">
                  {project.scope}
                </span>
              </li>
            );
          })}
        </ul>
      </SectionBody>
    </section>
  );
}
