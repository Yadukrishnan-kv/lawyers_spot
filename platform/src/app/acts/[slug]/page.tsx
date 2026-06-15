import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { InternalLinksBlock } from '@/components/seo/internal-links';
import { Button } from '@/components/ui/button';
import { getSiteContent } from '@/lib/data';
import { sanitizeCmsHtml } from '@/lib/security/sanitize-html';
import type { Metadata } from 'next';

type Props = { params: Promise<{ slug: string }> };

async function findSection(slug: string) {
  const sc = await getSiteContent();
  const act = sc.acts.find((a) => a.slug === slug);
  if (act) return { title: act.title, act: act.act, body: act.body };
  const ipc = sc.ipcSections.find((s) => s.slug === slug);
  if (ipc) return { title: ipc.title, act: 'Indian Penal Code', body: ipc.body };
  const bns = sc.bnsSections.find((s) => s.slug === slug);
  if (bns) return { title: bns.title, act: 'Bharatiya Nyaya Sanhita (BNS)', body: bns.body };
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const section = await findSection(slug);
  if (!section) return { title: 'Act' };
  return { title: section.title, description: `Explanation of ${section.title} under ${section.act}.` };
}

export default async function ActSectionPage({ params }: Props) {
  const { slug } = await params;
  const section = await findSection(slug);
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
