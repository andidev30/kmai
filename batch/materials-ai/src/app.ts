import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import "dotenv/config"

import { generate } from './llm.js'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.post("/sub", async (c) => {
  const body = await c.req.json<{ message: { data: string } }>();
  const message = body.message;
  const decoded = JSON.parse(Buffer.from(message.data, "base64").toString()) || [];
  console.log("📩 Received:", decoded);

  const response = await generate(decoded);
  console.log("📤 Sending:", response);

  return c.text('OK', 200)
});


serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
