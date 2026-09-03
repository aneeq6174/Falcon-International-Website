import { notFound } from 'next/navigation';
import { S7Leadership } from '@/components/sections/S7Leadership';
/** DEV-ONLY VERIFICATION HARNESS. See app/dev/hero/page.tsx. */
export default function DevLeadershipPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <S7Leadership />;
}
