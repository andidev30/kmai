import { PubSub } from "@google-cloud/pubsub"

const topicName = process.env.PUBSUB_TOPIC_MATERIALS

const pubsub =
  topicName && process.env.PUBSUB_TOPIC_MATERIALS !== "disabled"
    ? new PubSub({
      projectId: process.env.GCP_PROJECT || 'hackathon-gcp-cloud-run',
      keyFilename: process.env.NODE_ENV === 'development' ? '/Users/andi/Me/hackathon/kmai/km-api/hackathon-pub-sub.json' : undefined,
    })
    : null

type MaterialMessage = {
  materialId: string
  classId: string
  gcsUris: string[]
}

export async function publishMaterialMessage(message: MaterialMessage) {
  if (!topicName || !pubsub) {
    console.warn(
      "[pubsub] PUBSUB_TOPIC_MATERIALS is not configured. Skipping publish for material",
      message.materialId,
    )
    return
  }

  try {
    const dataBuffer = Buffer.from(JSON.stringify(message))
    await pubsub.topic(topicName).publishMessage({ data: dataBuffer })
  } catch (error) {
    console.error("[pubsub] Failed to publish material message", error)
  }
}
