import { notFound } from 'next/navigation';
import { S6MissionVision } from '@/components/sections/S6MissionVision';
/** DEV-ONLY VERIFICATION HARNESS. See app/dev/hero/page.tsx. */
export default function DevMissionPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <S6MissionVision />;
}
