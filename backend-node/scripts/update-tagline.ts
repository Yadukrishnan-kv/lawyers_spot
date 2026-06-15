import { pool } from '../src/db.js';

const TAGLINE = 'Connecting you with the right lawyer';

await pool.query('UPDATE site_config SET tagline = $1 WHERE id = 1', [TAGLINE]);
const r = await pool.query('SELECT tagline FROM site_config WHERE id = 1');
console.log('Updated tagline:', r.rows[0]?.tagline);
await pool.end();
