'use client';

/**
 * RedLine — one section's segment of the continuous red line.
 *
 * Measures its section, resolves the segment to its strands, generates each
 * path in CSS pixels, and (unless driven) draws them open once with
 * stroke-dashoffset as the section comes into view.
 *
 * Measuring is what makes the drawing correct. With the viewBox in CSS pixels
 * and mapped 1:1 to the element, corner radii stay circular whatever the
 * section's height and stroke-width needs no `vector-effect` compensation. See
 * the header of lib/redline.ts for why the normalised-viewBox alternative does
 * not work, and DASH_UNITS there for why the draw is measured in a declared
 * pathLength rather than in pixels.
 *
 * ── Driven mode ───────────────────────────────────────────────────────────
 *
 * A section whose own timeline needs the line in sequence with its content
 * passes `driven`. This component then sets up no motion at all and the
 * section's timeline tweens these paths itself, finding them with
 * `q('[data-strand]')`. `onStrands` reports the strand structure so the section
 * can rebuild if a fork appears or collapses.
 *
 * The segment is decorative to assistive technology — everything it conveys is
 * carried by the headings and copy, never by the line itself.
 */

import { useEffect, useRef, useState } from 'react';
import { gsap, requestRefresh } from '@/lib/gsap';
import { guaranteeReveal } from '@/lib/scene';
import { useScrollScene } from '@/lib/useScrollScene';
import {
  RED,
  STROKE_WIDTH,
  STROKE_WIDTH_HEAVY,
  DASH_UNITS,
  buildPath,
  getSegment,
  resolveStrands,
  type SegmentId,
} from '@/lib/redline';

type RenderedStrand = { id: string; d: string; heavy: boolean };

type RedLineState = {
  width: number;
  height: number;
  strands: RenderedStrand[];
};

const EMPTY: RedLineState = { width: 0, height: 0, strands: [] };

const sameStrands = (a: RenderedStrand[], b: RenderedStrand[]): boolean =>
  a.length === b.length && a.every((s, i) => s.id === b[i].id && s.d === b[i].d);

export function RedLine({
  id,
  driven = false,
  layer = 'behind',
  onStrands,
  className,
}: {
  id: SegmentId;
  /** The parent section owns the motion. See "Driven mode" above. */
  driven?: boolean;
  /**
   * Where the line sits relative to the section's content.
   *
   * `behind` (the default) is right almost everywhere — content sits on top and
   * the line threads the gaps. `above` is for sections built from full-bleed
   * opaque panels, where a line behind them is simply not visible at all.
   */
  layer?: 'behind' | 'above';
  /**
   * Reports the strand STRUCTURE (their ids) whenever it changes shape — not
   * on every resize. A driving section keys its timeline off this, so pixel
   * resizes never rebuild it and only a real change (fork appearing or
   * collapsing to the spine) does.
   */
  onStrands?: (structure: string) => void;
  className?: string;
}) {
  const segment = getSegment(id);
  // Mutable: shared with the scene ref on the same node.
  const hostRef = useRef<HTMLElement | null>(null);
  const [state, setState] = useState<RedLineState>(EMPTY);

  // Held in a ref so the measure effect never needs the callback in its deps.
  const onStrandsRef = useRef(onStrands);
  onStrandsRef.current = onStrands;

  /**
   * Measure, resolve strands, generate paths. Rounded to whole pixels so a
   * sub-pixel layout wobble cannot loop the observer, and debounced to the
   * 250ms the performance budget specifies for resize handling (§6).
   */
  useEffect(() => {
    const host = hostRef.current;
    if (!host || typeof ResizeObserver === 'undefined') return;

    let timer: ReturnType<typeof setTimeout> | null = null;

    const measure = () => {
      const rect = host.getBoundingClientRect();
      const width = Math.round(rect.width);
      const height = Math.round(rect.height);
      if (width <= 0 || height <= 0) return;

      const strands = resolveStrands(segment, {
        width,
        height,
        host,
        section: host.parentElement,
      })
        .map((strand) => ({
          id: strand.id,
          d: buildPath(strand.nodes, width, height),
          heavy: strand.heavy ?? segment.heavy ?? false,
        }))
        .filter((strand) => strand.d !== '');

      setState((prev) => {
        if (prev.width === width && prev.height === height && sameStrands(prev.strands, strands)) {
          return prev;
        }
        return { width, height, strands };
      });

      // Rendering the SVG changes what the triggers measured against.
      requestRefresh();
    };

    measure();

    const observer = new ResizeObserver(() => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(measure, 250);
    });

    observer.observe(host);

    return () => {
      if (timer) clearTimeout(timer);
      observer.disconnect();
    };
  }, [segment]);

  const structure = state.strands.map((s) => s.id).join(',');

  // Tell a driving section when the strand structure changes shape.
  useEffect(() => {
    if (driven && structure !== '') onStrandsRef.current?.(structure);
  }, [driven, structure]);

  const sceneRef = useScrollScene<HTMLDivElement>(
    {
      build: ({ q }) => {
        if (driven) return;

        const paths = q('[data-strand]') as SVGPathElement[];
        if (paths.length === 0) return;

        gsap.set(paths, { strokeDasharray: DASH_UNITS, strokeDashoffset: DASH_UNITS });

        /**
         * No will-change here, deliberately. `stroke-dashoffset` is not a
         * compositable property, so promoting it creates no GPU layer and buys
         * nothing — it only costs memory. Fifty-four such hints were live at
         * rest before this was removed. Promotion is for transform and opacity.
         */

        /**
         * The line draws itself once as its section arrives, and stays drawn.
         *
         * It used to be scrubbed across the section's whole travel, which meant
         * scrolling back up un-drew it. Tying the line to an exact scroll offset
         * is the same mistake the pinned sections made — smaller, but the reader
         * still watches something disappear for no reason they can act on.
         */
        gsap.to(paths, {
          strokeDashoffset: 0,
          duration: 0.9,
          ease: 'power2.out',
          stagger: 0.06,
          scrollTrigger: {
            trigger: sceneRef.current,
            start: 'top 85%',
            once: true,
            onEnter: guaranteeReveal,
          },
        });
      },

      settle: ({ q }) => {
        if (driven) return;
        // Reduced motion: the finished line, drawn, static, no layer promotion.
        const paths = q('[data-strand]');
        gsap.set(paths, {
          strokeDasharray: 'none',
          strokeDashoffset: 0,
          willChange: 'auto',
        });
      },
    },
    [id, driven, structure],
  );

  return (
    <div
      ref={(node) => {
        hostRef.current = node;
        sceneRef.current = node;
      }}
      aria-hidden="true"
      data-redline={id}
      data-entry-x={segment.entryX}
      data-exit-x={segment.exitX}
      className={`pointer-events-none absolute inset-0 ${
        layer === 'above' ? 'z-20' : 'z-0'
      } ${className ?? ''}`}
    >
      {state.strands.length > 0 ? (
        <svg
          className="h-full w-full"
          viewBox={`0 0 ${state.width} ${state.height}`}
          width={state.width}
          height={state.height}
          fill="none"
          focusable="false"
        >
          {state.strands.map((strand) => (
            <path
              key={strand.id}
              data-strand={strand.id}
              d={strand.d}
              // Fixed dash unit — see DASH_UNITS in lib/redline.ts.
              pathLength={DASH_UNITS}
              stroke={RED}
              strokeWidth={strand.heavy ? STROKE_WIDTH_HEAVY : STROKE_WIDTH}
              strokeLinecap="butt"
              strokeLinejoin="round"
            />
          ))}
        </svg>
      ) : null}
    </div>
  );
}
