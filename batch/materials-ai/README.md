materials-ai
============

Purpose
- Pub/Sub worker that listens to `PUBSUB_TOPIC_MATERIALS`, downloads classroom resources, asks Gemini to generate enriched lesson content, and updates each `materials` row (content + status).

Development
```
cp .env.example .env
npm install
npm run dev
```

Behavior
- Endpoint `POST /sub` handles Pub/Sub push messages containing `{ materialId, classId, gcsUris: [] }`.
- Generated content is stored in `materials.content`, status flips from `pending` → `done` when successful.

Env essentials
- DB: `DATABASE_URL` or `DB_HOST/DB_PORT/DB_USER/DB_PASS/DB_NAME`
- GCP: `GCP_PROJECT`, local key via `hackathon-pub-sub.json`
- Pub/Sub: `PUBSUB_TOPIC_MATERIALS`
