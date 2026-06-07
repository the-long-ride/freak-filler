import { StorageService } from '../../services/storage.service';
import { FormFieldData, ExtensionSettings } from '../../types';
import { setupSaveSection } from '../save-section';
import { setupImportSection, setCurrentInputElement } from '../import-section';
import {
  FillableElement,
  HTML_EDITOR_SELECTOR,
  ScannedFormField,
  allowsTextActions,
  createScannedField,
  dispatchValueEvents,
  getAssistantElementFromTarget,
  getEditableValue,
  getElementLocators,
  getElementSelector,
  getFieldTypeForElement,
  isAssistantElement,
  isHtmlEditorElement,
  isNestedHtmlEditorElement,
  setEditableValue
} from '../element-helpers';
import { isElementVisible } from '../../utils/common';
import { generateRandomString, generateFromRegex } from '../../utils/helpers';
import { DEFAULTS, LIMITS } from '../../constants/appConstants';
import { showNotification } from '../../utils/notification';
import { actions, state } from './context';

const POPUP_VIEWPORT_MARGIN = 8;
const POPUP_INPUT_GAP = 5;

function mountPopup(popup: HTMLElement, preferDocumentElement = false): boolean {
    const roots = preferDocumentElement
        ? [document.documentElement, document.body]
        : [document.body, document.documentElement];

    for (const root of roots) {
        if (!root) {
            continue;
        }

        try {
            root.appendChild(popup);
            if (popup.isConnected) {
                return true;
            }
        }
        catch (error) {
            console.warn('Failed to mount Filling Assistant popup:', error);
        }
    }

    return popup.isConnected;
}

function preparePopupForMount(popup: HTMLElement): void {
    popup.style.setProperty('position', 'absolute', 'important');
    popup.style.setProperty('z-index', '2147483647', 'important');
    popup.style.setProperty('display', 'block', 'important');
    popup.style.setProperty('visibility', 'hidden', 'important');
}

function positionPopup(inputElement: FillableElement, popup: HTMLElement): void {
    const rect = inputElement.getBoundingClientRect();
    const popupRect = popup.getBoundingClientRect();
    const popupWidth = popupRect.width || 320;
    const popupHeight = popupRect.height || 160;
    const viewportRight = window.scrollX + window.innerWidth;
    const viewportBottom = window.scrollY + window.innerHeight;
    const minLeft = window.scrollX + POPUP_VIEWPORT_MARGIN;
    const minTop = window.scrollY + POPUP_VIEWPORT_MARGIN;
    const maxLeft = Math.max(minLeft, viewportRight - popupWidth - POPUP_VIEWPORT_MARGIN);
    const maxTop = Math.max(minTop, viewportBottom - popupHeight - POPUP_VIEWPORT_MARGIN);

    let left = rect.left + window.scrollX;
    if (left > maxLeft) {
        left = maxLeft;
    }
    if (left < minLeft) {
        left = minLeft;
    }

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    let top = rect.bottom + window.scrollY + POPUP_INPUT_GAP;
    if (spaceBelow < popupHeight + POPUP_INPUT_GAP && spaceAbove > popupHeight + POPUP_INPUT_GAP) {
        top = rect.top + window.scrollY - popupHeight - POPUP_INPUT_GAP;
    }
    if (top > maxTop) {
        top = maxTop;
    }
    if (top < minTop) {
        top = minTop;
    }

    popup.style.setProperty('top', `${top}px`, 'important');
    popup.style.setProperty('left', `${left}px`, 'important');
    popup.style.setProperty('visibility', 'visible', 'important');
}

function keepPopupMounted(inputElement: FillableElement, popup: HTMLElement): void {
    requestAnimationFrame(() => {
        if (state.autoFillPopup !== popup || popup.isConnected) {
            return;
        }

        if (mountPopup(popup, true)) {
            positionPopup(inputElement, popup);
        }
    });
}

// Show auto-fill popup
export async function showFillingAssistantPopup(inputElement: FillableElement) {
    if (!actions.isExtensionContextValid()) {
        return;
    }
    actions.removePopup();
    // Set current input element for the modules
    setCurrentInputElement(inputElement);
    // Get page data
    const currentUrl = window.location.href;
    const pageData = await StorageService.getCurrentPageData(currentUrl);
    // Check if any features are enabled
    const hasFeatures = state.currentSettings?.enableRandomStringInAssistant ||
        state.currentSettings?.enableSaveValue ||
        state.currentSettings?.enableImportValue ||
        state.currentSettings?.enableLocatorRetriever ||
        state.currentSettings?.enableRegexPattern;
    if (!hasFeatures) {
        return;
    }
    const allowTextSections = allowsTextActions(inputElement);
    const popup = actions.createPopup(pageData, allowTextSections);
    preparePopupForMount(popup);
    state.autoFillPopup = popup;
    // Append hidden first so sections can be measured before revealing.
    if (!mountPopup(popup)) {
        state.autoFillPopup = null;
        console.warn('Filling Assistant popup could not be attached to the page');
        return;
    }
    // Locator copy buttons use plain text 'Copy' (no SVG icons)
    // Setup sections
    if (pageData && state.currentSettings?.enableSaveValue) {
        await setupSaveSection(popup, inputElement, pageData);
    }
    if (pageData && state.currentSettings?.enableImportValue) {
        await setupImportSection(popup, inputElement, pageData, () => {
            showNotification('Value imported into the field.');
        });
    }
    if (state.currentSettings?.enableRandomStringInAssistant && allowTextSections) {
        actions.setupRandomStringSection(popup, inputElement);
    }
    if (state.currentSettings?.enableLocatorRetriever) {
        actions.setupLocatorRetrieverSection(popup, inputElement);
    }
    if (state.currentSettings?.enableRegexPattern && allowTextSections) {
        actions.setupRegexPatternSection(popup, inputElement);
    }
    positionPopup(inputElement, popup);
    keepPopupMounted(inputElement, popup);
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
    }
    catch (e) {
        console.warn('Failed to setup locator copy buttons', e);
    }
}

// Create popup element
export function createPopup(pageData: any, allowTextSections: boolean = false): HTMLElement {
    // Check which features are enabled and page data exists
    const showSaveValue = state.currentSettings?.enableSaveValue && !!pageData;
    const showImportValue = state.currentSettings?.enableImportValue && !!pageData;
    const showMissingPageProfile = !pageData && (state.currentSettings?.enableSaveValue || state.currentSettings?.enableImportValue);
    const showRandomString = (state.currentSettings?.enableRandomStringInAssistant ?? false) && allowTextSections;
    const showLocatorRetriever = state.currentSettings?.enableLocatorRetriever ?? false;
    const showRegexPattern = (state.currentSettings?.enableRegexPattern ?? false) && allowTextSections;
    const popup = document.createElement('div');
    popup.className = 'form-filler-popup';
    popup.innerHTML = `
    <div class="popup-header">
      <span>Filling Assistant</span>
    </div>
    <div class="popup-body">
      ${showMissingPageProfile ? `
      <div class="page-profile-missing-section assistant-section">
        <div class="note-message">
          No page profile found for this URL. Save and Import are unavailable until a page profile exists.
        </div>
      </div>
      ` : ''}
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
        state.isMouseOverPopup = true;
    });
    popup.addEventListener('mouseleave', () => {
        state.isMouseOverPopup = false;
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
export function removePopup() {
    if (state.autoFillPopup) {
        // Remove popup from parent
        state.autoFillPopup.remove();
        state.autoFillPopup = null;
    }
    state.isMouseOverPopup = false;
    setCurrentInputElement(null);
}
