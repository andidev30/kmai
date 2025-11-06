const defaultAuthUser = {
  id: "teacher-1",
  name: "Test Teacher",
  role: "teacher",
} as const

type AuthUser = typeof defaultAuthUser

type VisitWithAuthOptions = Partial<Cypress.VisitOptions> & {
  user?: Partial<AuthUser>
  token?: string
}

type SetAuthOptions = {
  user?: Partial<AuthUser>
  token?: string
}

Cypress.Commands.add("setAuth", (options: SetAuthOptions = {}) => {
  cy.window({ log: false }).then((win) => {
    const user = { ...defaultAuthUser, ...(options.user ?? {}) }
    const token = options.token ?? "test-token"
    win.localStorage.setItem("km.token", token)
    win.localStorage.setItem("km.user", JSON.stringify(user))
  })
})

Cypress.Commands.add("visitWithAuth", (url: string, options: VisitWithAuthOptions = {}) => {
  const { user, token, onBeforeLoad, ...rest } = options
  const visitOptions: Partial<Cypress.VisitOptions> = { ...rest }
  const resolvedUser = { ...defaultAuthUser, ...(user ?? {}) }
  cy.visit(url, {
    ...visitOptions,
    onBeforeLoad(win) {
      win.localStorage.setItem("km.token", token ?? "test-token")
      win.localStorage.setItem("km.user", JSON.stringify(resolvedUser))
      if (typeof onBeforeLoad === "function") {
        onBeforeLoad(win)
      }
    },
  })
})

export const apiUrl = (Cypress.env("apiUrl") as string | undefined) ?? "http://localhost:8787/api"

declare global {
  namespace Cypress {
    interface Chainable {
      setAuth(options?: SetAuthOptions): Chainable<void>
      visitWithAuth(url: string, options?: VisitWithAuthOptions): Chainable<Cypress.AUTWindow>
    }
  }
}
