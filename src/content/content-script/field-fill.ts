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

// Show temporary notification
// Notifications handled by src/utils/notification.ts (listens for formFiller:notify events)
export function simulateClick(element: HTMLElement) {
    if (!element)
        return;
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
export async function applypresetToPage(formData: FormFieldData[]) {
    for (const field of formData) {
        await actions.applyFieldToPage(field);
    }
}

// Apply single field to page
export async function applyFieldToPage(field: FormFieldData) {
    const element = actions.findFieldElement(field);
    if (!element) {
        return;
    }
    if (field.type === 'checkbox') {
        actions.applyCheckboxField(element, field);
        return;
    }
    if (field.type === 'radio') {
        actions.applyRadioField(element, field);
        return;
    }
    if (field.type === 'clickable') {
        await actions.waitFor(parseInt(String(field.value), 10) || 0);
        actions.simulateClick(element);
        actions.blurAfterFill(element, field);
        return;
    }
    const value = field.type === 'dynamicDate'
        ? actions.getDynamicDateValue(field.value)
        : actions.getFieldValueForFill(field);
    setEditableValue(element, value);
    actions.blurAfterFill(element, field);
    await actions.waitFor(field.fillDelay);
}

export function findFieldElement(field: FormFieldData): FillableElement | null {
    let element: Element | null = null;
    if (field.testId) {
        element = document.querySelector(`[data-testid="${field.testId}"]`);
    }
    if (!element && field.querySelector) {
        try {
            element = document.querySelector(field.querySelector);
        }
        catch (error) {
            console.warn('Freak Filler: Invalid selector in preset', field.querySelector, error);
        }
    }
    return element instanceof HTMLElement ? element : null;
}

export function getFieldValueForFill(field: FormFieldData): string {
    const value = String(field.value ?? '');
    return field.type === 'htmlEditor' ? value : actions.decodeHtmlEntities(value);
}

export function applyCheckboxField(element: HTMLElement, field: FormFieldData): void {
    const shouldBeChecked = field.value === true || field.value === 'true';
    if (element instanceof HTMLInputElement && element.checked !== shouldBeChecked) {
        actions.simulateClick(element);
    }
    actions.blurAfterFill(element, field);
}

export function applyRadioField(element: HTMLElement, field: FormFieldData): void {
    if (!(element instanceof HTMLInputElement)) {
        return;
    }
    const radios = document.querySelectorAll<HTMLInputElement>(`input[type="radio"][name="${element.name}"]`);
    radios.forEach(radio => {
        if (radio.value === String(field.value)) {
            actions.simulateClick(radio);
            if (!radio.checked) {
                radio.checked = true;
            }
        }
    });
    dispatchValueEvents(element);
    actions.blurAfterFill(element, field);
}

export function getDynamicDateValue(value: FormFieldData['value']): string {
    try {
        const offsets = JSON.parse(String(value));
        return actions.formatDateWithOffsets(offsets.years || 0, offsets.months || 0, offsets.days || 0);
    }
    catch (e) {
        console.error('Failed to parse dynamicDate value:', e);
        return actions.formatDateWithOffsets(0, 0, 0);
    }
}

export function formatDateWithOffsets(years: number, months: number, days: number): string {
    const currentDate = new Date();
    currentDate.setFullYear(currentDate.getFullYear() + years);
    currentDate.setMonth(currentDate.getMonth() + months);
    currentDate.setDate(currentDate.getDate() + days);
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function blurAfterFill(element: HTMLElement, field: FormFieldData): void {
    if (field.autoBlur) {
        element.blur();
    }
}

export function waitFor(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
