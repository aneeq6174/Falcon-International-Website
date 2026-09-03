import { notFound } from 'next/navigation';
import { S9Clients } from '@/components/sections/S9Clients';

/** DEV-ONLY VERIFICATION HARNESS. See app/dev/hero/page.tsx. */
export default function DevS9ClientsPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <S9Clients />;
}
