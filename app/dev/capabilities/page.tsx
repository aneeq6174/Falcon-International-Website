import { notFound } from 'next/navigation';
import { S8Capabilities } from '@/components/sections/S8Capabilities';

/**
 * DEV-ONLY VERIFICATION HARNESS — not part of the site.
 * See app/dev/hero/page.tsx for why these exist and how to drive them.
 */
export default function DevCapabilitiesPage() {
  if (process.env.NODE_ENV === 'production') notFound();

  return <S8Capabilities />;
}
