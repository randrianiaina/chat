import type { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    connectionString: "postgresql://neondb_owner:npg_Z4fDLHFbMcN1@ep-noisy-dawn-ad6wr9xv-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  },
} satisfies Config;
