import { DEFAULTS, LIMITS } from '../../constants/appConstants';
import { FormFieldData } from '../../types';
import { getElementPosition } from '../../utils/common';
import { getCurrentTimestamp } from '../../utils/helpers';
import { getElementName } from './editability';

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
