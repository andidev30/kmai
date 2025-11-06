const apiUrl = (Cypress.env("apiUrl") as string) ?? "http://localhost:8787/api"

describe("Dashboard", () => {
  beforeEach(() => {
    cy.clearAllCookies()
    cy.clearAllSessionStorage()
    cy.clearLocalStorage()
  })

  it("lists classes and opens a class detail page", () => {
    cy.intercept("GET", `${apiUrl}/classes`, {
      statusCode: 200,
      body: {
        items: [
          { id: "class-1", name: "Math 101", subject: "Mathematics" },
          { id: "class-2", name: "English 201", subject: "English" },
        ],
      },
    }).as("listClasses")

    cy.intercept("GET", `${apiUrl}/classes/class-1`, {
      statusCode: 200,
      body: { id: "class-1", name: "Math 101", subject: "Mathematics" },
    }).as("getClass")

    cy.intercept("GET", `${apiUrl}/classes/class-1/students`, {
      statusCode: 200,
      body: {
        items: [
          {
            id: "student-1",
            name: "Alice",
            studentId: "S001",
            email: "alice@example.com",
            gender: "female",
            phone: "555-1000",
          },
        ],
      },
    }).as("listStudents")

    cy.intercept("GET", `${apiUrl}/classes/class-1/materials`, {
      statusCode: 200,
      body: {
        items: [
          {
            id: "material-1",
            title: "Algebra Intro",
            description: "Basics of algebra",
            fileUrl: "/files/algebra.pdf",
          },
        ],
      },
    }).as("listMaterials")

    cy.intercept("GET", `${apiUrl}/classes/class-1/exams`, {
      statusCode: 200,
      body: {
        items: [
          { id: "exam-1", title: "Midterm", date: "2025-03-01", duration: 90 },
        ],
      },
    }).as("listExams")

    cy.visitWithAuth("/dashboard")
    cy.wait("@listClasses")

    cy.contains("Your classes").should("be.visible")
    cy.contains("Math 101").should("be.visible")
    cy.contains("English 201").should("be.visible")

    cy.contains('[role="button"]', "Math 101").click()

    cy.wait("@getClass")
    cy.wait("@listStudents")

    cy.location("pathname").should("eq", "/dashboard/class")
    cy.location("search").should("contain", "id=class-1")

    cy.contains("Access").should("be.visible")
    cy.contains("Students").should("be.visible")

    cy.contains("Materials").click()
    cy.wait("@listMaterials")
    cy.contains("Algebra Intro").should("be.visible")

    cy.contains("Exams").click()
    cy.wait("@listExams")
    cy.contains("Midterm").should("be.visible")
  })

  it("shows a friendly error when classes cannot be loaded", () => {
    cy.intercept("GET", `${apiUrl}/classes`, {
      statusCode: 500,
      body: { message: "Internal server error" },
    }).as("listClasses")

    cy.visitWithAuth("/dashboard")
    cy.wait("@listClasses")

    cy.contains("Internal server error").should("be.visible")
  })
})
