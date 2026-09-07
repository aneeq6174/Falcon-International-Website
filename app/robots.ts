import type { MetadataRoute } from 'next';
import { org } from '@/content/site';

/**
 * robots.txt.
 *
 * `/api/` is disallowed because there is nothing there for a crawler: the only
 * route is the contact endpoint, whose GET is a configuration health check.
 * `/dev/` already 404s in production; naming it here means a crawler never
 * spends a request finding that out.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/dev/'] }],
    sitemap: `${org.url}/sitemap.xml`,
    host: org.url,
  };
}
