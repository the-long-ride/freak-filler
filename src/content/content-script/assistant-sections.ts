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

// Setup random string section
export function setupRandomStringSection(popup: HTMLElement, inputElement: FillableElement) {
    const charsetSelect = popup.querySelector('.charset-select') as HTMLSelectElement;
    const lengthInput = popup.querySelector('.length-input') as HTMLInputElement;
    const enterBtn = popup.querySelector('.enter-btn') as HTMLButtonElement;
    if (!charsetSelect || !lengthInput || !enterBtn) {
        console.warn('Freak Filler: Random string elements not found');
        return;
    }
    // Load settings
    if (state.currentSettings?.randomStringCharset) {
        charsetSelect.value = state.currentSettings.randomStringCharset;
    }
    // Determine length based on priority: length config > element length attribute > default settings
    let determinedLength = state.currentSettings?.randomStringLength || DEFAULTS.RANDOM_STRING_LENGTH;
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
                matchingConfig = data.lengthConfigurations.find(config => config.locator.includes(testId) || testId.includes(config.locator.replace(/[\[\]"]/g, '')));
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
            setEditableValue(inputElement, randomString);
        }
        catch (error) {
            console.error('Freak Filler: Failed to generate random string:', error);
        }
    });
}

// Setup locator retriever section
export function setupLocatorRetrieverSection(popup: HTMLElement, inputElement: FillableElement) {
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
    const selector = querySelector || getElementSelector(inputElement);
    // Populate the display fields
    testIdDisplay.value = testId;
    selectorDisplay.value = selector;
    // Setup copy buttons
    copyTestIdBtn.addEventListener('click', () => {
        if (testId) {
            navigator.clipboard.writeText(testId).then(() => {
                showNotification(`Data Test ID copied: ${testId}`);
            }).catch((error) => {
                console.error('Freak Filler: Failed to copy test ID:', error);
                showNotification('Failed to copy data test ID');
            });
        }
        else {
            showNotification('No data test ID available');
        }
    });
    copySelectorBtn.addEventListener('click', () => {
        if (selector) {
            navigator.clipboard.writeText(selector).then(() => {
                showNotification(`Selector copied: ${selector}`);
            }).catch((error) => {
                console.error('Freak Filler: Failed to copy selector:', error);
                showNotification('Failed to copy selector');
            });
        }
        else {
            showNotification('No selector available');
        }
    });
}

// Setup regex pattern section
export function setupRegexPatternSection(popup: HTMLElement, inputElement: FillableElement) {
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
                        setEditableValue(inputElement, generated);
                        showNotification('Value generated from regex pattern');
                    }
                    catch (err) {
                        console.error('Failed to generate from pattern:', err);
                        showNotification('Failed to generate from regex pattern');
                    }
                });
                buttonsContainer.appendChild(btn);
            });
        }
        else {
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
