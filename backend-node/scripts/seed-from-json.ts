import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../src/db.js';
import { loadCms, saveCms } from '../src/cms.js';
import { DEFAULT_SUBSCRIPTION_PLANS } from '../src/subscription-plans.js';
import type { CmsData } from '../src/types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cmsJson = path.join(__dirname, '..', '..', 'platform', 'data', 'cms.json');
const lawyersSample = path.join(__dirname, '..', '..', 'platform', 'data', 'lawyers-sample.json');

async function main() {
  if (!fs.existsSync(cmsJson)) {
    console.error(`Missing ${cmsJson}`);
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(cmsJson, 'utf-8')) as CmsData;
  if (fs.existsSync(lawyersSample)) {
    raw.lawyers = JSON.parse(fs.readFileSync(lawyersSample, 'utf-8')) as CmsData['lawyers'];
    console.log(`Loaded ${raw.lawyers.length} lawyers from lawyers-sample.json`);
  }
  if (!raw.subscriptionPlans?.length) {
    raw.subscriptionPlans = DEFAULT_SUBSCRIPTION_PLANS;
  }
  if (!raw.siteContent) {
    const { defaultSiteContent } = await import('../src/default-site-content.js');
    raw.siteContent = defaultSiteContent as CmsData['siteContent'];
  }
  console.log('Seeding CMS data from cms.json...');
  await saveCms(raw);
  const result = await loadCms();
  console.log(
    `Done: ${result.states.length} states, ${result.cities.length} cities, ${result.lawyers.length} lawyers`,
  );
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
