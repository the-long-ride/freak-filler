/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// ./src/utils/helpers.ts
/* unused harmony import specifier */ var CHAR_SETS;
/* unused harmony import specifier */ var LIMITS;
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
const appConstants_LIMITS = (/* unused pure expression or super */ null && ({
    PARENT_SEARCH_DEPTH: 7,
    SAME_ROW_THRESHOLD: 10, // pixels
    DEFAULT_PAGE_SIZE: 25,
    MAX_RETRIES: 3,
    MIN_STRING_LENGTH: 1,
    MAX_STRING_LENGTH: 99999,
    QUANTIFIER_MAX_REPEAT: 10
}));
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
const appConstants_CHAR_SETS = (/* unused pure expression or super */ null && ({
    ALPHABET: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    DIGITS: '0123456789',
    SPECIAL: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    CONTROL: '~`\'"\\/',
    WORD_CHARS: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_'
}));
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

;// ./src/services/storage.service.ts


const STORAGE_KEY = 'formFillerData';
const SETTINGS_KEY = 'formFillerSettings';
class StorageService {
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
        initCyberButtons();
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

;// ./src/pages/page-profile-editor.ts
/* unused harmony import specifier */ var page_profile_editor_StorageService;
/* unused harmony import specifier */ var page_profile_editor_getCurrentTimestamp;
/* unused harmony import specifier */ var page_profile_editor_generateGuid;
/* unused harmony import specifier */ var page_profile_editor_downloadFile;
/* unused harmony import specifier */ var page_profile_editor_escapeHtml;
/* unused harmony import specifier */ var page_profile_editor_createExportFile;
/* unused harmony import specifier */ var page_profile_editor_showToast;
/* unused harmony import specifier */ var page_profile_editor_showModal;
/* unused harmony import specifier */ var page_profile_editor_hideModal;








let currentPageId = '';
let currentPageData = null;
let currentPresetId = null;
let currentPreset = null;
let formDataList = [];
let originalFormDataList = [];
let savedValuesList = [];
let originalSavedValuesList = [];
let draggedRow = null;
let hasUnsavedPresetChanges = false;
let hasUnsavedSavedValuesChanges = false;
let isPresetOnlyMode = false;
// Initialize
async function init() {
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
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    currentPageId = urlParams.get('pageId') || '';
    currentPresetId = urlParams.get('presetId') || null;
    isPresetOnlyMode = !currentPageId;
    if (!isPresetOnlyMode) {
        // Load page data
        currentPageData = await StorageService.getPageById(currentPageId);
        if (!currentPageData) {
            showToast('Page not found', 'error');
            return;
        }
        // Populate page information in sidebar
        document.getElementById('pageId').textContent = currentPageData.id;
        document.getElementById('pageTitle').value = currentPageData.pageTitle;
        document.getElementById('pageUrl').value = currentPageData.url;
        document.getElementById('pageDescription').value = currentPageData.description || '';
        const pageMatchIdentifyEl = document.getElementById('pageMatchIdentify');
        if (pageMatchIdentifyEl)
            pageMatchIdentifyEl.value = currentPageData.matchIdentify;
        // Load presets for this page
        await loadPagePresets();
        // Load saved values for this page
        await loadSavedValues();
        // Setup change tracking for page profile
        setupPageProfileChangeTracking();
    }
    else {
        setupPresetOnlyModeUI();
        await loadPagePresets();
    }
    // Load preset if editing
    if (currentPresetId) {
        await loadPreset();
    }
    else {
        // Set selector to "Create New"
        document.getElementById('presetSelector').value = '';
    }
    // Setup event listeners
    setupEventListeners();
}
function setupPresetOnlyModeUI() {
    // Sidebar shows empty page info and is read-only
    document.querySelectorAll('[data-group="pageInfo"]').forEach(el => el.remove());
    document.querySelectorAll('[data-group="isPresetOnlyMode"]').forEach(el => el.classList.remove('invisible'));
    // Ensure preset tab is active
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    const presetTabBtn = document.querySelector('.tab-btn[data-tab="preset-tab"]');
    if (presetTabBtn)
        presetTabBtn.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    const presetTabContent = document.getElementById('preset-tab');
    if (presetTabContent)
        presetTabContent.classList.add('active');
}
// Load presets for current page
async function loadPagePresets() {
    const presetSelector = document.getElementById('presetSelector');
    if (!presetSelector)
        return;
    const presets = currentPageData
        ? await StorageService.getPresetsForPage(currentPageData.id)
        : (await StorageService.getData())?.presets ?? [];
    // Clear existing options except "Create New"
    presetSelector.innerHTML = '<option value="">Create New Preset</option>';
    // Add presets as options
    presets.forEach(preset => {
        const option = document.createElement('option');
        option.value = preset.id;
        option.textContent = preset.name;
        presetSelector.appendChild(option);
    });
    // Set current selection
    if (currentPresetId) {
        presetSelector.value = currentPresetId;
    }
    // Update link presets button visibility
    await updateLinkPresetsButtonVisibility();
}
// Update visibility of link presets button based on available unlinked presets
async function updateLinkPresetsButtonVisibility() {
    const linkPresetsBtn = document.getElementById('linkPresetsBtn');
    if (!linkPresetsBtn || !currentPageData)
        return;
    const unlinkedPresets = await StorageService.getUnlinkedPresets(currentPageData.id);
    linkPresetsBtn.style.display = unlinkedPresets.length > 0 ? 'block' : 'none';
}
// Load preset for editing
async function loadPreset() {
    if (!currentPresetId)
        return;
    currentPreset = await StorageService.getPresetById(currentPresetId);
    if (!currentPreset)
        return;
    // Update preset selector
    document.getElementById('presetSelector').value = currentPresetId;
    // Show preset ID below selector
    const presetIdDisplay = document.getElementById('presetIdDisplay');
    const presetIdValue = document.getElementById('presetIdValue');
    if (presetIdDisplay && presetIdValue) {
        presetIdValue.textContent = currentPreset.id;
        presetIdDisplay.style.display = 'block';
    }
    // Update name and description in tab
    document.getElementById('presetName').value = currentPreset.name;
    document.getElementById('presetDescription').value = currentPreset.description || '';
    // Load form data
    formDataList = [...currentPreset.formData].sort((a, b) => a.order - b.order);
    originalFormDataList = JSON.parse(JSON.stringify(formDataList)); // Deep copy
    hasUnsavedPresetChanges = false;
    updatePresetButtons();
    renderFormDataTable();
}
function showLinkPresetsToPageModal() {
    if (!currentPageData) {
        showToast('No current page data available', 'error');
        return;
    }
    StorageService.getUnlinkedPresets(currentPageData.id).then((unlinkedPresets) => {
        if (unlinkedPresets.length === 0) {
            showToast('No unlinked presets available', 'info');
            return;
        }
        // Build list items using modal-list classes
        const itemsHtml = unlinkedPresets
            .slice()
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map(p => {
            const created = new Date(p.createdAt).toLocaleString();
            return `
          <label class="modal-list-item">
            <input type="checkbox" class="link-preset-checkbox" value="${p.id}" />
            <div class="meta">
              <div class="title">${escapeHtml(p.name || '(Untitled)')}</div>
              <div class="subtitle">${escapeHtml(p.description || 'No description')}</div>
              <div class="subtitle">Created: ${created}</div>
            </div>
          </label>
        `;
        }).join('');
        const body = `
      <div class="modal-body">
        <div class="modal-selection-counter">Selected: 0 / ${unlinkedPresets.length}</div>
        <div class="modal-list">${itemsHtml}</div>
        <div class="modal-actions">
          <button id="linkPresetsCancelBtn" class="cyber-btn cyber-btn--secondary">
            Cancel
            <span class="cyber-btn__glitch"></span>
            <span class="cyber-btn__label">[esc]</span>
          </button>
          <button id="linkPresetsConfirmBtn" class="cyber-btn">
            Link Presets
            <span class="cyber-btn__glitch"></span>
            <span class="cyber-btn__label">[enter]</span>
          </button>
        </div>
      </div>
    `;
        showModal('Link presets to current page', body, () => { });
        // Update counter when checkboxes change
        const updateCounter = () => {
            const checkedCount = document.querySelectorAll('.link-preset-checkbox:checked').length;
            const totalCount = unlinkedPresets.length;
            const counterEl = document.querySelector('.modal-selection-counter');
            if (counterEl) {
                counterEl.textContent = `Selected: ${checkedCount} / ${totalCount}`;
            }
        };
        // Add change listeners to checkboxes
        document.querySelectorAll('.link-preset-checkbox').forEach(cb => {
            cb.addEventListener('change', updateCounter);
        });
        let actionHandled = false;
        document.getElementById('linkPresetsCancelBtn')?.addEventListener('click', () => {
            if (actionHandled)
                return;
            actionHandled = true;
            hideModal();
        });
        document.getElementById('linkPresetsConfirmBtn')?.addEventListener('click', async () => {
            if (actionHandled)
                return;
            actionHandled = true;
            const selectedPresetIds = [];
            document.querySelectorAll('.link-preset-checkbox:checked').forEach(cb => selectedPresetIds.push(cb.value));
            if (selectedPresetIds.length === 0) {
                showToast('Please choose at least one preset to link', 'warning');
                return;
            }
            for (const presetId of selectedPresetIds) {
                await StorageService.linkPresetToPage(presetId, currentPageData.id);
            }
            hideModal();
            showToast(`Linked ${selectedPresetIds.length} preset(s) to current page`, 'success');
            // Update button visibility and reload presets
            await updateLinkPresetsButtonVisibility();
            await loadPagePresets();
        });
    }).catch((error) => {
        console.error('Failed to load unlinked presets:', error);
        showToast('Failed to load presets. Please try again.', 'error');
    });
}
function showLinkPresetToPagesModal() {
    if (!currentPresetId) {
        showToast('Please save/select a preset first', 'warning');
        return;
    }
    StorageService.getData().then((data) => {
        const pages = data?.pages ?? [];
        if (pages.length === 0) {
            showToast('No pages available to link', 'info');
            return;
        }
        // Build list items using modal-list classes
        const itemsHtml = pages
            .slice()
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map(p => {
            const created = new Date(p.createdAt).toLocaleString();
            return `
          <label class="modal-list-item">
            <input type="checkbox" class="link-page-checkbox" value="${p.id}" />
            <div class="meta">
              <div class="title">${escapeHtml(p.pageTitle || '(Untitled)')}</div>
              <div class="subtitle">${escapeHtml(p.url)}</div>
              <div class="subtitle">Created: ${created}</div>
            </div>
          </label>
        `;
        }).join('');
        const body = `
      <div class="modal-body">
        <div class="modal-selection-counter">Selected: 0 / ${pages.length}</div>
        <div class="modal-list">${itemsHtml}</div>
        <div class="modal-actions">
          <button id="linkPagesCancelBtn" class="cyber-btn cyber-btn--secondary">
            Cancel
            <span class="cyber-btn__glitch"></span>
            <span class="cyber-btn__label">[esc]</span>
          </button>
          <button id="linkPagesConfirmBtn" class="cyber-btn">
            Confirm
            <span class="cyber-btn__glitch"></span>
            <span class="cyber-btn__label">[enter]</span>
          </button>
        </div>
      </div>
    `;
        showModal('Link to exist page(s)', body, () => { });
        // Update counter when checkboxes change
        const updateCounter = () => {
            const checkedCount = document.querySelectorAll('.link-page-checkbox:checked').length;
            const totalCount = pages.length;
            const counterEl = document.querySelector('.modal-selection-counter');
            if (counterEl) {
                counterEl.textContent = `Selected: ${checkedCount} / ${totalCount}`;
            }
        };
        // Add change listeners to checkboxes
        document.querySelectorAll('.link-page-checkbox').forEach(cb => {
            cb.addEventListener('change', updateCounter);
        });
        document.getElementById('linkPagesCancelBtn')?.addEventListener('click', () => hideModal());
        document.getElementById('linkPagesConfirmBtn')?.addEventListener('click', async () => {
            const selectedPageIds = [];
            document.querySelectorAll('.link-page-checkbox:checked').forEach(cb => selectedPageIds.push(cb.value));
            if (selectedPageIds.length === 0) {
                showToast('Please choose at least one page to link', 'warning');
                return;
            }
            for (const pageId of selectedPageIds) {
                await StorageService.linkPresetToPage(currentPresetId, pageId);
            }
            const selectedPages = pages.filter(p => selectedPageIds.includes(p.id));
            let targetPageId = selectedPageIds[0];
            if (selectedPages.length > 1) {
                targetPageId = selectedPages
                    .slice()
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].id;
            }
            hideModal();
            window.location.href = `page-profile-editor.html?pageId=${encodeURIComponent(targetPageId)}&presetId=${encodeURIComponent(currentPresetId)}`;
        });
    }).catch((error) => {
        console.error('Failed to load pages:', error);
        showToast('Failed to load pages. Please try again.', 'error');
    });
}
// Load saved values for current page
async function loadSavedValues() {
    if (!currentPageData)
        return;
    savedValuesList = await StorageService.getSavedValuesForPage(currentPageData.id);
    originalSavedValuesList = JSON.parse(JSON.stringify(savedValuesList)); // Deep copy
    hasUnsavedSavedValuesChanges = false;
    renderSavedValuesTable();
    updateSavedValuesCount();
    updateSavedValuesButtons();
}
// Setup change tracking for page profile
function setupPageProfileChangeTracking() {
    const pageInputs = ['pageTitle', 'pageUrl', 'pageDescription', 'pageMatchIdentify'];
    pageInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', () => {
                updatePageProfileButtons();
            });
            element.addEventListener('change', () => {
                updatePageProfileButtons();
            });
        }
    });
    // Ensure buttons reflect current state (hidden if no changes)
    updatePageProfileButtons();
}
// Update page profile save/cancel button visibility
function updatePageProfileButtons() {
    const hasChanges = checkPageProfileChanges();
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    if (saveBtn)
        saveBtn.style.display = hasChanges ? 'block' : 'none';
    if (cancelBtn)
        cancelBtn.style.display = hasChanges ? 'block' : 'none';
}
// Check if page profile has changes
function checkPageProfileChanges() {
    if (!currentPageData)
        return false;
    const title = document.getElementById('pageTitle').value;
    const url = document.getElementById('pageUrl').value;
    const description = document.getElementById('pageDescription').value;
    const matchIdentifyEl = document.getElementById('pageMatchIdentify');
    const matchIdentify = (matchIdentifyEl?.value ?? 'prefixMatch');
    return title !== currentPageData.pageTitle ||
        url !== currentPageData.url ||
        description !== (currentPageData.description || '') ||
        matchIdentify !== currentPageData.matchIdentify;
}
// Save page profile data
async function savePageProfile() {
    if (!currentPageData)
        return;
    const title = document.getElementById('pageTitle').value.trim();
    const url = document.getElementById('pageUrl').value.trim();
    const description = document.getElementById('pageDescription').value.trim();
    const matchIdentifyEl2 = document.getElementById('pageMatchIdentify');
    const matchIdentify2 = (matchIdentifyEl2?.value ?? 'prefixMatch');
    if (!title || !url) {
        showToast('Title and URL are required', 'warning');
        return;
    }
    currentPageData.pageTitle = title;
    currentPageData.url = url;
    currentPageData.description = description;
    currentPageData.matchIdentify = matchIdentify2;
    currentPageData.updatedAt = getCurrentTimestamp();
    await StorageService.updatePage(currentPageData.id, currentPageData);
    updatePageProfileButtons();
    showToast('Page profile saved successfully', 'success');
}
// Reset page profile data
function resetPageProfile() {
    if (!currentPageData)
        return;
    document.getElementById('pageTitle').value = currentPageData.pageTitle;
    document.getElementById('pageUrl').value = currentPageData.url;
    document.getElementById('pageDescription').value = currentPageData.description || '';
    const pageMatchIdentifyEl2 = document.getElementById('pageMatchIdentify');
    if (pageMatchIdentifyEl2)
        pageMatchIdentifyEl2.value = currentPageData.matchIdentify;
    updatePageProfileButtons();
}
// Save preset data
async function savePresetData() {
    if (!currentPreset)
        return;
    const name = document.getElementById('presetName').value.trim();
    const description = document.getElementById('presetDescription').value.trim();
    if (!name) {
        showToast('Preset name is required', 'warning');
        return;
    }
    currentPreset.name = name;
    currentPreset.description = description;
    currentPreset.formData = [...formDataList];
    currentPreset.updatedAt = getCurrentTimestamp();
    await StorageService.updatePreset(currentPreset.id, currentPreset);
    originalFormDataList = JSON.parse(JSON.stringify(formDataList));
    hasUnsavedPresetChanges = false;
    updatePresetButtons();
    showToast('Preset saved successfully', 'success');
}
// Reset preset data
function resetPresetData() {
    formDataList = JSON.parse(JSON.stringify(originalFormDataList));
    hasUnsavedPresetChanges = false;
    updatePresetButtons();
    renderFormDataTable();
}
// Delete current preset
async function deleteCurrentPreset() {
    if (!currentPreset)
        return;
    if (!await showConfirm('Delete Preset', `Delete preset "${currentPreset.name}"? This cannot be undone.`)) {
        return;
    }
    await StorageService.deletePreset(currentPreset.id);
    // Reset to create new preset mode
    currentPresetId = null;
    currentPreset = null;
    formDataList = [];
    originalFormDataList = [];
    hasUnsavedPresetChanges = false;
    document.getElementById('presetSelector').value = '';
    document.getElementById('presetName').value = '';
    document.getElementById('presetDescription').value = '';
    updatePresetButtons();
    renderFormDataTable();
    showToast('Preset deleted successfully', 'success');
}
// Save saved values data
async function saveSavedValuesData() {
    if (!currentPageData)
        return;
    // Update all saved values for this page
    const data = await StorageService.getData();
    if (!data)
        return;
    // Remove old saved values for this page
    data.savedValues = data.savedValues.filter(sv => sv.pageId !== currentPageId);
    // Add updated saved values
    data.savedValues.push(...savedValuesList);
    await StorageService.setData(data);
    originalSavedValuesList = JSON.parse(JSON.stringify(savedValuesList));
    hasUnsavedSavedValuesChanges = false;
    updateSavedValuesButtons();
    showToast('Saved values saved successfully', 'success');
}
// Reset saved values data
function resetSavedValuesData() {
    savedValuesList = JSON.parse(JSON.stringify(originalSavedValuesList));
    hasUnsavedSavedValuesChanges = false;
    renderSavedValuesTable();
    updateSavedValuesButtons();
}
// Update preset buttons visibility
function updatePresetButtons() {
    const hasChanges = hasUnsavedPresetChanges || checkPresetInfoChanges();
    const saveBtn = document.getElementById('savePresetBtn');
    const rollbackBtn = document.getElementById('rollbackPresetBtn');
    const deleteBtn = document.getElementById('deletePresetBtn');
    if (saveBtn)
        saveBtn.style.display = hasChanges ? 'inline-block' : 'none';
    if (rollbackBtn)
        rollbackBtn.style.display = hasChanges ? 'inline-block' : 'none';
    if (deleteBtn)
        deleteBtn.style.display = currentPreset ? 'inline-block' : 'none';
}
// Check if preset info (name/description) has changes
function checkPresetInfoChanges() {
    if (!currentPreset)
        return false;
    const name = document.getElementById('presetName').value;
    const description = document.getElementById('presetDescription').value;
    return name !== currentPreset.name || description !== (currentPreset.description || '');
}
// Update saved values buttons visibility
function updateSavedValuesButtons() {
    const hasChanges = hasUnsavedSavedValuesChanges || JSON.stringify(savedValuesList) !== JSON.stringify(originalSavedValuesList);
    const saveBtn = document.getElementById('saveSavedValuesBtn');
    const rollbackBtn = document.getElementById('rollbackSavedValuesBtn');
    if (saveBtn)
        saveBtn.style.display = hasChanges ? 'inline-block' : 'none';
    if (rollbackBtn)
        rollbackBtn.style.display = hasChanges ? 'inline-block' : 'none';
}
// Setup event listeners
function setupEventListeners() {
    // Preset selector change
    document.getElementById('presetSelector')?.addEventListener('change', async (e) => {
        const select = e.target;
        const newPresetId = select.value;
        if (newPresetId === currentPresetId)
            return;
        // Warn if there are unsaved preset changes (saved-values edits shouldn't block switching presets)
        if (hasUnsavedPresetChanges) {
            if (!await showConfirm('Unsaved Changes', 'You have unsaved preset changes. Do you want to discard them and switch preset?')) {
                select.value = currentPresetId || '';
                return;
            }
        }
        if (currentPageData) {
            if (newPresetId) {
                // Switch to existing preset
                window.location.href = `page-profile-editor.html?pageId=${currentPageId}&presetId=${newPresetId}`;
            }
            else {
                // Create new preset
                window.location.href = `page-profile-editor.html?pageId=${currentPageId}`;
            }
            return;
        }
        // Preset-only mode navigation
        if (newPresetId) {
            window.location.href = `page-profile-editor.html?presetId=${newPresetId}`;
        }
        else {
            window.location.href = 'page-profile-editor.html';
        }
    });
    // Preset name/description change tracking
    document.getElementById('presetName')?.addEventListener('input', () => {
        updatePresetButtons();
    });
    document.getElementById('presetDescription')?.addEventListener('input', () => {
        updatePresetButtons();
    });
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetTab = e.target.closest('.tab-btn')?.getAttribute('data-tab');
            if (targetTab)
                switchTab(targetTab);
        });
    });
    if (currentPageData) {
        // Add saved value button
        document.getElementById('addSavedValueBtn')?.addEventListener('click', () => {
            addSavedValueRow();
            // Scroll saved values container to bottom after row rendered
            setTimeout(() => {
                const tbody = document.getElementById('savedValuesBody');
                if (!tbody)
                    return;
                // Find nearest table container
                const container = tbody.closest('.table-container');
                if (container) {
                    container.scrollTop = container.scrollHeight;
                }
                else {
                    // fallback: scroll the table itself
                    const table = document.getElementById('savedValuesTable');
                    if (table)
                        table.scrollIntoView({ behavior: 'smooth', block: 'end' });
                }
            }, 50);
        });
        // Export/import saved values
        document.getElementById('exportSavedValuesBtn')?.addEventListener('click', async () => {
            await exportSavedValues();
        });
        // Sidebar Link Presets button (link presets to current page)
        document.getElementById('linkPresetsBtn')?.addEventListener('click', () => {
            showLinkPresetsToPageModal();
        });
        document.getElementById('importSavedValuesBtn')?.addEventListener('click', () => {
            const fileInput = document.getElementById('importSavedValuesFile');
            fileInput.click();
        });
        document.getElementById('importSavedValuesFile')?.addEventListener('change', async (e) => {
            const input = e.target;
            if (input.files && input.files[0]) {
                await importSavedValues(input.files[0]);
                input.value = '';
            }
        });
    }
    document.getElementById('backBtn')?.addEventListener('click', () => {
        window.close();
    });
    document.getElementById('addFormDataBtn')?.addEventListener('click', () => {
        addFormDataRow();
    });
    // Preset tab buttons
    document.getElementById('savePresetBtn')?.addEventListener('click', async () => {
        await savePresetData();
    });
    document.getElementById('rollbackPresetBtn')?.addEventListener('click', async () => {
        if (await showConfirm('Rollback Changes', 'Are you sure? Unsaved changes will be lost.')) {
            resetPresetData();
        }
    });
    document.getElementById('deletePresetBtn')?.addEventListener('click', async () => {
        await deleteCurrentPreset();
        // Reload current page to reset state
        if (currentPageData) {
            window.location.href = `page-profile-editor.html?pageId=${currentPageData.id}`;
        }
        else {
            window.location.href = `./html/settings.html`;
        }
    });
    // Saved values tab buttons
    if (currentPageData) {
        document.getElementById('saveSavedValuesBtn')?.addEventListener('click', async () => {
            await saveSavedValuesData();
        });
        document.getElementById('rollbackSavedValuesBtn')?.addEventListener('click', async () => {
            if (await showConfirm('Rollback Changes', 'Are you sure? Unsaved changes will be lost.')) {
                resetSavedValuesData();
                // Ensure buttons hide after rollback
                updateSavedValuesButtons();
            }
        });
        document.getElementById('saveBtn')?.addEventListener('click', async () => {
            await savePageProfile();
        });
        document.getElementById('cancelBtn')?.addEventListener('click', async () => {
            if (await showConfirm('Cancel Changes', 'Are you sure? Unsaved changes will be lost.')) {
                resetPageProfile();
            }
        });
        document.getElementById('exportBtn')?.addEventListener('click', async () => {
            await exportPageData();
        });
    }
    // New preset import/export buttons
    document.getElementById('exportPresetJsonBtn')?.addEventListener('click', async () => {
        await showPresetExportSelectionModal();
    });
    document.getElementById('importPresetJsonBtn')?.addEventListener('click', () => {
        const fileInput = document.getElementById('importPresetFile');
        fileInput.click();
    });
    document.getElementById('importPresetFile')?.addEventListener('change', async (e) => {
        const input = e.target;
        if (input.files && input.files[0]) {
            await importPresetFromJson(input.files[0]);
            input.value = ''; // Reset file input
        }
    });
    document.getElementById('linkPresetToPagesBtn')?.addEventListener('click', () => {
        showLinkPresetToPagesModal();
    });
    // Settings button (open settings page in new tab)
    document.getElementById('settingsBtn')?.addEventListener('click', () => {
        try {
            chrome.tabs.create({ url: chrome.runtime.getURL('./html/settings.html') });
        }
        catch (e) {
            // Fallback for contexts where chrome.tabs might not be available
            window.open('./html/settings.html', '_blank');
        }
    });
}
// Add new form data row
function addFormDataRow(data) {
    const newData = data || {
        id: generateGuid(),
        type: 'text',
        title: '',
        value: '',
        testId: '',
        querySelector: '',
        fillDelay: 0,
        autoBlur: true,
        createdAt: getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp(),
        order: formDataList.length + 1
    };
    formDataList.push(newData);
    renderFormDataTable();
    if (!data) {
        hasUnsavedPresetChanges = true;
        updateButtonVisibility();
    }
    // Scroll to bottom and highlight new row
    setTimeout(() => {
        const tbody = document.getElementById('formDataBody');
        const newRow = tbody?.querySelector(`tr[data-id="${newData.id}"]`);
        if (newRow) {
            newRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            newRow.classList.add('highlight-new');
            setTimeout(() => newRow.classList.remove('highlight-new'), 2000);
        }
    }, 100);
}
// Render form data table
function renderFormDataTable() {
    const tbody = document.getElementById('formDataBody');
    tbody.innerHTML = '';
    formDataList.forEach((data, index) => {
        const row = document.createElement('tr');
        row.setAttribute('data-id', data.id);
        row.setAttribute('draggable', 'true');
        // Generate value cell based on type
        let valueCell = '';
        if (data.type === 'checkbox') {
            const checked = data.value === true || data.value === 'true' ? 'checked' : '';
            valueCell = `<label class="toggle-switch"><input type="checkbox" class="value-checkbox" ${checked} data-id="${data.id}" /><span class="toggle-slider"></span></label>`;
        }
        else if (data.type === 'radio') {
            valueCell = `<input type="text" class="value-input" value="${escapeHtml(String(data.value || ''))}" data-id="${data.id}" placeholder="Radio value" />`;
        }
        else if (data.type === 'range' || data.type === 'number') {
            valueCell = `<input type="number" class="value-input" value="${escapeHtml(String(data.value || ''))}" data-id="${data.id}" />`;
        }
        else if (data.type === 'color') {
            const colorValue = data.value || '#000000';
            valueCell = `
        <div class="color-input-group">
          <input type="color" class="value-color-picker" value="${escapeHtml(String(colorValue))}" data-id="${data.id}" />
          <input type="text" class="value-color-text" value="${escapeHtml(String(colorValue))}" data-id="${data.id}" placeholder="#000000" />
        </div>`;
        }
        else if (data.type === 'datepicker') {
            valueCell = `<input type="date" class="value-input" value="${escapeHtml(String(data.value || ''))}" data-id="${data.id}" />`;
        }
        else if (data.type === 'htmlEditor') {
            valueCell = `<textarea class="value-input html-editor-value" rows="3" data-id="${data.id}" placeholder="HTML content">${escapeHtml(String(data.value || ''))}</textarea>`;
        }
        else if (data.type === 'dynamicDate') {
            // Parse existing value or use defaults
            let years = 0, months = 0, days = 0;
            try {
                if (data.value) {
                    const parsed = JSON.parse(String(data.value));
                    years = parsed.years || 0;
                    months = parsed.months || 0;
                    days = parsed.days || 0;
                }
            }
            catch (e) {
                // Use defaults if parsing fails
            }
            valueCell = `
        <div class="dynamic-date-group">
          <span class="dynamic-date-label">Current date + </span>
          <input type="number" class="value-dynamic-years" value="${years}" data-id="${data.id}" placeholder="0" />
          <span class="dynamic-date-label">years</span>
          <input type="number" class="value-dynamic-months" value="${months}" data-id="${data.id}" placeholder="0" />
          <span class="dynamic-date-label">months</span>
          <input type="number" class="value-dynamic-days" value="${days}" data-id="${data.id}" placeholder="0" />
          <span class="dynamic-date-label">days</span>
        </div>`;
        }
        else if (data.type === 'clickable') {
            valueCell = `
        <div class="clickable-input-group">
          <span class="clickable-label">wait for</span>
          <input type="number" class="value-clickable-delay" value="${escapeHtml(String(data.value || '0'))}" min="1" max="30000" step="100" data-id="${data.id}" placeholder="0" />
          <span class="clickable-label">(ms) before clicking</span>
        </div>`;
        }
        else {
            valueCell = `<input type="text" class="value-input" value="${escapeHtml(String(data.value || ''))}" data-id="${data.id}" />`;
        }
        row.innerHTML = `
      <td class="order-cell">
        <span class="drag-handle" title="Drag to reorder">⋮⋮</span>
        <span class="order-number">${data.order}</span>
        <div class="order-actions">
          <button class="btn-order-action" data-action="insert" data-id="${data.id}" title="Insert row below">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
          <button class="btn-order-action" data-action="clone" data-id="${data.id}" title="Clone row below">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
          <button class="btn-order-action" data-action="move" data-id="${data.id}" title="Move to position">
            <svg 
              width="14" height="14"
              shape-rendering="geometricPrecision" 
              text-rendering="geometricPrecision" 
              image-rendering="optimizeQuality" 
              fill-rule="evenodd" 
              clip-rule="evenodd" 
              viewBox="0 0 320 512.29"
              fill="currentColor"
            >
                <path 
                    fill-rule="nonzero" 
                    d="M51.49 169.41h218.18L163.39 40.96 51.49 169.41zM16.1 310.66h287.79c8.9 0 16.11 7.21 16.11 16.11 0 4.18-1.59 7.98-4.2 10.85L176.1 506.46c-5.66 6.85-15.82 7.8-22.66 2.14l-1.88-1.83L3.96 337.34c-5.84-6.7-5.14-16.88 1.57-22.71a16.09 16.09 0 0 1 10.57-3.97zm253.57 32.22H51.49l111.9 128.45 106.28-128.45zm34.22-141.25H16.1c-3.75 0-7.52-1.31-10.57-3.96-6.71-5.84-7.41-16.01-1.57-22.72L151.55 5.52l1.89-1.83c6.84-5.66 17-4.7 22.66 2.14l139.7 168.84c2.61 2.87 4.2 6.68 4.2 10.85 0 8.9-7.21 16.11-16.11 16.11z"
                />
            </svg>
          </button>
          <button class="btn-order-action btn-share-action" data-id="${data.id}" title="Share row to other presets" data-icons="Share"></button>
        </div>
      </td>
      <td><input type="text" class="title-input" value="${escapeHtml(data.title || '')}" data-id="${data.id}" placeholder="Field title" /></td>
      <td>
        <select class="type-select" data-id="${data.id}">
          <option value="text" ${data.type === 'text' ? 'selected' : ''}>Text</option>
          <option value="search" ${data.type === 'search' ? 'selected' : ''}>Search</option>
          <option value="checkbox" ${data.type === 'checkbox' ? 'selected' : ''}>Checkbox</option>
          <option value="dropdown" ${data.type === 'dropdown' ? 'selected' : ''}>Dropdown</option>
          <option value="datepicker" ${data.type === 'datepicker' ? 'selected' : ''}>Datepicker</option>
          <option value="radio" ${data.type === 'radio' ? 'selected' : ''}>Radio</option>
          <option value="range" ${data.type === 'range' ? 'selected' : ''}>Range</option>
          <option value="number" ${data.type === 'number' ? 'selected' : ''}>Number</option>
          <option value="color" ${data.type === 'color' ? 'selected' : ''}>Color</option>
          <option value="htmlEditor" ${data.type === 'htmlEditor' ? 'selected' : ''}>HTML Editor</option>
          <option value="dynamicDate" ${data.type === 'dynamicDate' ? 'selected' : ''}>Dynamic Date</option>
          <option value="clickable" ${data.type === 'clickable' ? 'selected' : ''}>Click on</option>
        </select>
      </td>
      <td class="value-cell">${valueCell}</td>
      <td><input type="text" class="testid-input" value="${escapeHtml(data.testId || '')}" data-id="${data.id}" placeholder="data-testid" /></td>
      <td><input type="text" class="querySelector-input" value="${escapeHtml(data.querySelector || '')}" data-id="${data.id}" placeholder="CSS selector" /></td>
      <td><input type="number" class="delay-input" value="${data.fillDelay || 0}" min="0" max="30000" step="100" data-id="${data.id}" placeholder="0" /></td>
      <td><button class="action-btn action-btn--delete" data-id="${data.id}" title="Delete row" data-icons="Trash"></button></td>
    `;
        // Add drag events
        row.addEventListener('dragstart', handleDragStart);
        row.addEventListener('dragover', handleDragOver);
        row.addEventListener('drop', handleDrop);
        row.addEventListener('dragend', handleDragEnd);
        tbody.appendChild(row);
    });
    // Add event listeners
    addTableEventListeners();
    // Update form data count
    const formDataCountEl = document.getElementById('formDataCount');
    if (formDataCountEl) {
        formDataCountEl.textContent = buildQuantityString(formDataList.length);
    }
}
// Add event listeners to table inputs
function addTableEventListeners() {
    document.querySelectorAll('.title-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const id = e.target.getAttribute('data-id');
            const value = e.target.value;
            updateFormData(id, { title: value });
        });
    });
    document.querySelectorAll('.type-select').forEach(select => {
        select.addEventListener('change', (e) => {
            const id = e.target.getAttribute('data-id');
            const value = e.target.value;
            updateFormData(id, { type: value });
            renderFormDataTable(); // Re-render to show correct value input
        });
    });
    document.querySelectorAll('.value-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const id = e.target.getAttribute('data-id');
            const value = e.target.value;
            updateFormData(id, { value: value });
        });
    });
    document.querySelectorAll('.value-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const id = e.target.getAttribute('data-id');
            const value = e.target.checked;
            updateFormData(id, { value: value });
        });
    });
    // Color picker input synchronization
    document.querySelectorAll('.value-color-picker').forEach(picker => {
        picker.addEventListener('input', (e) => {
            const id = e.target.getAttribute('data-id');
            const value = e.target.value;
            // Update the corresponding text input
            const textInput = document.querySelector(`.value-color-text[data-id="${id}"]`);
            if (textInput) {
                textInput.value = value;
            }
            updateFormData(id, { value: value });
        });
    });
    // Clickable delay input
    document.querySelectorAll('.value-clickable-delay').forEach(input => {
        input.addEventListener('input', (e) => {
            const id = e.target.getAttribute('data-id');
            const value = parseInt(e.target.value) || 0;
            updateFormData(id, { value: value });
        });
    });
    // Color text input synchronization
    document.querySelectorAll('.value-color-text').forEach(textInput => {
        textInput.addEventListener('input', (e) => {
            const id = e.target.getAttribute('data-id');
            let value = e.target.value.trim();
            // Add # prefix if not present and value looks like a hex color
            if (value && !value.startsWith('#') && /^[0-9A-Fa-f]{6}$/.test(value)) {
                value = '#' + value;
                e.target.value = value;
            }
            // Update the corresponding color picker if valid hex color
            if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
                const colorPicker = document.querySelector(`.value-color-picker[data-id="${id}"]`);
                if (colorPicker) {
                    colorPicker.value = value;
                }
                updateFormData(id, { value: value });
            }
        });
    });
    document.querySelectorAll('.testid-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const id = e.target.getAttribute('data-id');
            const value = e.target.value;
            updateFormData(id, { testId: value });
        });
    });
    document.querySelectorAll('.querySelector-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const id = e.target.getAttribute('data-id');
            const value = e.target.value;
            updateFormData(id, { querySelector: value });
        });
    });
    document.querySelectorAll('.delay-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const id = e.target.getAttribute('data-id');
            const value = parseInt(e.target.value) || 0;
            updateFormData(id, { fillDelay: Math.min(value, 30000) });
        });
    });
    // Dynamic date input event listeners
    const updateDynamicDateValue = (id) => {
        const yearsInput = document.querySelector(`.value-dynamic-years[data-id="${id}"]`);
        const monthsInput = document.querySelector(`.value-dynamic-months[data-id="${id}"]`);
        const daysInput = document.querySelector(`.value-dynamic-days[data-id="${id}"]`);
        if (yearsInput && monthsInput && daysInput) {
            const years = parseInt(yearsInput.value) || 0;
            const months = parseInt(monthsInput.value) || 0;
            const days = parseInt(daysInput.value) || 0;
            const value = JSON.stringify({ years, months, days });
            updateFormData(id, { value });
        }
    };
    document.querySelectorAll('.value-dynamic-years, .value-dynamic-months, .value-dynamic-days').forEach(input => {
        input.addEventListener('input', (e) => {
            const id = e.target.getAttribute('data-id');
            if (id)
                updateDynamicDateValue(id);
        });
    });
    document.querySelectorAll('.action-btn--delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            deleteFormDataRow(id);
        });
    });
    document.querySelectorAll('.btn-order-action').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.currentTarget;
            const id = target.getAttribute('data-id');
            const action = target.getAttribute('data-action');
            if (action === 'insert') {
                insertRowBelow(id);
            }
            else if (action === 'clone') {
                cloneRowBelow(id);
            }
            else if (action === 'move') {
                moveRowToPosition(id);
            }
        });
    });
    // Share action (clone to selected presets)
    document.querySelectorAll('.btn-share-action').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            if (id)
                openShareRowModal(id);
        });
    });
}
// Update form data
function updateFormData(id, updates) {
    const index = formDataList.findIndex(f => f.id === id);
    if (index !== -1) {
        formDataList[index] = {
            ...formDataList[index],
            ...updates,
            updatedAt: getCurrentTimestamp()
        };
        hasUnsavedPresetChanges = true;
        updatePresetButtons();
    }
}
// Delete form data row
function deleteFormDataRow(id) {
    formDataList = formDataList.filter(f => f.id !== id);
    reorderFormData();
    renderFormDataTable();
    hasUnsavedPresetChanges = true;
    updatePresetButtons();
}
// Reset form data to original state
function resetFormData() {
    formDataList = JSON.parse(JSON.stringify(originalFormDataList));
    hasUnsavedPresetChanges = false;
    updatePresetButtons();
    // Reload UI
    document.getElementById('presetName').value = currentPreset?.name || '';
    document.getElementById('presetDescription').value = currentPreset?.description || '';
    renderFormDataTable();
}
// Update button visibility based on unsaved changes
function updateButtonVisibility() {
    updatePresetButtons();
    updateSavedValuesButtons();
}
// Insert new row below
function insertRowBelow(id) {
    const index = formDataList.findIndex(f => f.id === id);
    if (index === -1)
        return;
    const newData = {
        id: generateGuid(),
        type: 'text',
        title: '',
        value: '',
        testId: '',
        querySelector: '',
        fillDelay: 0,
        autoBlur: true,
        createdAt: getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp(),
        order: index + 2
    };
    formDataList.splice(index + 1, 0, newData);
    reorderFormData();
    renderFormDataTable();
    hasUnsavedPresetChanges = true;
    updateButtonVisibility();
    // Highlight new row
    setTimeout(() => {
        const newRow = document.querySelector(`tr[data-id="${newData.id}"]`);
        if (newRow) {
            newRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            newRow.classList.add('highlight-new');
            setTimeout(() => newRow.classList.remove('highlight-new'), 2000);
        }
    }, 100);
}
// Clone row below
function cloneRowBelow(id) {
    const index = formDataList.findIndex(f => f.id === id);
    if (index === -1)
        return;
    const sourceData = formDataList[index];
    const clonedData = {
        ...sourceData,
        id: generateGuid(),
        createdAt: getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp(),
        order: index + 2
    };
    formDataList.splice(index + 1, 0, clonedData);
    reorderFormData();
    renderFormDataTable();
    hasUnsavedPresetChanges = true;
    updateButtonVisibility();
    // Highlight cloned row
    setTimeout(() => {
        const newRow = document.querySelector(`tr[data-id="${clonedData.id}"]`);
        if (newRow) {
            newRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            newRow.classList.add('highlight-new');
            setTimeout(() => newRow.classList.remove('highlight-new'), 2000);
        }
    }, 100);
}
// Move row to specified position
function moveRowToPosition(id) {
    const currentIndex = formDataList.findIndex(f => f.id === id);
    if (currentIndex === -1)
        return;
    const body = `
    <div class="modal-body">
      <p>Enter the new position for this row (1 to ${formDataList.length}):</p>
      <input class="modal-input" type="number" id="movePositionInput" min="1" max="${formDataList.length}" value="${currentIndex + 1}" />
      <div class="modal-actions">
        <button id="moveCancelBtn" class="cyber-btn cyber-btn--secondary">
          Cancel
          <span class="cyber-btn__glitch"></span>
          <span class="cyber-btn__label">[esc]</span>
        </button>
        <button id="moveConfirmBtn" class="cyber-btn">
          Move
          <span class="cyber-btn__glitch"></span>
          <span class="cyber-btn__label">[enter]</span>
        </button>
      </div>
    </div>
  `;
    showModal('Move row to new position', body, () => { });
    document.getElementById('moveCancelBtn')?.addEventListener('click', () => hideModal());
    document.getElementById('moveConfirmBtn')?.addEventListener('click', () => {
        const inputEl = document.getElementById('movePositionInput');
        const newPos = parseInt(inputEl.value);
        if (isNaN(newPos) || newPos < 1 || newPos > formDataList.length) {
            showToast('Invalid position', 'error');
            return;
        }
        // Move the item
        const item = formDataList.splice(currentIndex, 1)[0];
        formDataList.splice(newPos - 1, 0, item);
        reorderFormData();
        renderFormDataTable();
        hasUnsavedPresetChanges = true;
        updatePresetButtons();
        hideModal();
    });
}
// Open modal to select target presets and share (clone) a row into them
async function openShareRowModal(rowId) {
    const sourceField = formDataList.find(f => f.id === rowId);
    if (!sourceField) {
        showToast('Field not found', 'error');
        return;
    }
    try {
        const data = await StorageService.getData();
        const allPresets = data?.presets ?? [];
        // Exclude current preset
        const targets = allPresets.filter(p => p.id !== currentPresetId);
        if (targets.length === 0) {
            showToast('No other presets available to share to', 'info');
            return;
        }
        const itemsHtml = targets.map(p => {
            const fieldsCount = (p.formData || []).length;
            return `
        <label class="modal-list-item">
          <input type="checkbox" class="share-preset-checkbox" value="${p.id}" />
          <div class="meta">
            <div class="title">${escapeHtml(p.name || '(Untitled)')}</div>
            <div class="subtitle">${escapeHtml(p.description || '')}</div>
            <div class="subtitle">Fields: ${fieldsCount}</div>
          </div>
        </label>
      `;
        }).join('');
        const body = `
      <div class="modal-body">
        <div class="modal-selection-counter">Selected: 0 / ${targets.length}</div>
        <div class="modal-list">${itemsHtml}</div>
        <div class="modal-actions">
          <button id="shareCancelBtn" class="cyber-btn cyber-btn--secondary">Cancel<span class="cyber-btn__glitch"></span></button>
          <button id="shareConfirmBtn" class="cyber-btn">Confirm<span class="cyber-btn__glitch"></span></button>
        </div>
      </div>
    `;
        showModal('Share Field To Presets', body, () => { });
        // Update counter when checkboxes change
        const updateCounter = () => {
            const checkedCount = document.querySelectorAll('.share-preset-checkbox:checked').length;
            const totalCount = targets.length;
            const counterEl = document.querySelector('.modal-selection-counter');
            if (counterEl) {
                counterEl.textContent = `Selected: ${checkedCount} / ${totalCount}`;
            }
        };
        // Add change listeners to checkboxes
        document.querySelectorAll('.share-preset-checkbox').forEach(cb => {
            cb.addEventListener('change', updateCounter);
        });
        document.getElementById('shareCancelBtn')?.addEventListener('click', () => hideModal());
        document.getElementById('shareConfirmBtn')?.addEventListener('click', async () => {
            const selected = [];
            document.querySelectorAll('.share-preset-checkbox:checked').forEach(cb => selected.push(cb.value));
            if (selected.length === 0) {
                showToast('Please choose at least one preset', 'warning');
                return;
            }
            try {
                for (const presetId of selected) {
                    const preset = await StorageService.getPresetById(presetId);
                    if (!preset)
                        continue;
                    const newField = {
                        ...sourceField,
                        id: generateGuid(),
                        createdAt: getCurrentTimestamp(),
                        updatedAt: getCurrentTimestamp(),
                        order: (preset.formData?.length || 0) + 1
                    };
                    const updatedFormData = [...(preset.formData || []), newField];
                    await StorageService.updatePreset(presetId, { formData: updatedFormData });
                }
                hideModal();
                showToast(`Field shared to ${selected.length} preset(s)`, 'success');
            }
            catch (err) {
                console.error('Failed to share field:', err);
                showToast('Failed to share field. Please try again.', 'error');
            }
        });
    }
    catch (err) {
        console.error('Failed to load presets:', err);
        showToast('Failed to load presets. Please try again.', 'error');
    }
}
// Reorder form data after changes
function reorderFormData() {
    formDataList.forEach((item, index) => {
        item.order = index + 1;
        item.updatedAt = getCurrentTimestamp();
    });
}
// Drag and drop handlers
function handleDragStart(e) {
    // Prevent drag if user is focused on an input element
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'SELECT' || activeElement.tagName === 'TEXTAREA')) {
        e.preventDefault();
        return;
    }
    draggedRow = e.currentTarget;
    draggedRow.classList.add('dragging');
    if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
    }
}
function handleDragOver(e) {
    e.preventDefault();
    if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move';
    }
    const target = e.currentTarget;
    // Remove drag-over class from all rows first
    document.querySelectorAll('#formDataTable tbody tr').forEach(row => {
        row.classList.remove('drag-over');
    });
    // Add drag-over class to current target if it's not the dragged row
    if (draggedRow && target !== draggedRow) {
        target.classList.add('drag-over');
    }
}
function handleDrop(e) {
    e.preventDefault();
    const target = e.currentTarget;
    target.classList.remove('drag-over');
    if (!draggedRow || target === draggedRow)
        return;
    const draggedId = draggedRow.getAttribute('data-id');
    const targetId = target.getAttribute('data-id');
    if (!draggedId || !targetId)
        return;
    const draggedIndex = formDataList.findIndex(f => f.id === draggedId);
    const targetIndex = formDataList.findIndex(f => f.id === targetId);
    if (draggedIndex === -1 || targetIndex === -1)
        return;
    // Reorder array
    const [removed] = formDataList.splice(draggedIndex, 1);
    formDataList.splice(targetIndex, 0, removed);
    reorderFormData();
    renderFormDataTable();
    hasUnsavedPresetChanges = true;
    updateButtonVisibility();
}
function handleDragEnd(e) {
    const target = e.currentTarget;
    target.classList.remove('dragging');
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    draggedRow = null;
}
// Export page data (full page profile including presets and saved values)
async function exportPageData() {
    if (!currentPageData)
        return;
    const page = currentPageData;
    const presets = await StorageService.getPresetsForPage(page.id);
    const savedValues = await StorageService.getSavedValuesForPage(page.id);
    const data = await StorageService.getData();
    const presetIds = new Set(presets.map(p => p.id));
    const presetPageLinks = (data?.presetPageLinks ?? []).filter(link => link.pageId === page.id && presetIds.has(link.presetId));
    const exportFile = createExportFile({
        included: {
            pages: true,
            presets: true,
            presetPageLinks: true,
            savedValues: true,
        },
        data: {
            pages: [page],
            presets,
            presetPageLinks,
            savedValues,
        },
    });
    const filename = page.pageTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    downloadFile(JSON.stringify(exportFile, null, 2), `${filename}_page_profile.json`);
    showToast('Page profile exported and downloaded', 'success');
}
// Export preset only to JSON
function exportPresetOnly() {
    const name = document.getElementById('presetName').value || 'preset';
    const description = document.getElementById('presetDescription').value;
    const exportedAt = page_profile_editor_getCurrentTimestamp();
    const preset = {
        id: `export-${page_profile_editor_generateGuid()}`,
        name,
        description,
        formData: formDataList,
        createdAt: exportedAt,
        updatedAt: exportedAt,
    };
    const exportFile = page_profile_editor_createExportFile({
        included: { presets: true },
        data: { presets: [preset] },
        exportedAt,
    });
    page_profile_editor_downloadFile(JSON.stringify(exportFile, null, 2), `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_preset.json`);
    page_profile_editor_showToast('Preset exported and downloaded', 'success');
}
// Import preset from JSON and create new preset
async function importPresetFromJson(file) {
    try {
        const text = await file.text();
        const imported = parseExtensionExportJson(text);
        if (!imported.included.presets || !Array.isArray(imported.data.presets) || imported.data.presets.length === 0) {
            showToast('Invalid import file: presets section not included', 'error');
            return;
        }
        if (!currentPageData) {
            showToast('No page data available', 'error');
            return;
        }
        // Get current data to check for duplicates
        const data = await StorageService.getData();
        if (!data)
            return;
        let importedCount = 0;
        let ignoredCount = 0;
        let firstImportedPresetId = null;
        // Process each preset in the import file
        for (const presetToImport of imported.data.presets) {
            // Check if preset already exists with same ID
            const existingPreset = data.presets.find(p => p.id === presetToImport.id);
            if (existingPreset) {
                // Duplicate found, ignore it
                ignoredCount++;
                continue;
            }
            // Create new preset with imported data (ignore exported ids/timestamps)
            const newPreset = await StorageService.addPreset({
                name: presetToImport.name || 'Imported Preset',
                description: presetToImport.description || '',
                formData: (presetToImport.formData || []).map((field, index) => ({
                    id: generateGuid(),
                    type: field.type || 'text',
                    title: field.title || '',
                    value: field.value || '',
                    testId: field.testId || '',
                    querySelector: field.querySelector || '',
                    fillDelay: field.fillDelay || 0,
                    autoBlur: field.autoBlur ?? true,
                    createdAt: getCurrentTimestamp(),
                    updatedAt: getCurrentTimestamp(),
                    order: index + 1
                }))
            });
            // Link to current page
            await StorageService.linkPresetToPage(newPreset.id, currentPageData.id);
            // Track first imported preset for redirect
            if (!firstImportedPresetId) {
                firstImportedPresetId = newPreset.id;
            }
            importedCount++;
        }
        // Show summary notification
        if (importedCount === 0 && ignoredCount > 0) {
            showToast(`All ${ignoredCount} preset(s) already exist (same IDs). If the duplicated ones are owned by another page, try to link them to there. Finally: Import skipped.`, 'info');
        }
        else if (importedCount > 0 && ignoredCount === 0) {
            showToast(`${importedCount} preset(s) imported successfully.`, 'success');
        }
        else if (importedCount > 0 && ignoredCount > 0) {
            showToast(`${importedCount} preset(s) imported, ${ignoredCount} duplicate(s) ignored. If the duplicated ones are owned by another page, try to link them to there.`, 'success');
        }
        // Reload the page with the first imported preset (or just current page if none imported)
        if (firstImportedPresetId) {
            window.location.href = `page-profile-editor.html?pageId=${currentPageData.id}&presetId=${firstImportedPresetId}`;
        }
    }
    catch (error) {
        console.error('Import error:', error);
        showToast('Failed to import preset. Please check the file format.', 'error');
    }
}
// Save preset
async function savePreset() {
    const name = document.getElementById('presetName').value;
    const description = document.getElementById('presetDescription').value;
    if (!name) {
        page_profile_editor_showToast('Preset name is required', 'warning');
        return false;
    }
    // Sort form data by order
    formDataList.sort((a, b) => a.order - b.order);
    if (!currentPageData) {
        page_profile_editor_showToast('Page data not found', 'error');
        return false;
    }
    if (currentPresetId && currentPreset) {
        // Update existing preset
        await page_profile_editor_StorageService.updatePreset(currentPresetId, {
            name,
            description,
            formData: formDataList
        });
    }
    else {
        // Create new preset
        const newPreset = await page_profile_editor_StorageService.addPreset({
            name,
            description,
            formData: formDataList
        });
        // Link to current page
        await page_profile_editor_StorageService.linkPresetToPage(newPreset.id, currentPageData.id);
    }
    await loadPagePresets(); // Refresh preset list
    return true;
}
// Save all data (preset + saved values)
async function saveAllData() {
    // Save preset
    const presetSaved = await savePreset();
    if (!presetSaved)
        return;
    // Save saved values
    await saveSavedValues();
    hasUnsavedPresetChanges = false;
    hasUnsavedSavedValuesChanges = false;
    updateButtonVisibility();
    page_profile_editor_showToast('All changes saved successfully!', 'success');
}
// Save saved values
async function saveSavedValues() {
    if (!currentPageData)
        return;
    // Update all saved values for this page
    const data = await page_profile_editor_StorageService.getData();
    if (!data)
        return;
    // Remove old saved values for this page
    data.savedValues = data.savedValues.filter(sv => sv.pageId !== currentPageId);
    // Add updated saved values
    data.savedValues.push(...savedValuesList);
    await page_profile_editor_StorageService.setData(data);
    originalSavedValuesList = JSON.parse(JSON.stringify(savedValuesList));
}
// Tab switching
function switchTab(tabId) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === tabId);
    });
}
// Add new saved value row
function addSavedValueRow(data) {
    const newData = data || {
        id: generateGuid(),
        pageId: currentPageId,
        label: '',
        value: '',
        testId: '',
        querySelector: '',
        createdAt: getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp()
    };
    savedValuesList.push(newData);
    renderSavedValuesTable();
    updateSavedValuesCount();
    hasUnsavedSavedValuesChanges = true;
    updateButtonVisibility();
    // Highlight and scroll to the new saved value row similar to preset editor
    setTimeout(() => {
        const newRow = document.querySelector(`tr[data-id="${newData.id}"]`);
        if (newRow) {
            const tbody = document.getElementById('savedValuesBody');
            const container = tbody?.closest('.table-container');
            if (container)
                container.scrollTop = container.scrollHeight;
            else
                newRow.scrollIntoView({ behavior: 'smooth', block: 'end' });
            newRow.classList.add('highlight-new');
            setTimeout(() => newRow.classList.remove('highlight-new'), 2000);
        }
    }, 100);
}
// Render saved values table
function renderSavedValuesTable() {
    const tbody = document.getElementById('savedValuesBody');
    if (!tbody)
        return;
    if (savedValuesList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 24px;">No saved values yet</td></tr>';
        return;
    }
    tbody.innerHTML = '';
    savedValuesList.forEach((data, index) => {
        const row = document.createElement('tr');
        row.setAttribute('data-id', data.id);
        const formattedDate = new Date(data.updatedAt).toLocaleString('en-US', {
            year: '2-digit',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        row.innerHTML = `
      <td>
        <input 
          type="text" 
          class="table-input" 
          value="${data.label}" 
          data-field="label"
          placeholder="Field label"
        />
      </td>
      <td>
        <input 
          type="text" 
          class="table-input" 
          value="${data.value}" 
          data-field="value"
          placeholder="Saved value"
        />
      </td>
      <td>
        <input 
          type="text" 
          class="table-input" 
          value="${data.testId || ''}" 
          data-field="testId"
          placeholder="data-testid"
        />
      </td>
      <td>
        <input 
          type="text" 
          class="table-input" 
          value="${data.querySelector || ''}" 
          data-field="querySelector"
          placeholder="CSS selector"
        />
      </td>
      <td style="color: var(--text-secondary); font-size: 11px;">
        ${formattedDate}
      </td>
      <td>
        <button class="action-btn action-btn--delete" data-id="${data.id}" title="Delete" data-icons="Trash"></button>
      </td>
    `;
        tbody.appendChild(row);
    });
    // Add event listeners for inputs
    tbody.querySelectorAll('.table-input').forEach(input => {
        input.addEventListener('input', handleSavedValueInputChange);
        input.addEventListener('blur', () => { hasUnsavedSavedValuesChanges = true; updateSavedValuesButtons(); });
    });
    // Add event listeners for delete buttons
    tbody.querySelectorAll('.action-btn--delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            if (id)
                await deleteSavedValue(id);
        });
    });
    // Update saved values count
    updateSavedValuesCount();
}
// Update saved values count (separate function to reuse)
function updateSavedValuesCount() {
    const el = document.getElementById('savedValuesCount');
    if (!el)
        return;
    el.textContent = buildQuantityString(savedValuesList.length);
}
// Handle saved value input change
function handleSavedValueInputChange(e) {
    const input = e.target;
    const row = input.closest('tr');
    if (!row)
        return;
    const id = row.getAttribute('data-id');
    if (!id)
        return;
    const field = input.getAttribute('data-field');
    if (!field)
        return;
    const savedValue = savedValuesList.find(d => d.id === id);
    if (!savedValue)
        return;
    // Update the data
    savedValue[field] = input.value;
    savedValue.updatedAt = getCurrentTimestamp();
    hasUnsavedSavedValuesChanges = true;
    updateSavedValuesButtons();
}
// Delete saved value
async function deleteSavedValue(id) {
    if (!await showConfirm('Delete Saved Value', 'Are you sure you want to delete this saved value?'))
        return;
    const index = savedValuesList.findIndex(d => d.id === id);
    if (index === -1)
        return;
    savedValuesList.splice(index, 1);
    renderSavedValuesTable();
    updateSavedValuesCount();
    hasUnsavedSavedValuesChanges = true;
    updateSavedValuesButtons();
}
// Export saved values to JSON
async function exportSavedValues() {
    if (!currentPageData) {
        showToast('No page selected', 'warning');
        return;
    }
    if (savedValuesList.length === 0) {
        showToast('No saved values to export', 'info');
        return;
    }
    const exportFile = createExportFile({
        included: { pages: true, savedValues: true },
        data: { pages: [currentPageData], savedValues: savedValuesList },
    });
    downloadFile(JSON.stringify(exportFile, null, 2), `saved-values-${currentPageData.pageTitle.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.json`);
    showToast('Saved values exported and downloaded', 'success');
}
// Import saved values from JSON
async function importSavedValues(file) {
    if (!currentPageData) {
        showToast('No page selected', 'warning');
        return;
    }
    try {
        const text = await file.text();
        const imported = parseExtensionExportJson(text);
        if (!imported.included.savedValues || !Array.isArray(imported.data.savedValues)) {
            showToast('Invalid import file: savedValues section not included', 'error');
            return;
        }
        let addedCount = 0;
        let skippedCount = 0;
        let updatedCount = 0;
        const addedIds = [];
        for (const value of imported.data.savedValues) {
            // Check for duplicate by testId AND querySelector
            const existing = savedValuesList.find(v => v.testId === value.testId && v.querySelector === value.querySelector);
            if (existing) {
                // Ask user if they want to overwrite
                const overwrite = await showConfirm('Overwrite Saved Value', `A saved value with testId="${value.testId}" and querySelector="${value.querySelector}" already exists.\n\n` +
                    `Current value: "${existing.value}"\n` +
                    `Imported value: "${value.value}"\n\n` +
                    `Do you want to overwrite it?`);
                if (overwrite) {
                    existing.label = value.label;
                    existing.value = value.value;
                    existing.testId = value.testId;
                    existing.querySelector = value.querySelector;
                    existing.updatedAt = getCurrentTimestamp();
                    updatedCount++;
                }
                else {
                    skippedCount++;
                }
            }
            else {
                // Add new saved value with new ID
                const newValue = {
                    ...value,
                    id: generateGuid(),
                    pageId: currentPageData.id,
                    createdAt: getCurrentTimestamp(),
                    updatedAt: getCurrentTimestamp()
                };
                savedValuesList.push(newValue);
                addedIds.push(newValue.id);
                addedCount++;
            }
        }
        renderSavedValuesTable();
        hasUnsavedSavedValuesChanges = true;
        updateSavedValuesButtons();
        updateSavedValuesCount();
        // Highlight the most recently added saved value (if any)
        if (addedIds.length > 0) {
            setTimeout(() => {
                const lastId = addedIds[addedIds.length - 1];
                const newRow = document.querySelector(`tr[data-id="${lastId}"]`);
                if (newRow) {
                    const tbody = document.getElementById('savedValuesBody');
                    const container = tbody?.closest('.table-container');
                    if (container)
                        container.scrollTop = container.scrollHeight;
                    else
                        newRow.scrollIntoView({ behavior: 'smooth', block: 'end' });
                    newRow.classList.add('highlight-new');
                    setTimeout(() => newRow.classList.remove('highlight-new'), 2000);
                }
            }, 100);
        }
        showToast(`Import complete: Added: ${addedCount}, Updated: ${updatedCount}, Skipped: ${skippedCount}`, 'success');
    }
    catch (error) {
        console.error('Import saved values error:', error);
        showToast('Failed to import saved values. Please check the file format.', 'error');
    }
}
// Show export selection modal for page profile
async function showExportSelectionModal() {
    if (!currentPageData)
        return;
    const page = currentPageData;
    const presets = await page_profile_editor_StorageService.getPresetsForPage(page.id);
    const savedValues = await page_profile_editor_StorageService.getSavedValuesForPage(page.id);
    const modalContent = `
    <div class="export-selection">
      <p>Select what you want to export for this page profile:</p>
      
      <div class="export-options">
        <label class="export-option">
          <input type="checkbox" id="exportPage" checked>
          <span class="checkmark"></span>
          Page Information (${page_profile_editor_escapeHtml(page.pageTitle)})
        </label>
        
        <label class="export-option">
          <input type="checkbox" id="exportPresets" checked>
          <span class="checkmark"></span>
          Presets (${presets.length} items)
        </label>
        
        <label class="export-option">
          <input type="checkbox" id="exportSavedValues" checked>
          <span class="checkmark"></span>
          Saved Values (${savedValues.length} items)
        </label>
      </div>
      
      <div class="modal-actions">
        <button id="cancelExportBtn" class="cyber-btn cyber-btn--secondary">
          Cancel
          <span class="cyber-btn__glitch"></span>
          <span class="cyber-btn__label">[esc]</span>
        </button>
        <button id="selectAllBtn" class="cyber-btn cyber-btn--secondary">
          Select All
          <span class="cyber-btn__glitch"></span>
          <span class="cyber-btn__label">all</span>
        </button>
        <button id="exportSelectedBtn" class="cyber-btn">
        Export Selected
          <span class="cyber-btn__glitch"></span>
          <span class="cyber-btn__label">[enter]</span>
        </button>
      </div>
    </div>
  `;
    page_profile_editor_showModal('Export Page Profile', modalContent);
    // Handle select all button
    document.getElementById('selectAllBtn')?.addEventListener('click', () => {
        const checkboxes = document.querySelectorAll('.export-selection input[type="checkbox"]');
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        checkboxes.forEach(cb => {
            cb.checked = !allChecked;
        });
    });
    // Handle export selected button
    document.getElementById('exportSelectedBtn')?.addEventListener('click', async () => {
        const exportPage = document.getElementById('exportPage').checked;
        const exportPresets = document.getElementById('exportPresets').checked;
        const exportSavedValues = document.getElementById('exportSavedValues').checked;
        if (!exportPage && !exportPresets && !exportSavedValues) {
            page_profile_editor_showToast('Please select at least one item to export', 'warning');
            return;
        }
        page_profile_editor_hideModal();
        await performExport(exportPage, exportPresets, exportSavedValues);
    });
    // Handle cancel button
    document.getElementById('cancelExportBtn')?.addEventListener('click', () => {
        page_profile_editor_hideModal();
    });
}
// Show preset export selection modal for current page presets
async function showPresetExportSelectionModal() {
    if (!currentPageData)
        return;
    const presets = await StorageService.getPresetsForPage(currentPageData.id);
    if (presets.length === 0) {
        showToast('No presets available for this page', 'info');
        return;
    }
    const modalContent = `
    <div class="export-selection">
      <p>Select presets to export:</p>
      <div class="modal-selection-counter">Selected: ${presets.length} / ${presets.length}</div>
      
      <div class="preset-selection-list">
        <label class="export-option select-all-option">
          <input type="checkbox" id="selectAllPresets" checked>
          <span class="checkmark"></span>
          <strong>Select All Presets</strong>
        </label>
        
        <div class="preset-list">
          ${presets.map(preset => `
            <label class="export-option preset-option">
              <input type="checkbox" class="preset-checkbox" value="${preset.id}" checked>
              <span class="checkmark"></span>
              <div class="preset-card">
                <div class="preset-title">${escapeHtml(preset.name)}</div>
                ${preset.description ? `<div class="preset-card-description">${escapeHtml(preset.description)}</div>` : '<div class="preset-card-description">No description</div>'}
              </div>
            </label>
          `).join('')}
        </div>
      </div>
      
      <div class="modal-actions">
        <button id="cancelPresetExportBtn" class="cyber-btn cyber-btn--secondary">
          Cancel
          <span class="cyber-btn__glitch"></span>
          <span class="cyber-btn__label">[esc]</span>
        </button>
        <button id="exportSelectedPresetsBtn" class="cyber-btn">
          Export Selected
          <span class="cyber-btn__glitch"></span>
          <span class="cyber-btn__label">[enter]</span>
        </button>
      </div>
    </div>
  `;
    showModal('Export Presets', modalContent);
    // Update counter function
    const updateCounter = () => {
        const checkedCount = document.querySelectorAll('.preset-checkbox:checked').length;
        const totalCount = presets.length;
        const counterEl = document.querySelector('.modal-selection-counter');
        if (counterEl) {
            counterEl.textContent = `Selected: ${checkedCount} / ${totalCount}`;
        }
    };
    // Handle select all checkbox
    document.getElementById('selectAllPresets')?.addEventListener('change', (e) => {
        const checked = e.target.checked;
        const checkboxes = document.querySelectorAll('.preset-checkbox');
        checkboxes.forEach(cb => cb.checked = checked);
        updateCounter();
    });
    // Handle individual checkbox changes to update select all state
    document.querySelectorAll('.preset-checkbox').forEach(cb => {
        cb.addEventListener('change', () => {
            const allCheckboxes = document.querySelectorAll('.preset-checkbox');
            const selectAllCheckbox = document.getElementById('selectAllPresets');
            const allChecked = Array.from(allCheckboxes).every(cb => cb.checked);
            const noneChecked = Array.from(allCheckboxes).every(cb => !cb.checked);
            selectAllCheckbox.checked = allChecked;
            selectAllCheckbox.indeterminate = !allChecked && !noneChecked;
            updateCounter();
        });
    });
    // Handle export selected button
    document.getElementById('exportSelectedPresetsBtn')?.addEventListener('click', async () => {
        const selectedIds = Array.from(document.querySelectorAll('.preset-checkbox:checked'))
            .map(cb => cb.value);
        if (selectedIds.length === 0) {
            showToast('Please select at least one preset to export', 'warning');
            return;
        }
        const selectedPresets = presets.filter(preset => selectedIds.includes(preset.id));
        hideModal();
        await performPresetExport(selectedPresets);
    });
    // Handle cancel button
    document.getElementById('cancelPresetExportBtn')?.addEventListener('click', () => {
        hideModal();
    });
}
// Perform the actual export based on selections
async function performExport(includePage, includePresets, includeSavedValues) {
    if (!currentPageData)
        return;
    const page = currentPageData;
    const presets = includePresets ? await page_profile_editor_StorageService.getPresetsForPage(page.id) : [];
    const savedValues = includeSavedValues ? await page_profile_editor_StorageService.getSavedValuesForPage(page.id) : [];
    const data = await page_profile_editor_StorageService.getData();
    const presetIds = new Set(presets.map(p => p.id));
    const presetPageLinks = includePresets ? (data?.presetPageLinks ?? []).filter(link => link.pageId === page.id && presetIds.has(link.presetId)) : [];
    const included = {};
    const exportData = {};
    if (includePage) {
        included.pages = true;
        exportData.pages = [page];
    }
    if (includePresets) {
        included.presets = true;
        included.presetPageLinks = true;
        exportData.presets = presets;
        exportData.presetPageLinks = presetPageLinks;
    }
    if (includeSavedValues) {
        included.savedValues = true;
        exportData.savedValues = savedValues;
    }
    const exportFile = page_profile_editor_createExportFile({
        included,
        data: exportData,
    });
    const filename = page.pageTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const selectedItems = [];
    if (includePage)
        selectedItems.push('page');
    if (includePresets)
        selectedItems.push('presets');
    if (includeSavedValues)
        selectedItems.push('saved values');
    page_profile_editor_downloadFile(JSON.stringify(exportFile, null, 2), `${filename}_page_profile.json`);
    page_profile_editor_showToast(`Selected ${selectedItems.join(', ')} exported and downloaded`, 'success');
}
// Perform the actual preset export
async function performPresetExport(selectedPresets) {
    if (!currentPageData)
        return;
    const exportFile = createExportFile({
        included: { presets: true },
        data: { presets: selectedPresets }
    });
    const filename = currentPageData.pageTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    downloadFile(JSON.stringify(exportFile, null, 2), `${filename}_presets.json`);
    showToast(`${selectedPresets.length} preset${selectedPresets.length === 1 ? '' : 's'} exported and downloaded`, 'success');
}
// Initialize
init();

/******/ })()
;