'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin, Briefcase, Heart, ExternalLink } from 'lucide-react';
import { fetchSavedLawyers, removeSavedLawyer } from '@/lib/user-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { lawyerProfilePath } from '@/lib/lawyer-slug';

type SavedLawyer = {
  id: string;
  slug?: string;
  name: string;
  image: string;
  rating: number;
  reviews: number;
  experience: number;
  fee?: number;
  currency?: string;
  location: string;
  practice: string;
  specialization: string[];
  online: boolean;
  verified: boolean;
  savedAt: string;
};

export default function SavedLawyersPage() {
  const [saved, setSaved] = useState<SavedLawyer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedLawyers()
      .then((data) => setSaved(data.savedLawyers))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleRemove(lawyerId: string) {
    try {
      await removeSavedLawyer(lawyerId);
      setSaved((prev) => prev.filter((l) => l.id !== lawyerId));
    } catch {}
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-royal-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300">
            <Heart className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-navy-900 dark:text-white">Saved Lawyers</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Your favourite legal professionals</p>
          </div>
        </div>
      </div>
      {saved.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/30">
              <Heart className="h-6 w-6 text-rose-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-navy-900 dark:text-white">No saved lawyers yet</p>
              <p className="mt-1 text-xs text-slate-500">Save lawyers you're interested in for quick access.</p>
            </div>
            <Button asChild>
              <Link href="/lawyers">Browse Lawyers</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((lawyer) => {
            const profileHref = lawyerProfilePath(lawyer);
            return (
              <Card key={lawyer.id} className="group overflow-hidden transition hover:-translate-y-1 hover:shadow-premium">
                <div className="relative h-40 overflow-hidden">
                  <Image
                    src={lawyer.image}
                    alt={lawyer.name}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width:768px) 100vw, 33vw"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemove(lawyer.id)}
                    className="absolute right-2 top-2 rounded-full bg-white/80 p-2 text-red-500 backdrop-blur-sm hover:bg-white"
                    aria-label="Remove from saved"
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </button>
                  <div className="absolute left-2 top-2 flex flex-col gap-1">
                    {lawyer.verified && <Badge variant="success">Verified</Badge>}
                  </div>
                </div>
                <CardContent className="flex flex-col gap-2 p-4">
                  <Link
                    href={profileHref}
                    className="font-display text-base font-bold text-navy-900 hover:text-royal-600 dark:text-white"
                  >
                    {lawyer.name}
                  </Link>
                  <div className="flex items-center gap-1 text-sm font-semibold text-amber-500">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    {lawyer.rating}{' '}
                    <span className="font-normal text-slate-500">({lawyer.reviews} reviews)</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" /> {lawyer.experience} yrs
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {lawyer.location}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{lawyer.specialization.join(' • ')}</p>
                  <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 dark:border-navy-700">
                    <Button size="sm" variant="secondary" asChild>
                      <Link href={profileHref}>
                        <ExternalLink className="mr-1 h-3 w-3" /> View Profile
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
