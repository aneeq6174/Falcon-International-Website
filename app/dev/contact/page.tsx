import { notFound } from 'next/navigation';
import { S13Contact } from '@/components/sections/S13Contact';

/** DEV-ONLY VERIFICATION HARNESS. See app/dev/hero/page.tsx. */
export default function DevS13ContactPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <S13Contact />;
}
