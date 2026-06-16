import type { PoolClient } from 'pg';
import { pool, query } from './db.js';
import { defaultSiteContent } from './default-site-content.js';
import { normalizeLawyerSlugs } from './lawyer-slug.js';
import {
  DEFAULT_SUBSCRIPTION_PLANS,
  planRowToJson,
  type SubscriptionPlan,
} from './subscription-plans.js';
import { applyPlanFlagsToLawyer } from './subscription-features.js';
import type { CmsData } from './types.js';

function lawyerRowToJson(row: Record<string, unknown>) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    image: row.image,
    rating: row.rating,
    reviews: row.reviews,
    experience: row.experience,
    fee: row.fee,
    currency: row.currency,
    location: row.location,
    address: row.address,
    practice: row.practice,
    citySlug: row.city_slug,
    specialization: row.specialization ?? [],
    online: row.online,
    verified: row.verified,
    email: row.email ?? undefined,
    emailVerified: Boolean(row.email_verified),
    phone: row.phone,
    phoneVerified: Boolean(row.phone_verified),
    languages: row.languages,
    firm: row.firm,
    bio: row.bio,
    education: row.education,
    timeline: row.timeline,
    practiceGroups: row.practice_groups,
    courts: row.courts,
    awards: row.awards,
    clientReviews: row.client_reviews,
    profileFaq: row.profile_faq,
    subscriptionPlanId: (row.subscription_plan_id as string) ?? 'basic',
    subscriptionExpiresAt: row.subscription_expires_at
      ? new Date(row.subscription_expires_at as string).toISOString()
      : undefined,
    featured: Boolean(row.featured),
    topRated: Boolean(row.top_rated),
  };
}

async function saveSubscriptionPlans(client: PoolClient, plans: SubscriptionPlan[]) {
  for (const p of plans) {
    await client.query(
      `INSERT INTO subscription_plans (
        id, name, price_monthly, currency, description, features, highlight, sort_order, active
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        price_monthly = EXCLUDED.price_monthly,
        currency = EXCLUDED.currency,
        description = EXCLUDED.description,
        features = EXCLUDED.features,
        highlight = EXCLUDED.highlight,
        sort_order = EXCLUDED.sort_order,
        active = EXCLUDED.active`,
      [
        p.id,
        p.name,
        p.priceMonthly,
        p.currency,
        p.description,
        JSON.stringify(p.features ?? []),
        p.highlight,
        p.sortOrder,
        p.active,
      ],
    );
  }
}

export async function loadCms(): Promise<CmsData> {
  const siteRes = await query('SELECT * FROM site_config WHERE id = 1');
  const site = siteRes.rows[0];
  if (!site) {
    throw new Error('Site not configured. Run: npm run db:setup');
  }

  const [
    stats,
    practiceAreas,
    states,
    cities,
    lawyers,
    qaPosts,
    articles,
    topics,
    reviews,
    adminUsers,
    bookings,
    plansRes,
  ] = await Promise.all([
      query('SELECT label, value FROM stats ORDER BY sort_order'),
      query('SELECT slug, name, icon, lawyers FROM practice_areas ORDER BY name'),
      query('SELECT slug, name, code, active FROM states ORDER BY name'),
      query('SELECT slug, name, state_name FROM cities ORDER BY name'),
      query('SELECT * FROM lawyers ORDER BY name'),
      query('SELECT id, title, excerpt, category, answers, views, slug, status, content FROM qa_posts'),
      query(
        'SELECT slug, title, excerpt, category, author, date, read_time, image, trending, status, content, lawyer_id FROM articles',
      ),
      query('SELECT topic FROM trending_topics ORDER BY sort_order'),
      query(
        'SELECT author, rating, text, date, verified, avatar FROM default_profile_reviews ORDER BY sort_order',
      ),
      query('SELECT id, name, email, role, last_login FROM admin_users'),
      query(
        'SELECT id, lawyer_id, lawyer_name, client_name, client_email, date, time, type, status FROM bookings',
      ),
      query(
        'SELECT id, name, price_monthly, currency, description, features, highlight, sort_order, active FROM subscription_plans ORDER BY sort_order',
      ),
    ]);

  const subscriptionPlans =
    plansRes.rows.length > 0
      ? plansRes.rows.map((r) => planRowToJson(r as Record<string, unknown>))
      : DEFAULT_SUBSCRIPTION_PLANS;

  return {
    siteConfig: {
      name: site.name as string,
      tagline: site.tagline as string,
      url: site.url as string,
      description: site.description as string,
    },
    siteContent:
      site.site_content && Object.keys(site.site_content as object).length > 0
        ? (site.site_content as CmsData['siteContent'])
        : defaultSiteContent,
    stats: stats.rows as CmsData['stats'],
    practiceAreas: practiceAreas.rows as CmsData['practiceAreas'],
    states: states.rows.map((s) => ({
      slug: s.slug as string,
      name: s.name as string,
      code: s.code as string,
      active: s.active as boolean,
    })),
    cities: cities.rows.map((c) => ({
      slug: c.slug as string,
      name: c.name as string,
      state: c.state_name as string,
    })),
    subscriptionPlans,
    lawyers: applySubscriptionEntitlementsToLawyers(
      normalizeLawyerSlugs(
        lawyers.rows.map((l) => lawyerRowToJson(l as Record<string, unknown>)) as CmsData['lawyers'],
      ),
      subscriptionPlans,
    ),
    qaPosts: qaPosts.rows.map((q) => ({
      id: q.id as string,
      slug: q.slug as string,
      title: q.title as string,
      excerpt: q.excerpt as string,
      category: q.category as string,
      answers: q.answers as number,
      views: q.views as number,
      status: q.status as string,
      content: (q.content as string | null) ?? undefined,
    })),
    articles: articles.rows.map((a) => ({
      slug: a.slug as string,
      title: a.title as string,
      excerpt: a.excerpt as string,
      category: a.category as string,
      author: a.author as string,
      date: a.date as string,
      readTime: a.read_time as string,
      image: a.image as string,
      trending: a.trending as boolean,
      status: a.status as string,
      content: (a.content as string | null) ?? undefined,
      lawyerId: (a.lawyer_id as string | null) ?? undefined,
    })),
    trendingTopics: topics.rows.map((t) => t.topic as string),
    defaultProfileReviews: reviews.rows.map((r) => ({
      author: r.author as string,
      rating: r.rating as number,
      text: r.text as string,
      date: r.date as string,
      verified: r.verified as boolean,
      avatar: r.avatar as string | undefined,
    })),
    adminUsers: adminUsers.rows.map((u) => ({
      id: u.id as string,
      name: u.name as string,
      email: u.email as string,
      role: u.role as string,
      lastLogin: u.last_login as string | undefined,
    })),
    bookings: bookings.rows.map((b) => ({
      id: b.id as string,
      lawyerId: b.lawyer_id as string,
      lawyerName: b.lawyer_name as string,
      clientName: b.client_name as string,
      clientEmail: b.client_email as string,
      date: b.date as string,
      time: b.time as string,
      type: b.type as string,
      status: b.status as string,
    })),
    updatedAt: site.updated_at
      ? new Date(site.updated_at as string).toISOString()
      : new Date().toISOString(),
  };
}

async function clearContentTables(client: PoolClient) {
  const tables = [
    'bookings',
    'admin_users',
    'default_profile_reviews',
    'trending_topics',
    'cities',
    'states',
    'practice_areas',
    'stats',
  ];
  for (const table of tables) {
    await client.query(`DELETE FROM ${table}`);
  }
}

function applySubscriptionEntitlementsToLawyers(
  lawyers: CmsData['lawyers'],
  plans: SubscriptionPlan[],
): CmsData['lawyers'] {
  const planById = new Map(plans.map((p) => [p.id, p]));
  return lawyers.map((raw) => {
    const lawyer = raw as Record<string, unknown>;
    const planId = (lawyer.subscriptionPlanId as string) ?? 'basic';
    const plan = planById.get(planId) ?? planById.get('basic');
    return applyPlanFlagsToLawyer(lawyer, plan?.features) as (typeof lawyers)[number];
  });
}

export async function saveCms(payload: CmsData): Promise<CmsData> {
  const plans =
    payload.subscriptionPlans?.length ? payload.subscriptionPlans : DEFAULT_SUBSCRIPTION_PLANS;
  const lawyers = applySubscriptionEntitlementsToLawyers(
    normalizeLawyerSlugs(payload.lawyers),
    plans,
  );
  const data = { ...payload, subscriptionPlans: plans, lawyers };
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await clearContentTables(client);

    await client.query(
      `INSERT INTO site_config (id, name, tagline, url, description, site_content, updated_at)
       VALUES (1, $1, $2, $3, $4, $5, NOW())
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         tagline = EXCLUDED.tagline,
         url = EXCLUDED.url,
         description = EXCLUDED.description,
         site_content = EXCLUDED.site_content,
         updated_at = NOW()`,
      [
        data.siteConfig.name,
        data.siteConfig.tagline,
        data.siteConfig.url,
        data.siteConfig.description,
        JSON.stringify(data.siteContent ?? defaultSiteContent),
      ],
    );

    for (let i = 0; i < data.stats.length; i++) {
      const s = data.stats[i];
      await client.query('INSERT INTO stats (label, value, sort_order) VALUES ($1, $2, $3)', [
        s.label,
        s.value,
        i,
      ]);
    }

    for (const p of data.practiceAreas) {
      await client.query(
        'INSERT INTO practice_areas (slug, name, icon, lawyers) VALUES ($1, $2, $3, $4)',
        [p.slug, p.name, p.icon, p.lawyers],
      );
    }

    for (const s of data.states) {
      await client.query(
        'INSERT INTO states (slug, name, code, active) VALUES ($1, $2, $3, $4)',
        [s.slug, s.name, s.code, s.active],
      );
    }

    for (const c of data.cities) {
      await client.query('INSERT INTO cities (slug, name, state_name) VALUES ($1, $2, $3)', [
        c.slug,
        c.name,
        c.state,
      ]);
    }

    await saveSubscriptionPlans(
      client,
      data.subscriptionPlans?.length ? data.subscriptionPlans : DEFAULT_SUBSCRIPTION_PLANS,
    );

    for (const l of data.lawyers) {
      const row = l as Record<string, unknown>;
      await client.query(
        `INSERT INTO lawyers (
          id, slug, name, image, rating, reviews, experience, fee, currency, location, address,
          practice, city_slug, email, email_verified, phone, phone_verified, firm, bio, online, verified,
          specialization, languages, education, timeline, practice_groups, courts, awards, client_reviews,
          profile_faq, subscription_plan_id, subscription_expires_at, featured, top_rated
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34)
        ON CONFLICT (id) DO UPDATE SET
          slug = EXCLUDED.slug,
          name = EXCLUDED.name,
          image = EXCLUDED.image,
          rating = EXCLUDED.rating,
          reviews = EXCLUDED.reviews,
          experience = EXCLUDED.experience,
          fee = EXCLUDED.fee,
          currency = EXCLUDED.currency,
          location = EXCLUDED.location,
          address = EXCLUDED.address,
          practice = EXCLUDED.practice,
          city_slug = EXCLUDED.city_slug,
          email = EXCLUDED.email,
          email_verified = EXCLUDED.email_verified,
          phone = EXCLUDED.phone,
          phone_verified = EXCLUDED.phone_verified,
          firm = EXCLUDED.firm,
          bio = EXCLUDED.bio,
          online = EXCLUDED.online,
          verified = EXCLUDED.verified,
          specialization = EXCLUDED.specialization,
          languages = EXCLUDED.languages,
          education = EXCLUDED.education,
          timeline = EXCLUDED.timeline,
          practice_groups = EXCLUDED.practice_groups,
          courts = EXCLUDED.courts,
          awards = EXCLUDED.awards,
          client_reviews = EXCLUDED.client_reviews,
          profile_faq = EXCLUDED.profile_faq,
          subscription_plan_id = EXCLUDED.subscription_plan_id,
          subscription_expires_at = EXCLUDED.subscription_expires_at,
          featured = EXCLUDED.featured,
          top_rated = EXCLUDED.top_rated`,
        [
          row.id,
          row.slug ?? null,
          row.name,
          row.image,
          row.rating ?? 0,
          row.reviews ?? 0,
          row.experience ?? 0,
          row.fee ?? null,
          row.currency ?? null,
          row.location,
          row.address ?? null,
          row.practice,
          row.citySlug ?? null,
          row.email ?? null,
          Boolean(row.emailVerified),
          row.phone ?? null,
          Boolean(row.phoneVerified),
          row.firm ?? null,
          row.bio ?? null,
          row.online ?? true,
          row.verified ?? false,
          JSON.stringify(row.specialization ?? []),
          row.languages ? JSON.stringify(row.languages) : null,
          row.education ? JSON.stringify(row.education) : null,
          row.timeline ? JSON.stringify(row.timeline) : null,
          row.practiceGroups ? JSON.stringify(row.practiceGroups) : null,
          row.courts ? JSON.stringify(row.courts) : null,
          row.awards ? JSON.stringify(row.awards) : null,
          row.clientReviews ? JSON.stringify(row.clientReviews) : null,
          row.profileFaq ? JSON.stringify(row.profileFaq) : null,
          row.subscriptionPlanId ?? 'basic',
          row.subscriptionExpiresAt ? new Date(row.subscriptionExpiresAt as string) : null,
          Boolean(row.featured),
          Boolean(row.topRated),
        ],
      );
    }

    for (const q of data.qaPosts) {
      await client.query(
        `INSERT INTO qa_posts (id, slug, title, excerpt, category, answers, views, status, content)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (id) DO UPDATE SET
           slug = EXCLUDED.slug,
           title = EXCLUDED.title,
           excerpt = EXCLUDED.excerpt,
           category = EXCLUDED.category,
           answers = EXCLUDED.answers,
           views = EXCLUDED.views,
           status = EXCLUDED.status,
           content = EXCLUDED.content`,
        [
          q.id,
          q.slug,
          q.title,
          q.excerpt,
          q.category,
          q.answers,
          q.views,
          q.status ?? 'published',
          (q as { content?: string }).content ?? null,
        ],
      );
    }

    for (const a of data.articles) {
      await client.query(
        `INSERT INTO articles (slug, title, excerpt, category, author, date, read_time, image, trending, status, content, lawyer_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         ON CONFLICT (slug) DO UPDATE SET
           title = EXCLUDED.title,
           excerpt = EXCLUDED.excerpt,
           category = EXCLUDED.category,
           author = EXCLUDED.author,
           date = EXCLUDED.date,
           read_time = EXCLUDED.read_time,
           image = EXCLUDED.image,
           trending = EXCLUDED.trending,
           status = EXCLUDED.status,
           content = EXCLUDED.content,
           lawyer_id = EXCLUDED.lawyer_id`,
        [
          a.slug,
          a.title,
          a.excerpt,
          a.category,
          a.author,
          a.date,
          a.readTime,
          a.image,
          a.trending,
          a.status ?? 'published',
          (a as { content?: string }).content ?? null,
          (a as { lawyerId?: string }).lawyerId ?? null,
        ],
      );
    }

    for (let i = 0; i < data.trendingTopics.length; i++) {
      await client.query('INSERT INTO trending_topics (topic, sort_order) VALUES ($1, $2)', [
        data.trendingTopics[i],
        i,
      ]);
    }

    for (let i = 0; i < data.defaultProfileReviews.length; i++) {
      const r = data.defaultProfileReviews[i];
      await client.query(
        `INSERT INTO default_profile_reviews (author, rating, text, date, verified, avatar, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [r.author, r.rating, r.text, r.date, r.verified ?? false, r.avatar ?? null, i],
      );
    }

    for (const u of data.adminUsers) {
      await client.query(
        'INSERT INTO admin_users (id, name, email, role, last_login) VALUES ($1,$2,$3,$4,$5)',
        [u.id, u.name, u.email, u.role, u.lastLogin ?? null],
      );
    }

    for (const b of data.bookings) {
      await client.query(
        `INSERT INTO bookings (id, lawyer_id, lawyer_name, client_name, client_email, date, time, type, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          b.id,
          b.lawyerId,
          b.lawyerName,
          b.clientName,
          b.clientEmail,
          b.date,
          b.time,
          b.type,
          b.status,
        ],
      );
    }

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }

  return loadCms();
}
