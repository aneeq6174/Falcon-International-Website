import type { Metadata, Viewport } from 'next';
import { Archivo, Inter } from 'next/font/google';
import { S0Preloader } from '@/components/sections/S0Preloader';
import { Nav } from '@/components/ui/Nav';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { meta, nav, org } from '@/content/site';
import './globals.css';

/**
 * A tight industrial grotesk for headings, Inter for body — brief §3.
 * `display: 'swap'` so text is never invisible while the font loads; on a 4G
 * connection in Pakistan a blocking font is a straight LCP failure.
 */
const display = Archivo({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  weight: ['600', '700'],
});

const body = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  metadataBase: new URL(org.url),
  title: meta.title,
  description: meta.description,
  keywords: [...meta.keywords],
  applicationName: org.name,
  authors: [{ name: org.name, url: org.url }],
  creator: org.name,
  publisher: org.name,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: org.name,
    title: meta.title,
    description: meta.description,
    url: org.url,
    locale: 'en_PK',
    // Dimensions match the actual file. It is the client's logo, not a
    // purpose-made 1200x630 social card — see the open item in the README.
    images: [{ url: '/assets/falcon-logo.png', width: 1536, height: 1024, alt: meta.ogAlt }],
  },
  twitter: {
    card: 'summary_large_image',
    title: meta.title,
    description: meta.description,
    images: ['/assets/falcon-logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  // Favicon comes from app/icon.png (Next's file convention): the client's own
  // mark, cropped from their logo file and reduced to 4 kB, rather than the
  // 1.26 MB original fetched on every page load.
};

export const viewport: Viewport = {
  themeColor: '#1B2A4A',
  width: 'device-width',
  initialScale: 1,
};

/**
 * Organization + LocalBusiness, per brief §6. Emitted server-side so it is in
 * the static export's HTML rather than injected at runtime.
 */
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${org.url}/#organization`,
      name: org.name,
      url: org.url,
      logo: `${org.url}/assets/falcon-logo.png`,
      description: meta.description,
      foundingDate: org.foundedISO,
      email: org.emails[0],
      telephone: org.phones[0],
      address: {
        '@type': 'PostalAddress',
        streetAddress: org.address.street,
        addressLocality: org.address.locality,
        addressCountry: org.address.country,
      },
    },
    {
      '@type': 'LocalBusiness',
      '@id': `${org.url}/#localbusiness`,
      name: org.name,
      image: `${org.url}/assets/falcon-logo.png`,
      url: org.url,
      description: meta.description,
      foundingDate: org.foundedISO,
      telephone: org.phones,
      email: org.emails,
      priceRange: '$$',
      address: {
        '@type': 'PostalAddress',
        streetAddress: org.address.street,
        addressLocality: org.address.locality,
        addressCountry: org.address.country,
      },
      areaServed: [
        { '@type': 'Country', name: 'Pakistan' },
        { '@type': 'Place', name: 'Gulf' },
        { '@type': 'Country', name: 'Egypt' },
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Industrial contracting services',
        itemListElement: org.services.map((service) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: service },
        })),
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-PK" className={`${display.variable} ${body.variable}`}>
      <body>
        {/*
          Marks the document as scripted BEFORE anything paints, so the CSS in
          globals.css can hold scroll-drawn artwork in its undrawn state from the
          first frame. With JS disabled the class is never added and that artwork
          renders complete instead of invisible. Must stay first in <body> and
          must stay synchronous.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.classList.add('js');" +
              "try{if(sessionStorage.getItem('falcon-preloaded')==='1')" +
              "document.documentElement.classList.add('preloaded')}catch(e){}",
          }}
        />
        <script
          type="application/ld+json"
          // Static, author-controlled object. No user input reaches this string.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-red focus:px-5 focus:py-3 focus:font-display focus:text-sm focus:uppercase focus:tracking-wider focus:text-white"
        >
          {nav.skipToContent}
        </a>
        <S0Preloader />
        <Nav />
        <main id="main">{children}</main>
        <WhatsAppButton />
      </body>
    </html>
  );
}
