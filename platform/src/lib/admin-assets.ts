/** Static assets copied from midas/admin-HTML (Sash Bootstrap 5 admin template). */
export const ADMIN_ASSETS = '/admin-assets';

export function adminAsset(path: string) {
  return `${ADMIN_ASSETS}/${path.replace(/^\//, '')}`;
}
