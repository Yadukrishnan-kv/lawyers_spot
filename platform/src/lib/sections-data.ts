import 'server-only';
import { getBackendUrl } from '@/lib/cms/backend-url';
import type { LegalSection } from '@/lib/cms/types';

export type SectionRecord = {
  id: number;
  type: 'ipc' | 'bns';
  sectionNumber: string;
  title: string;
  slug: string;
  body: string;
  punishment: string;
  category: string;
  status: string;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
};

function toLegalSection(s: SectionRecord): LegalSection {
  return {
    slug: s.slug,
    title: s.title,
    code: s.sectionNumber,
    body: s.body,
  };
}

export async function getSections(type: 'ipc' | 'bns'): Promise<SectionRecord[]> {
  try {
    const res = await fetch(`${getBackendUrl()}/api/v1/sections?type=${type}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = (await res.json()) as SectionRecord[];
      return data;
    }
  } catch {
    /* fallback */
  }
  return [];
}

export async function getSectionBySlug(slug: string): Promise<SectionRecord | null> {
  try {
    const res = await fetch(`${getBackendUrl()}/api/v1/sections/${slug}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      return (await res.json()) as SectionRecord;
    }
  } catch {
    /* fallback */
  }
  return null;
}

export async function getSiteSections(type: 'ipc' | 'bns'): Promise<LegalSection[]> {
  const dbSections = await getSections(type);
  return dbSections.map(toLegalSection);
}

export async function findSectionBySlug(slug: string): Promise<{
  title: string;
  act: string;
  body?: string;
} | null> {
  const db = await getSectionBySlug(slug);
  if (!db) return null;
  const actName = db.type === 'ipc' ? 'Indian Penal Code' : 'Bharatiya Nyaya Sanhita (BNS)';
  return { title: db.title, act: actName, body: db.body };
}
