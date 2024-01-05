/**
 * Build styles
 */
import './index.css';
import { IconMarker } from '@codexteam/icons'

function getSelectedTextParentElement(range) {
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    let container = range.commonAncestorContainer;
    while (container && container.nodeType !== Node.ELEMENT_NODE) {
      container = container.parentNode;
    }
    return container;
  }
  return null;
}

/**
 * Note Tool for the Editor.js
 *
 * Create and Edit note
 */
export default class Note {
  /**
   * Class name for term-tag
   *
   * @type {string}
   */
  static get CSS() {
    return 'cdx-note';
  };
  static get shortcut() {
    return 'CMD+E';
  };

  static title = 'Note';

  /**
   * @param {{api: object}}  - Editor.js API
   */
  constructor({ api }) {
    this.api = api;

    /**
     * Toolbar Button
     *
     * @type {HTMLElement|null}
     */
    this.button = null;

    /**
     * Tag represented the term
     *
     * @type {string}
     */
    this.tag = 'NOTE';

    /**
     * CSS classes
     */
    this.iconClasses = {
      base: this.api.styles.inlineToolButton,
      active: this.api.styles.inlineToolButtonActive
    };
  }

  /**
   * Specifies Tool as Inline Toolbar Tool
   *
   * @return {boolean}
   */
  static get isInline() {
    return true;
  }

  /**
   * Create button element for Toolbar
   *
   * @return {HTMLElement}
   */
  render() {
    this.button = document.createElement('button');
    this.button.type = 'button';
    this.button.classList.add(this.iconClasses.base);
    this.button.innerHTML = this.toolboxIcon;
    return this.button;
  }

  /**
   * Wrap/Unwrap selected fragment
   *
   * @param {Range} range - selected fragment
   */
  surround(range) {
    if (!range) {
      return;
    }

    let termWrapper = this.api.selection.findParentTag(this.tag, Note.CSS);
    const parentElement = getSelectedTextParentElement(range);
    const hasNote = Boolean(parentElement.querySelector(this.tag));

    /**
     * If start or end of selection is in the highlighted block
     */
    if (termWrapper && !hasNote) {
      this.unwrap(termWrapper);
    } else {
      this.wrap(range);
    }
  }

  /**
   * Wrap selection with term-tag
   *
   * @param {Range} range - selected fragment
   */
  wrap(range) {
    /**
     * Create a wrapper for highlighting
     */
    let note = document.createElement(this.tag);

    note.classList.add(Note.CSS);

    /**
     * SurroundContent throws an error if the Range splits a non-Text node with only one of its boundary points
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Range/surroundContents}
     *
     * // range.surroundContents(span);
     */
    note.appendChild(range.extractContents());
    range.insertNode(note);

    /**
     * Expand (add) selection to highlighted block
     */
    console.log(console.log(note));
    this.api.selection.expandToTag(note);
  }

  /**
   * Unwrap term-tag
   *
   * @param {HTMLElement} termWrapper - term wrapper tag
   */
  unwrap(termWrapper) {
    /**
     * Expand selection to all term-tag
     */
    this.api.selection.expandToTag(termWrapper);

    let sel = window.getSelection();
    let range = sel.getRangeAt(0);

    let unwrappedContent = range.extractContents();

    /**
     * Remove empty term-tag
     */
    termWrapper.parentNode.removeChild(termWrapper);

    /**
     * Insert extracted content
     */
    range.insertNode(unwrappedContent);

    /**
     * Restore selection
     */
    sel.removeAllRanges();
    sel.addRange(range);
  }

  /**
   * Check and change Term's state for current selection
   */
  checkState(selection) {
    const nested = Boolean(selection.anchorNode.nextElementSibling) && selection.anchorNode.nextElementSibling.tagName === 'NOTE';
    if (nested) {
      this.button.classList.toggle(this.iconClasses.active, false);
      return;
    }

    const termTag = this.api.selection.findParentTag(this.tag, Note.CSS);
    this.button.classList.toggle(this.iconClasses.active, !!termTag);
  }

  /**
   * Get Tool icon's SVG
   * @return {string}
   */
  get toolboxIcon() {
    return IconMarker;
  }

  /**
   * Sanitizer rule
   * @return {{mark: {class: string}}}
   */
  static get sanitize() {
    return {
      mark: {
        class: Note.CSS
      }
    };
  }
}

