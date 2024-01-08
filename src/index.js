/**
 * Build styles
 */
import './index.css';
import { IconMarker } from '@codexteam/icons'
import tippy from 'tippy.js';
import "tippy.js/dist/tippy.css";
import 'tippy.js/themes/light.css';

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

function generateId(length = 6) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
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
  constructor({ api, config }) {
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

  mountedNote(element) {
    const noteEditor = document.createElement('textarea');
    noteEditor.oninput = () => {
    }
    noteEditor.classList.add('note-editor')
    noteEditor.onclick = e => {
      instance.show();
    }
    const instance = tippy(element, {
      arrow: true,
      content: noteEditor,
      trigger: 'click',
      theme: 'light',
    });
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

    this.api.selection.expandToTag(note);
    this.mountedNote(note);
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
      note: {
        class: Note.CSS,
        'note-id': true,
      }
    };
  }
}
