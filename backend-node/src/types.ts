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

export type CmsData = {
  siteConfig: { name: string; tagline: string; url: string; description: string };
  siteContent: Record<string, unknown>;
  subscriptionPlans?: SubscriptionPlan[];
  stats: { label: string; value: string }[];
  practiceAreas: { slug: string; name: string; icon: string; lawyers: number }[];
  states: { slug: string; name: string; code: string; active: boolean }[];
  cities: { slug: string; name: string; state: string }[];
  lawyers: Record<string, unknown>[];
  qaPosts: {
    id: string;
    title: string;
    excerpt: string;
    category: string;
    answers: number;
    views: number;
    slug: string;
    status?: string;
  }[];
  articles: {
    slug: string;
    title: string;
    excerpt: string;
    category: string;
    author: string;
    date: string;
    readTime: string;
    image: string;
    trending: boolean;
    status?: string;
  }[];
  trendingTopics: string[];
  defaultProfileReviews: {
    author: string;
    rating: number;
    text: string;
    date: string;
    verified?: boolean;
    avatar?: string;
  }[];
  adminUsers: {
    id: string;
    name: string;
    email: string;
    role: string;
    lastLogin?: string;
  }[];
  bookings: {
    id: string;
    userId?: string | null;
    lawyerId: string;
    lawyerName: string;
    clientName: string;
    clientEmail: string;
    date: string;
    time: string;
    type: string;
    status: string;
  }[];
  updatedAt: string;
};
