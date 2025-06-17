describe("Crear un deposito y mostrar.", () => {
  it("logs in and navigates to loans page", () => {
    cy.visit("http://localhost:3000");
    cy.get('[cy-data="username"]').type("12345678");
    cy.get('[cy-data="password"]').type("12345678");
    cy.get('button[type="submit"]').click();

    // Wait for authentication to complete, e.g., by checking for a redirect or dashboard element
    cy.url().should("not.include", "/login");

    // Now navigate to loans page
    cy.visit("http://localhost:3000/incomes/deposits");

    // Abrir dialog para crear la acción de stock
    cy.get('[cy-data="open-dialog"]').click();

    //escribir la cantidad de acciones
    cy.get('[cy-data="deposit-amount"]').type("100");

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

    //verificar que se guardó las acciones

    // loans-table-body
    cy.get('[cy-data="loans-table-body"]').within(() => {
      cy.get("tr > td:nth-child(3)").contains("100").should("exist");
    });
  });
});
