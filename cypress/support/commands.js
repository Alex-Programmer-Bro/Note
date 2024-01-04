Cypress.Commands.add('selectText', function(text) {
  cy.contains(text).then(($el) => {
    const el = $el[0];
    const document = el.ownerDocument;
    
    const range = document.createRange();
    range.selectNodeContents(el);

    const fullText = el.textContent || "";
    const startIndex = fullText.indexOf(text);
    const endIndex = startIndex + text.length;

    if (startIndex !== -1 && endIndex !== -1) {
      range.setStart(el.firstChild, startIndex);
      range.setEnd(el.firstChild, endIndex);

      const selection = document.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);

      $el.trigger('mouseup');
      cy.document().trigger('selectionchange');
    } else {
      throw new Error(`The text "${text}" was not found in the element`);
    }
  });
});
