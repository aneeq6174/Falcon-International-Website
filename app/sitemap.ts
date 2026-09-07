import type { MetadataRoute } from 'next';
import { org } from '@/content/site';

/**
 * Sitemap.
 *
 * Three real pages. The `/dev/*` verification harnesses are deliberately absent
 * — they `notFound()` in production, and listing a 404 in a sitemap is a signal
 * to Google that the site does not know its own shape.
 *
 * `trailingSlash: true` in next.config means every canonical URL ends in a
 * slash. These must match, or Google records a redirect for each entry.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${org.url}/`, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    {
      url: `${org.url}/journey/`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.7,
    },
    {
      url: `${org.url}/capabilities/`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.8,
    },
    {
      url: `${org.url}/track-record/`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];
}
