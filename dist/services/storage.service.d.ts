import { RootData, PageData, Preset, FormFieldData, ExtensionSettings, SavedValue } from '../types';
export declare class StorageService {
    static initialize(): Promise<void>;
    static getData(): Promise<RootData | null>;
    static setData(data: RootData): Promise<void>;
    static getSettings(): Promise<ExtensionSettings | null>;
    static setSettings(settings: ExtensionSettings): Promise<void>;
    static getTheme(): Promise<'light' | 'dark'>;
    static setTheme(theme: 'light' | 'dark'): Promise<void>;
    static getPageByUrl(url: string, matchIdentify: 'exactMatch' | 'prefixMatch'): Promise<PageData | null>;
    static getPageById(pageId: string): Promise<PageData | null>;
    static getCurrentPageData(currentUrl: string): Promise<PageData | null>;
    static addPage(pageData: Omit<PageData, 'id' | 'createdAt' | 'updatedAt'>): Promise<PageData>;
    /**
     * Update a page by its id
     * @param id - Page id
     * @param updates - Partial page data
     */
    static updatePage(id: string, updates: Partial<PageData>): Promise<void>;
    static deletePreset(presetId: string): Promise<void>;
    static addSavedFormData(pageUrl: string, formData: Omit<FormFieldData, 'id' | 'createdAt' | 'updatedAt'>): Promise<void>;
    static deleteSavedFormData(pageUrl: string, savedValueId: string): Promise<void>;
    static getSavedFormDataForField(pageUrl: string, testId: string, querySelector: string): Promise<SavedValue[]>;
    static getPresetsForPage(pageId: string): Promise<Preset[]>;
    static getPageIdsForPreset(presetId: string): Promise<string[]>;
    static getUnlinkedPresets(pageId: string): Promise<Preset[]>;
    static getPresetById(presetId: string): Promise<Preset | null>;
    static addPreset(preset: Omit<Preset, 'id' | 'createdAt' | 'updatedAt'>): Promise<Preset>;
    static updatePreset(presetId: string, updates: Partial<Preset>): Promise<void>;
    static linkPresetToPage(presetId: string, pageId: string): Promise<void>;
    static unlinkPresetFromPage(presetId: string, pageId: string): Promise<void>;
    static getSavedValuesForPage(pageId: string): Promise<SavedValue[]>;
    static addSavedValue(pageId: string, savedValue: Partial<SavedValue>): Promise<SavedValue>;
    static deleteSavedValue(savedValueId: string): Promise<void>;
}
//# sourceMappingURL=storage.service.d.ts.map