import { Hono } from "hono"
import { sql } from "../db"

const students = new Hono()

students.get("/:studentId", async (c) => {
  const studentId = c.req.param("studentId")

  try {
    const rows =
      await sql`select id, name, overview, strengths, challenges from student_profiles where id = ${studentId} limit 1`
    if (!rows.length) {
      return c.json({ message: "Student not found" }, 404)
    }

    const exams =
      await sql`select id, title, summary, details from student_exam_summaries where student_id = ${studentId} order by created_at desc`

    const row = rows[0] as {
      id: string
      name: string
      overview: string
      strengths: string[]
      challenges: string[]
    }

    return c.json({
      ...row,
      exams,
    })
  } catch (error) {
    console.error("[students:detail] query failed", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

export default students
