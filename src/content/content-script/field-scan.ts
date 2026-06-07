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

// Helper to decode HTML entities safely
export function decodeHtmlEntities(text: string): string {
    try {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = text;
        return textarea.value;
    }
    catch (e) {
        // If decoding fails, return original text
        return text;
    }
}

// Scan form fields on the page
export function scanFormFields(): ScannedFormField[] {
    const fields: ScannedFormField[] = [];
    const scannedElements = new Set<HTMLElement>();
    const scanElements = (selector: string, getValue: (element: FillableElement) => FormFieldData['value'], typeOverride?: FormFieldData['type']) => {
        document.querySelectorAll<HTMLElement>(selector).forEach(element => {
            addScannedField(element as FillableElement, getValue, typeOverride);
        });
    };
    const addScannedField = (element: FillableElement, getValue: (element: FillableElement) => FormFieldData['value'], typeOverride?: FormFieldData['type']) => {
        if (scannedElements.has(element))
            return;
        if (!isElementVisible(element))
            return;
        if (element.closest('.form-filler-popup'))
            return;
        if (isHtmlEditorElement(element) && isNestedHtmlEditorElement(element))
            return;
        scannedElements.add(element);
        fields.push(createScannedField(element, typeOverride || getFieldTypeForElement(element), getValue(element), fields.length + 1));
    };
    const getInputValue = (element: FillableElement) => {
        const value = getEditableValue(element);
        return actions.isPlaceholderValue(element, value) ? '' : value;
    };
    // Scan search before the broader text selector so it keeps its specific type.
    scanElements('input[type="search"]', getInputValue, 'search');
    scanElements('input[type="text"], input[type="email"], input[type="password"], input[type="tel"], input[type="url"], input:not([type])', getInputValue, 'text');
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
            if (checked) {
                addScannedField(checked, element => getEditableValue(element) || '', 'radio');
            }
        }
        else {
            // For radios without a name, treat each radio individually but only if checked
            group.forEach(radioEl => {
                if (radioEl.checked) {
                    addScannedField(radioEl, element => getEditableValue(element) || '', 'radio');
                }
            });
        }
    });
    scanElements('input[type="range"]', element => getEditableValue(element) || '', 'range');
    scanElements('input[type="number"]', getInputValue, 'number');
    scanElements('input[type="color"]', element => getEditableValue(element) || '#000000', 'color');
    scanElements('input[type="date"], input[type="datetime-local"]', getInputValue, 'datepicker');
    scanElements('textarea', getInputValue, 'text');
    scanElements('input[type="checkbox"]', element => (element as HTMLInputElement).checked, 'checkbox');
    scanElements('select', element => getEditableValue(element) || '', 'dropdown');
    scanElements(HTML_EDITOR_SELECTOR, element => getEditableValue(element), 'htmlEditor');
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

export function isPlaceholderValue(element: FillableElement, value: string): boolean {
    if (!value)
        return false;
    const placeholder = element.getAttribute('placeholder');
    if (placeholder && value === placeholder)
        return true;
    if (['x', 'X', '0.00', '0', '00/00/0000', 'MM/DD/YYYY'].includes(value.trim()))
        return true;
    return element instanceof HTMLInputElement && element.type === 'date' && value === '02/06/2026';
}
