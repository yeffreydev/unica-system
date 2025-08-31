describe("", () => {
  it("crear usuario", () => {
    cy.visit("http://localhost:3000");
    cy.get('[cy-data="username"]').type("12345678");
    cy.get('[cy-data="password"]').type("12345678");
    cy.get('button[type="submit"]').click();
    cy.wait(200);

    //got to /users
    cy.visit("http://localhost:3000/users");
    //open dialgo
    cy.get('[cy-data="open-dialog"]').click();

    //fill form
    cy.get('[name="dni"]').type("50123456");
    cy.get('[name="name"]').type("Nuevo Usuario test");
    cy.get('[name="lastname"]').type("Nuevo Apellido test");

    //prest next btn
    cy.get('[cy-data="next-btn"]').click();
    cy.wait(200);
    cy.get('[cy-data="user-email"]').type("usertest3@example.com");
    cy.get('[cy-data="user-phone"]').type("900304678");
    //save btn
    cy.get('[cy-data="save-btn"]').click();
  });
});
