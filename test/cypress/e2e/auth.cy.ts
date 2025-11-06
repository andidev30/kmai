const apiUrl = (Cypress.env("apiUrl") as string) ?? "http://localhost:8787/api"

describe("Authentication", () => {
  beforeEach(() => {
    cy.clearAllCookies()
    cy.clearAllSessionStorage()
    cy.clearLocalStorage()
  })

  it("logs in successfully", () => {
    cy.intercept("POST", `${apiUrl}/auth/login`, {
      statusCode: 200,
      body: {
        token: "jwt-token",
        user: { id: "user-1", name: "Taylor Teacher", role: "teacher" },
      },
    }).as("login")

    cy.intercept("GET", `${apiUrl}/classes`, {
      statusCode: 200,
      body: {
        items: [
          { id: "class-1", name: "Math 101", subject: "Mathematics" },
          { id: "class-2", name: "Science 101", subject: "Science" },
        ],
      },
    }).as("listClasses")

    cy.visit("/login")
    cy.get('input[id="email"]').type("teacher@example.com")
    cy.get('input[id="password"]').type("passw0rd!")
    cy.contains("button", "Sign in").click()

    cy.wait("@login")
    cy.wait("@listClasses")

    cy.location("pathname").should("eq", "/dashboard")
    cy.window().then((win) => {
      expect(win.localStorage.getItem("km.token")).to.eq("jwt-token")
      expect(win.localStorage.getItem("km.user")).to.eq(
        JSON.stringify({ id: "user-1", name: "Taylor Teacher", role: "teacher" }),
      )
    })
  })

  it("shows feedback on invalid credentials", () => {
    cy.intercept("POST", `${apiUrl}/auth/login`, {
      statusCode: 401,
      body: { message: "Invalid credentials" },
    }).as("login")

    cy.visit("/login")
    cy.get('input[id="email"]').type("teacher@example.com")
    cy.get('input[id="password"]').type("wrongpass")
    cy.contains("button", "Sign in").click()

    cy.wait("@login")
    cy.contains("Invalid credentials").should("be.visible")
  })

  it("registers and redirects to dashboard", () => {
    cy.intercept("POST", `${apiUrl}/auth/register`, {
      statusCode: 201,
      body: { id: "user-2", token: "new-token" },
    }).as("register")

    cy.intercept("GET", `${apiUrl}/classes`, {
      statusCode: 200,
      body: { items: [] },
    }).as("listClasses")

    cy.visit("/register")
    cy.get('input[id="fullName"]').type("Jordan Mentor")
    cy.get('input[id="registerEmail"]').type("mentor@example.com")
    cy.get('input[id="registerPassword"]').type("StrongPass123")
    cy.get('input[id="confirmPassword"]').type("StrongPass123")
    cy.contains("button", "Create account").click()

    cy.wait("@register")
    cy.wait("@listClasses")

    cy.location("pathname").should("eq", "/dashboard")
    cy.window().then((win) => {
      expect(win.localStorage.getItem("km.token")).to.eq("new-token")
      expect(win.localStorage.getItem("km.user")).to.eq(
        JSON.stringify({ id: "user-2", name: "Jordan Mentor" }),
      )
    })
  })

  it("prevents submission when passwords do not match", () => {
    cy.visit("/register")
    cy.get('input[id="fullName"]').type("Mismatch User")
    cy.get('input[id="registerEmail"]').type("user@example.com")
    cy.get('input[id="registerPassword"]').type("StrongPass123")
    cy.get('input[id="confirmPassword"]').type("DifferentPass")
    cy.contains("button", "Create account").should("be.disabled")
  })
})
