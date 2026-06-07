/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/

// NAMESPACE OBJECT: ./src/content/content-script/startup-listeners.ts
var startup_listeners_namespaceObject = {};
__webpack_require__.r(startup_listeners_namespaceObject);
__webpack_require__.d(startup_listeners_namespaceObject, {
  attachInputListeners: () => (attachInputListeners),
  handleContextMenu: () => (handleContextMenu),
  handleInputClick: () => (handleInputClick),
  handleInputFocus: () => (handleInputFocus),
  handleInputFocusOut: () => (handleInputFocusOut),
  init: () => (init),
  isExtensionContextValid: () => (isExtensionContextValid)
});

// NAMESPACE OBJECT: ./src/content/content-script/assistant-popup.ts
var assistant_popup_namespaceObject = {};
__webpack_require__.r(assistant_popup_namespaceObject);
__webpack_require__.d(assistant_popup_namespaceObject, {
  createPopup: () => (createPopup),
  removePopup: () => (removePopup),
  showFillingAssistantPopup: () => (showFillingAssistantPopup)
});

// NAMESPACE OBJECT: ./src/content/content-script/field-scan.ts
var field_scan_namespaceObject = {};
__webpack_require__.r(field_scan_namespaceObject);
__webpack_require__.d(field_scan_namespaceObject, {
  decodeHtmlEntities: () => (decodeHtmlEntities),
  isPlaceholderValue: () => (isPlaceholderValue),
  scanFormFields: () => (scanFormFields)
});

// NAMESPACE OBJECT: ./src/content/content-script/field-fill.ts
var field_fill_namespaceObject = {};
__webpack_require__.r(field_fill_namespaceObject);
__webpack_require__.d(field_fill_namespaceObject, {
  applyCheckboxField: () => (applyCheckboxField),
  applyFieldToPage: () => (applyFieldToPage),
  applyRadioField: () => (applyRadioField),
  applypresetToPage: () => (applypresetToPage),
  blurAfterFill: () => (blurAfterFill),
  findFieldElement: () => (findFieldElement),
  formatDateWithOffsets: () => (formatDateWithOffsets),
  getDynamicDateValue: () => (getDynamicDateValue),
  getFieldValueForFill: () => (getFieldValueForFill),
  simulateClick: () => (simulateClick),
  waitFor: () => (waitFor)
});

// NAMESPACE OBJECT: ./src/content/content-script/assistant-sections.ts
var assistant_sections_namespaceObject = {};
__webpack_require__.r(assistant_sections_namespaceObject);
__webpack_require__.d(assistant_sections_namespaceObject, {
  setupLocatorRetrieverSection: () => (setupLocatorRetrieverSection),
  setupRandomStringSection: () => (setupRandomStringSection),
  setupRegexPatternSection: () => (setupRegexPatternSection)
});

;// ./src/content/content-script/context.ts
const state = {
    autoFillPopup: null,
    currentInputElement: null,
    currentSettings: null,
    isMouseOverPopup: false,
    contextInvalidated: false,
    lastContextMenuTarget: null,
    lastContextMenuTargetType: null
};
const actions = {};

;// ./src/constants/appConstants.ts
/**
 * Application-wide constants
 */
// Storage keys
const STORAGE_KEYS = (/* unused pure expression or super */ null && ({
    DATA: 'formFillerData',
    SETTINGS: 'formFillerSettings',
    MIGRATION: 'formFillerMigrationCompleted'
}));
// Theme constants
const THEMES = (/* unused pure expression or super */ null && ({
    LIGHT: 'light',
    DARK: 'dark'
}));
// Form field types
const FIELD_TYPES = (/* unused pure expression or super */ null && ({
    TEXT: 'text',
    SEARCH: 'search',
    CHECKBOX: 'checkbox',
    DROPDOWN: 'dropdown',
    DATEPICKER: 'datepicker',
    CLICKABLE: 'clickable',
    RADIO: 'radio',
    RANGE: 'range',
    NUMBER: 'number',
    COLOR: 'color',
    DYNAMIC_DATE: 'dynamicDate',
    HTML_EDITOR: 'htmlEditor'
}));
// UI messages
const MESSAGES = (/* unused pure expression or super */ null && ({
    NO_PAGE_URL: 'Page URL is required',
    NO_PRESETS: 'No presets yet',
    NO_PAGES: 'No pages available',
    NO_FORM_FIELDS: 'No form fields found on the page',
    CONFIRM_DELETE: 'Are you sure you want to delete this',
    UNSAVED_CHANGES: 'You have unsaved changes. Do you want to discard them and',
    SUCCESS_SAVE: 'Saved successfully!',
    INVALID_DATA: 'Invalid data format'
}));
// Default values
const DEFAULTS = {
    FILL_DELAY: 0,
    AUTO_BLUR: true,
    MUST_BE_MATCHED: false,
    ENABLE_SAVE_VALUE: true,
    ENABLE_IMPORT_VALUE: true,
    ENABLE_LIVE_ASSISTANT: false,
    DEFAULT_SAVE_ITEM_TO: 'savedValues',
    THEME: 'light',
    ENABLE_LOCATOR_RETRIEVER: false,
    ENABLE_REGEX_PATTERN: false,
    ENABLE_RANDOM_STRING_SECTION: false,
    ENABLE_RANDOM_STRING_IN_ASSISTANT: false,
    RANDOM_STRING_CHARSET: 'alphanumeric-special',
    RANDOM_STRING_LENGTH: 100
};
// Limits and thresholds
const LIMITS = {
    PARENT_SEARCH_DEPTH: 7,
    SAME_ROW_THRESHOLD: 10, // pixels
    DEFAULT_PAGE_SIZE: 25,
    MAX_RETRIES: 3,
    MIN_STRING_LENGTH: 1,
    MAX_STRING_LENGTH: 99999,
    QUANTIFIER_MAX_REPEAT: 10
};
// Sort directions
const SORT_DIRECTION = (/* unused pure expression or super */ null && ({
    ASC: 'asc',
    DESC: 'desc'
}));
// CSS class names
const CSS_CLASSES = (/* unused pure expression or super */ null && ({
    ACTIVE: 'active',
    CHECKED: 'checked',
    HIDDEN: 'hidden',
    DISABLED: 'disabled',
    LOADING: 'loading'
}));
// Export/Import JSON schema
const EXPORT_SCHEMA = 'form-filler.export.v1';
// Character sets for random string generation
const CHAR_SETS = {
    ALPHABET: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    DIGITS: '0123456789',
    SPECIAL: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    CONTROL: '~`\'"\\/',
    WORD_CHARS: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_'
};
// Random string character set templates
const RANDOM_STRING_CHARSETS = (/* unused pure expression or super */ null && ({
    ALPHABET: 'alphabet',
    NUMERIC: 'numeric',
    ALPHANUMERIC: 'alphanumeric',
    ALPHANUMERIC_SPECIAL: 'alphanumeric-special',
    ALPHANUMERIC_SPECIAL_CONTROL: 'alphanumeric-special-control'
}));
// Default regex patterns
const DEFAULT_REGEX_PATTERNS = [
    { name: 'Shortest email', regex: '^[a-zA-Z0-9_%+-]@[a-zA-Z0-9.-]\\.[a-zA-Z]{2}$', order: 1 },
    { name: 'Standard email', regex: '^[a-zA-Z0-9_%+-][a-zA-Z0-9._%+-]{6}@[a-zA-Z0-9.-]{4}\\.[a-zA-Z]{3}$', order: 2 },
    { name: 'Longest email', regex: '^[a-zA-Z0-9_%+-][a-zA-Z0-9._%+-]{245}@[a-zA-Z0-9.-]{5}\\.[a-zA-Z]{3}$', order: 3 }
];

;// ./src/services/storage/keys.ts
const STORAGE_KEY = 'formFillerData';
const SETTINGS_KEY = 'formFillerSettings';

;// ./src/services/storage/core.ts



async function initialize() {
    const data = await StorageService.getData();
    if (!data) {
        await StorageService.setData({
            pages: [],
            presets: [],
            presetPageLinks: [],
            savedValues: [],
            regexPatterns: DEFAULT_REGEX_PATTERNS.map(pattern => ({ ...pattern })),
            lengthConfigurations: []
        });
    }
    const settings = await StorageService.getSettings();
    if (!settings) {
        await StorageService.setSettings({
            enableSaveValue: DEFAULTS.ENABLE_SAVE_VALUE,
            enableImportValue: DEFAULTS.ENABLE_IMPORT_VALUE,
            enableLiveAssistant: DEFAULTS.ENABLE_LIVE_ASSISTANT,
            defaultSaveItemTo: DEFAULTS.DEFAULT_SAVE_ITEM_TO,
            theme: DEFAULTS.THEME,
            enableLocatorRetriever: DEFAULTS.ENABLE_LOCATOR_RETRIEVER,
            enableRegexPattern: DEFAULTS.ENABLE_REGEX_PATTERN,
            enableRandomStringSectionInPopup: DEFAULTS.ENABLE_RANDOM_STRING_SECTION,
            enableRandomStringInAssistant: DEFAULTS.ENABLE_RANDOM_STRING_IN_ASSISTANT,
            randomStringCharset: DEFAULTS.RANDOM_STRING_CHARSET,
            randomStringLength: DEFAULTS.RANDOM_STRING_LENGTH
        });
    }
}
async function getData() {
    try {
        if (!chrome.runtime?.id) {
            console.warn('Extension context invalidated');
            return null;
        }
        return new Promise((resolve, reject) => {
            chrome.storage.local.get([STORAGE_KEY], (result) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                }
                else {
                    const data = result[STORAGE_KEY] || null;
                    // Migration: Convert old mustBeMatched to matchIdentify
                    if (data && data.pages) {
                        let needsMigration = false;
                        data.pages.forEach((page) => {
                            // Ensure all pages have matchIdentify
                            if (!page.matchIdentify) {
                                page.matchIdentify = 'prefixMatch';
                                needsMigration = true;
                            }
                        });
                        // Save migrated data
                        if (needsMigration) {
                            StorageService.setData(data).catch(err => console.error('Migration save failed:', err));
                        }
                    }
                    resolve(data);
                }
            });
        });
    }
    catch (error) {
        console.warn('Storage access failed:', error);
        return null;
    }
}
async function setData(data) {
    try {
        if (!chrome.runtime?.id) {
            console.warn('Extension context invalidated');
            return;
        }
        return new Promise((resolve, reject) => {
            chrome.storage.local.set({ [STORAGE_KEY]: data }, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                }
                else {
                    resolve();
                }
            });
        });
    }
    catch (error) {
        console.warn('Storage write failed:', error);
    }
}
async function getSettings() {
    try {
        if (!chrome.runtime?.id) {
            console.warn('Extension context invalidated');
            return null;
        }
        return new Promise((resolve, reject) => {
            chrome.storage.local.get([SETTINGS_KEY], (result) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                }
                else {
                    let settings = result[SETTINGS_KEY] || null;
                    // Migrate settings to include new properties
                    if (settings) {
                        let needsMigration = false;
                        const migratedSettings = { ...settings };
                        if (settings.enableLocatorRetriever === undefined) {
                            migratedSettings.enableLocatorRetriever = DEFAULTS.ENABLE_LOCATOR_RETRIEVER;
                            needsMigration = true;
                        }
                        if (settings.enableRegexPattern === undefined) {
                            migratedSettings.enableRegexPattern = DEFAULTS.ENABLE_REGEX_PATTERN;
                            needsMigration = true;
                        }
                        if (settings.enableRandomStringSectionInPopup === undefined) {
                            migratedSettings.enableRandomStringSectionInPopup = DEFAULTS.ENABLE_RANDOM_STRING_SECTION;
                            needsMigration = true;
                        }
                        if (settings.randomStringCharset === undefined) {
                            migratedSettings.randomStringCharset = DEFAULTS.RANDOM_STRING_CHARSET;
                            needsMigration = true;
                        }
                        if (settings.randomStringLength === undefined) {
                            migratedSettings.randomStringLength = DEFAULTS.RANDOM_STRING_LENGTH;
                            needsMigration = true;
                        }
                        // Save migrated settings
                        if (needsMigration) {
                            StorageService.setSettings(migratedSettings).catch(err => console.error('Settings migration save failed:', err));
                        }
                        settings = migratedSettings;
                    }
                    resolve(settings);
                }
            });
        });
    }
    catch (error) {
        console.warn('Settings access failed:', error);
        return null;
    }
}
async function setSettings(settings) {
    try {
        if (!chrome.runtime?.id) {
            console.warn('Extension context invalidated');
            return;
        }
        return new Promise((resolve, reject) => {
            chrome.storage.local.set({ [SETTINGS_KEY]: settings }, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                }
                else {
                    resolve();
                }
            });
        });
    }
    catch (error) {
        console.warn('Settings write failed:', error);
    }
}
async function getTheme() {
    const settings = await StorageService.getSettings();
    return settings?.theme || 'dark';
}
async function setTheme(theme) {
    const settings = await StorageService.getSettings();
    if (settings) {
        settings.theme = theme;
        await StorageService.setSettings(settings);
    }
    else {
        await StorageService.setSettings({
            enableSaveValue: DEFAULTS.ENABLE_SAVE_VALUE,
            enableImportValue: DEFAULTS.ENABLE_IMPORT_VALUE,
            enableLiveAssistant: DEFAULTS.ENABLE_LIVE_ASSISTANT,
            defaultSaveItemTo: DEFAULTS.DEFAULT_SAVE_ITEM_TO,
            theme,
            enableLocatorRetriever: DEFAULTS.ENABLE_LOCATOR_RETRIEVER,
            enableRegexPattern: DEFAULTS.ENABLE_REGEX_PATTERN,
            enableRandomStringSectionInPopup: DEFAULTS.ENABLE_RANDOM_STRING_SECTION,
            enableRandomStringInAssistant: DEFAULTS.ENABLE_RANDOM_STRING_IN_ASSISTANT,
            randomStringCharset: DEFAULTS.RANDOM_STRING_CHARSET,
            randomStringLength: DEFAULTS.RANDOM_STRING_LENGTH
        });
    }
}

;// ./src/utils/helpers.ts
// Utility functions

function generateGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
function generateUniqueId(existingIds) {
    let newId = generateGuid();
    while (existingIds.includes(newId)) {
        newId = generateGuid();
    }
    return newId;
}
function getCurrentTimestamp() {
    return new Date().toISOString();
}
function matchUrl(pageUrl, currentUrl, matchIdentify) {
    if (matchIdentify === 'exactMatch') {
        return pageUrl === currentUrl;
    }
    else {
        return currentUrl.startsWith(pageUrl);
    }
}
function buildQuantityString(quantity) {
    return quantity > 0 ? `Total: ${quantity} item${quantity !== 1 ? 's' : ''}` : '';
}
function getCharacterSet(template) {
    switch (template) {
        case 'numeric':
            return CHAR_SETS.DIGITS;
        case 'alphabet':
            return CHAR_SETS.ALPHABET;
        case 'alphanumeric':
            return CHAR_SETS.ALPHABET + CHAR_SETS.DIGITS;
        case 'alphanumeric-special':
            return CHAR_SETS.ALPHABET + CHAR_SETS.DIGITS + CHAR_SETS.SPECIAL;
        case 'alphanumeric-special-control':
            return CHAR_SETS.ALPHABET + CHAR_SETS.DIGITS + CHAR_SETS.SPECIAL + CHAR_SETS.CONTROL;
        default:
            return CHAR_SETS.ALPHABET + CHAR_SETS.DIGITS;
    }
}
function generateRandomString(length, charset) {
    const constrainedLength = constrainNumber(length, LIMITS.MIN_STRING_LENGTH, LIMITS.MAX_STRING_LENGTH);
    let chars;
    if (['numeric', 'alphabet', 'alphanumeric', 'alphanumeric-special', 'alphanumeric-special-control'].includes(charset)) {
        chars = getCharacterSet(charset);
    }
    else {
        chars = charset;
    }
    let result = '';
    const charsLength = chars.length;
    for (let i = 0; i < constrainedLength; i++) {
        result += chars.charAt(Math.floor(Math.random() * charsLength));
    }
    return result;
}
function constrainNumber(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
function expandCharClass(charClass) {
    let chars = '';
    let i = 0;
    while (i < charClass.length) {
        if (i + 2 < charClass.length && charClass[i + 1] === '-') {
            // Range like a-z
            const start = charClass.charCodeAt(i);
            const end = charClass.charCodeAt(i + 2);
            for (let code = start; code <= end; code++) {
                chars += String.fromCharCode(code);
            }
            i += 3;
        }
        else {
            chars += charClass[i];
            i++;
        }
    }
    return chars || 'a';
}
/**
 * Generate string from regex pattern
 */
function generateFromRegex(regex, length) {
    try {
        // Remove start (^) and end ($) anchors from the pattern
        let pattern = regex.replace(/^\^/, '').replace(/\$$/, '');
        let result = '';
        let i = 0;
        // Iterate through the pattern until we reach the desired length
        while (i < pattern.length && result.length < length) {
            const char = pattern[i];
            let generatedPart = '';
            // Handle escaped characters (e.g., \d, \w, \.)
            if (char === '\\' && i + 1 < pattern.length) {
                const next = pattern[i + 1];
                if (next === '.') {
                    // Literal dot
                    generatedPart = '.';
                }
                else if (next === 'd') {
                    // Digit (0-9)
                    generatedPart = () => String.fromCharCode(48 + Math.floor(Math.random() * 10));
                }
                else if (next === 'w') {
                    // Word character (alphanumeric + underscore)
                    generatedPart = () => CHAR_SETS.WORD_CHARS[Math.floor(Math.random() * CHAR_SETS.WORD_CHARS.length)];
                }
                else {
                    // Other escaped characters (literal)
                    generatedPart = next;
                }
                i += 2;
            }
            else if (char === '(') {
                // Group - find matching closing parenthesis
                let depth = 1;
                let closeIndex = i + 1;
                while (closeIndex < pattern.length && depth > 0) {
                    if (pattern[closeIndex] === '\\') {
                        closeIndex += 2; // Skip escaped characters
                        continue;
                    }
                    if (pattern[closeIndex] === '(')
                        depth++;
                    if (pattern[closeIndex] === ')')
                        depth--;
                    closeIndex++;
                }
                if (depth === 0) {
                    // Extract group content and generate recursively
                    const groupContent = pattern.substring(i + 1, closeIndex - 1);
                    generatedPart = () => generateFromRegex(groupContent, length - result.length);
                    i = closeIndex;
                }
                else {
                    // Unmatched parenthesis, treat as literal
                    generatedPart = char;
                    i++;
                }
            }
            else if (char === '[') {
                // Character class (e.g., [a-z], [A-Z0-9])
                const closeIndex = pattern.indexOf(']', i);
                if (closeIndex !== -1) {
                    const charClass = pattern.substring(i + 1, closeIndex);
                    const chars = expandCharClass(charClass);
                    generatedPart = () => chars[Math.floor(Math.random() * chars.length)];
                    i = closeIndex + 1;
                }
                else {
                    generatedPart = char;
                    i++;
                }
            }
            else if (char === '.') {
                // Any character (using alphanumeric set)
                generatedPart = () => CHAR_SETS.ALPHABET[Math.floor(Math.random() * CHAR_SETS.ALPHABET.length)];
                i++;
            }
            else if (char === '+' || char === '*' || char === '?' || char === '{') {
                // Skip standalone quantifiers (will be handled after the character)
                i++;
                continue;
            }
            else {
                // Literal character
                generatedPart = char;
                i++;
            }
            // Handle quantifiers after the character
            if (i < pattern.length && pattern[i] === '{') {
                // Exact or range quantifier (e.g., {3}, {2,5})
                const closeIndex = pattern.indexOf('}', i);
                if (closeIndex !== -1) {
                    const quantifierStr = pattern.substring(i + 1, closeIndex);
                    const parts = quantifierStr.split(',');
                    const min = parseInt(parts[0]) || 1;
                    const max = parts[1] !== undefined ? (parts[1] === '' ? min + 5 : parseInt(parts[1])) : min;
                    const count = min + Math.floor(Math.random() * (max - min + 1));
                    // Generate the character 'count' times
                    for (let j = 0; j < count && result.length < length; j++) {
                        result += typeof generatedPart === 'function' ? generatedPart() : generatedPart;
                    }
                    i = closeIndex + 1;
                }
                else {
                    result += typeof generatedPart === 'function' ? generatedPart() : generatedPart;
                }
            }
            else if (i < pattern.length && (pattern[i] === '+' || pattern[i] === '*')) {
                // + (one or more) or * (zero or more)
                const isPlus = pattern[i] === '+';
                const min = isPlus ? 1 : 0;
                const count = min + Math.floor(Math.random() * (LIMITS.QUANTIFIER_MAX_REPEAT - min + 1));
                // Generate the character 'count' times
                for (let j = 0; j < count && result.length < length; j++) {
                    result += typeof generatedPart === 'function' ? generatedPart() : generatedPart;
                }
                i++;
            }
            else {
                // No quantifier, generate once
                result += typeof generatedPart === 'function' ? generatedPart() : generatedPart;
            }
        }
        // Fallback to random alphanumeric if result is empty
        return result || generateRandomString(length, 'alphanumeric');
    }
    catch (e) {
        console.error('Error generating from regex:', e);
        return generateRandomString(length, 'alphanumeric');
    }
}

;// ./src/services/storage/pages.ts


async function getPageByUrl(url, matchIdentify) {
    const data = await StorageService.getData();
    if (!data)
        return null;
    return data.pages.find(page => {
        if (matchIdentify === 'exactMatch') {
            return page.url === url;
        }
        else {
            return url.startsWith(page.url);
        }
    }) || null;
}
async function getPageById(pageId) {
    const data = await StorageService.getData();
    if (!data)
        return null;
    return data.pages.find(page => page.id === pageId) || null;
}
async function getCurrentPageData(currentUrl) {
    const data = await StorageService.getData();
    if (!data)
        return null;
    // First try exact match
    let page = data.pages.find(p => p.matchIdentify === 'exactMatch' && p.url === currentUrl);
    // Then try startsWith match
    if (!page) {
        page = data.pages.find(p => p.matchIdentify === 'prefixMatch' && currentUrl.startsWith(p.url));
    }
    return page || null;
}
async function addPage(pageData) {
    const data = await StorageService.getData() || {
        pages: [],
        presets: [],
        presetPageLinks: [],
        savedValues: [],
        regexPatterns: [],
        lengthConfigurations: []
    };
    // Generate unique ID that doesn't collide with existing page IDs
    const existingIds = data.pages.map(p => p.id);
    const newPage = {
        ...pageData,
        id: generateUniqueId(existingIds),
        createdAt: getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp()
    };
    data.pages.push(newPage);
    await StorageService.setData(data);
    return newPage;
}
async function updatePage(id, updates) {
    const data = await StorageService.getData();
    if (!data)
        return;
    const pageIndex = data.pages.findIndex(p => p.id === id);
    if (pageIndex !== -1) {
        data.pages[pageIndex] = {
            ...data.pages[pageIndex],
            ...updates,
            updatedAt: getCurrentTimestamp()
        };
        await StorageService.setData(data);
    }
}

;// ./src/services/storage/presets.ts


async function deletePreset(presetId) {
    const data = await StorageService.getData();
    if (!data)
        return;
    // Remove preset
    data.presets = data.presets.filter(p => p.id !== presetId);
    // Remove all links to this preset
    data.presetPageLinks = data.presetPageLinks.filter(link => link.presetId !== presetId);
    await StorageService.setData(data);
}
async function getPresetsForPage(pageId) {
    const data = await StorageService.getData();
    if (!data)
        return [];
    // Get preset IDs linked to this page
    const linkedPresetIds = data.presetPageLinks
        .filter(link => link.pageId === pageId)
        .map(link => link.presetId);
    // Get the actual presets
    return data.presets.filter(preset => linkedPresetIds.includes(preset.id));
}
async function getPageIdsForPreset(presetId) {
    const data = await StorageService.getData();
    if (!data)
        return [];
    return data.presetPageLinks
        .filter(link => link.presetId === presetId)
        .map(link => link.pageId);
}
async function getUnlinkedPresets(pageId) {
    const data = await StorageService.getData();
    if (!data)
        return [];
    // Get preset IDs linked to this page
    const linkedPresetIds = data.presetPageLinks
        .filter(link => link.pageId === pageId)
        .map(link => link.presetId);
    // Get presets that are NOT linked to this page
    return data.presets.filter(preset => !linkedPresetIds.includes(preset.id));
}
async function getPresetById(presetId) {
    const data = await StorageService.getData();
    if (!data)
        return null;
    const preset = data.presets.find(p => p.id === presetId);
    return preset || null;
}
async function addPreset(preset) {
    const data = await StorageService.getData() || {
        pages: [],
        presets: [],
        presetPageLinks: [],
        savedValues: [],
        regexPatterns: [],
        lengthConfigurations: []
    };
    // Generate unique ID that doesn't collide with existing preset IDs
    const existingIds = data.presets.map(p => p.id);
    const newPreset = {
        ...preset,
        id: generateUniqueId(existingIds),
        createdAt: getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp()
    };
    data.presets.push(newPreset);
    await StorageService.setData(data);
    return newPreset;
}
async function updatePreset(presetId, updates) {
    const data = await StorageService.getData();
    if (!data)
        return;
    const presetIndex = data.presets.findIndex(p => p.id === presetId);
    if (presetIndex !== -1) {
        data.presets[presetIndex] = {
            ...data.presets[presetIndex],
            ...updates,
            updatedAt: getCurrentTimestamp()
        };
        await StorageService.setData(data);
    }
}
async function linkPresetToPage(presetId, pageId) {
    const data = await StorageService.getData();
    if (!data)
        return;
    // Check if link already exists
    const existingLink = data.presetPageLinks.find(link => link.presetId === presetId && link.pageId === pageId);
    if (!existingLink) {
        data.presetPageLinks.push({ presetId, pageId });
        await StorageService.setData(data);
    }
}
async function unlinkPresetFromPage(presetId, pageId) {
    const data = await StorageService.getData();
    if (!data)
        return;
    data.presetPageLinks = data.presetPageLinks.filter(link => !(link.presetId === presetId && link.pageId === pageId));
    await StorageService.setData(data);
}

;// ./src/services/storage/saved-values.ts


async function addSavedFormData(pageUrl, formData) {
    const data = await StorageService.getData();
    if (!data)
        return;
    const page = data.pages.find(p => p.url === pageUrl);
    if (!page)
        return;
    // Generate unique ID that doesn't collide with existing saved value IDs
    const existingIds = data.savedValues.map(sv => sv.id);
    const newSavedValue = {
        id: generateUniqueId(existingIds),
        pageId: page.id,
        label: formData.title,
        value: String(formData.value),
        testId: formData.testId,
        querySelector: formData.querySelector,
        createdAt: getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp()
    };
    data.savedValues.push(newSavedValue);
    await StorageService.setData(data);
}
async function deleteSavedFormData(pageUrl, savedValueId) {
    const data = await StorageService.getData();
    if (!data)
        return;
    const page = data.pages.find(p => p.url === pageUrl);
    if (!page)
        return;
    data.savedValues = data.savedValues.filter(sv => !(sv.pageId === page.id && sv.id === savedValueId));
    await StorageService.setData(data);
}
async function getSavedFormDataForField(pageUrl, testId, querySelector) {
    const page = await StorageService.getCurrentPageData(pageUrl);
    if (!page)
        return [];
    const data = await StorageService.getData();
    if (!data)
        return [];
    const savedValuesForPage = data.savedValues.filter(sv => sv.pageId === page.id);
    return savedValuesForPage
        .filter(sv => sv.testId === testId || sv.querySelector === querySelector);
}
async function getSavedValuesForPage(pageId) {
    const data = await StorageService.getData();
    if (!data)
        return [];
    return data.savedValues.filter(sv => sv.pageId === pageId);
}
async function addSavedValue(pageId, savedValue) {
    const data = await StorageService.getData();
    if (!data)
        throw new Error('No data');
    // Generate unique ID if not provided
    const existingIds = data.savedValues.map(sv => sv.id);
    const newId = savedValue.id && !existingIds.includes(savedValue.id)
        ? savedValue.id
        : generateUniqueId(existingIds);
    // Create the saved value
    const newSavedValue = {
        id: newId,
        pageId,
        label: savedValue.label || '',
        value: savedValue.value || '',
        testId: savedValue.testId || '',
        querySelector: savedValue.querySelector || '',
        createdAt: savedValue.createdAt || getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp()
    };
    // Check if saved value already exists for this page and id
    const existingIndex = data.savedValues.findIndex(sv => sv.pageId === pageId && sv.id === newSavedValue.id);
    if (existingIndex !== -1) {
        // Update existing saved value
        data.savedValues[existingIndex] = newSavedValue;
    }
    else {
        // Add new saved value
        data.savedValues.push(newSavedValue);
    }
    await StorageService.setData(data);
    return newSavedValue;
}
async function deleteSavedValue(savedValueId) {
    const data = await StorageService.getData();
    if (!data)
        return;
    data.savedValues = data.savedValues.filter(sv => sv.id !== savedValueId);
    await StorageService.setData(data);
}

;// ./src/services/storage.service.ts

class StorageService {
    static async initialize() {
        return initialize();
    }
    static async getData() {
        return getData();
    }
    static async setData(data) {
        return setData(data);
    }
    static async getSettings() {
        return getSettings();
    }
    static async setSettings(settings) {
        return setSettings(settings);
    }
    static async getTheme() {
        return getTheme();
    }
    static async setTheme(theme) {
        return setTheme(theme);
    }
    static async getPageByUrl(url, matchIdentify) {
        return getPageByUrl(url, matchIdentify);
    }
    static async getPageById(pageId) {
        return getPageById(pageId);
    }
    static async getCurrentPageData(currentUrl) {
        return getCurrentPageData(currentUrl);
    }
    static async addPage(pageData) {
        return addPage(pageData);
    }
    static async updatePage(id, updates) {
        return updatePage(id, updates);
    }
    static async deletePreset(presetId) {
        return deletePreset(presetId);
    }
    static async addSavedFormData(pageUrl, formData) {
        return addSavedFormData(pageUrl, formData);
    }
    static async deleteSavedFormData(pageUrl, savedValueId) {
        return deleteSavedFormData(pageUrl, savedValueId);
    }
    static async getSavedFormDataForField(pageUrl, testId, querySelector) {
        return getSavedFormDataForField(pageUrl, testId, querySelector);
    }
    static async getPresetsForPage(pageId) {
        return getPresetsForPage(pageId);
    }
    static async getPageIdsForPreset(presetId) {
        return getPageIdsForPreset(presetId);
    }
    static async getUnlinkedPresets(pageId) {
        return getUnlinkedPresets(pageId);
    }
    static async getPresetById(presetId) {
        return getPresetById(presetId);
    }
    static async addPreset(preset) {
        return addPreset(preset);
    }
    static async updatePreset(presetId, updates) {
        return updatePreset(presetId, updates);
    }
    static async linkPresetToPage(presetId, pageId) {
        return linkPresetToPage(presetId, pageId);
    }
    static async unlinkPresetFromPage(presetId, pageId) {
        return unlinkPresetFromPage(presetId, pageId);
    }
    static async getSavedValuesForPage(pageId) {
        return getSavedValuesForPage(pageId);
    }
    static async addSavedValue(pageId, savedValue) {
        return addSavedValue(pageId, savedValue);
    }
    static async deleteSavedValue(savedValueId) {
        return deleteSavedValue(savedValueId);
    }
}

;// ./src/content/element-helpers/types-and-selectors.ts
const ASSISTANT_INPUT_TYPES = new Set([
    'text',
    'date',
    'datetime-local',
    'email',
    'tel',
    'number',
    'search',
    'url',
    'range',
    'color',
    'password'
]);
const TEXT_ACTION_INPUT_TYPES = new Set([
    'text',
    'search',
    'url',
    'tel',
    'email',
    'password',
    'number'
]);
const INLINE_HTML_EDITOR_SELECTOR = [
    '[contenteditable="true"]',
    '[contenteditable="plaintext-only"]',
    '[contenteditable=""]',
    '[role="textbox"][contenteditable]',
    '.alloy-editor[contenteditable]',
    '.ce-block__content[contenteditable]',
    '.ce-paragraph[contenteditable]',
    '.ck-editor__editable[contenteditable]',
    '.ck-editor__editable_inline[contenteditable]',
    '.cke_editable[contenteditable]',
    '.ck-content[contenteditable]',
    '.codex-editor [contenteditable]',
    '.editor-input[contenteditable]',
    '.fr-element[contenteditable]',
    '.jodit-wysiwyg[contenteditable]',
    '.medium-editor-element[contenteditable]',
    '.mce-content-body[contenteditable]',
    '.mce-edit-focus[contenteditable]',
    '.note-editable[contenteditable]',
    '.pell-content[contenteditable]',
    '.public-DraftEditor-content[contenteditable]',
    '.ql-editor[contenteditable]',
    '.redactor-in[contenteditable]',
    '.se-wrapper-wysiwyg[contenteditable]',
    '.scribe-editor[contenteditable]',
    '.st-editor__editable[contenteditable]',
    '.ProseMirror[contenteditable]',
    '.tiptap[contenteditable]',
    '.toastui-editor-contents[contenteditable]',
    '.trumbowyg-editor[contenteditable]',
    '.wym_iframe body[contenteditable]',
    '[data-contents="true"][contenteditable]',
    '[data-lexical-editor="true"]',
    '[data-medium-editor-element="true"]',
    '[data-slate-editor="true"]',
    '[data-testid*="editor" i][contenteditable]',
    '[class*="wysiwyg" i][contenteditable]',
    '[class*="rich-text" i][contenteditable]',
    '[class*="rte" i][contenteditable]',
    'trix-editor',
    'wysiwyg-editor'
].join(', ');
const HTML_EDITOR_IFRAME_SELECTOR = [
    '.cke_wysiwyg_frame',
    '.fr-iframe',
    '.jodit-wysiwyg_iframe',
    '.mce-edit-area iframe',
    '.redactor-box iframe',
    '.tox-edit-area iframe',
    '.tox-edit-area__iframe',
    '.wysihtml5-sandbox',
    'iframe[id$="_ifr"]',
    'iframe[name*="editor" i]',
    'iframe[title*="editor" i]',
    'iframe[title*="rich text" i]',
    'iframe[title*="wysiwyg" i]',
    'iframe[aria-label*="editor" i]',
    'iframe[aria-label*="rich text" i]'
].join(', ');
const HTML_EDITOR_SELECTOR = [
    INLINE_HTML_EDITOR_SELECTOR,
    HTML_EDITOR_IFRAME_SELECTOR
].join(', ');

;// ./src/content/element-helpers/editability.ts

function getElementName(element) {
    return element.name || '';
}
function getElementType(element) {
    if (element instanceof HTMLInputElement) {
        return (element.type || 'text').toLowerCase();
    }
    return element.tagName.toLowerCase();
}
function getFrameDocument(iframe) {
    try {
        return iframe.contentDocument || iframe.contentWindow?.document || null;
    }
    catch {
        return null;
    }
}
function getLinkedSourceElement(iframe) {
    const sourceId = iframe.id.endsWith('_ifr') ? iframe.id.slice(0, -4) : '';
    const source = sourceId ? document.getElementById(sourceId) : null;
    return isNativeEditableElement(source) ? source : null;
}
function getIframeEditorBody(iframe) {
    const frameDocument = getFrameDocument(iframe);
    if (!frameDocument?.body) {
        return null;
    }
    const body = frameDocument.body;
    const editable = body.matches(INLINE_HTML_EDITOR_SELECTOR)
        ? body
        : body.querySelector(INLINE_HTML_EDITOR_SELECTOR);
    return editable || body;
}
function isEditorIframeElement(element) {
    if (!(element instanceof HTMLIFrameElement)) {
        return false;
    }
    if (!element.matches(HTML_EDITOR_IFRAME_SELECTOR)) {
        return false;
    }
    return !!getIframeEditorBody(element);
}
function getReadableName(value) {
    return value
        .replace(/([A-Z])/g, ' $1')
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, letter => letter.toUpperCase())
        .trim();
}
function hasEditableContent(element) {
    const contentEditable = element.getAttribute('contenteditable')?.toLowerCase();
    return (contentEditable === 'true' ||
        contentEditable === 'plaintext-only' ||
        contentEditable === '' ||
        element.hasAttribute('data-lexical-editor') ||
        element.hasAttribute('data-slate-editor') ||
        element.hasAttribute('data-medium-editor-element') ||
        (element.getAttribute('role') === 'textbox' && element.isContentEditable) ||
        element.tagName === 'TRIX-EDITOR');
}
function isNativeEditableElement(element) {
    return !!element && (element instanceof HTMLInputElement ||
        element instanceof HTMLTextAreaElement ||
        element instanceof HTMLSelectElement);
}
function isHtmlEditorElement(element) {
    return isEditorIframeElement(element) || (element instanceof HTMLElement && hasEditableContent(element));
}
function isNestedHtmlEditorElement(element) {
    const parentEditor = element.parentElement?.closest(HTML_EDITOR_SELECTOR);
    return !!parentEditor && isHtmlEditorElement(parentEditor);
}
function isAssistantElement(element) {
    if (element instanceof HTMLInputElement) {
        return ASSISTANT_INPUT_TYPES.has((element.type || 'text').toLowerCase());
    }
    return (element instanceof HTMLTextAreaElement ||
        element instanceof HTMLSelectElement ||
        isEditorIframeElement(element) ||
        isHtmlEditorElement(element));
}
function getAssistantElementFromTarget(target) {
    if (!(target instanceof Element)) {
        return null;
    }
    const element = target.closest(`input, textarea, select, ${HTML_EDITOR_SELECTOR}`);
    return isAssistantElement(element) ? element : null;
}
function allowsTextActions(element) {
    if (element instanceof HTMLTextAreaElement || isHtmlEditorElement(element)) {
        return true;
    }
    return element instanceof HTMLInputElement && TEXT_ACTION_INPUT_TYPES.has((element.type || 'text').toLowerCase());
}

;// ./src/content/element-helpers/editable-values.ts

function dispatchValueEvents(element) {
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
}
function getEditableValue(element) {
    if (isEditorIframeElement(element)) {
        return getIframeEditorBody(element)?.innerHTML || '';
    }
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) {
        return element.value;
    }
    const valueElement = element;
    if (typeof valueElement.value === 'string') {
        return valueElement.value;
    }
    return element.innerHTML || element.textContent || '';
}
function setEditableValue(element, value) {
    if (isEditorIframeElement(element)) {
        const editorBody = getIframeEditorBody(element);
        if (editorBody) {
            editorBody.innerHTML = value;
            dispatchValueEvents(editorBody);
        }
        const source = getLinkedSourceElement(element);
        if (source) {
            source.value = value;
            dispatchValueEvents(source);
        }
        dispatchValueEvents(element);
        return;
    }
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) {
        element.value = value;
        dispatchValueEvents(element);
        return;
    }
    const valueElement = element;
    if (typeof valueElement.value === 'string') {
        valueElement.value = value;
    }
    else if (element.getAttribute('contenteditable')?.toLowerCase() === 'plaintext-only') {
        element.textContent = value;
    }
    else {
        element.innerHTML = value;
    }
    dispatchValueEvents(element);
}
function getFieldTypeForElement(element) {
    if (isHtmlEditorElement(element)) {
        return 'htmlEditor';
    }
    if (element instanceof HTMLSelectElement) {
        return 'dropdown';
    }
    if (element instanceof HTMLTextAreaElement) {
        return 'text';
    }
    if (element instanceof HTMLInputElement) {
        switch ((element.type || 'text').toLowerCase()) {
            case 'search':
                return 'search';
            case 'checkbox':
                return 'checkbox';
            case 'radio':
                return 'radio';
            case 'range':
                return 'range';
            case 'number':
                return 'number';
            case 'color':
                return 'color';
            case 'date':
            case 'datetime-local':
                return 'datepicker';
            default:
                return 'text';
        }
    }
    return 'text';
}

;// ./src/content/element-helpers/locators.ts


function getElementLocators(element) {
    const testId = element.getAttribute('data-testid') || element.id || '';
    let querySelector = '';
    if (element.id) {
        querySelector = `#${element.id}`;
    }
    else if (!element.getAttribute('data-testid')) {
        let parent = element.parentElement;
        let foundId = '';
        let foundTestId = '';
        let levelsUp = 0;
        const pathElements = [];
        for (let i = 0; i < LIMITS.PARENT_SEARCH_DEPTH && parent; i++) {
            pathElements.push(parent);
            if (!foundId && parent.id) {
                foundId = parent.id;
                levelsUp = i + 1;
            }
            if (!foundTestId && parent.getAttribute('data-testid')) {
                foundTestId = parent.getAttribute('data-testid') || '';
                levelsUp = i + 1;
                break;
            }
            parent = parent.parentElement;
        }
        if (foundId || foundTestId) {
            const parentSelector = foundId ? `#${foundId}` : `[data-testid='${foundTestId}']`;
            const pathParts = [parentSelector];
            for (let i = levelsUp - 2; i >= 0; i--) {
                pathParts.push(pathElements[i].tagName.toLowerCase());
            }
            const tagName = element.tagName.toLowerCase();
            let elementSelector = tagName;
            const inputType = element.getAttribute('type');
            const inputName = getElementName(element);
            if (inputType) {
                elementSelector += `[type='${inputType}']`;
            }
            if (inputName) {
                elementSelector += `[name='${inputName}']`;
            }
            pathParts.push(elementSelector);
            querySelector = pathParts.join(' > ');
        }
    }
    return { testId, querySelector };
}
function getTestId(element) {
    return getElementLocators(element).testId;
}
function getSelector(element) {
    return getElementLocators(element).querySelector;
}
function getElementSelector(element) {
    if (!element)
        return '';
    const el = element;
    if (el.id)
        return `${el.tagName.toLowerCase()}#${el.id}`;
    const testId = el.getAttribute('data-testid');
    if (testId)
        return `${el.tagName.toLowerCase()}[data-testid='${testId}']`;
    let parent = el.parentElement;
    let foundId = '';
    let foundTestId = '';
    let levelsUp = 0;
    const pathElements = [];
    for (let i = 0; i < LIMITS.PARENT_SEARCH_DEPTH && parent; i++) {
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
        const parentSelector = foundId ? `#${foundId}` : `[data-testid='${foundTestId}']`;
        const pathParts = [parentSelector];
        for (let i = levelsUp - 2; i >= 0; i--) {
            pathParts.push(pathElements[i].tagName.toLowerCase());
        }
        const tagName = el.tagName.toLowerCase();
        let elementSelector = tagName;
        const inputType = el.getAttribute('type');
        const inputName = getElementName(el);
        const classes = Array.from(el.classList).filter(Boolean);
        if (inputType)
            elementSelector += `[type='${inputType}']`;
        if (inputName)
            elementSelector += `[name='${inputName}']`;
        if (classes.length > 0)
            elementSelector += `.${classes[0]}`;
        pathParts.push(elementSelector);
        return pathParts.join(' > ');
    }
    let selector = el.tagName.toLowerCase();
    const classes = Array.from(el.classList).filter(Boolean);
    const nameAttr = getElementName(el);
    if (nameAttr) {
        selector += `[name='${nameAttr}']`;
        return selector;
    }
    if (classes.length > 0) {
        selector += `.${classes[0]}`;
        return selector;
    }
    const parentEl = el.parentElement;
    if (parentEl) {
        const children = Array.from(parentEl.children);
        const index = children.indexOf(el) + 1;
        selector = `${parentEl.tagName.toLowerCase()} > ${el.tagName.toLowerCase()}:nth-child(${index})`;
    }
    return selector;
}

;// ./src/utils/common.ts
/* unused harmony import specifier */ var common_THEMES;
/* unused harmony import specifier */ var common_StorageService;
/**
 * Common utility functions shared across the application
 */


/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
/**
 * Format date string to human-readable format
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1)
        return 'Just now';
    if (diffMins < 60)
        return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24)
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7)
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
}
/**
 * Initialize version display - Read from manifest and update all data-version elements
 */
async function initVersion() {
    try {
        const manifest = chrome.runtime.getManifest();
        const versionText = `Version: ${manifest.version} | Author: The Long Ride`;
        const versionElements = document.querySelectorAll('[data-version]');
        versionElements.forEach(element => {
            element.textContent = versionText;
        });
    }
    catch (error) {
        console.error('Failed to initialize version:', error);
    }
}
/**
 * Initialize theme system - Uses StorageService for persistence
 */
async function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    // Load theme from StorageService
    const theme = await common_StorageService.getTheme();
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcons(theme);
    themeToggle?.addEventListener('click', toggleTheme);
}
/**
 * Toggle between light and dark theme
 */
async function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || common_THEMES.DARK;
    const newTheme = currentTheme === common_THEMES.LIGHT ? common_THEMES.DARK : common_THEMES.LIGHT;
    document.documentElement.setAttribute('data-theme', newTheme);
    await common_StorageService.setTheme(newTheme);
    updateThemeIcons(newTheme);
}
/**
 * Update theme icon display
 */
function updateThemeIcons(theme) {
    const lightIcon = document.querySelector('.light-icon, .theme-icon.light-icon');
    const darkIcon = document.querySelector('.dark-icon, .theme-icon.dark-icon');
    if (lightIcon && darkIcon) {
        darkIcon.style.display = theme === common_THEMES.LIGHT ? 'block' : 'none';
        lightIcon.style.display = theme === common_THEMES.LIGHT ? 'none' : 'block';
    }
}
/**
 * Prompt user for confirmation
 */
function confirmAction(message) {
    return confirm(message);
}
/**
 * Show alert message
 */
function showAlert(message) {
    alert(message);
}
/**
 * Debounce function execution
 */
function debounce(func, delay) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}
/**
 * Sanitize filename for downloads
 */
function sanitizeFilename(name) {
    return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}
/**
 * Create and trigger file download
 */
function downloadFile(content, filename, type = 'application/json') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
/**
 * Read file as text
 */
async function readFileAsText(file) {
    return await file.text();
}
/**
 * Deep clone an object
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
/**
 * Check if element is visible
 */
function isElementVisible(element) {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    return (style.display !== 'none' &&
        style.visibility !== 'hidden');
}
/**
 * Get element position for sorting
 */
function getElementPosition(element) {
    const rect = element.getBoundingClientRect();
    return {
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX
    };
}
/**
 * Retry async operation with exponential backoff
 */
async function retryAsync(operation, maxRetries = 3, delay = 100) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation();
        }
        catch (error) {
            if (i === maxRetries - 1)
                throw error;
            await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
    }
    throw new Error('Max retries exceeded');
}
/**
 * Wait for specified milliseconds
 */
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

;// ./src/content/element-helpers/labels-and-scan.ts






function getElementLabel(element) {
    if (isEditorIframeElement(element)) {
        const source = getLinkedSourceElement(element);
        if (source) {
            return getElementLabel(source);
        }
    }
    const closestLabel = element.closest('label');
    if (closestLabel && closestLabel.textContent?.trim()) {
        return closestLabel.textContent.trim();
    }
    if (element.id) {
        const labelFor = document.querySelector(`label[for="${element.id}"]`);
        if (labelFor && labelFor.textContent?.trim()) {
            return labelFor.textContent.trim();
        }
    }
    const labelledBy = element.getAttribute('aria-labelledby');
    if (labelledBy) {
        const labelText = labelledBy
            .split(/\s+/)
            .map(id => document.getElementById(id)?.textContent?.trim() || '')
            .filter(Boolean)
            .join(' ');
        if (labelText) {
            return labelText;
        }
    }
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel?.trim())
        return ariaLabel.trim();
    if (element.title?.trim())
        return element.title.trim();
    const placeholder = element.getAttribute('placeholder');
    if (placeholder?.trim())
        return placeholder.trim();
    const name = getElementName(element);
    if (name.trim())
        return name.trim();
    const testId = element.getAttribute('data-testid');
    if (testId?.trim())
        return testId.trim();
    if (element.id?.trim())
        return element.id.trim();
    const ownText = (element.textContent || '').trim();
    let parent = element.parentElement;
    for (let i = 0; i < 3 && parent; i++) {
        if (parent.tagName === 'FORM' || (parent.tagName === 'DIV' && parent.children.length > 5)) {
            parent = parent.parentElement;
            continue;
        }
        const cleanText = (parent.textContent || '').replace(ownText, '').trim();
        if (cleanText && cleanText.length < 50) {
            return cleanText;
        }
        parent = parent.parentElement;
    }
    const prevSibling = element.previousElementSibling;
    if (prevSibling && prevSibling.textContent?.trim()) {
        const text = prevSibling.textContent.trim();
        if (text.length < 50)
            return text;
    }
    if (name)
        return getReadableName(name);
    if (element.id)
        return getReadableName(element.id);
    const typeLabels = {
        text: 'Text Field',
        email: 'Email',
        password: 'Password',
        tel: 'Phone',
        url: 'Website',
        search: 'Search',
        number: 'Number',
        range: 'Range',
        date: 'Date',
        'datetime-local': 'Date & Time',
        color: 'Color',
        checkbox: 'Checkbox',
        radio: 'Radio Button',
        htmlEditor: 'HTML Editor'
    };
    return typeLabels[getFieldTypeForElement(element)] || typeLabels[getElementType(element)] || 'Form Field';
}
function createScannedField(element, type, value, order) {
    const { testId, querySelector } = getElementLocators(element);
    const timestamp = getCurrentTimestamp();
    return {
        id: `${Date.now()}_${order - 1}`,
        type,
        title: getElementLabel(element),
        value,
        testId,
        querySelector: querySelector || getElementSelector(element),
        fillDelay: DEFAULTS.FILL_DELAY,
        autoBlur: DEFAULTS.AUTO_BLUR,
        createdAt: timestamp,
        updatedAt: timestamp,
        order,
        position: getElementPosition(element)
    };
}
function populateIdentifiers(element, testIdInput, selectorInput) {
    testIdInput.value = getTestId(element);
    selectorInput.value = getSelector(element);
}

;// ./src/content/element-helpers.ts






;// ./src/content/content-script/startup-listeners.ts



// Check if extension context is valid
function isExtensionContextValid() {
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
async function init() {
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
function attachInputListeners() {
    document.addEventListener('focusin', actions.handleInputFocus, true);
    document.addEventListener('focusout', actions.handleInputFocusOut, true);
    document.addEventListener('click', actions.handleInputClick, true);
    document.addEventListener('contextmenu', actions.handleContextMenu, true);
}
// Handle input click (for live assistant mode)
async function handleInputClick(event) {
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
    const target = event.target;
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
async function handleInputFocus(event) {
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
    const target = event.target;
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
function handleContextMenu(event) {
    const mouseEvent = event;
    const initial = document.elementFromPoint(mouseEvent.clientX, mouseEvent.clientY) || event.target;
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
        const dataTestEl = initial.closest('[data-testid]');
        if (dataTestEl) {
            state.lastContextMenuTarget = dataTestEl;
            state.lastContextMenuTargetType = 'data-testid';
        }
        else if (initial.id) {
            // Third priority: use nearest ancestor with id
            const idEl = initial.closest('[id]');
            state.lastContextMenuTarget = idEl || initial;
            state.lastContextMenuTargetType = 'id';
        }
        else {
            // Label-associated controls
            const label = initial.closest('label');
            if (label) {
                const forId = label.getAttribute('for');
                if (forId) {
                    const associated = document.getElementById(forId);
                    if (associated) {
                        state.lastContextMenuTarget = associated;
                        state.lastContextMenuTargetType = 'label-associated';
                    }
                }
                else {
                    const inner = label.querySelector(`input, textarea, select, ${HTML_EDITOR_SELECTOR}`);
                    if (inner) {
                        state.lastContextMenuTarget = inner;
                        state.lastContextMenuTargetType = 'label-associated';
                    }
                }
            }
            // Clickable or media elements
            if (!state.lastContextMenuTarget) {
                const clickEl = initial.closest('button, a, img');
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
    const best = state.lastContextMenuTarget;
    const testId = best?.getAttribute('data-testid');
    const id = best?.id;
    const name = (best?.name) || null;
    console.log('Context menu target selected:', { tag: best?.tagName, contextType: state.lastContextMenuTargetType, testId, id, name });
}
// Handle input focus out
function handleInputFocusOut(event) {
    // Delay removal to allow clicking popup buttons
    const activeElement = document.activeElement;
    const relatedTarget = event.relatedTarget;
    // Don't remove if mouse is over popup or if clicking inside popup
    if (state.isMouseOverPopup)
        return;
    if (state.autoFillPopup && state.autoFillPopup.contains(activeElement))
        return;
    if (state.autoFillPopup && relatedTarget && state.autoFillPopup.contains(relatedTarget))
        return;
    actions.removePopup();
}

;// ./src/utils/notification.ts
// Notification utility for showing temporary toasts and listening for module events
function showNotification(message) {
    try {
        const existing = document.getElementById('form-filler-notification');
        if (existing) {
            existing.remove();
        }
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.className = 'form-filler-notification';
        notification.id = 'form-filler-notification';
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.classList.add('slide-out');
            setTimeout(() => notification.remove(), 300);
        }, 2500);
    }
    catch (e) {
        // Fallback: console log if DOM operations fail
        try {
            console.log('Notification:', message);
        }
        catch { }
    }
}
// Helper to dispatch notifications from other modules
function dispatchNotification(message) {
    try {
        const ev = new CustomEvent('formFiller:notify', { detail: { message } });
        document.dispatchEvent(ev);
    }
    catch (e) {
        // As fallback, directly call showNotification
        showNotification(message);
    }
}
// Also listen for external events and show notification (useful if modules dispatch directly)
document.addEventListener('formFiller:notify', (ev) => {
    try {
        const detail = ev.detail;
        if (detail && typeof detail.message === 'string') {
            showNotification(detail.message);
        }
    }
    catch (e) {
        // ignore
    }
});

;// ./src/content/import-section.ts



let currentInputElement = null;
function setCurrentInputElement(element) {
    currentInputElement = element;
}
async function setupImportSection(popup, inputElement, pageData, afterClick) {
    const savedValuesSection = popup.querySelector('.saved-values-section');
    const presetValuesSection = popup.querySelector('.preset-values-section');
    const noteMessage = popup.querySelector('.import-section .note-message');
    const savedValuesGridBody = popup.querySelector('.saved-values-grid .grid-body');
    const presetValuesGridBody = popup.querySelector('.preset-values-grid .grid-body');
    if (!savedValuesGridBody || !presetValuesGridBody) {
        return;
    }
    const testId = getTestId(inputElement);
    const querySelector = getSelector(inputElement);
    const appendGridRow = (container, cells, onClick) => {
        const row = document.createElement('div');
        row.className = 'grid-row';
        cells.forEach(({ text, title }) => {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.textContent = text;
            if (title) {
                cell.title = title;
            }
            row.appendChild(cell);
        });
        if (onClick) {
            row.addEventListener('click', onClick);
        }
        container.appendChild(row);
    };
    savedValuesGridBody.innerHTML = '';
    presetValuesGridBody.innerHTML = '';
    let hasSavedValues = false;
    let hasPresetValues = false;
    // Populate saved values grid
    if (pageData?.id) {
        const savedValues = await StorageService.getSavedValuesForPage(pageData.id);
        const matchingSavedValues = savedValues
            .filter((sv) => (testId && sv.testId === testId) || (querySelector && sv.querySelector === querySelector))
            .sort((a, b) => (a.label || '').localeCompare(b.label || ''));
        if (matchingSavedValues.length > 0) {
            hasSavedValues = true;
            matchingSavedValues.forEach((sv) => {
                const value = String(sv.value ?? '');
                const label = sv.label || 'Saved';
                const displayValue = value.length > 30 ? `${value.substring(0, 30)}...` : value;
                // Build row with three cells: label, value, actions
                const row = document.createElement('div');
                row.className = 'grid-row';
                const cellLabel = document.createElement('div');
                cellLabel.className = 'grid-cell';
                cellLabel.textContent = label;
                const cellValue = document.createElement('div');
                cellValue.className = 'grid-cell';
                cellValue.textContent = displayValue;
                cellValue.title = value;
                const cellActions = document.createElement('div');
                cellActions.className = 'grid-cell';
                cellActions.classList.add('actions');
                const importBtn = document.createElement('button');
                importBtn.type = 'button';
                importBtn.className = 'import-value-btn';
                importBtn.textContent = 'APPLY';
                importBtn.title = 'Import this value into the field';
                importBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (currentInputElement) {
                        setEditableValue(currentInputElement, value);
                    }
                    afterClick?.();
                });
                const delBtn = document.createElement('button');
                delBtn.type = 'button';
                delBtn.className = 'delete-saved-value-btn';
                delBtn.textContent = 'DEL';
                delBtn.title = 'Delete this saved value';
                delBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    try {
                        if (!pageData?.url)
                            return;
                        await StorageService.deleteSavedFormData(pageData.url, sv.id);
                        showNotification('Saved value deleted');
                        // Remove the row from the DOM immediately for a snappier UI
                        if (row && row.parentElement) {
                            row.parentElement.removeChild(row);
                        }
                        // Refresh the import section to ensure consistent state using local inputElement
                        setupImportSection(popup, inputElement, pageData, afterClick);
                    }
                    catch (err) {
                        console.error('Failed to delete saved value:', err);
                        showNotification('Failed to delete saved value');
                    }
                });
                cellActions.appendChild(importBtn);
                cellActions.appendChild(delBtn);
                row.appendChild(cellLabel);
                row.appendChild(cellValue);
                row.appendChild(cellActions);
                savedValuesGridBody.appendChild(row);
            });
        }
    }
    // Populate preset values grid
    if (pageData?.id) {
        const presets = await StorageService.getPresetsForPage(pageData.id);
        const presetValues = [];
        presets.forEach((preset) => {
            if (preset.formData?.length > 0) {
                const matchingFields = preset.formData.filter((field) => (testId && field.testId === testId) || (querySelector && field.querySelector === querySelector));
                matchingFields.forEach((field) => {
                    presetValues.push({
                        presetName: preset.name,
                        fieldTitle: field.title || 'Field',
                        value: field.value
                    });
                });
            }
        });
        presetValues.sort((a, b) => {
            const presetCompare = a.presetName.localeCompare(b.presetName);
            if (presetCompare !== 0)
                return presetCompare;
            return a.fieldTitle.localeCompare(b.fieldTitle);
        });
        if (presetValues.length > 0) {
            hasPresetValues = true;
            presetValues.forEach((item) => {
                const value = String(item.value ?? '');
                const displayValue = value.length > 20 ? `${value.substring(0, 20)}...` : value;
                appendGridRow(presetValuesGridBody, [
                    { text: item.presetName },
                    { text: item.fieldTitle },
                    { text: displayValue, title: value },
                ], () => {
                    if (currentInputElement) {
                        setEditableValue(currentInputElement, value);
                    }
                    afterClick?.();
                });
            });
        }
    }
    savedValuesSection.style.display = hasSavedValues ? 'block' : 'none';
    presetValuesSection.style.display = hasPresetValues ? 'block' : 'none';
    noteMessage.style.display = (!hasSavedValues && !hasPresetValues) ? 'block' : 'none';
}

;// ./src/content/save-section.ts





async function setupSaveSection(popup, inputElement, pageData) {
    const nameInput = popup.querySelector('.name-input');
    const saveTarget = popup.querySelector('.save-target');
    const presetSelectorRow = popup.querySelector('.preset-selector-row');
    const presetSelector = popup.querySelector('.preset-selector');
    const testIdInput = popup.querySelector('.test-id-input');
    const selectorInput = popup.querySelector('.selector-input');
    const saveBtn = popup.querySelector('.save-btn');
    // Basic null checks to avoid runtime errors (save-message removed; notifications now use showNotification)
    if (!nameInput || !saveTarget || !presetSelectorRow || !presetSelector || !testIdInput || !selectorInput || !saveBtn) {
        console.warn('Missing save-section DOM elements, aborting setupSaveSection');
        return;
    }
    // Helper to dispatch notification events handled by content.ts
    const dispatchNotification = (text) => {
        try {
            document.dispatchEvent(new CustomEvent('formFiller:notify', { detail: { message: text } }));
        }
        catch (e) {
            console.warn('Failed to dispatch notification event', e);
        }
    };
    // Auto-generate name from field attributes
    nameInput.value = getElementLabel(inputElement);
    // Auto-populate test ID and selector
    populateIdentifiers(inputElement, testIdInput, selectorInput);
    // Populate preset selector
    if (pageData?.id) {
        const presets = await StorageService.getPresetsForPage(pageData.id);
        if (presets.length > 0) {
            presets.forEach((preset) => {
                const option = document.createElement('option');
                option.value = preset.id;
                option.textContent = preset.name;
                presetSelector.appendChild(option);
            });
        }
    }
    // Apply default save target from settings
    try {
        const settings = await StorageService.getSettings();
        if (settings && settings.defaultSaveItemTo) {
            // If there are no presets available, don't default to 'preset'
            const hasPresets = presetSelector.options.length > 0;
            if (settings.defaultSaveItemTo === 'preset' && !hasPresets) {
                saveTarget.value = 'savedValues';
            }
            else {
                saveTarget.value = settings.defaultSaveItemTo;
            }
        }
    }
    catch (err) {
        // ignore and keep existing default
        console.warn('Failed to load settings for default save target', err);
    }
    // Toggle preset selector visibility
    const updatePresetRow = () => {
        // If user selected preset but there are no presets, show saved instead
        if (saveTarget.value === 'preset' && presetSelector.options.length === 0) {
            presetSelectorRow.style.display = 'none';
            saveTarget.value = 'savedValues';
            return;
        }
        presetSelectorRow.style.display = saveTarget.value === 'preset' ? 'flex' : 'none';
    };
    // Set initial visibility based on current value (including applied default)
    updatePresetRow();
    saveTarget.addEventListener('change', () => {
        updatePresetRow();
    });
    // Save button handler
    saveBtn.addEventListener('click', async () => {
        const name = nameInput.value.trim();
        const value = getEditableValue(inputElement);
        const testId = testIdInput.value.trim();
        const selector = selectorInput.value.trim();
        const currentUrl = window.location.href;
        // clear any previous inline messages (using toast notifications instead)
        if (!name) {
            dispatchNotification('Name cannot be empty');
            return;
        }
        if (!value) {
            dispatchNotification('Please enter a value in the input field first');
            return;
        }
        if (saveTarget.value === 'savedValues') {
            // Get page data to find pageId
            const currentPageData = await StorageService.getCurrentPageData(currentUrl);
            if (!currentPageData) {
                dispatchNotification('Page not found');
                return;
            }
            await StorageService.addSavedValue(currentPageData.id, {
                id: generateGuid(),
                label: name,
                value: value,
                testId: testId,
                querySelector: selector,
                createdAt: getCurrentTimestamp(),
                updatedAt: getCurrentTimestamp()
            });
            dispatchNotification('Value saved successfully!');
        }
        else if (saveTarget.value === 'preset') {
            const presetId = presetSelector.value;
            if (!presetId) {
                dispatchNotification('Please select a preset');
                return;
            }
            const preset = await StorageService.getPresetById(presetId);
            if (preset) {
                // Only check for duplicates if both testId AND querySelector match
                const existingField = preset.formData.find((f) => testId && selector && f.testId === testId && f.querySelector === selector);
                if (existingField) {
                    dispatchNotification('A field with this Data test ID and Selector already exists in the preset');
                    return;
                }
                // Calculate max order + 1
                const maxOrder = preset.formData.reduce((max, item) => Math.max(max, item.order || 0), 0);
                const fieldData = {
                    id: generateGuid(),
                    type: getFieldTypeForElement(inputElement),
                    title: name,
                    value: value,
                    testId: testId,
                    querySelector: selector,
                    fillDelay: 0,
                    autoBlur: true,
                    createdAt: getCurrentTimestamp(),
                    updatedAt: getCurrentTimestamp(),
                    order: maxOrder + 1
                };
                preset.formData.push(fieldData);
                await StorageService.updatePreset(presetId, {
                    formData: preset.formData
                });
                dispatchNotification('Value saved to preset successfully!');
            }
        }
        await setupImportSection(popup, inputElement, pageData, () => { showNotification('Value imported into the field.'); });
    });
}

;// ./src/content/content-script/assistant-popup.ts






const POPUP_VIEWPORT_MARGIN = 8;
const POPUP_INPUT_GAP = 5;
function mountPopup(popup, preferDocumentElement = false) {
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
function preparePopupForMount(popup) {
    popup.style.setProperty('position', 'absolute', 'important');
    popup.style.setProperty('z-index', '2147483647', 'important');
    popup.style.setProperty('display', 'block', 'important');
    popup.style.setProperty('visibility', 'hidden', 'important');
}
function positionPopup(inputElement, popup) {
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
function keepPopupMounted(inputElement, popup) {
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
async function showFillingAssistantPopup(inputElement) {
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
        const copyTestBtn = popup.querySelector('.copy-testid-btn');
        const copySelectorBtn = popup.querySelector('.copy-selector-btn');
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
function createPopup(pageData, allowTextSections = false) {
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
        const target = e.target;
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
    if (state.autoFillPopup) {
        // Remove popup from parent
        state.autoFillPopup.remove();
        state.autoFillPopup = null;
    }
    state.isMouseOverPopup = false;
    setCurrentInputElement(null);
}

;// ./src/content/content-script/field-scan.ts



// Helper to decode HTML entities safely
function decodeHtmlEntities(text) {
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
function scanFormFields() {
    const fields = [];
    const scannedElements = new Set();
    const scanElements = (selector, getValue, typeOverride) => {
        document.querySelectorAll(selector).forEach(element => {
            addScannedField(element, getValue, typeOverride);
        });
    };
    const addScannedField = (element, getValue, typeOverride) => {
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
    const getInputValue = (element) => {
        const value = getEditableValue(element);
        return actions.isPlaceholderValue(element, value) ? '' : value;
    };
    // Scan search before the broader text selector so it keeps its specific type.
    scanElements('input[type="search"]', getInputValue, 'search');
    scanElements('input[type="text"], input[type="email"], input[type="password"], input[type="tel"], input[type="url"], input:not([type])', getInputValue, 'text');
    // Scan radio inputs: only capture the currently checked radio for each named group.
    const allRadios = Array.from(document.querySelectorAll('input[type="radio"]'));
    const radiosByName = new Map();
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
    scanElements('input[type="checkbox"]', element => element.checked, 'checkbox');
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
function isPlaceholderValue(element, value) {
    if (!value)
        return false;
    const placeholder = element.getAttribute('placeholder');
    if (placeholder && value === placeholder)
        return true;
    if (['x', 'X', '0.00', '0', '00/00/0000', 'MM/DD/YYYY'].includes(value.trim()))
        return true;
    return element instanceof HTMLInputElement && element.type === 'date' && value === '02/06/2026';
}

;// ./src/content/content-script/field-fill.ts


// Show temporary notification
// Notifications handled by src/utils/notification.ts (listens for formFiller:notify events)
function simulateClick(element) {
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
async function applypresetToPage(formData) {
    for (const field of formData) {
        await actions.applyFieldToPage(field);
    }
}
// Apply single field to page
async function applyFieldToPage(field) {
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
function findFieldElement(field) {
    let element = null;
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
function getFieldValueForFill(field) {
    const value = String(field.value ?? '');
    return field.type === 'htmlEditor' ? value : actions.decodeHtmlEntities(value);
}
function applyCheckboxField(element, field) {
    const shouldBeChecked = field.value === true || field.value === 'true';
    if (element instanceof HTMLInputElement && element.checked !== shouldBeChecked) {
        actions.simulateClick(element);
    }
    actions.blurAfterFill(element, field);
}
function applyRadioField(element, field) {
    if (!(element instanceof HTMLInputElement)) {
        return;
    }
    const radios = document.querySelectorAll(`input[type="radio"][name="${element.name}"]`);
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
function getDynamicDateValue(value) {
    try {
        const offsets = JSON.parse(String(value));
        return actions.formatDateWithOffsets(offsets.years || 0, offsets.months || 0, offsets.days || 0);
    }
    catch (e) {
        console.error('Failed to parse dynamicDate value:', e);
        return actions.formatDateWithOffsets(0, 0, 0);
    }
}
function formatDateWithOffsets(years, months, days) {
    const currentDate = new Date();
    currentDate.setFullYear(currentDate.getFullYear() + years);
    currentDate.setMonth(currentDate.getMonth() + months);
    currentDate.setDate(currentDate.getDate() + days);
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
function blurAfterFill(element, field) {
    if (field.autoBlur) {
        element.blur();
    }
}
function waitFor(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

;// ./src/content/content-script/assistant-sections.ts






// Setup random string section
function setupRandomStringSection(popup, inputElement) {
    const charsetSelect = popup.querySelector('.charset-select');
    const lengthInput = popup.querySelector('.length-input');
    const enterBtn = popup.querySelector('.enter-btn');
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
function setupLocatorRetrieverSection(popup, inputElement) {
    const testIdDisplay = popup.querySelector('.testid-display');
    const selectorDisplay = popup.querySelector('.selector-display');
    const copyTestIdBtn = popup.querySelector('.copy-testid-btn');
    const copySelectorBtn = popup.querySelector('.copy-selector-btn');
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
function setupRegexPatternSection(popup, inputElement) {
    const buttonsContainer = popup.querySelector('.regex-buttons');
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
                        let length = LIMITS.MAX_STRING_LENGTH;
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

;// ./src/content/content-script/bootstrap.ts




function bootstrap() {
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

;// ./src/content/content-script/index.ts







Object.assign(actions, startup_listeners_namespaceObject, assistant_popup_namespaceObject, field_scan_namespaceObject, field_fill_namespaceObject, assistant_sections_namespaceObject);
function startContentScript() {
    bootstrap();
}

;// ./src/content/content.ts

startContentScript();

/******/ })()
;