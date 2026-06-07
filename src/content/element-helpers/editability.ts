import { DEFAULTS, LIMITS } from '../../constants/appConstants';
import { FormFieldData } from '../../types';
import { getElementPosition } from '../../utils/common';
import { getCurrentTimestamp } from '../../utils/helpers';
import { ASSISTANT_INPUT_TYPES, FillableElement, HTML_EDITOR_IFRAME_SELECTOR, HTML_EDITOR_SELECTOR, INLINE_HTML_EDITOR_SELECTOR, NativeEditableElement, TEXT_ACTION_INPUT_TYPES } from './types-and-selectors';

export function getElementName(element: Element): string {
  return (element as HTMLInputElement | HTMLSelectElement).name || '';
}

export function getElementType(element: Element): string {
  if (element instanceof HTMLInputElement) {
    return (element.type || 'text').toLowerCase();
  }

  return element.tagName.toLowerCase();
}

export function getFrameDocument(iframe: HTMLIFrameElement): Document | null {
  try {
    return iframe.contentDocument || iframe.contentWindow?.document || null;
  } catch {
    return null;
  }
}

export function getLinkedSourceElement(iframe: HTMLIFrameElement): NativeEditableElement | null {
  const sourceId = iframe.id.endsWith('_ifr') ? iframe.id.slice(0, -4) : '';
  const source = sourceId ? document.getElementById(sourceId) : null;
  return isNativeEditableElement(source) ? source : null;
}

export function getIframeEditorBody(iframe: HTMLIFrameElement): HTMLElement | null {
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

export function isEditorIframeElement(element: Element | null): element is HTMLIFrameElement {
  if (!(element instanceof HTMLIFrameElement)) {
    return false;
  }

  if (!element.matches(HTML_EDITOR_IFRAME_SELECTOR)) {
    return false;
  }

  return !!getIframeEditorBody(element);
}

export function getReadableName(value: string): string {
  return value
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase())
    .trim();
}

export function hasEditableContent(element: HTMLElement): boolean {
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
