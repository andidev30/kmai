describe("Landing page", () => {
  it("loads and navigates to register", () => {
    cy.visit("/")
    cy.contains("KM.ai").should("be.visible")
    cy.contains("Try it").click()
    cy.location("pathname").should("eq", "/register")
  })
})
