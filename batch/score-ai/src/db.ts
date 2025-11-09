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

export async function fetchStudentAnswerAndQuestion(examId: string, studentId: string) {
  const { rows } = await pool.query(
    `select es.answer_files,
            eq.exam_content as question
       from exam_students es
       left join exam_questions eq on eq.id = es.exam_question_id
      where es.exam_id = $1::uuid and es.student_id = $2::uuid
      limit 1`,
    [examId, studentId],
  )
  return rows[0] as { answer_files: Array<{ uri: string }>; question: string | null } | undefined
}

export async function updateStudentScore({
  examId,
  studentId,
  score,
  feedback,
}: {
  examId: string
  studentId: string
  score: number
  feedback: string
}) {
  await pool.query(
    `update exam_students
        set status = 'graded',
            score = $3,
            feedback = $4,
            graded_at = now()
      where exam_id = $1::uuid and student_id = $2::uuid`,
    [examId, studentId, score, feedback],
  )
}

export async function closePool() {
  await pool.end()
}

