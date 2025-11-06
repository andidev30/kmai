import { createMiddleware } from "hono/factory"

export type AuthVariables = {
  authUserId: string
}

export const requireAuth = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  const authorization = c.req.header("authorization")
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return c.json({ message: "Unauthorized" }, 401)
  }

  const token = authorization.slice("Bearer ".length).trim()
  if (!token) {
    return c.json({ message: "Unauthorized" }, 401)
  }

  if (!token.startsWith("mock-token-")) {
    return c.json({ message: "Unauthorized" }, 401)
  }

  const userId = token.replace("mock-token-", "")
  c.set("authUserId", userId)
  return next()
})
