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

export const state = {
  autoFillPopup: null as HTMLElement | null,
  currentInputElement: null as FillableElement | null,
  currentSettings: null as ExtensionSettings | null,
  isMouseOverPopup: false,
  contextInvalidated: false,
  lastContextMenuTarget: null as Element | null,
  lastContextMenuTargetType: null as string | null
};

export interface Actions {
  isExtensionContextValid: typeof import('./startup-listeners').isExtensionContextValid;
  init: typeof import('./startup-listeners').init;
  attachInputListeners: typeof import('./startup-listeners').attachInputListeners;
  handleInputClick: typeof import('./startup-listeners').handleInputClick;
  handleInputFocus: typeof import('./startup-listeners').handleInputFocus;
  handleContextMenu: typeof import('./startup-listeners').handleContextMenu;
  handleInputFocusOut: typeof import('./startup-listeners').handleInputFocusOut;
  showFillingAssistantPopup: typeof import('./assistant-popup').showFillingAssistantPopup;
  createPopup: typeof import('./assistant-popup').createPopup;
  removePopup: typeof import('./assistant-popup').removePopup;
  decodeHtmlEntities: typeof import('./field-scan').decodeHtmlEntities;
  scanFormFields: typeof import('./field-scan').scanFormFields;
  isPlaceholderValue: typeof import('./field-scan').isPlaceholderValue;
  simulateClick: typeof import('./field-fill').simulateClick;
  applypresetToPage: typeof import('./field-fill').applypresetToPage;
  applyFieldToPage: typeof import('./field-fill').applyFieldToPage;
  findFieldElement: typeof import('./field-fill').findFieldElement;
  getFieldValueForFill: typeof import('./field-fill').getFieldValueForFill;
  applyCheckboxField: typeof import('./field-fill').applyCheckboxField;
  applyRadioField: typeof import('./field-fill').applyRadioField;
  getDynamicDateValue: typeof import('./field-fill').getDynamicDateValue;
  formatDateWithOffsets: typeof import('./field-fill').formatDateWithOffsets;
  blurAfterFill: typeof import('./field-fill').blurAfterFill;
  waitFor: typeof import('./field-fill').waitFor;
  setupRandomStringSection: typeof import('./assistant-sections').setupRandomStringSection;
  setupLocatorRetrieverSection: typeof import('./assistant-sections').setupLocatorRetrieverSection;
  setupRegexPatternSection: typeof import('./assistant-sections').setupRegexPatternSection;
}

export const actions = {} as Actions;
