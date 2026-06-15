/**
 * SEO navigation graph — scalable link structure for millions of landing pages.
 * Pattern: /city/[city]/[practice], /court/[court], /practice/[practice], /guides/[slug]
 */

/** Top utility bar — mirrors LawRato secondary nav */
export const utilityNav = [
  { label: 'Indian Kanoon', href: '/indian-kanoon' },
  { label: 'Indian Penal Code', href: '/ipc' },
  { label: 'Ask A Free Question', href: '/qa/ask' },
  { label: 'Talk To A Lawyer', href: '/lawyers' },
  { label: 'Free Legal Advice', href: '/qa' },
  { label: 'Lawyer Signup', href: '/lawyer-signup' },
];

/** Main nav — mirrors LawRato primary labels */
export const mainNav = [
  { label: 'Find A Lawyer', href: '/lawyers', mega: 'lawyers' as const },
  { label: 'Legal Advice', href: '/qa', mega: 'advice' as const },
  { label: 'IPC Sections', href: '/ipc' },
  { label: 'BNS Sections', href: '/bns' },
  { label: 'About', href: '/about' },
  { label: 'My Account', href: '/dashboard' },
];

export const languages = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
];

export const ipcSections = [
  { slug: 'ipc-section-498a', title: 'IPC Section 498A', code: '498A' },
  { slug: 'ipc-section-420', title: 'IPC Section 420', code: '420' },
  { slug: 'ipc-section-302', title: 'IPC Section 302', code: '302' },
  { slug: 'ipc-section-376', title: 'IPC Section 376', code: '376' },
  { slug: 'ipc-section-406', title: 'IPC Section 406', code: '406' },
  { slug: 'ipc-section-354', title: 'IPC Section 354', code: '354' },
];

export const bnsSections = [
  { slug: 'bns-section-103', title: 'BNS Section 103 (Murder)', code: '103' },
  { slug: 'bns-section-64', title: 'BNS Section 64 (Rape)', code: '64' },
  { slug: 'bns-section-318', title: 'BNS Section 318 (Cheating)', code: '318' },
  { slug: 'bns-section-85', title: 'BNS Section 85', code: '85' },
  { slug: 'bns-section-115', title: 'BNS Section 115', code: '115' },
];

export const courts = [
  { slug: 'supreme-court', name: 'Supreme Court of India', city: 'Delhi' },
  { slug: 'delhi-high-court', name: 'Delhi High Court', city: 'Delhi' },
  { slug: 'bombay-high-court', name: 'Bombay High Court', city: 'Mumbai' },
  { slug: 'karnataka-high-court', name: 'Karnataka High Court', city: 'Bangalore' },
  { slug: 'kerala-high-court', name: 'Kerala High Court', city: 'Kochi' },
  { slug: 'punjab-haryana-high-court', name: 'Punjab & Haryana High Court', city: 'Chandigarh' },
  { slug: 'family-court', name: 'Family Courts', city: 'Pan India' },
  { slug: 'district-court', name: 'District Courts', city: 'Pan India' },
];

export const topCities = [
  'mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'kolkata', 'pune', 'kochi',
  'ahmedabad', 'jaipur', 'lucknow', 'nagpur', 'indore', 'bhopal', 'coimbatore', 'thiruvananthapuram',
];

export const popularSearches = [
  { label: 'Divorce lawyer near me', href: '/practice/divorce' },
  { label: 'Property lawyer Mumbai', href: '/city/mumbai?practice=property' },
  { label: 'Criminal lawyer Delhi', href: '/city/delhi?practice=criminal' },
  { label: 'GST notice lawyer', href: '/practice/tax' },
  { label: 'RERA lawyer Bangalore', href: '/city/bangalore?practice=property' },
  { label: 'Bail lawyer Supreme Court', href: '/court/supreme-court' },
  { label: 'Mutual consent divorce', href: '/articles/divorce-mutual-consent-guide' },
  { label: 'Cheque bounce case', href: '/qa?q=cheque+bounce' },
  { label: 'Startup incorporation', href: '/practice/startup' },
  { label: 'Cyber crime complaint', href: '/practice/cyber' },
  { label: 'Child custody lawyer', href: '/practice/family' },
  { label: 'Immigration lawyer', href: '/practice/immigration' },
];

export const legalGuides = [
  { slug: 'divorce-mutual-consent-guide', title: 'Divorce by Mutual Consent in India', category: 'Family' },
  { slug: 'cheque-bounce-guide', title: "Do's & Don'ts in Cheque Bounce Cases", category: 'Criminal' },
  { slug: 'gst-notice-response', title: 'How to Respond to GST Notice', category: 'Tax' },
  { slug: 'rera-homebuyer-rights', title: 'RERA Rights for Homebuyers', category: 'Property' },
  { slug: 'startup-funding-legal-checklist', title: 'Startup Funding Legal Checklist', category: 'Startup' },
  { slug: 'bail-application-guide', title: 'Bail Application Guide India', category: 'Criminal' },
];

export const acts = [
  { slug: 'ipc-section-498a', title: 'IPC Section 498A', act: 'Indian Penal Code' },
  { slug: 'hindu-marriage-act-13b', title: 'Hindu Marriage Act Section 13B', act: 'HMA' },
  { slug: 'rera-act-2016', title: 'RERA Act 2016 Overview', act: 'RERA' },
  { slug: 'gst-act-section-73', title: 'GST Act Section 73', act: 'CGST Act' },
  { slug: 'it-act-section-66', title: 'IT Act Section 66', act: 'Cyber Law' },
];

export const qaCategories = [
  { slug: 'family', name: 'Family Law', count: 45000 },
  { slug: 'property', name: 'Property Law', count: 38000 },
  { slug: 'criminal', name: 'Criminal Law', count: 52000 },
  { slug: 'tax', name: 'Tax & GST', count: 22000 },
  { slug: 'corporate', name: 'Corporate Law', count: 18000 },
  { slug: 'labour', name: 'Labour Law', count: 15000 },
];

/** SEO title: "Divorce lawyers in Kochi" */
export function cityPracticeHref(citySlug: string, practiceSlug: string) {
  return `/city/${citySlug}/${practiceSlug}`;
}

export function courtHref(courtSlug: string) {
  return `/court/${courtSlug}`;
}
