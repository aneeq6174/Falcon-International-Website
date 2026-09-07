'use client';

/**
 * S0 — Preloader.
 *
 * Navy full screen. The wordmark arrives, then the wings sweep outward from the
 * body, while a red rule fills left-to-right under a 00 → 100 counter. On
 * complete the mark scales down and flies into the nav's logo slot.
 *
 * ── Never trap the user ───────────────────────────────────────────────────
 *
 * The brief's one hard rule, and it is defended three ways, because a preloader
 * that fails to dismiss is worse than no preloader at all:
 *
 *   1. A 2.0s hard timeout in JS, regardless of what has loaded.
 *   2. A CSS animation that hides this element at 2.5s WITHOUT JavaScript. If
 *      the bundle fails, errors, or never hydrates, the overlay still goes away.
 *   3. It is server-rendered but hidden by default, and only shown once the
 *      inline script in the layout has added `.js`. With JS disabled it never
 *      appears at all.
 *
 * It also never runs under reduced motion, and only once per session — the
 * inline script sets `.preloaded` from sessionStorage before first paint, so a
 * repeat visit does not even flash it.
 *
 * The page content is behind it and fully rendered, so this costs nothing in
 * SEO terms and does not gate the LCP element.
 */

import { useEffect, useRef, useState } from 'react';
import { FalconMark } from '@/components/scenes/FalconMark';
import { gsap } from '@/lib/gsap';
import { preloader } from '@/content/site';

/** The brief's hard ceiling. Dismiss at this point whatever has loaded. */
const TIMEOUT_MS = 2000;

/** Marks the session so a repeat visit skips it. Read by the layout's script. */
const SESSION_KEY = 'falcon-preloaded';

export function S0Preloader({ preview = false }: { preview?: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    // Dev harness: render the frame and never dismiss, so it can be looked at.
    if (preview) return;
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let already = false;
    try {
      already = sessionStorage.getItem(SESSION_KEY) === '1';
    } catch {
      // Private mode or blocked storage: just show it.
    }

    if (reduced || already) {
      setGone(true);
      return;
    }

    const timers: Array<ReturnType<typeof setTimeout>> = [];

    const ctx = gsap.context(() => {
      const glyph = root.querySelector('[data-falcon-mark]');
      const rule = root.querySelector('[data-preload-rule]');
      const count = root.querySelector<HTMLElement>('[data-preload-count]');
      const mark = root.querySelector<HTMLElement>('[data-preload-mark]');

      // The mark is the client's artwork, so it arrives whole rather than being
      // assembled from parts it does not have.
      gsap.set(glyph, { opacity: 0, scale: 0.92, transformOrigin: '50% 50%' });
      gsap.set(rule, { transformOrigin: '0% 50%', scaleX: 0 });

      const progress = { v: 0 };

      const intro = gsap.timeline();
      intro
        .to(glyph, { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }, 0)
        .to(rule, { scaleX: 1, duration: 1.1, ease: 'power2.inOut' }, 0.1)
        .to(
          progress,
          {
            v: 100,
            duration: 1.1,
            ease: 'power2.inOut',
            onUpdate: () => {
              if (count) count.textContent = String(Math.round(progress.v)).padStart(2, '0');
            },
          },
          0.1,
        );

      /** The mark scales down and flies into the nav's logo slot. */
      const dismiss = () => {
        try {
          sessionStorage.setItem(SESSION_KEY, '1');
        } catch {
          // Nothing to do; it will simply show again next time.
        }

        const navMark = document.querySelector<HTMLElement>('[data-nav-mark] img, [data-nav-mark] svg');
        const out = gsap.timeline({ onComplete: () => setGone(true) });

        if (mark && navMark) {
          const from = mark.getBoundingClientRect();
          const to = navMark.getBoundingClientRect();
          if (from.width > 0 && to.width > 0) {
            out.to(
              mark,
              {
                x: to.left + to.width / 2 - (from.left + from.width / 2),
                y: to.top + to.height / 2 - (from.top + from.height / 2),
                scale: to.width / from.width,
                duration: 0.62,
                ease: 'power4.inOut',
              },
              0,
            );
          }
        }

        out.to(root, { opacity: 0, duration: 0.34, ease: 'power2.inOut' }, 0.3);
      };

      // Whichever comes first: the page finishing, or the hard ceiling.
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        window.removeEventListener('load', finish);
        clearTimeout(timer);
        // Let the intro reach a sensible point rather than cutting it mid-draw.
        // setTimeout, NOT gsap.delayedCall: a delayedCall rides the GSAP ticker,
        // so anything that stalls the ticker would leave the overlay up forever.
        const remaining = Math.max(0, 0.85 - intro.time()) * 1000;
        timers.push(setTimeout(dismiss, remaining));
      };

      const timer = setTimeout(finish, TIMEOUT_MS);
      timers.push(timer);

      /**
       * The last line of defence inside JS. Whatever happens to the ticker, the
       * tweens or the load event, the overlay is unmounted by this point.
       * The CSS keyframe in globals.css covers the case where JS is not running
       * at all.
       */
      timers.push(setTimeout(() => setGone(true), TIMEOUT_MS + 1200));

      if (document.readyState === 'complete') finish();
      else window.addEventListener('load', finish);
    }, root);

    return () => {
      timers.forEach(clearTimeout);
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (gone) return null;

  return (
    <div
      ref={rootRef}
      className="preloader fixed inset-0 z-[200] data-[preview]:!flex flex-col items-center justify-center gap-10 bg-navy"
      data-preview={preview ? '' : undefined}
      role="status"
      aria-live="polite"
      aria-label={preloader.label}
    >
      <div data-preload-mark className="w-[min(58vw,26rem)]">
        <FalconMark eager className="h-auto w-full" />
      </div>

      <div className="flex w-[min(58vw,26rem)] flex-col gap-3">
        <div className="h-0.5 w-full bg-white/12">
          <div data-preload-rule className="h-full w-full bg-red" />
        </div>
        <p className="tabular flex justify-between font-display text-xs font-semibold tracking-widest text-white/50">
          <span>{preloader.label}</span>
          <span>
            <span data-preload-count>00</span>
          </span>
        </p>
      </div>
    </div>
  );
}
