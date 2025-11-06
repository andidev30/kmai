const apiUrl = (Cypress.env("apiUrl") as string) ?? "http://localhost:8787/api"

describe("Exam detail", () => {
  beforeEach(() => {
    cy.clearAllCookies()
    cy.clearAllSessionStorage()
    cy.clearLocalStorage()
  })

  it("shows exam information and allows downloads", () => {
    cy.intercept("GET", `${apiUrl}/exams/exam-1`, {
      statusCode: 200,
      body: {
        id: "exam-1",
        title: "Geometry Midterm",
        description: "Covers chapters 1-6",
        date: "2025-03-01",
        duration: 120,
        students: [
          { id: "student-1", name: "Alice", status: "graded" },
          { id: "student-2", name: "Bob", status: "not-submitted" },
        ],
      },
    }).as("getExam")

    cy.intercept("GET", `${apiUrl}/exams/exam-1/download`, {
      statusCode: 200,
      body: { url: "http://localhost:5173/files/exam-1.pdf" },
    }).as("downloadExam")

    cy.intercept("GET", `${apiUrl}/exams/exam-1/students/student-1/download`, {
      statusCode: 200,
      body: { url: "http://localhost:5173/files/student-1.pdf" },
    }).as("downloadSubmission")

    cy.visitWithAuth("/dashboard/exam/exam-1?classId=class-1", {
      onBeforeLoad(win) {
        cy.stub(win, "open").as("windowOpen")
      },
    })

    cy.wait("@getExam")

    cy.contains("Geometry Midterm").should("be.visible")
    cy.contains("Covers chapters 1-6").should("be.visible")
    cy.contains("Download all exam questions").click()
    cy.wait("@downloadExam")
    cy.get("@windowOpen").should("have.been.calledWith", "http://localhost:5173/files/exam-1.pdf", "_blank")

    cy.contains("Alice").should("be.visible")
    cy.contains("Bob").should("be.visible")

    cy.contains("Alice").closest("div").siblings("div").contains("View").click()

    cy.wait("@downloadSubmission")
    cy.get("@windowOpen").should("have.been.calledWith", "http://localhost:5173/files/student-1.pdf", "_blank")

    cy.contains("Bob").closest("div").siblings("div").contains("View").should("be.disabled")
  })

  it("shows an error message for a missing exam", () => {
    cy.intercept("GET", `${apiUrl}/exams/missing`, {
      statusCode: 404,
      body: { message: "Exam not found" },
    }).as("getExam")

    cy.visitWithAuth("/dashboard/exam/missing?classId=class-1")
    cy.wait("@getExam")

    cy.contains("Exam not found").should("be.visible")
    cy.contains("Back to class").click()
    cy.location("pathname").should("eq", "/dashboard/class")
    cy.location("search").should("contain", "tab=exams")
  })
})
