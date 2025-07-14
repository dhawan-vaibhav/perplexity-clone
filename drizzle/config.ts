import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const client = postgres(process.env.DATABASE_URL!, {
  max: 1, // Use single connection to avoid transaction issues
  ssl: 'require', // Required for Supabase in production
});
export const db = drizzle(client, { schema });