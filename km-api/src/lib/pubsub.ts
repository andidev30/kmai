import { PubSub } from "@google-cloud/pubsub"

const materialsTopicName =
  process.env.PUBSUB_TOPIC_MATERIALS && process.env.PUBSUB_TOPIC_MATERIALS !== "disabled"
    ? process.env.PUBSUB_TOPIC_MATERIALS
    : null

const examsTopicName =
  process.env.PUBSUB_TOPIC_EXAMS && process.env.PUBSUB_TOPIC_EXAMS !== "disabled"
    ? process.env.PUBSUB_TOPIC_EXAMS
    : null

const scoresTopicName =
  process.env.PUBSUB_TOPIC_SCORES && process.env.PUBSUB_TOPIC_SCORES !== "disabled"
    ? process.env.PUBSUB_TOPIC_SCORES
    : null

const shouldInitPubSub = Boolean(materialsTopicName || examsTopicName || scoresTopicName)

const pubsub = shouldInitPubSub
  ? new PubSub({
      projectId: process.env.GCP_PROJECT || "hackathon-gcp-cloud-run",
      keyFilename:
        process.env.NODE_ENV === "development"
          ? "/Users/andi/Me/hackathon/kmai/km-api/hackathon-pub-sub.json"
          : undefined,
    })
  : null

type MaterialMessage = {
  materialId: string
  classId: string
  gcsUris: string[]
}

type ExamMessage = {
  examId: string
  classId: string
  materialIds: string[]
  settings: {
    mcq: number
    essay: number
    uniquePerStudent: boolean
  }
}

type ScoreMessage = {
  examId: string
  studentId: string
}

async function publishMessage({
  topic,
  identifier,
  message,
  logKey,
}: {
  topic: string | null
  identifier: string
  message: Record<string, unknown>
  logKey: string
}) {
  if (!topic || !pubsub) {
    console.warn(`[pubsub] ${logKey} topic is not configured. Skipping publish for`, identifier)
    return
  }

  try {
    const dataBuffer = Buffer.from(JSON.stringify(message))
    await pubsub.topic(topic).publishMessage({ data: dataBuffer })
  } catch (error) {
    console.error(`[pubsub] Failed to publish ${logKey} message`, error)
  }
}

export async function publishMaterialMessage(message: MaterialMessage) {
  await publishMessage({
    topic: materialsTopicName,
    identifier: message.materialId,
    message,
    logKey: "PUBSUB_TOPIC_MATERIALS",
  })
}

export async function publishExamMessage(message: ExamMessage) {
  await publishMessage({
    topic: examsTopicName,
    identifier: message.examId,
    message,
    logKey: "PUBSUB_TOPIC_EXAMS",
  })
}

export async function publishScoreMessage(message: ScoreMessage) {
  await publishMessage({
    topic: scoresTopicName,
    identifier: `${message.examId}:${message.studentId}`,
    message,
    logKey: "PUBSUB_TOPIC_SCORES",
  })
}
