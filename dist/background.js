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

;// ./src/background/background.ts

// Store the last clicked element info
let lastClickedElement = null;
// Initialize storage when extension is installed
chrome.runtime.onInstalled.addListener(async () => {
    await StorageService.initialize();
    console.log('Freak Filler extension installed and initialized');
    // Check and add order values to regex patterns if missing
    const data = await StorageService.getData();
    if (data && data.regexPatterns && data.regexPatterns.length > 0) {
        let needsUpdate = false;
        data.regexPatterns.forEach((pattern, index) => {
            if (pattern.order === undefined) {
                pattern.order = index + 1;
                needsUpdate = true;
            }
        });
        if (needsUpdate) {
            await StorageService.setData(data);
            console.log('Migrated regex patterns with order values');
        }
    }
    // Create context menus
    chrome.contextMenus.create({
        id: 'showFillingAssistant',
        title: 'Open Filling Assistant',
        contexts: ['editable']
    });
    chrome.contextMenus.create({
        id: 'getElementSelector',
        title: 'Get element query selector',
        contexts: ['all']
    });
});
// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (!tab?.id)
        return;
    const tabId = tab.id;
    if (info.menuItemId === 'showFillingAssistant') {
        // Check settings before sending message
        StorageService.getSettings().then(settings => {
            const enabled = settings?.enableSaveValue || settings?.enableImportValue || settings?.enableLiveAssistant || settings?.enableRandomStringInAssistant;
            if (!enabled) {
                console.log('Assistant disabled by settings; not opening from context menu');
                return;
            }
            // Send message to content script to show assistant
            try {
                chrome.tabs.sendMessage(tabId, { action: 'showAssistantFromContextMenu' });
            }
            catch (error) {
                console.warn('Failed to show assistant:', error);
            }
        }).catch(err => {
            console.warn('Failed to read settings before showing assistant:', err);
        });
    }
    else if (info.menuItemId === 'getElementSelector') {
        // Send message to content script to get and copy selector
        chrome.tabs.sendMessage(tab.id, {
            action: 'getElementSelector'
        }).catch(error => {
            console.warn('Failed to get selector:', error);
        });
    }
});
// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getData') {
        StorageService.getData().then(data => {
            sendResponse({ data });
        });
        return true; // Keep the message channel open for async response
    }
});

/******/ })()
;