overview-ai

Purpose
- Generates/updates `student_profiles` (overview, strengths, challenges) driven by recent exam results and materials.

Endpoints
- `POST /sub` (Pub/Sub push): expects `{ studentId, examId }`.
- `POST /gen` (manual): `{ studentId }` convenience trigger.

Flow
1) Fetches base student profile (if missing, proceeds with defaults).
2) Loads the specific exam result (score/feedback) and any materials linked to the exam.
3) Calls Gemini to produce a short JSON summary.
4) Upserts `student_profiles` with new fields.

Run
- Install: `pnpm install`
- Dev: `pnpm dev`
- Build: `pnpm build && pnpm start`

Env
- DB: `DATABASE_URL` or `DB_*`
- GCP: `GCP_PROJECT`, local `hackathon-pub-sub.json`

