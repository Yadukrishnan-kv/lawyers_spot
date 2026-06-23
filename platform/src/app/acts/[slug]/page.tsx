import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { InternalLinksBlock } from '@/components/seo/internal-links';
import { Button } from '@/components/ui/button';
import { findSectionBySlug } from '@/lib/sections-data';
import { sanitizeCmsHtml } from '@/lib/security/sanitize-html';
import type { Metadata } from 'next';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const section = await findSectionBySlug(slug);
  if (!section) return { title: 'Act' };
  return { title: section.title, description: `Explanation of ${section.title} under ${section.act}.` };
}

export default async function ActSectionPage({ params }: Props) {
  const { slug } = await params;
  const section = await findSectionBySlug(slug);
  if (!section) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Acts', href: '/acts' }, { label: section.title }]} />
      <span className="text-xs font-bold text-royal-600">{section.act}</span>
      <h1 className="mt-2 font-display text-4xl font-bold">{section.title}</h1>
      <div
        className="prose-legal mt-8"
        dangerouslySetInnerHTML={{
          __html: sanitizeCmsHtml(
            section.body ?? '<p>Content for this section is managed from the LawyerSpot admin panel.</p>',
          ),
        }}
      />
      <Button className="mt-8" asChild>
        <Link href="/lawyers">Find a Lawyer</Link>
      </Button>
      <div className="mt-12">
        <InternalLinksBlock />
      </div>
    </div>
  );
}
