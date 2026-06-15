import fs from 'fs';
import path from 'path';

const src = path.join(process.cwd(), 'src');

const awaitFns = [
  'getLawyers',
  'getCities',
  'getPracticeAreas',
  'getArticles',
  'getQaPosts',
  'getTrendingTopics',
  'getLawyerById',
  'getPracticeBySlug',
  'getCityBySlug',
  'getArticleBySlug',
  'getDefaultProfileReviews',
  'getSiteConfig',
  'getStats',
];

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.tsx') || p.endsWith('.ts')) {
      if (p.includes('node_modules')) continue;
      let s = fs.readFileSync(p, 'utf8');
      let changed = false;
      for (const fn of awaitFns) {
        const re = new RegExp(`(?<!await )${fn}\\(`, 'g');
        if (re.test(s)) {
          s = s.replace(re, `await ${fn}(`);
          changed = true;
        }
      }
      if (s.includes('await getCmsData()') && /export default function/.test(s)) {
        s = s.replace(/export default function/g, 'export default async function');
        changed = true;
      }
      if (changed) {
        fs.writeFileSync(p, s);
        console.log('updated', path.relative(process.cwd(), p));
      }
    }
  }
}

walk(src);
