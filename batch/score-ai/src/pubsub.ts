import { PubSub } from "@google-cloud/pubsub"

const topicName =
  process.env.PUBSUB_TOPIC_STUDENT_OVERVIEW && process.env.PUBSUB_TOPIC_STUDENT_OVERVIEW !== "disabled"
    ? process.env.PUBSUB_TOPIC_STUDENT_OVERVIEW
    : null

const pubsub = topicName
  ? new PubSub({
      projectId: process.env.GCP_PROJECT || "hackathon-gcp-cloud-run",
      keyFilename:
        process.env.NODE_ENV === "development"
          ? "/Users/andi/Me/hackathon/kmai/km-api/hackathon-pub-sub.json"
          : undefined,
    })
  : null

export type StudentOverviewMessage = {
  studentId: string
  examId: string
  score?: number
  feedback?: string
}

export async function publishStudentOverviewMessage(message: StudentOverviewMessage) {
  if (!topicName || !pubsub) {
    console.warn("[score-ai/pubsub] PUBSUB_TOPIC_STUDENT_OVERVIEW not configured; skipping", message)
    return
  }
  try {
    const dataBuffer = Buffer.from(JSON.stringify(message))
    await pubsub.topic(topicName).publishMessage({ data: dataBuffer })
  } catch (error) {
    console.error("[score-ai/pubsub] Failed to publish student_overview message", error)
  }
}

