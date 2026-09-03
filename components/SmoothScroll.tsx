'use client';

/**
 * Lenis smooth scroll, wired into GSAP's ticker.
 *
 * Two hard rules from the brief (§6):
 *
 *   - Disabled on touch devices. Native momentum scrolling on Android and iOS is
 *     better than anything we can synthesise, and Lenis fighting it is exactly
 *     how scrollytelling sites end up feeling broken on a phone.
 *   - Disabled under `prefers-reduced-motion: reduce`, along with all pinning
 *     and scrubbing.
 *
 * Lenis drives ScrollTrigger rather than running its own RAF loop, so scroll
 * position is read once per frame instead of twice.
 */

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/lib/gsap';

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // `?reduced=1` forces this path in development too — see forcedReduced()
    // in lib/useScrollScene.ts for why that hook exists.
    const forced =
      process.env.NODE_ENV !== 'production' &&
      new URLSearchParams(window.location.search).has('reduced');

    const prefersReducedMotion =
      forced || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Coarse pointer is the reliable touch test; navigator.maxTouchPoints alone
    // is true for touch-capable laptops that should still get smooth scroll.
    const isTouch = window.matchMedia('(pointer: coarse)').matches;

    if (prefersReducedMotion || isTouch) {
      document.documentElement.classList.add('native-scroll');
      return;
    }

    const lenis = new Lenis({
      duration: 1.1,
      // Weighted, mechanical deceleration. No spring, no overshoot.
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
    });

    lenis.on('scroll', ScrollTrigger.update);

    /**
     * Development-only handle. While Lenis is running it owns the scroll
     * position, so `window.scrollTo` is silently reverted on the next frame —
     * which makes a scroll-driven scene impossible to park at a known progress
     * for inspection. Use `__lenis.scrollTo(y, { immediate: true })` instead.
     * Stripped from production.
     */
    if (process.env.NODE_ENV !== 'production') {
      (window as unknown as Record<string, unknown>).__lenis = lenis;
    }

    const tick = (time: number) => {
      // GSAP's ticker reports seconds; Lenis expects milliseconds.
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
