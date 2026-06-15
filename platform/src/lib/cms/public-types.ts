import type { CmsData } from './types';

/** CMS data safe to expose to the browser on public pages */
export type PublicCmsData = Omit<CmsData, 'adminUsers' | 'bookings'>;

export function toPublicCms(data: CmsData): PublicCmsData {
  const { adminUsers: _a, bookings: _b, ...publicData } = data;
  return publicData;
}
