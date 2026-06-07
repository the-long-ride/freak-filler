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

export function bootstrap(): void {
  // Listen for messages from popup/background
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'applypreset') {
          actions.applypresetToPage(request.formData);
          sendResponse({ success: true });
      }
      else if (request.action === 'scanFormFields') {
          const fields = actions.scanFormFields();
          sendResponse({ success: true, fields });
      }
      else if (request.action === 'showAssistantFromContextMenu') {
          // Show assistant for the element that was right-clicked
          StorageService.getSettings().then((settings) => {
              const enabled = settings?.enableSaveValue ||
                  settings?.enableImportValue ||
                  settings?.enableLiveAssistant ||
                  settings?.enableRandomStringInAssistant ||
                  settings?.enableLocatorRetriever ||
                  settings?.enableRegexPattern;
              if (!enabled) {
                  sendResponse({ success: false, error: 'Assistant disabled in settings' });
                  return;
              }
              if (state.lastContextMenuTarget && isAssistantElement(state.lastContextMenuTarget)) {
                  state.currentInputElement = state.lastContextMenuTarget;
                  actions.showFillingAssistantPopup(state.currentInputElement).then(() => {
                      sendResponse({ success: true });
                  }).catch((error) => {
                      sendResponse({ success: false, error: error.message });
                  });
              }
              else {
                  sendResponse({ success: false, error: 'No editable target element' });
              }
          }).catch(err => {
              console.warn('Failed to read settings before showing assistant', err);
              sendResponse({ success: false, error: 'Failed to read settings' });
          });
          return true; // Keep channel open for async
      }
      else if (request.action === 'getElementSelector') {
          // Get selector for the element that was right-clicked
          console.log('getElementSelector request received, target:', state.lastContextMenuTarget);
          if (state.lastContextMenuTarget) {
              const selector = getElementSelector(state.lastContextMenuTarget);
              console.log('Selector generated:', selector);
              if (!selector) {
                  console.warn('Selector could not be generated for target:', state.lastContextMenuTarget);
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
          }
          else {
              console.warn('No lastContextMenuTarget available');
              sendResponse({ success: false, error: 'No target element' });
              return false;
          }
      }
      return true;
  });

  // Initialize on load
  actions.init();
}
