import { DEFAULTS, LIMITS } from '../../constants/appConstants';
import { FormFieldData } from '../../types';
import { getElementPosition } from '../../utils/common';
import { getCurrentTimestamp } from '../../utils/helpers';
import { FillableElement, ScannedFormField } from './types-and-selectors';
import { getElementName, getElementType, getLinkedSourceElement, getReadableName, isEditorIframeElement } from './editability';
import { getFieldTypeForElement } from './editable-values';
import { getElementLocators, getElementSelector, getSelector, getTestId } from './locators';

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
