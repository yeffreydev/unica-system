describe("template spec", () => {
  it("Create the loan and pay under the installent", () => {
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
    cy.get('[cy-data="loan-amount"]').type("530");
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
      cy.get("tr > td:nth-child(3)").contains("530").should("exist");
    });

    cy.visit("http://localhost:3000/incomes/payments");
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

    //pay the under the installment.
    cy.get('[cy-data="installment-amount"]').clear().type("50");

    //save
    cy.get('[cy-data="save-btn"]').click();

    //verificar que se guardó el pago
    cy.get('[cy-data="payments-table-body"]').within(() => {
      cy.get("tr > td:nth-child(2)").contains("E0-530").should("exist");
    });

    //visit the loans page again to check if the payment was applied
    cy.visit("http://localhost:3000/expenses/loans");

    //seleccionar el prestamo con 530
    cy.get('[cy-data="loans-table-body"]').within(() => {
      cy.get("tr > td:nth-child(3)")
        .contains("530")
        .closest("tr")
        .find("td:nth-child(5) > button")
        .click();
    });

    cy.get('[cy-data="options-menu"] div:first-child').click();

    //get the installments table
    cy.get('[cy-data="installments-table-body"]').within(() => {
      // Check that there are 4 rows
      cy.get("tr").should("have.length", 4);

      // Find the green row and check its second td is 50
      cy.get("tr.bg-green-200").within(() => {
        cy.get("td:nth-child(2)").should("have.text", "50.00");
      });

      // Check the other 3 rows have 83.33 in the second td
      cy.get("tr:not(.bg-green-200)").each(($row) => {
        cy.wrap($row).find("td:nth-child(2)").should("have.text", "160.00");
      });
    });
    //click outside of installments-dialog
    cy.wait(200);
    cy.get("body").click(0, 0, { force: true });

    //seleccionar el prestamo con 530
    cy.get('[cy-data="loans-table-body"]').within(() => {
      cy.get("tr > td:nth-child(3)")
        .contains("530")
        .closest("tr")
        .find("td:nth-child(5) > button")
        .click();
    });

    cy.get('[cy-data="options-menu"] div:last-child').click();
  });
});
