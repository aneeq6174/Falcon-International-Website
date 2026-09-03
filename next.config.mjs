/** @type {import('next').NextConfig} */

/**
 * The site is built as a Next server app rather than a static export.
 *
 * That is a direct consequence of sending enquiries server-side: a route handler
 * cannot exist alongside `output: 'export'`. Everything else is unchanged —
 * every page is still prerendered to static HTML at build time and served from
 * the CDN, so the performance profile is the same. What it now needs is a host
 * that runs Node: Vercel, Netlify, Cloudflare Pages with the Next adapter, or
 * any container.
 *
 * To go back to a pure static export (deployable to any dumb file host), delete
 * `app/api/contact/route.ts` and add `output: 'export'` here. The contact form
 * falls back to composing mail in the visitor's own app on its own — see the
 * submit handler in S13Contact.
 */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
