import "dotenv/config";

import { defineConfig } from "prisma/config";

/**
 * Prisma CLI configuration (Prisma ORM v7+).
 *
 * - `datasource.url` is used by `prisma migrate`, `prisma db push`, `prisma db seed`
 *   and `prisma studio`. We point it at DIRECT_URL so migrations run against a
 *   direct Postgres connection (Supabase port 5432), bypassing the pooler.
 *
 * - The application runtime uses DATABASE_URL (Supavisor pooled, port 6543)
 *   via `new PrismaClient({ datasourceUrl })` in `src/server/db.ts`.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.js",
  },
  datasource: {
    // Use process.env directly (not the `env()` helper) so commands that don't
    // need a database connection (e.g. `prisma generate` during CI/Vercel
    // postinstall) don't fail when DIRECT_URL is absent.
    url: process.env.DIRECT_URL ?? "",
  },
});
