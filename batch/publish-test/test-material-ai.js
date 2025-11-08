import { PubSub } from "@google-cloud/pubsub";

const pubsub = new PubSub({
  projectId: "hackathon-gcp-cloud-run",
  keyFilename: "./hackathon-pub-sub.json",
});

async function publishMessage() {
  const topicName = "test";

  const data = {
    StringField: "Andi",
    FloatField: 3.14,
    BooleanField: true,
  };

  const dataBuffer = Buffer.from(JSON.stringify(data));
  const messageId = await pubsub.topic(topicName).publishMessage({ data: dataBuffer });

  console.log(`✅ Published message ${messageId}`);
}

publishMessage();
