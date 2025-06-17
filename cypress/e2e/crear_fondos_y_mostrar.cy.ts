describe("Crear fondos y mostrar.", () => {
  it("logs in and navigates to loans page", () => {
    cy.visit("http://localhost:3000");
    cy.get('[cy-data="username"]').type("12345678");
    cy.get('[cy-data="password"]').type("12345678");
    cy.get('button[type="submit"]').click();

    // Wait for authentication to complete, e.g., by checking for a redirect or dashboard element
    cy.url().should("not.include", "/login");

    // Now navigate to loans page
    cy.visit("http://localhost:3000/incomes/legal-and-social");

    // Abrir dialog para crear la acción de stock
    cy.get('[cy-data="open-dialog"]').click();

    //seleccionar el tipo de fondo
    cy.get('[cy-data="funds-type"]').select(1);

    //escrbir el monto de fondo (100)
    cy.get('[cy-data="funds-amount"]').type("100");

    //next
    cy.wait(200);

    // Confirm the final step
    cy.wait(200);
    cy.get('[cy-data="save-btn"]').click();

    //verificar que se guardó las acciones

    // loans-table-body
    cy.get('[cy-data="loans-table-body"]').within(() => {
      cy.get("tr > td:nth-child(4)").contains("100").should("exist");
    });
  });
});
