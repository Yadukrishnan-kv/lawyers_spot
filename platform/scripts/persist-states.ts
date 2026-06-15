import fs from 'fs';
import path from 'path';
import { defaultStates } from '../src/lib/cms/default-states';

const cmsPath = path.join(process.cwd(), 'data', 'cms.json');
const cms = JSON.parse(fs.readFileSync(cmsPath, 'utf-8')) as { states?: unknown[] };

if (!Array.isArray(cms.states) || cms.states.length === 0) {
  cms.states = defaultStates;
  (cms as { updatedAt: string }).updatedAt = new Date().toISOString();
  fs.writeFileSync(cmsPath, JSON.stringify(cms, null, 2), 'utf-8');
  console.log(`Wrote ${defaultStates.length} states to data/cms.json`);
} else {
  console.log(`cms.json already has ${cms.states.length} states`);
}
