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

const loaded = {};

/**
 * Note Tool for the Editor.js
 *
 * Create and Edit note
 */
export default class Note {
  static get CSS() {
    return 'cdx-note';
  };
  static get shortcut() {
    return 'CMD+E';
  };
  static title = 'Note';

  constructor({ api, config }) {
    this.api = api;
    this.editor = config.editor;
    this.onNoteChange = config.onNoteChange;
    this.data = config.data;
    this.button = null;
    this.tag = 'NOTE';

    this.iconClasses = {
      base: this.api.styles.inlineToolButton,
      active: this.api.styles.inlineToolButtonActive
    };

    this.initMount();
  }

  static get isInline() {
    return true;
  }

  async getNoteById(id) {
    const durtation = 300;
    let queryCount = 0;
    const query = () => {
      return new Promise(async (resolve, rejected) => {
        const result = document.querySelector(`note[note-id="${id}"]`);
        if (result) {
          resolve(result);
        } else {
          if (queryCount > 10) {
            rejected('Note element is not exist');
          }

          queryCount++;
          setTimeout(() => {
            resolve(query());
          }, durtation);
        }
      })
    }
    const note = await query();
    return note;
  }

  async initMount() {
    for (const id in this.data) {
      if (loaded[id]) return;
      loaded[id] = true;
      const value = this.data[id];
      const note = await this.getNoteById(id);
      this.mountedNote(note, value);
    }
  }

  mountedNote(element, value) {
    const content = document.createElement('div');
    content.onclick = e => {
      instance.show();
    }
    content.appendChild(this.editor);

    if (this.editor.tagName === 'TEXTAREA') {
      this.editor.value = value || '';
      this.editor.oninput = () => {
        this.onNoteChange({ id: element.getAttribute('note-id'), content: this.editor.value })
      }
    }

    const instance = tippy(element, {
      arrow: true,
      content: content,
      trigger: 'click',
      theme: 'light',
    });
  }

  render() {
    this.button = document.createElement('button');
    this.button.type = 'button';
    this.button.classList.add(this.iconClasses.base);
    this.button.innerHTML = this.toolboxIcon;
    return this.button;
  }

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
  wrap(range) {
    let note = document.createElement(this.tag);
    note.setAttribute('note-id', generateId());
    note.classList.add(Note.CSS);

    note.appendChild(range.extractContents());
    range.insertNode(note);

    this.api.selection.expandToTag(note);
    this.mountedNote(note);
  }

  unwrap(termWrapper) {
    this.api.selection.expandToTag(termWrapper);

    let sel = window.getSelection();
    let range = sel.getRangeAt(0);

    let unwrappedContent = range.extractContents();

    termWrapper.parentNode.removeChild(termWrapper);
    range.insertNode(unwrappedContent);

    sel.removeAllRanges();
    sel.addRange(range);
  }

  checkState(selection) {
    const nested = Boolean(selection.anchorNode.nextElementSibling) && selection.anchorNode.nextElementSibling.tagName === 'NOTE';
    if (nested) {
      this.button.classList.toggle(this.iconClasses.active, false);
      return;
    }

    const termTag = this.api.selection.findParentTag(this.tag, Note.CSS);
    this.button.classList.toggle(this.iconClasses.active, !!termTag);
  }

  get toolboxIcon() {
    return IconMarker;
  }

  static get sanitize() {
    return {
      note: {
        class: Note.CSS,
        'note-id': true,
      }
    };
  }
}
