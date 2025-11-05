import { Hono } from "hono"
import { sql } from "../db"
import { mockStudents } from "./classes"

const exams = new Hono()

const mockExamDetails: Record<
  string,
  {
    id: string
    title: string
    description: string
    date: string
    duration: number
    students: Array<{ id: string; name: string; status: "graded" | "grading" | "not-submitted" }>
  }
> = {
  "1": {
    id: "1",
    title: "Midterm Exam",
    description: "Covers chapters 1-6 with a focus on core problem-solving skills.",
    date: "2025-11-15",
    duration: 90,
    students: [
      { id: "1", name: "Alice Smith", status: "graded" },
      { id: "2", name: "Bob Johnson", status: "grading" },
      { id: "3", name: "Charlie Brown", status: "not-submitted" },
    ],
  },
  "2": {
    id: "2",
    title: "Final Exam",
    description: "Comprehensive assessment over the entire semester.",
    date: "2025-12-15",
    duration: 120,
    students: [
      { id: "1", name: "Alice Smith", status: "graded" },
      { id: "2", name: "Bob Johnson", status: "grading" },
    ],
  },
}

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
    console.error("[exams:detail] fallback to mock data", error)
    return c.json(
      mockExamDetails[examId] ?? {
        id: examId,
        title: "Exam",
        description: "Exam description",
        date: new Date().toISOString().slice(0, 10),
        duration: 90,
        students: mockStudents.map((student) => ({
          id: student.id,
          name: student.name,
          status: "not-submitted" as const,
        })),
      },
    )
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
    console.error("[exams:upload] fallback response", error)
    return c.json({ message: "Upload stored (mock)" }, 201)
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
    console.error("[exams:download] fallback", error)
    return c.json({ url: "#" })
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
    console.error("[exams:student:download] fallback", error)
    return c.json({ url: "#" })
  }
})

export default exams
