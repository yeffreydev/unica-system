describe("Crear otros ingresos y mostrar.", () => {
  it("logs in and navigates to loans page", () => {
    cy.visit("http://localhost:3000");
    cy.get('[cy-data="username"]').type("12345678");
    cy.get('[cy-data="password"]').type("12345678");
    cy.get('button[type="submit"]').click();

    // Wait for authentication to complete, e.g., by checking for a redirect or dashboard element
    cy.url().should("not.include", "/login");

    // Now navigate to loans page
    cy.visit("http://localhost:3000/incomes/others");

    // Abrir dialog para crear la acción de stock
    cy.get('[cy-data="open-dialog"]').click();

    //escribir el monto.
    cy.get('[cy-data="other-amount"]').type("100");

    //escribir la descripción
    cy.get('[cy-data="other-description"]').type("ingreso de prueba");

    //seleccionar el usuario
    cy.get('[cy-data="open-combobox-users"]').click();

    //combobox-users-group
    cy.get('[cy-data="combobox-users-group"]').within(() => {
      cy.get('div[role="option"]  div > span')
        .contains("Juan")
        .parent()
        .parent()
        .click();
    });

    //next
    cy.wait(200);

    // Confirm the final step
    cy.wait(200);
    cy.get('[cy-data="save-btn"]').click();

    //verificar que se guardó los otros ingreso

    // loans-table-body
    cy.get('[cy-data="loans-table-body"]').within(() => {
      cy.get("tr > td:nth-child(4)").contains("100").should("exist");
    });
  });
});
