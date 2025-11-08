import { PubSub } from "@google-cloud/pubsub";

const pubsub = new PubSub({
  projectId: "hackathon-gcp-cloud-run",
  keyFilename: "./hackathon-pub-sub.json",
});

async function publishMessage() {
  const topicName = "kmai-materials";

  const data = [
    {
      uri: "gs://kmai_upload/data_test/Screenshot 2025-11-08 at 21.23.06.png",
      mimeType: "image/png",
    },
  ];

  const dataBuffer = Buffer.from(JSON.stringify(data));
  const messageId = await pubsub.topic(topicName).publishMessage({ data: dataBuffer });

  console.log(`✅ Published message ${messageId}`);
}

publishMessage();
