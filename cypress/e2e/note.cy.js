describe('note', () => {
  it('selected a word', () => {
    cy.visit('../../playground/index.html');
    cy.get('.ce-paragraph.cdx-block').focus().type('hello world');
    cy.selectText('world');
    cy.get('[data-tool="Note"]').click();
    cy.get('note').should('be.visible').click();
  })
});
