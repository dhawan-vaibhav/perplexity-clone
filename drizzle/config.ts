import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Debug logging for production
if (process.env.DATABASE_URL) {
  const urlParts = process.env.DATABASE_URL.match(/postgresql:\/\/([^:]+):([^@]+)@([^:\/]+)(?::(\d+))?\/(.+)/);
  console.log('🔍 DB Config Check:', {
    hasUrl: true,
    isValidFormat: !!urlParts,
    host: urlParts?.[3] || 'invalid',
    port: urlParts?.[4] || '5432',
    database: urlParts?.[5] || 'unknown',
    urlLength: process.env.DATABASE_URL.length,
  });
} else {
  console.error('❌ DATABASE_URL is not defined!');
}

let client;
let db;

try {
  client = postgres(process.env.DATABASE_URL!, {
    max: 1, // Use single connection to avoid transaction issues
    ssl: 'require', // Required for Supabase in production
    connect_timeout: 10, // 10 second timeout
  });
  db = drizzle(client, { schema });
  console.log('✅ Database client initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize database client:', error);
  throw error;
}

export { db };