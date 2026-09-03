import { notFound } from 'next/navigation';
import { S0Preloader } from '@/components/sections/S0Preloader';

/** DEV-ONLY VERIFICATION HARNESS. See app/dev/hero/page.tsx. */
export default function DevPreloaderPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <S0Preloader preview />;
}
