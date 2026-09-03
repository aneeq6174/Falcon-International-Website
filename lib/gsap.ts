'use client';

/**
 * Single registration point for GSAP and ScrollTrigger.
 *
 * Import gsap/ScrollTrigger from HERE and nowhere else. Registering the plugin
 * in more than one module is the usual cause of duplicate-instance bugs and of
 * ScrollTrigger silently not refreshing.
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  // registerPlugin is idempotent, and this module is a singleton, so a single
  // unconditional call is the whole guard.
  gsap.registerPlugin(ScrollTrigger);

  /**
   * Mobile browser chrome resizing the viewport must not trigger a full
   * ScrollTrigger recalculation — that is the single biggest source of jank on
   * Android during scroll. See brief §6, "Mobile strategy".
   */
  ScrollTrigger.config({
    ignoreMobileResize: true,
    autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load',
  });

  /**
   * House easing. The brief forbids back/elastic/bounce anywhere on this site —
   * this is heavy industry, not a toy. Defaulting to power2.out means an
   * un-specified tween can never accidentally overshoot.
   */
  gsap.defaults({ ease: 'power2.out', duration: 0.6 });

  /**
   * Development-only handles. Scroll-driven timelines are close to impossible to
   * inspect from the outside — you cannot tell a frozen scrub from a correct one
   * by looking at a screenshot. Exposed so trigger progress can be read and
   * driven directly while building a phase. Stripped from production.
   */
  if (process.env.NODE_ENV !== 'production') {
    (window as unknown as Record<string, unknown>).__gsap = gsap;
    (window as unknown as Record<string, unknown>).__ScrollTrigger = ScrollTrigger;
  }
}

/** Resize handling is debounced to 250ms per the performance budget (§6). */
const REFRESH_DEBOUNCE_MS = 250;

let refreshTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Batched, debounced ScrollTrigger.refresh(). Never call ScrollTrigger.refresh()
 * directly from a component — many sections calling it in the same frame causes
 * a layout thrash that drops frames on mid-range Android.
 */
export function requestRefresh(): void {
  if (typeof window === 'undefined') return;
  if (refreshTimer) clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => {
    ScrollTrigger.refresh();
    refreshTimer = null;
  }, REFRESH_DEBOUNCE_MS);
}

export { gsap, ScrollTrigger };
