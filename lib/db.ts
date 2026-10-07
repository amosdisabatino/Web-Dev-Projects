import { Pool } from 'pg';

const globalForPg = global as unknown as { pgPool: Pool };

export const pool = globalForPg.pgPool || new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
});

globalForPg.pgPool = pool;
