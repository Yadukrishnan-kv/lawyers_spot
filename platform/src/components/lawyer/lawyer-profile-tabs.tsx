'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Star, Landmark, ChevronDown } from 'lucide-react';
import type { Lawyer, LawyerReview } from '@/lib/data-types';
import { cn } from '@/lib/utils';

const DEFAULT_FAQ_ITEMS = [
  {
    id: 'pf1',
    question: 'How do I book a consultation?',
    answer:
      "Select an available date and time in the booking widget, then complete secure payment. You'll receive confirmation via email.",
  },
  {
    id: 'pf2',
    question: 'Is the consultation confidential?',
    answer: 'Yes. All consultations are protected by attorney-client privilege.',
  },
  {
    id: 'pf3',
    question: 'Can I get a refund?',
    answer: 'Cancellations 24 hours before the session are fully refundable.',
  },
];

type TabId = 'about' | 'experience' | 'reviews' | 'faq';

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5 text-amber-400">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn('h-3.5 w-3.5', i < Math.round(rating) ? 'fill-current' : 'text-slate-300')}
        />
      ))}
    </span>
  );
}

type Props = {
  lawyer: Lawyer;
  reviews: LawyerReview[];
};

export function LawyerProfileTabs({ lawyer, reviews }: Props) {
  const [tab, setTab] = useState<TabId>('about');
  const faqItems =
    lawyer.profileFaq && lawyer.profileFaq.length > 0
      ? lawyer.profileFaq
      : DEFAULT_FAQ_ITEMS;
  const [openFaq, setOpenFaq] = useState<string>(faqItems[0]?.id ?? '');

  const bio =
    lawyer.bio ??
    `Experienced advocate specializing in ${lawyer.specialization.join(', ')} with ${lawyer.experience} years of practice.`;
  const education = lawyer.education ?? [];
  const timeline = lawyer.timeline ?? [
    { year: '2018', title: 'Senior Advocate', org: 'Current Practice' },
    { year: '2010', title: 'Associate', org: 'Legal Firm' },
  ];
  const courts = lawyer.courts ?? [];

  const tabs: { id: TabId; label: string }[] = [
    { id: 'about', label: 'About' },
    { id: 'experience', label: 'Experience' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'faq', label: 'FAQ' },
  ];

  return (
    <>
      <ul className="profile-tabs mb-4 flex flex-wrap gap-2 border-b-2 border-slate-200" role="tablist">
        {tabs.map((t) => (
          <li key={t.id} role="presentation">
            <button
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={cn(
                'profile-tab font-accent -mb-0.5 rounded-t-lg px-5 py-3 text-sm font-semibold transition',
                tab === t.id
                  ? 'border-b-2 border-royal-600 bg-royal-600/5 text-royal-600'
                  : 'border-b-2 border-transparent text-slate-500 hover:text-royal-600'
              )}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          </li>
        ))}
      </ul>

      {tab === 'about' && (
        <div className="space-y-4">
          <div className="rounded-2xl border-0 bg-white p-6 shadow-sm dark:bg-navy-900">
            <h2 className="mb-3 text-lg font-bold text-navy-900 dark:text-white">About</h2>
            <p className="mb-0 text-slate-500 dark:text-slate-400">{bio}</p>
          </div>
          <div className="rounded-2xl border-0 bg-white p-6 shadow-sm dark:bg-navy-900">
            <h2 className="mb-3 text-lg font-bold text-navy-900 dark:text-white">Education</h2>
            {education.length > 0 ? (
              education.map((e, i) => (
                <div key={i} className="timeline-item">
                  <strong className="text-navy-900 dark:text-white">{e.degree}</strong>
                  <p className="mb-0 text-sm text-slate-500">
                    {e.institution} • {e.year}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">—</p>
            )}
          </div>
          <div className="rounded-2xl border-0 bg-white p-6 shadow-sm dark:bg-navy-900">
            <h2 className="mb-3 text-lg font-bold text-navy-900 dark:text-white">Court Practice</h2>
            <ul className="mb-0 list-none space-y-2">
              {courts.length > 0 ? (
                courts.map((c) => (
                  <li key={c} className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Landmark className="h-4 w-4 shrink-0 text-royal-600" />
                    {c}
                  </li>
                ))
              ) : (
                <li className="text-slate-500">—</li>
              )}
            </ul>
          </div>
        </div>
      )}

      {tab === 'experience' && (
        <div className="rounded-2xl border-0 bg-white p-6 shadow-sm dark:bg-navy-900">
          <h2 className="mb-3 text-lg font-bold text-navy-900 dark:text-white">Professional Timeline</h2>
          <p className="mb-3 text-sm text-slate-500">
            <span className="font-medium text-navy-900 dark:text-white">{lawyer.experience} years</span> of legal
            experience
          </p>
          {timeline.map((t, i) => (
            <div key={i} className="timeline-item">
              <strong className="text-navy-900 dark:text-white">{t.title}</strong>
              <p className="mb-0 text-sm text-slate-500">
                {t.org} • {t.year}
              </p>
            </div>
          ))}
        </div>
      )}

      {tab === 'reviews' && (
        <div className="rounded-2xl border-0 bg-white p-6 shadow-sm dark:bg-navy-900">
          <h2 className="mb-4 text-lg font-bold text-navy-900 dark:text-white">Client Reviews</h2>
          {reviews.map((review, i) => (
            <div
              key={i}
              className={cn('flex gap-3', i < reviews.length - 1 && 'mb-4 border-b border-slate-100 pb-4 dark:border-navy-700')}
            >
              <Image
                src={
                  review.avatar ??
                  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop'
                }
                alt=""
                width={48}
                height={48}
                className="h-12 w-12 shrink-0 rounded-full object-cover"
              />
              <div>
                <strong className="text-navy-900 dark:text-white">{review.author}</strong>
                <span className="ms-2 inline-flex align-middle">
                  <StarRating rating={review.rating} />
                </span>
                <p className="mb-0 mt-1 text-sm text-slate-500">&quot;{review.text}&quot;</p>
                {review.date && <p className="mt-1 text-xs text-slate-400">{review.date}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'faq' && (
        <div className="space-y-2">
          {faqItems.map((item) => {
            const isOpen = openFaq === item.id;
            return (
              <div
                key={item.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-navy-700 dark:bg-navy-900"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-4 py-3 text-left font-semibold text-navy-900 dark:text-white"
                  onClick={() => setOpenFaq(isOpen ? '' : item.id)}
                  aria-expanded={isOpen}
                >
                  {item.question}
                  <ChevronDown className={cn('h-4 w-4 transition', isOpen && 'rotate-180')} />
                </button>
                {isOpen && (
                  <div className="border-t border-slate-100 px-4 py-3 text-sm text-slate-600 dark:border-navy-700 dark:text-slate-400">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
