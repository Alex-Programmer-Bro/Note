Cypress.Commands.add('selectText', function (text) {
  cy.contains(text).then(($el) => {
    const el = $el[0];
    const document = el.ownerDocument;
    const selection = document.getSelection();
    const range = document.createRange();

    const fullText = el.textContent || "";
    const startIndex = fullText.indexOf(text);
    const endIndex = startIndex + text.length;

    if (startIndex === -1 || endIndex > fullText.length) {
      throw new Error(`The text "${text}" was not found in the element`);
    }

    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
    let node;
    let currentNodeStartIndex = 0;

    while ((node = walker.nextNode())) {
      const nodeTextLength = node.textContent.length;

      if (currentNodeStartIndex <= startIndex && (currentNodeStartIndex + nodeTextLength) > startIndex) {
        range.setStart(node, startIndex - currentNodeStartIndex);
      }

      if (currentNodeStartIndex < endIndex && (currentNodeStartIndex + nodeTextLength) >= endIndex) {
        range.setEnd(node, endIndex - currentNodeStartIndex);
        break;
      }

      currentNodeStartIndex += nodeTextLength;
    }

    if (!range.collapsed) {
      selection.removeAllRanges();
      selection.addRange(range);
      $el.trigger('mouseup');
      cy.document().trigger('selectionchange');
    } else {
      throw new Error(`The text "${text}" was not found in the element`);
    }
  });
});



Cypress.Commands.add('expectStyle', (selector, styles = {}) => {
  for (const key in styles) {
    cy.get(selector).should('have.css', key, styles[key])
  }
})
