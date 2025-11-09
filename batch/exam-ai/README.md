# exam-ai

Serverless-friendly worker that listens to the Pub/Sub topic defined in `PUBSUB_TOPIC_EXAMS`, generates AI-powered exams from previously selected materials, maps those materials via `exam_materials`, and updates the `exams`/`exam_questions`/`exam_students` tables (status + per-student content).

## Development

```bash
cp .env.example .env
npm install
npm run dev
```

Behavior
- `POST /sub` handles Pub/Sub push messages with `{ examId, classId, materialIds, settings }`.
- Generates shared or per-student (unique) question Markdown and persists it in `exam_questions` + `exam_students`.
- Sets `exams.status` to `done` when generation completes so the frontend can unlock downloads.

You can also POST decoded payloads directly while iterating locally.
