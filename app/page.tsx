import { S1Hero } from '@/components/sections/S1Hero';
import { S2Glance } from '@/components/sections/S2Glance';
import { S3Journey } from '@/components/sections/S3Journey';
import { S4Map } from '@/components/sections/S4Map';
import { S5Values } from '@/components/sections/S5Values';
import { S6MissionVision } from '@/components/sections/S6MissionVision';
import { S7Leadership } from '@/components/sections/S7Leadership';
import { S8Capabilities } from '@/components/sections/S8Capabilities';
import { S9Clients } from '@/components/sections/S9Clients';
import { S10TrackRecord } from '@/components/sections/S10TrackRecord';
import { S11Quality } from '@/components/sections/S11Quality';
import { S12Safety } from '@/components/sections/S12Safety';
import { S13Contact } from '@/components/sections/S13Contact';
import { assertContinuity } from '@/lib/redline';

/**
 * The red line must exit the bottom of one section at the same x it enters the
 * next. Checked at build time so a broken hand-off fails the build instead of
 * shipping as a visible jump. Development only — tree-shaken from production.
 */
if (process.env.NODE_ENV !== 'production') {
  assertContinuity();
}

export default function Page() {
  return (
    <>
      <S1Hero />
      <S2Glance />
      <S3Journey />
      <S4Map />
      <S5Values />
      <S6MissionVision />
      <S7Leadership />
      <S8Capabilities />
      <S9Clients />
      <S10TrackRecord />
      <S11Quality />
      <S12Safety />
      <S13Contact />
    </>
  );
}
