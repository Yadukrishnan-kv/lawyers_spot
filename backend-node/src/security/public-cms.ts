import type { CmsData } from '../types.js';

/** Strip internal data from public CMS API responses */
export function toPublicCms(data: CmsData): Omit<CmsData, 'adminUsers' | 'bookings'> {
  const { adminUsers: _a, bookings: _b, ...publicData } = data;
  return publicData;
}
