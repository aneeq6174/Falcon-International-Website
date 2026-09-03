'use client';

/**
 * useScrollScene — the one way a section gets animated.
 *
 * Every scrubbed sequence on this site goes through this hook so that the three
 * things that are easy to forget are handled in exactly one place:
 *
 *   1. Reduced motion. `prefers-reduced-motion: reduce` gets no Lenis, no pin,
 *      no scrub, no counters — the static page, which must look intentional and
 *      complete rather than broken (brief §6).
 *   2. Mobile. Below 768px ALL pinning and scrubbing is off. A janky scrubbed
 *      pin on a mid-range Android is far worse than a clean static reveal.
 *   3. Cleanup. gsap.matchMedia() reverts every tween and ScrollTrigger created
 *      inside its callback — on unmount, and on every breakpoint or
 *      reduced-motion change. Nothing created in `build` needs manual teardown.
 *
 * The `settle` callback is how a section states its finished appearance. It runs
 * whenever motion is disabled, and it is the reason the reduced-motion site is
 * not merely the animated site with the animation removed.
 */

import { useEffect, useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger, requestRefresh } from './gsap';

/** Below this width, nothing pins and nothing scrubs. Brief §6. */
export const MOBILE_BREAKPOINT = 768;

export type SceneConditions = {
  /** ≥768px and the reader has not asked for reduced motion. */
  motion: boolean;
  /** <768px and the reader has not asked for reduced motion. */
  mobile: boolean;
  /** The reader has asked for reduced motion, at any width. */
  reduced: boolean;
};

export type SceneContext = {
  conditions: SceneConditions;
  /** The section root element. */
  root: HTMLElement;
  /** Selector scoped to the section root. Use instead of document queries. */
  q: (selector: string) => Element[];
};

export type ScrollSceneOptions = {
  /**
   * Builds the animated version. Called only when motion is enabled — i.e. not
   * on mobile and not under reduced motion, unless `runOnMobile` is set.
   * May return a cleanup function for anything not created via gsap.
   */
  build?: (ctx: SceneContext) => void | (() => void);
  /**
   * Sets the finished, resting appearance. Called whenever `build` is not —
   * reduced motion, and mobile unless `runOnMobile` is set. Must leave the
   * section looking deliberate on its own.
   */
  settle?: (ctx: SceneContext) => void;
  /**
   * Opt a scene into running on mobile as a simple on-enter reveal. Pinning and
   * scrubbing are still forbidden there; this is for fade/translate/draw
   * reveals only.
   */
  runOnMobile?: boolean;
  /**
   * Defer building until the section is within one viewport, and tear down when
   * it is two viewports away. Required for S3 and S8 by the performance budget
   * (§6); pointless overhead for light sections.
   */
  lazy?: boolean;
};

/**
 * Development-only override: `?reduced=1` forces every scene down the
 * reduced-motion path.
 *
 * The reduced-motion fallback is the version of this site a real reader gets if
 * they have asked their OS for less movement, and it is the one path that cannot
 * be exercised in a browser that will not emulate `prefers-reduced-motion`. A
 * fallback nobody has ever seen run is a fallback nobody knows works.
 *
 * Stripped from production.
 */
function forcedReduced(): boolean {
  if (process.env.NODE_ENV === 'production') return false;
  if (typeof window === 'undefined') return false;
  try {
    return new URLSearchParams(window.location.search).has('reduced');
  } catch {
    return false;
  }
}

/** useLayoutEffect warns during SSR; this is the standard swap. */
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function useScrollScene<T extends HTMLElement = HTMLElement>(
  options: ScrollSceneOptions,
  deps: React.DependencyList = [],
) {
  // Mutable on purpose: callers may need to attach it alongside another ref.
  const rootRef = useRef<T | null>(null);

  // Held in a ref so a re-render with fresh closures does not rebuild the scene.
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const mm = gsap.matchMedia();

    const makeContext = (conditions: SceneConditions): SceneContext => ({
      conditions,
      root,
      q: (selector: string) => Array.from(root.querySelectorAll(selector)),
    });

    const run = (conditions: SceneConditions): (() => void) | void => {
      const { build, settle, runOnMobile, lazy } = optionsRef.current;
      const ctx = makeContext(conditions);

      const wantsMotion = conditions.motion || (conditions.mobile && runOnMobile === true);

      if (!wantsMotion || !build) {
        settle?.(ctx);
        return;
      }

      if (!lazy) {
        return build(ctx) ?? undefined;
      }

      /**
       * Lazy path: instantiate within one viewport of entry, tear down at two.
       * The gate trigger itself is created inside matchMedia, so it is reverted
       * with everything else.
       */
      let inner: gsap.Context | null = null;

      const mount = () => {
        if (inner) return;
        inner = gsap.context(() => build(ctx), root);
      };

      const unmount = () => {
        if (!inner) return;
        inner.revert();
        inner = null;
        settle?.(ctx);
      };

      ScrollTrigger.create({
        trigger: root,
        start: 'top bottom+=100%',
        end: 'bottom top-=100%',
        onEnter: mount,
        onEnterBack: mount,
        onLeave: unmount,
        onLeaveBack: unmount,
      });

      return () => {
        inner?.revert();
        inner = null;
      };
    };

    if (forcedReduced()) {
      const ctx = gsap.context(
        () => run({ motion: false, mobile: false, reduced: true }),
        root,
      );
      requestRefresh();
      return () => ctx.revert();
    }

    mm.add(
      {
        motion: `(min-width: ${MOBILE_BREAKPOINT}px) and (prefers-reduced-motion: no-preference)`,
        mobile: `(max-width: ${MOBILE_BREAKPOINT - 1}px) and (prefers-reduced-motion: no-preference)`,
        reduced: '(prefers-reduced-motion: reduce)',
      },
      (scope) => {
        const c = scope.conditions as SceneConditions;
        return run({ motion: !!c.motion, mobile: !!c.mobile, reduced: !!c.reduced });
      },
      root,
    );

    /**
     * A scene that pins needs its start/end recomputed once everything it was
     * built against has settled — the red line only renders its SVG after an
     * async measure pass, and a pinned trigger created before that lands with
     * an uncomputed end and silently never scrubs. Debounced and batched, so
     * thirteen sections mounting at once cost one refresh.
     */
    requestRefresh();

    return () => {
      mm.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return rootRef;
}
