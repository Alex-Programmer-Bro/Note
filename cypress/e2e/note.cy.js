describe('manage note', () => {
  beforeEach(() => {
    cy.visit('../../playground/index.html');
  });

  it('Successfully create a note', () => {
    cy.get('.ce-paragraph.cdx-block').focus().type('hello note');
    cy.selectText('note');
    cy.get('[data-tool="Note"]').click();
    cy.get('note').should('be.visible').click();
    cy.expectStyle('note', { borderBottom: '1px solid rgb(221, 221, 221)' });
    cy.reloadPL();
    cy.get('note').should('be.visible').should('have.text', 'note').click();
  });

  it('Successfully create nested note', () => {
    cy.get('.ce-paragraph.cdx-block').focus().type('hello world');
    cy.selectText('world');
    cy.get('[data-tool="Note"]').click();
    cy.get('note').should('be.visible').click();
    cy.selectText('hello world');
    cy.get('[data-tool="Note"]').should('have.not.class', 'ce-inline-tool--active').click();
    cy.get('body').find('note').its('length').should('eq', 2);
    cy.get('note[note-id]').should('be.visible').should('have.text', 'world').click();
    cy.expectStyle('note[note-id]', { backgroundColor: 'rgb(221, 221, 221)' });
  })
});
