import { serve } from "@hono/node-server"
import { Hono } from "hono"
import "dotenv/config"
import { fetchRecentScores, fetchStudentProfile, fetchExamScoreById, fetchClassMaterials, fetchMaterialsByExam, upsertStudentProfile } from "./db.js"
import { generateOverview } from "./llm.js"

const app = new Hono()

app.get("/", (c) => c.text("overview-ai up"))

// Pub/Sub push compatible endpoint
app.post("/sub", async (c) => {
  const raw = await c.req.json<any>().catch(() => null)
  if (!raw) return c.json({ message: "Invalid payload" }, 400)
  const decoded = raw?.message?.data
    ? JSON.parse(Buffer.from(raw.message.data, "base64").toString())
    : raw

  const studentId = decoded?.studentId as string | undefined
  const examId = decoded?.examId as string | undefined
  if (!studentId) return c.json({ message: "Missing studentId" }, 400)

  try {
    const profile = await fetchStudentProfile(studentId)
    // In early runs, student_profiles may not exist yet. Proceed with sensible defaults.
    const baseProfile =
      profile ?? ({
        id: studentId,
        name: decoded?.studentName ?? "Student",
        overview: null,
        strengths: null,
        challenges: null,
      } as const)
    // Prefer the specific exam result related to this event
    let recents: Array<{ title: string; score: number; feedback?: string | null }> = []
    if (examId) {
      const row = await fetchExamScoreById(studentId, examId)
      if (row) {
        recents = [
          { title: row.title, score: Number(row.score ?? 0), feedback: row.feedback },
        ]
      }
    }

    const materials = examId ? await fetchMaterialsByExam(examId) : []

    const ai = await generateOverview({
      studentName: baseProfile.name,
      previous: {
        overview: baseProfile.overview,
        strengths: baseProfile.strengths,
        challenges: baseProfile.challenges,
      },
      recent: recents,
      materials: materials.map((m) => ({ title: m.title, content: m.content ?? undefined })),
    })

    await upsertStudentProfile({
      studentId: baseProfile.id,
      name: baseProfile.name,
      overview: ai.overview || baseProfile.overview || "",
      strengths: ai.strengths.length ? ai.strengths : baseProfile.strengths ?? [],
      challenges: ai.challenges.length ? ai.challenges : baseProfile.challenges ?? [],
    })

    return c.text("OK")
  } catch (error) {
    console.error("[overview-ai] failed", error)
    return c.json({ message: "Failed" }, 500)
  }
})

// Optional manual trigger 
app.post("/gen", async (c) => {
  const body = await c.req.json<{ studentId?: string }>().catch(() => null)
  if (!body?.studentId) return c.json({ message: "studentId required" }, 400)
  return app.request("/sub", { method: "POST", body: JSON.stringify({ studentId: body.studentId }) })
})

serve({ fetch: app.fetch, port: Number(process.env.PORT ?? 3003) })
