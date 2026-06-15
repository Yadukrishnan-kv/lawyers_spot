export type LawyerReview = {
  author: string;
  rating: number;
  text: string;
  date: string;
  verified?: boolean;
  avatar?: string;
};

export type LawyerPracticeGroup = {
  title: string;
  areas: string[];
};

export type LawyerEducation = {
  degree: string;
  institution: string;
  year: string;
};

export type LawyerTimeline = {
  year: string;
  title: string;
  org: string;
};

export type LawyerProfileFaq = {
  id: string;
  question: string;
  answer: string;
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  priceMonthly: number;
  currency: string;
  description: string;
  features: string[];
  highlight: boolean;
  sortOrder: number;
  active: boolean;
};

export type Lawyer = {
  id: string;
  slug?: string;
  name: string;
  image: string;
  rating: number;
  reviews: number;
  experience: number;
  fee?: number;
  currency?: string;
  location: string;
  address?: string;
  practice: string;
  /** Links lawyer to /city/[slug] pages */
  citySlug?: string;
  specialization: string[];
  online: boolean;
  verified: boolean;
  email?: string;
  emailVerified?: boolean;
  phone?: string;
  phoneVerified?: boolean;
  languages?: string[];
  firm?: string;
  bio?: string;
  education?: LawyerEducation[];
  timeline?: LawyerTimeline[];
  practiceGroups?: LawyerPracticeGroup[];
  courts?: string[];
  awards?: { title: string; year: string }[];
  clientReviews?: LawyerReview[];
  /** Profile FAQ tab — editable in admin */
  profileFaq?: LawyerProfileFaq[];
  /** Subscription tier — basic | professional | premium */
  subscriptionPlanId?: string;
  /** ISO date when the current subscription period ends */
  subscriptionExpiresAt?: string;
  /** @deprecated No longer used — kept for legacy data */
  featured?: boolean;
  /** Top Rated Lawyer badge on listings and profile */
  topRated?: boolean;
};
