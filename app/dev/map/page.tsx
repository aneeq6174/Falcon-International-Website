import { notFound } from 'next/navigation';
import { S4Map } from '@/components/sections/S4Map';

/** DEV-ONLY VERIFICATION HARNESS. See app/dev/hero/page.tsx. */
export default function DevMapPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <S4Map />;
}
