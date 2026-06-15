import type { Lawyer, LawyerReview, SubscriptionPlan } from '@/lib/data-types';

export type { Lawyer, LawyerReview, SubscriptionPlan };
export type { LawyerEducation, LawyerTimeline, LawyerPracticeGroup, LawyerProfileFaq } from '@/lib/data-types';

export type SiteConfig = {
  name: string;
  tagline: string;
  url: string;
  description: string;
};

export type StatItem = { label: string; value: string };

export type PracticeArea = {
  slug: string;
  name: string;
  icon: string;
  lawyers: number;
};

export type StateEntry = {
  slug: string;
  name: string;
  /** Short code, e.g. MH, DL */
  code: string;
  active: boolean;
};

export type City = {
  slug: string;
  name: string;
  state: string;
};

export type NavLink = { label: string; href: string };
export type MainNavLink = NavLink & { mega?: 'lawyers' | 'advice' };
export type LegalSection = { slug: string; title: string; code?: string; body?: string };

export type LegalListingPage = {
  title: string;
  subtitle: string;
  footerNote: string;
  metaTitle: string;
  metaDescription: string;
};

export type AboutPageFields = {
  title: string;
  body: string;
  metaTitle?: string;
  metaDescription?: string;
};

/** Editable static pages — /terms, /privacy, etc. */
export type CmsPageFields = AboutPageFields & {
  lastUpdated?: string;
};

/** Admin-created pages published at /pages/[slug] */
export type CustomCmsPage = CmsPageFields & {
  id: string;
  slug: string;
  active?: boolean;
};
export type CourtEntry = {
  slug: string;
  name: string;
  city: string;
  body?: string;
  metaTitle?: string;
  metaDescription?: string;
};

export type FooterContent = {
  /** Override site tagline in footer; empty uses siteConfig.description */
  brandTagline: string;
  sectionTitles: {
    findByCity: string;
    practiceAreas: string;
    courts: string;
    quickLinks: string;
    legalResources: string;
    qaTopics: string;
    cityPractice: string;
    popularSearches: string;
    featuredGuides: string;
  };
  findByCityAll: NavLink;
  courtsAll: NavLink;
  courtsListLimit: number;
  qaTopicsLimit: number;
  legalResources: NavLink[];
  bottomLinks: NavLink[];
  cityPracticeLinks: NavLink[];
};

export type CourtsIndexPage = {
  title: string;
  subtitle: string;
  metaTitle: string;
  metaDescription: string;
};
export type ActEntry = { slug: string; title: string; act: string; body?: string };
export type GuideEntry = { slug: string; title: string; category: string };
export type QaCategory = { slug: string; name: string; count: number };

export type EmailSmtpSettings = {
  enabled: boolean;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
};

export type PaymentGatewaySettings = {
  enabled: boolean;
  provider: 'razorpay' | 'stripe' | 'payu';
  currency: string;
  razorpayKeyId: string;
  razorpayKeySecret: string;
  stripePublishableKey: string;
  stripeSecretKey: string;
  testMode: boolean;
};

export type TwilioSettings = {
  enabled: boolean;
  accountSid: string;
  authToken: string;
  fromNumber: string;
  messagingServiceSid: string;
};

export type IntegrationSettings = {
  email: EmailSmtpSettings;
  payment: PaymentGatewaySettings;
  twilio: TwilioSettings;
};

export type SiteContent = {
  utilityNav: NavLink[];
  mainNav: MainNavLink[];
  languages: { code: string; label: string }[];
  ipcSections: LegalSection[];
  bnsSections: LegalSection[];
  courts: CourtEntry[];
  acts: ActEntry[];
  popularSearches: NavLink[];
  legalGuides: GuideEntry[];
  qaCategories: QaCategory[];
  hero: { title: string; subtitle: string; badges: string[] };
  about: AboutPageFields;
  /** Static page at /terms */
  termsPage: CmsPageFields;
  /** Static page at /privacy */
  privacyPage: CmsPageFields;
  /** Custom CMS pages at /pages/[slug] */
  customCmsPages?: CustomCmsPage[];
  /** Landing page copy for /ipc */
  ipcPage: LegalListingPage;
  /** Landing page copy for /bns */
  bnsPage: LegalListingPage;
  /** Footer copy, limits, and extra link groups */
  footer: FooterContent;
  /** Landing page copy for /courts */
  courtsPage: CourtsIndexPage;
  /** SMTP, payments, Twilio — Admin → Settings */
  integrations: IntegrationSettings;
};

export type QaPost = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  answers: number;
  views: number;
  slug: string;
  status?: 'published' | 'draft';
  content?: string;
};

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  trending: boolean;
  status?: 'published' | 'draft';
  content?: string;
  lawyerId?: string;
};

export type QaAnswer = {
  id: string;
  qaPostId: string;
  lawyerId: string;
  lawyerName: string;
  body: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  questionTitle?: string;
  questionSlug?: string;
  questionCategory?: string;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'editor' | 'moderator';
  lastLogin?: string;
};

export type BookingRecord = {
  id: string;
  lawyerId: string;
  lawyerName: string;
  clientName: string;
  clientEmail: string;
  date: string;
  time: string;
  type: string;
  status: 'pending' | 'confirmed' | 'cancelled';
};

export type CmsData = {
  siteConfig: SiteConfig;
  subscriptionPlans: SubscriptionPlan[];
  siteContent: SiteContent;
  stats: StatItem[];
  practiceAreas: PracticeArea[];
  states: StateEntry[];
  cities: City[];
  lawyers: Lawyer[];
  qaPosts: QaPost[];
  articles: Article[];
  trendingTopics: string[];
  defaultProfileReviews: LawyerReview[];
  adminUsers: AdminUser[];
  bookings: BookingRecord[];
  updatedAt: string;
};
