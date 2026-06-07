import { DEFAULTS, LIMITS } from '../../constants/appConstants';
import { FormFieldData } from '../../types';
import { getElementPosition } from '../../utils/common';
import { getCurrentTimestamp } from '../../utils/helpers';
import { FillableElement } from './types-and-selectors';
import { getIframeEditorBody, getLinkedSourceElement, isHtmlEditorElement, isEditorIframeElement } from './editability';

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
