'use client';

/**
 * The compact menu, below the breakpoint where the link row fits.
 *
 * There was no mobile navigation at all: the links were `hidden lg:block`, so on
 * a phone the header carried the mark and the enquiry button and nothing else.
 * That was survivable while everything lived on one page and scrolling reached
 * all of it. It stopped being survivable when Capabilities and Track record
 * moved to their own pages — on a phone they were unreachable from the header.
 *
 * A client component only because it closes itself. A `<details>` disclosure
 * would keep this server-rendered, but it stays open after a same-page anchor
 * link is followed, leaving the panel sitting over the content the reader just
 * asked to see.
 */

import { useEffect, useRef, useState } from 'react';
import { nav } from '@/content/site';

export function NavMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Escape, and a tap anywhere outside. Both are what a reader expects, and
  // neither is worth a library.
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onPointer = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };

    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="nav-menu-panel"
        aria-label={nav.menuLabel}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center text-white transition-colors hover:text-red"
      >
        <span aria-hidden="true" className="relative block h-[13px] w-5">
          <span
            className={`absolute inset-x-0 h-0.5 bg-current transition-transform duration-200 ${
              open ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-0'
            }`}
          />
          <span
            className={`absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-current transition-opacity duration-200 ${
              open ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <span
            className={`absolute inset-x-0 h-0.5 bg-current transition-transform duration-200 ${
              open ? 'bottom-1/2 translate-y-1/2 -rotate-45' : 'bottom-0'
            }`}
          />
        </span>
      </button>

      {/*
        Rendered always, hidden with `hidden` rather than unmounted, so the links
        are in the server HTML for crawlers and for a reader whose JavaScript
        never arrives. globals.css forces `[hidden]` to win over Tailwind's
        display utilities.
      */}
      <nav
        id="nav-menu-panel"
        aria-label={nav.menuLabel}
        hidden={!open}
        className="absolute right-0 top-full mt-3 w-60 border border-white/12 bg-navy p-2 shadow-lg shadow-navy/30"
      >
        <ul className="flex flex-col">
          {nav.items.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={() => setOpen(false)}
                className="block px-3 py-3 font-display text-xs font-semibold uppercase tracking-widest text-white/80 transition-colors hover:bg-white/5 hover:text-white"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
