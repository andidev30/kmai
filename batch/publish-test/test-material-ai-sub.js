import "dotenv/config"
import { PubSub } from "@google-cloud/pubsub"
import axios from "axios"

const subscriptionName =
  process.env.PUBSUB_SUBSCRIPTION_MATERIALS ?? process.env.PUBSUB_TOPIC_MATERIALS ?? "materials-sub"
const materialAiEndpoint = process.env.MATERIAL_AI_ENDPOINT ?? "http://localhost:3000/sub"

const pubsub = new PubSub({
  projectId: process.env.GCP_PROJECT || 'hackathon-gcp-cloud-run',
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || '/Users/andi/Me/hackathon/kmai/km-api/hackathon-pub-sub.json',
})

async function listenForMessages() {
  if (!subscriptionName) {
    console.error("PUBSUB_SUBSCRIPTION_MATERIALS (or topic name) is required")
    process.exit(1)
  }

  const subscription = pubsub.subscription(subscriptionName)
  subscription.on("message", async (message) => {
    let payload
    try {
      payload = JSON.parse(message.data.toString())
      console.log("Received material message:", payload)
    } catch (error) {
      console.error("Failed to parse message data", error)
      message.nack()
      return
    }

    try {
      await axios.post(materialAiEndpoint, payload)
      console.log("Forwarded payload to materials AI service")
      message.ack()
    } catch (error) {
      if (axios.isAxiosError?.(error)) {
        console.error(
          "Failed to call materials AI service",
          error.response?.status,
          error.response?.data ?? error.message,
        )
      } else {
        console.error("Failed to call materials AI service", error)
      }
      message.nack()
    }
  })

  subscription.on("error", (error) => {
    console.error("Subscription error:", error)
  })

  console.log(`Listening for messages on ${subscriptionName}... (Ctrl+C to exit)`)
}

listenForMessages().catch((error) => {
  console.error("Failed to start listener", error)
  process.exit(1)
})
