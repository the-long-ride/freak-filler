import { DEFAULTS, LIMITS } from '../constants/appConstants';
import { FormFieldData } from '../types';
import { getElementPosition } from '../utils/common';
import { getCurrentTimestamp } from '../utils/helpers';

export type NativeEditableElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
export type HtmlEditorElement = HTMLElement | HTMLIFrameElement;
export type FillableElement = NativeEditableElement | HtmlEditorElement;
export type ScannedFormField = FormFieldData & { position: { top: number; left: number } };

const ASSISTANT_INPUT_TYPES = new Set([
  'text',
  'date',
  'datetime-local',
  'email',
  'tel',
  'number',
  'search',
  'url',
  'range',
  'color',
  'password'
]);

const TEXT_ACTION_INPUT_TYPES = new Set([
  'text',
  'search',
  'url',
  'tel',
  'email',
  'password',
  'number'
]);

export const INLINE_HTML_EDITOR_SELECTOR = [
  '[contenteditable="true"]',
  '[contenteditable="plaintext-only"]',
  '[contenteditable=""]',
  '[role="textbox"][contenteditable]',

  '.alloy-editor[contenteditable]',
  '.ce-block__content[contenteditable]',
  '.ce-paragraph[contenteditable]',
  '.ck-editor__editable[contenteditable]',
  '.ck-editor__editable_inline[contenteditable]',
  '.cke_editable[contenteditable]',
  '.ck-content[contenteditable]',
  '.codex-editor [contenteditable]',
  '.editor-input[contenteditable]',
  '.fr-element[contenteditable]',
  '.jodit-wysiwyg[contenteditable]',
  '.medium-editor-element[contenteditable]',
  '.mce-content-body[contenteditable]',
  '.mce-edit-focus[contenteditable]',
  '.note-editable[contenteditable]',
  '.pell-content[contenteditable]',
  '.public-DraftEditor-content[contenteditable]',
  '.ql-editor[contenteditable]',
  '.redactor-in[contenteditable]',
  '.se-wrapper-wysiwyg[contenteditable]',
  '.scribe-editor[contenteditable]',
  '.st-editor__editable[contenteditable]',
  '.ProseMirror[contenteditable]',
  '.tiptap[contenteditable]',
  '.toastui-editor-contents[contenteditable]',
  '.trumbowyg-editor[contenteditable]',
  '.wym_iframe body[contenteditable]',
  '[data-contents="true"][contenteditable]',
  '[data-lexical-editor="true"]',
  '[data-medium-editor-element="true"]',
  '[data-slate-editor="true"]',
  '[data-testid*="editor" i][contenteditable]',
  '[class*="wysiwyg" i][contenteditable]',
  '[class*="rich-text" i][contenteditable]',
  '[class*="rte" i][contenteditable]',
  'trix-editor',
  'wysiwyg-editor'
].join(', ');

export const HTML_EDITOR_IFRAME_SELECTOR = [
  '.cke_wysiwyg_frame',
  '.fr-iframe',
  '.jodit-wysiwyg_iframe',
  '.mce-edit-area iframe',
  '.redactor-box iframe',
  '.tox-edit-area iframe',
  '.tox-edit-area__iframe',
  '.wysihtml5-sandbox',
  'iframe[id$="_ifr"]',
  'iframe[name*="editor" i]',
  'iframe[title*="editor" i]',
  'iframe[title*="rich text" i]',
  'iframe[title*="wysiwyg" i]',
  'iframe[aria-label*="editor" i]',
  'iframe[aria-label*="rich text" i]'
].join(', ');

export const HTML_EDITOR_SELECTOR = [
  INLINE_HTML_EDITOR_SELECTOR,
  HTML_EDITOR_IFRAME_SELECTOR
].join(', ');

function getElementName(element: Element): string {
  return (element as HTMLInputElement | HTMLSelectElement).name || '';
}

function getElementType(element: Element): string {
  if (element instanceof HTMLInputElement) {
    return (element.type || 'text').toLowerCase();
  }

  return element.tagName.toLowerCase();
}

function getFrameDocument(iframe: HTMLIFrameElement): Document | null {
  try {
    return iframe.contentDocument || iframe.contentWindow?.document || null;
  } catch {
    return null;
  }
}

function getLinkedSourceElement(iframe: HTMLIFrameElement): NativeEditableElement | null {
  const sourceId = iframe.id.endsWith('_ifr') ? iframe.id.slice(0, -4) : '';
  const source = sourceId ? document.getElementById(sourceId) : null;
  return isNativeEditableElement(source) ? source : null;
}

function getIframeEditorBody(iframe: HTMLIFrameElement): HTMLElement | null {
  const frameDocument = getFrameDocument(iframe);
  if (!frameDocument?.body) {
    return null;
  }

  const body = frameDocument.body;
  const editable = body.matches(INLINE_HTML_EDITOR_SELECTOR)
    ? body
    : body.querySelector<HTMLElement>(INLINE_HTML_EDITOR_SELECTOR);

  return editable || body;
}

function isEditorIframeElement(element: Element | null): element is HTMLIFrameElement {
  if (!(element instanceof HTMLIFrameElement)) {
    return false;
  }

  if (!element.matches(HTML_EDITOR_IFRAME_SELECTOR)) {
    return false;
  }

  return !!getIframeEditorBody(element);
}

function getReadableName(value: string): string {
  return value
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase())
    .trim();
}

function hasEditableContent(element: HTMLElement): boolean {
  const contentEditable = element.getAttribute('contenteditable')?.toLowerCase();
  return (
    contentEditable === 'true' ||
    contentEditable === 'plaintext-only' ||
    contentEditable === '' ||
    element.hasAttribute('data-lexical-editor') ||
    element.hasAttribute('data-slate-editor') ||
    element.hasAttribute('data-medium-editor-element') ||
    (element.getAttribute('role') === 'textbox' && element.isContentEditable) ||
    element.tagName === 'TRIX-EDITOR'
  );
}

export function isNativeEditableElement(element: Element | null): element is NativeEditableElement {
  return !!element && (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement
  );
}

export function isHtmlEditorElement(element: Element | null): boolean {
  return isEditorIframeElement(element) || (element instanceof HTMLElement && hasEditableContent(element));
}

export function isNestedHtmlEditorElement(element: HTMLElement): boolean {
  const parentEditor = element.parentElement?.closest(HTML_EDITOR_SELECTOR);
  return !!parentEditor && isHtmlEditorElement(parentEditor);
}

export function isAssistantElement(element: Element | null): element is FillableElement {
  if (element instanceof HTMLInputElement) {
    return ASSISTANT_INPUT_TYPES.has((element.type || 'text').toLowerCase());
  }

  return (
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement ||
    isEditorIframeElement(element) ||
    isHtmlEditorElement(element)
  );
}

export function getAssistantElementFromTarget(target: EventTarget | Element | null): FillableElement | null {
  if (!(target instanceof Element)) {
    return null;
  }

  const element = target.closest(`input, textarea, select, ${HTML_EDITOR_SELECTOR}`);
  return isAssistantElement(element) ? element : null;
}

export function allowsTextActions(element: FillableElement): boolean {
  if (element instanceof HTMLTextAreaElement || isHtmlEditorElement(element)) {
    return true;
  }

  return element instanceof HTMLInputElement && TEXT_ACTION_INPUT_TYPES.has((element.type || 'text').toLowerCase());
}

export function dispatchValueEvents(element: Element): void {
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

export function getEditableValue(element: FillableElement): string {
  if (isEditorIframeElement(element)) {
    return getIframeEditorBody(element)?.innerHTML || '';
  }

  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) {
    return element.value;
  }

  const valueElement = element as HTMLElement & { value?: unknown };
  if (typeof valueElement.value === 'string') {
    return valueElement.value;
  }

  return element.innerHTML || element.textContent || '';
}

export function setEditableValue(element: FillableElement, value: string): void {
  if (isEditorIframeElement(element)) {
    const editorBody = getIframeEditorBody(element);
    if (editorBody) {
      editorBody.innerHTML = value;
      dispatchValueEvents(editorBody);
    }

    const source = getLinkedSourceElement(element);
    if (source) {
      source.value = value;
      dispatchValueEvents(source);
    }

    dispatchValueEvents(element);
    return;
  }

  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) {
    element.value = value;
    dispatchValueEvents(element);
    return;
  }

  const valueElement = element as HTMLElement & { value?: unknown };
  if (typeof valueElement.value === 'string') {
    valueElement.value = value;
  } else if (element.getAttribute('contenteditable')?.toLowerCase() === 'plaintext-only') {
    element.textContent = value;
  } else {
    element.innerHTML = value;
  }

  dispatchValueEvents(element);
}

export function getFieldTypeForElement(element: FillableElement): FormFieldData['type'] {
  if (isHtmlEditorElement(element)) {
    return 'htmlEditor';
  }

  if (element instanceof HTMLSelectElement) {
    return 'dropdown';
  }

  if (element instanceof HTMLTextAreaElement) {
    return 'text';
  }

  if (element instanceof HTMLInputElement) {
    switch ((element.type || 'text').toLowerCase()) {
      case 'search':
        return 'search';
      case 'checkbox':
        return 'checkbox';
      case 'radio':
        return 'radio';
      case 'range':
        return 'range';
      case 'number':
        return 'number';
      case 'color':
        return 'color';
      case 'date':
      case 'datetime-local':
        return 'datepicker';
      default:
        return 'text';
    }
  }

  return 'text';
}

export function getElementLocators(element: Element): { testId: string; querySelector: string } {
  const testId = element.getAttribute('data-testid') || (element as HTMLElement).id || '';

  let querySelector = '';
  if ((element as HTMLElement).id) {
    querySelector = `#${(element as HTMLElement).id}`;
  } else if (!element.getAttribute('data-testid')) {
    let parent = element.parentElement;
    let foundId = '';
    let foundTestId = '';
    let levelsUp = 0;
    const pathElements: HTMLElement[] = [];

    for (let i = 0; i < LIMITS.PARENT_SEARCH_DEPTH && parent; i++) {
      pathElements.push(parent);
      if (!foundId && parent.id) {
        foundId = parent.id;
        levelsUp = i + 1;
      }
      if (!foundTestId && parent.getAttribute('data-testid')) {
        foundTestId = parent.getAttribute('data-testid') || '';
        levelsUp = i + 1;
        break;
      }
      parent = parent.parentElement;
    }

    if (foundId || foundTestId) {
      const parentSelector = foundId ? `#${foundId}` : `[data-testid='${foundTestId}']`;
      const pathParts = [parentSelector];

      for (let i = levelsUp - 2; i >= 0; i--) {
        pathParts.push(pathElements[i].tagName.toLowerCase());
      }

      const tagName = element.tagName.toLowerCase();
      let elementSelector = tagName;
      const inputType = element.getAttribute('type');
      const inputName = getElementName(element);

      if (inputType) {
        elementSelector += `[type='${inputType}']`;
      }
      if (inputName) {
        elementSelector += `[name='${inputName}']`;
      }

      pathParts.push(elementSelector);
      querySelector = pathParts.join(' > ');
    }
  }

  return { testId, querySelector };
}

export function getTestId(element: Element): string {
  return getElementLocators(element).testId;
}

export function getSelector(element: Element): string {
  return getElementLocators(element).querySelector;
}

export function getElementSelector(element: Element | null): string {
  if (!element) return '';

  const el = element as HTMLElement;

  if (el.id) return `${el.tagName.toLowerCase()}#${el.id}`;

  const testId = el.getAttribute('data-testid');
  if (testId) return `${el.tagName.toLowerCase()}[data-testid='${testId}']`;

  let parent = el.parentElement;
  let foundId = '';
  let foundTestId = '';
  let levelsUp = 0;
  const pathElements: HTMLElement[] = [];

  for (let i = 0; i < LIMITS.PARENT_SEARCH_DEPTH && parent; i++) {
    pathElements.push(parent);
    if (!foundId && parent.id) {
      foundId = parent.id;
      levelsUp = i + 1;
    }
    if (!foundTestId && parent.getAttribute('data-testid')) {
      foundTestId = parent.getAttribute('data-testid') || '';
      levelsUp = i + 1;
    }
    parent = parent.parentElement;
  }

  if (foundId || foundTestId) {
    const parentSelector = foundId ? `#${foundId}` : `[data-testid='${foundTestId}']`;
    const pathParts = [parentSelector];

    for (let i = levelsUp - 2; i >= 0; i--) {
      pathParts.push(pathElements[i].tagName.toLowerCase());
    }

    const tagName = el.tagName.toLowerCase();
    let elementSelector = tagName;
    const inputType = el.getAttribute('type');
    const inputName = getElementName(el);
    const classes = Array.from(el.classList).filter(Boolean);

    if (inputType) elementSelector += `[type='${inputType}']`;
    if (inputName) elementSelector += `[name='${inputName}']`;
    if (classes.length > 0) elementSelector += `.${classes[0]}`;

    pathParts.push(elementSelector);
    return pathParts.join(' > ');
  }

  let selector = el.tagName.toLowerCase();
  const classes = Array.from(el.classList).filter(Boolean);
  const nameAttr = getElementName(el);
  if (nameAttr) {
    selector += `[name='${nameAttr}']`;
    return selector;
  }
  if (classes.length > 0) {
    selector += `.${classes[0]}`;
    return selector;
  }

  const parentEl = el.parentElement;
  if (parentEl) {
    const children = Array.from(parentEl.children);
    const index = children.indexOf(el) + 1;
    selector = `${parentEl.tagName.toLowerCase()} > ${el.tagName.toLowerCase()}:nth-child(${index})`;
  }

  return selector;
}

export function getElementLabel(element: FillableElement): string {
  if (isEditorIframeElement(element)) {
    const source = getLinkedSourceElement(element);
    if (source) {
      return getElementLabel(source);
    }
  }

  const closestLabel = element.closest('label');
  if (closestLabel && closestLabel.textContent?.trim()) {
    return closestLabel.textContent.trim();
  }

  if (element.id) {
    const labelFor = document.querySelector(`label[for="${element.id}"]`);
    if (labelFor && labelFor.textContent?.trim()) {
      return labelFor.textContent.trim();
    }
  }

  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const labelText = labelledBy
      .split(/\s+/)
      .map(id => document.getElementById(id)?.textContent?.trim() || '')
      .filter(Boolean)
      .join(' ');
    if (labelText) {
      return labelText;
    }
  }

  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel?.trim()) return ariaLabel.trim();

  if (element.title?.trim()) return element.title.trim();

  const placeholder = element.getAttribute('placeholder');
  if (placeholder?.trim()) return placeholder.trim();

  const name = getElementName(element);
  if (name.trim()) return name.trim();

  const testId = element.getAttribute('data-testid');
  if (testId?.trim()) return testId.trim();

  if (element.id?.trim()) return element.id.trim();

  const ownText = (element.textContent || '').trim();
  let parent = element.parentElement;
  for (let i = 0; i < 3 && parent; i++) {
    if (parent.tagName === 'FORM' || (parent.tagName === 'DIV' && parent.children.length > 5)) {
      parent = parent.parentElement;
      continue;
    }

    const cleanText = (parent.textContent || '').replace(ownText, '').trim();
    if (cleanText && cleanText.length < 50) {
      return cleanText;
    }

    parent = parent.parentElement;
  }

  const prevSibling = element.previousElementSibling;
  if (prevSibling && prevSibling.textContent?.trim()) {
    const text = prevSibling.textContent.trim();
    if (text.length < 50) return text;
  }

  if (name) return getReadableName(name);
  if (element.id) return getReadableName(element.id);

  const typeLabels: Record<string, string> = {
    text: 'Text Field',
    email: 'Email',
    password: 'Password',
    tel: 'Phone',
    url: 'Website',
    search: 'Search',
    number: 'Number',
    range: 'Range',
    date: 'Date',
    'datetime-local': 'Date & Time',
    color: 'Color',
    checkbox: 'Checkbox',
    radio: 'Radio Button',
    htmlEditor: 'HTML Editor'
  };

  return typeLabels[getFieldTypeForElement(element)] || typeLabels[getElementType(element)] || 'Form Field';
}

export function createScannedField(
  element: FillableElement,
  type: FormFieldData['type'],
  value: FormFieldData['value'],
  order: number
): ScannedFormField {
  const { testId, querySelector } = getElementLocators(element);
  const timestamp = getCurrentTimestamp();

  return {
    id: `${Date.now()}_${order - 1}`,
    type,
    title: getElementLabel(element),
    value,
    testId,
    querySelector: querySelector || getElementSelector(element),
    fillDelay: DEFAULTS.FILL_DELAY,
    autoBlur: DEFAULTS.AUTO_BLUR,
    createdAt: timestamp,
    updatedAt: timestamp,
    order,
    position: getElementPosition(element)
  };
}

export function populateIdentifiers(
  element: Element,
  testIdInput: HTMLInputElement,
  selectorInput: HTMLInputElement
): void {
  testIdInput.value = getTestId(element);
  selectorInput.value = getSelector(element);
}
