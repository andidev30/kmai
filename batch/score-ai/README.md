score-ai

Purpose
- Scores student answers using Gemini (Vertex AI) and updates `exam_students` with `score` and `feedback`.

Endpoints
- `POST /sub` (Pub/Sub push): expects JSON (or Pub/Sub envelope) with `{ examId, studentId }`.

Flow
1) Reads the student's uploaded answers (URIs from `exam_students.answer_files`).
2) Fetches the assigned exam question.
3) Calls LLM to evaluate and returns `{ score, feedback }`.
4) Updates the DB and publishes `student_overview` event.

Run
- Install: `pnpm install`
- Dev: `pnpm dev`
- Build: `pnpm build && pnpm start`

Env
- DB: `DATABASE_URL` or `DB_*`
- GCP: `GCP_PROJECT`, local `hackathon-pub-sub.json`
- Optional: `PUBSUB_TOPIC_STUDENT_OVERVIEW`

