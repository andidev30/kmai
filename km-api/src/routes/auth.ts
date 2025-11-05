import { Hono } from "hono"
import { sql } from "../db"

const auth = new Hono()

auth.post("/login", async (c) => {
  const body = await c.req.json<{ email?: string; password?: string }>()
  const email = body.email?.toLowerCase()
  const password = body.password

  if (!email || !password) {
    return c.json({ message: "Email and password are required" }, 400)
  }

  try {
    const rows =
      await sql`select id, full_name, role, password_hash from users where email = ${email} limit 1`

    if (!rows.length) {
      return c.json({ message: "Invalid credentials" }, 401)
    }

    const user = rows[0] as { id: string; full_name: string; role: string; password_hash: string }

    if (user.password_hash && user.password_hash !== password) {
      return c.json({ message: "Invalid credentials" }, 401)
    }

    return c.json({
      token: `mock-token-${user.id}`,
      user: {
        id: user.id,
        name: user.full_name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("[auth/login] fallback to mock data", error)
    return c.json({
      token: "mock-token-1",
      user: {
        id: "mock-user-1",
        name: "Andi Teacher",
        role: "teacher",
      },
    })
  }
})

auth.post("/register", async (c) => {
  const body = await c.req.json<{ fullName?: string; email?: string; password?: string }>()
  const fullName = body.fullName?.trim()
  const email = body.email?.toLowerCase()
  const password = body.password

  if (!fullName || !email || !password) {
    return c.json({ message: "Full name, email, and password are required" }, 400)
  }

  try {
    const inserted =
      await sql`insert into users (full_name, email, password_hash, role) values (${fullName}, ${email}, ${password}, 'teacher') returning id`

    const id = inserted[0]?.id as string
    return c.json({ id, token: `mock-token-${id}` }, 201)
  } catch (error) {
    console.error("[auth/register] fallback to mock user", error)
    return c.json({ id: "mock-user-2", token: "mock-token-2" }, 201)
  }
})

export default auth
