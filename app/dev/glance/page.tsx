import { notFound } from 'next/navigation';
import { S2Glance } from '@/components/sections/S2Glance';

/**
 * DEV-ONLY VERIFICATION HARNESS — not part of the site.
 * See app/dev/hero/page.tsx for why these exist and how to drive them.
 */
export default function DevGlancePage() {
  if (process.env.NODE_ENV === 'production') notFound();

  return <S2Glance />;
}
