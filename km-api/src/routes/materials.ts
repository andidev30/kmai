import { Hono } from "hono"
import { sql } from "../db.js"
import { requireAuth, type AuthVariables } from "../middleware/auth.js"

const materials = new Hono<{ Variables: AuthVariables }>()

materials.use("*", requireAuth)

materials.get("/:materialId", async (c) => {
  const materialId = c.req.param("materialId")
  const userId = c.get("authUserId")
  try {
    const rows =
      await sql`select m.id, m.title, m.description, m.content, m.files, m.status, m.date_start as "dateStart", m.date_end as "dateEnd"
        from materials m
        inner join classes c2 on c2.id = m.class_id
        where m.id = ${materialId} and c2.created_by = ${userId}
        limit 1`
    if (!rows.length) {
      return c.json({ message: "Material not found" }, 404)
    }
    return c.json(rows[0])
  } catch (error) {
    console.error("[materials:detail] query failed", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

export default materials
