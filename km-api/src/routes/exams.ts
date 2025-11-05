import { Hono } from "hono"
import { sql } from "../db"

const exams = new Hono()

exams.get("/:examId", async (c) => {
  const examId = c.req.param("examId")

  try {
    const rows =
      await sql`select id, title, description, exam_date as "date", duration from exams where id = ${examId} limit 1`

    if (!rows.length) {
      return c.json({ message: "Exam not found" }, 404)
    }

    const exam = rows[0] as {
      id: string
      title: string
      description: string
      date: string
      duration: number
    }

    const studentRows =
      await sql`select st.id, st.name, coalesce(es.status, 'not-submitted') as status from students st left join exam_students es on es.student_id = st.id and es.exam_id = ${examId}`

    return c.json({
      ...exam,
      students: studentRows,
    })
  } catch (error) {
    console.error("[exams:detail] query failed", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

exams.post("/:examId/students/:studentId/upload", async (c) => {
  const examId = c.req.param("examId")
  const studentId = c.req.param("studentId")
  const formData = await c.req.parseBody()
  const file = formData["file"]

  if (!file) {
    return c.json({ message: "File is required" }, 400)
  }

  try {
    await sql`insert into exam_students (exam_id, student_id, status, answer_url) values (${examId}, ${studentId}, 'grading', '/uploads/${studentId}-${Date.now()}') on conflict (exam_id, student_id) do update set status = 'grading'`
    return c.json({ message: "Upload received" }, 201)
  } catch (error) {
    console.error("[exams:upload] insert failed", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

exams.get("/:examId/download", async (c) => {
  const examId = c.req.param("examId")
  try {
    const rows =
      await sql`select question_bundle_url from exams where id = ${examId}`
    const url = rows[0]?.question_bundle_url ?? "#"
    return c.json({ url })
  } catch (error) {
    console.error("[exams:download] query failed", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

exams.get("/:examId/students/:studentId/download", async (c) => {
  const examId = c.req.param("examId")
  const studentId = c.req.param("studentId")
  try {
    const rows =
      await sql`select answer_url from exam_students where exam_id = ${examId} and student_id = ${studentId}`
    const url = rows[0]?.answer_url ?? "#"
    return c.json({ url })
  } catch (error) {
    console.error("[exams:student:download] query failed", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

export default exams
