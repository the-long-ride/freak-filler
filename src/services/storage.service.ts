import { RootData, PageData, Preset, FormFieldData, ExtensionSettings, SavedValue, SaveItemTarget, ThemeMode, RandomStringCharset } from '../types';
import * as storage from './storage';

export class StorageService {
  static async initialize(): Promise<void> {
    return storage.initialize();
  }

  static async getData(): Promise<RootData | null> {
    return storage.getData();
  }

  static async setData(data: RootData): Promise<void> {
    return storage.setData(data);
  }

  static async getSettings(): Promise<ExtensionSettings | null> {
    return storage.getSettings();
  }

  static async setSettings(settings: ExtensionSettings): Promise<void> {
    return storage.setSettings(settings);
  }

  static async getTheme(): Promise<'light' | 'dark'> {
    return storage.getTheme();
  }

  static async setTheme(theme: 'light' | 'dark'): Promise<void> {
    return storage.setTheme(theme);
  }

  static async getPageByUrl(url: string, matchIdentify: 'exactMatch' | 'prefixMatch'): Promise<PageData | null> {
    return storage.getPageByUrl(url, matchIdentify);
  }

  static async getPageById(pageId: string): Promise<PageData | null> {
    return storage.getPageById(pageId);
  }

  static async getCurrentPageData(currentUrl: string): Promise<PageData | null> {
    return storage.getCurrentPageData(currentUrl);
  }

  static async addPage(pageData: Omit<PageData, 'id' | 'createdAt' | 'updatedAt'>): Promise<PageData> {
    return storage.addPage(pageData);
  }

  static async updatePage(id: string, updates: Partial<PageData>): Promise<void> {
    return storage.updatePage(id, updates);
  }

  static async deletePreset(presetId: string): Promise<void> {
    return storage.deletePreset(presetId);
  }

  static async addSavedFormData(pageUrl: string, formData: Omit<FormFieldData, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    return storage.addSavedFormData(pageUrl, formData);
  }

  static async deleteSavedFormData(pageUrl: string, savedValueId: string): Promise<void> {
    return storage.deleteSavedFormData(pageUrl, savedValueId);
  }

  static async getSavedFormDataForField(pageUrl: string, testId: string, querySelector: string): Promise<SavedValue[]> {
    return storage.getSavedFormDataForField(pageUrl, testId, querySelector);
  }

  static async getPresetsForPage(pageId: string): Promise<Preset[]> {
    return storage.getPresetsForPage(pageId);
  }

  static async getPageIdsForPreset(presetId: string): Promise<string[]> {
    return storage.getPageIdsForPreset(presetId);
  }

  static async getUnlinkedPresets(pageId: string): Promise<Preset[]> {
    return storage.getUnlinkedPresets(pageId);
  }

  static async getPresetById(presetId: string): Promise<Preset | null> {
    return storage.getPresetById(presetId);
  }

  static async addPreset(preset: Omit<Preset, 'id' | 'createdAt' | 'updatedAt'>): Promise<Preset> {
    return storage.addPreset(preset);
  }

  static async updatePreset(presetId: string, updates: Partial<Preset>): Promise<void> {
    return storage.updatePreset(presetId, updates);
  }

  static async linkPresetToPage(presetId: string, pageId: string): Promise<void> {
    return storage.linkPresetToPage(presetId, pageId);
  }

  static async unlinkPresetFromPage(presetId: string, pageId: string): Promise<void> {
    return storage.unlinkPresetFromPage(presetId, pageId);
  }

  static async getSavedValuesForPage(pageId: string): Promise<SavedValue[]> {
    return storage.getSavedValuesForPage(pageId);
  }

  static async addSavedValue(pageId: string, savedValue: Partial<SavedValue>): Promise<SavedValue> {
    return storage.addSavedValue(pageId, savedValue);
  }

  static async deleteSavedValue(savedValueId: string): Promise<void> {
    return storage.deleteSavedValue(savedValueId);
  }
}
