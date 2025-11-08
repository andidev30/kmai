import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import "dotenv/config"

import { generate } from './llm.js'
import { updateMaterialContent } from './db.js'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

function guessMimeType(uri: string): string {
  const lower = uri.toLowerCase()
  if (lower.endsWith(".png")) return "image/png"
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg"
  if (lower.endsWith(".gif")) return "image/gif"
  if (lower.endsWith(".pdf")) return "application/pdf"
  if (lower.endsWith(".txt")) return "text/plain"
  if (lower.endsWith(".ppt") || lower.endsWith(".pptx")) return "application/vnd.ms-powerpoint"
  if (lower.endsWith(".doc") || lower.endsWith(".docx")) return "application/msword"
  return "application/octet-stream"
}

app.post("/sub", async (c) => {
  const rawBody = await c.req.json<any>().catch(() => null)

  if (!rawBody) {
    return c.json({ message: "Invalid payload" }, 400)
  }

  const decoded =
    rawBody?.message?.data != null
      ? JSON.parse(Buffer.from(rawBody.message.data, "base64").toString())
      : rawBody

  if (!decoded || !decoded.materialId || !Array.isArray(decoded?.gcsUris)) {
    return c.json({ message: "Payload must include materialId and gcsUris array" }, 400)
  }

  console.log("📩 Received:", decoded)

  const gcsPaths = decoded.gcsUris.map((uri: string) => ({
    uri,
    mimeType: guessMimeType(uri),
  }))

  const response = await generate(gcsPaths)

  try {
    await updateMaterialContent(decoded.materialId, response)
    console.log(`✅ Stored generated content for material ${decoded.materialId}`)
  } catch (error) {
    console.error("[materials-ai] Failed to update database", error)
    return c.json({ message: "Failed to update material content" }, 500)
  }

  return c.text('OK', 200)
});


serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
