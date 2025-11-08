import { Hono } from "hono"
import { sql } from "../db.js"
import { requireAuth, type AuthVariables } from "../middleware/auth.js"

const students = new Hono<{ Variables: AuthVariables }>()

students.use("*", requireAuth)

students.get("/:studentId", async (c) => {
  const studentId = c.req.param("studentId")
  const userId = c.get("authUserId")

  try {
    const rows =
      await sql`
        select st.id,
               coalesce(sp.name, st.name) as name,
               coalesce(sp.overview, 'No overview provided') as overview,
               coalesce(sp.strengths, array[]::text[]) as strengths,
               coalesce(sp.challenges, array[]::text[]) as challenges
        from students st
        inner join classes c2 on c2.id = st.class_id
        left join student_profiles sp on sp.id = st.id
        where st.id = ${studentId} and c2.created_by = ${userId}
        limit 1`
    if (!rows.length) {
      return c.json({ message: "Student not found" }, 404)
    }

    const exams =
      await sql`
        select ses.id, ses.title, ses.summary, ses.details
        from student_exam_summaries ses
        inner join students st on st.id = ses.student_id
        inner join classes c2 on c2.id = st.class_id
        where ses.student_id = ${studentId} and c2.created_by = ${userId}
        order by ses.created_at desc`

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
