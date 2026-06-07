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

// NAMESPACE OBJECT: ./src/popup/popup-page/startup.ts
var startup_namespaceObject = {};
__webpack_require__.r(startup_namespaceObject);
__webpack_require__.d(startup_namespaceObject, {
  formatDate: () => (startup_formatDate),
  init: () => (init),
  loadSettings: () => (loadSettings),
  showConfirmation: () => (showConfirmation),
  showNotification: () => (showNotification),
  updateDependentToggles: () => (updateDependentToggles)
});

// NAMESPACE OBJECT: ./src/popup/popup-page/page-data.ts
var page_data_namespaceObject = {};
__webpack_require__.r(page_data_namespaceObject);
__webpack_require__.d(page_data_namespaceObject, {
  loadPageData: () => (loadPageData),
  setupNoPageActions: () => (setupNoPageActions),
  setupPageActionButtons: () => (setupPageActionButtons),
  updatePageInfoDisplay: () => (updatePageInfoDisplay)
});

// NAMESPACE OBJECT: ./src/popup/popup-page/page-modals.ts
var page_modals_namespaceObject = {};
__webpack_require__.r(page_modals_namespaceObject);
__webpack_require__.d(page_modals_namespaceObject, {
  handleImportFile: () => (handleImportFile),
  showClonePageModal: () => (showClonePageModal),
  showCreatePageModal: () => (showCreatePageModal),
  showPageManagement: () => (showPageManagement)
});

// NAMESPACE OBJECT: ./src/popup/popup-page/preset-table.ts
var preset_table_namespaceObject = {};
__webpack_require__.r(preset_table_namespaceObject);
__webpack_require__.d(preset_table_namespaceObject, {
  applyPreset: () => (applyPreset),
  handleDeletePreset: () => (handleDeletePreset),
  loadPresets: () => (loadPresets),
  renderPresetTable: () => (renderPresetTable),
  sortPresets: () => (sortPresets),
  updateSortIndicators: () => (updateSortIndicators)
});

// NAMESPACE OBJECT: ./src/popup/popup-page/scan-and-link.ts
var scan_and_link_namespaceObject = {};
__webpack_require__.r(scan_and_link_namespaceObject);
__webpack_require__.d(scan_and_link_namespaceObject, {
  openPresetEditor: () => (openPresetEditor),
  scanFormData: () => (scanFormData),
  showLinkPresetModal: () => (showLinkPresetModal),
  showScannedFieldsModal: () => (showScannedFieldsModal)
});

// NAMESPACE OBJECT: ./src/popup/popup-page/preset-import-export.ts
var preset_import_export_namespaceObject = {};
__webpack_require__.r(preset_import_export_namespaceObject);
__webpack_require__.d(preset_import_export_namespaceObject, {
  exportPresetsData: () => (exportPresetsData),
  importPresetsData: () => (importPresetsData),
  showExportPresetsModal: () => (showExportPresetsModal)
});

// NAMESPACE OBJECT: ./src/popup/popup-page/random-tools.ts
var random_tools_namespaceObject = {};
__webpack_require__.r(random_tools_namespaceObject);
__webpack_require__.d(random_tools_namespaceObject, {
  initRandomStringSection: () => (initRandomStringSection),
  showRandomStringModal: () => (showRandomStringModal),
  showStringCounterModal: () => (showStringCounterModal)
});

;// ./src/popup/popup-page/context.ts
const state = {
    currentPageData: null,
    currentUrl: '',
    currentTabTitle: '',
    sortColumn: 'rank',
    sortDirection: 'asc'
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
const THEMES = {
    LIGHT: 'light',
    DARK: 'dark'
};
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
/* unused harmony import specifier */ var helpers_CHAR_SETS;
/* unused harmony import specifier */ var helpers_LIMITS;
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
                    generatedPart = () => helpers_CHAR_SETS.WORD_CHARS[Math.floor(Math.random() * helpers_CHAR_SETS.WORD_CHARS.length)];
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
                generatedPart = () => helpers_CHAR_SETS.ALPHABET[Math.floor(Math.random() * helpers_CHAR_SETS.ALPHABET.length)];
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
                const count = min + Math.floor(Math.random() * (helpers_LIMITS.QUANTIFIER_MAX_REPEAT - min + 1));
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

;// ./src/utils/common.ts
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
    const theme = await StorageService.getTheme();
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcons(theme);
    themeToggle?.addEventListener('click', toggleTheme);
}
/**
 * Toggle between light and dark theme
 */
async function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || THEMES.DARK;
    const newTheme = currentTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
    document.documentElement.setAttribute('data-theme', newTheme);
    await StorageService.setTheme(newTheme);
    updateThemeIcons(newTheme);
}
/**
 * Update theme icon display
 */
function updateThemeIcons(theme) {
    const lightIcon = document.querySelector('.light-icon, .theme-icon.light-icon');
    const darkIcon = document.querySelector('.dark-icon, .theme-icon.dark-icon');
    if (lightIcon && darkIcon) {
        darkIcon.style.display = theme === THEMES.LIGHT ? 'block' : 'none';
        lightIcon.style.display = theme === THEMES.LIGHT ? 'none' : 'block';
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

;// ./src/constants/svgs.ts
const ExportIcon = `
<svg
    xmlns="http://www.w3.org/2000/svg"
    shape-rendering="geometricPrecision"
    text-rendering="geometricPrecision"
    image-rendering="optimizeQuality"
    fill-rule="evenodd"
    clip-rule="evenodd"
    viewBox="0 0 512 444.019"
>
    <path
        fill-rule="nonzero"
        d="M.723 320.533c-2.482-10.26 1.698-18.299 8.38-23.044a23.417 23.417 0 018.018-3.632c2.877-.699 5.88-.864 8.764-.452 8.127 1.166 15.534 6.417 18.013 16.677a631.854 631.854 0 014.317 19.092 1205.66 1205.66 0 013.418 16.772c4.445 22.442 7.732 36.511 16.021 43.526 8.775 7.422 25.366 9.984 57.167 9.984h268.042c29.359 0 44.674-2.807 52.736-10.093 7.768-7.022 10.805-20.735 14.735-41.777l.007-.043c.916-4.946 1.889-10.139 3.426-17.758 1.298-6.427 2.722-13.029 4.34-19.703 2.484-10.255 9.886-15.503 18.008-16.677 2.861-.41 5.846-.242 8.722.449 2.905.699 5.679 1.935 8.068 3.633 6.672 4.742 10.843 12.763 8.38 22.997l-.011.044a493.707 493.707 0 00-3.958 17.975c-1.011 5.023-2.169 11.215-3.281 17.177l-.008.044c-5.792 31.052-10.544 52.357-26.462 67.318-15.681 14.742-40.245 20.977-84.699 20.977H124.823c-46.477 0-72.016-5.596-88.445-20.144-16.834-14.909-21.937-36.555-28.444-69.403-1.316-6.653-2.582-13.005-3.444-17.125-1.213-5.782-2.461-11.434-3.767-16.814zm131.02-190.804L255.079 0l125.184 131.556-34.53 32.848-66.774-70.174.201 158.278h-47.594l-.202-158.397-65.092 68.466-34.529-32.848zM279.191 276.45l.028 22.977h-47.594l-.028-22.977h47.594zm.046 37.794l.024 18.65h-47.595l-.023-18.65h47.594z"
    />
</svg>
`;
const ImportIcon = `
<svg
    xmlns="http://www.w3.org/2000/svg"
    shape-rendering="geometricPrecision"
    text-rendering="geometricPrecision"
    image-rendering="optimizeQuality"
    fill-rule="evenodd"
    clip-rule="evenodd"
    viewBox="0 0 512 437.242"
>
    <path
        fill-rule="nonzero"
        d="M.723 313.756c-2.482-10.26 1.698-18.299 8.38-23.044a23.417 23.417 0 018.018-3.632c2.877-.7 5.88-.865 8.764-.452 8.127 1.166 15.534 6.417 18.013 16.677a632.525 632.525 0 014.317 19.091c1.566 7.418 2.52 12.234 3.418 16.772 4.445 22.443 7.732 36.512 16.021 43.526 8.775 7.423 25.366 9.985 57.167 9.985h268.042c29.359 0 44.674-2.807 52.736-10.093 7.768-7.023 10.805-20.735 14.735-41.777l.007-.043a1038.93 1038.93 0 013.426-17.758c1.298-6.427 2.722-13.029 4.34-19.703 2.484-10.256 9.886-15.503 18.008-16.677 2.861-.41 5.846-.242 8.722.449 2.905.699 5.679 1.935 8.068 3.633 6.672 4.741 10.843 12.762 8.38 22.997l-.011.044a494.136 494.136 0 00-3.958 17.974c-1.011 5.023-2.169 11.215-3.281 17.178l-.008.043c-5.792 31.052-10.544 52.357-26.462 67.319-15.681 14.741-40.245 20.977-84.699 20.977H124.823c-46.477 0-72.016-5.596-88.445-20.144-16.834-14.909-21.937-36.555-28.444-69.403-1.316-6.654-2.582-13.005-3.444-17.126-1.213-5.781-2.461-11.434-3.767-16.813zm165.549-143.439l65.092 68.466.204-160.91h47.595l-.204 160.791 66.774-70.174 34.53 32.848-125.184 131.556-123.336-129.729 34.529-32.848zm65.325-115.413l.028-22.041h47.594l-.028 22.041h-47.594zm.046-36.254L231.666 0h47.595l-.024 18.65h-47.594z"
    />
</svg>
`;
const BookInfoIcon = `
<svg
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 116.42 122.88"
    style="enable-background:new 0 0 116.42 122.88"
    xml:space="preserve"
>
    <style type="text/css"><![CDATA[.st0{fill-rule:evenodd;clip-rule:evenodd;}]]></style>
    <g>
        <path
            d="M11.98,100.05l0.29-52.03H6.4v66.21c8.07-2.08,16.17-3.41,24.33-3.46c7.53-0.05,15.07,1,22.61,3.56 c-4.69-3.8-9.92-6.59-15.5-8.41c-7.03-2.29-14.63-3.05-22.42-2.38c-1.76,0.14-3.3-1.17-3.45-2.92 C11.96,100.41,11.96,100.23,11.98,100.05L11.98,100.05L11.98,100.05z M58.21,0c15.66,0,28.55,11.92,30.09,27.17 c4.24-0.01,10.6,0.21,13.53,0.64c1.59,0.23,2.72,1.6,2.72,3.16l0,0v10.66h0.01h8.66c1.76,0,3.19,1.43,3.19,3.19v73.57 c0,1.77-1.43,3.2-3.19,3.2c-0.36,0-0.71-0.06-1.04-0.17c-8.91-2.55-17.75-4.24-26.52-4.3c-8.54-0.06-17.08,1.45-25.66,5.23 c-0.53,0.35-1.16,0.54-1.82,0.54c-0.64,0.01-1.28-0.18-1.82-0.54c-8.57-3.79-17.11-5.29-25.66-5.23c-8.76,0.06-17.6,1.75-26.52,4.3 c-0.32,0.11-0.67,0.17-1.03,0.17C1.43,121.59,0,120.17,0,118.4V44.82c0-1.76,1.43-3.19,3.19-3.19h9.1l0.06-10.67 c0.01-1.54,1.09-2.8,2.54-3.11l0,0c2.76-0.58,9.14-0.92,13.26-0.99C29.84,11.75,42.65,0,58.21,0L58.21,0L58.21,0z M88.28,33.57 c-1.54,14.08-12.74,25.25-26.83,26.76v47.9c5.42-3.62,10.96-6.59,16.65-8.62c6.49-2.31,13.16-3.41,20.07-2.86V45.3l0,0 c-0.02-0.15-0.04-0.32-0.04-0.48c0-0.16,0.01-0.32,0.04-0.48V33.8C96.11,33.6,91.87,33.52,88.28,33.57L88.28,33.57z M55.06,60.34 C40.81,58.86,29.5,47.49,28.11,33.21c-3.48,0.01-7.46,0.16-9.4,0.43l-0.36,63.3c7.4-0.26,14.64,0.67,21.45,2.9 c5.42,1.77,10.55,4.35,15.26,7.77l0,0V60.34L55.06,60.34z M64.55,113.84c7.06-2.22,14.11-3.13,21.15-3.09 c8.16,0.05,16.26,1.39,24.33,3.47v-66.2h-5.47v52.32c0,1.77-1.43,3.19-3.19,3.19c-0.26,0-0.5-0.03-0.74-0.08 c-6.99-1.1-13.77-0.19-20.38,2.17C74.93,107.52,69.7,110.36,64.55,113.84L64.55,113.84L64.55,113.84z M67.06,48.36h-17.7v-2.98 l3.33,0v-18.2h-3.33v-2.37h8.27c2.09,0,4.15-0.25,6.18-0.76v21.33h3.25V48.36L67.06,48.36L67.06,48.36z M59.4,10.38 c1.37,0,2.45,0.4,3.24,1.18c0.78,0.78,1.17,1.86,1.17,3.24c0,1.4-0.67,2.65-2.02,3.74c-1.35,1.09-2.93,1.64-4.71,1.64 c-1.35,0-2.41-0.38-3.23-1.13c-0.82-0.76-1.23-1.75-1.23-2.98c0-1.55,0.67-2.88,2-4.01C55.94,10.94,57.54,10.38,59.4,10.38 L59.4,10.38L59.4,10.38z"
        />
    </g>
</svg>
`;
const PlusIcon = `
<svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 122.88 122.75"
>
    <path
        d="M44.63,0H78.25a4,4,0,0,1,4,4V40.57h36.64a4,4,0,0,1,4,4V78.18a4,4,0,0,1-4,4H82.24v36.58a4,4,0,0,1-4,4H44.63a4,4,0,0,1-4-4V82.18H4a4,4,0,0,1-4-4V44.56a4,4,0,0,1,4-4H40.63V4a4,4,0,0,1,4-4Z"
    />
</svg>
`;
const TrashIcon = `
<svg
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 108.294 122.88"
    enable-background="new 0 0 108.294 122.88"
    xml:space="preserve"
>
    <g>
        <path
            d="M4.873,9.058h33.35V6.2V6.187c0-0.095,0.002-0.186,0.014-0.279c0.075-1.592,0.762-3.037,1.816-4.086l-0.007-0.007 c1.104-1.104,2.637-1.79,4.325-1.806l0.023,0.002V0h0.031h19.884h0.016c0.106,0,0.207,0.009,0.309,0.022 c1.583,0.084,3.019,0.76,4.064,1.81c1.102,1.104,1.786,2.635,1.803,4.315l-0.003,0.021h0.014V6.2v2.857h32.909h0.017 c0.138,0,0.268,0.014,0.401,0.034c1.182,0.106,2.254,0.625,3.034,1.41l0.004,0.007l0.005-0.007 c0.851,0.857,1.386,2.048,1.401,3.368l-0.002,0.032h0.014v0.032v10.829c0,1.472-1.195,2.665-2.667,2.665h-0.07H2.667 C1.195,27.426,0,26.233,0,24.762v-0.063V13.933v-0.014c0-0.106,0.004-0.211,0.018-0.315v-0.021 c0.089-1.207,0.624-2.304,1.422-3.098l-0.007-0.002C2.295,9.622,3.49,9.087,4.81,9.069l0.032,0.002V9.058H4.873L4.873,9.058z M77.79,49.097h-5.945v56.093h5.945V49.097L77.79,49.097z M58.46,49.097h-5.948v56.093h5.948V49.097L58.46,49.097z M39.13,49.097 h-5.946v56.093h5.946V49.097L39.13,49.097z M10.837,31.569h87.385l0.279,0.018l0.127,0.007l0.134,0.011h0.009l0.163,0.023 c1.363,0.163,2.638,0.789,3.572,1.708c1.04,1.025,1.705,2.415,1.705,3.964c0,0.098-0.009,0.193-0.019,0.286l-0.002,0.068 l-0.014,0.154l-7.393,79.335l-0.007,0.043h0.007l-0.016,0.139l-0.051,0.283l-0.002,0.005l-0.002,0.018 c-0.055,0.331-0.12,0.646-0.209,0.928l-0.007,0.022l-0.002,0.005l-0.009,0.018l-0.023,0.062l-0.004,0.021 c-0.118,0.354-0.264,0.698-0.432,1.009c-1.009,1.88-2.879,3.187-5.204,3.187H18.13l-0.247-0.014v0.003l-0.011-0.003l-0.032-0.004 c-0.46-0.023-0.889-0.091-1.288-0.202c-0.415-0.116-0.818-0.286-1.197-0.495l-0.009-0.002l-0.002,0.002 c-1.785-0.977-2.975-2.882-3.17-5.022L4.88,37.79l-0.011-0.125l-0.011-0.247l-0.004-0.116H4.849c0-1.553,0.664-2.946,1.707-3.971 c0.976-0.955,2.32-1.599,3.756-1.726l0.122-0.004v-0.007l0.3-0.013l0.104,0.002V31.569L10.837,31.569z M98.223,36.903H10.837 v-0.007l-0.116,0.004c-0.163,0.022-0.322,0.106-0.438,0.222c-0.063,0.063-0.104,0.132-0.104,0.179h-0.007l0.007,0.118l7.282,79.244 h-0.002l0.002,0.012c0.032,0.376,0.202,0.691,0.447,0.825l-0.002,0.004l0.084,0.032l0.063,0.012h0.077h72.695 c0.207,0,0.399-0.157,0.518-0.377l0.084-0.197l0.054-0.216l0.014-0.138h0.005l7.384-79.21L98.881,37.3 c0-0.045-0.041-0.111-0.103-0.172c-0.12-0.118-0.286-0.202-0.451-0.227L98.223,36.903L98.223,36.903z M98.334,36.901h-0.016H98.334 L98.334,36.901z M98.883,37.413v-0.004V37.413L98.883,37.413z M104.18,37.79l-0.002,0.018L104.18,37.79L104.18,37.79z M40.887,14.389H5.332v7.706h97.63v-7.706H67.907h-0.063c-1.472,0-2.664-1.192-2.664-2.664V6.2V6.168h0.007 c-0.007-0.22-0.106-0.433-0.259-0.585c-0.137-0.141-0.324-0.229-0.521-0.252h-0.082h-0.016H44.425h-0.031V5.325 c-0.213,0.007-0.422,0.104-0.576,0.259l-0.004-0.004l-0.007,0.004c-0.131,0.134-0.231,0.313-0.259,0.501l0.007,0.102V6.2v5.524 C43.554,13.196,42.359,14.389,40.887,14.389L40.887,14.389z"
        />
    </g>
</svg>
`;
const LinkIcon = `
<svg
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 122.88 122.88" style="enable-background:new 0 0 122.88 122.88"
    xml:space="preserve"
>
    <g>
        <path
            d="M37.49,53.69c1.25-1.25,3.27-1.25,4.51,0c1.25,1.25,1.25,3.27,0,4.51L6.61,93.6l22.67,22.67l0,0l35.44-35.44 c1.25-1.25,3.27-1.25,4.51,0c1.25,1.25,1.25,3.27,0,4.52L33.4,121.18v0l-0.01-0.01l-0.01,0.01c-1.14,1.14-2.62,1.7-4.11,1.7 c-1.38,0-2.76-0.49-3.86-1.47c-0.09-0.07-0.17-0.15-0.26-0.23l0,0L1.7,97.72C0.57,96.58,0,95.09,0,93.6c0-1.49,0.57-2.98,1.7-4.12 L37.49,53.69L37.49,53.69z M77.12,41.24c1.25-1.25,3.27-1.25,4.52,0c1.25,1.25,1.25,3.27,0,4.52l-31.4,31.4 c-1.25,1.25-3.27,1.25-4.51,0c-1.25-1.25-1.25-3.27,0-4.51L77.12,41.24L77.12,41.24z M85.6,68.98c-1.25,1.25-3.27,1.25-4.52,0 c-1.25-1.25-1.25-3.27,0-4.52l35.19-35.19L93.6,6.61L58.48,41.73c-1.25,1.25-3.27,1.25-4.51,0c-1.25-1.25-1.25-3.27,0-4.51 L89.48,1.7C90.62,0.57,92.11,0,93.6,0c1.49,0,2.98,0.57,4.12,1.7l23.46,23.46l0,0l-0.01,0.01l0.01,0.01 c1.14,1.14,1.7,2.62,1.7,4.11c0,1.49-0.57,2.98-1.7,4.12l0,0L85.6,68.98L85.6,68.98z"
        />
    </g>
</svg>
`;
const CopyIcon = `
<svg
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 111.07 122.88"
    style="enable-background:new 0 0 111.07 122.88" xml:space="preserve"
>
    <style type="text/css"><![CDATA[st0{fill-rule:evenodd;clip-rule:evenodd;}]]></style>
    <g>
    <path
        d="M97.67,20.81L97.67,20.81l0.01,0.02c3.7,0.01,7.04,1.51,9.46,3.93c2.4,2.41,3.9,5.74,3.9,9.42h0.02v0.02v75.28 v0.01h-0.02c-0.01,3.68-1.51,7.03-3.93,9.46c-2.41,2.4-5.74,3.9-9.42,3.9v0.02h-0.02H38.48h-0.01v-0.02 c-3.69-0.01-7.04-1.5-9.46-3.93c-2.4-2.41-3.9-5.74-3.91-9.42H25.1c0-25.96,0-49.34,0-75.3v-0.01h0.02 c0.01-3.69,1.52-7.04,3.94-9.46c2.41-2.4,5.73-3.9,9.42-3.91v-0.02h0.02C58.22,20.81,77.95,20.81,97.67,20.81L97.67,20.81z M0.02,75.38L0,13.39v-0.01h0.02c0.01-3.69,1.52-7.04,3.93-9.46c2.41-2.4,5.74-3.9,9.42-3.91V0h0.02h59.19 c7.69,0,8.9,9.96,0.01,10.16H13.4h-0.02v-0.02c-0.88,0-1.68,0.37-2.27,0.97c-0.59,0.58-0.96,1.4-0.96,2.27h0.02v0.01v3.17 c0,19.61,0,39.21,0,58.81C10.17,83.63,0.02,84.09,0.02,75.38L0.02,75.38z M100.91,109.49V34.2v-0.02h0.02 c0-0.87-0.37-1.68-0.97-2.27c-0.59-0.58-1.4-0.96-2.28-0.96v0.02h-0.01H38.48h-0.02v-0.02c-0.88,0-1.68,0.38-2.27,0.97 c-0.59,0.58-0.96,1.4-0.96,2.27h0.02v0.01v75.28v0.02h-0.02c0,0.88,0.38,1.68,0.97,2.27c0.59,0.59,1.4,0.96,2.27,0.96v-0.02h0.01 h59.19h0.02v0.02c0.87,0,1.68-0.38,2.27-0.97c0.59-0.58,0.96-1.4,0.96-2.27L100.91,109.49L100.91,109.49L100.91,109.49 L100.91,109.49z"
    />
    </g>
</svg>
`;
const GearIcon = `
<svg
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 122.881 122.88"
    enable-background="new 0 0 122.881 122.88"
    xml:space="preserve"
>
    <g>
        <path
        d="M97.977,18.705c-0.33-0.33-0.67-0.568-1.02-0.716c-0.328-0.139-0.711-0.207-1.15-0.207c-0.441,0-0.832,0.07-1.164,0.211 c-0.344,0.145-0.676,0.379-0.994,0.702l-0.021,0.021l-6.207,6.188c-0.93,0.925-2.367,1.028-3.41,0.313 c-0.73-0.472-1.508-0.927-2.324-1.368c-0.865-0.468-1.713-0.888-2.541-1.268c-0.863-0.394-1.744-0.765-2.641-1.113 c-0.813-0.316-1.719-0.638-2.707-0.964c-1.131-0.373-1.85-1.425-1.85-2.556l0,0V8.43c0-0.456-0.072-0.859-0.215-1.21 c-0.143-0.347-0.361-0.67-0.662-0.97c-0.293-0.293-0.611-0.51-0.959-0.651c-0.35-0.143-0.754-0.214-1.211-0.214H56.956 c-0.423,0-0.798,0.068-1.126,0.204c-0.348,0.143-0.689,0.377-1.026,0.703L54.8,6.295c-0.296,0.296-0.514,0.611-0.654,0.946 C54.002,7.584,53.93,7.98,53.93,8.43v8.714c0,1.325-0.957,2.426-2.217,2.651c-0.957,0.228-1.841,0.464-2.646,0.711 c-0.882,0.27-1.769,0.577-2.658,0.924c-0.044,0.017-0.088,0.033-0.132,0.047c-0.777,0.302-1.596,0.652-2.456,1.049 c-0.874,0.403-1.688,0.812-2.442,1.223c-1.063,0.579-2.345,0.364-3.165-0.443l-0.001,0.001l-6.874-6.775 c-0.021-0.021-0.042-0.042-0.063-0.063l0,0.001c-0.293-0.31-0.601-0.537-0.924-0.678c-0.31-0.135-0.677-0.204-1.105-0.204 c-0.425,0-0.805,0.072-1.139,0.215c-0.366,0.156-0.716,0.4-1.052,0.729l-0.002,0.002l-8.339,8.358l-0.005,0.006l0.005,0.005 c-0.342,0.342-0.584,0.682-0.727,1.02c-0.139,0.328-0.208,0.711-0.208,1.149c0,0.442,0.07,0.832,0.211,1.166 c0.145,0.343,0.378,0.675,0.702,0.993l0.021,0.021l6.188,6.208c0.925,0.93,1.028,2.367,0.313,3.41 c-0.472,0.731-0.927,1.508-1.367,2.324c-0.468,0.866-0.888,1.712-1.268,2.542c-0.395,0.862-0.766,1.744-1.115,2.641 c-0.316,0.812-0.637,1.718-0.963,2.706c-0.373,1.132-1.426,1.85-2.556,1.85v0.001H8.431c-0.458,0-0.86,0.071-1.211,0.213 c-0.346,0.142-0.666,0.358-0.958,0.651L6.251,51.81l0,0c-0.293,0.293-0.51,0.612-0.652,0.958c-0.143,0.351-0.213,0.754-0.213,1.211 v11.946c0,0.422,0.067,0.798,0.203,1.125c0.144,0.348,0.378,0.689,0.704,1.027l0.003,0.002c0.295,0.296,0.611,0.515,0.945,0.654 c0.344,0.144,0.74,0.216,1.19,0.216h8.713c1.325,0,2.426,0.957,2.651,2.218c0.228,0.956,0.464,1.841,0.711,2.646 c0.271,0.882,0.577,1.768,0.924,2.657c0.326,0.847,0.696,1.727,1.108,2.639c0.421,0.933,0.833,1.783,1.233,2.552 c0.557,1.066,0.326,2.336-0.486,3.143l0.002,0.002l-6.776,6.756l-0.043,0.042h0.001c-0.31,0.294-0.537,0.602-0.677,0.924 c-0.136,0.31-0.204,0.678-0.204,1.106c0,0.425,0.072,0.804,0.214,1.138c0.156,0.366,0.4,0.717,0.73,1.052l8.309,8.405 c0.325,0.301,0.664,0.521,1.019,0.66c0.356,0.141,0.76,0.21,1.212,0.21c0.456,0,0.867-0.071,1.229-0.214 c0.348-0.137,0.675-0.347,0.978-0.631l6.159-6.257c0.929-0.944,2.384-1.057,3.438-0.329c0.729,0.47,1.504,0.923,2.318,1.362 c0.866,0.469,1.712,0.889,2.542,1.268c0.862,0.396,1.744,0.767,2.641,1.115c0.812,0.315,1.717,0.637,2.706,0.963 c1.132,0.373,1.85,1.426,1.85,2.556h0.001v9.518c0,0.456,0.071,0.859,0.214,1.21c0.142,0.347,0.358,0.666,0.651,0.959l0.005,0.006 l0.005-0.006c0.587,0.587,1.307,0.876,2.169,0.876h11.944c0.424,0,0.799-0.067,1.127-0.203c0.348-0.144,0.689-0.378,1.025-0.704 l0.004-0.003c0.295-0.296,0.514-0.611,0.654-0.945c0.145-0.344,0.217-0.739,0.217-1.189v-8.715c0-1.324,0.955-2.426,2.217-2.65 c0.955-0.228,1.84-0.465,2.646-0.711c0.881-0.271,1.768-0.577,2.656-0.923c0.848-0.327,1.729-0.697,2.643-1.109 c0.93-0.421,1.781-0.832,2.547-1.232c1.068-0.557,2.338-0.325,3.145,0.486l0.002-0.002l6.756,6.775l0.041,0.043v-0.001 c0.297,0.312,0.605,0.538,0.926,0.678c0.314,0.135,0.693,0.204,1.145,0.204c0.443,0,0.828-0.072,1.16-0.215 c0.334-0.145,0.645-0.368,0.928-0.667c0.031-0.034,0.064-0.067,0.1-0.1l8.369-8.272c0.299-0.324,0.52-0.664,0.658-1.019 c0.141-0.356,0.211-0.761,0.211-1.213c0-0.456-0.07-0.867-0.213-1.229c-0.139-0.348-0.348-0.674-0.633-0.977l-6.256-6.16 c-0.945-0.929-1.057-2.383-0.33-3.438c0.471-0.729,0.924-1.504,1.363-2.317c0.469-0.865,0.889-1.712,1.268-2.542 c0.395-0.862,0.766-1.744,1.115-2.641c0.314-0.812,0.637-1.718,0.963-2.707c0.373-1.132,1.426-1.85,2.557-1.85v-0.001h9.516 c0.457,0,0.861-0.071,1.211-0.214c0.346-0.142,0.666-0.358,0.959-0.65l0.01-0.011l0,0c0.293-0.294,0.512-0.613,0.652-0.96 c0.143-0.35,0.213-0.753,0.213-1.21V56.955c0-0.422-0.066-0.798-0.203-1.126c-0.143-0.347-0.377-0.689-0.703-1.027l-0.004-0.003 c-0.295-0.296-0.611-0.514-0.945-0.654c-0.342-0.144-0.738-0.216-1.189-0.216h-8.713c-1.342,0-2.453-0.979-2.658-2.262 c-0.211-0.843-0.449-1.698-0.719-2.566c-0.26-0.833-0.564-1.714-0.92-2.645c-0.018-0.045-0.033-0.091-0.047-0.137 c-0.338-0.885-0.684-1.717-1.039-2.496c-0.385-0.843-0.793-1.658-1.225-2.446c-0.578-1.063-0.363-2.345,0.443-3.165v-0.001 l6.775-6.874c0.021-0.021,0.041-0.042,0.063-0.063v0c0.311-0.293,0.537-0.601,0.678-0.923c0.135-0.31,0.205-0.677,0.205-1.105 c0-0.425-0.072-0.805-0.215-1.139c-0.156-0.366-0.4-0.716-0.73-1.052l-0.002-0.002l-8.359-8.339L97.977,18.705L97.977,18.705 L97.977,18.705z M99.039,13.044c1.002,0.423,1.912,1.042,2.732,1.862l0.002,0.001l8.381,8.362l0.021,0.021 c0.807,0.82,1.424,1.723,1.846,2.713c0.436,1.021,0.656,2.102,0.656,3.243c0,1.158-0.225,2.24-0.668,3.251 c-0.432,0.992-1.063,1.874-1.879,2.653l-5.367,5.445c0.158,0.329,0.316,0.662,0.469,0.999c0.43,0.938,0.824,1.878,1.182,2.819 c0.02,0.042,0.037,0.085,0.053,0.129c0.357,0.937,0.699,1.933,1.025,2.981c0.105,0.338,0.207,0.678,0.305,1.021h6.652 c1.156,0,2.238,0.212,3.252,0.636c0.996,0.417,1.896,1.032,2.699,1.841l0.057,0.057c0.791,0.818,1.391,1.72,1.799,2.71 c0.418,1.007,0.625,2.062,0.625,3.167V68.9c0,1.149-0.203,2.225-0.613,3.23c-0.41,1.003-1.021,1.914-1.838,2.733l-0.004,0.003 l-0.006,0.007l-0.004,0.004c-0.82,0.817-1.73,1.43-2.736,1.84c-1.006,0.409-2.082,0.613-3.23,0.613h-7.609 c-0.133,0.358-0.271,0.728-0.42,1.106c-0.381,0.979-0.793,1.958-1.24,2.936c-0.463,1.011-0.934,1.966-1.414,2.857 c-0.158,0.292-0.32,0.583-0.486,0.874l4.75,4.676c0.035,0.033,0.068,0.066,0.104,0.102c0.779,0.824,1.365,1.739,1.76,2.739 c0.396,1.004,0.592,2.068,0.592,3.186c0,1.114-0.195,2.169-0.588,3.169c-0.393,0.997-0.973,1.908-1.744,2.734v-0.001 c-0.027,0.028-0.055,0.058-0.084,0.086l-8.43,8.333c-0.791,0.829-1.682,1.463-2.682,1.893c-1.01,0.436-2.102,0.657-3.283,0.657 c-1.156,0-2.246-0.226-3.27-0.667c-1.014-0.439-1.91-1.074-2.691-1.898l-5.344-5.358c-0.357,0.172-0.707,0.335-1.047,0.489 c-0.91,0.41-1.883,0.815-2.916,1.214c-0.971,0.378-1.984,0.727-3.035,1.049c-0.35,0.107-0.695,0.209-1.035,0.306v6.638 c0,1.155-0.213,2.238-0.637,3.251c-0.418,0.997-1.031,1.896-1.842,2.7l-0.057,0.058c-0.818,0.789-1.721,1.388-2.709,1.798 c-1.008,0.417-2.063,0.624-3.168,0.624H53.979c-2.349,0-4.333-0.81-5.977-2.454l0.005-0.005c-0.82-0.821-1.435-1.734-1.845-2.741 c-0.41-1.006-0.614-2.081-0.614-3.23v-7.609c-0.359-0.133-0.728-0.272-1.107-0.42c-0.978-0.381-1.957-0.793-2.935-1.241 c-1.011-0.462-1.966-0.934-2.858-1.415c-0.291-0.157-0.582-0.319-0.873-0.485l-4.676,4.75c-0.033,0.035-0.067,0.069-0.102,0.103 c-0.824,0.781-1.739,1.367-2.739,1.761c-1.004,0.396-2.068,0.593-3.186,0.593c-1.114,0-2.17-0.195-3.169-0.589 c-0.997-0.393-1.907-0.973-2.734-1.743l0.001-0.002c-0.029-0.026-0.058-0.054-0.085-0.083l-8.381-8.478 c-0.806-0.82-1.423-1.724-1.845-2.714c-0.435-1.022-0.656-2.102-0.656-3.242c0-1.158,0.225-2.24,0.667-3.252 c0.437-0.999,1.071-1.886,1.897-2.67l5.359-5.344c-0.172-0.357-0.336-0.707-0.49-1.05c-0.411-0.909-0.815-1.88-1.213-2.912 c-0.378-0.971-0.728-1.984-1.05-3.036c-0.107-0.351-0.209-0.695-0.306-1.035H8.431c-1.156,0-2.239-0.213-3.251-0.637 c-0.998-0.417-1.897-1.031-2.7-1.841L2.422,71.8c-0.79-0.817-1.389-1.72-1.798-2.709C0.207,68.083,0,67.028,0,65.925V53.979 c0-1.149,0.204-2.225,0.614-3.23c0.41-1.005,1.021-1.916,1.839-2.735l0.001-0.001l0.006-0.005l0.005-0.005 c0.82-0.818,1.73-1.43,2.736-1.84c1.005-0.41,2.081-0.613,3.23-0.613h7.609c0.132-0.359,0.272-0.728,0.42-1.107 c0.38-0.978,0.793-1.957,1.241-2.936c0.462-1.011,0.933-1.966,1.415-2.857c0.16-0.297,0.326-0.594,0.496-0.891l-4.681-4.696 l-0.002-0.001c-0.827-0.813-1.453-1.728-1.88-2.739c-0.437-1.032-0.653-2.118-0.653-3.249c0-1.129,0.215-2.205,0.649-3.232 c0.43-1.017,1.05-1.932,1.863-2.745l0.005,0.005l8.356-8.376l0.021-0.021c0.82-0.806,1.723-1.423,2.713-1.845 c1.022-0.435,2.102-0.657,3.243-0.657c1.157,0,2.239,0.225,3.251,0.667c0.992,0.433,1.874,1.063,2.653,1.88l5.441,5.362 c0.327-0.162,0.653-0.317,0.978-0.467c0.837-0.386,1.761-0.775,2.772-1.167c0.043-0.02,0.087-0.038,0.131-0.055 c0.971-0.378,1.985-0.728,3.037-1.05c0.35-0.107,0.695-0.209,1.035-0.306V8.43c0-1.155,0.213-2.238,0.637-3.25 c0.417-0.998,1.032-1.897,1.841-2.701l0.057-0.057c0.818-0.79,1.72-1.388,2.709-1.797C54.796,0.207,55.851,0,56.956,0H68.9 c1.148,0,2.225,0.203,3.23,0.613c1.01,0.412,1.924,1.027,2.748,1.85c0.814,0.816,1.428,1.728,1.84,2.737 c0.41,1.005,0.613,2.081,0.613,3.229v7.61c0.359,0.133,0.727,0.273,1.107,0.42c0.977,0.38,1.955,0.793,2.934,1.24 c1.012,0.462,1.967,0.934,2.857,1.416c0.299,0.161,0.596,0.326,0.893,0.496l4.695-4.681l0.002-0.001 c0.813-0.827,1.729-1.453,2.738-1.88c1.033-0.437,2.117-0.653,3.248-0.653C96.936,12.396,98.012,12.61,99.039,13.044L99.039,13.044 z M61.44,35.346c1.781,0,3.519,0.17,5.214,0.508c1.666,0.333,3.318,0.844,4.953,1.534l0.018,0.008l0.004-0.008 c1.561,0.674,3.041,1.479,4.441,2.417c1.387,0.929,2.672,1.978,3.85,3.145l0.01,0.011l0,0c1.168,1.179,2.217,2.463,3.146,3.851 c0.938,1.4,1.742,2.88,2.416,4.441c0.031,0.074,0.059,0.148,0.084,0.223c0.646,1.569,1.131,3.152,1.449,4.751 c0.34,1.696,0.508,3.433,0.508,5.213c0,1.781-0.168,3.519-0.508,5.214c-0.332,1.667-0.844,3.317-1.533,4.953l-0.008,0.018 l0.008,0.004c-0.674,1.561-1.479,3.04-2.416,4.44c-0.93,1.388-1.979,2.672-3.146,3.851l-0.01,0.011l0,0 c-1.18,1.168-2.463,2.217-3.852,3.146c-1.398,0.938-2.879,1.742-4.439,2.416c-0.074,0.031-0.148,0.06-0.225,0.084 c-1.568,0.647-3.152,1.131-4.75,1.45c-1.695,0.339-3.434,0.508-5.214,0.508c-1.781,0-3.518-0.169-5.213-0.508 c-1.667-0.333-3.318-0.845-4.954-1.534l-0.018-0.008l-0.003,0.008c-1.561-0.674-3.042-1.479-4.441-2.416 c-1.388-0.929-2.672-1.978-3.85-3.146l-0.01-0.011l0,0c-1.168-1.18-2.218-2.463-3.146-3.852c-0.937-1.399-1.742-2.88-2.415-4.439 c-0.032-0.074-0.06-0.148-0.085-0.224c-0.647-1.569-1.131-3.152-1.45-4.751c-0.338-1.695-0.508-3.433-0.508-5.214 c0-1.781,0.169-3.518,0.508-5.213c0.333-1.667,0.845-3.318,1.535-4.953l0.007-0.018l-0.007-0.003 c0.673-1.561,1.479-3.041,2.415-4.44c0.929-1.389,1.978-2.672,3.146-3.852l0.011-0.01l0,0c1.178-1.167,2.462-2.216,3.849-3.145 c1.4-0.937,2.881-1.743,4.442-2.417c0.074-0.032,0.148-0.06,0.224-0.084c1.569-0.647,3.151-1.13,4.75-1.449 C57.922,35.516,59.659,35.346,61.44,35.346L61.44,35.346z M65.602,41.134c-1.344-0.269-2.73-0.403-4.162-0.403 c-1.431,0-2.817,0.134-4.162,0.403c-1.306,0.261-2.553,0.635-3.741,1.122c-0.052,0.026-0.105,0.052-0.16,0.075 c-1.298,0.561-2.492,1.205-3.58,1.933c-1.096,0.733-2.11,1.563-3.044,2.487c-0.925,0.935-1.755,1.951-2.489,3.048 c-0.728,1.087-1.372,2.28-1.932,3.578l-0.007-0.003c-0.521,1.237-0.917,2.539-1.191,3.905c-0.268,1.344-0.402,2.73-0.402,4.161 s0.134,2.817,0.402,4.162c0.261,1.306,0.636,2.553,1.123,3.741c0.026,0.053,0.052,0.105,0.075,0.16 c0.56,1.298,1.204,2.49,1.931,3.577c0.734,1.097,1.564,2.113,2.49,3.048c0.934,0.925,1.949,1.754,3.045,2.487 c1.087,0.728,2.28,1.372,3.579,1.933l-0.003,0.007c1.238,0.521,2.539,0.918,3.905,1.19c1.344,0.269,2.731,0.402,4.162,0.402 c1.431,0,2.818-0.134,4.162-0.402c1.307-0.261,2.553-0.635,3.742-1.122c0.051-0.026,0.105-0.052,0.16-0.075 c1.297-0.561,2.49-1.205,3.578-1.933c1.096-0.733,2.111-1.563,3.045-2.487c0.926-0.935,1.756-1.95,2.49-3.047 c0.727-1.087,1.371-2.28,1.93-3.578l0.008,0.003c0.521-1.237,0.918-2.539,1.191-3.904c0.268-1.345,0.402-2.731,0.402-4.162 s-0.135-2.817-0.402-4.161c-0.262-1.307-0.635-2.553-1.123-3.742c-0.027-0.052-0.051-0.105-0.076-0.16 c-0.559-1.298-1.203-2.491-1.932-3.578c-0.732-1.097-1.563-2.113-2.488-3.047c-0.934-0.924-1.949-1.754-3.045-2.487 c-1.088-0.728-2.281-1.372-3.578-1.933l0.002-0.007C68.27,41.804,66.969,41.407,65.602,41.134L65.602,41.134z"
    />
    </g>
</svg>
`;
const ModifyIcon = `
<svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 122.88 119.19"
>
    <defs><style>.cls-1{fill-rule:evenodd;}</style></defs>
    <path
        d="M104.84,1.62,121.25,18a5.58,5.58,0,0,1,0,7.88L112.17,35l-24.3-24.3L97,1.62a5.6,5.6,0,0,1,7.88,0ZM31.26,3.43h36.3L51.12,19.87H31.26A14.75,14.75,0,0,0,20.8,24.2l0,0a14.75,14.75,0,0,0-4.33,10.46v68.07H84.5A14.78,14.78,0,0,0,95,98.43l0,0a14.78,14.78,0,0,0,4.33-10.47V75.29l16.44-16.44V87.93A31.22,31.22,0,0,1,106.59,110l0,.05a31.2,31.2,0,0,1-22,9.15h-72a12.5,12.5,0,0,1-8.83-3.67l0,0A12.51,12.51,0,0,1,0,106.65v-72a31.15,31.15,0,0,1,9.18-22l.05-.05a31.17,31.17,0,0,1,22-9.16ZM72.33,74.8,52.6,80.9c-13.85,3-13.73,6.15-11.16-6.91l6.64-23.44h0l0,0L83.27,15.31l24.3,24.3L72.35,74.83l0,0ZM52.22,54.7l16,16-13,4c-10.15,3.13-10.1,5.22-7.34-4.55l4.34-15.4Z"
    />
</svg>
`;
const LightbubIcon = `
<svg
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 113.01 122.88"
    style="enable-background:new 0 0 113.01 122.88"
    xml:space="preserve"
>
    <g>
        <path
            d="M44.13,102.06c-1.14,0.03-2.14-0.81-2.3-1.96c-0.17-1.2,0.64-2.31,1.82-2.54c-1.3-7.37-4.85-11.43-8.6-15.72 c-2.92-3.34-5.95-6.81-8.34-11.92c-2.35-5.03-3.64-10.23-3.6-15.63c0.05-5.4,1.42-10.96,4.4-16.71c0.02-0.04,0.04-0.07,0.06-0.11 l0,0c3.91-6.62,9.38-11.04,15.47-13.52c5.11-2.09,10.66-2.8,16.1-2.3c5.42,0.5,10.73,2.2,15.37,4.94 c5.9,3.49,10.75,8.67,13.42,15.21c1.44,3.54,2.42,7.49,2.54,11.82c0.12,4.31-0.62,8.96-2.61,13.88 c-2.66,6.59-6.18,10.68-9.47,14.51c-3.03,3.53-5.85,6.81-7.42,11.84c0.89,0.21,1.59,0.94,1.73,1.9c0.17,1.24-0.7,2.39-1.94,2.56 l-0.77,0.11c-0.14,1.09-0.23,2.26-0.27,3.51l0.25-0.04c1.24-0.17,2.39,0.7,2.56,1.94c0.17,1.24-0.7,2.39-1.94,2.56l-0.78,0.11 c0.01,0.15,0.02,0.3,0.03,0.45l0,0c0.07,0.88,0.08,1.73,0.03,2.54l0.13-0.02c1.25-0.15,2.38,0.74,2.54,1.98 c0.15,1.25-0.74,2.38-1.98,2.54l-1.68,0.21c-1.2,3.11-3.34,5.48-5.87,6.94c-1.74,1.01-3.67,1.59-5.61,1.71 c-1.97,0.12-3.96-0.25-5.78-1.13c-2.08-1.02-3.94-2.71-5.29-5.14c-0.65-0.33-1.13-0.97-1.23-1.75c-0.04-0.31-0.01-0.61,0.07-0.89 c-0.39-1.16-0.68-2.43-0.87-3.83l-0.07,0.01c-1.24,0.17-2.39-0.7-2.56-1.94c-0.17-1.24,0.7-2.39,1.94-2.56l0.54-0.08 C44.19,104.32,44.18,103.16,44.13,102.06L44.13,102.06z M2.18,58.86C1.01,58.89,0.04,57.98,0,56.81c-0.04-1.17,0.88-2.14,2.05-2.18 l8.7-0.3c1.17-0.04,2.14,0.88,2.18,2.05c0.04,1.17-0.88,2.14-2.05,2.18L2.18,58.86L2.18,58.86z M110.68,50.25 c1.16-0.12,2.2,0.73,2.32,1.89c0.12,1.16-0.73,2.2-1.89,2.32l-8.66,0.91c-1.16,0.12-2.2-0.73-2.32-1.89 c-0.12-1.16,0.73-2.2,1.89-2.32L110.68,50.25L110.68,50.25z M94.91,14.78c0.65-0.97,1.96-1.23,2.93-0.58 c0.97,0.65,1.23,1.96,0.58,2.93l-4.84,7.24c-0.65,0.97-1.96,1.23-2.93,0.58c-0.97-0.65-1.23-1.96-0.58-2.93L94.91,14.78 L94.91,14.78z M57.63,2.06c0.03-1.17,1-2.09,2.16-2.06c1.17,0.03,2.09,1,2.06,2.16l-0.22,8.7c-0.03,1.17-1,2.09-2.16,2.06 c-1.17-0.03-2.09-1-2.06-2.16L57.63,2.06L57.63,2.06z M13.88,15.53c-0.86-0.8-0.9-2.14-0.11-2.99c0.8-0.86,2.14-0.9,2.99-0.11 l6.37,5.94c0.86,0.8,0.9,2.14,0.11,2.99c-0.8,0.86-2.14,0.9-2.99,0.11L13.88,15.53L13.88,15.53z M47.88,96.95l18.49-2.63 c1.59-6.7,5.05-10.73,8.8-15.08c3.08-3.58,6.36-7.4,8.76-13.34c1.76-4.35,2.41-8.43,2.31-12.19c-0.1-3.75-0.96-7.21-2.24-10.34 c-2.3-5.63-6.51-10.11-11.65-13.15c-4.11-2.43-8.8-3.94-13.59-4.37c-4.77-0.44-9.64,0.19-14.13,2.02 c-5.26,2.15-9.99,5.97-13.39,11.72c-2.64,5.12-3.86,10.02-3.9,14.73c-0.04,4.74,1.11,9.33,3.2,13.8c2.13,4.56,4.97,7.8,7.69,10.92 C42.47,83.9,46.48,88.49,47.88,96.95L47.88,96.95z M65.62,99.02l-17.27,2.45c0.05,1.1,0.07,2.25,0.05,3.47l17.05-2.42 C65.47,101.29,65.52,100.12,65.62,99.02L65.62,99.02z M48.49,109.52c0.12,0.92,0.3,1.76,0.53,2.54l16.55-2.04 c0.11-0.86,0.13-1.77,0.05-2.74l0,0l0-0.02l-0.01-0.17L48.49,109.52L48.49,109.52z M51.37,116.36c0.64,0.67,1.35,1.19,2.1,1.55 c1.15,0.56,2.42,0.79,3.67,0.72c1.29-0.08,2.57-0.47,3.74-1.15c1.1-0.64,2.09-1.53,2.88-2.65L51.37,116.36L51.37,116.36z"
        />
    </g>
</svg>
`;
const DiskIcon = `
<svg
    xmlns="http://www.w3.org/2000/svg"
    shape-rendering="geometricPrecision"
    text-rendering="geometricPrecision"
    image-rendering="optimizeQuality"
    fill-rule="evenodd"
    clip-rule="evenodd"
    viewBox="0 0 512 511.52"
>
    <path
        fill-rule="nonzero"
        d="M36.75 0h438.5C495.55 0 512 16.82 512 37.03v437.46c0 20.19-16.47 37.03-36.75 37.03H98.28c-2.89 0-5.5-1.17-7.39-3.06L3.06 420.62A10.387 10.387 0 0 1 0 413.24V37.03C0 16.81 16.45 0 36.75 0zM174.5 447.79c-13.75 0-13.75-20.9 0-20.9h153.97c13.74 0 13.74 20.9 0 20.9H174.5zm0-64.38c-13.75 0-13.75-20.9 0-20.9h153.97c13.74 0 13.74 20.9 0 20.9H174.5zm209.51 106.91V350.25c0-16.78-13.87-30.64-30.65-30.64H149.6c-16.78 0-30.64 13.86-30.64 30.64v140.07h265.05zm20.89-140.07v140.37h70.35c8.85 0 15.85-7.37 15.85-16.13V37.03c0-8.78-6.99-16.13-15.85-16.13H404.9v170.17c0 28.31-23.23 51.55-51.54 51.55H149.6c-28.34 0-51.54-23.21-51.54-51.55V20.9H36.75c-8.87 0-15.85 7.34-15.85 16.13v371.88l77.16 77.16V350.25c0-28.32 23.22-51.54 51.54-51.54h203.76c28.22 0 51.54 23.32 51.54 51.54zm-20.89-159.18V20.9H118.96v170.17c0 16.8 13.85 30.65 30.64 30.65h203.76c16.77 0 30.65-13.88 30.65-30.65z"
    />
</svg>
`;
const CloseIcon = `
<svg
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 122.88 122.88"
    style="enable-background:new 0 0 122.88 122.88" xml:space="preserve"
>
    <style type="text/css">.st0{fill-rule:evenodd;clip-rule:evenodd;}</style>
    <g>
        <path
            d="M1.63,97.99l36.55-36.55L1.63,24.89c-2.17-2.17-2.17-5.73,0-7.9L16.99,1.63c2.17-2.17,5.73-2.17,7.9,0 l36.55,36.55L97.99,1.63c2.17-2.17,5.73-2.17,7.9,0l15.36,15.36c2.17,2.17,2.17,5.73,0,7.9L84.7,61.44l36.55,36.55 c2.17,2.17,2.17,5.73,0,7.9l-15.36,15.36c-2.17,2.17-5.73,2.17-7.9,0L61.44,84.7l-36.55,36.55c-2.17,2.17-5.73,2.17-7.9,0 L1.63,105.89C-0.54,103.72-0.54,100.16,1.63,97.99L1.63,97.99z"
        />
    </g>
</svg>
`;
const DownArrowIcon = `
<svg
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 122.88 80.593"
    enable-background="new 0 0 122.88 80.593"
    xml:space="preserve"
>
    <g>
        <polygon points="122.88,0 122.88,30.82 61.44,80.593 0,30.82 0,0 61.44,49.772 122.88,0"/>
    </g>
</svg>
`;
const TestIcon = `
<svg
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 113.24 122.88"
    style="enable-background:new 0 0 113.24 122.88"
    xml:space="preserve"
>
    <g>
        <path
            d="M47.42,7.65l-2.26-4.42L34,9.1l2.16,4.43l2.09-1.09c0.11-0.11,0.23-0.2,0.37-0.27l2.94-1.46L47.42,7.65L47.42,7.65z M42.49,30.17c-3.89,1.08-7.59,2.71-10.97,4.8c-6.53,4.03-11.84,9.8-14.96,16.72c-3.11,6.91-4.03,14.98-1.79,23.66 c1,3.88,2.64,7.9,5,11.99c4.15-3.96,8.88-6.47,13.76-7.7c-2.2-4.11-3.36-8.02-3.65-11.62c-0.32-4.12,0.5-7.84,2.23-11.02 c1.72-3.17,4.34-5.79,7.59-7.73c3.03-1.8,6.63-3.01,10.58-3.5L42.49,30.17L42.49,30.17z M51.6,48.38 c-3.95,0.36-7.53,1.49-10.49,3.24c-2.83,1.68-5.09,3.95-6.58,6.68c-1.48,2.73-2.19,5.94-1.91,9.51c0.27,3.44,1.45,7.22,3.73,11.26 c0.88-0.13,1.75-0.22,2.63-0.28c4.21-0.25,8.4,0.39,12.31,1.83c1.52,0.56,3,1.24,4.42,2.04h38.63c0.76,0,1.37,0.61,1.37,1.37v11.38 c0,0.76-0.61,1.37-1.37,1.37H68.69c1.46,3.21,2.45,6.78,2.83,10.68h27.05v0c0.34,0,0.68,0.12,0.94,0.38l13.23,12.6 c0.31,0.25,0.5,0.63,0.5,1.06c0,0.76-0.61,1.37-1.37,1.37H1.37v-0.01c-0.31,0-0.61-0.1-0.87-0.31c-0.58-0.48-0.67-1.34-0.19-1.92 l10.08-12.29c0.01-3.73,0.74-7.19,2.09-10.4c1.27-3.05,3.09-5.88,5.35-8.53c-2.71-4.55-4.58-9.04-5.7-13.39 c-2.41-9.33-1.41-18.02,1.94-25.46c3.34-7.43,9.03-13.6,16.02-17.92c3.44-2.13,7.21-3.8,11.16-4.96l-0.86-1.71 c-0.02-0.04-0.05-0.08-0.07-0.13c-0.33-0.68-0.04-1.5,0.65-1.83l1.66-0.79l-3.98-7.92l-2.38,1.24c-0.04,0.03-0.09,0.05-0.13,0.07 c-0.68,0.33-1.5,0.05-1.83-0.63l-3.35-6.88l0,0c-0.32-0.66-0.06-1.46,0.59-1.81l13.5-7.1c0.03-0.02,0.05-0.03,0.08-0.05 c0.67-0.34,1.5-0.07,1.84,0.6l3.5,6.86l0,0c0.34,0.67,0.08,1.48-0.59,1.83l-1.8,0.94l4.3,8.19l1.92-0.92l0,0 c0.66-0.32,1.46-0.05,1.8,0.6l16.85,32.19l1.64-0.87c0.67-0.35,1.5-0.1,1.85,0.57l3.76,7.14h0l0.01,0.01 c0.35,0.67,0.08,1.5-0.59,1.84L59.67,69.44l-0.04,0.02c-0.68,0.33-1.5,0.04-1.83-0.64l-3.4-7.02c-0.33-0.66-0.07-1.47,0.59-1.82 l1.9-1.01L51.6,48.38L51.6,48.38z M77.14,57.35l-2.48-4.7l-14.51,7.69l-0.8,0.42l0,0l-0.03,0.02l-0.04,0.02l-1.85,0.98l2.22,4.59 L77.14,57.35L77.14,57.35z M59.31,57.69l0.93-0.49l10.29-5.49l-16.23-31l-8.18,3.9l-1.03,0.51l0,0c-0.07,0.03-0.13,0.06-0.2,0.08 l-1.48,0.71L59.31,57.69L59.31,57.69z M59.67,69.44L59.67,69.44L59.67,69.44L59.67,69.44z M45.1,22.05l0.16-0.08l4.62-2.29 l-4.19-7.98l-3.08,1.53l-1.53,0.8L45.1,22.05L45.1,22.05z M59.79,85.4c0.73,0.58,1.44,1.19,2.12,1.84c2.06,1.96,3.87,4.24,5.36,6.8 h25.69V85.4H59.79L59.79,85.4z M20.66,90.31c-0.04,0.06-0.08,0.12-0.13,0.17l0,0C18.16,93.13,16.27,95.95,15,99 c-1.1,2.64-1.75,5.45-1.86,8.47h55.63c-0.79-7.58-4.08-13.79-8.74-18.24c-2.81-2.68-6.12-4.72-9.68-6.03 c-3.56-1.31-7.38-1.9-11.2-1.67C32.61,81.92,26.05,84.7,20.66,90.31L20.66,90.31z M70.5,110.21c-0.05,0.01-0.11,0.02-0.16,0.02 c-0.11,0.01-0.22,0-0.32-0.02H12.4l-8.14,9.93h104.19l-10.43-9.93H70.5L70.5,110.21z"
        />
    </g>
</svg>
`;
const InfoIcon = `
<svg
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 53.086 122.88"
    enable-background="new 0 0 53.086 122.88"
    xml:space="preserve"
>
    <g>
        <path
            d="M0.438,119.945v-17.962c0-1.62,1.313-2.935,2.934-2.935h3.614c0.106-0.078,0.236-0.199,0.388-0.361 c0.188-0.2,0.327-0.376,0.414-0.526V65.834c-0.092-0.16-0.238-0.349-0.437-0.565c-0.04-0.043-0.078-0.088-0.115-0.133 c-0.094-0.097-0.179-0.173-0.254-0.229H2.935C1.314,64.906,0,63.592,0,61.972V42.865c0-1.62,1.314-2.934,2.935-2.934h35.242 c2.598,0,4.553,1.097,5.868,3.278c1.03,1.708,1.544,4.071,1.544,7.08v47.842c0.083,0.12,0.227,0.283,0.431,0.488 c0.202,0.201,0.367,0.346,0.494,0.43h3.638c1.62,0,2.935,1.314,2.935,2.935v17.962c0,1.62-1.314,2.935-2.935,2.935H3.373 C1.752,122.88,0.438,121.565,0.438,119.945L0.438,119.945z M6.307,104.918v12.093h40.91v-12.093h-0.912 c-0.864,0-1.71-0.233-2.544-0.693c-0.65-0.358-1.278-0.845-1.89-1.457c-0.608-0.607-1.097-1.244-1.461-1.911 c-0.457-0.836-0.689-1.678-0.689-2.523V50.289c0-1.93-0.231-3.284-0.696-4.054c-0.175-0.29-0.457-0.436-0.848-0.436H5.869v13.237 h1.35c0.865,0,1.723,0.245,2.57,0.731c0.581,0.334,1.148,0.789,1.7,1.362c0.06,0.055,0.117,0.112,0.173,0.173 c0.584,0.637,1.039,1.264,1.359,1.878c0.421,0.81,0.637,1.624,0.637,2.441v32.711c0,0.768-0.183,1.526-0.541,2.276 c-0.03,0.072-0.063,0.143-0.1,0.213c-0.325,0.626-0.786,1.251-1.377,1.877c-0.597,0.634-1.215,1.137-1.857,1.502 c-0.835,0.475-1.688,0.717-2.563,0.717H6.307L6.307,104.918z M26.616,33.322c-2.49,0-4.78-0.368-6.874-1.106 c-2.141-0.755-4.043-1.891-5.709-3.41c-0.048-0.043-0.094-0.088-0.138-0.134c-1.639-1.506-2.87-3.251-3.699-5.231 c-0.845-2.019-1.264-4.249-1.264-6.683c0-2.435,0.419-4.68,1.266-6.725c0.857-2.073,2.133-3.891,3.835-5.444l0.044-0.04 c1.646-1.512,3.529-2.649,5.654-3.414C21.839,0.377,24.133,0,26.616,0c2.54,0,4.867,0.373,6.982,1.124 c2.163,0.768,4.077,1.922,5.745,3.466l0.001-0.001c1.701,1.552,2.978,3.371,3.835,5.443c0.846,2.045,1.266,4.291,1.266,6.726 c0,2.434-0.419,4.665-1.265,6.684c-0.853,2.036-2.13,3.825-3.841,5.36l0.005,0.004c-1.665,1.518-3.584,2.653-5.758,3.41 C31.465,32.954,29.143,33.322,26.616,33.322L26.616,33.322z M21.691,26.691c1.442,0.508,3.083,0.762,4.925,0.762 c1.902,0,3.584-0.253,5.045-0.762c1.409-0.49,2.655-1.229,3.74-2.218l0.005,0.005l0.018-0.017c1.047-0.936,1.827-2.026,2.347-3.267 c0.539-1.287,0.806-2.768,0.806-4.437c0-1.694-0.267-3.197-0.807-4.502c-0.518-1.252-1.306-2.366-2.368-3.335l0.001-0.001 l-0.023-0.021c-1.077-1-2.319-1.75-3.729-2.25c-1.469-0.521-3.146-0.78-5.034-0.78c-1.849,0-3.486,0.255-4.914,0.769 c-1.361,0.489-2.578,1.227-3.654,2.215c-0.024,0.023-0.048,0.046-0.073,0.068c-1.062,0.97-1.85,2.083-2.368,3.335 c-0.54,1.305-0.807,2.808-0.807,4.501c0,1.669,0.268,3.149,0.806,4.437c0.498,1.19,1.237,2.242,2.219,3.151 c0.051,0.041,0.101,0.083,0.15,0.128C19.059,25.461,20.297,26.199,21.691,26.691L21.691,26.691z"
        />
    </g>
</svg>
`;
const ScanFormIcon = `
<svg
    xml:space="preserve"
    shape-rendering="geometricPrecision"
    text-rendering="geometricPrecision"
    image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd"
    viewBox="0 0 512 406.8"
 >
    <g>
        <path
            d="M29.27 0l373.81 0c16.11,0 29.27,13.16 29.27,29.27l0 90.8c-2.23,-1.1 -4.49,-2.14 -6.77,-3.13l-2.03 -0.92c-3.56,-1.47 -7.17,-2.82 -10.83,-4.02l0 -30.06 0.14 0 -392.03 0 0 221.61c0,4.5 3.6,8.09 8.09,8.09l193.04 0c0.54,1.42 1.1,2.83 1.69,4.24 1.97,4.78 4.23,9.48 6.73,14.09l-201.11 0c-16.11,0 -29.27,-13.19 -29.27,-29.27l0 -271.43c0,-16.11 13.16,-29.27 29.27,-29.27zm335.71 140.37c31.07,0 60.75,12.29 82.72,34.27 30.33,30.33 41.62,75.06 29.4,116.14 -2.84,9.53 -6.86,18.55 -11.88,26.89l45.3 49.38c2.09,2.27 1.95,5.82 -0.33,7.91l-33.26 30.38c-2.27,2.08 -5.81,1.92 -7.89,-0.35l-43.34 -47.67c-18.35,11.18 -39.23,17.01 -60.72,17.01 -31.07,0 -60.75,-12.3 -82.71,-34.27 -10.76,-10.75 -19.45,-23.64 -25.39,-37.98 -18.13,-43.67 -7.82,-94.22 25.4,-127.44 10.74,-10.76 23.63,-19.45 37.96,-25.39 13.8,-5.73 28.92,-8.88 44.74,-8.88zm66 50.98c-26.64,-26.64 -67.02,-34.65 -101.71,-20.29 -62.25,25.78 -76.57,106.06 -30.31,152.28 26.69,26.62 66.99,34.67 101.72,20.29 34.93,-14.5 57.63,-48.47 57.63,-86.29 0,-12.66 -2.5,-24.74 -7.04,-35.69 -4.74,-11.4 -11.68,-21.69 -20.29,-30.3zm-380.5 -80.99l272.03 0c-5.46,1.59 -10.83,3.48 -16.07,5.65l0.03 0.06c-9.35,3.87 -18.21,8.63 -26.46,14.15 -8.34,5.57 -16.07,11.93 -23.11,18.95l-0.12 0.12c-11.99,12.02 -21.69,25.72 -28.97,40.43l-177.33 0c-3.65,0 -6.65,-2.99 -6.65,-6.65l0 -66.06c0,-3.66 2.99,-6.65 6.65,-6.65zm-6.65 106.26l173.71 0c-1,3.61 -1.87,7.26 -2.6,10.93 -0.31,1.53 -0.59,3.07 -0.85,4.61l-170.26 0 0 -15.54zm0 42.37l168.17 0c0.05,5.17 0.37,10.36 0.95,15.54l-169.12 0 0 -15.54zm331.38 -226.09c7.99,0 14.46,6.47 14.46,14.46 0,7.98 -6.47,14.46 -14.46,14.46 -7.98,0 -14.46,-6.48 -14.46,-14.46 0.04,-7.99 6.51,-14.46 14.46,-14.46zm-97.95 0c7.98,0 14.46,6.47 14.46,14.46 0,7.98 -6.48,14.46 -14.46,14.46 -7.99,0 -14.46,-6.48 -14.46,-14.46 0,-7.99 6.47,-14.46 14.46,-14.46zm48.98 0c7.98,0 14.45,6.47 14.45,14.46 0,7.98 -6.47,14.46 -14.45,14.46 -7.99,0 -14.47,-6.48 -14.47,-14.46 0,-7.99 6.48,-14.46 14.47,-14.46z"
        />
    </g>
</svg>
`;
const ShareIcon = `
<svg
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 122.88 103.44"
    style="enable-background:new 0 0 122.88 103.44"
    xml:space="preserve"
>
    <g>
        <path
            d="M69.49,102.77L49.8,84.04l-20.23,18.27c-0.45,0.49-1.09,0.79-1.8,0.79c-1.35,0-2.44-1.09-2.44-2.44V60.77L0.76,37.41 c-0.98-0.93-1.01-2.47-0.09-3.45c0.31-0.33,0.7-0.55,1.11-0.67l0,0l118-33.2c1.3-0.36,2.64,0.39,3.01,1.69 c0.19,0.66,0.08,1.34-0.24,1.89l-49.2,98.42c-0.6,1.2-2.06,1.69-3.26,1.09C69.86,103.07,69.66,102.93,69.49,102.77L69.49,102.77 L69.49,102.77z M46.26,80.68L30.21,65.42v29.76L46.26,80.68L46.26,80.68z M28.15,56.73l76.32-47.26L7.22,36.83L28.15,56.73 L28.15,56.73z M114.43,9.03L31.79,60.19l38.67,36.78L114.43,9.03L114.43,9.03z"
        />
    </g>
</svg>
`;
const RobotIcon = `
<svg
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 122.88 93.04"
    style="enable-background:new 0 0 122.88 93.04"
    xml:space="preserve"
>
    <g>
        <path
            d="M7.09,43.87h7.11v-1.65c0-2.2,0.44-4.3,1.24-6.22c0.83-1.99,2.04-3.79,3.55-5.29c1.5-1.5,3.3-2.72,5.29-3.55 c1.92-0.8,4.02-1.24,6.22-1.24h28.29l0-0.14V15.65c-0.46-0.17-0.9-0.38-1.32-0.62c-0.59-0.35-1.13-0.77-1.61-1.25 c-0.74-0.74-1.34-1.63-1.75-2.62c-0.39-0.95-0.61-2-0.61-3.08c0-1.09,0.22-2.13,0.61-3.08c0.41-0.99,1.01-1.88,1.75-2.62 c0.74-0.74,1.63-1.34,2.62-1.75c0.95-0.4,2-0.61,3.08-0.61s2.13,0.22,3.08,0.61c0.99,0.41,1.88,1.01,2.62,1.75 c0.74,0.74,1.34,1.63,1.75,2.62c0.39,0.95,0.61,2,0.61,3.08c0,1.09-0.22,2.13-0.61,3.08c-0.41,0.99-1.01,1.88-1.75,2.62l-0.04,0.04 c-0.47,0.46-1,0.87-1.57,1.21c-0.42,0.25-0.86,0.46-1.32,0.62v10.13l0,0.14h28.29c2.2,0,4.3,0.44,6.22,1.24 c2,0.83,3.79,2.04,5.29,3.55c1.5,1.5,2.72,3.3,3.55,5.29c0.8,1.92,1.24,4.02,1.24,6.22v1.65h6.86c0.95,0,1.87,0.19,2.71,0.54 c0.87,0.36,1.65,0.89,2.3,1.54l0.04,0.04c0.64,0.65,1.15,1.41,1.5,2.26c0.35,0.84,0.54,1.75,0.54,2.71v18.92 c0,0.95-0.19,1.87-0.54,2.71c-0.36,0.86-0.89,1.65-1.54,2.3l0,0c-1.28,1.28-3.06,2.08-5.01,2.08h-6.87 c-0.03,2.11-0.47,4.14-1.24,5.99c-0.83,2-2.04,3.79-3.55,5.29c-1.5,1.5-3.3,2.72-5.29,3.55c-1.92,0.8-4.02,1.24-6.22,1.24H30.5 c-2.2,0-4.3-0.44-6.22-1.24c-2-0.83-3.79-2.04-5.29-3.55c-1.5-1.5-2.72-3.3-3.55-5.29c-0.77-1.85-1.21-3.88-1.24-5.99H7.09 c-0.95,0-1.87-0.19-2.71-0.54c-0.87-0.36-1.65-0.89-2.3-1.54l-0.04-0.04c-0.64-0.65-1.15-1.41-1.5-2.26C0.19,71.75,0,70.83,0,69.88 V50.96c0-0.95,0.19-1.87,0.54-2.71c0.36-0.87,0.89-1.65,1.54-2.3l0,0c0.65-0.65,1.43-1.18,2.3-1.54 C5.22,44.06,6.13,43.87,7.09,43.87L7.09,43.87z M47,74.3c-0.14-0.11-0.26-0.23-0.37-0.37c-0.33-0.4-0.5-0.86-0.51-1.33 c-0.01-0.47,0.14-0.94,0.45-1.35c0.11-0.14,0.23-0.27,0.38-0.39c0.52-0.43,1.21-0.66,1.89-0.67c0.68-0.01,1.36,0.19,1.9,0.6 c1.86,1.43,3.7,2.47,5.52,3.16c1.8,0.68,3.58,1,5.34,0.98c1.77-0.02,3.56-0.39,5.39-1.08c1.85-0.7,3.71-1.75,5.6-3.1 c0.56-0.4,1.25-0.58,1.93-0.55c0.68,0.03,1.36,0.27,1.87,0.72c0.13,0.12,0.25,0.25,0.36,0.4c0.3,0.42,0.44,0.9,0.41,1.37 c-0.03,0.47-0.22,0.93-0.56,1.32c-0.12,0.13-0.26,0.26-0.42,0.37c-2.37,1.71-4.75,3.01-7.16,3.9c-2.42,0.89-4.87,1.36-7.35,1.39 c-2.49,0.03-4.95-0.39-7.4-1.28c-2.43-0.88-4.85-2.23-7.23-4.06L47,74.3L47,74.3z M40.77,43.72c0.6,0,1.2,0.06,1.77,0.18 c0.58,0.12,1.15,0.29,1.7,0.52c0.56,0.23,1.09,0.51,1.58,0.84c0.48,0.32,0.93,0.68,1.33,1.08l0.06,0.05 c0.42,0.42,0.8,0.88,1.13,1.38l0.02,0.03c0.32,0.48,0.6,1,0.82,1.55c0.23,0.55,0.4,1.12,0.52,1.7c0.11,0.58,0.18,1.17,0.18,1.77 c0,0.6-0.06,1.2-0.18,1.77c-0.12,0.58-0.29,1.15-0.52,1.71c-0.23,0.56-0.51,1.09-0.84,1.58c-0.34,0.51-0.72,0.97-1.13,1.38 c-0.83,0.83-1.84,1.51-2.97,1.97c-0.55,0.23-1.12,0.4-1.71,0.52c-0.58,0.11-1.17,0.17-1.77,0.17s-1.2-0.06-1.77-0.17 c-0.58-0.12-1.15-0.29-1.71-0.52c-0.56-0.23-1.09-0.51-1.58-0.84c-0.51-0.34-0.97-0.72-1.38-1.13c-0.42-0.42-0.8-0.88-1.13-1.38 l-0.02-0.03c-0.32-0.48-0.6-1-0.82-1.55c-0.23-0.55-0.4-1.12-0.52-1.7c-0.11-0.58-0.17-1.17-0.17-1.77c0-0.6,0.06-1.2,0.17-1.77 c0.12-0.58,0.29-1.15,0.52-1.7c0.23-0.56,0.51-1.09,0.84-1.58c0.34-0.51,0.72-0.97,1.13-1.38c0.42-0.42,0.88-0.8,1.38-1.13 l0.03-0.02c0.48-0.32,1-0.6,1.55-0.82c0.55-0.23,1.12-0.4,1.7-0.52C39.57,43.78,40.17,43.72,40.77,43.72L40.77,43.72z M42.73,48.1 c-0.3-0.12-0.62-0.22-0.95-0.29c-0.32-0.06-0.66-0.1-1.01-0.1c-0.35,0-0.69,0.03-1.01,0.1c-0.34,0.07-0.66,0.16-0.95,0.29 c-0.31,0.13-0.6,0.28-0.88,0.47c-0.27,0.18-0.53,0.4-0.78,0.65c-0.25,0.25-0.46,0.51-0.65,0.78c-0.19,0.28-0.34,0.57-0.47,0.87 c-0.12,0.3-0.22,0.62-0.29,0.95c-0.06,0.32-0.1,0.66-0.1,1.01s0.03,0.69,0.1,1.01c0.07,0.34,0.16,0.66,0.29,0.95 c0.13,0.31,0.28,0.6,0.47,0.87c0.18,0.27,0.4,0.53,0.65,0.78c0.25,0.25,0.51,0.46,0.78,0.65c0.27,0.18,0.57,0.34,0.88,0.47 l0.03,0.02c0.29,0.12,0.59,0.21,0.92,0.27c0.32,0.06,0.66,0.1,1.01,0.1c0.35,0,0.69-0.03,1.01-0.1c0.34-0.07,0.65-0.16,0.95-0.28 c0.31-0.13,0.6-0.29,0.88-0.47c0.27-0.18,0.53-0.4,0.78-0.65c0.25-0.25,0.46-0.51,0.65-0.78c0.19-0.28,0.34-0.57,0.47-0.87 c0.12-0.3,0.22-0.62,0.29-0.95c0.06-0.32,0.1-0.66,0.1-1.01c0-0.35-0.03-0.69-0.1-1.01c-0.07-0.34-0.16-0.66-0.29-0.95 c-0.13-0.31-0.28-0.6-0.47-0.88c-0.19-0.28-0.4-0.54-0.64-0.78l-0.05-0.05c-0.23-0.22-0.47-0.42-0.73-0.59 C43.34,48.38,43.04,48.22,42.73,48.1L42.73,48.1z M82.35,43.72c0.6,0,1.2,0.06,1.77,0.18c0.58,0.12,1.15,0.29,1.7,0.52 c0.56,0.23,1.09,0.51,1.58,0.84c0.47,0.32,0.91,0.67,1.31,1.07c0.02,0.02,0.05,0.04,0.07,0.06c0.42,0.42,0.8,0.88,1.13,1.38 l0.02,0.03c0.32,0.48,0.6,1,0.82,1.55c0.23,0.55,0.4,1.12,0.52,1.7c0.11,0.58,0.17,1.17,0.17,1.77c0,0.6-0.06,1.2-0.17,1.77 c-0.12,0.58-0.29,1.15-0.52,1.71c-0.23,0.56-0.51,1.09-0.84,1.58c-0.34,0.51-0.72,0.97-1.13,1.38c-0.42,0.42-0.88,0.8-1.38,1.13 l-0.03,0.02c-0.49,0.32-1,0.6-1.55,0.82c-0.55,0.23-1.12,0.4-1.71,0.52c-0.58,0.11-1.17,0.17-1.77,0.17c-0.6,0-1.2-0.06-1.77-0.17 c-0.58-0.12-1.15-0.29-1.71-0.52c-0.57-0.24-1.1-0.52-1.58-0.84l-0.05-0.04c-0.48-0.33-0.93-0.69-1.33-1.09 c-0.42-0.42-0.8-0.88-1.13-1.38l-0.02-0.03c-0.32-0.48-0.6-1-0.82-1.55c-0.23-0.55-0.4-1.12-0.52-1.7 c-0.11-0.58-0.18-1.17-0.18-1.77c0-0.6,0.06-1.2,0.18-1.77c0.12-0.58,0.29-1.15,0.52-1.7c0.23-0.56,0.51-1.09,0.84-1.58 c0.34-0.51,0.72-0.97,1.13-1.38c0.41-0.41,0.88-0.79,1.38-1.13c0.49-0.33,1.02-0.61,1.58-0.85c0.55-0.23,1.12-0.4,1.7-0.52 C81.16,43.78,81.75,43.72,82.35,43.72L82.35,43.72z M84.32,48.1c-0.3-0.12-0.62-0.22-0.95-0.29c-0.32-0.06-0.66-0.1-1.01-0.1 c-0.35,0-0.69,0.03-1.01,0.1c-0.34,0.07-0.66,0.16-0.95,0.29c-0.31,0.13-0.6,0.28-0.88,0.47c-0.27,0.18-0.53,0.4-0.78,0.65 c-0.25,0.25-0.46,0.51-0.65,0.78c-0.19,0.28-0.34,0.57-0.47,0.87c-0.12,0.3-0.22,0.62-0.29,0.95c-0.06,0.32-0.1,0.66-0.1,1.01 c0,0.35,0.03,0.69,0.1,1.01c0.07,0.34,0.16,0.66,0.29,0.95c0.13,0.31,0.28,0.6,0.47,0.87c0.18,0.27,0.4,0.53,0.65,0.78 c0.25,0.25,0.51,0.46,0.78,0.65c0.27,0.18,0.57,0.34,0.88,0.47l0.03,0.02c0.29,0.12,0.59,0.21,0.92,0.27 c0.32,0.06,0.66,0.1,1.01,0.1c0.35,0,0.69-0.03,1.01-0.1c0.34-0.07,0.65-0.16,0.95-0.28c0.31-0.13,0.6-0.29,0.88-0.47 c0.28-0.19,0.54-0.4,0.78-0.64v0c0.25-0.25,0.46-0.51,0.65-0.78c0.19-0.28,0.34-0.57,0.47-0.87c0.12-0.3,0.22-0.62,0.29-0.95 c0.06-0.32,0.1-0.66,0.1-1.01c0-0.35-0.03-0.69-0.1-1.01c-0.07-0.34-0.16-0.66-0.29-0.95c-0.13-0.31-0.28-0.6-0.47-0.88 c-0.19-0.28-0.4-0.54-0.64-0.78l-0.05-0.05c-0.23-0.22-0.47-0.42-0.73-0.59C84.92,48.38,84.63,48.22,84.32,48.1L84.32,48.1z M18.19,45.87v30.87c0,1.66,0.33,3.24,0.93,4.69c0.63,1.5,1.54,2.86,2.68,4c1.14,1.14,2.5,2.06,4,2.68 c1.44,0.6,3.03,0.93,4.69,0.93h62.13c1.66,0,3.24-0.33,4.69-0.93c1.5-0.63,2.86-1.54,4-2.68s2.06-2.5,2.68-4 c0.6-1.44,0.93-3.03,0.93-4.69V42.22c0-1.66-0.33-3.25-0.93-4.69c-0.63-1.5-1.54-2.86-2.68-4c-1.14-1.14-2.5-2.06-4-2.68 c-1.44-0.6-3.03-0.93-4.69-0.93H30.5c-1.66,0-3.24,0.33-4.69,0.93c-1.5,0.63-2.86,1.54-4,2.68c-1.14,1.14-2.06,2.5-2.68,4 c-0.6,1.44-0.93,3.03-0.93,4.69V45.87L18.19,45.87z M14.2,47.86H7.09c-0.42,0-0.82,0.08-1.18,0.23c-0.38,0.16-0.72,0.39-1.01,0.68 l-0.04,0.03c-0.27,0.28-0.49,0.61-0.64,0.97c-0.15,0.36-0.23,0.76-0.23,1.18v18.92c0,0.42,0.08,0.82,0.23,1.18 c0.16,0.38,0.39,0.72,0.68,1.01c0.56,0.56,1.33,0.91,2.18,0.91h7.11V47.86L14.2,47.86z M115.79,47.86h-6.86v25.11h6.86 c0.42,0,0.82-0.08,1.18-0.23c0.38-0.16,0.72-0.39,1.01-0.68c0.29-0.29,0.52-0.63,0.68-1.01c0.15-0.36,0.23-0.76,0.23-1.18V50.96 c0-0.42-0.08-0.82-0.23-1.18c-0.16-0.38-0.39-0.72-0.68-1.01l0,0c-0.29-0.29-0.63-0.52-1.01-0.68 C116.61,47.95,116.21,47.86,115.79,47.86L115.79,47.86z"
        />
    </g>
</svg>
`;
const ApplyIcon = `
<svg
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 122.88 122.88"
    enable-background="new 0 0 122.88 122.88" xml:space="preserve"
>
    <g>
        <path
            d="M34.465,67.43c-1.461-1.322-1.574-3.579-0.252-5.041c1.322-1.461,3.58-1.574,5.041-0.252l13.081,11.862l31.088-32.56 c1.361-1.431,3.625-1.487,5.056-0.126c1.431,1.361,1.487,3.624,0.126,5.055L55.11,81.447l-0.005-0.004 c-1.33,1.398-3.541,1.489-4.98,0.187L34.465,67.43L34.465,67.43z M8.792,0h105.296c2.422,0,4.62,0.988,6.212,2.58 s2.58,3.791,2.58,6.212v105.295c0,2.422-0.988,4.62-2.58,6.212s-3.79,2.58-6.212,2.58H8.792c-2.421,0-4.62-0.988-6.212-2.58 S0,116.51,0,114.088V8.792C0,6.371,0.988,4.172,2.58,2.58S6.371,0,8.792,0L8.792,0z M114.088,7.17H8.792 c-0.442,0-0.847,0.184-1.143,0.479C7.354,7.945,7.17,8.35,7.17,8.792v105.295c0,0.442,0.184,0.848,0.479,1.144 c0.296,0.296,0.701,0.479,1.143,0.479h105.296c0.442,0,0.848-0.184,1.144-0.479c0.295-0.296,0.479-0.701,0.479-1.144V8.792 c0-0.443-0.185-0.848-0.479-1.143C114.936,7.354,114.53,7.17,114.088,7.17L114.088,7.17z"
        />
    </g>
</svg>
`;
const ICON_MAP = {
    Export: ExportIcon,
    Import: ImportIcon,
    BookInfo: BookInfoIcon,
    Plus: PlusIcon,
    Trash: TrashIcon,
    Link: LinkIcon,
    Copy: CopyIcon,
    Gear: GearIcon,
    Modify: ModifyIcon,
    Lightbub: LightbubIcon,
    Disk: DiskIcon,
    Close: CloseIcon,
    DownArrow: DownArrowIcon,
    Test: TestIcon,
    Info: InfoIcon,
    ScanForm: ScanFormIcon,
    Share: ShareIcon,
    Robot: RobotIcon,
    Apply: ApplyIcon,
};

;// ./src/utils/icon-replacer.ts

/**
 * Initialize icon replacement for elements with data-icons attributes
 */
function initIconReplacement() {
    // Replace icons immediately for existing elements
    replaceIconsInDocument();
    // Set up observer for dynamically added elements
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    replaceIconsInElement(node);
                }
            });
        });
    });
    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
}
/**
 * Replace icons in the entire document
 */
function replaceIconsInDocument() {
    replaceIconsInElement(document.body);
}
/**
 * Replace icons in a specific element and its children
 */
function replaceIconsInElement(element) {
    // Check if this element has a data-icons attribute
    if (element.hasAttribute('data-icons')) {
        replaceIcon(element);
    }
    // Recursively check child elements
    element.querySelectorAll('[data-icons]').forEach(replaceIcon);
}
/**
 * Replace the content of an element with the corresponding SVG icon
 * Preserves cyber-btn__glitch and cyber-btn__label spans
 */
function replaceIcon(element) {
    const iconName = element.getAttribute('data-icons');
    if (!iconName || !ICON_MAP[iconName]) {
        console.warn(`Icon "${iconName}" not found in ICON_MAP`);
        return;
    }
    // Get existing cyber button elements to preserve
    const glitchSpan = element.querySelector('.cyber-btn__glitch');
    const labelSpan = element.querySelector('.cyber-btn__label');
    // Get direct text content only (not from child elements)
    let textContent = '';
    element.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent?.trim();
            if (text) {
                textContent += text + ' ';
            }
        }
    });
    textContent = textContent.trim();
    // Build new content with SVG + text + preserved spans for regular elements
    let newContent = ICON_MAP[iconName];
    if (textContent) {
        newContent += textContent;
    }
    // Set the new content
    element.innerHTML = newContent;
    // Re-append preserved spans
    if (glitchSpan) {
        element.appendChild(glitchSpan);
    }
    if (labelSpan) {
        element.appendChild(labelSpan);
    }
}

;// ./src/utils/cyber-btn-init.ts
/**
 * Initialize cyber button components
 * This function populates cyber-btn__glitch elements with content from button text and data-icons
 */
/**
 * Initialize all cyber buttons on the page
 * - Moves button's direct text content into cyber-btn__glitch element
 * - Moves data-icons attribute from button to cyber-btn__glitch
 * - Cleans up button's direct text content
 */
function initCyberButtons() {
    const buttons = document.querySelectorAll('.cyber-btn');
    buttons.forEach((button) => {
        const glitchElement = button.querySelector('.cyber-btn__glitch');
        if (!glitchElement) {
            console.warn('cyber-btn missing cyber-btn__glitch element:', button);
            return;
        }
        // Get data-icons from button if exists
        const dataIcons = button.getAttribute('data-icons');
        // Get button's direct text content (not from child elements)
        let buttonText = '';
        button.childNodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent?.trim();
                if (text) {
                    buttonText = text;
                }
            }
        });
        // If button has text content or data-icons, populate glitch element
        // Move data-icons to glitch element
        // if (dataIcons) {
        //     glitchElement.setAttribute('data-icons', dataIcons);
        //     button.removeAttribute('data-icons');
        // }
        // Set text content to glitch element
        if (buttonText) {
            glitchElement.textContent = buttonText;
            // Remove direct text content from button
            // button.childNodes.forEach((node) => {
            //   if (node.nodeType === Node.TEXT_NODE) {
            //     node.textContent = '';
            //   }
            // });
        }
    });
}
/**
 * Initialize a single cyber button element
 * Useful when dynamically creating buttons
 * @param button - The button element to initialize
 */
function initSingleCyberButton(button) {
    const glitchElement = button.querySelector('.cyber-btn__glitch');
    if (!glitchElement) {
        console.warn('cyber-btn missing cyber-btn__glitch element:', button);
        return;
    }
    // Get data-icons from button if exists
    const dataIcons = button.getAttribute('data-icons');
    // Get button's direct text content (not from child elements)
    let buttonText = '';
    button.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent?.trim();
            if (text) {
                buttonText = text;
            }
        }
    });
    // If button has text content or data-icons, populate glitch element
    if (buttonText || dataIcons) {
        // Move data-icons to glitch element
        if (dataIcons) {
            glitchElement.setAttribute('data-icons', dataIcons);
            button.removeAttribute('data-icons');
        }
        // Set text content to glitch element
        if (buttonText) {
            glitchElement.textContent = buttonText;
            // Remove direct text content from button
            button.childNodes.forEach((node) => {
                if (node.nodeType === Node.TEXT_NODE) {
                    node.textContent = '';
                }
            });
        }
    }
}

;// ./src/utils/modal-utils.ts
/* unused harmony import specifier */ var modal_utils_initCyberButtons;
// Common modal utilities for all pages

/**
 * Show a confirmation modal with OK/Cancel buttons
 * @param title - Modal title
 * @param message - Modal message content
 * @returns Promise<boolean> - true if user clicked OK, false if Cancel
 */
function showConfirm(title, message) {
    return new Promise((resolve) => {
        const modalOverlay = document.getElementById('modalOverlay');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        if (!modalOverlay || !modalTitle || !modalBody) {
            // Fallback to native confirm
            resolve(confirm(message));
            return;
        }
        modalTitle.textContent = title;
        modalBody.innerHTML = `
      <p class="modal-message">${message}</p>
      <div class="modal-actions">
          <button id="modalCancelBtn" class="cyber-btn cyber-btn--secondary">Cancel
            <span class="cyber-btn__glitch"></span>
            <span class="cyber-btn__label">[esc]</span>
          </button>
          <button id="modalOkBtn" class="cyber-btn">OK
            <span class="cyber-btn__glitch"></span>
            <span class="cyber-btn__label">[enter]</span>
          </button>
      </div>
    `;
        modalOverlay.style.display = 'flex';
        // Initialize cyber buttons after modal content is rendered
        modal_utils_initCyberButtons();
        let actionHandled = false;
        const handleOk = () => {
            if (actionHandled)
                return;
            actionHandled = true;
            cleanup();
            resolve(true);
        };
        const handleCancel = () => {
            if (actionHandled)
                return;
            actionHandled = true;
            cleanup();
            resolve(false);
        };
        const handleKeyDown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleOk();
            }
            else if (e.key === 'Escape') {
                e.preventDefault();
                handleCancel();
            }
        };
        const cleanup = () => {
            modalOverlay.style.display = 'none';
            document.getElementById('modalOkBtn')?.removeEventListener('click', handleOk);
            document.getElementById('modalCancelBtn')?.removeEventListener('click', handleCancel);
            document.getElementById('modalClose')?.removeEventListener('click', handleCancel);
            window.removeEventListener('keydown', handleKeyDown);
        };
        document.getElementById('modalOkBtn')?.addEventListener('click', handleOk);
        document.getElementById('modalCancelBtn')?.addEventListener('click', handleCancel);
        document.getElementById('modalClose')?.addEventListener('click', handleCancel);
        window.addEventListener('keydown', handleKeyDown);
    });
}
/**
 * Show an informational modal with only an OK button
 * @param title - Modal title
 * @param message - Modal message content
 * @returns Promise<void>
 */
function showMessage(title, message) {
    return new Promise((resolve) => {
        const modalOverlay = document.getElementById('modalOverlay');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        if (!modalOverlay || !modalTitle || !modalBody) {
            // Fallback to native alert
            alert(message);
            resolve();
            return;
        }
        modalTitle.textContent = title;
        modalBody.innerHTML = `
      <p class="modal-message">${message}</p>
      <div class="modal-actions">
          <button id="modalOkBtn" class="cyber-btn">OK
            <span class="cyber-btn__glitch"></span>
            <span class="cyber-btn__label">[enter]</span>
          </button>
      </div>
    `;
        modalOverlay.style.display = 'flex';
        // Initialize cyber buttons after modal content is rendered
        modal_utils_initCyberButtons();
        const handleOk = () => {
            cleanup();
            resolve();
        };
        const handleKeyDown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleOk();
            }
            else if (e.key === 'Escape') {
                e.preventDefault();
                handleOk();
            }
        };
        const cleanup = () => {
            modalOverlay.style.display = 'none';
            document.getElementById('modalOkBtn')?.removeEventListener('click', handleOk);
            document.getElementById('modalClose')?.removeEventListener('click', handleOk);
            window.removeEventListener('keydown', handleKeyDown);
        };
        document.getElementById('modalOkBtn')?.addEventListener('click', handleOk);
        document.getElementById('modalClose')?.addEventListener('click', handleOk);
        window.addEventListener('keydown', handleKeyDown);
    });
}
/**
 * Show a custom modal with custom content (from popup.ts)
 * @param title - Modal title
 * @param bodyContent - Custom HTML content for modal body
 * @param onClose - Optional callback when modal is closed
 */
function showModal(title, bodyContent, onClose) {
    const modalOverlay = document.getElementById('modalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalClose = document.getElementById('modalClose');
    modalTitle.textContent = title;
    modalBody.innerHTML = bodyContent;
    modalOverlay.style.display = 'flex';
    // Initialize cyber buttons after modal content is rendered
    initCyberButtons();
    const closeHandler = () => {
        hideModal();
        if (onClose)
            onClose();
        modalOverlay.removeEventListener('click', overlayClickHandler);
        modalClose.removeEventListener('click', closeHandler);
        window.removeEventListener('keydown', keyHandler);
    };
    // Only allow overlay click to close for notification modals (when onClose is provided)
    const overlayClickHandler = (e) => {
        if (e.target === modalOverlay && onClose) {
            closeHandler();
        }
    };
    modalClose.addEventListener('click', closeHandler);
    modalOverlay.addEventListener('click', overlayClickHandler);
    // Keyboard handling: Enter => primary button, Escape => secondary button
    const keyHandler = (e) => {
        if (e.key === 'Enter') {
            // Trigger primary action (first cyber-btn that is not secondary)
            const primary = modalBody.querySelector('.cyber-btn:not(.cyber-btn--secondary)');
            if (primary) {
                e.preventDefault();
                primary.click();
            }
        }
        else if (e.key === 'Escape') {
            // Trigger secondary action (first cyber-btn--secondary)
            const secondary = modalBody.querySelector('.cyber-btn--secondary');
            if (secondary) {
                e.preventDefault();
                secondary.click();
            }
            else {
                // Fallback to closing modal
                closeHandler();
            }
        }
    };
    window.addEventListener('keydown', keyHandler);
}
/**
 * Hide the modal
 */
function hideModal() {
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) {
        modalOverlay.style.display = 'none';
    }
}
/**
 * Show a toast notification
 * @param message - Toast message content
 * @param type - Toast type ('success', 'error', 'warning', 'info')
 * @param duration - Duration in milliseconds (default: 3000)
 */
function showToast(message, type = 'info', duration = 5000) {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        document.body.appendChild(toastContainer);
    }
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    // Add title
    const titleText = {
        success: 'SUCCESS',
        error: 'ERROR',
        warning: 'WARNING',
        info: 'INFORMATION'
    };
    const title = document.createElement('div');
    title.className = 'toast__title';
    title.textContent = titleText[type];
    toast.appendChild(title);
    // Add close button
    const closeBtn = document.createElement('span');
    closeBtn.className = 'toast__close';
    closeBtn.textContent = '×';
    toast.appendChild(closeBtn);
    // Add message
    const messageEl = document.createElement('div');
    messageEl.className = 'toast__message';
    messageEl.textContent = message;
    toast.appendChild(messageEl);
    toastContainer.appendChild(toast);
    // Animate in
    setTimeout(() => {
        toast.classList.add('toast--show');
    }, 10);
    // Auto remove
    const removeToast = () => {
        toast.classList.remove('toast--show');
        toast.classList.add('toast--hide');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    };
    // Click to dismiss
    toast.addEventListener('click', removeToast);
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeToast();
    });
    // Auto dismiss after duration
    setTimeout(removeToast, duration);
}

;// ./src/utils/guide-overlay.ts
/**
 * Guide Overlay Utility
 * Manages guide overlays with cyberpunk theme
 * Ensures only one overlay is displayed at a time
 */
let currentActiveGuide = null;
/**
 * Initialize guide overlay functionality
 * Sets up event listeners for guide trigger buttons and close buttons
 */
function initGuideOverlays() {
    // Setup trigger buttons
    function setupGuideTriggers(element, e) {
        e.preventDefault();
        e.stopPropagation();
        const guideId = element.getAttribute('data-guide');
        if (guideId) {
            showGuide(guideId);
        }
    }
    const triggerButtons = document.querySelectorAll('.guide-trigger-btn');
    const promptButton = document.getElementById('openPromptsBtn');
    if (promptButton) {
        promptButton.addEventListener('click', (e) => setupGuideTriggers(promptButton, e));
    }
    triggerButtons.forEach(button => {
        button.addEventListener('click', (e) => setupGuideTriggers(button, e));
    });
    // Setup close buttons for all guide overlays
    const guideOverlays = document.querySelectorAll('.guide-overlay');
    guideOverlays.forEach(overlay => {
        const closeBtn = overlay.querySelector('.guide-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                hideGuide(overlay.id);
            });
        }
        // Close on overlay background click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                hideGuide(overlay.id);
            }
        });
    });
    // Setup keyboard shortcut (ESC to close)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && currentActiveGuide) {
            hideGuide(currentActiveGuide);
        }
    });
}
/**
 * Show a specific guide overlay
 * Hides any currently active guide first
 * @param guideId - The ID of the guide overlay to show
 */
function showGuide(guideId) {
    // Hide any currently active guide
    if (currentActiveGuide && currentActiveGuide !== guideId) {
        hideGuide(currentActiveGuide);
    }
    const guideOverlay = document.getElementById(guideId);
    if (!guideOverlay) {
        console.warn(`Guide overlay not found: ${guideId}`);
        return;
    }
    // Show the guide
    guideOverlay.classList.add('active');
    currentActiveGuide = guideId;
    // Prevent body scroll when overlay is open
    document.body.style.overflow = 'hidden';
}
/**
 * Hide a specific guide overlay
 * @param guideId - The ID of the guide overlay to hide
 */
function hideGuide(guideId) {
    const guideOverlay = document.getElementById(guideId);
    if (!guideOverlay) {
        console.warn(`Guide overlay not found: ${guideId}`);
        return;
    }
    // Add closing animation
    guideOverlay.classList.add('closing');
    guideOverlay.classList.remove('active');
    // Remove closing class after animation completes
    setTimeout(() => {
        guideOverlay.classList.remove('closing');
    }, 300); // Match animation duration
    if (currentActiveGuide === guideId) {
        currentActiveGuide = null;
    }
    // Restore body scroll
    document.body.style.overflow = '';
}
/**
 * Hide all active guide overlays
 */
function hideAllGuides() {
    const guideOverlays = document.querySelectorAll('.guide-overlay.active');
    guideOverlays.forEach(overlay => {
        overlay.classList.remove('active');
    });
    currentActiveGuide = null;
    document.body.style.overflow = '';
}
/**
 * Check if any guide is currently active
 * @returns True if a guide is active, false otherwise
 */
function isGuideActive() {
    return currentActiveGuide !== null;
}
/**
 * Get the ID of the currently active guide
 * @returns The ID of the active guide, or null if none is active
 */
function getActiveGuideId() {
    return currentActiveGuide;
}
/**
 * Inject structured guide data (validation rules and data links) into a guide overlay
 * @param guideId - ID of the guide overlay element
 * @param payload - object containing optional `validation` and `dataLinks` arrays
 */
function injectGuideData(guideId, payload) {
    const overlay = document.getElementById(guideId);
    if (!overlay)
        return;
    const body = overlay.querySelector('.guide-body');
    if (!body)
        return;
    // Remove existing injected sections if present
    const existingVal = body.querySelector('.guide-validation-section');
    if (existingVal)
        existingVal.remove();
    const existingLink = body.querySelector('.guide-datalink-section');
    if (existingLink)
        existingLink.remove();
    if (payload.validation && payload.validation.length > 0) {
        const section = document.createElement('div');
        section.className = 'guide-section guide-validation-section';
        const title = document.createElement('h3');
        title.className = 'guide-section-title';
        title.textContent = 'Detected Validation Rules';
        section.appendChild(title);
        payload.validation.forEach(item => {
            const row = document.createElement('div');
            row.className = 'guide-list-item';
            const sel = document.createElement('div');
            sel.className = 'guide-list-key';
            sel.textContent = item.selector;
            row.appendChild(sel);
            const rulesEl = document.createElement('div');
            rulesEl.className = 'guide-list-value';
            // Render rule entries
            const ul = document.createElement('ul');
            for (const [k, v] of Object.entries(item.rules || {})) {
                const li = document.createElement('li');
                li.textContent = `${k}: ${String(v)}`;
                ul.appendChild(li);
            }
            rulesEl.appendChild(ul);
            row.appendChild(rulesEl);
            section.appendChild(row);
        });
        body.appendChild(section);
    }
    if (payload.dataLinks && payload.dataLinks.length > 0) {
        const section = document.createElement('div');
        section.className = 'guide-section guide-datalink-section';
        const title = document.createElement('h3');
        title.className = 'guide-section-title';
        title.textContent = 'Data Links / Saved Values';
        section.appendChild(title);
        payload.dataLinks.forEach(item => {
            const row = document.createElement('div');
            row.className = 'guide-list-item';
            const label = document.createElement('div');
            label.className = 'guide-list-key';
            label.textContent = item.label;
            row.appendChild(label);
            const desc = document.createElement('div');
            desc.className = 'guide-list-value';
            desc.textContent = `${item.selector} → ${item.value}`;
            row.appendChild(desc);
            section.appendChild(row);
        });
        body.appendChild(section);
    }
}

;// ./src/popup/popup-page/startup.ts







// Initialize popup
async function init() {
    try {
        // Initialize theme
        await initTheme();
        // Initialize version
        await initVersion();
        // Initialize cyber buttons
        initCyberButtons();
        // Initialize icon replacement
        initIconReplacement();
        // Initialize guide overlays
        initGuideOverlays();
        // Get current tab URL and title
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tabs[0]?.url) {
            state.currentUrl = tabs[0].url;
            state.currentTabTitle = tabs[0].title || '';
        }
        // Load page data
        await actions.loadPageData();
        // Load settings to check if random string section should be shown
        const settings = await StorageService.getSettings();
        const randomStringSection = document.getElementById('randomStringSection');
        if (randomStringSection && settings?.enableRandomStringSectionInPopup) {
            randomStringSection.style.display = 'block';
            actions.initRandomStringSection(settings);
        }
        // Setup settings button
        document.getElementById('settingsBtn')?.addEventListener('click', () => {
            chrome.tabs.create({ url: chrome.runtime.getURL('./html/settings.html') });
        });
        // Setup string counter button
        document.getElementById('stringCounterBtn')?.addEventListener('click', () => {
            actions.showStringCounterModal();
        });
        // Header actions: show ability text in .app-version on hover/focus
        const headerActions = document.querySelector('.header-actions');
        const appVersionEl = document.querySelector('.app-version');
        if (headerActions && appVersionEl) {
            const originalText = appVersionEl.textContent || '';
            const buttons = Array.from(headerActions.querySelectorAll('button'));
            let hoverCount = 0;
            let hideTimeout = null;
            const HIDE_DELAY = 1000; // ms
            buttons.forEach((btn) => {
                const abilityText = (btn.getAttribute('title') || btn.getAttribute('data-tooltip') || btn.textContent || '')
                    + '  ➤ ';
                const show = () => {
                    // Cancel any pending hide
                    if (hideTimeout !== null) {
                        clearTimeout(hideTimeout);
                        hideTimeout = null;
                    }
                    hoverCount++;
                    appVersionEl.textContent = String(abilityText || originalText);
                    appVersionEl.classList.add('highlighted');
                };
                const hide = () => {
                    hoverCount = Math.max(0, hoverCount - 1);
                    // Delay restoring to avoid flicker when moving between buttons
                    if (hoverCount === 0) {
                        hideTimeout = window.setTimeout(() => {
                            appVersionEl.textContent = originalText;
                            appVersionEl.classList.remove('highlighted');
                            hideTimeout = null;
                        }, HIDE_DELAY);
                    }
                };
                btn.addEventListener('mouseenter', show);
                btn.addEventListener('mouseleave', hide);
                btn.addEventListener('focus', show);
                btn.addEventListener('blur', hide);
            });
        }
    }
    catch (error) {
        console.error('Failed to initialize popup:', error);
        // Show error in UI
        document.body.innerHTML = `
      <div style="padding: 20px; color: #ff4466;">
        <h3>Error loading popup</h3>
        <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
        <pre style="font-size: 10px; overflow: auto;">${error instanceof Error ? error.stack : ''}</pre>
      </div>
    `;
    }
}
// Format date to: Jan 01, 25 HH:mm:ss
function startup_formatDate(dateString) {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = String(date.getDate()).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${month} ${day}, ${year} ${hours}:${minutes}:${seconds}`;
}
// Show notification modal (replaces alert)
function showNotification(message, onClose) {
    const bodyContent = `
    <div style="padding: 20px; text-align: center;">
      <p style="margin: 0; color: var(--text-primary); font-size: 14px; line-height: 1.5;">${message}</p>
      <div class="form-actions" style="justify-content: center; margin-top: 20px;">
        <button class="cyber-btn" id="okButton">OK
          <span class="cyber-btn__glitch"></span>
          <span class="cyber-btn__label">[enter]</span>
        </button>
      </div>
    </div>
  `;
    showModal('Notification', bodyContent, onClose);
    setTimeout(() => {
        document.getElementById('okButton')?.addEventListener('click', () => {
            hideModal();
            onClose?.();
        });
    }, 0);
}
// Show confirmation modal (replaces confirm)
function showConfirmation(message, onConfirm, onCancel) {
    const bodyContent = `
    <div style="padding: 20px; text-align: center;">
      <p style="margin: 0; color: var(--text-primary); font-size: 14px; line-height: 1.5;">${message}</p>
    </div>
    <div class="form-actions" style="margin-top: 20px; justify-content: center; gap: 12px;">
      <button id="confirmNoBtn" class="cyber-btn cyber-btn--secondary">No
        <span class="cyber-btn__glitch"></span>
        <span class="cyber-btn__label">no</span>
      </button>
      <button id="confirmYesBtn" class="cyber-btn">Yes
        <span class="cyber-btn__glitch"></span>
        <span class="cyber-btn__label">yes</span>
      </button>
    </div>
  `;
    showModal('Confirmation', bodyContent, onCancel);
    setTimeout(() => {
        let actionHandled = false;
        document.getElementById('confirmYesBtn')?.addEventListener('click', () => {
            if (actionHandled)
                return;
            actionHandled = true;
            hideModal();
            onConfirm();
        });
        document.getElementById('confirmNoBtn')?.addEventListener('click', () => {
            if (actionHandled)
                return;
            actionHandled = true;
            hideModal();
            if (onCancel)
                onCancel();
        });
    }, 0);
}
// Load settings
async function loadSettings() {
    const settings = await StorageService.getSettings();
    const enableSaveValueCheckbox = document.getElementById('enableSaveValue');
    const enableImportValueCheckbox = document.getElementById('enableImportValue');
    const enableLiveAssistantCheckbox = document.getElementById('enableLiveAssistant');
    if (settings && enableSaveValueCheckbox) {
        enableSaveValueCheckbox.checked = settings.enableSaveValue;
    }
    if (settings && enableImportValueCheckbox) {
        enableImportValueCheckbox.checked = settings.enableImportValue;
    }
    if (settings && enableLiveAssistantCheckbox) {
        enableLiveAssistantCheckbox.checked = settings.enableLiveAssistant;
    }
    // Update dependent toggles state
    actions.updateDependentToggles();
    if (enableSaveValueCheckbox) {
        enableSaveValueCheckbox.addEventListener('change', async () => {
            const currentSettings = await StorageService.getSettings();
            if (!currentSettings)
                return;
            await StorageService.setSettings({
                ...currentSettings,
                enableSaveValue: enableSaveValueCheckbox.checked
            });
        });
    }
    if (enableImportValueCheckbox) {
        enableImportValueCheckbox.addEventListener('change', async () => {
            const currentSettings = await StorageService.getSettings();
            if (!currentSettings)
                return;
            await StorageService.setSettings({
                ...currentSettings,
                enableImportValue: enableImportValueCheckbox.checked
            });
        });
    }
    if (enableLiveAssistantCheckbox) {
        enableLiveAssistantCheckbox.addEventListener('change', async () => {
            const currentSettings = await StorageService.getSettings();
            if (!currentSettings)
                return;
            await StorageService.setSettings({
                ...currentSettings,
                enableLiveAssistant: enableLiveAssistantCheckbox.checked
            });
            actions.updateDependentToggles();
        });
    }
}
// Update dependent toggles based on enableLiveAssistant state
function updateDependentToggles() {
    const enableLiveAssistantCheckbox = document.getElementById('enableLiveAssistant');
    const enableSaveValueCheckbox = document.getElementById('enableSaveValue');
    const enableImportValueCheckbox = document.getElementById('enableImportValue');
    const isLiveAssistantEnabled = enableLiveAssistantCheckbox?.checked ?? false;
    // Disable save/import toggles when live assistant is OFF
    if (enableSaveValueCheckbox) {
        enableSaveValueCheckbox.disabled = !isLiveAssistantEnabled;
        enableSaveValueCheckbox.parentElement?.classList.toggle('disabled', !isLiveAssistantEnabled);
    }
    if (enableImportValueCheckbox) {
        enableImportValueCheckbox.disabled = !isLiveAssistantEnabled;
        enableImportValueCheckbox.parentElement?.classList.toggle('disabled', !isLiveAssistantEnabled);
    }
}

;// ./src/utils/export-format.ts


const INCLUDED_KEYS = [
    'settings',
    'pages',
    'presets',
    'presetPageLinks',
    'savedValues',
];
function isRecord(value) {
    return typeof value === 'object' && value !== null;
}
function isString(value) {
    return typeof value === 'string';
}
function isBoolean(value) {
    return typeof value === 'boolean';
}
function isArray(value) {
    return Array.isArray(value);
}
function createEmptyRootData() {
    return {
        pages: [],
        presets: [],
        presetPageLinks: [],
        savedValues: [],
        regexPatterns: [],
        lengthConfigurations: []
    };
}
function createDefaultSettings() {
    return {
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
    };
}
function normalizeIncluded(partial) {
    return {
        settings: partial?.settings ?? false,
        pages: partial?.pages ?? false,
        presets: partial?.presets ?? false,
        presetPageLinks: partial?.presetPageLinks ?? false,
        savedValues: partial?.savedValues ?? false,
        regexPatterns: partial?.regexPatterns ?? false,
        lengthConfigurations: partial?.lengthConfigurations ?? false
    };
}
function createExportFile(params) {
    const settings = params.settings ?? createDefaultSettings();
    const emptyData = createEmptyRootData();
    return {
        schema: EXPORT_SCHEMA,
        exportedAt: params.exportedAt ?? getCurrentTimestamp(),
        included: normalizeIncluded(params.included),
        settings,
        data: {
            pages: params.data?.pages ?? emptyData.pages,
            presets: params.data?.presets ?? emptyData.presets,
            presetPageLinks: params.data?.presetPageLinks ?? emptyData.presetPageLinks,
            savedValues: params.data?.savedValues ?? emptyData.savedValues,
            regexPatterns: params.data?.regexPatterns ?? emptyData.regexPatterns,
            lengthConfigurations: params.data?.lengthConfigurations ?? emptyData.lengthConfigurations
        },
    };
}
function isExtensionExportFile(value) {
    if (!isRecord(value))
        return false;
    if (value.schema !== EXPORT_SCHEMA)
        return false;
    if (!isString(value.exportedAt))
        return false;
    if (!isRecord(value.included))
        return false;
    for (const key of INCLUDED_KEYS) {
        if (!isBoolean(value.included[key]))
            return false;
    }
    if (!isRecord(value.settings))
        return false;
    if (!isBoolean(value.settings.enableSaveValue))
        return false;
    if (!isBoolean(value.settings.enableImportValue))
        return false;
    if (!isBoolean(value.settings.enableLiveAssistant))
        return false;
    if (!isString(value.settings.theme))
        return false;
    if (!isRecord(value.data))
        return false;
    if (!isArray(value.data.pages))
        return false;
    if (!isArray(value.data.presets))
        return false;
    if (!isArray(value.data.presetPageLinks))
        return false;
    if (!isArray(value.data.savedValues))
        return false;
    return true;
}
function parseExtensionExportJson(text) {
    const parsed = JSON.parse(text);
    if (!isExtensionExportFile(parsed)) {
        throw new Error('Invalid import file format (expected form-filler.export.v1)');
    }
    return parsed;
}

;// ./src/popup/popup-page/page-data.ts




// Load page data
async function loadPageData() {
    state.currentPageData = await StorageService.getCurrentPageData(state.currentUrl);
    const pageSection = document.getElementById('pageSection');
    const noPageContent = document.getElementById('noPageContent');
    const hasPageContent = document.getElementById('hasPageContent');
    const mainContent = document.getElementById('mainContent');
    if (!state.currentPageData) {
        pageSection.querySelector('.section-title')?.setAttribute('style', 'display: none;');
        noPageContent.style.display = 'block';
        hasPageContent.style.display = 'none';
        mainContent.innerHTML = '';
        mainContent.style.display = 'none';
        actions.setupNoPageActions();
    }
    else {
        pageSection.querySelector('.section-title')?.setAttribute('style', 'display: block;');
        noPageContent.style.display = 'none';
        hasPageContent.style.display = 'block';
        mainContent.style.display = 'block';
        // Update page info display
        actions.updatePageInfoDisplay();
        // Show page management (presets)
        actions.showPageManagement(mainContent);
    }
}
// Setup actions for when no page data exists
function setupNoPageActions() {
    // Create New Profile button
    document.getElementById('createNewPageBtn')?.addEventListener('click', () => {
        actions.showCreatePageModal();
    });
    // Clone from Existing button
    document.getElementById('cloneFromExistingBtn')?.addEventListener('click', () => {
        actions.showClonePageModal();
    });
    // Import Page Profile button
    document.getElementById('importPageProfileBtn')?.addEventListener('click', () => {
        const importInput = document.getElementById('importPageFile');
        importInput.click();
    });
    // Setup import file handler
    const importInput = document.getElementById('importPageFile');
    importInput.addEventListener('change', actions.handleImportFile);
}
// Update page info display
function updatePageInfoDisplay() {
    if (!state.currentPageData)
        return;
    const pageTitleEl = document.getElementById('pageTitle');
    const pageUrlEl = document.getElementById('pageUrl');
    const urlIdentifyEl = document.getElementById('urlIdentify');
    const pageDescEl = document.getElementById('pageDescription');
    if (pageTitleEl)
        pageTitleEl.textContent = state.currentPageData.pageTitle;
    if (pageUrlEl)
        pageUrlEl.textContent = state.currentPageData.url;
    if (urlIdentifyEl)
        urlIdentifyEl.textContent = state.currentPageData.matchIdentify === 'exactMatch' ? 'exact match' : 'prefix match';
    if (pageDescEl)
        pageDescEl.textContent = state.currentPageData.description || '-';
    // Setup page action buttons
    actions.setupPageActionButtons();
}
// Setup page action buttons
function setupPageActionButtons() {
    document.getElementById('editPageBtn')?.addEventListener('click', () => {
        if (!state.currentPageData)
            return;
        // Open page-profile-editor directly
        window.open(`page-profile-editor.html?pageId=${encodeURIComponent(state.currentPageData.id)}`, '_blank');
    });
    // Scan form data functionality is now in preset section as scanFormDataBtnPreset
    document.getElementById('exportPageBtn')?.addEventListener('click', async () => {
        if (!state.currentPageData)
            return;
        const data = await StorageService.getData();
        if (!data)
            return;
        // Get presets for this page
        const presets = await StorageService.getPresetsForPage(state.currentPageData.id);
        // Get saved values for this page
        const savedValues = data.savedValues.filter(sv => sv.pageId === state.currentPageData.id);
        const presetIds = new Set(presets.map(p => p.id));
        const presetPageLinks = data.presetPageLinks.filter(l => l.pageId === state.currentPageData.id && presetIds.has(l.presetId));
        const exportFile = createExportFile({
            included: {
                pages: true,
                presets: true,
                presetPageLinks: true,
                savedValues: true,
            },
            data: {
                pages: [state.currentPageData],
                presets,
                presetPageLinks,
                savedValues,
            },
        });
        downloadFile(JSON.stringify(exportFile, null, 2), `form-filler-${state.currentPageData.pageTitle.replace(/[^a-z0-9]/gi, '_')}.json`);
        try {
            const fileName = `form-filler-${state.currentPageData.pageTitle.replace(/[^a-z0-9]/gi, '_')}.json`;
            actions.showNotification(`Exported page data to ${fileName}`);
        }
        catch (error) {
            console.error('Failed to show export notification:', error);
        }
    });
}

;// ./src/popup/popup-page/page-modals.ts







// Handle import file
async function handleImportFile(event) {
    const input = event.target;
    if (!input.files || input.files.length === 0)
        return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const content = e.target?.result;
            const importedData = parseExtensionExportJson(content);
            const data = await StorageService.getData();
            if (!data)
                return;
            const duplicates = [];
            let pageSkipped = false;
            let presetsSkipped = 0;
            let savedValuesSkipped = 0;
            if (!importedData.included.pages || importedData.data.pages.length === 0) {
                actions.showNotification('Failed to import: pages section not included in file.');
                return;
            }
            const pageData = importedData.data.pages[0];
            // Check if page already exists (by currentUrl + matchIdentify)
            const existingPage = data.pages.find(p => p.url === state.currentUrl && p.matchIdentify === (pageData.matchIdentify ?? 'prefixMatch'));
            let targetPageId;
            if (existingPage) {
                duplicates.push(`Page: ${pageData.pageTitle}`);
                targetPageId = existingPage.id;
                pageSkipped = true;
            }
            else {
                // Import the page data
                const newPage = await StorageService.addPage({
                    pageTitle: pageData.pageTitle || 'Imported Page',
                    url: state.currentUrl,
                    description: pageData.description || '',
                    owner: pageData.owner || '',
                    matchIdentify: pageData.matchIdentify ?? 'prefixMatch'
                });
                targetPageId = newPage.id;
            }
            // Import presets
            if (importedData.included.presets && Array.isArray(importedData.data.presets)) {
                for (const preset of importedData.data.presets) {
                    const existingPreset = data.presets.find(p => (preset.id && p.id === preset.id) || p.name === preset.name);
                    if (existingPreset) {
                        duplicates.push(`Preset: ${preset.name}`);
                        presetsSkipped++;
                        // Link existing preset to page if not already linked
                        const linkExists = data.presetPageLinks.some(l => l.presetId === existingPreset.id && l.pageId === targetPageId);
                        if (!linkExists) {
                            await StorageService.linkPresetToPage(existingPreset.id, targetPageId);
                        }
                    }
                    else {
                        const newPreset = await StorageService.addPreset({
                            name: preset.name || 'Imported Preset',
                            description: preset.description || '',
                            formData: preset.formData || []
                        });
                        await StorageService.linkPresetToPage(newPreset.id, targetPageId);
                    }
                }
            }
            // Import saved values
            if (importedData.included.savedValues && Array.isArray(importedData.data.savedValues)) {
                const refreshedData = await StorageService.getData();
                if (refreshedData) {
                    for (const savedValue of importedData.data.savedValues) {
                        const existingSavedValue = refreshedData.savedValues.find(sv => sv.pageId === targetPageId
                            && sv.testId === savedValue.testId
                            && sv.querySelector === savedValue.querySelector);
                        if (existingSavedValue) {
                            duplicates.push(`Saved Value: ${savedValue.label}`);
                            savedValuesSkipped++;
                        }
                        else {
                            refreshedData.savedValues.push({
                                ...savedValue,
                                id: generateGuid(),
                                pageId: targetPageId,
                                createdAt: getCurrentTimestamp(),
                                updatedAt: getCurrentTimestamp()
                            });
                        }
                    }
                    await StorageService.setData(refreshedData);
                }
            }
            let message = 'Page profile imported successfully!';
            if (duplicates.length > 0) {
                message += `<br><br>Duplicates skipped (${duplicates.length}):<br>` + duplicates.slice(0, 10).join('<br>');
                if (duplicates.length > 10) {
                    message += `<br>... and ${duplicates.length - 10} more`;
                }
            }
            actions.showNotification(message, async () => {
                await actions.loadPageData();
            });
        }
        catch (error) {
            console.error('Import error:', error);
            actions.showNotification('Failed to import page profile. Please check the file format.');
        }
    };
    reader.readAsText(file);
    input.value = ''; // Reset input
}
// Show create page modal
function showCreatePageModal() {
    const bodyContent = `
    <div class="form-group">
      <label for="newPageTitle">Page Title *</label>
      <input type="text" id="newPageTitle" value="${state.currentTabTitle}" required />
    </div>
    <div class="form-group">
      <label for="newPageUrl">URL *</label>
      <input type="text" id="newPageUrl" value="${state.currentUrl}" required />
    </div>
    <div class="form-group">
      <label for="newMatchIdentify">URL Match Type</label>
      <select id="newMatchIdentify" class="match-select">
      <option value="prefixMatch" selected>Prefix Match</option>
      <option value="exactMatch">Exact Match</option>
      </select>
    </div>
    <div class="form-group">
      <label for="newPageDescription">Description</label>
      <textarea id="newPageDescription" rows="3" placeholder="Optional description"></textarea>
    </div>
    <div class="form-group">
      <label for="newPageOwner">Owner</label>
      <input type="text" id="newPageOwner" placeholder="Optional owner name" />
    </div>
    <div class="form-actions">
      <button id="cancelNewPageBtn" class="cyber-btn cyber-btn--secondary">Cancel
        <span class="cyber-btn__glitch"></span>
        <span class="cyber-btn__label">[esc]</span>
      </button>
      <button id="saveNewPageBtn" class="cyber-btn">Create Profile
        <span class="cyber-btn__glitch"></span>
        <span class="cyber-btn__label">[enter]</span>
      </button>
    </div>
  `;
    showModal('Create New Page Profile', bodyContent);
    document.getElementById('saveNewPageBtn')?.addEventListener('click', async () => {
        const pageTitle = document.getElementById('newPageTitle').value;
        const pageUrl = document.getElementById('newPageUrl').value;
        const pageDescription = document.getElementById('newPageDescription').value;
        const pageOwner = document.getElementById('newPageOwner').value;
        const matchIdentify = document.getElementById('newMatchIdentify').value;
        if (!pageTitle || !pageUrl) {
            actions.showNotification('Page title and URL are required');
            return;
        }
        await StorageService.addPage({
            pageTitle,
            url: pageUrl,
            description: pageDescription,
            owner: pageOwner,
            matchIdentify
        });
        hideModal();
        await actions.loadPageData();
    });
    document.getElementById('cancelNewPageBtn')?.addEventListener('click', () => {
        hideModal();
    });
}
// Show clone page modal
async function showClonePageModal() {
    const data = await StorageService.getData();
    const pages = data?.pages || [];
    if (pages.length === 0) {
        actions.showNotification('No existing pages to clone from. Please create a new page first.');
        return;
    }
    const bodyContent = `
    <div class="form-group">
      <label for="sourcePageSelect">Select source page to clone:</label>
      <select id="sourcePageSelect">
        <option value="">-- Select a page --</option>
        ${pages.map(page => `<option value="${page.id}">${page.pageTitle} (${page.url})</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label for="clonePageTitle">New Page Title *</label>
      <input type="text" id="clonePageTitle" placeholder="Enter a name for this page" value="${state.currentTabTitle}" required />
    </div>
    <div class="form-group">
      <label for="clonePageUrl">URL *</label>
      <input type="text" id="clonePageUrl" value="${state.currentUrl}" required />
    </div>
    <div class="form-group">
      <label for="cloneMatchIdentify">URL Match Type</label>
      <select id="cloneMatchIdentify" class="match-select">
        <option value="prefixMatch" selected>Prefix Match</option>
        <option value="exactMatch">Exact Match</option>
      </select>
    </div>
    <div class="form-group">
      <label for="clonePageDescription">Description</label>
      <textarea id="clonePageDescription" rows="3" placeholder="Optional description"></textarea>
    </div>
    <div class="form-group">
      <label for="clonePageOwner">Owner</label>
      <input type="text" id="clonePageOwner" placeholder="Optional owner name" />
    </div>
    <div class="form-actions">
      <button id="cancelCloneBtn" class="cyber-btn cyber-btn--secondary">Cancel
        <span class="cyber-btn__glitch"></span>
        <span class="cyber-btn__label">[esc]</span>
      </button>
      <button id="confirmCloneBtn" class="cyber-btn">Clone Profile
        <span class="cyber-btn__glitch"></span>
        <span class="cyber-btn__label">[enter]</span>
      </button>
    </div>
  `;
    showModal('Clone from Existing Page', bodyContent);
    document.getElementById('confirmCloneBtn')?.addEventListener('click', async () => {
        const sourcePageId = document.getElementById('sourcePageSelect').value;
        const newTitle = document.getElementById('clonePageTitle').value;
        const newUrl = document.getElementById('clonePageUrl').value;
        const newDescription = document.getElementById('clonePageDescription').value;
        const newOwner = document.getElementById('clonePageOwner').value;
        const matchIdentify = document.getElementById('cloneMatchIdentify').value;
        if (!sourcePageId) {
            actions.showNotification('Please select a source page');
            return;
        }
        if (!newTitle || !newUrl) {
            actions.showNotification('Page title and URL are required');
            return;
        }
        const sourcePage = pages.find(p => p.id === sourcePageId);
        if (!sourcePage) {
            actions.showNotification('Source page not found');
            return;
        }
        // Create new page with new settings
        const newPage = await StorageService.addPage({
            pageTitle: newTitle,
            url: newUrl,
            description: newDescription || sourcePage.description || '',
            owner: newOwner || sourcePage.owner || '',
            matchIdentify: matchIdentify
        });
        // Clone presets if any
        const sourcePresets = await StorageService.getPresetsForPage(sourcePage.id);
        if (sourcePresets && sourcePresets.length > 0) {
            for (const preset of sourcePresets) {
                // Create new preset and link to new page
                const newPreset = await StorageService.addPreset({
                    name: preset.name,
                    description: preset.description || '',
                    formData: preset.formData || []
                });
                await StorageService.linkPresetToPage(newPreset.id, newPage.id);
            }
        }
        hideModal();
        actions.showNotification('Page profile cloned successfully!', async () => {
            await actions.loadPageData();
        });
    });
    document.getElementById('cancelCloneBtn')?.addEventListener('click', () => {
        hideModal();
    });
}
// Show page management
async function showPageManagement(container) {
    // Check if there are unlinked presets available
    const unlinkedPresets = await StorageService.getUnlinkedPresets(state.currentPageData?.id || '');
    const hasUnlinkedPresets = unlinkedPresets.length > 0;
    container.innerHTML = `
    ${state.currentPageData ? `
    <div class="presets-section">
    <div class="section-header">
        <h3>
        Presets
        </h3>
        <div class="section-header-actions">
          <button id="scanFormDataBtnPreset" class="cyber-btn cyber-btn--small" title="Scan form fields on current page" data-icons="ScanForm">Scan Page
            <span class="cyber-btn__glitch"></span>
            <span class="cyber-btn__label">scan</span>
          </button>
          <button id="createPresetBtn" class="cyber-btn cyber-btn--small" data-icons="Plus">Create Preset
            <span class="cyber-btn__glitch"></span>
            <span class="cyber-btn__label">new</span>
          </button>
          ${hasUnlinkedPresets ? `<button id="linkPresetBtn" class="cyber-btn cyber-btn--secondary cyber-btn--small" title="Link this page with exists preset from other page">Link Preset
            <span class="cyber-btn__glitch"></span>
            <span class="cyber-btn__label">link</span>
          </button>` : ''}
          <button id="exportPresetsBtn" class="cyber-btn cyber-btn--secondary cyber-btn--small">Export Presets
            <span class="cyber-btn__glitch"></span>
            <span class="cyber-btn__label">json</span>
          </button>
          <button id="importPresetsBtn" class="cyber-btn cyber-btn--secondary cyber-btn--small">Import Presets
            <span class="cyber-btn__glitch"></span>
            <span class="cyber-btn__label">load</span>
          </button>
          <button class="guide-trigger-btn" data-guide="presets-guide" title="Show guide for Presets" data-icons="Info"></button>
        </div>
      </div>
      <div class="table-container compact-presets">
        <table class="presets-table">
          <thead>
            <tr>
              <th class="sortable" data-sort="rank">#</th>
              <th class="sortable" data-sort="name">Preset Name</th>
              <th class="sortable" data-sort="description">Description</th>
              <th class="sortable" data-sort="updated">Last Modified</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="presetsBody">
            <!-- Presets will be loaded here -->
          </tbody>
        </table>
      </div>
    </div>
    <input type="file" id="importPresetsFile" accept=".json" style="display: none;" />
    ` : ''}
  `;
    // Re-initialize guide overlays for dynamically added buttons
    initGuideOverlays();
    // Initialize cyber buttons after content is rendered
    initCyberButtons();
    if (state.currentPageData) {
        actions.loadPresets();
        document.getElementById('createPresetBtn')?.addEventListener('click', () => {
            actions.openPresetEditor();
        });
        document.getElementById('linkPresetBtn')?.addEventListener('click', () => {
            actions.showLinkPresetModal();
        });
        document.getElementById('exportPresetsBtn')?.addEventListener('click', async () => {
            await actions.showExportPresetsModal();
        });
        document.getElementById('importPresetsBtn')?.addEventListener('click', () => {
            const fileInput = document.getElementById('importPresetsFile');
            fileInput.click();
        });
        document.getElementById('importPresetsFile')?.addEventListener('change', async (e) => {
            const input = e.target;
            if (input.files && input.files[0]) {
                await actions.importPresetsData(input.files[0]);
                input.value = ''; // Reset input
            }
        });
        // Scan form data button in preset section
        document.getElementById('scanFormDataBtnPreset')?.addEventListener('click', async () => {
            await actions.scanFormData();
        });
        // Add sort listeners
        document.querySelectorAll('.sortable').forEach(header => {
            header.addEventListener('click', (e) => {
                const column = e.target.getAttribute('data-sort');
                if (column) {
                    actions.sortPresets(column);
                }
            });
        });
    }
}

;// ./src/popup/popup-page/preset-table.ts


// Sort presets
async function sortPresets(column) {
    if (!state.currentPageData)
        return;
    // Get presets for this page
    const presets = await StorageService.getPresetsForPage(state.currentPageData.id);
    // Toggle direction if same column, otherwise default to ascending
    if (state.sortColumn === column) {
        state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
    }
    else {
        state.sortColumn = column;
        state.sortDirection = 'asc';
    }
    // Sort presets
    const sortedPresets = [...presets];
    sortedPresets.sort((a, b) => {
        let compareA;
        let compareB;
        switch (column) {
            case 'rank':
                // Use original index for rank (presets array order)
                compareA = presets.indexOf(a);
                compareB = presets.indexOf(b);
                break;
            case 'name':
                compareA = a.name.toLowerCase();
                compareB = b.name.toLowerCase();
                break;
            case 'description':
                compareA = (a.description || '').toLowerCase();
                compareB = (b.description || '').toLowerCase();
                break;
            case 'updated':
                compareA = new Date(a.updatedAt).getTime();
                compareB = new Date(b.updatedAt).getTime();
                break;
        }
        if (compareA < compareB)
            return state.sortDirection === 'asc' ? -1 : 1;
        if (compareA > compareB)
            return state.sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
    // Update display
    actions.renderPresetTable(sortedPresets);
    actions.updateSortIndicators();
}
// Update sort indicators
function updateSortIndicators() {
    document.querySelectorAll('.sortable').forEach(header => {
        const column = header.getAttribute('data-sort');
        header.classList.remove('sort-asc', 'sort-desc');
        if (column === state.sortColumn) {
            header.classList.add(state.sortDirection === 'asc' ? 'sort-asc' : 'sort-desc');
        }
    });
}
// Load presets into table
async function loadPresets() {
    if (!state.currentPageData)
        return;
    const tbody = document.getElementById('presetsBody');
    tbody.innerHTML = '';
    // Get presets for this page
    const presets = await StorageService.getPresetsForPage(state.currentPageData.id);
    if (presets.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="no-data">No presets found. Create your first preset!</td></tr>';
        return;
    }
    actions.renderPresetTable(presets);
}
// Render preset table
function renderPresetTable(presets) {
    const tbody = document.getElementById('presetsBody');
    tbody.innerHTML = '';
    const appendCell = (row, text) => {
        const cell = document.createElement('td');
        cell.textContent = text;
        row.appendChild(cell);
    };
    const appendActionButton = (actionsCell, opts) => {
        const button = document.createElement('button');
        button.className = opts.className;
        button.dataset.id = opts.presetId;
        if (opts.action) {
            button.dataset.action = opts.action;
        }
        if (opts.icon) {
            button.dataset.icons = opts.icon;
        }
        if (opts.label) {
            button.textContent = opts.label;
        }
        actionsCell.appendChild(button);
        return button;
    };
    presets.forEach((preset, index) => {
        const row = document.createElement('tr');
        appendCell(row, String(index + 1));
        appendCell(row, preset.name);
        appendCell(row, preset.description || '');
        appendCell(row, actions.formatDate(preset.updatedAt));
        const actionsCell = document.createElement('td');
        actionsCell.className = 'actions';
        appendActionButton(actionsCell, {
            className: 'action-btn action-btn--apply',
            label: 'Apply',
            presetId: preset.id,
        });
        appendActionButton(actionsCell, {
            className: 'action-btn action-btn--edit',
            action: 'edit',
            icon: 'Modify',
            presetId: preset.id,
        });
        appendActionButton(actionsCell, {
            className: 'action-btn action-btn--delete',
            action: 'delete',
            icon: 'Trash',
            presetId: preset.id,
        });
        row.appendChild(actionsCell);
        tbody.appendChild(row);
    });
    // Add event listeners scoped to the table body
    tbody.querySelectorAll('.actions .action-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const target = e.currentTarget;
            const presetId = target.getAttribute('data-id');
            const action = target.getAttribute('data-action');
            if (!presetId)
                return;
            if (action === 'edit') {
                actions.openPresetEditor(presetId);
            }
            else if (action === 'delete') {
                await actions.handleDeletePreset(presetId);
            }
            else {
                // Apply action (default)
                await actions.applyPreset(presetId);
            }
        });
    });
}
// Handle delete/unlink preset
async function handleDeletePreset(presetId) {
    if (!state.currentPageData)
        return;
    // Check how many pages this preset is linked to
    const linkedPageIds = await StorageService.getPageIdsForPreset(presetId);
    if (linkedPageIds.length === 1) {
        // Preset is only linked to current page - confirm permanent deletion
        actions.showConfirmation('This preset is only linked to this page. Delete it permanently?', async () => {
            await StorageService.deletePreset(presetId);
            await actions.loadPageData();
        });
    }
    else {
        // Preset is linked to multiple pages - confirm unlinking
        actions.showConfirmation(`This preset is linked to ${linkedPageIds.length} pages. Unlink it from this page only?`, async () => {
            if (!state.currentPageData)
                return;
            await StorageService.unlinkPresetFromPage(presetId, state.currentPageData.id);
            await actions.loadPageData();
        });
    }
}
// Apply preset to current page
async function applyPreset(presetId) {
    if (!state.currentPageData)
        return;
    const preset = await StorageService.getPresetById(presetId);
    if (!preset)
        return;
    try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tabs[0]?.id) {
            actions.showNotification('Could not find active tab');
            return;
        }
        const tabId = tabs[0].id;
        // Try to send message to content script
        try {
            await chrome.tabs.sendMessage(tabId, {
                action: 'applypreset',
                formData: preset.formData
            });
            window.close();
        }
        catch (error) {
            // Content script not loaded, inject it first
            console.log('Content script not ready, injecting...');
            // Inject content script
            await chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['content.js']
            });
            // Inject CSS
            await chrome.scripting.insertCSS({
                target: { tabId: tabId },
                files: ['content.css']
            });
            // Wait a bit for script to initialize
            await new Promise(resolve => setTimeout(resolve, 100));
            // Try sending message again
            await chrome.tabs.sendMessage(tabId, {
                action: 'applypreset',
                formData: preset.formData
            });
            window.close();
        }
    }
    catch (error) {
        console.error('Error applying preset:', error);
        actions.showNotification('Failed to apply preset. Make sure you are on a valid web page (not chrome:// or extension pages). Or try refreshing the page.');
    }
}

;// ./src/popup/popup-page/scan-and-link.ts




// Scan form data on current page
async function scanFormData() {
    if (!state.currentPageData)
        return;
    try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const tab = tabs[0];
        const tabId = tab?.id;
        if (!tabId || !tab.url) {
            actions.showNotification('Could not find active tab');
            return;
        }
        // Check if tab is a valid web page
        if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('edge://')) {
            actions.showNotification('Cannot scan form fields on browser internal pages');
            return;
        }
        let response;
        try {
            // Try to send message to content script
            response = await chrome.tabs.sendMessage(tabId, { action: 'scanFormFields' });
        }
        catch (error) {
            // Content script not loaded, inject it first
            console.log('Content script not loaded, injecting...');
            try {
                await chrome.scripting.executeScript({
                    target: { tabId },
                    files: ['content.js']
                });
                // Wait a bit for script to initialize
                await new Promise(resolve => setTimeout(resolve, 100));
                // Retry sending message
                response = await chrome.tabs.sendMessage(tabId, { action: 'scanFormFields' });
            }
            catch (injectError) {
                console.error('Failed to inject content script:', injectError);
                actions.showNotification('Failed to scan form fields. Please refresh the page and try again.');
                return;
            }
        }
        if (response && response.fields && response.fields.length > 0) {
            // Show confirmation modal with scanned fields
            actions.showScannedFieldsModal(response.fields);
        }
        else {
            actions.showNotification('No form fields found on this page');
        }
    }
    catch (error) {
        console.error('Error scanning form fields:', error);
        actions.showNotification('Failed to scan form fields. Make sure you are on a valid web page.');
    }
}
// Show scanned fields modal
function showScannedFieldsModal(fields) {
    const now = new Date();
    const timestamp = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    const defaultName = `Auto-scanned Preset ${timestamp}`;
    const bodyContent = `
    <p style="margin-bottom: 16px; color: var(--text-secondary); font-size: 14px;">
      Found <strong style="color: var(--primary-color);">${fields.length}</strong> form field(s) on this page.
    </p>
    <div class="form-group">
      <label for="presetName">Preset Name *</label>
      <input type="text" id="presetName" placeholder="Enter preset name" value="${defaultName}" />
    </div>
    <div class="form-group">
      <label for="presetDescription">Description</label>
      <textarea id="presetDescription" rows="3" placeholder="Optional description"></textarea>
    </div>
    <div class="form-actions">
    <button id="cancelScannedFieldsBtn" class="cyber-btn cyber-btn--secondary">Cancel
      <span class="cyber-btn__glitch"></span>
      <span class="cyber-btn__label">[esc]</span>
    </button>
    <button id="saveScannedFieldsBtn" class="cyber-btn">Save as Preset
      <span class="cyber-btn__glitch"></span>
      <span class="cyber-btn__label">[enter]</span>
    </button>
    </div>
  `;
    showModal('Scanned Form Fields', bodyContent);
    document.getElementById('saveScannedFieldsBtn')?.addEventListener('click', async () => {
        const presetName = document.getElementById('presetName').value.trim();
        const presetDescription = document.getElementById('presetDescription').value.trim();
        if (!presetName) {
            actions.showNotification('Preset name is required');
            return;
        }
        // Create form data from all scanned fields
        const formData = fields.map((field, index) => ({
            id: field.id || `field_${Date.now()}_${index}`,
            type: field.type,
            title: field.title || '',
            value: field.value === null || field.value === undefined ? null : field.value,
            testId: field.testId || '',
            querySelector: field.querySelector || '',
            fillDelay: 0,
            autoBlur: true,
            createdAt: getCurrentTimestamp(),
            updatedAt: getCurrentTimestamp(),
            order: index + 1
        }));
        // Create new preset
        const newPreset = await StorageService.addPreset({
            name: presetName,
            description: presetDescription || `Auto-scanned from page on ${new Date().toLocaleDateString()}`,
            formData
        });
        // Link preset to current page
        if (state.currentPageData) {
            await StorageService.linkPresetToPage(newPreset.id, state.currentPageData.id);
        }
        hideModal();
        actions.showNotification(`Preset "${presetName}" created with ${fields.length} field(s)!`, async () => {
            await actions.loadPageData();
        });
    });
    document.getElementById('cancelScannedFieldsBtn')?.addEventListener('click', () => {
        hideModal();
    });
}
// Open preset editor
function openPresetEditor(presetId) {
    const basePath = 'html/page-profile-editor.html';
    const pageIdParam = `pageId=${encodeURIComponent(state.currentPageData.id)}`;
    const url = presetId
        ? `${basePath}?${pageIdParam}&presetId=${encodeURIComponent(presetId)}`
        : `${basePath}?${pageIdParam}`;
    chrome.tabs.create({ url: chrome.runtime.getURL(url) });
}
// Show link preset modal
async function showLinkPresetModal() {
    if (!state.currentPageData)
        return;
    const data = await StorageService.getData();
    if (!data)
        return;
    // Get all presets
    const allPresets = data.presets;
    // Get current page's linked presets
    const currentPresetIds = data.presetPageLinks
        .filter(link => link.pageId === state.currentPageData.id)
        .map(link => link.presetId);
    // Filter out already linked presets
    const availablePresets = allPresets.filter(p => !currentPresetIds.includes(p.id));
    if (availablePresets.length === 0) {
        actions.showNotification('No available presets to link. All presets are already linked to this page.');
        return;
    }
    const bodyContent = `
    <p>Select preset(s) to link to this page:</p>
    <div class="modal-selection-counter">Selected: 0 / ${availablePresets.length}</div>
    <div class="preset-list">
      ${availablePresets.map(preset => `
        <label class="preset-item" data-id="${preset.id}">
          <input type="checkbox" class="preset-checkbox" value="${preset.id}" />
          <div class="preset-content">
            <div class="preset-card-name">${preset.name}</div>
            <div class="preset-card-description">${preset.description || 'No description'}</div>
          </div>
        </label>
      `).join('')}
    </div>
    <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px;">
      <button id="linkPresetCancelBtn" class="cyber-btn cyber-btn--secondary">
        Cancel
        <span class="cyber-btn__glitch"></span>
        <span class="cyber-btn__label">[esc]</span>
      </button>
      <button id="linkPresetConfirmBtn" class="cyber-btn">
        Confirm
        <span class="cyber-btn__glitch"></span>
        <span class="cyber-btn__label">[enter]</span>
      </button>
    </div>
  `;
    showModal('Link Existing Preset', bodyContent);
    // Add handlers after modal is shown
    setTimeout(() => {
        // Update counter when checkboxes change
        const updateCounter = () => {
            const checkedCount = document.querySelectorAll('.preset-checkbox:checked').length;
            const totalCount = availablePresets.length;
            const counterEl = document.querySelector('.modal-selection-counter');
            if (counterEl) {
                counterEl.textContent = `Selected: ${checkedCount} / ${totalCount}`;
            }
        };
        // Add change listeners to checkboxes
        document.querySelectorAll('.preset-checkbox').forEach(cb => {
            cb.addEventListener('change', updateCounter);
        });
        document.getElementById('linkPresetCancelBtn')?.addEventListener('click', () => {
            hideModal();
        });
        document.getElementById('linkPresetConfirmBtn')?.addEventListener('click', async () => {
            const selectedPresetIds = [];
            document.querySelectorAll('.preset-checkbox:checked').forEach(cb => {
                selectedPresetIds.push(cb.value);
            });
            if (selectedPresetIds.length === 0) {
                actions.showNotification('Please select at least one preset to link.');
                return;
            }
            // Link all selected presets
            for (const presetId of selectedPresetIds) {
                await StorageService.linkPresetToPage(presetId, state.currentPageData.id);
            }
            hideModal();
            const message = selectedPresetIds.length === 1
                ? 'Preset linked successfully!'
                : `${selectedPresetIds.length} presets linked successfully!`;
            actions.showNotification(message, async () => {
                await actions.loadPageData();
            });
        });
    }, 0);
}

;// ./src/popup/popup-page/preset-import-export.ts





// Export presets data
async function exportPresetsData() {
    if (!state.currentPageData)
        return;
    const presets = await StorageService.getPresetsForPage(state.currentPageData.id);
    if (presets.length === 0) {
        actions.showNotification('No presets to export.');
        return;
    }
    const exportFile = createExportFile({
        included: { presets: true },
        data: { presets },
        exportedAt: new Date().toISOString(),
    });
    downloadFile(JSON.stringify(exportFile, null, 2), `${state.currentPageData.pageTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_presets.json`);
    actions.showNotification(`Exported ${presets.length} preset(s) successfully!`);
}
// Show export presets modal with selection
async function showExportPresetsModal() {
    if (!state.currentPageData)
        return;
    const presets = await StorageService.getPresetsForPage(state.currentPageData.id);
    if (presets.length === 0) {
        actions.showNotification('No presets to export.');
        return;
    }
    const checkboxes = presets.map(preset => `
    <label style="display: flex; align-items: center; gap: 8px; padding: 8px; cursor: pointer; border-radius: 4px; transition: background 0.2s;" 
           onmouseover="this.style.background='var(--bg-hover)'" 
           onmouseout="this.style.background='transparent'">
      <input type="checkbox" class="preset-export-checkbox" value="${preset.id}" checked 
             style="width: 18px; height: 18px; cursor: pointer;" />
      <div style="flex: 1;">
        <div style="font-weight: 500;">${preset.name}</div>
        ${preset.description ? `<div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">${preset.description}</div>` : ''}
      </div>
    </label>
  `).join('');
    const bodyContent = `
    <div style="margin-bottom: 16px;">
      <label style="display: flex; align-items: center; gap: 8px; font-weight: 500; margin-bottom: 12px; cursor: pointer;">
        <input type="checkbox" id="selectAllPresets" checked style="width: 18px; height: 18px;" />
        <span>Select All (${presets.length} presets)</span>
      </label>
    </div>
    <div style="max-height: 400px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 4px; padding: 8px;">
      ${checkboxes}
    </div>
    <div class="form-actions" style="margin-top: 16px;">
      <button id="cancelExportBtn" class="cyber-btn cyber-btn--secondary">Cancel
        <span class="cyber-btn__glitch"></span>
        <span class="cyber-btn__label">[esc]</span>
      </button>
      <button id="exportSelectedBtn" class="cyber-btn">Export Selected
        <span class="cyber-btn__glitch"></span>
        <span class="cyber-btn__label">[enter]</span>
      </button>
    </div>
  `;
    showModal('Export Presets', bodyContent);
    // Select all checkbox logic
    document.getElementById('selectAllPresets')?.addEventListener('change', (e) => {
        const checked = e.target.checked;
        document.querySelectorAll('.preset-export-checkbox').forEach(cb => {
            cb.checked = checked;
        });
    });
    // Export selected button
    document.getElementById('exportSelectedBtn')?.addEventListener('click', async () => {
        const selectedIds = [];
        document.querySelectorAll('.preset-export-checkbox:checked').forEach(cb => {
            selectedIds.push(cb.value);
        });
        if (selectedIds.length === 0) {
            actions.showNotification('Please select at least one preset to export.');
            return;
        }
        const selectedPresets = presets.filter(p => selectedIds.includes(p.id));
        const exportFile = createExportFile({
            included: { presets: true },
            data: { presets: selectedPresets },
            exportedAt: new Date().toISOString(),
        });
        downloadFile(JSON.stringify(exportFile, null, 2), `${state.currentPageData.pageTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_presets.json`);
        hideModal();
        actions.showNotification(`Exported ${selectedPresets.length} preset(s) successfully!`);
    });
    document.getElementById('cancelExportBtn')?.addEventListener('click', () => {
        hideModal();
    });
}
// Import presets data
async function importPresetsData(file) {
    if (!state.currentPageData)
        return;
    try {
        const text = await file.text();
        const importedData = parseExtensionExportJson(text);
        if (!importedData.included.presets || !Array.isArray(importedData.data.presets)) {
            actions.showNotification('Invalid import file: presets section not included');
            return;
        }
        const data = await StorageService.getData();
        if (!data)
            return;
        let addedCount = 0;
        let skippedIdCount = 0;
        let skippedDuplicateCount = 0;
        for (const preset of importedData.data.presets) {
            // Check if preset already exists with same ID
            const existingById = data.presets.find(p => p.id === preset.id);
            if (existingById) {
                skippedIdCount++;
                continue;
            }
            // Check if preset already exists with same name
            const existingByName = data.presets.find(p => p.name === preset.name);
            if (existingByName) {
                skippedDuplicateCount++;
                continue;
            }
            const newPreset = await StorageService.addPreset({
                name: preset.name,
                description: preset.description || '',
                formData: preset.formData || []
            });
            await StorageService.linkPresetToPage(newPreset.id, state.currentPageData.id);
            addedCount++;
        }
        let message = `Added ${addedCount} preset${addedCount === 1 ? '' : 's'}`;
        if (skippedIdCount > 0)
            message += `, skipped ${skippedIdCount} with existing IDs`;
        if (skippedDuplicateCount > 0)
            message += `, skipped ${skippedDuplicateCount} duplicates`;
        actions.showNotification(message, async () => {
            await actions.loadPageData();
        });
    }
    catch (error) {
        console.error('Import error:', error);
        actions.showNotification('Failed to import presets. Please check the file format.');
    }
}

;// ./src/popup/popup-page/random-tools.ts




// String Counter Modal
function showStringCounterModal() {
    const modalBody = `
    <div class="string-counter-container">
      <div class="counter-input-section">
        <textarea id="counterText" class="counter-textarea" placeholder="Enter or paste your text here to count characters, words, lines, etc." rows="8"></textarea>
      </div>
      
      <div class="counter-stats">
        <div class="stat-row">
          <div class="stat-item">
            <span class="stat-label">Characters:</span>
            <span class="stat-value" id="charCount">0</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Characters (no spaces):</span>
            <span class="stat-value" id="charNoSpaceCount">0</span>
          </div>
        </div>
        
        <div class="stat-row">
          <div class="stat-item">
            <span class="stat-label">Words:</span>
            <span class="stat-value" id="wordCount">0</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Sentences:</span>
            <span class="stat-value" id="sentenceCount">0</span>
          </div>
        </div>
        
        <div class="stat-row">
          <div class="stat-item">
            <span class="stat-label">Lines:</span>
            <span class="stat-value" id="lineCount">0</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Paragraphs:</span>
            <span class="stat-value" id="paragraphCount">0</span>
          </div>
        </div>
      </div>
    </div>
  `;
    showModal('String Counter', modalBody);
    // Setup event listeners after modal is shown
    const textarea = document.getElementById('counterText');
    // Update counts function
    const updateCounts = () => {
        const text = textarea.value;
        // Character counts
        const charCount = text.length;
        const charNoSpaceCount = text.replace(/\s/g, '').length;
        // Word count (split by whitespace and filter empty strings)
        const words = text.trim().split(/\s+/).filter(word => word.length > 0);
        const wordCount = words.length;
        // Sentence count (split by . ! ? and filter)
        const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
        const sentenceCount = sentences.length;
        // Line count
        const lines = text.split('\n');
        const lineCount = text === '' ? 0 : lines.length;
        // Paragraph count (split by double newlines)
        const paragraphs = text.split(/\n\s*\n/).filter(para => para.trim().length > 0);
        const paragraphCount = paragraphs.length;
        // Update display
        document.getElementById('charCount').textContent = charCount.toString();
        document.getElementById('charNoSpaceCount').textContent = charNoSpaceCount.toString();
        document.getElementById('wordCount').textContent = wordCount.toString();
        document.getElementById('sentenceCount').textContent = sentenceCount.toString();
        document.getElementById('lineCount').textContent = lineCount.toString();
        document.getElementById('paragraphCount').textContent = paragraphCount.toString();
    };
    // Initial count
    updateCounts();
    // Listen for input changes - immediate calculation
    textarea.addEventListener('input', updateCounts);
    textarea.addEventListener('paste', updateCounts);
    textarea.addEventListener('change', updateCounts);
    textarea.addEventListener('keyup', updateCounts);
    // Focus textarea
    setTimeout(() => textarea.focus(), 100);
}
// Show random string generator modal
async function showRandomStringModal() {
    try {
        const randomStringModal = document.getElementById('randomStringModal');
        if (!randomStringModal) {
            console.error('Random string modal not found');
            return;
        }
        // Load current settings
        const settings = await StorageService.getSettings();
        const charsetSelect = document.getElementById('charsetSelect');
        const lengthInput = document.getElementById('lengthInput');
        const generatedString = document.getElementById('generatedString');
        if (!charsetSelect || !lengthInput || !generatedString) {
            console.error('Modal elements not found');
            return;
        }
        // Set default values from settings
        if (settings) {
            charsetSelect.value = settings.randomStringCharset;
            lengthInput.value = settings.randomStringLength.toString();
        }
        // Generate function
        const generateHandler = () => {
            try {
                const length = parseInt(lengthInput.value) || 50;
                const charset = charsetSelect.value;
                const randomStr = generateRandomString(length, charset);
                generatedString.value = randomStr;
            }
            catch (err) {
                console.error('Failed to generate string:', err);
            }
        };
        // Copy function
        const copyHandler = async () => {
            try {
                const text = generatedString.value;
                if (!text) {
                    actions.showNotification('No string to copy. Please generate a string first.');
                    return;
                }
                await navigator.clipboard.writeText(text);
                actions.showNotification('String copied to clipboard!');
            }
            catch (error) {
                console.error('Failed to copy:', error);
                actions.showNotification('Failed to copy to clipboard');
            }
        };
        // Close function
        const closeModal = () => {
            randomStringModal.style.display = 'none';
        };
        // Setup event listeners
        const generateBtn = document.getElementById('generateStringBtn');
        const copyBtn = document.getElementById('copyStringBtn');
        const closeBtn = document.getElementById('randomStringModalClose');
        if (generateBtn) {
            generateBtn.onclick = generateHandler;
        }
        if (copyBtn) {
            copyBtn.onclick = copyHandler;
        }
        if (closeBtn) {
            closeBtn.onclick = closeModal;
        }
        // Close on overlay click
        randomStringModal.onclick = (e) => {
            if (e.target === randomStringModal) {
                closeModal();
            }
        };
        // Show modal
        randomStringModal.style.display = 'flex';
        // Auto-generate on first show
        generateHandler();
    }
    catch (error) {
        console.error('Failed to show random string modal:', error);
    }
}
// Initialize random string section
function initRandomStringSection(settings) {
    const charsetSelect = document.getElementById('popupCharsetSelect');
    const lengthInput = document.getElementById('popupLengthInput');
    const copyBtn = document.getElementById('popupCopyBtn');
    // Set default charset from settings
    if (settings && charsetSelect) {
        charsetSelect.value = settings.randomStringCharset;
    }
    // Set default length from settings
    if (settings && lengthInput) {
        lengthInput.value = settings.randomStringLength.toString();
    }
    // Copy button (generates and copies in one action)
    copyBtn?.addEventListener('click', async () => {
        try {
            const length = parseInt(lengthInput.value) || 50;
            const charset = charsetSelect.value;
            const randomStr = generateRandomString(length, charset);
            await navigator.clipboard.writeText(randomStr);
            actions.showNotification('Random string copied to clipboard!');
        }
        catch (error) {
            console.error('Failed to generate/copy string:', error);
            actions.showNotification('Failed to generate and copy random string');
        }
    });
}

;// ./src/popup/popup-page/bootstrap.ts

function bootstrap() {
    // Initialize the popup when the DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        actions.init();
    });
}

;// ./src/popup/popup-page/index.ts









Object.assign(actions, startup_namespaceObject, page_data_namespaceObject, page_modals_namespaceObject, preset_table_namespaceObject, scan_and_link_namespaceObject, preset_import_export_namespaceObject, random_tools_namespaceObject);
function startPopupPage() {
    bootstrap();
}

;// ./src/popup/popup.ts

startPopupPage();

/******/ })()
;