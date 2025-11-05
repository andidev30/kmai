import { Hono } from "hono"
import { sql } from "../db"

const students = new Hono()

const mockProfiles = {
  "1": {
    id: "1",
    name: "Alice Smith",
    overview:
      "Alice is an enthusiastic learner who participates actively in class discussions and consistently meets assignment deadlines.",
    strengths: [
      "Demonstrates a solid grasp of foundational concepts",
      "High engagement during collaborative work",
      "Delivers clear and concise written answers",
    ],
    challenges: [
      "Occasionally rushes through multiple-choice questions",
      "Benefits from additional practice on advanced problem-solving exercises",
    ],
    exams: [
      {
        id: "exam-1",
        title: "Midterm Exam",
        summary: "Overall score: 92 — excels in algebraic reasoning and structured answers.",
        details:
          "Alice showed excellent performance in algebraic manipulation, word problems, and data interpretation. Minor deductions were made on time management during the last section.",
      },
      {
        id: "exam-2",
        title: "Quiz 2",
        summary: "Overall score: 88 — strong analytical approach with minor accuracy slips.",
        details:
          "Most answers were correct with well-explained steps. Two geometry questions had calculation slips, which can be improved with additional checking time.",
      },
    ],
  },
  "2": {
    id: "2",
    name: "Bob Johnson",
    overview:
      "Bob is a steady performer who prefers working through problems methodically. He thrives when provided with structured guidance.",
    strengths: [
      "Careful and methodical approach to problem solving",
      "Consistent improvement across practice sessions",
      "Strong collaboration skills in group assignments",
    ],
    challenges: [
      "Tends to second-guess correct answers",
      "Needs reminders to summarize reasoning in open-ended questions",
    ],
    exams: [
      {
        id: "exam-1",
        title: "Midterm Exam",
        summary: "Overall score: 85 — reliable performance with opportunities in applied questions.",
        details:
          "Bob performed well on conceptual questions and demonstrated solid understanding. Applied scenarios required additional clarification which can be addressed with targeted practice.",
      },
    ],
  },
}

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
    console.error("[students:detail] fallback to mock data", error)
    return c.json(
      mockProfiles[studentId] ?? {
        id: studentId,
        name: "Student",
        overview: "Profile information is not available.",
        strengths: [],
        challenges: [],
        exams: [],
      },
    )
  }
})

export default students
