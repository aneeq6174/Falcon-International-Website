import { notFound } from 'next/navigation';
import { S10TrackRecord } from '@/components/sections/S10TrackRecord';

/** DEV-ONLY VERIFICATION HARNESS. See app/dev/hero/page.tsx. */
export default function DevS10TrackRecordPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <S10TrackRecord />;
}
