import { notFound } from 'next/navigation';
import { S12Safety } from '@/components/sections/S12Safety';

/** DEV-ONLY VERIFICATION HARNESS. See app/dev/hero/page.tsx. */
export default function DevS12SafetyPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <S12Safety />;
}
