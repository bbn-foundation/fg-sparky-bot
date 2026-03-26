import { defineConfig, type Config } from 'drizzle-kit';

const config: Config = defineConfig({
  out: './drizzle',
  schema: ['./src/db/numberhuman.ts', './src/db/user-profile.ts'],
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DB_FILE_NAME!,
  },
});
export default config;
