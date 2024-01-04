describe('template spec', () => {
  it('passes', () => {
    cy.visit('../../playground/index.html');
    cy.get('.ce-paragraph.cdx-block').focus().type('hello world');
    cy.selectText('ll');
  })
});
