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

    const examsFromScores =
      await sql`
        select e.id,
               e.title,
               ('Score: ' || es.score || '/100')::text as summary,
               coalesce(es.feedback, '') as details
        from exam_students es
        inner join exams e on e.id = es.exam_id
        inner join classes c2 on c2.id = e.class_id
        where es.student_id = ${studentId}
          and c2.created_by = ${userId}
          and es.score is not null
        order by e.created_at desc`

    const row = rows[0] as {
      id: string
      name: string
      overview: string
      strengths: string[]
      challenges: string[]
    }

    const statsRows = await sql`
      select count(*)::int as "gradedCount",
             coalesce(round(avg(es.score))::int, 0) as "avgScore"
        from exam_students es
  inner join exams e on e.id = es.exam_id
  inner join classes c2 on c2.id = e.class_id
       where es.student_id = ${studentId}
         and c2.created_by = ${userId}
         and es.score is not null`
    const stats = (statsRows[0] ?? { gradedCount: 0, avgScore: 0 }) as {
      gradedCount: number
      avgScore: number
    }

    return c.json({
      ...row,
      exams: examsFromScores,
      gradedCount: stats.gradedCount,
      avgScore: stats.avgScore,
    })
  } catch (error) {
    console.error("[students:detail] query failed", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

export default students
