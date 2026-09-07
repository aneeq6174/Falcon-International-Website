/**
 * Fixed top navigation.
 *
 * Server-rendered. The link row collapses into NavMenu below `lg`, which is the
 * only client component here — everything else is static markup.
 */

import { FalconMark } from '@/components/scenes/FalconMark';
import { NavMenu } from '@/components/ui/NavMenu';
import { nav, org } from '@/content/site';

export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-navy/90 backdrop-blur-sm">
      <div className="shell flex h-16 items-center justify-between gap-4 xl:gap-6">
        <a href="/" className="flex items-center gap-3" data-nav-mark>
          {/*
            The client's own mark, cropped out of their logo file and reduced
            from 1.26 MB to 35 kB. The name beside it is live text rather than
            the logo's arced wordmark, which is near-black and would vanish on
            this navy. See components/scenes/FalconMark.tsx.
          */}
          <FalconMark eager className="h-7 w-auto" />
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

        <div className="flex items-center gap-2">
          <a
            href="/#contact"
            className="whitespace-nowrap bg-red px-5 py-2.5 font-display text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-[#c72b20]"
          >
            {nav.cta}
          </a>

          {/* Below lg the link row above does not fit; this carries it. */}
          <NavMenu />
        </div>
      </div>
    </header>
  );
}
