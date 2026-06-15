import { pool } from '../src/db.js';
import { hashPassword } from '../src/platform-auth.js';

const DEMO_EMAIL = 'lawyer@lawyerspot.com';
const DEMO_PASSWORD = 'lawyer123';
const DEMO_NAME = 'Advocate Yuganshu Sharma';
const DEMO_LAWYER_ID = 'advocate-yuganshu-sharma';
const DEMO_USER_ID = 'lawyer-user-demo';

const hash = await hashPassword(DEMO_PASSWORD);

await pool.query(
  `INSERT INTO platform_users (id, email, password_hash, name, role, lawyer_id, phone, status)
   VALUES ($1, $2, $3, $4, 'lawyer', $5, '+91 98765 43211', 'active')
   ON CONFLICT (email) DO UPDATE SET
     password_hash = EXCLUDED.password_hash,
     name = EXCLUDED.name,
     role = 'lawyer',
     lawyer_id = EXCLUDED.lawyer_id,
     status = 'active'`,
  [DEMO_USER_ID, DEMO_EMAIL, hash, DEMO_NAME, DEMO_LAWYER_ID],
);

console.log('Demo lawyer account ready:');
console.log(`  Email:    ${DEMO_EMAIL}`);
console.log(`  Password: ${DEMO_PASSWORD}`);
console.log(`  Login:    http://localhost:3000/lawyer-login`);
console.log(`  Profile:  http://localhost:3000/lawyers/advocate-yuganshu-sharma`);

await pool.end();
