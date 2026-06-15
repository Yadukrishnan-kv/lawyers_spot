import type { CmsPageFields, LegalSection, SiteContent } from '@/lib/cms/types';

export type LegalListingPage = {
  title: string;
  subtitle: string;
  footerNote: string;
  metaTitle: string;
  metaDescription: string;
};

export type AboutPageContent = {
  title: string;
  body: string;
  metaTitle: string;
  metaDescription: string;
};

export const DEFAULT_IPC_PAGE: LegalListingPage = {
  title: 'IPC Sections',
  subtitle:
    'Indian Penal Code — section-wise legal information (legacy code; BNS now applicable for new cases)',
  footerNote:
    'Also see <a href="/bns" class="text-royal-600 font-semibold">BNS Sections</a> (Bharatiya Nyaya Sanhita, 2023)',
  metaTitle: 'IPC Sections — Indian Penal Code',
  metaDescription:
    'Browse Indian Penal Code (IPC) sections with plain-English explanations. IPC 498A, 420, 302 and more.',
};

export const DEFAULT_BNS_PAGE: LegalListingPage = {
  title: 'BNS Sections',
  subtitle: 'Bharatiya Nyaya Sanhita, 2023 — replaces IPC for new criminal matters',
  footerNote:
    'Legacy code: <a href="/ipc" class="text-royal-600 font-semibold">IPC Sections</a>',
  metaTitle: 'BNS Sections — Bharatiya Nyaya Sanhita',
  metaDescription:
    'Browse BNS 2023 sections — the new criminal code replacing IPC for offences committed after July 2024.',
};

export const DEFAULT_ABOUT_PAGE: AboutPageContent = {
  title: 'About LawyerSpot',
  body: '<p>LawyerSpot connects clients with verified advocates across India. All statistics and content are managed dynamically from our admin CMS.</p>',
  metaTitle: 'About LawyerSpot',
  metaDescription:
    "India's legal intelligence platform — connecting citizens with verified lawyers and free legal knowledge.",
};

export const DEFAULT_TERMS_PAGE: CmsPageFields = {
  title: 'Terms of Use',
  lastUpdated: 'June 2026',
  metaTitle: 'Terms of Use',
  metaDescription:
    'LawyerSpot terms of use — rules for clients, lawyers, and visitors using our legal marketplace.',
  body: `<section><h2>1. Acceptance</h2><p>By accessing LawyerSpot ("the Platform"), you agree to these Terms of Use. If you do not agree, please do not use the website or related services.</p></section>
<section><h2>2. Nature of service</h2><p>LawyerSpot is an online directory and information platform that helps users discover advocates and legal content. We do not provide legal advice. Content on the Platform is for general information only and does not create an attorney–client relationship.</p></section>
<section><h2>3. User accounts</h2><p>You are responsible for keeping your login credentials secure and for activity under your account. Lawyers must provide accurate profile, contact, and bar enrollment information. We may suspend accounts that violate these terms or applicable law.</p></section>
<section><h2>4. Lawyer listings &amp; subscriptions</h2><p>Lawyer profiles, visibility features, and subscription plans are described at signup and in the admin panel. Fees, plan features, and entitlements may change with notice. Misrepresentation of qualifications or verification status is prohibited.</p></section>
<section><h2>5. Bookings &amp; communications</h2><p>Consultation requests and messages facilitated through the Platform are between you and the participating lawyer. LawyerSpot is not a party to those engagements and is not liable for outcomes of legal representation.</p></section>
<section><h2>6. Acceptable use</h2><p>You may not scrape, spam, harass users, upload unlawful content, or attempt to disrupt Platform security. Automated access without permission is prohibited.</p></section>
<section><h2>7. Intellectual property</h2><p>LawyerSpot branding, layout, and original content are protected. User-submitted content remains yours, but you grant us a licence to display it on the Platform for operational purposes.</p></section>
<section><h2>8. Disclaimer &amp; liability</h2><p>The Platform is provided "as is" without warranties. To the extent permitted by law, LawyerSpot is not liable for indirect or consequential damages arising from use of the site or reliance on its content.</p></section>
<section><h2>9. Governing law</h2><p>These terms are governed by the laws of India. Courts in India shall have exclusive jurisdiction, subject to mandatory consumer protections where applicable.</p></section>
<section><h2>10. Contact</h2><p>Questions about these terms may be sent through the contact options on the <a href="/about">About</a> page.</p></section>`,
};

export const DEFAULT_PRIVACY_PAGE: CmsPageFields = {
  title: 'Privacy Policy',
  lastUpdated: 'June 2026',
  metaTitle: 'Privacy Policy',
  metaDescription: 'How LawyerSpot collects, uses, and protects your personal information.',
  body: `<section><h2>1. Overview</h2><p>LawyerSpot respects your privacy. This policy explains what information we collect when you use our website, how we use it, and the choices available to you.</p></section>
<section><h2>2. Information we collect</h2><ul><li><strong>Account data:</strong> name, email, phone, role, and profile details you provide at signup.</li><li><strong>Usage data:</strong> pages visited, search queries, device/browser type, and approximate location derived from IP.</li><li><strong>Communications:</strong> consultation requests, Q&amp;A submissions, and support messages.</li><li><strong>Payment-related data:</strong> processed by third-party gateways; we do not store full card numbers.</li></ul></section>
<section><h2>3. How we use information</h2><p>We use personal data to operate the Platform, display lawyer profiles, authenticate accounts, send notifications, improve features, and comply with legal obligations.</p></section>
<section><h2>4. Sharing</h2><p>We do not sell your personal information. We may share data with lawyers you contact, infrastructure providers, and authorities when required by law.</p></section>
<section><h2>5. Cookies</h2><p>We use cookies for sessions, preferences, and analytics. You can control cookies through your browser settings.</p></section>
<section><h2>6. Data retention &amp; security</h2><p>We retain information while your account is active and as needed for legal or operational purposes. Reasonable measures protect data, but no online service is completely secure.</p></section>
<section><h2>7. Your rights</h2><p>Depending on applicable law, you may request access, correction, or deletion of your personal data.</p></section>
<section><h2>8. Children</h2><p>LawyerSpot is not directed at children under 18. We do not knowingly collect personal data from minors.</p></section>
<section><h2>9. Changes</h2><p>We may update this policy from time to time. Material changes will be reflected on this page with an updated date.</p></section>
<section><h2>10. Contact</h2><p>Privacy questions: visit our <a href="/about">About</a> page or review our <a href="/terms">Terms of Use</a>.</p></section>`,
};

function resolveCmsPage(
  page: CmsPageFields | undefined,
  defaults: CmsPageFields,
): CmsPageFields {
  return {
    title: page?.title || defaults.title,
    body: page?.body || defaults.body,
    metaTitle: page?.metaTitle ?? page?.title ?? defaults.metaTitle,
    metaDescription: page?.metaDescription ?? defaults.metaDescription,
    lastUpdated: page?.lastUpdated ?? defaults.lastUpdated,
  };
}

export function resolveIpcPage(sc: SiteContent): LegalListingPage {
  return { ...DEFAULT_IPC_PAGE, ...sc.ipcPage };
}

export function resolveBnsPage(sc: SiteContent): LegalListingPage {
  return { ...DEFAULT_BNS_PAGE, ...sc.bnsPage };
}

export function resolveAboutPage(sc: SiteContent): AboutPageContent {
  const about = sc.about;
  return {
    title: about.title || DEFAULT_ABOUT_PAGE.title,
    body: about.body || DEFAULT_ABOUT_PAGE.body,
    metaTitle: about.metaTitle ?? about.title ?? DEFAULT_ABOUT_PAGE.metaTitle,
    metaDescription: about.metaDescription ?? DEFAULT_ABOUT_PAGE.metaDescription,
  };
}

export function resolveTermsPage(sc: SiteContent): CmsPageFields {
  return resolveCmsPage(sc.termsPage, DEFAULT_TERMS_PAGE);
}

export function resolvePrivacyPage(sc: SiteContent): CmsPageFields {
  return resolveCmsPage(sc.privacyPage, DEFAULT_PRIVACY_PAGE);
}

export function slugifyLegalSection(title: string, prefix: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return base.startsWith(prefix) ? base : `${prefix}-${base}`.slice(0, 80);
}

export function newLegalSection(prefix: 'ipc' | 'bns'): LegalSection {
  const id = Date.now();
  return {
    slug: `${prefix}-section-${id}`,
    title: prefix === 'ipc' ? 'IPC Section' : 'BNS Section',
    code: '',
    body: '<p>Enter section explanation here.</p>',
  };
}
