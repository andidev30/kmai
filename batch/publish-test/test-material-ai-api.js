import axios from "axios";

const MATERIALS_API_URL = process.env.MATERIALS_API_URL ?? "http://localhost:3000/sub";

async function testMaterialsApi() {
  const payload = [
    {
      uri: "gs://kmai_upload/data_test/Screenshot 2025-11-08 at 21.23.06.png",
      mimeType: "image/png",
    },
  ];

  const messageBody = {
    message: {
      data: Buffer.from(JSON.stringify(payload)).toString("base64"),
    },
  };

  try {
    const response = await axios.post(MATERIALS_API_URL, messageBody, {
      headers: { "Content-Type": "application/json" },
    });

    console.log(`✅ API responded with status ${response.status}`);
    console.log(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("❌ API request failed", error.response?.status, error.response?.data ?? error.message);
    } else {
      console.error("❌ Unexpected error", error);
    }
  }
}

testMaterialsApi();
