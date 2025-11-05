import "dotenv/config"

import { Hono } from "hono"
import { logger } from "hono/logger"
import { cors } from "hono/cors"
import { serve } from "@hono/node-server"

import authRoutes from "./routes/auth"
import classesRoutes from "./routes/classes"
import examsRoutes from "./routes/exams"
import materialsRoutes from "./routes/materials"
import studentsRoutes from "./routes/students"

const app = new Hono()

app.use("*", logger())
app.use(
  "*",
  cors({
    origin: process.env.CORS_ORIGIN ?? "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  }),
)

app.get("/api/health", (c) => c.json({ status: "ok" }))

app.route("/api/auth", authRoutes)
app.route("/api/classes", classesRoutes)
app.route("/api/exams", examsRoutes)
app.route("/api/materials", materialsRoutes)
app.route("/api/students", studentsRoutes)

const port = Number(process.env.PORT ?? 8787)

serve({
  fetch: app.fetch,
  port,
})

console.log(`🚀 km-api server running on http://localhost:${port}`)
