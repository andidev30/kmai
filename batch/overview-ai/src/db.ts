import { Pool } from "pg"

const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL, max: Number(process.env.DB_POOL_MAX ?? 5) })
  : new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      max: Number(process.env.DB_POOL_MAX ?? 5),
    })

export async function fetchStudentProfile(studentId: string) {
  const { rows } = await pool.query(
    `select st.id,
            st.name,
            st.class_id as classId,
            sp.overview,
            sp.strengths,
            sp.challenges
       from students st
  left join student_profiles sp on sp.id = st.id
      where st.id = $1::uuid
      limit 1`,
    [studentId],
  )
  return rows[0] as
    | {
        id: string
        name: string
        classId: string
        overview: string | null
        strengths: string[] | null
        challenges: string[] | null
      }
    | undefined
}

export async function fetchRecentScores(studentId: string, limit = 5) {
  const { rows } = await pool.query(
    `select e.title,
            es.score,
            es.feedback,
            es.graded_at
       from exam_students es
  inner join exams e on e.id = es.exam_id
      where es.student_id = $1::uuid and es.score is not null
      order by es.graded_at desc nulls last, e.created_at desc
      limit $2`,
    [studentId, limit],
  )
  return rows as Array<{ title: string; score: number; feedback: string | null; graded_at: string | null }>
}

export async function fetchExamScoreById(studentId: string, examId: string) {
  const { rows } = await pool.query(
    `select e.title,
            es.score,
            es.feedback,
            es.graded_at
       from exam_students es
  inner join exams e on e.id = es.exam_id
      where es.student_id = $1::uuid and es.exam_id = $2::uuid
      limit 1`,
    [studentId, examId],
  )
  return rows[0] as { title: string; score: number | null; feedback: string | null; graded_at: string | null } | undefined
}

export async function upsertStudentProfile({
  studentId,
  name,
  overview,
  strengths,
  challenges,
}: {
  studentId: string
  name: string
  overview: string
  strengths: string[]
  challenges: string[]
}) {
  await pool.query(
    `insert into student_profiles (id, name, overview, strengths, challenges)
     values ($1::uuid, $2, $3, $4::text[], $5::text[])
     on conflict (id) do update set name = excluded.name, overview = excluded.overview, strengths = excluded.strengths, challenges = excluded.challenges`,
    [studentId, name, overview, strengths, challenges],
  )
}

export async function closePool() {
  await pool.end()
}

export async function fetchClassMaterials(classId: string, limit = 3) {
  const { rows } = await pool.query(
    `select title, content
       from materials
      where class_id = $1::uuid
      order by created_at desc
      limit $2`,
    [classId, limit],
  )
  return rows as Array<{ title: string; content: string | null }>
}

export async function fetchMaterialsByExam(examId: string) {
  const { rows } = await pool.query(
    `select m.title, m.content
       from exam_materials em
  inner join materials m on m.id = em.material_id
      where em.exam_id = $1::uuid
      order by m.created_at desc`,
    [examId],
  )
  return rows as Array<{ title: string; content: string | null }>
}
