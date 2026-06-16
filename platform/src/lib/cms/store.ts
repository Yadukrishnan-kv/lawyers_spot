import 'server-only';
import fs from 'fs';
import path from 'path';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { cookies } from 'next/headers';
import { getBackendUrl } from '@/lib/cms/backend-url';
import type { CmsData, Lawyer } from './types';
import { buildDefaultCms } from './seed';
import { mergeSiteContent } from '@/lib/cms/merge-site-content';
import { normalizeLawyerSlugs } from '@/lib/lawyer-slug';
import { DEFAULT_SUBSCRIPTION_PLANS } from '@/lib/subscription';

const DATA_DIR = path.join(process.cwd(), 'data');
const CMS_FILE = path.join(DATA_DIR, 'cms.json');
const LAWYERS_SAMPLE_FILE = path.join(DATA_DIR, 'lawyers-sample.json');
const CMS_REVALIDATE = 60;

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadLawyersFromSource(raw: Partial<CmsData>, defaults: CmsData): Lawyer[] {
  if (Array.isArray(raw.lawyers) && raw.lawyers.length > 0) {
    return normalizeLawyerSlugs(raw.lawyers);
  }
  if (fs.existsSync(LAWYERS_SAMPLE_FILE)) {
    const sample = JSON.parse(fs.readFileSync(LAWYERS_SAMPLE_FILE, 'utf-8')) as Lawyer[];
    if (Array.isArray(sample) && sample.length > 0) {
      return normalizeLawyerSlugs(sample);
    }
  }
  return defaults.lawyers;
}

function mergeCmsWithDefaults(raw: Partial<CmsData>, includeInternal = false): CmsData {
  const defaults = buildDefaultCms();
  return {
    ...defaults,
    ...raw,
    siteContent: mergeSiteContent(raw.siteContent ?? defaults.siteContent),
    states: Array.isArray(raw.states) && raw.states.length > 0 ? raw.states : defaults.states,
    adminUsers: includeInternal ? (raw.adminUsers ?? defaults.adminUsers) : [],
    bookings: includeInternal ? (raw.bookings ?? defaults.bookings) : [],
    subscriptionPlans:
      Array.isArray(raw.subscriptionPlans) && raw.subscriptionPlans.length > 0
        ? raw.subscriptionPlans
        : DEFAULT_SUBSCRIPTION_PLANS,
    lawyers: loadLawyersFromSource(raw, defaults),
  };
}

function readCmsFromFile(): CmsData {
  ensureDir();
  if (!fs.existsSync(CMS_FILE)) {
    const data = buildDefaultCms();
    fs.writeFileSync(CMS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return data;
  }
  const raw = fs.readFileSync(CMS_FILE, 'utf-8');
  return mergeCmsWithDefaults(JSON.parse(raw) as Partial<CmsData>, true);
}

const fetchPublicCmsCached = unstable_cache(
  async (): Promise<CmsData> => {
    const url = `${getBackendUrl()}/api/v1/cms`;
    try {
      const res = await fetch(url, { next: { revalidate: CMS_REVALIDATE } });
      if (!res.ok) return readCmsFromFile();
      const data = (await res.json()) as Partial<CmsData>;
      return mergeCmsWithDefaults(data, false);
    } catch {
      return mergeCmsWithDefaults(readCmsFromFile(), false);
    }
  },
  ['public-cms'],
  { revalidate: CMS_REVALIDATE, tags: ['cms'] },
);

export const getCmsData = cache(async (): Promise<CmsData> => fetchPublicCmsCached());

/** Full CMS for admin pages (includes bookings, admin users) */
export const getAdminCmsData = cache(async (): Promise<CmsData> => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');

  try {
    const res = await fetch(`${getBackendUrl()}/api/v1/admin/cms`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = (await res.json()) as Partial<CmsData>;
      return mergeCmsWithDefaults(data, true);
    }
  } catch {
    /* fallback */
  }
  return readCmsFromFile();
});

export function saveCmsData(data: CmsData): CmsData {
  ensureDir();
  const next = { ...data, updatedAt: new Date().toISOString() };
  fs.writeFileSync(CMS_FILE, JSON.stringify(next, null, 2), 'utf-8');
  return next;
}

export async function updateCmsSection<K extends keyof CmsData>(
  key: K,
  value: CmsData[K],
): Promise<CmsData> {
  const current = await getAdminCmsData();
  return saveCmsData({ ...current, [key]: value });
}
