describe("template spec", () => {
  it("passes", () => {
    cy.visit("http://localhost:3000");
    cy.get('[cy-data="username"]').type("12345678");
    cy.get('[cy-data="password"]').type("12345678");
    cy.get('input[type="submit"]').click();
  });
});
