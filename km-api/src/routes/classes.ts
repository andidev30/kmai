import { Hono } from "hono"
import { sql } from "../db.js"
import { requireAuth, type AuthVariables } from "../middleware/auth.js"
import {
  deleteMaterialFile,
  uploadMaterialFile,
  type StoredMaterialFile,
  type UploadableMaterialFile,
} from "../lib/gcs.js"
import { publishExamMessage, publishMaterialMessage } from "../lib/pubsub.js"

const classes = new Hono<{ Variables: AuthVariables }>()

classes.use("*", requireAuth)

classes.get("/", async (c) => {
  const userId = c.get("authUserId")
  try {
    const rows =
      await sql`select id, name, subject from classes where created_by = ${userId} order by created_at desc`
    return c.json({ items: rows })
  } catch (error) {
    console.error("[classes:list] database query failed", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

classes.post("/", async (c) => {
  const body = await c.req.json<{ name?: string; subject?: string }>()
  if (!body.name || !body.subject) {
    return c.json({ message: "Name and subject are required" }, 400)
  }

  const userId = c.get("authUserId")

  try {
    const rows =
      await sql`insert into classes (name, subject, created_by) values (${body.name}, ${body.subject}, ${userId}) returning id, name, subject`
    return c.json(rows[0], 201)
  } catch (error) {
    console.error("[classes:create] insert failed", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

classes.get("/:classId", async (c) => {
  const classId = c.req.param("classId")
  const userId = c.get("authUserId")

  try {
    const rows =
      await sql`select id, name, subject, description from classes where id = ${classId} and created_by = ${userId} limit 1`
    if (!rows.length) {
      return c.json({ message: "Class not found" }, 404)
    }
    return c.json(rows[0])
  } catch (error) {
    console.error("[classes:detail] query failed", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

classes.get("/:classId/students", async (c) => {
  const classId = c.req.param("classId")
  const userId = c.get("authUserId")
  try {
    const ownsClass =
      await sql`select 1 from classes where id = ${classId} and created_by = ${userId} limit 1`
    if (!ownsClass.length) {
      return c.json({ message: "Class not found" }, 404)
    }

    const rows =
      await sql`select id, name, student_code as "studentId", email, gender, phone from students where class_id = ${classId} and created_by = ${userId} order by created_at desc`
    return c.json({ items: rows })
  } catch (error) {
    console.error("[classes:students:list] query failed", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

classes.post("/:classId/students", async (c) => {
  const classId = c.req.param("classId")
  const userId = c.get("authUserId")
  const body = await c.req.json<{
    name?: string
    email?: string
    studentId?: string
    gender?: string
    phone?: string
  }>()

  if (!body.name || !body.email || !body.studentId) {
    return c.json({ message: "Name, email, and studentId are required" }, 400)
  }

  try {
    const ownsClass =
      await sql`select 1 from classes where id = ${classId} and created_by = ${userId} limit 1`
    if (!ownsClass.length) {
      return c.json({ message: "Class not found" }, 404)
    }

    const rows =
      await sql`insert into students (class_id, name, email, student_code, gender, phone, created_by) values (${classId}, ${body.name}, ${body.email}, ${body.studentId}, ${body.gender ?? null}, ${body.phone ?? null}, ${userId}) returning id`
    return c.json({ id: rows[0]?.id }, 201)
  } catch (error) {
    console.error("[classes:students:create] insert failed", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

classes.get("/:classId/materials", async (c) => {
  const classId = c.req.param("classId")
  const userId = c.get("authUserId")
  try {
    const ownsClass =
      await sql`select 1 from classes where id = ${classId} and created_by = ${userId} limit 1`
    if (!ownsClass.length) {
      return c.json({ message: "Class not found" }, 404)
    }

    const rows =
      await sql`select id, title, description, files, status from materials where class_id = ${classId} and created_by = ${userId} order by created_at desc`
    return c.json({ items: rows })
  } catch (error) {
    console.error("[classes:materials:list] query failed", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

classes.post("/:classId/materials", async (c) => {
  const classId = c.req.param("classId")
  const userId = c.get("authUserId")
  const formData = await c.req.formData()

  const getString = (key: string) => {
    const value = formData.get(key)
    return typeof value === "string" ? value : undefined
  }

  const title = getString("title")
  const description = getString("description")
  const dateStart = getString("dateStart")
  const dateEnd = getString("dateEnd")

  const fileEntries = [...formData.getAll("files"), ...formData.getAll("file")]
  const normalizedFiles: UploadableMaterialFile[] = []
  for (const entry of fileEntries) {
    if (entry && typeof entry === "object" && "arrayBuffer" in entry && typeof entry.arrayBuffer === "function") {
      normalizedFiles.push(entry as UploadableMaterialFile)
    }
  }

  if (!title || normalizedFiles.length === 0) {
    return c.json({ message: "Title and at least one file are required" }, 400)
  }

  try {
    const ownsClass =
      await sql`select 1 from classes where id = ${classId} and created_by = ${userId} limit 1`
    if (!ownsClass.length) {
      return c.json({ message: "Class not found" }, 404)
    }

    const uploadedFiles: Array<StoredMaterialFile & { objectPath: string }> = []
    try {
      for (const file of normalizedFiles) {
        const uploaded = await uploadMaterialFile(file, { classId })
        uploadedFiles.push(uploaded)
      }
    } catch (uploadError) {
      await Promise.all(
        uploadedFiles.map((meta) => deleteMaterialFile(meta.gcsUri).catch(() => undefined)),
      )
      console.error("[classes:materials:create] upload failed", uploadError)
      return c.json({ message: "Failed to upload files" }, 500)
    }

    const filesToPersist: StoredMaterialFile[] = uploadedFiles.map(
      ({ gcsUri, mimeType, name, uri }) => ({ gcsUri, mimeType, name, uri }),
    )

    let createdMaterial:
      | {
          id: string
          status: string
        }
      | undefined
    try {
      const rows =
        await sql<{ id: string; status: string }[]>`insert into materials (class_id, title, description, files, date_start, date_end, created_by) values (${classId}, ${title}, ${description ?? null}, ${sql.json(filesToPersist)}, ${dateStart ?? null}, ${dateEnd ?? null}, ${userId}) returning id, status`
      createdMaterial = rows[0]
    } catch (dbError) {
      await Promise.all(filesToPersist.map((meta) => deleteMaterialFile(meta.gcsUri)))
      throw dbError
    }

    const responsePayload = {
      id: createdMaterial?.id,
      status: "pending" as const,
      files: filesToPersist,
    }

    if (createdMaterial?.id) {
      publishMaterialMessage({
        materialId: createdMaterial.id,
        classId,
        gcsUris: filesToPersist.map((file) => file.gcsUri),
      }).catch((error) => {
        console.error("[classes:materials:create] failed to publish pubsub message", error)
      })
    }

    return c.json(responsePayload, 201)
  } catch (error) {
    console.error("[classes:materials:create] insert failed", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

classes.get("/:classId/exams", async (c) => {
  const classId = c.req.param("classId")
  const userId = c.get("authUserId")
  try {
    const ownsClass =
      await sql`select 1 from classes where id = ${classId} and created_by = ${userId} limit 1`
    if (!ownsClass.length) {
      return c.json({ message: "Class not found" }, 404)
    }

    const rows =
      await sql`select id, title, exam_date as "date", duration, status, unique_per_student as "uniquePerStudent" from exams where class_id = ${classId} order by created_at desc`
    return c.json({ items: rows })
  } catch (error) {
    console.error("[classes:exams:list] query failed", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

classes.post("/:classId/exams", async (c) => {
  const classId = c.req.param("classId")
  const userId = c.get("authUserId")
  const body = await c.req.json<{
    title?: string
    materialIds?: string[]
    mcq?: number
    essay?: number
    uniquePerStudent?: boolean
  }>()

  const materialIds = Array.from(new Set(body.materialIds ?? [])).filter(Boolean)
  if (!materialIds.length) {
    return c.json({ message: "At least one material must be selected" }, 400)
  }

  const mcq = Number(body.mcq ?? 0)
  const essay = Number(body.essay ?? 0)
  if (!Number.isFinite(mcq) || !Number.isFinite(essay) || mcq < 0 || essay < 0) {
    return c.json({ message: "mcq and essay must be positive numbers" }, 400)
  }
  if (mcq + essay <= 0) {
    return c.json({ message: "At least one question must be requested" }, 400)
  }

  const uniquePerStudent = Boolean(body.uniquePerStudent)
  const title = typeof body.title === "string" ? body.title.trim() : ""
  if (!title) {
    return c.json({ message: "Title is required" }, 400)
  }

  try {
    const ownsClass =
      await sql`select 1 from classes where id = ${classId} and created_by = ${userId} limit 1`
    if (!ownsClass.length) {
      return c.json({ message: "Class not found" }, 404)
    }

    const settings = {
      materialIds,
      mcq,
      essay,
      uniquePerStudent,
    }

    const rows =
      await sql<{ id: string; status: string; uniquePerStudent: boolean }[]>`insert into exams (class_id, title, exam_date, duration, unique_per_student) values (${classId}, ${title}, now(), 90, ${uniquePerStudent}) returning id, status, unique_per_student as "uniquePerStudent"`
    const exam = rows[0]

    if (exam?.id) {
      // persist mapping exam -> materials
      if (materialIds.length) {
        await sql`
          insert into exam_materials (exam_id, material_id)
          select ${exam.id}::uuid, m.id
            from materials m
           where m.id = any(${sql.array(materialIds)}::uuid[])
             and m.class_id = ${classId}
          on conflict do nothing`
      }
      publishExamMessage({
        examId: exam.id,
        classId,
        materialIds,
        settings: {
          mcq,
          essay,
          uniquePerStudent,
        },
      }).catch((error) =>
        console.error("[classes:exams:create] failed to publish exam message", error),
      )
    }

    return c.json(
      {
        id: exam?.id,
        status: exam?.status ?? "pending",
        uniquePerStudent: exam?.uniquePerStudent ?? uniquePerStudent,
      },
      201,
    )
  } catch (error) {
    console.error("[classes:exams:create] insert failed", error)
    return c.json({ message: "Internal server error" }, 500)
  }
})

export default classes
