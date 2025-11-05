import postgres from "postgres"

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.warn("[km-api] DATABASE_URL is not set. API routes will use mock data.")
}

type SqlClient = ReturnType<typeof postgres>

export const sql: SqlClient = databaseUrl
  ? postgres(databaseUrl, {
      max: Number(process.env.DB_POOL_MAX ?? 10),
      prepare: false,
    })
  : (async () => {
      throw new Error("DATABASE_URL is required to execute queries")
    }) as unknown as SqlClient

export type { SqlClient }

export async function withTransaction<T>(callback: (client: SqlClient) => Promise<T>): Promise<T> {
  return sql.begin((trx) => callback(trx as SqlClient)) as Promise<T>
}
