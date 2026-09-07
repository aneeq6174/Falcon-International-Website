'use client';

/**
 * The full, filterable project index, for /track-record.
 *
 * Every project is server-rendered — all of them, not just the active filter —
 * so the page is complete without JavaScript and search engines see the whole
 * index. Filtering only toggles `hidden`, which is why `[hidden]` is forced in
 * globals.css: Tailwind's `grid` on the row would otherwise win against the
 * user-agent rule and the filter would appear to do nothing.
 */

import { useCallback, useState } from 'react';
import { trackRecord } from '@/content/site';

export function TrackRecordDetail() {
  const [active, setActive] = useState<string>('all');

  const onFilter = useCallback((id: string) => setActive(id), []);

  const visibleCount =
    active === 'all'
      ? trackRecord.projects.length
      : trackRecord.projects.filter((p) => p.category === active).length;

  return (
    <div className="bg-white py-section">
      <div className="shell flex flex-col gap-8">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter projects by discipline"
        >
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

        <ul className="flex flex-col border-t border-ink/10">
          {trackRecord.projects.map((project) => {
            const key = `${project.year}-${project.client}-${project.scope}`;
            return (
              <li
                key={key}
                data-category={project.category}
                hidden={active !== 'all' && project.category !== active}
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
      </div>
    </div>
  );
}
