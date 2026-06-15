import type { Lawyer } from '@/lib/data-types';
import type { CourtEntry } from '@/lib/cms/types';

/** Lawyers who list this court or practice in the court's city (when no courts listed). */
export function filterLawyersByCourt(lawyers: Lawyer[], court: CourtEntry): Lawyer[] {
  const courtName = court.name.toLowerCase();

  return lawyers.filter((lawyer) => {
    const listed = lawyer.courts ?? [];
    if (listed.length > 0) {
      return listed.some(
        (c) =>
          c.toLowerCase() === courtName ||
          c.toLowerCase().includes(courtName) ||
          courtName.includes(c.toLowerCase()),
      );
    }

    const city = court.city.trim().toLowerCase();
    if (!city || city === 'pan india') return false;
    return lawyer.location.toLowerCase().includes(city);
  });
}
