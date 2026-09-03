import { notFound } from 'next/navigation';
import { S3Journey } from '@/components/sections/S3Journey';

/**
 * DEV-ONLY VERIFICATION HARNESS — not part of the site. See app/dev/hero/page.tsx
 * for why these exist and how to drive them.
 *
 * S3 pins for 600vh, so this page is ~700vh — still an order of magnitude
 * shorter than the real page, which is what makes captures reliable.
 *
 * Remember: capture pinned sections at scrollY 0 with the timeline driven
 * directly. The pane snapshots the document at the scroll offset, so a fixed
 * pinned section is absent from any capture taken at non-zero scroll.
 */
export default function DevJourneyPage() {
  if (process.env.NODE_ENV === 'production') notFound();

  return <S3Journey />;
}
