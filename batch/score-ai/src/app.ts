import { serve } from "@hono/node-server"
import { Hono } from "hono"
import "dotenv/config"
import { fetchStudentAnswerAndQuestion, updateStudentScore } from "./db.js"
import { score } from "./llm.js"
import { publishStudentOverviewMessage } from "./pubsub.js"

const app = new Hono()

app.get("/", (c) => c.text("score-ai up"))

app.post("/sub", async (c) => {
  const raw = await c.req.json<any>().catch(() => null)
  if (!raw) return c.json({ message: "Invalid payload" }, 400)
  const decoded = raw?.message?.data
    ? JSON.parse(Buffer.from(raw.message.data, "base64").toString())
    : raw

  const examId = decoded?.examId as string | undefined
  const studentId = decoded?.studentId as string | undefined
  if (!examId || !studentId) return c.json({ message: "Missing examId or studentId" }, 400)

  try {
    const row = await fetchStudentAnswerAndQuestion(examId, studentId)
    if (!row || !row.question) return c.json({ message: "No question/answer to score" }, 404)

    const answerFiles: Array<{ uri: string; mimeType?: string }> = Array.isArray(row.answer_files)
      ? row.answer_files
          .map((f: any) => ({ uri: f?.gcsUri ?? f?.uri, mimeType: f?.mimeType }))
          .filter((f) => typeof f.uri === "string" && f.uri.length > 0)
      : []
    const result = await score({ question: row.question, files: answerFiles })
    await updateStudentScore({ examId, studentId, score: result.score, feedback: result.feedback })
    await publishStudentOverviewMessage({ studentId, examId })
    return c.text("OK")
  } catch (error) {
    console.error("[score-ai] failed", error)
    return c.json({ message: "Failed" }, 500)
  }
})

serve({ fetch: app.fetch, port: Number(process.env.PORT ?? 3002) })
