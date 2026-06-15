import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const cities = [
  { slug: 'mumbai', name: 'Mumbai' },
  { slug: 'delhi', name: 'Delhi' },
  { slug: 'bangalore', name: 'Bangalore' },
  { slug: 'hyderabad', name: 'Hyderabad' },
  { slug: 'chennai', name: 'Chennai' },
  { slug: 'pune', name: 'Pune' },
  { slug: 'kolkata', name: 'Kolkata' },
  { slug: 'kochi', name: 'Kochi' },
];

const rows = [
  ['1', 'adv-priya-sharmaa', 'Adv. Priya Sharmaa', 4.9, 312, 18, 2500, 'family', 'mumbai', true, true, 'premium', true, true],
  ['advocate-yuganshu-sharma', 'advocate-yuganshu-sharma', 'Advocate Yuganshu Sharma', 4.7, 50, 9, 2500, 'criminal', 'delhi', true, true, 'professional', true, false],
  ['2', 'adv-rajesh-kumar', 'Adv. Rajesh Kumar', 4.8, 428, 25, 3000, 'criminal', 'delhi', true, true, 'premium', true, true],
  ['3', 'adv-maria-santos', 'Adv. Maria Santos', 4.6, 98, 10, 2000, 'property', 'bangalore', false, true, 'basic', false, false],
  ['4', 'adv-fatima-hassan', 'Adv. Fatima Hassan', 4.7, 201, 14, 1800, 'tax', 'hyderabad', true, true, 'professional', false, true],
  ['5', 'adv-anita-menon', 'Adv. Anita Menon', 4.8, 156, 12, 2200, 'family', 'kochi', true, true, 'professional', true, false],
  ['6', 'adv-vikram-iyer', 'Adv. Vikram Iyer', 4.5, 87, 11, 2100, 'corporate', 'chennai', true, false, 'basic', false, false],
  ['7', 'adv-sneha-patel', 'Adv. Sneha Patel', 4.9, 245, 16, 2800, 'divorce', 'mumbai', true, true, 'premium', true, false],
  ['8', 'adv-arjun-mehta', 'Adv. Arjun Mehta', 4.4, 62, 8, 1500, 'cyber', 'pune', true, false, 'basic', false, false],
  ['9', 'adv-lakshmi-nair', 'Adv. Lakshmi Nair', 4.7, 178, 15, 2400, 'immigration', 'kochi', true, true, 'professional', false, true],
  ['10', 'adv-rohan-das', 'Adv. Rohan Das', 4.6, 134, 13, 1900, 'startup', 'bangalore', true, false, 'professional', false, false],
  ['11', 'adv-pooja-reddy', 'Adv. Pooja Reddy', 4.8, 289, 20, 3200, 'family', 'hyderabad', true, true, 'premium', true, true],
  ['12', 'adv-karan-singh', 'Adv. Karan Singh', 4.3, 45, 7, 1200, 'criminal', 'delhi', false, false, 'basic', false, false],
  ['13', 'adv-meera-joshi', 'Adv. Meera Joshi', 4.7, 167, 14, 2300, 'property', 'pune', true, true, 'professional', true, false],
  ['14', 'adv-amit-verma', 'Adv. Amit Verma', 4.5, 92, 10, 2000, 'tax', 'mumbai', true, false, 'basic', false, false],
  ['15', 'adv-divya-krishnan', 'Adv. Divya Krishnan', 4.9, 301, 19, 2900, 'corporate', 'chennai', true, true, 'premium', false, true],
  ['16', 'adv-sanjay-gupta', 'Adv. Sanjay Gupta', 4.4, 78, 9, 1700, 'criminal', 'kolkata', true, false, 'basic', false, false],
  ['17', 'adv-nisha-agarwal', 'Adv. Nisha Agarwal', 4.6, 112, 11, 2100, 'divorce', 'delhi', true, true, 'professional', false, false],
  ['18', 'adv-rahul-menon', 'Adv. Rahul Menon', 4.7, 198, 17, 2600, 'property', 'kochi', true, false, 'professional', true, false],
  ['19', 'adv-tanya-shah', 'Adv. Tanya Shah', 4.8, 220, 15, 2700, 'cyber', 'mumbai', true, true, 'premium', true, false],
  ['20', 'adv-deepak-rao', 'Adv. Deepak Rao', 4.5, 88, 12, 2200, 'startup', 'bangalore', true, false, 'basic', false, false],
];

const imgs = [
  'photo-1594744803329-e58b31de8bf5',
  'photo-1519085360753-af0119f7cbe7',
  'photo-1560250097-0b93528c311a',
  'photo-1580489944761-15a19d654956',
  'photo-1438761681033-6461ffad8d80',
  'photo-1573496359142-b8d87734a5a2',
  'photo-1507003211169-0a1dd7228f2d',
  'photo-1494790108377-be9c29b29330',
  'photo-1472099645785-5658abf4ff4e',
  'photo-1500648767791-00dcc994a43e',
  'photo-1534528741775-53994a69daeb',
  'photo-1524504388940-b1c1722653e1',
];

const lawyers = rows.map((n, i) => {
  const [
    id,
    slug,
    name,
    rating,
    reviews,
    exp,
    fee,
    practice,
    citySlug,
    online,
    verified,
    plan,
    featured,
    topRated,
  ] = n;
  const city = cities.find((c) => c.slug === citySlug);
  const label = practice.charAt(0).toUpperCase() + practice.slice(1);
  return {
    id,
    slug,
    name,
    image: `https://images.unsplash.com/${imgs[i % imgs.length]}?w=400&h=400&fit=crop`,
    rating,
    reviews,
    experience: exp,
    fee,
    currency: 'INR',
    location: city.name,
    citySlug,
    practice,
    specialization: [`${label} Law`],
    online,
    verified,
    bio: `${name} — experienced advocate in ${city.name}.`,
    subscriptionPlanId: plan,
    featured,
    topRated,
  };
});

const out = path.join(__dirname, '../../platform/data/lawyers-sample.json');
fs.writeFileSync(out, JSON.stringify(lawyers, null, 2));
console.log(`Wrote ${lawyers.length} lawyers to ${out}`);
