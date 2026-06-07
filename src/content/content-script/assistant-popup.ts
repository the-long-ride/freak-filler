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
    // Show toast if save/import enabled but no page profile
    if (!pageData && (state.currentSettings?.enableSaveValue || state.currentSettings?.enableImportValue) &&
        (!state.currentSettings?.enableRandomStringInAssistant &&
            !state.currentSettings?.enableLocatorRetriever &&
            !state.currentSettings?.enableRegexPattern)) {
        showNotification('No page profile found. Please create a page profile for this website to use save and import features.');
        return;
    }
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
    state.autoFillPopup = popup;
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
