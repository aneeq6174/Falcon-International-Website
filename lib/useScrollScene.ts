'use client';

/**
 * useScrollScene — the one way a section gets animated.
 *
 * ── Nothing pins and nothing scrubs ───────────────────────────────────────
 *
 * An earlier version pinned seven sections and drove them with `scrub`, which
 * added up to 1,850vh — eighteen screen-heights — of scrolling where the page
 * did not advance. Scrubbing ties a sentence to one exact scroll offset: read it
 * at the wrong speed and it flies past, and getting it back means hunting for
 * the pixel it lives at. That is work the reader should never be doing.
 *
 * So every scene now does one thing: it plays ONCE when the section comes into
 * view, over its own short duration, and leaves the result on screen. Scroll
 * fast, stop halfway, scroll back up — the content is simply there. Motion is
 * punctuation, not a gate.
 *
 * The three things that are easy to forget are handled here, in one place:
 *
 *   1. Reduced motion. `prefers-reduced-motion: reduce` gets no animation at
 *      all — the static page, which must look intentional and complete rather
 *      than broken (brief §6).
 *   2. One path at every width. The same reveal runs on a phone and on a
 *      desktop; only layout differs, and that is CSS's job, not this hook's.
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

/** The layout breakpoint. Nothing pins at any width; this is a layout hint. */
export const MOBILE_BREAKPOINT = 768;

export type SceneConditions = {
  /** The reader has not asked for reduced motion. True at every width. */
  motion: boolean;
  /**
   * Below 768px. A LAYOUT hint only — for a scene that genuinely has less room
   * to work with. It must never select a different *kind* of animation, because
   * there is only one kind now.
   */
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
   * Kept so existing call sites stay valid. It no longer selects anything:
   * every scene runs at every width. Safe to delete from a section when you
   * next touch it.
   *
   * @deprecated
   */
  runOnMobile?: boolean;
  /**
   * Defer building until the section is within one viewport, and tear down when
   * it is two viewports away. Rarely worth it now that no scene pins — an
   * inactive trigger costs a scroll-offset comparison and nothing else.
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
      const { build, settle, lazy } = optionsRef.current;
      const ctx = makeContext(conditions);

      if (!conditions.motion || !build) {
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

    /**
     * `motion` is no longer width-dependent: the same reveal runs everywhere.
     * `narrow` is tracked separately so matchMedia still re-runs on a
     * breakpoint change, and so a scene that needs a layout hint has one.
     */
    mm.add(
      {
        motion: '(prefers-reduced-motion: no-preference)',
        reduced: '(prefers-reduced-motion: reduce)',
        narrow: `(max-width: ${MOBILE_BREAKPOINT - 1}px)`,
      },
      (scope) => {
        const c = scope.conditions as Record<string, boolean>;
        return run({ motion: !!c.motion, mobile: !!c.narrow, reduced: !!c.reduced });
      },
      root,
    );

    /**
     * Triggers are measured against a page whose red line only renders its SVG
     * after an async measure pass, so a trigger created before that lands with
     * the wrong start offset and fires early or not at all. Debounced and
     * batched, so thirteen sections mounting at once cost one refresh.
     */
    requestRefresh();

    return () => {
      mm.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return rootRef;
}
