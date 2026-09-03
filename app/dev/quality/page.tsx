import { notFound } from 'next/navigation';
import { S11Quality } from '@/components/sections/S11Quality';

/** DEV-ONLY VERIFICATION HARNESS. See app/dev/hero/page.tsx. */
export default function DevS11QualityPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <S11Quality />;
}
