import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Lawyer } from '@/lib/data-types';
import { lawyerProfilePath } from '@/lib/lawyer-slug';
import { SaveLawyerButton } from '@/components/lawyer/save-lawyer-button';

export function LawyerCard({ lawyer }: { lawyer: Lawyer }) {
  const profileHref = lawyerProfilePath(lawyer);
  return (
    <Card className="group overflow-hidden transition hover:-translate-y-1 hover:shadow-premium">
      <div className="relative h-48 overflow-hidden">
        <Image
          src={lawyer.image}
          alt={lawyer.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width:768px) 100vw, 33vw"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1">
          {lawyer.topRated && (
            <Badge variant="gold">Top Rated</Badge>
          )}
          {lawyer.online && (
            <Badge variant="success">
              <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" /> Online
            </Badge>
          )}
        </div>
        <div className="absolute right-2 top-2">
          <SaveLawyerButton lawyerId={lawyer.id} />
        </div>
      </div>
      <CardContent className="flex flex-col gap-3">
        <div>
          <Link href={profileHref} className="font-display text-lg font-bold text-navy-900 hover:text-royal-600 dark:text-white">
            {lawyer.name}
          </Link>
          {lawyer.verified && <Badge variant="success" className="ml-2">Verified</Badge>}
          {lawyer.topRated && (
            <Badge variant="gold" className="ml-2">Top Rated</Badge>
          )}
        </div>
        <div className="flex items-center gap-1 text-sm font-semibold text-amber-500">
          <Star className="h-4 w-4 fill-current" />
          {lawyer.rating} <span className="font-normal text-slate-500">({lawyer.reviews} reviews)</span>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {lawyer.experience} yrs</span>
          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {lawyer.location}</span>
        </div>
        <p className="text-xs text-slate-500">{lawyer.specialization.join(' • ')}</p>
        <div className="mt-auto flex items-center justify-end border-t border-slate-100 pt-3 dark:border-navy-700">
          <Button size="sm" asChild>
            <Link href={profileHref}>View Profile</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
