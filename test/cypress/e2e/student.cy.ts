const apiUrl = (Cypress.env("apiUrl") as string) ?? "http://localhost:8787/api"

describe("Student detail", () => {
  beforeEach(() => {
    cy.clearAllCookies()
    cy.clearAllSessionStorage()
    cy.clearLocalStorage()
  })

  it("displays student profile with exam summaries", () => {
    cy.intercept("GET", `${apiUrl}/students/student-1`, {
      statusCode: 200,
      body: {
        id: "student-1",
        name: "Alice Johnson",
        overview: "Highly engaged and collaborative student.",
        strengths: ["Participates actively", "Strong analytical thinking"],
        challenges: ["Needs to slow down when solving equations"],
        exams: [
          {
            id: "exam-1",
            title: "Midterm",
            summary: "Score: 92",
            details: "Excellent performance with minor algebra mistakes.",
          },
        ],
      },
    }).as("getStudent")

    cy.visitWithAuth("/dashboard/student/student-1?classId=class-1")

    cy.wait("@getStudent")
    cy.contains("Alice Johnson").should("be.visible")
    cy.contains("Highly engaged and collaborative student.").should("be.visible")
    cy.contains("Midterm").click()
    cy.contains("Excellent performance with minor algebra mistakes.").should("be.visible")
  })

  it("falls back when the student profile is unavailable", () => {
    cy.intercept("GET", `${apiUrl}/students/missing-student`, {
      statusCode: 404,
      body: { message: "Student not found" },
    }).as("getStudent")

    cy.visitWithAuth("/dashboard/student/missing-student?classId=class-1")
    cy.wait("@getStudent")

    cy.contains("Student not found").should("be.visible")
    cy.contains("Back to class").click()
    cy.location("pathname").should("eq", "/dashboard/class")
    cy.location("search").should("contain", "tab=students")
  })
})
