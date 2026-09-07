import type { Metadata } from 'next';
import { TrackRecordDetail } from '@/components/pages/TrackRecordDetail';
import { DetailPage } from '@/components/ui/DetailPage';
import { org, trackRecord } from '@/content/site';

export const metadata: Metadata = {
  title: `Track record — ${org.name}`,
  description: trackRecord.summary,
  alternates: { canonical: '/track-record/' },
  openGraph: {
    title: `Track record — ${org.name}`,
    description: trackRecord.summary,
    url: `${org.url}/track-record/`,
  },
};

export default function TrackRecordPage() {
  return (
    <DetailPage
      eyebrow={trackRecord.eyebrow}
      title={trackRecord.title}
      intro={trackRecord.pageIntro}
    >
      <TrackRecordDetail />
    </DetailPage>
  );
}
