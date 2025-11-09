KM API

Purpose
- REST API for KM.ai: classes, materials, exams, students.
- Publishes Pub/Sub events for AI workers (materials-ai, exam-ai, score-ai), and serves data to the frontend.

Dev
- Install: `pnpm install`
- Run dev: `pnpm dev`
- Build: `pnpm build && pnpm start`

Key env vars
- Database: `DATABASE_URL` or `DB_HOST/DB_PORT/DB_USER/DB_PASS/DB_NAME`
- CORS: `CORS_ORIGIN`
- Google Cloud: `GCP_PROJECT`, optional `hackathon-pub-sub.json` for local dev
- Storage: `GCS_BUCKET`
- Pub/Sub topics:
  - `PUBSUB_TOPIC_MATERIALS` (materials-ai)
  - `PUBSUB_TOPIC_EXAMS` (exam-ai)
  - `PUBSUB_TOPIC_SCORES` (score-ai)

Notable endpoints (prefix `/api`)
- `/classes/:classId/materials` (create/list)
- `/classes/:classId/exams` (create/list)
- `/exams/:examId` (detail)
- `/exams/:examId/download` (ZIP of questions)
- `/exams/:examId/students/:studentId/upload` (answer upload)
- `/students/:studentId` (profile + results)

