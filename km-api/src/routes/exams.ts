import { Hono } from "hono"
import JSZip from "jszip"
import PDFDocument from "pdfkit"
import { sql } from "../db.js"
import { requireAuth, type AuthVariables } from "../middleware/auth.js"

const exams = new Hono<{ Variables: AuthVariables }>()

exams.use("*", requireAuth)

exams.get("/:examId", async (c) => {
  const examId = c.req.param("examId")
  const userId = c.get("authUserId")

  try {
    const rows =
      await sql`
        select e.id,
               e.class_id as "classId",
               e.title,
               e.description,
               e.exam_date as "date",
               e.duration,
               e.status,
               e.unique_per_student as "uniquePerStudent"
        from exams e
        inner join classes c2 on c2.id = e.class_id
        where e.id = ${examId} and c2.created_by = ${userId}
        limit 1`

    if (!rows.length) {
      return c.json({ message: "Exam not found" }, 404)
    }

    const exam = rows[0] as {
      id: string
      classId: string
      title: string
      description: string | null
      date: string
      duration: number
      status: string
      uniquePerStudent: boolean
    }

    const sharedQuestionRows =
      await sql<{ id: string; content: string }[]>`
        select id, exam_content as "content"
        from exam_questions
        where exam_id = ${examId} and student_id is null
        order by created_at asc
        limit 1`

    const studentRows =
      await sql`
        select st.id,
               st.name,
               coalesce(es.status, 'not-submitted') as status,
               eq.id as "questionId",
               eq.exam_content as "questionContent"
        from students st
        inner join classes c2 on c2.id = st.class_id
        left join exam_students es on es.student_id = st.id and es.exam_id = ${examId}
        left join exam_questions eq on eq.id = es.exam_question_id
        where st.class_id = ${exam.classId} and c2.created_by = ${userId}`

    const { classId, ...examPayload } = exam

    return c.json({
      ...examPayload,
      uniquePerStudent: Boolean(exam.uniquePerStudent),
      sharedQuestion: sharedQuestionRows[0] ?? null,
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

    const answerUrl = `/uploads/${studentId}-${Date.now()}`
    await sql`
      insert into exam_students (exam_id, student_id, status, answer_url, answer_files)
      values (
        ${examId},
        ${studentId},
        'grading',
        ${answerUrl},
        jsonb_build_array(jsonb_build_object('uri', ${answerUrl}))
      )
      on conflict (exam_id, student_id) do update
      set status = 'grading',
          answer_url = excluded.answer_url,
          answer_files = excluded.answer_files
    `
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
    const examRows =
      await sql`
        select e.title, e.status
        from exams e
        inner join classes c2 on c2.id = e.class_id
        where e.id = ${examId} and c2.created_by = ${userId}`
    if (!examRows.length) {
      return c.json({ message: "Exam not found" }, 404)
    }
    const examRow = examRows[0] as { title: string | null; status: string }
    if (examRow.status !== "done") {
      return c.json({ message: "Exam is still being generated" }, 409)
    }

    const questionRows =
      await sql<
        {
          id: string
          content: string
          studentId: string | null
          studentName: string | null
        }[]
      >`
        select q.id,
               q.exam_content as "content",
               q.student_id as "studentId",
               st.name as "studentName"
        from exam_questions q
        left join students st on st.id = q.student_id
        where q.exam_id = ${examId}
      `

    if (!questionRows.length) {
      return c.json({ message: "Exam content unavailable" }, 404)
    }

    const assignments =
      await sql<
        {
          questionId: string
          studentId: string
          studentName: string | null
        }[]
      >`
        select es.exam_question_id as "questionId",
               st.id as "studentId",
               st.name as "studentName"
        from exam_students es
        left join students st on st.id = es.student_id
        inner join exams e on e.id = es.exam_id
        inner join classes c2 on c2.id = e.class_id
        where es.exam_id = ${examId} and c2.created_by = ${userId}
      `

    const files: Array<{ filename: string; content: string }> = []

    questionRows.forEach((row, index) => {
      const mappedStudents =
        row.studentId != null
          ? [
              {
                studentId: row.studentId,
                studentName: row.studentName,
              },
            ]
          : assignments
              .filter((assignment) => assignment.questionId === row.id)
              .map((assignment) => ({
                studentId: assignment.studentId,
                studentName: assignment.studentName,
              }))

      if (mappedStudents.length) {
        mappedStudents.forEach((assignment) => {
          const safeName = slugify(assignment.studentName || assignment.studentId)
          files.push({
            filename: `${safeName}-${row.id.slice(0, 8)}.md`,
            content: row.content,
          })
        })
      } else {
        const base = slugify(examRow.title || "exam")
        const suffix = questionRows.length > 1 ? `-${index + 1}` : ""
        files.push({
          filename: `${base}${suffix || ""}.md`,
          content: row.content,
        })
      }
    })

    const zip = new JSZip()
    files.forEach((file) => {
      zip.file(file.filename, file.content)
    })
    const archiveArray = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
    })

    const archiveName = `${slugify(examRow.title || "exam") || "exam"}-questions.zip`

    return new Response(archiveArray as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${archiveName}"`,
      },
    })
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

exams.get("/:examId/students/:studentId/exam", async (c) => {
  const examId = c.req.param("examId")
  const studentId = c.req.param("studentId")
  const userId = c.get("authUserId")
  try {
    const rows =
      await sql`
        select q.exam_content as "examContent"
        from exam_students es
        inner join exam_questions q on q.id = es.exam_question_id
        inner join exams e on e.id = es.exam_id
        inner join classes c2 on c2.id = e.class_id
        where es.exam_id = ${examId} and es.student_id = ${studentId} and c2.created_by = ${userId}
        limit 1`
    let content = rows[0]?.examContent
    if (!content) {
      const fallback =
        await sql`
          select exam_content as "examContent"
          from exam_questions q
          inner join exams e on e.id = q.exam_id
          inner join classes c2 on c2.id = e.class_id
          where q.exam_id = ${examId} and q.student_id is null and c2.created_by = ${userId}
          limit 1`
      content = fallback[0]?.examContent
    }
    if (!content) {
      return c.json({ message: "Exam content not found for student" }, 404)
    }
    return c.json({ content })
  } catch (error) {
    console.error("[exams:student:exam] query failed", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

exams.get("/:examId/students/:studentId/exam/download", async (c) => {
  const examId = c.req.param("examId")
  const studentId = c.req.param("studentId")
  const userId = c.get("authUserId")
  try {
    const rows =
      await sql`
        select q.exam_content as "examContent"
        from exam_students es
        inner join exam_questions q on q.id = es.exam_question_id
        inner join exams e on e.id = es.exam_id
        inner join classes c2 on c2.id = e.class_id
        where es.exam_id = ${examId} and es.student_id = ${studentId} and c2.created_by = ${userId}
        limit 1`
    let content = rows[0]?.examContent
    if (!content) {
      const fallback =
        await sql`
          select exam_content as "examContent"
          from exam_questions q
          inner join exams e on e.id = q.exam_id
          inner join classes c2 on c2.id = e.class_id
          where q.exam_id = ${examId} and q.student_id is null and c2.created_by = ${userId}
          limit 1`
      content = fallback[0]?.examContent
    }
    if (!content) {
      return c.json({ message: "Exam content not found for student" }, 404)
    }
    const pdfBuffer = await renderPdf(content, { title: "Paket Soal" })
    return new Response(pdfBuffer as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="exam-${studentId}.pdf"`,
      },
    })
  } catch (error) {
    console.error("[exams:student:exam:download] failed", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

function renderPdf(content: string, { title }: { title: string }): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 })
      const chunks: Buffer[] = []
      doc.on("data", (chunk) => chunks.push(chunk as Buffer))
      doc.on("end", () => {
        const buffer = Buffer.concat(chunks)
        resolve(buffer)
      })
      doc.on("error", (error) => reject(error))
      doc.fontSize(16).text(title, { align: "center" })
      doc.moveDown()
      const paragraphs = content.split(/\n{2,}/)
      paragraphs.forEach((block, index) => {
        doc.fontSize(11).text(block.trim())
        if (index < paragraphs.length - 1) {
          doc.moveDown()
        }
      })
      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50) || "exam"
}

export default exams
