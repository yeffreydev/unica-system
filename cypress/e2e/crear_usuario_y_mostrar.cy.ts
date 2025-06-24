describe("Crear un usuario y verificar se haya creado", () => {
  it("logs in and navigates to loans page", () => {
    cy.visit("http://localhost:3000");
    cy.get('[cy-data="username"]').type("12345678");
    cy.get('[cy-data="password"]').type("12345678");
    cy.get('button[type="submit"]').click();

    // Wait for authentication to complete, e.g., by checking for a redirect or dashboard element
    cy.url().should("not.include", "/login");

    // Now navigate to loans page
    cy.visit("http://localhost:3000/users");
    // cy.get('[cy-data="payments-table"]').should("exist");
    cy.get('[cy-data="open-dialog"]').click();

    //escribir el dni del usuario.
    cy.get('[cy-data="user-dni"]').type("10503021");

    //escribir el nombre del usuario
    cy.get('[cy-data="user-name"]').type("Test User");

    //escribir el apellido del usuario
    cy.get('[cy-data="user-lastname"]').type("Test Apellido");

    //next
    cy.wait(200);
    cy.get('[cy-data="next-btn"]').click();

    //part 2

    //escribir el dni del usuario.
    cy.get('[cy-data="user-email"]').type("exampletest@test.com");

    //escribir el nombre del usuario
    cy.get('[cy-data="user-phone"]').type("923456781");

    //next
    cy.wait(200);
    cy.get('[cy-data="save-btn"]').click();

    //verificar que se guardó el préstamo

    // loans-table-body
    cy.get('[cy-data="table-body"]').within(() => {
      cy.get("tr > td:nth-child(2)").contains("Test User").should("exist");
    });

    //seleccionar el usuario creado
    cy.get('[cy-data="table-body"]').within(() => {
      cy.get("tr > td:nth-child(2)")
        .contains("Test User")
        .closest("tr")
        .find("td:nth-child(6) > button")
        .click();
    });

    cy.get('[cy-data="options-menu"] div:last-child').click();
  });
});
