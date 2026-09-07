import type { Metadata } from 'next';
import { CapabilitiesDetail } from '@/components/pages/CapabilitiesDetail';
import { DetailPage } from '@/components/ui/DetailPage';
import { capabilities, org } from '@/content/site';

export const metadata: Metadata = {
  title: `Capabilities — ${org.name}`,
  description: capabilities.summary,
  alternates: { canonical: '/capabilities/' },
  openGraph: {
    title: `Capabilities — ${org.name}`,
    description: capabilities.summary,
    url: `${org.url}/capabilities/`,
  },
};

export default function CapabilitiesPage() {
  return (
    <DetailPage
      eyebrow={capabilities.eyebrow}
      title={capabilities.title}
      intro={capabilities.pageIntro}
    >
      <CapabilitiesDetail />
    </DetailPage>
  );
}
