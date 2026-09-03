import { notFound } from 'next/navigation';
import { S5Values } from '@/components/sections/S5Values';
/** DEV-ONLY VERIFICATION HARNESS. See app/dev/hero/page.tsx. */
export default function DevValuesPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <S5Values />;
}
