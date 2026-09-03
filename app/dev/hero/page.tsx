import { notFound } from 'next/navigation';
import { S1Hero } from '@/components/sections/S1Hero';

/**
 * DEV-ONLY VERIFICATION HARNESS — not part of the site.
 *
 * The real page is a ~20,000px document with pinned, layer-promoted sections,
 * and screenshotting it is unreliable: captures come back blank, stale, or torn
 * often enough that they cannot be trusted as evidence. That is dangerous,
 * because a scroll-drawn scene has failure modes numbers cannot see — a tween
 * sitting correctly at 0 while the stroke still paints a repeating dash is the
 * exact bug this harness exists to catch.
 *
 * Rendering one section alone gives a short document (section + pin spacer) that
 * captures reliably, so every scene can be confirmed by looking at it.
 *
 * Add a sibling route per scene as the phases land: /dev/journey, /dev/capabilities.
 *
 * Returns 404 in production so the harness never ships to the client's site.
 */
export default function DevHeroPage() {
  if (process.env.NODE_ENV === 'production') notFound();

  return <S1Hero />;
}
