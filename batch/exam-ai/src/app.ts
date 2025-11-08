import { serve } from "@hono/node-server"
import { Hono } from "hono"
import "dotenv/config"

import {
  fetchMaterialsById,
  fetchStudentsByClass,
  insertExamQuestion,
  markExamReady,
  upsertExamStudent,
} from "./db.js"
import { generate } from "./llm.js"

const app = new Hono()

app.get("/", (c) => c.text("exam-ai up"))

app.post("/sub", async (c) => {
  const rawBody = await c.req.json<any>().catch(() => null)

  if (!rawBody) {
    return c.json({ message: "Invalid payload" }, 400)
  }

  const decoded =
    rawBody?.message?.data != null
      ? JSON.parse(Buffer.from(rawBody.message.data, "base64").toString())
      : rawBody

  const examId = decoded?.examId
  const classId = decoded?.classId
  const materialIds: string[] = decoded?.materialIds ?? []
  type IncomingSettings = { mcq?: number; essay?: number; uniquePerStudent?: boolean }
  const settings: IncomingSettings | undefined = decoded?.settings

  if (
    typeof examId !== "string" ||
    typeof classId !== "string" ||
    !Array.isArray(materialIds) ||
    !settings ||
    typeof settings.mcq !== "number" ||
    typeof settings.essay !== "number"
  ) {
    return c.json({ message: "Payload missing examId, classId, materialIds, or settings" }, 400)
  }

  console.log(`[exam-ai] Received exam ${examId} for class ${classId}`)

  try {
    const materials = await fetchMaterialsById(materialIds)
    if (!materials.length) {
      console.warn("[exam-ai] No materials found for exam", examId)
      return c.json({ message: "Materials not found" }, 404)
    }

    const uniqueRequested = Boolean(settings.uniquePerStudent)
    const students = await fetchStudentsByClass(classId)
    if (uniqueRequested && students.length === 0) {
      console.warn(
        `[exam-ai] Unique exam requested for ${examId} but no students are enrolled in class ${classId}`,
      )
    }

    type GenerationSettings = { mcq: number; essay: number; uniquePerStudent: boolean }
    const effectiveSettings: GenerationSettings = {
      mcq: settings.mcq,
      essay: settings.essay,
      uniquePerStudent: uniqueRequested && students.length > 0,
    }

    const materialDigest = materials
      .map((material, index) => {
        const truncated = (material.content ?? "")
        return `Materi ${index + 1}: ${material.title}\n${truncated}`
      })
      .join("\n\n")

    const shouldGenerateUnique = effectiveSettings.uniquePerStudent && students.length > 0

    if (shouldGenerateUnique) {
      for (const student of students) {
        const content = await generateForTarget({
          materialDigest,
          targetName: student.name,
          pg: effectiveSettings.mcq,
          essay: effectiveSettings.essay,
        })
        const formatted = formatExamContent({
          examId,
          classId,
          content,
          settings: effectiveSettings,
          isUnique: true,
          targetName: student.name,
        })
        const questionId = await insertExamQuestion({
          examId,
          studentId: student.id,
          content: formatted,
        })
        if (!questionId) {
          throw new Error("Failed to store exam question")
        }
        await upsertExamStudent({
          examId,
          studentId: student.id,
          questionId,
        })
      }
      await markExamReady({ examId, uniquePerStudent: true })
    } else {
      const content = await generateForTarget({
        materialDigest,
        pg: effectiveSettings.mcq,
        essay: effectiveSettings.essay,
      })
      const formatted = formatExamContent({
        examId,
        classId,
        content,
        settings: effectiveSettings,
        isUnique: false,
      })
      const questionId = await insertExamQuestion({
        examId,
        content: formatted,
      })
      if (!questionId) {
        throw new Error("Failed to store exam question")
      }
      await Promise.all(
        students.map((student) =>
          upsertExamStudent({
            examId,
            studentId: student.id,
            questionId,
          }),
        ),
      )
      await markExamReady({ examId, uniquePerStudent: false })
    }
    console.log(`[exam-ai] Stored questions for exam ${examId}`)

    return c.text("OK")
  } catch (error) {
    console.error("[exam-ai] Failed to generate exam", error)
    return c.json({ message: "Failed to generate exam" }, 500)
  }
})

serve({
  fetch: app.fetch,
  port: Number(process.env.PORT ?? 3001),
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})

async function generateForTarget({
  materialDigest,
  targetName,
  pg,
  essay,
}: {
  materialDigest: string
  targetName?: string
  pg: number
  essay: number
}) {
  const personalizedMaterial = targetName
    ? `${materialDigest}\n\nTarget siswa: ${targetName}`
    : materialDigest
  const content = await generate(personalizedMaterial, pg, essay)
  if (!content) {
    throw new Error("LLM returned empty exam content")
  }
  return content.trim()
}

type FormatArgs = {
  examId: string
  classId: string
  content: string
  settings: { mcq: number; essay: number; uniquePerStudent: boolean }
  isUnique: boolean
  targetName?: string
}

function formatExamContent({
  examId,
  classId,
  content,
  settings,
  isUnique,
  targetName,
}: FormatArgs): string {
  const lines: string[] = []
  lines.push("# Exam Questions")
  lines.push("")
  lines.push("Metadata:")
  lines.push(`- Exam ID: ${examId}`)
  lines.push(`- Class ID: ${classId}`)
  lines.push(`- Target: ${targetName ?? "Seluruh siswa"}`)
  lines.push(`- Dibuat pada: ${new Date().toLocaleString("id-ID")}`)
  lines.push(`- Jumlah PG: ${settings.mcq}`)
  lines.push(`- Jumlah Esai: ${settings.essay}`)
  lines.push(`- Mode: ${isUnique ? "Unik per siswa" : "Sama untuk semua"}`)
  lines.push("")
  lines.push(content.trim())
  return lines.join("\n").trim()
}

