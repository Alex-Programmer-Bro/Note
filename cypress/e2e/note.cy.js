describe('note', () => {
  beforeEach(() => {
    cy.visit('../../playground/index.html');
  })

  it('selected a word', () => {
    cy.get('.ce-paragraph.cdx-block').focus().type('hello world');
    cy.selectText('world');
    cy.get('[data-tool="Note"]').click();
    cy.get('note').should('be.visible').click();
    cy.expectStyle('note', { borderBottom: '1px solid rgb(221, 221, 221)' })
  });

  it.only('nested selecte', () => {
    cy.get('.ce-paragraph.cdx-block').focus().type('hello world');
    cy.selectText('world');
    cy.get('[data-tool="Note"]').click();
    cy.get('note').should('be.visible').click();
    cy.selectText('hello world');
    cy.get('[data-tool="Note"]').should('have.not.class', 'ce-inline-tool--active');
  })
});
