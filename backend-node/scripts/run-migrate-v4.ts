import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../src/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sql = fs.readFileSync(path.join(__dirname, '../sql/migrate-v4-profile-faq.sql'), 'utf-8');

await pool.query(sql);
console.log('migrate-v4-profile-faq.sql applied');
await pool.end();
