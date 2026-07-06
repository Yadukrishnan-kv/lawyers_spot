/** Strip internal data from public CMS API responses */
export function toPublicCms(data) {
    const { adminUsers: _a, bookings: _b, ...publicData } = data;
    return publicData;
}
