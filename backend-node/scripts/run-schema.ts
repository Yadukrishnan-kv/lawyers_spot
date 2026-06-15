import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../src/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(__dirname, '..', 'sql', 'schema.sql');

async function main() {
  const sql = fs.readFileSync(schemaPath, 'utf-8');
  await pool.query(sql);
  console.log('Database schema applied.');
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
