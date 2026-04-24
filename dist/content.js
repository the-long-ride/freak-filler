/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// ./src/constants/appConstants.ts
/**
 * Application-wide constants
 */
// Storage keys
const STORAGE_KEYS = {
    DATA: 'formFillerData',
    SETTINGS: 'formFillerSettings',
    MIGRATION: 'formFillerMigrationCompleted'
};
// Theme constants
const appConstants_THEMES = {
    LIGHT: 'light',
    DARK: 'dark'
};
// Form field types
const FIELD_TYPES = {
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
    DYNAMIC_DATE: 'dynamicDate'
};
// UI messages
const MESSAGES = {
    NO_PAGE_URL: 'Page URL is required',
    NO_PRESETS: 'No presets yet',
    NO_PAGES: 'No pages available',
    NO_FORM_FIELDS: 'No form fields found on the page',
    CONFIRM_DELETE: 'Are you sure you want to delete this',
    UNSAVED_CHANGES: 'You have unsaved changes. Do you want to discard them and',
    SUCCESS_SAVE: 'Saved successfully!',
    INVALID_DATA: 'Invalid data format'
};
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
const SORT_DIRECTION = {
    ASC: 'asc',
    DESC: 'desc'
};
// CSS class names
const CSS_CLASSES = {
    ACTIVE: 'active',
    CHECKED: 'checked',
    HIDDEN: 'hidden',
    DISABLED: 'disabled',
    LOADING: 'loading'
};
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
const RANDOM_STRING_CHARSETS = {
    ALPHABET: 'alphabet',
    NUMERIC: 'numeric',
    ALPHANUMERIC: 'alphanumeric',
    ALPHANUMERIC_SPECIAL: 'alphanumeric-special',
    ALPHANUMERIC_SPECIAL_CONTROL: 'alphanumeric-special-control'
};
// Default regex patterns
const DEFAULT_REGEX_PATTERNS = [
    { name: 'Shortest email', regex: '^[a-zA-Z0-9_%+-]@[a-zA-Z0-9.-]\\.[a-zA-Z]{2}$', order: 1 },
    { name: 'Standard email', regex: '^[a-zA-Z0-9_%+-][a-zA-Z0-9._%+-]{6}@[a-zA-Z0-9.-]{4}\\.[a-zA-Z]{3}$', order: 2 },
    { name: 'Longest email', regex: '^[a-zA-Z0-9_%+-][a-zA-Z0-9._%+-]{245}@[a-zA-Z0-9.-]{5}\\.[a-zA-Z]{3}$', order: 3 }
];

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
/**
 * Get element locators (testId and querySelector)
 */
function getElementLocators(inputElement) {
    // Get field identifiers
    const testId = inputElement.getAttribute('data-testid') || inputElement.id || '';
    // Build querySelector - only if element doesn't have data-testid
    let querySelector = '';
    if (inputElement.id) {
        querySelector = `#${inputElement.id}`;
    }
    else if (!inputElement.getAttribute('data-testid')) {
        // Try to find id or data-testid in parent hierarchy (up to 7 levels)
        let element = inputElement.parentElement;
        let foundId = '';
        let foundTestId = '';
        let levelsUp = 0;
        const pathElements = [];
        for (let i = 0; i < 7 && element; i++) {
            pathElements.push(element);
            if (!foundId && element.id) {
                foundId = element.id;
                levelsUp = i + 1;
            }
            if (!foundTestId && element.getAttribute('data-testid')) {
                foundTestId = element.getAttribute('data-testid');
                levelsUp = i + 1;
                break;
            }
            element = element.parentElement;
        }
        if (foundId || foundTestId) {
            // Build selector using parent's id or data-testid with exact path
            const parentSelector = foundId ? `#${foundId}` : `[data-testid='${foundTestId}']`;
            const pathParts = [parentSelector];
            // Add each level in the path
            for (let i = levelsUp - 2; i >= 0; i--) {
                pathParts.push(pathElements[i].tagName.toLowerCase());
            }
            // Add the input element itself
            const tagName = inputElement.tagName.toLowerCase();
            let inputSelector = tagName;
            // Add more specificity if needed - use single quotes to avoid HTML attribute conflicts
            const inputType = inputElement.getAttribute('type');
            if (inputType) {
                inputSelector += `[type='${inputType}']`;
            }
            const inputName = inputElement.getAttribute('name');
            if (inputName) {
                inputSelector += `[name='${inputName}']`;
            }
            pathParts.push(inputSelector);
            querySelector = pathParts.join(' > ');
        }
    }
    return { testId, querySelector };
}

;// ./src/services/storage.service.ts


const STORAGE_KEY = 'formFillerData';
const SETTINGS_KEY = 'formFillerSettings';
class storage_service_StorageService {
    // Initialize storage with default data
    static async initialize() {
        const data = await this.getData();
        if (!data) {
            await this.setData({
                pages: [],
                presets: [],
                presetPageLinks: [],
                savedValues: [],
                regexPatterns: DEFAULT_REGEX_PATTERNS.map(pattern => ({ ...pattern })),
                lengthConfigurations: []
            });
        }
        const settings = await this.getSettings();
        if (!settings) {
            await this.setSettings({
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
    // Get all data
    static async getData() {
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
                                this.setData(data).catch(err => console.error('Migration save failed:', err));
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
    // Set all data
    static async setData(data) {
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
    // Get settings
    static async getSettings() {
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
                                storage_service_StorageService.setSettings(migratedSettings).catch(err => console.error('Settings migration save failed:', err));
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
    // Set settings
    static async setSettings(settings) {
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
    // Get current theme
    static async getTheme() {
        const settings = await this.getSettings();
        return settings?.theme || 'dark';
    }
    // Set theme
    static async setTheme(theme) {
        const settings = await this.getSettings();
        if (settings) {
            settings.theme = theme;
            await this.setSettings(settings);
        }
        else {
            await this.setSettings({
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
    // Get page data by URL
    static async getPageByUrl(url, matchIdentify) {
        const data = await this.getData();
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
    // Get page data by ID
    static async getPageById(pageId) {
        const data = await this.getData();
        if (!data)
            return null;
        return data.pages.find(page => page.id === pageId) || null;
    }
    // Get page data matching current URL
    static async getCurrentPageData(currentUrl) {
        const data = await this.getData();
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
    // Add new page
    static async addPage(pageData) {
        const data = await this.getData() || {
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
        await this.setData(data);
        return newPage;
    }
    // Update page
    /**
     * Update a page by its id
     * @param id - Page id
     * @param updates - Partial page data
     */
    static async updatePage(id, updates) {
        const data = await this.getData();
        if (!data)
            return;
        const pageIndex = data.pages.findIndex(p => p.id === id);
        if (pageIndex !== -1) {
            data.pages[pageIndex] = {
                ...data.pages[pageIndex],
                ...updates,
                updatedAt: getCurrentTimestamp()
            };
            await this.setData(data);
        }
    }
    // Delete preset (removes preset and all its links)
    static async deletePreset(presetId) {
        const data = await this.getData();
        if (!data)
            return;
        // Remove preset
        data.presets = data.presets.filter(p => p.id !== presetId);
        // Remove all links to this preset
        data.presetPageLinks = data.presetPageLinks.filter(link => link.presetId !== presetId);
        await this.setData(data);
    }
    // Add saved form data
    static async addSavedFormData(pageUrl, formData) {
        const data = await this.getData();
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
        await this.setData(data);
    }
    // Delete saved form data
    static async deleteSavedFormData(pageUrl, savedValueId) {
        const data = await this.getData();
        if (!data)
            return;
        const page = data.pages.find(p => p.url === pageUrl);
        if (!page)
            return;
        data.savedValues = data.savedValues.filter(sv => !(sv.pageId === page.id && sv.id === savedValueId));
        await this.setData(data);
    }
    // Get saved form data matching input field  
    static async getSavedFormDataForField(pageUrl, testId, querySelector) {
        const page = await this.getCurrentPageData(pageUrl);
        if (!page)
            return [];
        const data = await this.getData();
        if (!data)
            return [];
        const savedValuesForPage = data.savedValues.filter(sv => sv.pageId === page.id);
        return savedValuesForPage
            .filter(sv => sv.testId === testId || sv.querySelector === querySelector);
    }
    // Get presets for a page by page ID
    static async getPresetsForPage(pageId) {
        const data = await this.getData();
        if (!data)
            return [];
        // Get preset IDs linked to this page
        const linkedPresetIds = data.presetPageLinks
            .filter(link => link.pageId === pageId)
            .map(link => link.presetId);
        // Get the actual presets
        return data.presets.filter(preset => linkedPresetIds.includes(preset.id));
    }
    // Get page IDs linked to a preset
    static async getPageIdsForPreset(presetId) {
        const data = await this.getData();
        if (!data)
            return [];
        return data.presetPageLinks
            .filter(link => link.presetId === presetId)
            .map(link => link.pageId);
    }
    // Get all presets not linked to a specific page
    static async getUnlinkedPresets(pageId) {
        const data = await this.getData();
        if (!data)
            return [];
        // Get preset IDs linked to this page
        const linkedPresetIds = data.presetPageLinks
            .filter(link => link.pageId === pageId)
            .map(link => link.presetId);
        // Get presets that are NOT linked to this page
        return data.presets.filter(preset => !linkedPresetIds.includes(preset.id));
    }
    // Get preset by ID
    static async getPresetById(presetId) {
        const data = await this.getData();
        if (!data)
            return null;
        const preset = data.presets.find(p => p.id === presetId);
        return preset || null;
    }
    // Add preset
    static async addPreset(preset) {
        const data = await this.getData() || {
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
        await this.setData(data);
        return newPreset;
    }
    // Update preset
    static async updatePreset(presetId, updates) {
        const data = await this.getData();
        if (!data)
            return;
        const presetIndex = data.presets.findIndex(p => p.id === presetId);
        if (presetIndex !== -1) {
            data.presets[presetIndex] = {
                ...data.presets[presetIndex],
                ...updates,
                updatedAt: getCurrentTimestamp()
            };
            await this.setData(data);
        }
    }
    // Link preset to page
    static async linkPresetToPage(presetId, pageId) {
        const data = await this.getData();
        if (!data)
            return;
        // Check if link already exists
        const existingLink = data.presetPageLinks.find(link => link.presetId === presetId && link.pageId === pageId);
        if (!existingLink) {
            data.presetPageLinks.push({ presetId, pageId });
            await this.setData(data);
        }
    }
    // Unlink preset from page
    static async unlinkPresetFromPage(presetId, pageId) {
        const data = await this.getData();
        if (!data)
            return;
        data.presetPageLinks = data.presetPageLinks.filter(link => !(link.presetId === presetId && link.pageId === pageId));
        await this.setData(data);
    }
    // Get saved values for a page
    static async getSavedValuesForPage(pageId) {
        const data = await this.getData();
        if (!data)
            return [];
        return data.savedValues.filter(sv => sv.pageId === pageId);
    }
    // Add saved value
    static async addSavedValue(pageId, savedValue) {
        const data = await this.getData();
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
        await this.setData(data);
        return newSavedValue;
    }
    // Delete saved value
    static async deleteSavedValue(savedValueId) {
        const data = await this.getData();
        if (!data)
            return;
        data.savedValues = data.savedValues.filter(sv => sv.id !== savedValueId);
        await this.setData(data);
    }
}

;// ./src/content/element-helpers.ts
/**
 * Helper functions for extracting element identifiers
 */
/**
 * Get element locators (testId and querySelector)
 * @param inputElement - The input element
 * @returns Object with testId and querySelector
 */
function element_helpers_getElementLocators(inputElement) {
    // Get field identifiers
    const testId = inputElement.getAttribute('data-testid') || inputElement.id || '';
    // Build querySelector - only if element doesn't have data-testid
    let querySelector = '';
    if (inputElement.id) {
        querySelector = `#${inputElement.id}`;
    }
    else if (!inputElement.getAttribute('data-testid')) {
        // Try to find id or data-testid in parent hierarchy (up to 7 levels)
        let element = inputElement.parentElement;
        let foundId = '';
        let foundTestId = '';
        let levelsUp = 0;
        const pathElements = [];
        for (let i = 0; i < 7 && element; i++) {
            pathElements.push(element);
            if (!foundId && element.id) {
                foundId = element.id;
                levelsUp = i + 1;
            }
            if (!foundTestId && element.getAttribute('data-testid')) {
                foundTestId = element.getAttribute('data-testid') || '';
                levelsUp = i + 1;
                break;
            }
            element = element.parentElement;
        }
        if (foundId || foundTestId) {
            // Build selector using parent's id or data-testid with exact path
            const parentSelector = foundId ? `#${foundId}` : `[data-testid=\'${foundTestId}\']`;
            const pathParts = [parentSelector];
            // Add each level in the path
            for (let i = levelsUp - 2; i >= 0; i--) {
                pathParts.push(pathElements[i].tagName.toLowerCase());
            }
            // Add the input element itself
            const tagName = inputElement.tagName.toLowerCase();
            let inputSelector = tagName;
            // Add more specificity if needed - use single quotes to avoid HTML attribute conflicts
            const inputType = inputElement.getAttribute('type');
            if (inputType) {
                inputSelector += `[type='${inputType}']`;
            }
            const inputName = inputElement.getAttribute('name');
            if (inputName) {
                inputSelector += `[name='${inputName}']`;
            }
            pathParts.push(inputSelector);
            querySelector = pathParts.join(' > ');
        }
    }
    return { testId, querySelector };
}
/**
 * Get the data-testid attribute or fall back to element id
 * @param element - The input element
 * @returns The test ID or empty string
 */
function getTestId(element) {
    return element_helpers_getElementLocators(element).testId;
}
/**
 * Get the CSS selector for an element
 * @param element - The input element
 * @returns A CSS selector string or empty string
 */
function getSelector(element) {
    return element_helpers_getElementLocators(element).querySelector;
}
/**
 * Get element selector prioritizing data-testid
 * @param element - The input element
 * @returns data-testid if available, otherwise querySelector
 */
function getElementSelector(element) {
    if (!element)
        return '';
    const el = element;
    // Prefer explicit id first (higher priority)
    if (el.id)
        return `${el.tagName.toLowerCase()}#${el.id}`;
    // Then prefer explicit data-testid
    const testId = el.getAttribute('data-testid');
    if (testId)
        return `${el.tagName.toLowerCase()}[data-testid='${testId}']`;
    // Search up the parent chain for an anchor id or data-testid (up to 7 levels)
    let parent = el.parentElement;
    let foundId = '';
    let foundTestId = '';
    let levelsUp = 0;
    const pathElements = [];
    for (let i = 0; i < 7 && parent; i++) {
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
        const parentSelector = foundId ? `#${foundId}` : `[data-testid=\'${foundTestId}\']`;
        const pathParts = [parentSelector];
        for (let i = levelsUp - 2; i >= 0; i--) {
            pathParts.push(pathElements[i].tagName.toLowerCase());
        }
        // Build element selector with some specificity
        const tagName = el.tagName.toLowerCase();
        let elemSelector = tagName;
        const inputType = el.getAttribute('type');
        if (inputType)
            elemSelector += `[type='${inputType}']`;
        const inputName = el.getAttribute('name');
        if (inputName)
            elemSelector += `[name='${inputName}']`;
        const classes = Array.from(el.classList).filter(Boolean);
        if (classes.length > 0) {
            elemSelector += `.${classes[0]}`;
        }
        pathParts.push(elemSelector);
        return pathParts.join(' > ');
    }
    // Fallback: build a local selector using tag + class/name or nth-child
    let selector = el.tagName.toLowerCase();
    const classes = Array.from(el.classList).filter(Boolean);
    const nameAttr = el.getAttribute('name');
    if (nameAttr) {
        selector += `[name='${nameAttr}']`;
        return selector;
    }
    if (classes.length > 0) {
        selector += `.${classes[0]}`;
        return selector;
    }
    // Last resort: use parent > tag:nth-child(index)
    const parentEl = el.parentElement;
    if (parentEl) {
        const children = Array.from(parentEl.children);
        const idx = children.indexOf(el) + 1;
        const parentTag = parentEl.tagName.toLowerCase();
        selector = `${parentTag} > ${el.tagName.toLowerCase()}:nth-child(${idx})`;
    }
    return selector;
}
/**
 * Auto-populate test ID and selector inputs
 * @param element - The input element
 * @param testIdInput - The test ID input field
 * @param selectorInput - The selector input field
 */
function populateIdentifiers(element, testIdInput, selectorInput) {
    testIdInput.value = getTestId(element);
    selectorInput.value = getSelector(element);
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
        const savedValues = await storage_service_StorageService.getSavedValuesForPage(pageData.id);
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
                importBtn.innerHTML = 'APPLY';
                importBtn.title = 'Import this value into the field';
                importBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (currentInputElement) {
                        currentInputElement.value = value;
                        currentInputElement.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                    afterClick?.();
                });
                const delBtn = document.createElement('button');
                delBtn.type = 'button';
                delBtn.className = 'delete-saved-value-btn';
                delBtn.innerHTML = 'DEL';
                delBtn.title = 'Delete this saved value';
                delBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    try {
                        if (!pageData?.url)
                            return;
                        await storage_service_StorageService.deleteSavedFormData(pageData.url, sv.id);
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
                // Row click still imports value
                // row.addEventListener('click', () => {
                //   if (currentInputElement) {
                //     currentInputElement.value = value;
                //     currentInputElement.dispatchEvent(new Event('input', { bubbles: true }));
                //   }
                //   afterClick?.();
                // });
                savedValuesGridBody.appendChild(row);
            });
        }
    }
    // Populate preset values grid
    if (pageData?.id) {
        const presets = await storage_service_StorageService.getPresetsForPage(pageData.id);
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
                        currentInputElement.value = value;
                        currentInputElement.dispatchEvent(new Event('input', { bubbles: true }));
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
    nameInput.value = String(inputElement.getAttribute('aria-label') ||
        inputElement.getAttribute('placeholder') ||
        inputElement.name ||
        inputElement.getAttribute('title') ||
        'Input Field');
    // Auto-populate test ID and selector
    populateIdentifiers(inputElement, testIdInput, selectorInput);
    // Populate preset selector
    if (pageData?.id) {
        const presets = await storage_service_StorageService.getPresetsForPage(pageData.id);
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
        const settings = await storage_service_StorageService.getSettings();
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
        const value = inputElement.value;
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
            const currentPageData = await storage_service_StorageService.getCurrentPageData(currentUrl);
            if (!currentPageData) {
                dispatchNotification('Page not found');
                return;
            }
            await storage_service_StorageService.addSavedValue(currentPageData.id, {
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
            const preset = await storage_service_StorageService.getPresetById(presetId);
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
                    type: (inputElement.tagName === 'TEXTAREA' ? 'text' : 'text'),
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
                await storage_service_StorageService.updatePreset(presetId, {
                    formData: preset.formData
                });
                dispatchNotification('Value saved to preset successfully!');
            }
        }
        await setupImportSection(popup, inputElement, pageData, () => { showNotification('Value imported into the field.'); });
    });
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

;// ./src/content/content.ts






// ICON_MAP not used in this file anymore


let autoFillPopup = null;
let content_currentInputElement = null;
let currentSettings = null;
let isMouseOverPopup = false;
let contextInvalidated = false;
let lastContextMenuTarget = null;
let lastContextMenuTargetType = null;
// Check if extension context is valid
function isExtensionContextValid() {
    if (contextInvalidated)
        return false;
    try {
        if (!chrome.runtime?.id) {
            contextInvalidated = true;
            return false;
        }
        return true;
    }
    catch {
        contextInvalidated = true;
        return false;
    }
}
// Initialize
async function init() {
    try {
        if (!isExtensionContextValid()) {
            console.warn('Freak Filler: Extension context invalid at init');
            return;
        }
        currentSettings = await storage_service_StorageService.getSettings();
        // Always attach listeners - the popup shows based on settings
        attachInputListeners();
    }
    catch (error) {
        console.warn('Freak Filler: Failed to initialize, extension may have been reloaded');
        contextInvalidated = true;
        return;
    }
    // Listen for settings changes
    chrome.storage.onChanged.addListener((changes) => {
        if (changes.formFillerSettings) {
            currentSettings = changes.formFillerSettings.newValue;
        }
    });
}
// Attach listeners to input fields
function attachInputListeners() {
    document.addEventListener('focusin', handleInputFocus);
    document.addEventListener('focusout', handleInputFocusOut);
    document.addEventListener('click', handleInputClick);
    document.addEventListener('contextmenu', handleContextMenu);
}
// Handle input click (for live assistant mode)
async function handleInputClick(event) {
    // Early exit if context is invalid
    if (!isExtensionContextValid()) {
        return;
    }
    // Only handle if live assistant is enabled
    if (!currentSettings?.enableLiveAssistant) {
        return;
    }
    // Check if any feature is enabled
    if (!currentSettings?.enableSaveValue &&
        !currentSettings?.enableImportValue &&
        !currentSettings?.enableRandomStringInAssistant &&
        !currentSettings?.enableLocatorRetriever &&
        !currentSettings?.enableRegexPattern) {
        return;
    }
    const target = event.target;
    // Prevent showing popup if the clicked element is inside our own popup
    if (target.closest('.form-filler-popup')) {
        return;
    }
    // Handle text inputs, textareas, date pickers, and dropdowns
    if ((target.tagName === 'INPUT' && ['text', 'date', 'datetime-local', 'email', 'tel', 'number', 'search', 'url', 'range', 'color'].includes(target.type)) ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT') {
        if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) {
            content_currentInputElement = target;
            try {
                await showFillingAssistantPopup(content_currentInputElement);
            }
            catch (error) {
                console.warn('Freak Filler: Unable to show popup, extension context may be invalid');
                contextInvalidated = true;
                removePopup();
            }
        }
    }
}
// Handle input focus
async function handleInputFocus(event) {
    // Early exit if context is invalid
    if (!isExtensionContextValid()) {
        return;
    }
    // If live assistant is ENABLED, handle in click event instead
    // If live assistant is DISABLED, don't show assistant at all (context menu only)
    if (currentSettings?.enableLiveAssistant !== undefined) {
        return;
    }
    // Check if any feature is enabled
    if (!currentSettings?.enableSaveValue && !currentSettings?.enableImportValue) {
        return;
    }
    const target = event.target;
    // Prevent showing popup if the focused element is inside our own popup
    if (target.closest('.form-filler-popup')) {
        return;
    }
    if ((target.tagName === 'INPUT' && !['submit', 'reset'].includes(target.type)) ||
        target.tagName === 'TEXTAREA') {
        if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
            content_currentInputElement = target;
            try {
                await showFillingAssistantPopup(content_currentInputElement);
            }
            catch (error) {
                console.warn('Freak Filler: Unable to show popup, extension context may be invalid');
                contextInvalidated = true;
                removePopup();
            }
        }
    }
}
// Handle context menu to track target element
function handleContextMenu(event) {
    const mouseEvent = event;
    const initial = document.elementFromPoint(mouseEvent.clientX, mouseEvent.clientY) || event.target;
    // First priority: Editable controls (inputs, textareas, selects, contenteditable) - check if clicked element or ancestor is editable
    const editable = initial.closest('input, textarea, select, [contenteditable]');
    if (editable) {
        lastContextMenuTarget = editable;
        lastContextMenuTargetType = 'editable';
    }
    else {
        // Second priority: data-testid on the exact element or its ancestors
        const dataTestEl = initial.closest('[data-testid]');
        if (dataTestEl) {
            lastContextMenuTarget = dataTestEl;
            lastContextMenuTargetType = 'data-testid';
        }
        else if (initial.id) {
            // Third priority: use nearest ancestor with id
            const idEl = initial.closest('[id]');
            lastContextMenuTarget = idEl || initial;
            lastContextMenuTargetType = 'id';
        }
        else {
            // Label-associated controls
            const label = initial.closest('label');
            if (label) {
                const forId = label.getAttribute('for');
                if (forId) {
                    const associated = document.getElementById(forId);
                    if (associated) {
                        lastContextMenuTarget = associated;
                        lastContextMenuTargetType = 'label-associated';
                    }
                }
                else {
                    const inner = label.querySelector('input, textarea, select');
                    if (inner) {
                        lastContextMenuTarget = inner;
                        lastContextMenuTargetType = 'label-associated';
                    }
                }
            }
            // Clickable or media elements
            if (!lastContextMenuTarget) {
                const clickEl = initial.closest('button, a, img');
                if (clickEl) {
                    lastContextMenuTarget = clickEl;
                    lastContextMenuTargetType = clickEl.tagName.toLowerCase();
                }
            }
            // Fallback to the initial element
            if (!lastContextMenuTarget) {
                lastContextMenuTarget = initial;
                lastContextMenuTargetType = initial.tagName.toLowerCase();
            }
        }
    }
    // Log helpful debug info
    const best = lastContextMenuTarget;
    const testId = best?.getAttribute('data-testid');
    const id = best?.id;
    const name = (best?.name) || null;
    console.log('Context menu target selected:', { tag: best?.tagName, contextType: lastContextMenuTargetType, testId, id, name });
}
// Handle input focus out
function handleInputFocusOut(event) {
    // Delay removal to allow clicking popup buttons
    const activeElement = document.activeElement;
    const relatedTarget = event.relatedTarget;
    // Don't remove if mouse is over popup or if clicking inside popup
    if (isMouseOverPopup)
        return;
    if (autoFillPopup && autoFillPopup.contains(activeElement))
        return;
    if (autoFillPopup && relatedTarget && autoFillPopup.contains(relatedTarget))
        return;
    removePopup();
}
// Show auto-fill popup
async function showFillingAssistantPopup(inputElement) {
    if (!isExtensionContextValid()) {
        return;
    }
    removePopup();
    // Set current input element for the modules
    setCurrentInputElement(inputElement);
    // Get page data
    const currentUrl = window.location.href;
    const pageData = await storage_service_StorageService.getCurrentPageData(currentUrl);
    // Show toast if save/import enabled but no page profile
    if (!pageData && (currentSettings?.enableSaveValue || currentSettings?.enableImportValue) &&
        (!currentSettings?.enableRandomStringInAssistant &&
            !currentSettings?.enableLocatorRetriever &&
            !currentSettings?.enableRegexPattern)) {
        showNotification('No page profile found. Please create a page profile for this website to use save and import features.');
        return;
    }
    // Check if any features are enabled
    const hasFeatures = currentSettings?.enableRandomStringInAssistant ||
        currentSettings?.enableSaveValue ||
        currentSettings?.enableImportValue ||
        currentSettings?.enableLocatorRetriever ||
        currentSettings?.enableRegexPattern;
    if (!hasFeatures) {
        return;
    }
    // Determine the input type to decide which sections are allowed
    const textLikeTypes = ['text', 'search', 'url', 'tel', 'email', 'password', 'number'];
    const inputType = (inputElement instanceof HTMLInputElement) ? (inputElement.type || 'text') : inputElement.tagName.toLowerCase();
    // Allow text-like sections for inputs and for textareas
    const allowTextSections = (inputElement instanceof HTMLTextAreaElement) || textLikeTypes.includes(inputType);
    const popup = createPopup(pageData, allowTextSections);
    autoFillPopup = popup;
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
    if (pageData && currentSettings?.enableSaveValue) {
        await setupSaveSection(popup, inputElement, pageData);
    }
    if (pageData && currentSettings?.enableImportValue) {
        await setupImportSection(popup, inputElement, pageData, () => {
            showNotification('Value imported into the field.');
        });
    }
    if (currentSettings?.enableRandomStringInAssistant && allowTextSections) {
        setupRandomStringSection(popup, inputElement, currentUrl);
    }
    if (currentSettings?.enableLocatorRetriever) {
        setupLocatorRetrieverSection(popup, inputElement);
    }
    if (currentSettings?.enableRegexPattern && allowTextSections) {
        setupRegexPatternSection(popup, inputElement);
    }
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
    const showSaveValue = currentSettings?.enableSaveValue && !!pageData;
    const showImportValue = currentSettings?.enableImportValue && !!pageData;
    const showRandomString = (currentSettings?.enableRandomStringInAssistant ?? false) && allowTextSections;
    const showLocatorRetriever = currentSettings?.enableLocatorRetriever ?? false;
    const showRegexPattern = (currentSettings?.enableRegexPattern ?? false) && allowTextSections;
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
        isMouseOverPopup = true;
    });
    popup.addEventListener('mouseleave', () => {
        isMouseOverPopup = false;
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
    if (autoFillPopup) {
        // Remove popup from parent
        autoFillPopup.remove();
        autoFillPopup = null;
    }
    isMouseOverPopup = false;
    setCurrentInputElement(null);
}
// Listen for messages from popup/background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'applypreset') {
        applypresetToPage(request.formData);
        sendResponse({ success: true });
    }
    else if (request.action === 'scanFormFields') {
        const fields = scanFormFields();
        sendResponse({ success: true, fields });
    }
    else if (request.action === 'showAssistantFromContextMenu') {
        // Show assistant for the element that was right-clicked
        storage_service_StorageService.getSettings().then((settings) => {
            const enabled = settings?.enableSaveValue || settings?.enableImportValue || settings?.enableLiveAssistant || settings?.enableRandomStringInAssistant;
            if (!enabled) {
                sendResponse({ success: false, error: 'Assistant disabled in settings' });
                return;
            }
            if (lastContextMenuTarget) {
                // Type-check: showAutoFillPopup expects HTMLInputElement/TextAreaElement/SelectElement
                content_currentInputElement = lastContextMenuTarget;
                showFillingAssistantPopup(content_currentInputElement).then(() => {
                    sendResponse({ success: true });
                }).catch((error) => {
                    sendResponse({ success: false, error: error.message });
                });
            }
            else {
                sendResponse({ success: false, error: 'No target element' });
            }
        }).catch(err => {
            console.warn('Failed to read settings before showing assistant', err);
            sendResponse({ success: false, error: 'Failed to read settings' });
        });
        return true; // Keep channel open for async
    }
    else if (request.action === 'getElementSelector') {
        // Get selector for the element that was right-clicked
        console.log('getElementSelector request received, target:', lastContextMenuTarget);
        if (lastContextMenuTarget) {
            const selector = getElementSelector(lastContextMenuTarget);
            console.log('Selector generated:', selector);
            if (!selector) {
                console.warn('Selector could not be generated for target:', lastContextMenuTarget);
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
// Get label for an input element with priority order
function getElementLabel(element) {
    // 1. Closest label tag
    const closestLabel = element.closest('label');
    if (closestLabel && closestLabel.textContent?.trim()) {
        return closestLabel.textContent.trim();
    }
    // 2. Label tag with for="element.id"
    if (element.id) {
        const labelFor = document.querySelector(`label[for="${element.id}"]`);
        if (labelFor && labelFor.textContent?.trim()) {
            return labelFor.textContent.trim();
        }
    }
    // 3. aria-label attribute
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel?.trim()) {
        return ariaLabel.trim();
    }
    // 4. title attribute
    if (element.title?.trim()) {
        return element.title.trim();
    }
    // 5. placeholder attribute
    const placeholder = element.getAttribute('placeholder');
    if (placeholder?.trim()) {
        return placeholder.trim();
    }
    // 6. name attribute
    if (element.name?.trim()) {
        return element.name.trim();
    }
    // 7. data-testid attribute
    const testId = element.getAttribute('data-testid');
    if (testId?.trim()) {
        return testId.trim();
    }
    // 8. id attribute
    if (element.id?.trim()) {
        return element.id.trim();
    }
    // 9. Look for nearby text content in parent elements
    let parent = element.parentElement;
    for (let i = 0; i < 3 && parent; i++) {
        // Skip if parent is a form or div with many children
        if (parent.tagName === 'FORM' || (parent.tagName === 'DIV' && parent.children.length > 5)) {
            parent = parent.parentElement;
            continue;
        }
        // Look for text content in the parent
        const textContent = parent.textContent?.trim();
        if (textContent && textContent.length < 100 && textContent !== element.value) {
            // Remove the element's own text if it's included
            const elementText = element.textContent?.trim() || '';
            const cleanText = textContent.replace(elementText, '').trim();
            if (cleanText && cleanText.length < 50) {
                return cleanText;
            }
        }
        parent = parent.parentElement;
    }
    // 10. Look for preceding sibling text
    const prevSibling = element.previousElementSibling;
    if (prevSibling && prevSibling.textContent?.trim()) {
        const text = prevSibling.textContent.trim();
        if (text.length < 50) {
            return text;
        }
    }
    // 11. Fallback: Generate meaningful name from element attributes
    const type = element.type || 'text';
    const name = element.name || '';
    const id = element.id || '';
    if (name) {
        // Convert camelCase or snake_case to readable text
        return name.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).trim();
    }
    if (id) {
        // Convert camelCase or snake_case to readable text
        return id.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).trim();
    }
    // Type-based fallback
    const typeLabels = {
        'text': 'Text Field',
        'email': 'Email',
        'password': 'Password',
        'tel': 'Phone',
        'url': 'Website',
        'search': 'Search',
        'number': 'Number',
        'range': 'Range',
        'date': 'Date',
        'datetime-local': 'Date & Time',
        'color': 'Color',
        'checkbox': 'Checkbox',
        'radio': 'Radio Button'
    };
    return typeLabels[type] || 'Form Field';
}
// Scan form fields on the page
function scanFormFields() {
    const fields = [];
    const scannedElements = new Set();
    // Helper to check if value is a placeholder or default
    const isPlaceholderValue = (element, value) => {
        if (!value)
            return false;
        // Check if value matches placeholder
        const placeholder = element.getAttribute('placeholder');
        if (placeholder && value === placeholder)
            return true;
        // Check for common default values
        if (['x', 'X', '0.00', '0', '00/00/0000', 'MM/DD/YYYY'].includes(value.trim()))
            return true;
        // Check if it's a date field with default date
        if (element.type === 'date' && value === '02/06/2026')
            return true;
        return false;
    };
    // Scan text inputs
    document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], input[type="tel"], input[type="url"], input[type="search"], input:not([type])').forEach(input => {
        if (scannedElements.has(input))
            return;
        if (!isElementVisible(input))
            return;
        scannedElements.add(input);
        const inputEl = input;
        const testId = inputEl.getAttribute('data-testid') || inputEl.id || '';
        const querySelector = getElementSelector(inputEl);
        const label = getElementLabel(inputEl);
        console.log('Scanned text input:', { selector: querySelector, label, value: inputEl.value });
        fields.push({
            id: `${Date.now()}_${fields.length}`,
            type: 'text',
            title: label,
            value: isPlaceholderValue(inputEl, inputEl.value) ? '' : (inputEl.value || ''),
            testId,
            querySelector,
            fillDelay: DEFAULTS.FILL_DELAY,
            autoBlur: DEFAULTS.AUTO_BLUR,
            createdAt: getCurrentTimestamp(),
            updatedAt: getCurrentTimestamp(),
            order: fields.length + 1,
            position: getElementPosition(inputEl)
        });
    });
    // Scan search inputs
    document.querySelectorAll('input[type="search"]').forEach(input => {
        if (scannedElements.has(input))
            return;
        if (!isElementVisible(input))
            return;
        scannedElements.add(input);
        const inputEl = input;
        const testId = inputEl.getAttribute('data-testid') || inputEl.id || '';
        const querySelector = getElementSelector(inputEl);
        const label = getElementLabel(inputEl);
        fields.push({
            id: `${Date.now()}_${fields.length}`,
            type: 'search',
            title: label,
            value: isPlaceholderValue(inputEl, inputEl.value) ? '' : (inputEl.value || ''),
            testId,
            querySelector,
            fillDelay: DEFAULTS.FILL_DELAY,
            autoBlur: DEFAULTS.AUTO_BLUR,
            createdAt: getCurrentTimestamp(),
            updatedAt: getCurrentTimestamp(),
            order: fields.length + 1,
            position: getElementPosition(inputEl)
        });
    });
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
            if (checked && !scannedElements.has(checked) && isElementVisible(checked)) {
                scannedElements.add(checked);
                const testId = checked.getAttribute('data-testid') || checked.id || '';
                const querySelector = getElementSelector(checked);
                const label = getElementLabel(checked) || checked.value;
                fields.push({
                    id: `${Date.now()}_${fields.length}`,
                    type: 'radio',
                    title: label,
                    value: checked.value || '',
                    testId,
                    querySelector,
                    fillDelay: DEFAULTS.FILL_DELAY,
                    autoBlur: DEFAULTS.AUTO_BLUR,
                    createdAt: getCurrentTimestamp(),
                    updatedAt: getCurrentTimestamp(),
                    order: fields.length + 1,
                    position: getElementPosition(checked)
                });
            }
        }
        else {
            // For radios without a name, treat each radio individually but only if checked
            group.forEach(radioEl => {
                if (radioEl.checked && !scannedElements.has(radioEl) && isElementVisible(radioEl)) {
                    scannedElements.add(radioEl);
                    const testId = radioEl.getAttribute('data-testid') || radioEl.id || '';
                    const querySelector = getElementSelector(radioEl);
                    const label = getElementLabel(radioEl) || radioEl.value;
                    fields.push({
                        id: `${Date.now()}_${fields.length}`,
                        type: 'radio',
                        title: label,
                        value: radioEl.value || '',
                        testId,
                        querySelector,
                        fillDelay: DEFAULTS.FILL_DELAY,
                        autoBlur: DEFAULTS.AUTO_BLUR,
                        createdAt: getCurrentTimestamp(),
                        updatedAt: getCurrentTimestamp(),
                        order: fields.length + 1,
                        position: getElementPosition(radioEl)
                    });
                }
            });
        }
    });
    // Scan range inputs
    document.querySelectorAll('input[type="range"]').forEach(range => {
        if (scannedElements.has(range))
            return;
        if (!isElementVisible(range))
            return;
        scannedElements.add(range);
        const rangeEl = range;
        const testId = rangeEl.getAttribute('data-testid') || rangeEl.id || '';
        const querySelector = getElementSelector(rangeEl);
        const label = getElementLabel(rangeEl);
        fields.push({
            id: `${Date.now()}_${fields.length}`,
            type: 'range',
            title: label,
            value: rangeEl.value || '',
            testId,
            querySelector,
            fillDelay: DEFAULTS.FILL_DELAY,
            autoBlur: DEFAULTS.AUTO_BLUR,
            createdAt: getCurrentTimestamp(),
            updatedAt: getCurrentTimestamp(),
            order: fields.length + 1,
            position: getElementPosition(rangeEl)
        });
    });
    // Scan number inputs
    document.querySelectorAll('input[type="number"]').forEach(number => {
        if (scannedElements.has(number))
            return;
        if (!isElementVisible(number))
            return;
        scannedElements.add(number);
        const numberEl = number;
        const testId = numberEl.getAttribute('data-testid') || numberEl.id || '';
        const querySelector = getElementSelector(numberEl);
        const label = getElementLabel(numberEl);
        fields.push({
            id: `${Date.now()}_${fields.length}`,
            type: 'number',
            title: label,
            value: isPlaceholderValue(numberEl, numberEl.value) ? '' : (numberEl.value || ''),
            testId,
            querySelector,
            fillDelay: DEFAULTS.FILL_DELAY,
            autoBlur: DEFAULTS.AUTO_BLUR,
            createdAt: getCurrentTimestamp(),
            updatedAt: getCurrentTimestamp(),
            order: fields.length + 1,
            position: getElementPosition(numberEl)
        });
    });
    // Scan color inputs
    document.querySelectorAll('input[type="color"]').forEach(color => {
        if (scannedElements.has(color))
            return;
        if (!isElementVisible(color))
            return;
        scannedElements.add(color);
        const colorEl = color;
        const testId = colorEl.getAttribute('data-testid') || colorEl.id || '';
        const querySelector = getElementSelector(colorEl);
        const label = getElementLabel(colorEl);
        fields.push({
            id: `${Date.now()}_${fields.length}`,
            type: 'color',
            title: label,
            value: colorEl.value || '#000000',
            testId,
            querySelector,
            fillDelay: DEFAULTS.FILL_DELAY,
            autoBlur: DEFAULTS.AUTO_BLUR,
            createdAt: getCurrentTimestamp(),
            updatedAt: getCurrentTimestamp(),
            order: fields.length + 1,
            position: getElementPosition(colorEl)
        });
    });
    // Scan date/datetime-local inputs
    document.querySelectorAll('input[type="date"], input[type="datetime-local"]').forEach(date => {
        if (scannedElements.has(date))
            return;
        if (!isElementVisible(date))
            return;
        scannedElements.add(date);
        const dateEl = date;
        const testId = dateEl.getAttribute('data-testid') || dateEl.id || '';
        const querySelector = getElementSelector(dateEl);
        const label = getElementLabel(dateEl);
        fields.push({
            id: `${Date.now()}_${fields.length}`,
            type: 'datepicker',
            title: label,
            value: isPlaceholderValue(dateEl, dateEl.value) ? '' : (dateEl.value || ''),
            testId,
            querySelector,
            fillDelay: DEFAULTS.FILL_DELAY,
            autoBlur: DEFAULTS.AUTO_BLUR,
            createdAt: getCurrentTimestamp(),
            updatedAt: getCurrentTimestamp(),
            order: fields.length + 1,
            position: getElementPosition(dateEl)
        });
    });
    // Scan textareas
    document.querySelectorAll('textarea').forEach(textarea => {
        if (scannedElements.has(textarea))
            return;
        if (!isElementVisible(textarea))
            return;
        scannedElements.add(textarea);
        const textareaEl = textarea;
        const testId = textareaEl.getAttribute('data-testid') || textareaEl.id || '';
        const querySelector = getElementSelector(textareaEl);
        const label = getElementLabel(textareaEl);
        fields.push({
            id: `${Date.now()}_${fields.length}`,
            type: 'text',
            title: label,
            value: isPlaceholderValue(textareaEl, textareaEl.value) ? '' : (textareaEl.value || ''),
            testId,
            querySelector,
            fillDelay: DEFAULTS.FILL_DELAY,
            autoBlur: DEFAULTS.AUTO_BLUR,
            createdAt: getCurrentTimestamp(),
            updatedAt: getCurrentTimestamp(),
            order: fields.length + 1,
            position: getElementPosition(textareaEl)
        });
    });
    // Scan checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        if (scannedElements.has(checkbox))
            return;
        if (!isElementVisible(checkbox))
            return;
        scannedElements.add(checkbox);
        const checkboxEl = checkbox;
        const testId = checkboxEl.getAttribute('data-testid') || checkboxEl.id || '';
        const querySelector = getElementSelector(checkboxEl);
        const label = getElementLabel(checkboxEl);
        fields.push({
            id: `${Date.now()}_${fields.length}`,
            type: 'checkbox',
            title: label,
            value: checkboxEl.checked ? true : false,
            testId,
            querySelector,
            fillDelay: DEFAULTS.FILL_DELAY,
            autoBlur: DEFAULTS.AUTO_BLUR,
            createdAt: getCurrentTimestamp(),
            updatedAt: getCurrentTimestamp(),
            order: fields.length + 1,
            position: getElementPosition(checkboxEl)
        });
    });
    // Scan select dropdowns
    document.querySelectorAll('select').forEach(select => {
        if (scannedElements.has(select))
            return;
        if (!isElementVisible(select))
            return;
        scannedElements.add(select);
        const selectEl = select;
        const testId = selectEl.getAttribute('data-testid') || selectEl.id || '';
        const querySelector = getElementSelector(selectEl);
        const label = getElementLabel(selectEl);
        fields.push({
            id: `${Date.now()}_${fields.length}`,
            type: 'dropdown',
            title: label,
            value: selectEl.value || '',
            testId,
            querySelector,
            fillDelay: DEFAULTS.FILL_DELAY,
            autoBlur: DEFAULTS.AUTO_BLUR,
            createdAt: getCurrentTimestamp(),
            updatedAt: getCurrentTimestamp(),
            order: fields.length + 1,
            position: getElementPosition(selectEl)
        });
    });
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
        await applyFieldToPage(field);
    }
}
// Apply single field to page
async function applyFieldToPage(field) {
    return new Promise((resolve) => {
        let element = null;
        // Try to find element by test ID first
        if (field.testId) {
            element = document.querySelector(`[data-testid="${field.testId}"]`);
        }
        // Try query selector if test ID didn't work
        if (!element && field.querySelector) {
            element = document.querySelector(field.querySelector);
        }
        if (element) {
            if (field.type === 'checkbox') {
                if (element.checked !== field.value)
                    simulateClick(element);
                // Optionally blur after fill
                if (field.autoBlur) {
                    element.blur();
                }
                resolve();
            }
            else if (field.type === 'radio') {
                // For radio buttons, select the one with matching value
                const radios = document.querySelectorAll(`input[type="radio"][name="${element.name}"]`);
                radios.forEach(radio => {
                    if (radio.value === String(field.value)) {
                        simulateClick(radio);
                        if (!radio.checked) {
                            radio.checked = true;
                        }
                    }
                });
                // Trigger change and input events
                element.dispatchEvent(new Event('input', { bubbles: true }));
                element.dispatchEvent(new Event('change', { bubbles: true }));
                if (field.autoBlur) {
                    element.blur();
                }
                resolve();
            }
            else if (field.type === 'clickable') {
                // For clickable elements, wait for specified delay then click
                const delay = parseInt(String(field.value)) || 0;
                setTimeout(() => {
                    simulateClick(element);
                    if (field.autoBlur) {
                        element.blur();
                    }
                    resolve();
                }, delay);
            }
            else if (field.type === 'range' || field.type === 'number') {
                // For range and number inputs
                element.value = decodeHtmlEntities(String(field.value));
                // Trigger change and input events
                element.dispatchEvent(new Event('input', { bubbles: true }));
                element.dispatchEvent(new Event('change', { bubbles: true }));
                if (field.autoBlur) {
                    element.blur();
                }
                setTimeout(resolve, field.fillDelay);
            }
            else if (field.type === 'color') {
                // For color inputs
                element.value = decodeHtmlEntities(String(field.value));
                // Trigger change and input events
                element.dispatchEvent(new Event('input', { bubbles: true }));
                element.dispatchEvent(new Event('change', { bubbles: true }));
                if (field.autoBlur) {
                    element.blur();
                }
                setTimeout(resolve, field.fillDelay);
            }
            else if (field.type === 'datepicker') {
                // For date inputs
                element.value = decodeHtmlEntities(String(field.value));
                // Trigger change and input events
                element.dispatchEvent(new Event('input', { bubbles: true }));
                element.dispatchEvent(new Event('change', { bubbles: true }));
                if (field.autoBlur) {
                    element.blur();
                }
                setTimeout(resolve, field.fillDelay);
            }
            else if (field.type === 'dynamicDate') {
                // For dynamicDate, calculate the date based on offsets
                try {
                    const offsets = JSON.parse(String(field.value));
                    const years = offsets.years || 0;
                    const months = offsets.months || 0;
                    const days = offsets.days || 0;
                    // Calculate the date
                    const currentDate = new Date();
                    currentDate.setFullYear(currentDate.getFullYear() + years);
                    currentDate.setMonth(currentDate.getMonth() + months);
                    currentDate.setDate(currentDate.getDate() + days);
                    // Format as YYYY-MM-DD for date inputs
                    const year = currentDate.getFullYear();
                    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                    const day = String(currentDate.getDate()).padStart(2, '0');
                    const dateString = `${year}-${month}-${day}`;
                    element.value = dateString;
                    // Trigger change and input events
                    element.dispatchEvent(new Event('input', { bubbles: true }));
                    element.dispatchEvent(new Event('change', { bubbles: true }));
                    if (field.autoBlur) {
                        element.blur();
                    }
                    setTimeout(resolve, field.fillDelay);
                }
                catch (e) {
                    console.error('Failed to parse dynamicDate value:', e);
                    // If parsing fails, just use current date
                    const currentDate = new Date();
                    const year = currentDate.getFullYear();
                    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                    const day = String(currentDate.getDate()).padStart(2, '0');
                    element.value = `${year}-${month}-${day}`;
                    element.dispatchEvent(new Event('input', { bubbles: true }));
                    element.dispatchEvent(new Event('change', { bubbles: true }));
                    if (field.autoBlur) {
                        element.blur();
                    }
                    setTimeout(resolve, field.fillDelay);
                }
            }
            else {
                element.value = decodeHtmlEntities(String(field.value));
                // Trigger change and input events
                element.dispatchEvent(new Event('input', { bubbles: true }));
                element.dispatchEvent(new Event('change', { bubbles: true }));
                if (field.autoBlur) {
                    element.blur();
                }
                setTimeout(resolve, field.fillDelay);
            }
        }
        else {
            resolve();
        }
    });
}
// Setup random string section
function setupRandomStringSection(popup, inputElement, currentUrl) {
    const charsetSelect = popup.querySelector('.charset-select');
    const lengthInput = popup.querySelector('.length-input');
    const enterBtn = popup.querySelector('.enter-btn');
    if (!charsetSelect || !lengthInput || !enterBtn) {
        console.warn('Freak Filler: Random string elements not found');
        return;
    }
    // Load settings
    if (currentSettings?.randomStringCharset) {
        charsetSelect.value = currentSettings.randomStringCharset;
    }
    // Determine length based on priority: length config > element length attribute > default settings
    let determinedLength = currentSettings?.randomStringLength || DEFAULTS.RANDOM_STRING_LENGTH;
    // Check element's length attribute
    const elementLength = inputElement.getAttribute('maxlength') || inputElement.getAttribute('length');
    if (elementLength) {
        const parsedLength = parseInt(elementLength);
        if (!isNaN(parsedLength) && parsedLength > 0) {
            determinedLength = parsedLength;
        }
    }
    // Check length configurations
    storage_service_StorageService.getData().then(data => {
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
            // Fill the input field with the random string
            inputElement.value = randomString;
            // Trigger input and change events to ensure the field registers the change
            inputElement.dispatchEvent(new Event('input', { bubbles: true }));
            inputElement.dispatchEvent(new Event('change', { bubbles: true }));
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
    // Populate the display fields
    testIdDisplay.value = testId;
    selectorDisplay.value = querySelector;
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
        if (querySelector) {
            navigator.clipboard.writeText(querySelector).then(() => {
                showNotification(`Selector copied: ${querySelector}`);
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
    storage_service_StorageService.getData().then(data => {
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
                        inputElement.value = generated;
                        inputElement.dispatchEvent(new Event('input', { bubbles: true }));
                        inputElement.dispatchEvent(new Event('change', { bubbles: true }));
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
// Initialize on load
init();

/******/ })()
;