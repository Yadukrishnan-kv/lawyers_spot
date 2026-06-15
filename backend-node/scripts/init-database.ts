/**
 * Create lawyerspot user + database using a Postgres superuser connection.
 *
 * Usage (PowerShell):
 *   $env:POSTGRES_ADMIN_URL="postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/postgres"
 *   npm run db:init
 */
import { Pool } from 'pg';

const adminUrl =
  process.env.POSTGRES_ADMIN_URL ??
  'postgresql://postgres:postgres@localhost:5432/postgres';

async function main() {
  const pool = new Pool({ connectionString: adminUrl });
  try {
    await pool.query('SELECT 1');
    console.log('Connected as admin.');
  } catch (e) {
    console.error(
      'Cannot connect with POSTGRES_ADMIN_URL. Set your postgres superuser password, e.g.:',
    );
    console.error(
      '  $env:POSTGRES_ADMIN_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/postgres"',
    );
    console.error((e as Error).message);
    process.exit(1);
  }

  await pool.query(`
    DO $$ BEGIN
      CREATE USER lawyerspot WITH PASSWORD 'lawyerspot';
    EXCEPTION WHEN duplicate_object THEN
      ALTER USER lawyerspot WITH PASSWORD 'lawyerspot';
    END $$;
  `);

  const dbExists = await pool.query(`SELECT 1 FROM pg_database WHERE datname = 'lawyerspot'`);
  if (dbExists.rowCount === 0) {
    await pool.query('CREATE DATABASE lawyerspot OWNER lawyerspot');
    console.log('Created database lawyerspot');
  } else {
    console.log('Database lawyerspot already exists');
  }

  await pool.query('GRANT ALL PRIVILEGES ON DATABASE lawyerspot TO lawyerspot');
  await pool.end();
  console.log('User lawyerspot ready (password: lawyerspot)');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
