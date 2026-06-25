import Image from 'next/image';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { Star, MapPin, CheckCircle2 } from 'lucide-react';
import { LawyerCard } from '@/components/lawyer/lawyer-card';
import { LawyerProfileTabs } from '@/components/lawyer/lawyer-profile-tabs';
import { LawyerBookingWidget } from '@/components/lawyer/lawyer-booking-widget';
import { ViewContactNumber } from '@/components/lawyer/view-contact';
import { SaveLawyerButton } from '@/components/lawyer/save-lawyer-button';
import { getLawyerBySlug, getLawyers, getDefaultProfileReviews } from '@/lib/data';
import { getLawyerSlug, lawyerProfilePath } from '@/lib/lawyer-slug';
import { getBookingFeeLabel, cn } from '@/lib/utils';
import type { Metadata } from 'next';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const lawyers = await getLawyers();
  return lawyers.map((l) => ({ slug: getLawyerSlug(l) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const lawyer = await getLawyerBySlug(slug);
  if (!lawyer) return { title: 'Lawyer Not Found', robots: { index: false } };
  const canonical = lawyerProfilePath(lawyer);
  const desc = `${lawyer.name} — ${lawyer.practice} lawyer in ${lawyer.location}. ${lawyer.experience}+ years, ${lawyer.rating}★ rating. Book consultation online.`;
  return {
    title: `${lawyer.name} — ${lawyer.practice} Lawyer in ${lawyer.location}`,
    description: desc,
    openGraph: { title: lawyer.name, description: desc, type: 'profile', url: canonical },
    alternates: { canonical },
  };
}

export default async function LawyerProfilePage({ params }: Props) {
  const { slug: param } = await params;
  const lawyer = await getLawyerBySlug(param);
  if (!lawyer) notFound();

  const canonicalSlug = getLawyerSlug(lawyer);
  if (param !== canonicalSlug) {
    permanentRedirect(lawyerProfilePath(lawyer));
  }

  const related = (await getLawyers())
    .filter((l) => l.id !== lawyer.id && l.practice === lawyer.practice)
    .slice(0, 3);
  const locationLine = lawyer.address ?? lawyer.location;
  const bookingFee = getBookingFeeLabel(lawyer);
  const reviews =
    lawyer.clientReviews && lawyer.clientReviews.length > 0
      ? lawyer.clientReviews
      : await getDefaultProfileReviews();

  return (
    <>
      <header className="profile-header">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="breadcrumb">
            <ol className="mb-4 flex flex-wrap items-center gap-2 text-sm">
              <li>
                <Link href="/" className="text-white/50 hover:text-white">
                  Home
                </Link>
              </li>
              <li className="text-white/40">/</li>
              <li>
                <Link href="/lawyers" className="text-white/50 hover:text-white">
                  Lawyers
                </Link>
              </li>
              <li className="text-white/40">/</li>
              <li className="text-white" aria-current="page">
                {lawyer.name}
              </li>
            </ol>
          </nav>

          <div className="flex flex-col items-end gap-6 md:flex-row md:flex-wrap">
            <div className="flex w-full flex-1 flex-col gap-4 sm:flex-row sm:flex-nowrap md:max-w-[66%]">
              <Image
                src={lawyer.image}
                alt={lawyer.name}
                width={160}
                height={160}
                className="profile-avatar"
                priority
              />
              <div>
                <div className="mb-2 flex flex-wrap gap-2">
                  {lawyer.verified && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-xs font-semibold text-white">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Verified Lawyer
                    </span>
                  )}
                  {lawyer.topRated && (
                    <span className="inline-flex items-center rounded-md bg-amber-500 px-2 py-1 text-xs font-semibold text-navy-900">
                      Top Rated Lawyer
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <h1 className="mb-2 text-2xl font-bold text-white md:text-3xl">{lawyer.name}</h1>
                  <SaveLawyerButton lawyerId={lawyer.id} className="mb-2" />
                </div>
                <p className="mb-2 text-white/50">
                  <MapPin className="me-1 inline h-4 w-4" />
                  {locationLine}
                </p>
                <div className="text-warning flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn('h-4 w-4', i < Math.round(lawyer.rating) ? 'fill-current' : 'text-white/30')}
                    />
                  ))}
                  <span className="ms-1">
                    {lawyer.rating} ({lawyer.reviews} reviews)
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {lawyer.specialization.map((s) => (
                    <span
                      key={s}
                      className="mb-1 me-1 rounded-md bg-royal-600/20 px-2 py-0.5 text-xs font-medium text-royal-200"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="w-full md:max-w-[33%] md:shrink-0">
              {lawyer.phone ? (
                <ViewContactNumber phone={lawyer.phone} />
              ) : (
                <div className="rounded-md bg-royal-600 px-4 py-3 text-center text-sm font-bold uppercase tracking-wide text-white">
                  View contact on booking
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="py-10 pt-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <LawyerProfileTabs lawyer={lawyer} reviews={reviews} />
            </div>
            <div className="lg:col-span-4">
              <LawyerBookingWidget
                feeLabel={bookingFee}
                lawyerId={lawyer.id}
                lawyerName={lawyer.name}
                profilePath={lawyerProfilePath(lawyer)}
              />
            </div>
          </div>

          <section className="mt-12 border-t border-slate-200 pt-12 dark:border-navy-800">
            <h2 className="mb-4 font-display text-xl font-bold text-navy-900 dark:text-white">Similar Lawyers</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((l) => (
                <LawyerCard key={l.id} lawyer={l} />
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
