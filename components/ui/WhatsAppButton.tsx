'use client';

/**
 * Floating WhatsApp button.
 *
 * A plain anchor to `wa.me` with a prefilled message — no SDK, no embed, no
 * third-party script. It works on a static export, offline-to-first-tap, and
 * costs nothing in page weight beyond one inline SVG.
 *
 * ── Why red and not WhatsApp green ────────────────────────────────────────
 *
 * The brand system is closed: navy, red, ink, grey, paper, white, and red is
 * reserved for the line, key numerals, rules and CTAs. A floating contact button
 * is a CTA, so red is exactly what it is for — and introducing a seventh colour
 * for one control would be the first crack in a system the whole site holds to.
 * The glyph carries the recognition on its own.
 *
 * ── Behaviour ────────────────────────────────────────────────────────────
 *
 * Hidden while the preloader is up, so it does not float over the intro. It
 * fades in once, and never animates again — a permanently pulsing button is the
 * kind of thing §9 warns about.
 *
 * It sits ABOVE the back-to-top button in the bottom-right stack, because it is
 * the one of the two that starts a conversation. The offsets here and in
 * BackToTop are the only thing keeping them from overlapping, so change them
 * together.
 */

import { useEffect, useState } from 'react';
import { org, whatsapp } from '@/content/site';

const HREF = `https://wa.me/${org.whatsapp}?text=${encodeURIComponent(whatsapp.message)}`;

export function WhatsAppButton() {
  const [ready, setReady] = useState(false);

  // Wait for the preloader to have gone before appearing.
  useEffect(() => {
    const show = () => setReady(true);
    const t = setTimeout(show, 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <a
      href={HREF}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${whatsapp.label} — ${org.whatsappDisplay}`}
      data-whatsapp
      className={`group fixed bottom-[4.75rem] right-5 z-[150] flex h-14 w-14 items-center justify-center rounded-full bg-red shadow-lg shadow-navy/30 transition-[opacity,transform] duration-300 hover:scale-105 focus-visible:scale-105 md:bottom-[5.75rem] md:right-7 md:h-16 md:w-16 ${
        ready ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
      }`}
    >
      <svg
        viewBox="0 0 32 32"
        className="h-7 w-7 md:h-8 md:w-8"
        fill="#FFFFFF"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M16.04 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.26.6 4.47 1.73 6.42L3.2 28.8l6.55-1.72a12.74 12.74 0 0 0 6.29 1.6h.01c7.05 0 12.79-5.74 12.79-12.8 0-3.42-1.33-6.63-3.75-9.05a12.7 12.7 0 0 0-9.05-3.75Zm0 23.32h-.01c-1.9 0-3.76-.51-5.39-1.48l-.38-.23-4 1.05 1.07-3.9-.25-.4a10.6 10.6 0 0 1-1.63-5.66c0-5.87 4.78-10.64 10.65-10.64 2.84 0 5.51 1.11 7.52 3.12a10.57 10.57 0 0 1 3.11 7.53c0 5.87-4.78 10.64-10.69 10.64Zm5.84-7.97c-.32-.16-1.89-.93-2.18-1.04-.29-.11-.5-.16-.71.16-.21.32-.82 1.04-1 1.25-.19.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.89-1.78-2.21-.19-.32-.02-.5.14-.66.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.71-1.72-.98-2.35-.26-.62-.52-.53-.71-.54l-.61-.01c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.65s1.14 3.08 1.3 3.29c.16.21 2.24 3.42 5.43 4.8.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.89-.77 2.15-1.52.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.61-.37Z" />
      </svg>
    </a>
  );
}
