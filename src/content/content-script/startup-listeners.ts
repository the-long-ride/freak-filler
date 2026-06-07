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

// Check if extension context is valid
export function isExtensionContextValid(): boolean {
    if (state.contextInvalidated)
        return false;
    try {
        if (!chrome.runtime?.id) {
            state.contextInvalidated = true;
            return false;
        }
        return true;
    }
    catch {
        state.contextInvalidated = true;
        return false;
    }
}

// Initialize
export async function init() {
    try {
        if (!actions.isExtensionContextValid()) {
            console.warn('Freak Filler: Extension context invalid at init');
            return;
        }
        state.currentSettings = await StorageService.getSettings();
        // Always attach listeners - the popup shows based on settings
        actions.attachInputListeners();
    }
    catch (error) {
        console.warn('Freak Filler: Failed to initialize, extension may have been reloaded');
        state.contextInvalidated = true;
        return;
    }
    // Listen for settings changes
    chrome.storage.onChanged.addListener((changes) => {
        if (changes.formFillerSettings) {
            state.currentSettings = changes.formFillerSettings.newValue;
        }
    });
}

// Attach listeners to input fields
export function attachInputListeners() {
    document.addEventListener('focusin', actions.handleInputFocus, true);
    document.addEventListener('focusout', actions.handleInputFocusOut, true);
    document.addEventListener('click', actions.handleInputClick, true);
    document.addEventListener('contextmenu', actions.handleContextMenu, true);
}

// Handle input click (for live assistant mode)
export async function handleInputClick(event: Event) {
    // Early exit if context is invalid
    if (!actions.isExtensionContextValid()) {
        return;
    }
    // Only handle if live assistant is enabled
    if (!state.currentSettings?.enableLiveAssistant) {
        return;
    }
    // Check if any feature is enabled
    if (!state.currentSettings?.enableSaveValue &&
        !state.currentSettings?.enableImportValue &&
        !state.currentSettings?.enableRandomStringInAssistant &&
        !state.currentSettings?.enableLocatorRetriever &&
        !state.currentSettings?.enableRegexPattern) {
        return;
    }
    const target = event.target as HTMLElement;
    // Prevent showing popup if the clicked element is inside our own popup
    if (target.closest('.form-filler-popup')) {
        return;
    }
    const editableElement = getAssistantElementFromTarget(target);
    if (editableElement) {
        state.currentInputElement = editableElement;
        try {
            await actions.showFillingAssistantPopup(state.currentInputElement);
        }
        catch (error) {
            console.warn('Freak Filler: Unable to show popup, extension context may be invalid');
            state.contextInvalidated = true;
            actions.removePopup();
        }
    }
}

// Handle input focus
export async function handleInputFocus(event: Event) {
    // Early exit if context is invalid
    if (!actions.isExtensionContextValid()) {
        return;
    }
    // If live assistant is ENABLED, handle in click event instead
    // If live assistant is DISABLED, don't show assistant at all (context menu only)
    if (state.currentSettings?.enableLiveAssistant !== undefined) {
        return;
    }
    // Check if any feature is enabled
    if (!state.currentSettings?.enableSaveValue && !state.currentSettings?.enableImportValue) {
        return;
    }
    const target = event.target as HTMLElement;
    // Prevent showing popup if the focused element is inside our own popup
    if (target.closest('.form-filler-popup')) {
        return;
    }
    const editableElement = getAssistantElementFromTarget(target);
    if (editableElement) {
        state.currentInputElement = editableElement;
        try {
            await actions.showFillingAssistantPopup(state.currentInputElement);
        }
        catch (error) {
            console.warn('Freak Filler: Unable to show popup, extension context may be invalid');
            state.contextInvalidated = true;
            actions.removePopup();
        }
    }
}

// Handle context menu to track target element
export function handleContextMenu(event: Event) {
    const mouseEvent = event as MouseEvent;
    const initial = (document.elementFromPoint(mouseEvent.clientX, mouseEvent.clientY) as HTMLElement) || (event.target as HTMLElement);
    state.lastContextMenuTarget = null;
    state.lastContextMenuTargetType = null;
    // First priority: editable controls, including contenteditable HTML editors.
    const editable = getAssistantElementFromTarget(initial);
    if (editable) {
        state.lastContextMenuTarget = editable;
        state.lastContextMenuTargetType = 'editable';
    }
    else {
        // Second priority: data-testid on the exact element or its ancestors
        const dataTestEl = initial.closest('[data-testid]') as HTMLElement | null;
        if (dataTestEl) {
            state.lastContextMenuTarget = dataTestEl;
            state.lastContextMenuTargetType = 'data-testid';
        }
        else if (initial.id) {
            // Third priority: use nearest ancestor with id
            const idEl = initial.closest('[id]') as HTMLElement | null;
            state.lastContextMenuTarget = idEl || initial;
            state.lastContextMenuTargetType = 'id';
        }
        else {
            // Label-associated controls
            const label = initial.closest('label');
            if (label) {
                const forId = label.getAttribute('for');
                if (forId) {
                    const associated = document.getElementById(forId) as HTMLElement | null;
                    if (associated) {
                        state.lastContextMenuTarget = associated;
                        state.lastContextMenuTargetType = 'label-associated';
                    }
                }
                else {
                    const inner = label.querySelector(`input, textarea, select, ${HTML_EDITOR_SELECTOR}`) as HTMLElement | null;
                    if (inner) {
                        state.lastContextMenuTarget = inner;
                        state.lastContextMenuTargetType = 'label-associated';
                    }
                }
            }
            // Clickable or media elements
            if (!state.lastContextMenuTarget) {
                const clickEl = initial.closest('button, a, img') as HTMLElement | null;
                if (clickEl) {
                    state.lastContextMenuTarget = clickEl;
                    state.lastContextMenuTargetType = clickEl.tagName.toLowerCase();
                }
            }
            // Fallback to the initial element
            if (!state.lastContextMenuTarget) {
                state.lastContextMenuTarget = initial;
                state.lastContextMenuTargetType = initial.tagName.toLowerCase();
            }
        }
    }
    // Log helpful debug info
    const best = state.lastContextMenuTarget as HTMLElement;
    const testId = best?.getAttribute('data-testid');
    const id = best?.id;
    const name = ((best as HTMLInputElement)?.name) || null;
    console.log('Context menu target selected:', { tag: best?.tagName, contextType: state.lastContextMenuTargetType, testId, id, name });
}

// Handle input focus out
export function handleInputFocusOut(event: Event) {
    // Delay removal to allow clicking popup buttons
    const activeElement = document.activeElement;
    const relatedTarget = (event as FocusEvent).relatedTarget as HTMLElement;
    // Don't remove if mouse is over popup or if clicking inside popup
    if (state.isMouseOverPopup)
        return;
    if (state.autoFillPopup && state.autoFillPopup.contains(activeElement))
        return;
    if (state.autoFillPopup && relatedTarget && state.autoFillPopup.contains(relatedTarget))
        return;
    actions.removePopup();
}
