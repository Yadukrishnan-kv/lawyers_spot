# LawyerSpot Platform — Next.js 15 Legal Marketplace

Premium, SEO-first legal-tech UI built with Next.js 15, React, TypeScript, Tailwind CSS, ShadCN-style components, and Framer Motion.

## Quick Start

```bash
cd platform
npm install
npm run dev
```

Open **http://localhost:3000**

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage — hero, search, stats, practice areas, lawyers, Q&A, articles |
| `/lawyers` | Lawyer directory with filters |
| `/lawyers/[id]` | Lawyer profile + booking |
| `/qa` | Legal Q&A hub |
| `/articles` | Knowledge center |
| `/articles/[slug]` | Article with TOC, SEO layout |
| `/city/[slug]` | City SEO landing (e.g. `/city/kochi`) |
| `/city/[slug]/[practice]` | Combo SEO page (e.g. `/city/kochi/divorce`) |
| `/cities` | All cities index |
| `/courts` | All courts index |
| `/court/[slug]` | Court-wise lawyer pages |
| `/guides` | Law guides index |
| `/acts` | Acts & sections index |
| `/acts/[slug]` | Individual act/section page |
| `/sitemap` | HTML sitemap (SEO internal links) |
| `/qa/ask` | Ask free legal question |
| `/practice/[slug]` | Practice area hub |
| `/dashboard` | User dashboard |
| `/lawyer-dashboard` | Lawyer dashboard |

## Architecture

- `src/lib/data.ts` — Sample data (replace with CMS/API)
- `src/components/ui/` — ShadCN-style primitives
- `src/components/seo/` — Breadcrumbs, internal linking blocks
- `src/components/layout/` — Header, footer
- SEO metadata via Next.js `generateMetadata`
- Scalable URL patterns for millions of pages

## Legacy Static Site

The original HTML version remains in the parent `lawrato/` folder.
