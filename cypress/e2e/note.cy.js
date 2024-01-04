describe('template spec', () => {
  it('passes', () => {
    cy.visit('../../playground/index.html');
    cy.get('.ce-paragraph.cdx-block').focus().type('hello world').trigger('mousedown')
      .then(($el) => {
        const el = $el[0]
        const document = el.ownerDocument
        const range = document.createRange()
        range.selectNodeContents(el)
        document.getSelection().removeAllRanges(range)
        document.getSelection().addRange(range)
      })
      .trigger('mouseup')
    cy.document().trigger('selectionchange')
  })
});
