import { RootData, PageData, Preset, FormFieldData, ExtensionSettings, SavedValue, SaveItemTarget, ThemeMode, RandomStringCharset } from '../types';
import { getCurrentTimestamp, generateUniqueId } from '../utils/helpers';
import { DEFAULTS, DEFAULT_REGEX_PATTERNS } from '../constants/appConstants';

const STORAGE_KEY = 'formFillerData';
const SETTINGS_KEY = 'formFillerSettings';

export class StorageService {
  // Initialize storage with default data
  static async initialize(): Promise<void> {
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

  // Get all data
  static async getData(): Promise<RootData | null> {
    try {
      if (!chrome.runtime?.id) {
        console.warn('Extension context invalidated');
        return null;
      }
      return new Promise((resolve, reject) => {
        chrome.storage.local.get([STORAGE_KEY], (result) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
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
                this.setData(data).catch(err => console.error('Migration save failed:', err));
              }
            }
            
            resolve(data);
          }
        });
      });
    } catch (error) {
      console.warn('Storage access failed:', error);
      return null;
    }
  }

  // Set all data
  static async setData(data: RootData): Promise<void> {
    try {
      if (!chrome.runtime?.id) {
        console.warn('Extension context invalidated');
        return;
      }
      return new Promise((resolve, reject) => {
        chrome.storage.local.set({ [STORAGE_KEY]: data }, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      console.warn('Storage write failed:', error);
    }
  }

  // Get settings
  static async getSettings(): Promise<ExtensionSettings | null> {
    try {
      if (!chrome.runtime?.id) {
        console.warn('Extension context invalidated');
        return null;
      }
      return new Promise((resolve, reject) => {
        chrome.storage.local.get([SETTINGS_KEY], (result) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
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
    } catch (error) {
      console.warn('Settings access failed:', error);
      return null;
    }
  }

  // Set settings
  static async setSettings(settings: ExtensionSettings): Promise<void> {
    try {
      if (!chrome.runtime?.id) {
        console.warn('Extension context invalidated');
        return;
      }
      return new Promise((resolve, reject) => {
        chrome.storage.local.set({ [SETTINGS_KEY]: settings }, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      console.warn('Settings write failed:', error);
    }
  }

  // Get current theme
  static async getTheme(): Promise<'light' | 'dark'> {
    const settings = await this.getSettings();
    return settings?.theme || 'dark';
  }

  // Set theme
  static async setTheme(theme: 'light' | 'dark'): Promise<void> {
    const settings = await this.getSettings();
    if (settings) {
      settings.theme = theme;
      await this.setSettings(settings);
    } else {
      await this.setSettings({
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

  // Get page data by URL
  static async getPageByUrl(url: string, matchIdentify: 'exactMatch' | 'prefixMatch'): Promise<PageData | null> {
    const data = await this.getData();
    if (!data) return null;

    return data.pages.find(page => {
      if (matchIdentify === 'exactMatch') {
        return page.url === url;
      } else {
        return url.startsWith(page.url);
      }
    }) || null;
  }

  // Get page data by ID
  static async getPageById(pageId: string): Promise<PageData | null> {
    const data = await this.getData();
    if (!data) return null;

    return data.pages.find(page => page.id === pageId) || null;
  }

  // Get page data matching current URL
  static async getCurrentPageData(currentUrl: string): Promise<PageData | null> {
    const data = await this.getData();
    if (!data) return null;

    // First try exact match
    let page = data.pages.find(p => p.matchIdentify === 'exactMatch' && p.url === currentUrl);
    
    // Then try startsWith match
    if (!page) {
      page = data.pages.find(p => p.matchIdentify === 'prefixMatch' && currentUrl.startsWith(p.url));
    }

    return page || null;
  }

  // Add new page
  static async addPage(pageData: Omit<PageData, 'id' | 'createdAt' | 'updatedAt'>): Promise<PageData> {
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
    
    const newPage: PageData = {
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
  static async updatePage(id: string, updates: Partial<PageData>): Promise<void> {
    const data = await this.getData();
    if (!data) return;

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
  static async deletePreset(presetId: string): Promise<void> {
    const data = await this.getData();
    if (!data) return;

    // Remove preset
    data.presets = data.presets.filter(p => p.id !== presetId);
    
    // Remove all links to this preset
    data.presetPageLinks = data.presetPageLinks.filter(link => link.presetId !== presetId);
    
    await this.setData(data);
  }

  // Add saved form data
  static async addSavedFormData(pageUrl: string, formData: Omit<FormFieldData, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const data = await this.getData();
    if (!data) return;

    const page = data.pages.find(p => p.url === pageUrl);
    if (!page) return;

    // Generate unique ID that doesn't collide with existing saved value IDs
    const existingIds = data.savedValues.map(sv => sv.id);

    const newSavedValue: SavedValue = {
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
  static async deleteSavedFormData(pageUrl: string, savedValueId: string): Promise<void> {
    const data = await this.getData();
    if (!data) return;

    const page = data.pages.find(p => p.url === pageUrl);
    if (!page) return;

    data.savedValues = data.savedValues.filter(sv => 
      !(sv.pageId === page.id && sv.id === savedValueId)
    );
    
    await this.setData(data);
  }

  // Get saved form data matching input field  
  static async getSavedFormDataForField(pageUrl: string, testId: string, querySelector: string): Promise<SavedValue[]> {
    const page = await this.getCurrentPageData(pageUrl);
    if (!page) return [];

    const data = await this.getData();
    if (!data) return [];

    const savedValuesForPage = data.savedValues.filter(sv => sv.pageId === page.id);
    
    return savedValuesForPage
      .filter(sv => sv.testId === testId || sv.querySelector === querySelector);
  }

  // Get presets for a page by page ID
  static async getPresetsForPage(pageId: string): Promise<Preset[]> {
    const data = await this.getData();
    if (!data) return [];

    // Get preset IDs linked to this page
    const linkedPresetIds = data.presetPageLinks
      .filter(link => link.pageId === pageId)
      .map(link => link.presetId);

    // Get the actual presets
    return data.presets.filter(preset => linkedPresetIds.includes(preset.id));
  }

  // Get page IDs linked to a preset
  static async getPageIdsForPreset(presetId: string): Promise<string[]> {
    const data = await this.getData();
    if (!data) return [];

    return data.presetPageLinks
      .filter(link => link.presetId === presetId)
      .map(link => link.pageId);
  }

  // Get all presets not linked to a specific page
  static async getUnlinkedPresets(pageId: string): Promise<Preset[]> {
    const data = await this.getData();
    if (!data) return [];

    // Get preset IDs linked to this page
    const linkedPresetIds = data.presetPageLinks
      .filter(link => link.pageId === pageId)
      .map(link => link.presetId);

    // Get presets that are NOT linked to this page
    return data.presets.filter(preset => !linkedPresetIds.includes(preset.id));
  }

  // Get preset by ID
  static async getPresetById(presetId: string): Promise<Preset | null> {
    const data = await this.getData();
    if (!data) return null;

    const preset = data.presets.find(p => p.id === presetId);
    return preset || null;
  }

  // Add preset
  static async addPreset(preset: Omit<Preset, 'id' | 'createdAt' | 'updatedAt'>): Promise<Preset> {
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
    
    const newPreset: Preset = {
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
  static async updatePreset(presetId: string, updates: Partial<Preset>): Promise<void> {
    const data = await this.getData();
    if (!data) return;

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
  static async linkPresetToPage(presetId: string, pageId: string): Promise<void> {
    const data = await this.getData();
    if (!data) return;

    // Check if link already exists
    const existingLink = data.presetPageLinks.find(
      link => link.presetId === presetId && link.pageId === pageId
    );

    if (!existingLink) {
      data.presetPageLinks.push({ presetId, pageId });
      await this.setData(data);
    }
  }
  // Unlink preset from page
  static async unlinkPresetFromPage(presetId: string, pageId: string): Promise<void> {
    const data = await this.getData();
    if (!data) return;

    data.presetPageLinks = data.presetPageLinks.filter(
      link => !(link.presetId === presetId && link.pageId === pageId)
    );
    
    await this.setData(data);
  }
  // Get saved values for a page
  static async getSavedValuesForPage(pageId: string): Promise<SavedValue[]> {
    const data = await this.getData();
    if (!data) return [];

    return data.savedValues.filter(sv => sv.pageId === pageId);
  }

  // Add saved value
  static async addSavedValue(pageId: string, savedValue: Partial<SavedValue>): Promise<SavedValue> {
    const data = await this.getData();
    if (!data) throw new Error('No data');

    // Generate unique ID if not provided
    const existingIds = data.savedValues.map(sv => sv.id);
    const newId = savedValue.id && !existingIds.includes(savedValue.id) 
      ? savedValue.id 
      : generateUniqueId(existingIds);

    // Create the saved value
    const newSavedValue: SavedValue = {
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
    const existingIndex = data.savedValues.findIndex(
      sv => sv.pageId === pageId && sv.id === newSavedValue.id
    );

    if (existingIndex !== -1) {
      // Update existing saved value
      data.savedValues[existingIndex] = newSavedValue;
    } else {
      // Add new saved value
      data.savedValues.push(newSavedValue);
    }

    await this.setData(data);
    return newSavedValue;
  }

  // Delete saved value
  static async deleteSavedValue(savedValueId: string): Promise<void> {
    const data = await this.getData();
    if (!data) return;

    data.savedValues = data.savedValues.filter(sv => sv.id !== savedValueId);
    await this.setData(data);
  }
}
