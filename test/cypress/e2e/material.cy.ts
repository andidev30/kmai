const apiUrl = (Cypress.env("apiUrl") as string) ?? "http://localhost:8787/api"

describe("Material detail", () => {
  beforeEach(() => {
    cy.clearAllCookies()
    cy.clearAllSessionStorage()
    cy.clearLocalStorage()
  })

  it("displays material details and allows download", () => {
    const fileUri = "http://localhost:5173/files/algebra.pdf"
    cy.intercept("GET", `${apiUrl}/materials/material-1`, {
      statusCode: 200,
      body: {
        id: "material-1",
        title: "Algebra Basics",
        description: "Introduction to algebraic expressions",
        content: "Sample content for algebra.",
        status: "pending",
        files: [
          {
            uri: fileUri,
            gcsUri: "gs://bucket/materials/material-1/algebra.pdf",
            mimeType: "application/pdf",
            name: "algebra.pdf",
          },
        ],
        dateStart: "2025-01-01",
        dateEnd: "2025-06-01",
      },
    }).as("getMaterial")

    cy.visitWithAuth("/dashboard/material/material-1?classId=class-1", {
      onBeforeLoad(win) {
        cy.stub(win, "open").as("windowOpen")
      },
    })

    cy.wait("@getMaterial")

    cy.contains("Algebra Basics").should("be.visible")
    cy.contains("Introduction to algebraic expressions").should("be.visible")
    cy.contains("Details").should("be.visible")
    cy.contains("Attachments").should("be.visible")
    cy.contains("algebra.pdf").should("be.visible")
    cy.contains("Download").click()
    cy.get("@windowOpen").should("have.been.calledWith", fileUri, "_blank")
  })

  it("handles missing material gracefully", () => {
    cy.intercept("GET", `${apiUrl}/materials/missing-id`, {
      statusCode: 404,
      body: { message: "Material not found" },
    }).as("getMaterial")

    cy.visitWithAuth("/dashboard/material/missing-id?classId=class-1")
    cy.wait("@getMaterial")

    cy.contains("Material not found").should("be.visible")
    cy.contains("Back to class").click()
    cy.location("pathname").should("eq", "/dashboard/class")
    cy.location("search").should("contain", "tab=materials")
  })
})
