import postgres from "postgres";

const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;
const dbName = process.env.DB_NAME;
const dbPort = process.env.DB_PORT;

const useDatabaseUrl = !!process.env.DATABASE_URL;

type SqlClient = ReturnType<typeof postgres>;

export const sql: SqlClient = useDatabaseUrl
  ? postgres(process.env.DATABASE_URL!, {
      max: Number(process.env.DB_POOL_MAX ?? 10),
      prepare: false,
    })
  : postgres({
      host: dbHost,
      user: dbUser,
      password: dbPass,
      database: dbName,
      port: Number(dbPort ?? 5432),
      max: Number(process.env.DB_POOL_MAX ?? 10),
      prepare: false,
    });

export type { SqlClient };

// Transaction helper
export async function withTransaction<T>(
  callback: (client: SqlClient) => Promise<T>
): Promise<T> {
  return sql.begin((trx) => callback(trx as SqlClient)) as Promise<T>;
}
