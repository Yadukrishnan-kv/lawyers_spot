/** Fallback when site_content JSON is empty in DB — mirrors platform seo-nav defaults */
export const defaultSiteContent = {
  utilityNav: [
    { label: 'Indian Kanoon', href: '/indian-kanoon' },
    { label: 'Indian Penal Code', href: '/ipc' },
    { label: 'Ask A Free Question', href: '/qa/ask' },
    { label: 'Talk To A Lawyer', href: '/lawyers' },
    { label: 'Free Legal Advice', href: '/qa' },
    { label: 'Lawyer Signup', href: '/lawyer-signup' },
  ],
  mainNav: [
    { label: 'Find A Lawyer', href: '/lawyers', mega: 'lawyers' },
    { label: 'Legal Advice', href: '/qa', mega: 'advice' },
    { label: 'IPC Sections', href: '/ipc' },
    { label: 'BNS Sections', href: '/bns' },
    { label: 'About', href: '/about' },
    { label: 'My Account', href: '/dashboard' },
  ],
  languages: [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
  ],
  ipcSections: [
    { slug: 'ipc-section-498a', title: 'IPC Section 498A', code: '498A' },
    { slug: 'ipc-section-420', title: 'IPC Section 420', code: '420' },
    { slug: 'ipc-section-302', title: 'IPC Section 302', code: '302' },
    { slug: 'ipc-section-376', title: 'IPC Section 376', code: '376' },
    { slug: 'ipc-section-406', title: 'IPC Section 406', code: '406' },
    { slug: 'ipc-section-354', title: 'IPC Section 354', code: '354' },
  ],
  bnsSections: [
    { slug: 'bns-section-103', title: 'BNS Section 103 (Murder)', code: '103' },
    { slug: 'bns-section-64', title: 'BNS Section 64 (Rape)', code: '64' },
    { slug: 'bns-section-318', title: 'BNS Section 318 (Cheating)', code: '318' },
    { slug: 'bns-section-85', title: 'BNS Section 85', code: '85' },
    { slug: 'bns-section-115', title: 'BNS Section 115', code: '115' },
  ],
  courts: [
    { slug: 'supreme-court', name: 'Supreme Court of India', city: 'Delhi' },
    { slug: 'delhi-high-court', name: 'Delhi High Court', city: 'Delhi' },
    { slug: 'bombay-high-court', name: 'Bombay High Court', city: 'Mumbai' },
    { slug: 'karnataka-high-court', name: 'Karnataka High Court', city: 'Bangalore' },
    { slug: 'kerala-high-court', name: 'Kerala High Court', city: 'Kochi' },
    { slug: 'punjab-haryana-high-court', name: 'Punjab & Haryana High Court', city: 'Chandigarh' },
    { slug: 'family-court', name: 'Family Courts', city: 'Pan India' },
    { slug: 'district-court', name: 'District Courts', city: 'Pan India' },
  ],
  acts: [
    { slug: 'ipc-section-498a', title: 'IPC Section 498A', act: 'Indian Penal Code' },
    { slug: 'hindu-marriage-act-13b', title: 'Hindu Marriage Act Section 13B', act: 'HMA' },
    { slug: 'rera-act-2016', title: 'RERA Act 2016 Overview', act: 'RERA' },
    { slug: 'gst-act-section-73', title: 'GST Act Section 73', act: 'CGST Act' },
    { slug: 'it-act-section-66', title: 'IT Act Section 66', act: 'Cyber Law' },
  ],
  popularSearches: [
    { label: 'Divorce lawyer near me', href: '/practice/divorce' },
    { label: 'Property lawyer Mumbai', href: '/city/mumbai/property' },
    { label: 'Criminal lawyer Delhi', href: '/city/delhi/criminal' },
    { label: 'GST notice lawyer', href: '/practice/tax' },
    { label: 'RERA lawyer Bangalore', href: '/city/bangalore/property' },
    { label: 'Bail lawyer Supreme Court', href: '/court/supreme-court' },
    { label: 'Mutual consent divorce', href: '/articles/divorce-mutual-consent-guide' },
    { label: 'Cheque bounce case', href: '/qa?q=cheque+bounce' },
    { label: 'Startup incorporation', href: '/practice/startup' },
    { label: 'Cyber crime complaint', href: '/practice/cyber' },
    { label: 'Child custody lawyer', href: '/practice/family' },
    { label: 'Immigration lawyer', href: '/practice/immigration' },
  ],
  legalGuides: [
    { slug: 'divorce-mutual-consent-guide', title: 'Divorce by Mutual Consent in India', category: 'Family' },
    { slug: 'cheque-bounce-guide', title: "Do's & Don'ts in Cheque Bounce Cases", category: 'Criminal' },
    { slug: 'gst-notice-response', title: 'How to Respond to GST Notice', category: 'Tax' },
    { slug: 'rera-homebuyer-rights', title: 'RERA Rights for Homebuyers', category: 'Property' },
    { slug: 'startup-funding-legal-checklist', title: 'Startup Funding Legal Checklist', category: 'Startup' },
    { slug: 'bail-application-guide', title: 'Bail Application Guide India', category: 'Criminal' },
  ],
  qaCategories: [
    { slug: 'family', name: 'Family Law', count: 45000 },
    { slug: 'property', name: 'Property Law', count: 38000 },
    { slug: 'criminal', name: 'Criminal Law', count: 52000 },
    { slug: 'tax', name: 'Tax & GST', count: 22000 },
    { slug: 'corporate', name: 'Corporate Law', count: 18000 },
    { slug: 'labour', name: 'Labour Law', count: 15000 },
  ],
  hero: {
    title: "India's Legal Intelligence Platform",
    subtitle:
      'Search verified lawyers, free legal answers, guides & acts — built for scale, SEO & trust.',
    badges: ['100% Confidential', 'Bar Council Verified'],
  },
  about: {
    title: 'About LawyerSpot',
    body: '<p>LawyerSpot connects clients with verified advocates across India. All statistics and content are managed dynamically from our admin CMS.</p>',
    metaTitle: 'About LawyerSpot',
    metaDescription:
      "India's legal intelligence platform — connecting citizens with verified lawyers and free legal knowledge.",
  },
  ipcPage: {
    title: 'IPC Sections',
    subtitle:
      'Indian Penal Code — section-wise legal information (legacy code; BNS now applicable for new cases)',
    footerNote:
      'Also see <a href="/bns" class="text-royal-600 font-semibold">BNS Sections</a> (Bharatiya Nyaya Sanhita, 2023)',
    metaTitle: 'IPC Sections — Indian Penal Code',
    metaDescription:
      'Browse Indian Penal Code (IPC) sections with plain-English explanations. IPC 498A, 420, 302 and more.',
  },
  footer: {
    brandTagline: '',
    sectionTitles: {
      findByCity: 'Find by City',
      practiceAreas: 'Practice Areas',
      courts: 'Courts',
      quickLinks: 'Quick Links',
      legalResources: 'Legal Resources',
      qaTopics: 'Q&A Topics',
      cityPractice: 'Popular: lawyers by City & Service',
      popularSearches: 'Popular Searches',
      featuredGuides: 'Featured Law Guides',
    },
    findByCityAll: { label: 'All cities →', href: '/cities' },
    courtsAll: { label: 'All courts →', href: '/courts' },
    courtsListLimit: 6,
    qaTopicsLimit: 4,
    legalResources: [
      { label: 'IPC Sections', href: '/ipc' },
      { label: 'BNS Sections', href: '/bns' },
      { label: 'Legal Q&A (2.5M+)', href: '/qa' },
      { label: 'Law Guides', href: '/guides' },
      { label: 'Acts & Sections', href: '/acts' },
      { label: 'Articles', href: '/articles' },
      { label: 'HTML Sitemap', href: '/html-sitemap' },
    ],
    bottomLinks: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Sitemap', href: '/html-sitemap' },
      { label: 'For Lawyers', href: '/lawyer-dashboard' },
    ],
    cityPracticeLinks: [],
  },
  courtsPage: {
    title: 'Lawyers by Court',
    subtitle:
      'Advocates practicing in Supreme Court, High Courts, District & Family Courts across India.',
    metaTitle: 'Find lawyers by Court in India',
    metaDescription:
      'Advocates practicing in Supreme Court, High Courts, District & Family Courts across India.',
  },
  bnsPage: {
    title: 'BNS Sections',
    subtitle: 'Bharatiya Nyaya Sanhita, 2023 — replaces IPC for new criminal matters',
    footerNote:
      'Legacy code: <a href="/ipc" class="text-royal-600 font-semibold">IPC Sections</a>',
    metaTitle: 'BNS Sections — Bharatiya Nyaya Sanhita',
    metaDescription:
      'Browse BNS 2023 sections — the new criminal code replacing IPC for offences committed after July 2024.',
  },
};
