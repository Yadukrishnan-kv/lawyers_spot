import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../src/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sql = fs.readFileSync(path.join(__dirname, '../sql/migrate-v2.sql'), 'utf-8');

async function main() {
  await pool.query(sql);
  console.log('migrate-v2.sql applied');
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
