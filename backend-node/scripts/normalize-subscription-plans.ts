import { pool } from '../src/db.js';
import { DEFAULT_SUBSCRIPTION_PLANS } from '../src/subscription-plans.js';
import { loadCms, saveCms } from '../src/cms.js';

/** One-time: normalize plan feature IDs and re-apply lawyer entitlements */
const cms = await loadCms();
cms.subscriptionPlans = DEFAULT_SUBSCRIPTION_PLANS;
await saveCms(cms);
const after = await loadCms();
console.log(
  `Normalized ${after.subscriptionPlans?.length ?? 0} plans; ${after.lawyers.length} lawyers updated.`,
);
await pool.end();
