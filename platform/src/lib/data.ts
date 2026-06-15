import 'server-only';
import { getCmsData } from './cms/store';
import { getLawyerSlug, normalizeLawyerSlugs } from './lawyer-slug';
import type { Lawyer, LawyerReview } from './data-types';

export type {
  Lawyer,
  LawyerReview,
  LawyerEducation,
  LawyerTimeline,
  LawyerPracticeGroup,
} from './data-types';

export async function getSiteConfig() {
  return (await getCmsData()).siteConfig;
}

export async function getStats() {
  return (await getCmsData()).stats;
}

export async function getPracticeAreas() {
  return (await getCmsData()).practiceAreas;
}

export async function getStates() {
  return (await getCmsData()).states.filter((s) => s.active);
}

export async function getAllStates() {
  return (await getCmsData()).states;
}

export async function getStateBySlug(slug: string) {
  return (await getCmsData()).states.find((s) => s.slug === slug);
}

export async function getCities() {
  return (await getCmsData()).cities;
}

export async function getLawyers() {
  return normalizeLawyerSlugs((await getCmsData()).lawyers);
}

export async function getSubscriptionPlans() {
  const plans = (await getCmsData()).subscriptionPlans;
  return plans.length > 0 ? plans : [];
}

export async function getTopRatedLawyers(limit = 4) {
  const lawyers = await getLawyers();
  const top = lawyers.filter((l) => l.topRated);
  const pool = top.length > 0 ? top : [...lawyers].sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
  return pool.slice(0, limit);
}

export async function getQaPosts() {
  return (await getCmsData()).qaPosts;
}

export async function getArticles() {
  return (await getCmsData()).articles.filter((a) => a.status !== 'draft');
}

export async function getTrendingTopics() {
  return (await getCmsData()).trendingTopics;
}

export async function getDefaultProfileReviews(): Promise<LawyerReview[]> {
  return (await getCmsData()).defaultProfileReviews;
}

export async function getLawyerBySlug(slug: string) {
  const lawyers = await getLawyers();
  return lawyers.find(
    (l) => l.slug === slug || l.id === slug || getLawyerSlug(l) === slug,
  );
}

/** @deprecated Use getLawyerBySlug */
export async function getLawyerById(id: string) {
  return getLawyerBySlug(id);
}

export { getLawyerSlug, lawyerProfilePath, normalizeLawyerSlugs } from './lawyer-slug';

export async function getPracticeBySlug(slug: string) {
  const { resolvePracticeFromParam } = await import('./practice-utils');
  return resolvePracticeFromParam(slug, (await getCmsData()).practiceAreas);
}

export async function getCityBySlug(slug: string) {
  return (await getCmsData()).cities.find((c) => c.slug === slug);
}

export async function getArticleBySlug(slug: string) {
  const article = (await getCmsData()).articles.find((a) => a.slug === slug);
  if (!article || article.status === 'draft') return undefined;
  return article;
}

export async function getSiteContent() {
  return (await getCmsData()).siteContent;
}

export async function getQaBySlug(slug: string) {
  return (await getCmsData()).qaPosts.find((q) => q.slug === slug);
}

export async function searchCms(query: string) {
  const { searchSite } = await import('./search');
  return searchSite(await getCmsData(), query);
}
