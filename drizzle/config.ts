import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

let db: PostgresJsDatabase<typeof schema>;

try {
  const client = postgres(process.env.DATABASE_URL!, {
    max: 1, // Use single connection to avoid transaction issues
    ssl: 'require', // Required for Supabase in production
    connect_timeout: 10, // 10 second timeout
  });
  db = drizzle(client, { schema });
} catch (error) {
  throw error;
}

export { db };