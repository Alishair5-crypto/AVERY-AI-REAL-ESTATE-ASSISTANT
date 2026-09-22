import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

type AveryDb = ReturnType<typeof drizzle>;

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
  __averyDb?: AveryDb;
};

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required at runtime");
  }

  return databaseUrl;
}

function getPool() {
  if (!globalForDb.__arenaNextJsPostgresqlPool) {
    globalForDb.__arenaNextJsPostgresqlPool = new Pool({
      connectionString: getDatabaseUrl(),
    });
  }

  return globalForDb.__arenaNextJsPostgresqlPool;
}

function getDb(): AveryDb {
  if (!globalForDb.__averyDb) {
    globalForDb.__averyDb = drizzle(getPool());
  }

  return globalForDb.__averyDb;
}

// Keep database initialization lazy so Next.js can build dynamic API routes
// without requiring production database environment variables at build time.
export const db = new Proxy({} as AveryDb, {
  get(_target, property, receiver) {
    return Reflect.get(getDb(), property, receiver);
  },
});

export const pool = new Proxy({} as Pool, {
  get(_target, property, receiver) {
    return Reflect.get(getPool(), property, receiver);
  },
});
