import { StorageService } from '../services/storage.service';
import { FormFieldData, ExtensionSettings } from '../types';
import { setupSaveSection } from './save-section';
import { setupImportSection, setCurrentInputElement } from './import-section';
import { getElementSelector } from './element-helpers';
import { isElementVisible, getElementPosition, escapeHtml } from '../utils/common';
import { getCurrentTimestamp, generateRandomString, getCharacterSet, generateFromRegex, getElementLocators } from '../utils/helpers';
// ICON_MAP not used in this file anymore
import { DEFAULTS, LIMITS } from '../constants/appConstants';
import { showNotification } from '../utils/notification';

let autoFillPopup: HTMLElement | null = null;
let currentInputElement: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null = null;
let currentSettings: ExtensionSettings | null = null;
let isMouseOverPopup = false;
let contextInvalidated = false;
let lastContextMenuTarget: Element | null = null;
let lastContextMenuTargetType: string | null = null;

// Check if extension context is valid
function isExtensionContextValid(): boolean {
  if (contextInvalidated) return false;
  try {
    if (!chrome.runtime?.id) {
      contextInvalidated = true;
      return false;
    }
    return true;
  } catch {
    contextInvalidated = true;
    return false;
  }
}

// Initialize
async function init() {
  try {
    if (!isExtensionContextValid()) {
      console.warn('Freak Filler: Extension context invalid at init');
      return;
    }

    currentSettings = await StorageService.getSettings();

    // Always attach listeners - the popup shows based on settings
    attachInputListeners();
  } catch (error) {
    console.warn('Freak Filler: Failed to initialize, extension may have been reloaded');
    contextInvalidated = true;
    return;
  }

  // Listen for settings changes
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.formFillerSettings) {
      currentSettings = changes.formFillerSettings.newValue;
    }
  });
}

// Attach listeners to input fields
function attachInputListeners() {
  document.addEventListener('focusin', handleInputFocus);
  document.addEventListener('focusout', handleInputFocusOut);
  document.addEventListener('click', handleInputClick);
  document.addEventListener('contextmenu', handleContextMenu);
}

// Handle input click (for live assistant mode)
async function handleInputClick(event: Event) {
  // Early exit if context is invalid
  if (!isExtensionContextValid()) {
    return;
  }

  // Only handle if live assistant is enabled
  if (!currentSettings?.enableLiveAssistant) {
    return;
  }

  // Check if any feature is enabled
  if (
    !currentSettings?.enableSaveValue && 
    !currentSettings?.enableImportValue && 
    !currentSettings?.enableRandomStringInAssistant &&
    !currentSettings?.enableLocatorRetriever &&
    !currentSettings?.enableRegexPattern
  ) {
    return;
  }

  const target = event.target as HTMLElement;

  // Prevent showing popup if the clicked element is inside our own popup
  if (target.closest('.form-filler-popup')) {
    return;
  }

  // Handle text inputs, textareas, date pickers, and dropdowns
  if ((target.tagName === 'INPUT' && ['text', 'date', 'datetime-local', 'email', 'tel', 'number', 'search', 'url', 'range', 'color'].includes((target as HTMLInputElement).type)) ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT') {
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) {
      currentInputElement = target as HTMLInputElement;
      try {
        await showFillingAssistantPopup(currentInputElement);
      } catch (error) {
        console.warn('Freak Filler: Unable to show popup, extension context may be invalid');
        contextInvalidated = true;
        removePopup();
      }
    }
  }
}

// Handle input focus
async function handleInputFocus(event: Event) {
  // Early exit if context is invalid
  if (!isExtensionContextValid()) {
    return;
  }

  // If live assistant is ENABLED, handle in click event instead
  // If live assistant is DISABLED, don't show assistant at all (context menu only)
  if (currentSettings?.enableLiveAssistant !== undefined) {
    return;
  }

  // Check if any feature is enabled
  if (!currentSettings?.enableSaveValue && !currentSettings?.enableImportValue) {
    return;
  }

  const target = event.target as HTMLElement;

  // Prevent showing popup if the focused element is inside our own popup
  if (target.closest('.form-filler-popup')) {
    return;
  }

  if ((target.tagName === 'INPUT' && !['submit', 'reset'].includes((target as HTMLInputElement).type)) ||
    target.tagName === 'TEXTAREA') {
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      currentInputElement = target as HTMLInputElement;
      try {
        await showFillingAssistantPopup(currentInputElement);
      } catch (error) {
        console.warn('Freak Filler: Unable to show popup, extension context may be invalid');
        contextInvalidated = true;
        removePopup();
      }
    }
  }
}

// Handle context menu to track target element
function handleContextMenu(event: Event) {
  const mouseEvent = event as MouseEvent;
  const initial = (document.elementFromPoint(mouseEvent.clientX, mouseEvent.clientY) as HTMLElement) || (event.target as HTMLElement);

  // First priority: Editable controls (inputs, textareas, selects, contenteditable) - check if clicked element or ancestor is editable
  const editable = initial.closest('input, textarea, select, [contenteditable]') as HTMLElement | null;
  if (editable) {
    lastContextMenuTarget = editable;
    lastContextMenuTargetType = 'editable';
  } else {
    // Second priority: data-testid on the exact element or its ancestors
    const dataTestEl = initial.closest('[data-testid]') as HTMLElement | null;
    if (dataTestEl) {
      lastContextMenuTarget = dataTestEl;
      lastContextMenuTargetType = 'data-testid';
    } else if (initial.id) {
      // Third priority: use nearest ancestor with id
      const idEl = initial.closest('[id]') as HTMLElement | null;
      lastContextMenuTarget = idEl || initial;
      lastContextMenuTargetType = 'id';
    } else {
      // Label-associated controls
      const label = initial.closest('label');
      if (label) {
        const forId = label.getAttribute('for');
        if (forId) {
          const associated = document.getElementById(forId) as HTMLElement | null;
          if (associated) {
            lastContextMenuTarget = associated;
            lastContextMenuTargetType = 'label-associated';
          }
        } else {
          const inner = label.querySelector('input, textarea, select') as HTMLElement | null;
          if (inner) {
            lastContextMenuTarget = inner;
            lastContextMenuTargetType = 'label-associated';
          }
        }
      }

      // Clickable or media elements
      if (!lastContextMenuTarget) {
        const clickEl = initial.closest('button, a, img') as HTMLElement | null;
        if (clickEl) {
          lastContextMenuTarget = clickEl;
          lastContextMenuTargetType = clickEl.tagName.toLowerCase();
        }
      }

      // Fallback to the initial element
      if (!lastContextMenuTarget) {
        lastContextMenuTarget = initial;
        lastContextMenuTargetType = initial.tagName.toLowerCase();
      }
    }
  }

  // Log helpful debug info
  const best = lastContextMenuTarget as HTMLElement;
  const testId = best?.getAttribute('data-testid');
  const id = best?.id;
  const name = ((best as HTMLInputElement)?.name) || null;
  console.log('Context menu target selected:', { tag: best?.tagName, contextType: lastContextMenuTargetType, testId, id, name });
}

// Handle input focus out
function handleInputFocusOut(event: Event) {
  // Delay removal to allow clicking popup buttons
  const activeElement = document.activeElement;
  const relatedTarget = (event as FocusEvent).relatedTarget as HTMLElement;

  // Don't remove if mouse is over popup or if clicking inside popup
  if (isMouseOverPopup) return;
  if (autoFillPopup && autoFillPopup.contains(activeElement)) return;
  if (autoFillPopup && relatedTarget && autoFillPopup.contains(relatedTarget)) return;

  removePopup();

}

// Show auto-fill popup
async function showFillingAssistantPopup(inputElement: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) {
  if (!isExtensionContextValid()) {
    return;
  }

  removePopup();

  // Set current input element for the modules
  setCurrentInputElement(inputElement);

  // Get page data
  const currentUrl = window.location.href;
  const pageData = await StorageService.getCurrentPageData(currentUrl);

  // Show toast if save/import enabled but no page profile
  if (
    !pageData && (currentSettings?.enableSaveValue || currentSettings?.enableImportValue) &&
    (
      !currentSettings?.enableRandomStringInAssistant &&
      !currentSettings?.enableLocatorRetriever &&
      !currentSettings?.enableRegexPattern
    )
  ) {
    showNotification('No page profile found. Please create a page profile for this website to use save and import features.');
    return;
  }

  // Check if any features are enabled
  const hasFeatures =
    currentSettings?.enableRandomStringInAssistant ||
    currentSettings?.enableSaveValue ||
    currentSettings?.enableImportValue ||
    currentSettings?.enableLocatorRetriever ||
    currentSettings?.enableRegexPattern;
  if (!hasFeatures) {
    return;
  }

  // Determine the input type to decide which sections are allowed
  const textLikeTypes = ['text', 'search', 'url', 'tel', 'email', 'password', 'number'];
  const inputType = (inputElement instanceof HTMLInputElement) ? (inputElement.type || 'text') : inputElement.tagName.toLowerCase();
  // Allow text-like sections for inputs and for textareas
  const allowTextSections = (inputElement instanceof HTMLTextAreaElement) || textLikeTypes.includes(inputType);

  const popup = createPopup(pageData, allowTextSections);
  autoFillPopup = popup;

  // Append to body first to calculate height
  document.body.appendChild(popup);

  // Locator copy buttons use plain text 'Copy' (no SVG icons)

  // Position popup below input with 5px margin
  const rect = inputElement.getBoundingClientRect();
  popup.style.position = 'absolute';
  popup.style.top = `${rect.bottom + window.scrollY + 5}px`;
  popup.style.left = `${rect.left + window.scrollX}px`;
  popup.style.zIndex = '2147483647'; // Maximum z-index

  // Setup sections
    if (pageData && currentSettings?.enableSaveValue) {
    await setupSaveSection(popup, inputElement, pageData);
  }
  if (pageData && currentSettings?.enableImportValue) {
    await setupImportSection(popup, inputElement, pageData, () => {
      showNotification('Value imported into the field.');
    });
  }
  if (currentSettings?.enableRandomStringInAssistant && allowTextSections) {
    setupRandomStringSection(popup, inputElement, currentUrl);
  }
  if (currentSettings?.enableLocatorRetriever) {
    setupLocatorRetrieverSection(popup, inputElement);
  }
  if (currentSettings?.enableRegexPattern && allowTextSections) {
    setupRegexPatternSection(popup, inputElement);
  }

  // Make locator copy buttons keyboard-accessible where present
  try {
    const copyTestBtn = popup.querySelector('.copy-testid-btn') as HTMLElement | null;
    const copySelectorBtn = popup.querySelector('.copy-selector-btn') as HTMLElement | null;

    if (copyTestBtn) {
      copyTestBtn.textContent = 'Copy';
      copyTestBtn.setAttribute('aria-label', 'Copy test id');
      copyTestBtn.setAttribute('role', 'button');
      copyTestBtn.tabIndex = 0;
      copyTestBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          copyTestBtn.click();
        }
      });
    }

    if (copySelectorBtn) {
      copySelectorBtn.textContent = 'Copy';
      copySelectorBtn.setAttribute('aria-label', 'Copy selector');
      copySelectorBtn.setAttribute('role', 'button');
      copySelectorBtn.tabIndex = 0;
      copySelectorBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          copySelectorBtn.click();
        }
      });
    }
  } catch (e) {
    console.warn('Failed to setup locator copy buttons', e);
  }
}

// Create popup element
function createPopup(pageData: any, allowTextSections: boolean = false): HTMLElement {
  // Check which features are enabled and page data exists
  const showSaveValue = currentSettings?.enableSaveValue && !!pageData;
  const showImportValue = currentSettings?.enableImportValue && !!pageData;
  const showRandomString = (currentSettings?.enableRandomStringInAssistant ?? false) && allowTextSections;
  const showLocatorRetriever = currentSettings?.enableLocatorRetriever ?? false;
  const showRegexPattern = (currentSettings?.enableRegexPattern ?? false) && allowTextSections;

  const popup = document.createElement('div');
  popup.className = 'form-filler-popup';
  popup.innerHTML = `
    <div class="popup-header">
      <span>Filling Assistant</span>
    </div>
    <div class="popup-body">
      ${showSaveValue ? `
      <div class="save-section assistant-section">
        <div class="input-row">
          <label>Name:</label>
          <input type="text" class="name-input" placeholder="Field name" />
        </div>
        <div class="input-row">
          <label>Save to:</label>
          <div class="select-wrapper">
            <select class="save-target">
              <option value="savedValues">Saved Values</option>
              <option value="preset">Preset</option>
            </select>
            <span class="select-arrow" aria-hidden="true"></span>
          </div>
        </div>
        <div class="input-row preset-selector-row" style="display: none;">
          <label>Preset:</label>
          <div class="select-wrapper">
            <select class="preset-selector">
              <option value="">Select preset...</option>
            </select>
            <span class="select-arrow" aria-hidden="true"></span>
          </div>
        </div>
        <div class="input-row">
          <label>Data test ID:</label>
          <input type="text" class="test-id-input" placeholder="data-testid" />
        </div>
        <div class="input-row">
          <label>Selector:</label>
          <input type="text" class="selector-input" placeholder="CSS selector" />
        </div>
        <button class="save-btn">Save</button>
      </div>
      ` : ''}
      ${showImportValue ? `
      <div class="import-section assistant-section">
        <div class="saved-values-section" style="display: none;">
          <h4>Saved Values</h4>
          <div class="saved-values-grid">
            <div class="grid-header">
              <div class="grid-cell">Name</div>
              <div class="grid-cell">Value</div>
            </div>
            <div class="grid-body"></div>
          </div>
        </div>
        <div class="preset-values-section" style="display: none;">
          <h4>Preset Values</h4>
          <div class="preset-values-grid">
            <div class="grid-header">
              <div class="grid-cell">Preset</div>
              <div class="grid-cell">Field</div>
              <div class="grid-cell">Value</div>
            </div>
            <div class="grid-body"></div>
          </div>
        </div>
        <div class="note-message" style="display: none;">
          No saved or preset values found for this field.
        </div>
      </div>
      ` : ''}
      ${showRandomString ? `
      <div class="random-string-section assistant-section">
        <div class="input-row">
          <label>Random String:</label>
          <div class="random-string-controls">
            <select class="charset-select">
              <option value="alphanumeric-special">Alphanumeric + Special</option>
              <option value="alphanumeric">Alphanumeric</option>
              <option value="numeric">Numeric</option>
              <option value="alphabet">Alphabet</option>
              <option value="alphanumeric-special-control">All Characters</option>
            </select>
            <input type="number" class="length-input" min="1" max="1000" value="10" />
            <button class="enter-btn">Enter</button>
          </div>
        </div>
      </div>
      ` : ''}
      ${showLocatorRetriever ? `
      <div class="locator-retriever-section assistant-section">
        <div class="locator-row">
          <div class="locator-label">Test ID:</div>
          <div class="locator-value-row">
            <input type="text" class="testid-display" readonly />
            <button class="copy-testid-btn icon-btn" title="Copy test id">Copy</button>
          </div>
        </div>
        <div class="locator-row">
          <div class="locator-label">Selector:</div>
          <div class="locator-value-row">
            <input type="text" class="selector-display" readonly />
            <button class="copy-selector-btn icon-btn" title="Copy selector">Copy</button>
          </div>
        </div>
      </div>
      ` : ''}
      ${showRegexPattern ? `
      <div class="regex-pattern-section assistant-section">
        <div class="regex-instructions">Generate string from regex patterns below (click to insert):</div>
        <div class="regex-buttons" role="list">
          <!-- pattern buttons inserted dynamically -->
        </div>
      </div>
      ` : ''}
    </div>
  `;

  // Add mouse event listeners to track when mouse is over popup
  popup.addEventListener('mouseenter', () => {
    isMouseOverPopup = true;
  });

  popup.addEventListener('mouseleave', () => {
    isMouseOverPopup = false;
  });

  // Prevent popup from losing focus when clicked (except on input fields)
  popup.addEventListener('mousedown', (e) => {
    const target = e.target as HTMLElement;
    // Allow input and select elements to be focused
    if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA') {
      return;
    }
    e.preventDefault();
  });

  return popup;
}

// Remove popup
function removePopup() {
  if (autoFillPopup) {
    // Remove popup from parent
    autoFillPopup.remove();
    autoFillPopup = null;
  }
  isMouseOverPopup = false;
  setCurrentInputElement(null);
}

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'applypreset') {
    applypresetToPage(request.formData);
    sendResponse({ success: true });
  } else if (request.action === 'scanFormFields') {
    const fields = scanFormFields();
    sendResponse({ success: true, fields });
  } else if (request.action === 'showAssistantFromContextMenu') {
    // Show assistant for the element that was right-clicked
    StorageService.getSettings().then((settings) => {
      const enabled = settings?.enableSaveValue || settings?.enableImportValue || settings?.enableLiveAssistant || settings?.enableRandomStringInAssistant;
      if (!enabled) {
        sendResponse({ success: false, error: 'Assistant disabled in settings' });
        return;
      }

      if (lastContextMenuTarget) {
        // Type-check: showAutoFillPopup expects HTMLInputElement/TextAreaElement/SelectElement
        currentInputElement = lastContextMenuTarget as HTMLInputElement;
        showFillingAssistantPopup(currentInputElement).then(() => {
          sendResponse({ success: true });
        }).catch((error) => {
          sendResponse({ success: false, error: error.message });
        });

      } else {
        sendResponse({ success: false, error: 'No target element' });
      }
    }).catch(err => {
      console.warn('Failed to read settings before showing assistant', err);
      sendResponse({ success: false, error: 'Failed to read settings' });
    });
    return true; // Keep channel open for async
  } else if (request.action === 'getElementSelector') {
    // Get selector for the element that was right-clicked
    console.log('getElementSelector request received, target:', lastContextMenuTarget);
    if (lastContextMenuTarget) {
      const selector = getElementSelector(lastContextMenuTarget);
      console.log('Selector generated:', selector);

      if (!selector) {
        console.warn('Selector could not be generated for target:', lastContextMenuTarget);
        showNotification('Unable to generate selector for the selected element');
        sendResponse({ success: false, error: 'Unable to generate selector' });
        return false;
      }

      // Copy to clipboard directly in content script
      navigator.clipboard.writeText(selector).then(() => {
        console.log('Selector copied to clipboard');
        // Show a temporary notification
        showNotification(`Selector copied: ${selector}`);
        sendResponse({ success: true, selector });
      }).catch((error) => {
        console.error('Failed to copy to clipboard:', error);
        showNotification('Failed to copy selector');
        sendResponse({ success: false, error: error.message });
      });
      return true; // Keep channel open for async
    } else {
      console.warn('No lastContextMenuTarget available');
      sendResponse({ success: false, error: 'No target element' });
      return false;
    }
  }
  return true;
});

// Helper to decode HTML entities safely
function decodeHtmlEntities(text: string): string {
  try {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  } catch (e) {
    // If decoding fails, return original text
    return text;
  }
}


// Get label for an input element with priority order
function getElementLabel(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): string {
  // 1. Closest label tag
  const closestLabel = element.closest('label');
  if (closestLabel && closestLabel.textContent?.trim()) {
    return closestLabel.textContent.trim();
  }

  // 2. Label tag with for="element.id"
  if (element.id) {
    const labelFor = document.querySelector(`label[for="${element.id}"]`);
    if (labelFor && labelFor.textContent?.trim()) {
      return labelFor.textContent.trim();
    }
  }

  // 3. aria-label attribute
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel?.trim()) {
    return ariaLabel.trim();
  }

  // 4. title attribute
  if (element.title?.trim()) {
    return element.title.trim();
  }

  // 5. placeholder attribute
  const placeholder = element.getAttribute('placeholder');
  if (placeholder?.trim()) {
    return placeholder.trim();
  }

  // 6. name attribute
  if (element.name?.trim()) {
    return element.name.trim();
  }

  // 7. data-testid attribute
  const testId = element.getAttribute('data-testid');
  if (testId?.trim()) {
    return testId.trim();
  }

  // 8. id attribute
  if (element.id?.trim()) {
    return element.id.trim();
  }

  // 9. Look for nearby text content in parent elements
  let parent = element.parentElement;
  for (let i = 0; i < 3 && parent; i++) {
    // Skip if parent is a form or div with many children
    if (parent.tagName === 'FORM' || (parent.tagName === 'DIV' && parent.children.length > 5)) {
      parent = parent.parentElement;
      continue;
    }

    // Look for text content in the parent
    const textContent = parent.textContent?.trim();
    if (textContent && textContent.length < 100 && textContent !== element.value) {
      // Remove the element's own text if it's included
      const elementText = element.textContent?.trim() || '';
      const cleanText = textContent.replace(elementText, '').trim();
      if (cleanText && cleanText.length < 50) {
        return cleanText;
      }
    }

    parent = parent.parentElement;
  }

  // 10. Look for preceding sibling text
  const prevSibling = element.previousElementSibling;
  if (prevSibling && prevSibling.textContent?.trim()) {
    const text = prevSibling.textContent.trim();
    if (text.length < 50) {
      return text;
    }
  }

  // 11. Fallback: Generate meaningful name from element attributes
  const type = element.type || 'text';
  const name = element.name || '';
  const id = element.id || '';

  if (name) {
    // Convert camelCase or snake_case to readable text
    return name.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).trim();
  }

  if (id) {
    // Convert camelCase or snake_case to readable text
    return id.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).trim();
  }

  // Type-based fallback
  const typeLabels: { [key: string]: string } = {
    'text': 'Text Field',
    'email': 'Email',
    'password': 'Password',
    'tel': 'Phone',
    'url': 'Website',
    'search': 'Search',
    'number': 'Number',
    'range': 'Range',
    'date': 'Date',
    'datetime-local': 'Date & Time',
    'color': 'Color',
    'checkbox': 'Checkbox',
    'radio': 'Radio Button'
  };

  return typeLabels[type] || 'Form Field';
}

// Scan form fields on the page
function scanFormFields() {
  const fields: any[] = [];
  const scannedElements = new Set<HTMLElement>();

  // Helper to check if value is a placeholder or default
  const isPlaceholderValue = (element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string): boolean => {
    if (!value) return false;
    // Check if value matches placeholder
    const placeholder = element.getAttribute('placeholder');
    if (placeholder && value === placeholder) return true;
    // Check for common default values
    if (['x', 'X', '0.00', '0', '00/00/0000', 'MM/DD/YYYY'].includes(value.trim())) return true;
    // Check if it's a date field with default date
    if (element.type === 'date' && value === '02/06/2026') return true;
    return false;
  };

  // Scan text inputs
  document.querySelectorAll(
    'input[type="text"], input[type="email"], input[type="password"], input[type="tel"], input[type="url"], input[type="search"], input:not([type])'
  ).forEach(input => {
    if (scannedElements.has(input as HTMLElement)) return;
    if (!isElementVisible(input as HTMLElement)) return;
    scannedElements.add(input as HTMLElement);

    const inputEl = input as HTMLInputElement;
    const testId = inputEl.getAttribute('data-testid') || inputEl.id || '';
    const querySelector = getElementSelector(inputEl);
    const label = getElementLabel(inputEl);

    console.log('Scanned text input:', { selector: querySelector, label, value: inputEl.value });

    fields.push({
      id: `${Date.now()}_${fields.length}`,
      type: 'text',
      title: label,
      value: isPlaceholderValue(inputEl, inputEl.value) ? '' : (inputEl.value || ''),
      testId,
      querySelector,
      fillDelay: DEFAULTS.FILL_DELAY,
      autoBlur: DEFAULTS.AUTO_BLUR,
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
      order: fields.length + 1,
      position: getElementPosition(inputEl)
    });
  });

  // Scan search inputs
  document.querySelectorAll('input[type="search"]').forEach(input => {
    if (scannedElements.has(input as HTMLElement)) return;
    if (!isElementVisible(input as HTMLElement)) return;
    scannedElements.add(input as HTMLElement);

    const inputEl = input as HTMLInputElement;
    const testId = inputEl.getAttribute('data-testid') || inputEl.id || '';
    const querySelector = getElementSelector(inputEl);
    const label = getElementLabel(inputEl);

    fields.push({
      id: `${Date.now()}_${fields.length}`,
      type: 'search',
      title: label,
      value: isPlaceholderValue(inputEl, inputEl.value) ? '' : (inputEl.value || ''),
      testId,
      querySelector,
      fillDelay: DEFAULTS.FILL_DELAY,
      autoBlur: DEFAULTS.AUTO_BLUR,
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
      order: fields.length + 1,
      position: getElementPosition(inputEl)
    });
  });

  // Scan radio inputs: only capture the currently checked radio for each named group.
  const allRadios = Array.from(document.querySelectorAll('input[type="radio"]')) as HTMLInputElement[];
  const radiosByName = new Map<string, HTMLInputElement[]>();

  allRadios.forEach(r => {
    const name = r.name || '';
    const group = radiosByName.get(name) || [];
    group.push(r);
    radiosByName.set(name, group);
  });

  radiosByName.forEach((group, name) => {
    if (name) {
      // For named groups, only include the checked radio
      const checked = group.find(r => r.checked);
      if (checked && !scannedElements.has(checked) && isElementVisible(checked)) {
        scannedElements.add(checked);
        const testId = checked.getAttribute('data-testid') || checked.id || '';
        const querySelector = getElementSelector(checked);
        const label = getElementLabel(checked) || checked.value;

        fields.push({
          id: `${Date.now()}_${fields.length}`,
          type: 'radio',
          title: label,
          value: checked.value || '',
          testId,
          querySelector,
          fillDelay: DEFAULTS.FILL_DELAY,
          autoBlur: DEFAULTS.AUTO_BLUR,
          createdAt: getCurrentTimestamp(),
          updatedAt: getCurrentTimestamp(),
          order: fields.length + 1,
          position: getElementPosition(checked)
        });
      }
    } else {
      // For radios without a name, treat each radio individually but only if checked
      group.forEach(radioEl => {
        if (radioEl.checked && !scannedElements.has(radioEl) && isElementVisible(radioEl)) {
          scannedElements.add(radioEl);
          const testId = radioEl.getAttribute('data-testid') || radioEl.id || '';
          const querySelector = getElementSelector(radioEl);
          const label = getElementLabel(radioEl) || radioEl.value;

          fields.push({
            id: `${Date.now()}_${fields.length}`,
            type: 'radio',
            title: label,
            value: radioEl.value || '',
            testId,
            querySelector,
            fillDelay: DEFAULTS.FILL_DELAY,
            autoBlur: DEFAULTS.AUTO_BLUR,
            createdAt: getCurrentTimestamp(),
            updatedAt: getCurrentTimestamp(),
            order: fields.length + 1,
            position: getElementPosition(radioEl)
          });
        }
      });
    }
  });

  // Scan range inputs
  document.querySelectorAll('input[type="range"]').forEach(range => {
    if (scannedElements.has(range as HTMLElement)) return;
    if (!isElementVisible(range as HTMLElement)) return;
    scannedElements.add(range as HTMLElement);

    const rangeEl = range as HTMLInputElement;
    const testId = rangeEl.getAttribute('data-testid') || rangeEl.id || '';
    const querySelector = getElementSelector(rangeEl);
    const label = getElementLabel(rangeEl);

    fields.push({
      id: `${Date.now()}_${fields.length}`,
      type: 'range',
      title: label,
      value: rangeEl.value || '',
      testId,
      querySelector,
      fillDelay: DEFAULTS.FILL_DELAY,
      autoBlur: DEFAULTS.AUTO_BLUR,
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
      order: fields.length + 1,
      position: getElementPosition(rangeEl)
    });
  });

  // Scan number inputs
  document.querySelectorAll('input[type="number"]').forEach(number => {
    if (scannedElements.has(number as HTMLElement)) return;
    if (!isElementVisible(number as HTMLElement)) return;
    scannedElements.add(number as HTMLElement);

    const numberEl = number as HTMLInputElement;
    const testId = numberEl.getAttribute('data-testid') || numberEl.id || '';
    const querySelector = getElementSelector(numberEl);
    const label = getElementLabel(numberEl);

    fields.push({
      id: `${Date.now()}_${fields.length}`,
      type: 'number',
      title: label,
      value: isPlaceholderValue(numberEl, numberEl.value) ? '' : (numberEl.value || ''),
      testId,
      querySelector,
      fillDelay: DEFAULTS.FILL_DELAY,
      autoBlur: DEFAULTS.AUTO_BLUR,
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
      order: fields.length + 1,
      position: getElementPosition(numberEl)
    });
  });

  // Scan color inputs
  document.querySelectorAll('input[type="color"]').forEach(color => {
    if (scannedElements.has(color as HTMLElement)) return;
    if (!isElementVisible(color as HTMLElement)) return;
    scannedElements.add(color as HTMLElement);

    const colorEl = color as HTMLInputElement;
    const testId = colorEl.getAttribute('data-testid') || colorEl.id || '';
    const querySelector = getElementSelector(colorEl);
    const label = getElementLabel(colorEl);

    fields.push({
      id: `${Date.now()}_${fields.length}`,
      type: 'color',
      title: label,
      value: colorEl.value || '#000000',
      testId,
      querySelector,
      fillDelay: DEFAULTS.FILL_DELAY,
      autoBlur: DEFAULTS.AUTO_BLUR,
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
      order: fields.length + 1,
      position: getElementPosition(colorEl)
    });
  });

  // Scan date/datetime-local inputs
  document.querySelectorAll('input[type="date"], input[type="datetime-local"]').forEach(date => {
    if (scannedElements.has(date as HTMLElement)) return;
    if (!isElementVisible(date as HTMLElement)) return;
    scannedElements.add(date as HTMLElement);

    const dateEl = date as HTMLInputElement;
    const testId = dateEl.getAttribute('data-testid') || dateEl.id || '';
    const querySelector = getElementSelector(dateEl);
    const label = getElementLabel(dateEl);

    fields.push({
      id: `${Date.now()}_${fields.length}`,
      type: 'datepicker',
      title: label,
      value: isPlaceholderValue(dateEl, dateEl.value) ? '' : (dateEl.value || ''),
      testId,
      querySelector,
      fillDelay: DEFAULTS.FILL_DELAY,
      autoBlur: DEFAULTS.AUTO_BLUR,
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
      order: fields.length + 1,
      position: getElementPosition(dateEl)
    });
  });

  // Scan textareas
  document.querySelectorAll('textarea').forEach(textarea => {
    if (scannedElements.has(textarea as HTMLElement)) return;
    if (!isElementVisible(textarea as HTMLElement)) return;
    scannedElements.add(textarea as HTMLElement);

    const textareaEl = textarea as HTMLTextAreaElement;
    const testId = textareaEl.getAttribute('data-testid') || textareaEl.id || '';
    const querySelector = getElementSelector(textareaEl);
    const label = getElementLabel(textareaEl);

    fields.push({
      id: `${Date.now()}_${fields.length}`,
      type: 'text',
      title: label,
      value: isPlaceholderValue(textareaEl, textareaEl.value) ? '' : (textareaEl.value || ''),
      testId,
      querySelector,
      fillDelay: DEFAULTS.FILL_DELAY,
      autoBlur: DEFAULTS.AUTO_BLUR,
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
      order: fields.length + 1,
      position: getElementPosition(textareaEl)
    });
  });

  // Scan checkboxes
  document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    if (scannedElements.has(checkbox as HTMLElement)) return;
    if (!isElementVisible(checkbox as HTMLElement)) return;
    scannedElements.add(checkbox as HTMLElement);

    const checkboxEl = checkbox as HTMLInputElement;
    const testId = checkboxEl.getAttribute('data-testid') || checkboxEl.id || '';
    const querySelector = getElementSelector(checkboxEl);
    const label = getElementLabel(checkboxEl);

    fields.push({
      id: `${Date.now()}_${fields.length}`,
      type: 'checkbox',
      title: label,
      value: checkboxEl.checked ? true : false,
      testId,
      querySelector,
      fillDelay: DEFAULTS.FILL_DELAY,
      autoBlur: DEFAULTS.AUTO_BLUR,
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
      order: fields.length + 1,
      position: getElementPosition(checkboxEl)
    });
  });

  // Scan select dropdowns
  document.querySelectorAll('select').forEach(select => {
    if (scannedElements.has(select as HTMLElement)) return;
    if (!isElementVisible(select as HTMLElement)) return;
    scannedElements.add(select as HTMLElement);

    const selectEl = select as HTMLSelectElement;
    const testId = selectEl.getAttribute('data-testid') || selectEl.id || '';
    const querySelector = getElementSelector(selectEl);
    const label = getElementLabel(selectEl);

    fields.push({
      id: `${Date.now()}_${fields.length}`,
      type: 'dropdown',
      title: label,
      value: selectEl.value || '',
      testId,
      querySelector,
      fillDelay: DEFAULTS.FILL_DELAY,
      autoBlur: DEFAULTS.AUTO_BLUR,
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
      order: fields.length + 1,
      position: getElementPosition(selectEl)
    });
  });

  // Sort fields by position (top-left to bottom-right)
  fields.sort((a, b) => {
    const posA = a.position;
    const posB = b.position;

    // First sort by top position
    if (posA.top !== posB.top) {
      return posA.top - posB.top;
    }

    // Then sort by left position
    return posA.left - posB.left;
  });

  return fields;
}

// Show temporary notification
// Notifications handled by src/utils/notification.ts (listens for formFiller:notify events)

function simulateClick(element: HTMLElement) {
  if (!element) return;
  const rect = element.getBoundingClientRect();
  const coords = {
    clientX: rect.left + rect.width / 2,
    clientY: rect.top + rect.height / 2,
    bubbles: true,
    cancelable: true,
    view: window
  };

  // Dispatch the sequence tracking agents expect
  element.dispatchEvent(new MouseEvent('mousedown', coords));
  element.dispatchEvent(new MouseEvent('mouseup', coords));
  element.dispatchEvent(new MouseEvent('click', coords));
}

// Apply preset data to page
async function applypresetToPage(formData: FormFieldData[]) {
  for (const field of formData) {
    await applyFieldToPage(field);
  }
}

// Apply single field to page
async function applyFieldToPage(field: FormFieldData) {
  return new Promise<void>((resolve) => {
    let element: HTMLInputElement | HTMLSelectElement | null = null;

    // Try to find element by test ID first
    if (field.testId) {
      element = document.querySelector(`[data-testid="${field.testId}"]`) as HTMLInputElement;
    }

    // Try query selector if test ID didn't work
    if (!element && field.querySelector) {
      element = document.querySelector(field.querySelector) as HTMLInputElement;
    }

    if (element) {
      if (field.type === 'checkbox') {
        if ((element as HTMLInputElement).checked !== field.value)
          simulateClick(element as HTMLElement);
        // Optionally blur after fill
        if (field.autoBlur) {
          (element as HTMLElement).blur();
        }
        resolve();
      } else if (field.type === 'radio') {
        // For radio buttons, select the one with matching value
        const radios = document.querySelectorAll(`input[type="radio"][name="${(element as HTMLInputElement).name}"]`);
        radios.forEach(radio => {
          if ((radio as HTMLInputElement).value === String(field.value)) {
            simulateClick(radio as HTMLElement);
            if (!(radio as HTMLInputElement).checked){
              (radio as HTMLInputElement).checked = true;
            }
          }
        });
        // Trigger change and input events
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        if (field.autoBlur) {
          (element as HTMLElement).blur();
        }
        resolve();
      } else if (field.type === 'clickable') {
        // For clickable elements, wait for specified delay then click
        const delay = parseInt(String(field.value)) || 0;
        setTimeout(() => {
          simulateClick(element as HTMLElement);
          if (field.autoBlur) {
            (element as HTMLElement).blur();
          }
          resolve();
        }, delay);
      } else if (field.type === 'range' || field.type === 'number') {
        // For range and number inputs
        element.value = decodeHtmlEntities(String(field.value));
        // Trigger change and input events
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        if (field.autoBlur) {
          (element as HTMLElement).blur();
        }
        setTimeout(resolve, field.fillDelay);
      } else if (field.type === 'color') {
        // For color inputs
        element.value = decodeHtmlEntities(String(field.value));
        // Trigger change and input events
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        if (field.autoBlur) {
          (element as HTMLElement).blur();
        }
        setTimeout(resolve, field.fillDelay);
      } else if (field.type === 'datepicker') {
        // For date inputs
        element.value = decodeHtmlEntities(String(field.value));
        // Trigger change and input events
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        if (field.autoBlur) {
          (element as HTMLElement).blur();
        }
        setTimeout(resolve, field.fillDelay);
      } else if (field.type === 'dynamicDate') {
        // For dynamicDate, calculate the date based on offsets
        try {
          const offsets = JSON.parse(String(field.value));
          const years = offsets.years || 0;
          const months = offsets.months || 0;
          const days = offsets.days || 0;

          // Calculate the date
          const currentDate = new Date();
          currentDate.setFullYear(currentDate.getFullYear() + years);
          currentDate.setMonth(currentDate.getMonth() + months);
          currentDate.setDate(currentDate.getDate() + days);

          // Format as YYYY-MM-DD for date inputs
          const year = currentDate.getFullYear();
          const month = String(currentDate.getMonth() + 1).padStart(2, '0');
          const day = String(currentDate.getDate()).padStart(2, '0');
          const dateString = `${year}-${month}-${day}`;

          element.value = dateString;
          // Trigger change and input events
          element.dispatchEvent(new Event('input', { bubbles: true }));
          element.dispatchEvent(new Event('change', { bubbles: true }));
          if (field.autoBlur) {
            (element as HTMLElement).blur();
          }
          setTimeout(resolve, field.fillDelay);
        } catch (e) {
          console.error('Failed to parse dynamicDate value:', e);
          // If parsing fails, just use current date
          const currentDate = new Date();
          const year = currentDate.getFullYear();
          const month = String(currentDate.getMonth() + 1).padStart(2, '0');
          const day = String(currentDate.getDate()).padStart(2, '0');
          element.value = `${year}-${month}-${day}`;
          element.dispatchEvent(new Event('input', { bubbles: true }));
          element.dispatchEvent(new Event('change', { bubbles: true }));
          if (field.autoBlur) {
            (element as HTMLElement).blur();
          }
          setTimeout(resolve, field.fillDelay);
        }
      } else {
        element.value = decodeHtmlEntities(String(field.value));
        // Trigger change and input events
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        if (field.autoBlur) {
          (element as HTMLElement).blur();
        }
        setTimeout(resolve, field.fillDelay);
      }
    } else {
      resolve();
    }
  });
}

// Setup random string section
function setupRandomStringSection(popup: HTMLElement, inputElement: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, currentUrl: string) {
  const charsetSelect = popup.querySelector('.charset-select') as HTMLSelectElement;
  const lengthInput = popup.querySelector('.length-input') as HTMLInputElement;
  const enterBtn = popup.querySelector('.enter-btn') as HTMLButtonElement;

  if (!charsetSelect || !lengthInput || !enterBtn) {
    console.warn('Freak Filler: Random string elements not found');
    return;
  }

  // Load settings
  if (currentSettings?.randomStringCharset) {
    charsetSelect.value = currentSettings.randomStringCharset;
  }

  // Determine length based on priority: length config > element length attribute > default settings
  let determinedLength = currentSettings?.randomStringLength || DEFAULTS.RANDOM_STRING_LENGTH;

  // Check element's length attribute
  const elementLength = inputElement.getAttribute('maxlength') || inputElement.getAttribute('length');
  if (elementLength) {
    const parsedLength = parseInt(elementLength);
    if (!isNaN(parsedLength) && parsedLength > 0) {
      determinedLength = parsedLength;
    }
  }

  // Check length configurations
  StorageService.getData().then(data => {
    if (data?.lengthConfigurations) {
      // Try to match by testId first
      const testId = inputElement.getAttribute('data-testid');
      let matchingConfig = null;

      if (testId) {
        matchingConfig = data.lengthConfigurations.find(config => config.locator === `[data-testid="${testId}"]`);
      }

      // If no match by testId, try querySelector
      if (!matchingConfig) {
        const querySelector = getElementSelector(inputElement);
        matchingConfig = data.lengthConfigurations.find(config => config.locator === querySelector);
      }

      // If still no match, try partial matches
      if (!matchingConfig && testId) {
        matchingConfig = data.lengthConfigurations.find(config =>
          config.locator.includes(testId) || testId.includes(config.locator.replace(/[\[\]"]/g, ''))
        );
      }

      if (matchingConfig && matchingConfig.maxLength > 0) {
        determinedLength = matchingConfig.maxLength;
      }
    }

    // Set the determined length
    lengthInput.value = determinedLength.toString();
  }).catch(err => {
    console.warn('Failed to load length configurations:', err);
    lengthInput.value = determinedLength.toString();
  });

  // Handle enter button click
  enterBtn.addEventListener('click', async () => {
    try {
      const charset = charsetSelect.value;
      const length = parseInt(lengthInput.value) || 10;

      const randomString = generateRandomString(length, charset);

      // Fill the input field with the random string
      inputElement.value = randomString;

      // Trigger input and change events to ensure the field registers the change
      inputElement.dispatchEvent(new Event('input', { bubbles: true }));
      inputElement.dispatchEvent(new Event('change', { bubbles: true }));

    } catch (error) {
      console.error('Freak Filler: Failed to generate random string:', error);
    }
  });
}

// Setup locator retriever section
function setupLocatorRetrieverSection(popup: HTMLElement, inputElement: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) {
  const testIdDisplay = popup.querySelector('.testid-display') as HTMLInputElement;
  const selectorDisplay = popup.querySelector('.selector-display') as HTMLInputElement;
  const copyTestIdBtn = popup.querySelector('.copy-testid-btn') as HTMLButtonElement;
  const copySelectorBtn = popup.querySelector('.copy-selector-btn') as HTMLButtonElement;

  if (!testIdDisplay || !selectorDisplay || !copyTestIdBtn || !copySelectorBtn) {
    console.warn('Freak Filler: Locator retriever elements not found');
    return;
  }

  // Get element locators
  const { testId, querySelector } = getElementLocators(inputElement);

  // Populate the display fields
  testIdDisplay.value = testId;
  selectorDisplay.value = querySelector;

  // Setup copy buttons
  copyTestIdBtn.addEventListener('click', () => {
    if (testId) {
      navigator.clipboard.writeText(testId).then(() => {
        showNotification(`Data Test ID copied: ${testId}`);
      }).catch((error) => {
        console.error('Freak Filler: Failed to copy test ID:', error);
        showNotification('Failed to copy data test ID');
      });
    } else {
      showNotification('No data test ID available');
    }
  });

  copySelectorBtn.addEventListener('click', () => {
    if (querySelector) {
      navigator.clipboard.writeText(querySelector).then(() => {
        showNotification(`Selector copied: ${querySelector}`);
      }).catch((error) => {
        console.error('Freak Filler: Failed to copy selector:', error);
        showNotification('Failed to copy selector');
      });
    } else {
      showNotification('No selector available');
    }
  });
}

// Setup regex pattern section
function setupRegexPatternSection(popup: HTMLElement, inputElement: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) {
  const buttonsContainer = popup.querySelector('.regex-buttons') as HTMLElement;

  if (!buttonsContainer) {
    console.warn('Freak Filler: Regex buttons container not found');
    return;
  }

  // Load regex patterns from storage and render pill buttons
  StorageService.getData().then(data => {
    buttonsContainer.innerHTML = '';
    if (data?.regexPatterns && data.regexPatterns.length > 0) {
      data.regexPatterns.forEach((pattern) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'regex-pill regex-btn';
        btn.title = pattern.name + ' — ' + pattern.regex;
        btn.textContent = pattern.name;

        // Make the pill keyboard-accessible
        btn.setAttribute('role', 'button');
        btn.tabIndex = 0;
        btn.setAttribute('aria-label', `${pattern.name} — ${pattern.regex}`);

        btn.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            btn.click();
          }
        });

        btn.addEventListener('click', () => {
          try {
            // Determine length based on element attributes and defaults
            // Default to the maximum allowed by limits when no element-specific length exists
            let length = LIMITS.MAX_STRING_LENGTH as number;
            const elementLength = inputElement.getAttribute('maxlength') || inputElement.getAttribute('length');
            if (elementLength) {
              const parsedLength = parseInt(elementLength);
              if (!isNaN(parsedLength) && parsedLength > 0) {
                length = parsedLength;
              }
            }

            const generated = generateFromRegex(pattern.regex, length);
            inputElement.value = generated;
            inputElement.dispatchEvent(new Event('input', { bubbles: true }));
            inputElement.dispatchEvent(new Event('change', { bubbles: true }));
            showNotification('Value generated from regex pattern');
          } catch (err) {
            console.error('Failed to generate from pattern:', err);
            showNotification('Failed to generate from regex pattern');
          }
        });

        buttonsContainer.appendChild(btn);
      });
    } else {
      const noData = document.createElement('div');
      noData.className = 'no-data small';
      noData.textContent = 'No regex patterns available';
      buttonsContainer.appendChild(noData);
    }
  }).catch(err => {
    console.warn('Failed to load regex patterns:', err);
    buttonsContainer.innerHTML = '<div class="no-data small">Failed to load patterns</div>';
  });
}

// Initialize on load
init();
