import { Hono } from "hono"
import { sql } from "../db"
import { requireAuth, type AuthVariables } from "../middleware/auth.js"

const exams = new Hono<{ Variables: AuthVariables }>()

exams.use("*", requireAuth)

exams.get("/:examId", async (c) => {
  const examId = c.req.param("examId")
  const userId = c.get("authUserId")

  try {
    const rows =
      await sql`
        select e.id, e.title, e.description, e.exam_date as "date", e.duration
        from exams e
        inner join classes c2 on c2.id = e.class_id
        where e.id = ${examId} and c2.created_by = ${userId}
        limit 1`

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
      await sql`
        select st.id,
               st.name,
               coalesce(es.status, 'not-submitted') as status
        from students st
        inner join classes c2 on c2.id = st.class_id
        left join exam_students es on es.student_id = st.id and es.exam_id = ${examId}
        where c2.created_by = ${userId}`

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
  const userId = c.get("authUserId")
  const formData = await c.req.parseBody()
  const file = formData["file"]

  if (!file) {
    return c.json({ message: "File is required" }, 400)
  }

  try {
    const hasAccess =
      await sql`
        select 1
        from exams e
        inner join classes c2 on c2.id = e.class_id
        inner join students st on st.id = ${studentId} and st.class_id = e.class_id
        where e.id = ${examId} and c2.created_by = ${userId}
        limit 1`
    if (!hasAccess.length) {
      return c.json({ message: "Exam or student not found" }, 404)
    }

    await sql`insert into exam_students (exam_id, student_id, status, answer_url) values (${examId}, ${studentId}, 'grading', '/uploads/${studentId}-${Date.now()}') on conflict (exam_id, student_id) do update set status = 'grading'`
    return c.json({ message: "Upload received" }, 201)
  } catch (error) {
    console.error("[exams:upload] insert failed", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

exams.get("/:examId/download", async (c) => {
  const examId = c.req.param("examId")
  const userId = c.get("authUserId")
  try {
    const rows =
      await sql`
        select question_bundle_url
        from exams e
        inner join classes c2 on c2.id = e.class_id
        where e.id = ${examId} and c2.created_by = ${userId}`
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
  const userId = c.get("authUserId")
  try {
    const rows =
      await sql`
        select es.answer_url
        from exam_students es
        inner join exams e on e.id = es.exam_id
        inner join classes c2 on c2.id = e.class_id
        where es.exam_id = ${examId} and es.student_id = ${studentId} and c2.created_by = ${userId}`
    const url = rows[0]?.answer_url ?? "#"
    return c.json({ url })
  } catch (error) {
    console.error("[exams:student:download] query failed", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

export default exams
