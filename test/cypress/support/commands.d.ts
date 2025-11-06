/// <reference types="cypress" />

type AuthUser = {
  id: string
  name: string
  role: string
}

type VisitWithAuthOptions = Partial<Cypress.VisitOptions> & {
  user?: Partial<AuthUser>
  token?: string
}

type SetAuthOptions = {
  user?: Partial<AuthUser>
  token?: string
}

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Set authentication details in localStorage without navigation.
       */
      setAuth(options?: SetAuthOptions): Chainable<void>

      /**
       * Visit a page after seeding authentication state into localStorage.
       */
      visitWithAuth(url: string, options?: VisitWithAuthOptions): Chainable<Window>
    }
  }
}

export {}
