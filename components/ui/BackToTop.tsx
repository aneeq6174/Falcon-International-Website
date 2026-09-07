'use client';

/**
 * Back to top.
 *
 * Sits below the WhatsApp button in the bottom-right stack, and appears only
 * once the reader is far enough down that getting back is actually a chore. In
 * the hero it would be a control that does nothing.
 *
 * The scroll itself is left to CSS. `scroll-behavior: smooth` on `html` in
 * globals.css already carries every in-page jump on this site, including the
 * nav's, and doing it here in JavaScript instead would give this one button a
 * different feel from the rest of them — and would ignore the reduced-motion
 * override that block honours.
 */

import { useEffect, useState } from 'react';
import { nav } from '@/content/site';

/** Roughly a screen and a half down: far enough that the top is a journey. */
const SHOW_AFTER_VIEWPORTS = 1.5;

export function BackToTop() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShown(window.scrollY > window.innerHeight * SHOW_AFTER_VIEWPORTS);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label={nav.backToTop}
      // `hidden` rather than unmounting, so the button never causes a layout
      // pass on a scroll event. globals.css forces [hidden] over Tailwind.
      hidden={!shown}
      onClick={() => {
        // Move focus with the reader. Scrolling the page while the keyboard
        // stays where it was is the classic back-to-top accessibility bug.
        window.scrollTo({ top: 0 });
        document.getElementById('main')?.focus?.();
      }}
      className="group fixed bottom-5 right-5 z-[150] flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-navy/90 text-white shadow-lg shadow-navy/30 backdrop-blur-sm transition-colors duration-200 hover:border-red hover:text-red md:bottom-7 md:right-7 md:h-14 md:w-14"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5 md:h-6 md:w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M12 19V6" />
        <path d="M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
