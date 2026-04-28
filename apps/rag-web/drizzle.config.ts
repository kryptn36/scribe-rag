import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: '.env.local' });

export default defineConfig({
  schema: './src/shared/api/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  schemaFilter: ['public'],
  tablesFilter: ['meetings', 'meeting_chunks', 'follow_ups', 'follow_up_dependencies'],
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
