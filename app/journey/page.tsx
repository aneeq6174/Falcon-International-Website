import type { Metadata } from 'next';
import { JourneyDetail } from '@/components/pages/JourneyDetail';
import { DetailPage } from '@/components/ui/DetailPage';
import { journey, org } from '@/content/site';

export const metadata: Metadata = {
  title: `Our journey, 1997–2026 — ${org.name}`,
  description: journey.summary,
  alternates: { canonical: '/journey/' },
  openGraph: {
    title: `Our journey, 1997–2026 — ${org.name}`,
    description: journey.summary,
    url: `${org.url}/journey/`,
  },
};

export default function JourneyPage() {
  return (
    <DetailPage
      eyebrow={journey.eyebrow}
      title={journey.title}
      intro={journey.pageIntro}
    >
      <JourneyDetail />
    </DetailPage>
  );
}
