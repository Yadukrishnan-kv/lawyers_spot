import type { Metadata } from 'next';
import { Inter, Manrope } from 'next/font/google';
import { SiteChrome } from '@/components/layout/site-chrome';
import { CmsProvider } from '@/lib/cms/context';
import { JsonLd } from '@/components/seo/json-ld';
import { toPublicCms } from '@/lib/cms/public-types';
import { getCmsData } from '@/lib/cms/store';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap' });

export async function generateMetadata(): Promise<Metadata> {
  const { siteConfig } = await getCmsData();
  return {
    title: {
      default: `${siteConfig.name} | ${siteConfig.tagline}`,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    metadataBase: new URL(siteConfig.url),
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      siteName: siteConfig.name,
      title: siteConfig.name,
      description: siteConfig.description,
    },
    twitter: {
      card: 'summary_large_image',
      title: siteConfig.name,
      description: siteConfig.description,
    },
    alternates: { canonical: siteConfig.url },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cms = await getCmsData();

  const publicCms = toPublicCms(cms);
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: cms.siteConfig.name,
    url: cms.siteConfig.url,
    description: cms.siteConfig.description,
  };

  return (
    <html lang="en-IN" suppressHydrationWarning>
      <body className={`${inter.variable} ${manrope.variable} font-sans`} suppressHydrationWarning>
        <JsonLd data={orgJsonLd} />
        <CmsProvider data={publicCms}>
          <SiteChrome>{children}</SiteChrome>
        </CmsProvider>
      </body>
    </html>
  );
}
