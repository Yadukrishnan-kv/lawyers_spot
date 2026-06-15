import type { Lawyer } from '@/lib/cms/types';

export type LawyerListFilters = {
  q: string;
  practice: string;
  citySlug: string;
  court: string;
  verified: '' | 'yes' | 'no';
  plan: string;
  topRated: '' | 'yes' | 'no';
};

export const emptyLawyerListFilters: LawyerListFilters = {
  q: '',
  practice: '',
  citySlug: '',
  court: '',
  verified: '',
  plan: '',
  topRated: '',
};

export function collectUniqueCourts(lawyers: Lawyer[]): string[] {
  const set = new Set<string>();
  for (const l of lawyers) {
    for (const c of l.courts ?? []) {
      const t = c.trim();
      if (t) set.add(t);
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

export function filterLawyers(
  lawyers: Lawyer[],
  filters: LawyerListFilters,
  cities: { slug: string; name: string }[],
): Lawyer[] {
  const q = filters.q.trim().toLowerCase();

  return lawyers.filter((l) => {
    if (filters.practice && l.practice !== filters.practice) return false;

    if (filters.citySlug) {
      const city = cities.find((c) => c.slug === filters.citySlug);
      const bySlug = l.citySlug === filters.citySlug;
      const byLocation =
        city && l.location.toLowerCase().includes(city.name.toLowerCase());
      if (!bySlug && !byLocation) return false;
    }

    if (filters.court) {
      const needle = filters.court.toLowerCase();
      const courts = l.courts ?? [];
      if (!courts.some((c) => c.toLowerCase().includes(needle))) return false;
    }

    if (filters.verified === 'yes' && !l.verified) return false;
    if (filters.verified === 'no' && l.verified) return false;

    if (filters.plan && (l.subscriptionPlanId ?? 'basic') !== filters.plan) return false;
    if (filters.topRated === 'yes' && !l.topRated) return false;
    if (filters.topRated === 'no' && l.topRated) return false;

    if (!q) return true;

    const hay = [
      l.name,
      l.slug,
      l.location,
      l.address,
      l.phone,
      l.firm,
      l.practice,
      ...(l.specialization ?? []),
      ...(l.courts ?? []),
      ...(l.languages ?? []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return hay.includes(q);
  });
}

export type LawyerExportRow = {
  name: string;
  location: string;
  city: string;
  practice: string;
  courts: string;
  email: string;
  emailVerified: string;
  phone: string;
  phoneVerified: string;
  firm: string;
  rating: string;
  reviews: string;
  experience: string;
  fee: string;
  verified: string;
  online: string;
  plan: string;
  topRated: string;
  slug: string;
};

export function lawyersToExportRows(
  lawyers: Lawyer[],
  practiceLabel: (slug: string) => string,
  cityLabel: (slug?: string, location?: string) => string,
  planLabel: (id?: string) => string = (id) => id ?? 'basic',
): LawyerExportRow[] {
  return lawyers.map((l) => ({
    name: l.name,
    location: l.location,
    city: cityLabel(l.citySlug, l.location),
    practice: practiceLabel(l.practice),
    courts: (l.courts ?? []).join('; '),
    email: l.email ?? '',
    emailVerified: l.emailVerified ? 'Yes' : 'No',
    phone: l.phone ?? '',
    phoneVerified: l.phoneVerified ? 'Yes' : 'No',
    firm: l.firm ?? '',
    rating: String(l.rating),
    reviews: String(l.reviews),
    experience: String(l.experience),
    fee: l.fee != null ? String(l.fee) : '',
    verified: l.verified ? 'Yes' : 'No',
    online: l.online ? 'Yes' : 'No',
    plan: planLabel(l.subscriptionPlanId),
    topRated: l.topRated ? 'Yes' : 'No',
    slug: l.slug ?? l.id,
  }));
}

const EXPORT_HEADERS: (keyof LawyerExportRow)[] = [
  'name',
  'location',
  'city',
  'practice',
  'courts',
  'email',
  'emailVerified',
  'phone',
  'phoneVerified',
  'firm',
  'rating',
  'reviews',
  'experience',
  'fee',
  'verified',
  'online',
  'plan',
  'topRated',
  'slug',
];

const HEADER_LABELS: Record<keyof LawyerExportRow, string> = {
  name: 'Name',
  location: 'Location',
  city: 'City',
  practice: 'Practice Area',
  courts: 'Courts',
  email: 'Email',
  emailVerified: 'Email Verified',
  phone: 'Phone',
  phoneVerified: 'Phone Verified',
  firm: 'Firm',
  rating: 'Rating',
  reviews: 'Reviews',
  experience: 'Experience (years)',
  fee: 'Fee',
  verified: 'Verified',
  online: 'Online',
  plan: 'Subscription Plan',
  topRated: 'Top Rated',
  slug: 'Profile Slug',
};

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function downloadLawyersExcel(rows: LawyerExportRow[], filenameStem = 'lawyers') {
  const headerLine = EXPORT_HEADERS.map((k) => escapeCsvCell(HEADER_LABELS[k])).join(',');
  const body = rows
    .map((row) => EXPORT_HEADERS.map((k) => escapeCsvCell(row[k])).join(','))
    .join('\n');
  const csv = `\uFEFF${headerLine}\n${body}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filenameStem}-${dateStamp()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadLawyersPdf(rows: LawyerExportRow[], title = 'Lawyers List') {
  const headers = EXPORT_HEADERS.map((k) => HEADER_LABELS[k]);
  const tableHead = headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('');
  const tableBody = rows
    .map(
      (row) =>
        `<tr>${EXPORT_HEADERS.map((k) => `<td>${escapeHtml(row[k])}</td>`).join('')}</tr>`,
    )
    .join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 24px; color: #111; }
    h1 { font-size: 18px; margin: 0 0 8px; }
    p.meta { color: #555; font-size: 12px; margin: 0 0 16px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; vertical-align: top; }
    th { background: #f0f4f8; }
    tr:nth-child(even) td { background: #fafafa; }
    @media print { body { margin: 12px; } }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p class="meta">Exported ${rows.length} lawyer(s) · ${new Date().toLocaleString()}</p>
  <table>
    <thead><tr>${tableHead}</tr></thead>
    <tbody>${tableBody || '<tr><td colspan="' + headers.length + '">No rows</td></tr>'}</tbody>
  </table>
  <script>window.onload = function() { window.print(); };</script>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (!win) {
    alert('Allow pop-ups to export PDF, or use Excel export.');
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function dateStamp(): string {
  return new Date().toISOString().slice(0, 10);
}
