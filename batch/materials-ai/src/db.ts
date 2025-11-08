import { Pool } from "pg"

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      max: Number(process.env.DB_POOL_MAX ?? 5),
    })
  : new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      max: Number(process.env.DB_POOL_MAX ?? 5),
    })

pool.on("error", (error: Error) => {
  console.error("[db] Unexpected error", error)
})

export async function updateMaterialContent(materialId: string, content?: string | null) {
  if (!materialId) {
    throw new Error("materialId is required to update material content")
  }

  await pool.query(
    `update materials set content = $1, status = 'done' where id = $2`,
    [content ?? null, materialId],
  )
}

export async function closePool() {
  await pool.end()
}
