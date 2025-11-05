import { Hono } from "hono"
import { sql } from "../db"

const materials = new Hono()

materials.get("/:materialId", async (c) => {
  const materialId = c.req.param("materialId")
  try {
    const rows =
      await sql`select id, title, description, content, file_url as "fileUrl", source, date_start as "dateStart", date_end as "dateEnd" from materials where id = ${materialId} limit 1`
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
