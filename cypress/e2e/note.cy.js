describe('manage note', () => {
  beforeEach(() => {
    cy.visit('../../playground/index.html');
  });

  it('Successfully create a note', () => {
    cy.get('.ce-paragraph.cdx-block').focus().type('hello note');
    cy.selectText('note')
    cy.get('body').type('{cmd}e', { release: false });
    cy.get('note').should('be.visible').click();
    cy.expectStyle('note', { borderBottom: '1px solid rgb(221, 221, 221)' });
    cy.get('textarea').type('This is a note.'); 
    cy.reloadPL();
  });
});
