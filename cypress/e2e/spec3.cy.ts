describe("template spec", () => {
  it("Create the loan and pay all isstallments and verify the loan is status paid", () => {
    cy.visit("http://localhost:3000");
    cy.get('[cy-data="username"]').type("12345678");
    cy.get('[cy-data="password"]').type("12345678");
    cy.get('input[type="submit"]').click();

    // Wait for authentication to complete, e.g., by checking for a redirect or dashboard element
    cy.url().should("not.include", "/login");

    // Now navigate to loans page
    cy.visit("http://localhost:3000/expenses/loans");
    // cy.get('[cy-data="payments-table"]').should("exist");
    cy.get('[cy-data="open-dialog"]').click();
    cy.get('[cy-data="loan-amount"]').type("100");
    cy.get('[cy-data="open-combobox-users"]').click();

    //combobox-users-group
    cy.get('[cy-data="combobox-users-group"]').within(() => {
      cy.get('div[role="option"]  div > span')
        .contains("Ever")
        .parent()
        .parent()
        .click();
    });
    //next
    cy.get('[cy-data="next-btn"]').click();

    ///suigente paso
    cy.get('[cy-data="open-combobox-loan-types"]').click();

    cy.get('[cy-data="combobox-loan-types-group"]').within(() => {
      cy.get('div[role="option"]  div > span')
        .contains("Cuota variable")
        .parent()
        .parent()
        .click();
    });

    cy.get('[cy-data="loan-months"]').clear().type("4");

    //next
    cy.wait(200);
    cy.get('[cy-data="next-btn"]').click();
    // Confirm the final step
    cy.wait(200);
    cy.get('[cy-data="save-btn"]').click();

    //verificar que se guardó el préstamo

    // loans-table-body
    cy.get('[cy-data="loans-table-body"]').within(() => {
      cy.get("tr > td:nth-child(3)").contains("100").should("exist");
    });

    cy.visit("http://localhost:3000/incomes/payments");

    for (let i = 0; i < 4; i++) {
      cy.get('[cy-data="open-dialog"]').click();

      cy.get('[cy-data="open-combobox-users"]').click();
      cy.get('[cy-data="combobox-users-group"]').within(() => {
        cy.get('div[role="option"]  div > span')
          .contains("Ever")
          .parent()
          .parent()
          .click();
      });

      //next

      cy.get('[cy-data="next-btn"]').click();

      //save
      cy.get('[cy-data="save-btn"]').click();

      //verificar que se guardó el pago
      cy.get('[cy-data="payments-table-body"]').within(() => {
        cy.get("tr > td:nth-child(2)").contains(`E${i}-100`).should("exist");
      });
      cy.wait(200);
      //click outside of dialog
      cy.get("body").click(0, 0, { force: true });
    }

    //visit the loans page again to check if the payment was applied
    cy.visit("http://localhost:3000/expenses/loans");

    //seleccionar el prestamo con 100 y verificar que el estado es pagado
    cy.get('[cy-data="loans-table-body"]').within(() => {
      cy.get("tr > td:nth-child(3)")
        .contains("100")
        .closest("tr")
        .find("td:nth-child(4) > div")
        .should("contain", "pagado");
    });

    cy.wait(200);
    //seleccionar el prestamo con 100 y eliminarlo
    cy.get('[cy-data="loans-table-body"]').within(() => {
      cy.get("tr > td:nth-child(3)")
        .contains("100")
        .closest("tr")
        .find("td:nth-child(5) > button")
        .click();
    });

    cy.get('[cy-data="options-menu"] div:last-child').click();
  });
});
