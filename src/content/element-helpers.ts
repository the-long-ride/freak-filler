/**
 * Helper functions for extracting element identifiers
 */

/**
 * Get element locators (testId and querySelector)
 * @param inputElement - The input element
 * @returns Object with testId and querySelector
 */
function getElementLocators(inputElement: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): { testId: string; querySelector: string } {
  // Get field identifiers
  const testId = inputElement.getAttribute('data-testid') || inputElement.id || '';

  // Build querySelector - only if element doesn't have data-testid
  let querySelector = '';
  if (inputElement.id) {
    querySelector = `#${inputElement.id}`;
  } else if (!inputElement.getAttribute('data-testid')) {
    // Try to find id or data-testid in parent hierarchy (up to 7 levels)
    let element = inputElement.parentElement;
    let foundId = '';
    let foundTestId = '';
    let levelsUp = 0;
    const pathElements: HTMLElement[] = [];

    for (let i = 0; i < 7 && element; i++) {
      pathElements.push(element);
      if (!foundId && element.id) {
        foundId = element.id;
        levelsUp = i + 1;
      }
      if (!foundTestId && element.getAttribute('data-testid')) {
        foundTestId = element.getAttribute('data-testid') || '';
        levelsUp = i + 1;
        break;
      }
      element = element.parentElement;
    }

    if (foundId || foundTestId) {
      // Build selector using parent's id or data-testid with exact path
      const parentSelector = foundId ? `#${foundId}` : `[data-testid=\'${foundTestId}\']`;
      const pathParts = [parentSelector];

      // Add each level in the path
      for (let i = levelsUp - 2; i >= 0; i--) {
        pathParts.push(pathElements[i].tagName.toLowerCase());
      }

      // Add the input element itself
      const tagName = inputElement.tagName.toLowerCase();
      let inputSelector = tagName;

      // Add more specificity if needed - use single quotes to avoid HTML attribute conflicts
      const inputType = inputElement.getAttribute('type');
      if (inputType) {
        inputSelector += `[type='${inputType}']`;
      }
      const inputName = inputElement.getAttribute('name');
      if (inputName) {
        inputSelector += `[name='${inputName}']`;
      }

      pathParts.push(inputSelector);
      querySelector = pathParts.join(' > ');
    }
  }

  return { testId, querySelector };
}

/**
 * Get the data-testid attribute or fall back to element id
 * @param element - The input element
 * @returns The test ID or empty string
 */
export function getTestId(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): string {
  return getElementLocators(element).testId;
}

/**
 * Get the CSS selector for an element
 * @param element - The input element
 * @returns A CSS selector string or empty string
 */
export function getSelector(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): string {
  return getElementLocators(element).querySelector;
}

/**
 * Get element selector prioritizing data-testid
 * @param element - The input element
 * @returns data-testid if available, otherwise querySelector
 */
export function getElementSelector(element: Element | null): string {
  if (!element) return '';

  const el = element as HTMLElement;

  // Prefer explicit id first (higher priority)
  if (el.id) return `${el.tagName.toLowerCase()}#${el.id}`;

  // Then prefer explicit data-testid
  const testId = el.getAttribute('data-testid');
  if (testId) return `${el.tagName.toLowerCase()}[data-testid='${testId}']`;

  // Search up the parent chain for an anchor id or data-testid (up to 7 levels)
  let parent = el.parentElement;
  let foundId = '';
  let foundTestId = '';
  let levelsUp = 0;
  const pathElements: HTMLElement[] = [];

  for (let i = 0; i < 7 && parent; i++) {
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
    const parentSelector = foundId ? `#${foundId}` : `[data-testid=\'${foundTestId}\']`;
    const pathParts = [parentSelector];

    for (let i = levelsUp - 2; i >= 0; i--) {
      pathParts.push(pathElements[i].tagName.toLowerCase());
    }

    // Build element selector with some specificity
    const tagName = el.tagName.toLowerCase();
    let elemSelector = tagName;
    const inputType = el.getAttribute('type');
    if (inputType) elemSelector += `[type='${inputType}']`;
    const inputName = el.getAttribute('name');
    if (inputName) elemSelector += `[name='${inputName}']`;
    const classes = Array.from(el.classList).filter(Boolean);
    if (classes.length > 0) {
      elemSelector += `.${classes[0]}`;
    }

    pathParts.push(elemSelector);
    return pathParts.join(' > ');
  }

  // Fallback: build a local selector using tag + class/name or nth-child
  let selector = el.tagName.toLowerCase();
  const classes = Array.from(el.classList).filter(Boolean);
  const nameAttr = el.getAttribute('name');
  if (nameAttr) {
    selector += `[name='${nameAttr}']`;
    return selector;
  }
  if (classes.length > 0) {
    selector += `.${classes[0]}`;
    return selector;
  }

  // Last resort: use parent > tag:nth-child(index)
  const parentEl = el.parentElement;
  if (parentEl) {
    const children = Array.from(parentEl.children);
    const idx = children.indexOf(el) + 1;
    const parentTag = parentEl.tagName.toLowerCase();
    selector = `${parentTag} > ${el.tagName.toLowerCase()}:nth-child(${idx})`;
  }

  return selector;
}

/**
 * Auto-populate test ID and selector inputs
 * @param element - The input element
 * @param testIdInput - The test ID input field
 * @param selectorInput - The selector input field
 */
export function populateIdentifiers(
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  testIdInput: HTMLInputElement,
  selectorInput: HTMLInputElement
): void {
  testIdInput.value = getTestId(element);
  selectorInput.value = getSelector(element);
}
