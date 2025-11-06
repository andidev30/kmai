const apiUrl = (Cypress.env("apiUrl") as string) ?? "http://localhost:8787/api"

describe("Class management", () => {
  beforeEach(() => {
    cy.clearAllCookies()
    cy.clearAllSessionStorage()
    cy.clearLocalStorage()
  })

  it("creates a new class", () => {
    cy.intercept("POST", `${apiUrl}/classes`, {
      statusCode: 201,
      body: { id: "class-9", name: "New Class", subject: "Science" },
    }).as("createClass")

    cy.intercept("GET", `${apiUrl}/classes/class-9`, {
      statusCode: 200,
      body: { id: "class-9", name: "New Class", subject: "Science" },
    }).as("getClass")

    cy.intercept("GET", `${apiUrl}/classes/class-9/students`, {
      statusCode: 200,
      body: { items: [] },
    }).as("listStudents")

    cy.visitWithAuth("/dashboard/class?id=new")

    cy.contains("Create a class").should("be.visible")
    cy.get('input[id="new-class-name"]').type("New Class")
    cy.get('input[id="new-class-subject"]').type("Science")
    cy.contains("button", "Create class").click()

    cy.wait("@createClass")
    cy.wait("@getClass")
    cy.wait("@listStudents")

    cy.location("pathname").should("eq", "/dashboard/class")
    cy.location("search").should("contain", "id=class-9")
  })

  it("allows canceling class creation", () => {
    cy.intercept("GET", `${apiUrl}/classes`, {
      statusCode: 200,
      body: { items: [] },
    }).as("listClasses")

    cy.visitWithAuth("/dashboard/class?id=new")

    cy.contains("button", "Cancel").click()

    cy.wait("@listClasses")
    cy.location("pathname").should("eq", "/dashboard")
  })
})
