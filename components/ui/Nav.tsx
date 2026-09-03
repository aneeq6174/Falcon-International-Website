/**
 * Fixed top navigation.
 *
 * Server-rendered and static in Phase 0. The preloader hand-off (S0 flying the
 * mark into the top-left slot) lands in Phase 7 and will target `data-nav-mark`.
 */

import { FalconMark } from '@/components/scenes/FalconMark';
import { nav, org } from '@/content/site';

export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-navy/90 backdrop-blur-sm">
      <div className="shell flex h-16 items-center justify-between gap-4 xl:gap-6">
        <a href="#hero" className="flex items-center gap-3" data-nav-mark>
          {/*
            The vector glyph, not the source PNG. That file is 1.26MB — nearly
            half the export — for a 36px mark, and it was being fetched on every
            page load as both the nav logo and the favicon.
          */}
          <FalconMark wordmark={false} className="h-7 w-auto" />
          <span className="sr-only">{nav.logoAlt}</span>
          <span className="hidden whitespace-nowrap font-display text-sm font-bold uppercase tracking-wider text-white sm:block lg:hidden xl:block">
            {org.name}
          </span>
        </a>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-5 xl:gap-8">
            {nav.items.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="whitespace-nowrap font-display text-xs font-semibold uppercase tracking-widest text-white/70 transition-colors hover:text-white"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <a
          href="#contact"
          className="whitespace-nowrap bg-red px-5 py-2.5 font-display text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-[#c72b20]"
        >
          {nav.cta}
        </a>
      </div>
    </header>
  );
}
