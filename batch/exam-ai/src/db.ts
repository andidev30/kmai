import { Pool } from "pg"

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      max: Number(process.env.DB_POOL_MAX ?? 5),
    })
  : new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      max: Number(process.env.DB_POOL_MAX ?? 5),
    })

pool.on("error", (error: Error) => {
  console.error("[exam-ai][db] Unexpected error", error)
})

export type MaterialRecord = {
  id: string
  title: string
  content: string | null
}

export async function fetchMaterialsById(materialIds: string[]): Promise<MaterialRecord[]> {
  if (!materialIds.length) {
    return []
  }
  const { rows } = await pool.query<MaterialRecord>(
    `
      select id::text, title, content
      from materials
      where id = any($1::uuid[])
    `,
    [materialIds],
  )
  return rows
}

export type StudentRecord = {
  id: string
  name: string
  studentCode: string | null
}

export async function fetchStudentsByClass(classId: string): Promise<StudentRecord[]> {
  if (!classId) {
    return []
  }
  const { rows } = await pool.query<StudentRecord>(
    `
      select id::text, name, student_code as "studentCode"
      from students
      where class_id = $1::uuid
      order by created_at asc
    `,
    [classId],
  )
  return rows
}

export async function insertExamQuestion({
  examId,
  studentId,
  content,
}: {
  examId: string
  studentId?: string | null
  content: string
}) {
  const { rows } = await pool.query<{ id: string }>(
    `insert into exam_questions (exam_id, student_id, exam_content) values ($1::uuid, $2::uuid, $3) returning id`,
    [examId, studentId ?? null, content],
  )
  return rows[0]?.id
}

export async function upsertExamStudent({
  examId,
  studentId,
  questionId,
}: {
  examId: string
  studentId: string
  questionId: string
}) {
  await pool.query(
    `insert into exam_students (exam_id, student_id, exam_question_id)
     values ($1::uuid, $2::uuid, $3::uuid)
     on conflict (exam_id, student_id) do update
     set exam_question_id = excluded.exam_question_id,
         status = 'not-submitted'`,
    [examId, studentId, questionId],
  )
}

export async function markExamReady({
  examId,
  uniquePerStudent,
}: {
  examId: string
  uniquePerStudent: boolean
}) {
  await pool.query(
    `update exams set status = 'done', unique_per_student = $2 where id = $1::uuid`,
    [examId, uniquePerStudent],
  )
}

export async function closePool() {
  await pool.end()
}
