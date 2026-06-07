import { RootData, PageData, Preset, FormFieldData, ExtensionSettings, SavedValue, SaveItemTarget, ThemeMode, RandomStringCharset } from '../../types';
import { getCurrentTimestamp, generateUniqueId } from '../../utils/helpers';
import { DEFAULTS, DEFAULT_REGEX_PATTERNS } from '../../constants/appConstants';
import { SETTINGS_KEY, STORAGE_KEY } from './keys';
import { StorageService } from '../storage.service';

export async function initialize(): Promise<void> {
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
            defaultSaveItemTo: DEFAULTS.DEFAULT_SAVE_ITEM_TO as SaveItemTarget,
            theme: DEFAULTS.THEME as ThemeMode,
            enableLocatorRetriever: DEFAULTS.ENABLE_LOCATOR_RETRIEVER,
            enableRegexPattern: DEFAULTS.ENABLE_REGEX_PATTERN,
            enableRandomStringSectionInPopup: DEFAULTS.ENABLE_RANDOM_STRING_SECTION,
            enableRandomStringInAssistant: DEFAULTS.ENABLE_RANDOM_STRING_IN_ASSISTANT,
            randomStringCharset: DEFAULTS.RANDOM_STRING_CHARSET as RandomStringCharset,
            randomStringLength: DEFAULTS.RANDOM_STRING_LENGTH
        });
    }
}

export async function getData(): Promise<RootData | null> {
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
                        data.pages.forEach((page: any) => {
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

export async function setData(data: RootData): Promise<void> {
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

export async function getSettings(): Promise<ExtensionSettings | null> {
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
                            migratedSettings.randomStringCharset = DEFAULTS.RANDOM_STRING_CHARSET as RandomStringCharset;
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

export async function setSettings(settings: ExtensionSettings): Promise<void> {
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

export async function getTheme(): Promise<'light' | 'dark'> {
    const settings = await StorageService.getSettings();
    return settings?.theme || 'dark';
}

export async function setTheme(theme: 'light' | 'dark'): Promise<void> {
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
            defaultSaveItemTo: DEFAULTS.DEFAULT_SAVE_ITEM_TO as SaveItemTarget,
            theme,
            enableLocatorRetriever: DEFAULTS.ENABLE_LOCATOR_RETRIEVER,
            enableRegexPattern: DEFAULTS.ENABLE_REGEX_PATTERN,
            enableRandomStringSectionInPopup: DEFAULTS.ENABLE_RANDOM_STRING_SECTION,
            enableRandomStringInAssistant: DEFAULTS.ENABLE_RANDOM_STRING_IN_ASSISTANT,
            randomStringCharset: DEFAULTS.RANDOM_STRING_CHARSET as RandomStringCharset,
            randomStringLength: DEFAULTS.RANDOM_STRING_LENGTH
        });
    }
}
