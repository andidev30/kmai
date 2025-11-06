import { Hono } from "hono"
import { sql } from "../db"

const classes = new Hono()

classes.get("/", async (c) => {
  try {
    const rows = await sql`select id, name, subject from classes order by created_at desc`
    return c.json({ items: rows })
  } catch (error) {
    console.error("[classes:list] database query failed", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

classes.post("/", async (c) => {
  const body = await c.req.json<{ name?: string; subject?: string }>()
  if (!body.name || !body.subject) {
    return c.json({ message: "Name and subject are required" }, 400)
  }

  try {
    const rows =
      await sql`insert into classes (name, subject) values (${body.name}, ${body.subject}) returning id, name, subject`
    return c.json(rows[0], 201)
  } catch (error) {
    console.error("[classes:create] insert failed", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

classes.get("/:classId", async (c) => {
  const classId = c.req.param("classId")

  try {
    const rows =
      await sql`select id, name, subject, description from classes where id = ${classId} limit 1`
    if (!rows.length) {
      return c.json({ message: "Class not found" }, 404)
    }
    return c.json(rows[0])
  } catch (error) {
    console.error("[classes:detail] query failed", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

classes.get("/:classId/students", async (c) => {
  const classId = c.req.param("classId")
  try {
    const rows =
      await sql`select id, name, student_code as "studentId", email, gender, phone from students where class_id = ${classId} order by created_at desc`
    return c.json({ items: rows })
  } catch (error) {
    console.error("[classes:students:list] query failed", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

classes.post("/:classId/students", async (c) => {
  const classId = c.req.param("classId")
  const body = await c.req.json<{
    name?: string
    email?: string
    studentId?: string
    gender?: string
    phone?: string
  }>()

  if (!body.name || !body.email || !body.studentId) {
    return c.json({ message: "Name, email, and studentId are required" }, 400)
  }

  try {
    const rows =
      await sql`insert into students (class_id, name, email, student_code, gender, phone) values (${classId}, ${body.name}, ${body.email}, ${body.studentId}, ${body.gender ?? null}, ${body.phone ?? null}) returning id`
    return c.json({ id: rows[0]?.id }, 201)
  } catch (error) {
    console.error("[classes:students:create] insert failed", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

classes.get("/:classId/materials", async (c) => {
  const classId = c.req.param("classId")
  try {
    const rows =
      await sql`select id, title, description, file_url as "fileUrl" from materials where class_id = ${classId} order by created_at desc`
    return c.json({ items: rows })
  } catch (error) {
    console.error("[classes:materials:list] query failed", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

classes.post("/:classId/materials", async (c) => {
  const classId = c.req.param("classId")
  const formData = await c.req.parseBody()
  const title = typeof formData["title"] === "string" ? formData["title"] : undefined
  const description = typeof formData["description"] === "string" ? formData["description"] : undefined
  const file = formData["file"]
  const dateStart = typeof formData["dateStart"] === "string" ? formData["dateStart"] : undefined
  const dateEnd = typeof formData["dateEnd"] === "string" ? formData["dateEnd"] : undefined
  const source = typeof formData["source"] === "string" ? formData["source"].trim() : ""

  if (!title || !file) {
    return c.json({ message: "Title and file are required" }, 400)
  }

  const fileUrl =
    typeof file === "string"
      ? file
      : file && "name" in file
        ? `/uploads/${Date.now()}-${file.name}`
        : "#"

  try {
    const rows =
      await sql`insert into materials (class_id, title, description, file_url, source, date_start, date_end) values (${classId}, ${title}, ${description ?? null}, ${fileUrl}, ${source || "Uploaded material"}, ${dateStart ?? null}, ${dateEnd ?? null}) returning id`
    return c.json({ id: rows[0]?.id }, 201)
  } catch (error) {
    console.error("[classes:materials:create] insert failed", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

classes.get("/:classId/exams", async (c) => {
  const classId = c.req.param("classId")
  try {
    const rows =
      await sql`select id, title, exam_date as "date", duration from exams where class_id = ${classId} order by exam_date desc`
    return c.json({ items: rows })
  } catch (error) {
    console.error("[classes:exams:list] query failed", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

classes.post("/:classId/exams", async (c) => {
  const classId = c.req.param("classId")
  const body = await c.req.json<{
    materialIds?: string[]
    mcq?: number
    essay?: number
    uniquePerStudent?: boolean
  }>()

  if (!body.materialIds?.length) {
    return c.json({ message: "At least one material must be selected" }, 400)
  }

  try {
    const rows =
      await sql`insert into exams (class_id, title, exam_date, duration, payload) values (${classId}, 'Generated Exam', now(), 90, ${JSON.stringify(body)}) returning id`
    return c.json({ id: rows[0]?.id }, 201)
  } catch (error) {
    console.error("[classes:exams:create] insert failed", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

export default classes
