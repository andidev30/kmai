# exam-ai

Serverless-friendly worker that listens to the Pub/Sub topic defined in `PUBSUB_TOPIC_EXAMS`, generates AI-powered exams from previously created materials, and updates the `exams` table with the resulting bundle URL plus status.

## Development

```bash
cp .env.example .env
npm install
npm run dev
```

The service exposes `POST /sub` for Pub/Sub push subscriptions. You can also send manual requests with the decoded payload to iterate locally.
