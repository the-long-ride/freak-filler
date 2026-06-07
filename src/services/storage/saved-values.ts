import { RootData, PageData, Preset, FormFieldData, ExtensionSettings, SavedValue, SaveItemTarget, ThemeMode, RandomStringCharset } from '../../types';
import { getCurrentTimestamp, generateUniqueId } from '../../utils/helpers';
import { DEFAULTS, DEFAULT_REGEX_PATTERNS } from '../../constants/appConstants';
import { SETTINGS_KEY, STORAGE_KEY } from './keys';
import { StorageService } from '../storage.service';

export async function addSavedFormData(pageUrl: string, formData: Omit<FormFieldData, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const data = await StorageService.getData();
    if (!data)
        return;
    const page = data.pages.find(p => p.url === pageUrl);
    if (!page)
        return;
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
    await StorageService.setData(data);
}

export async function deleteSavedFormData(pageUrl: string, savedValueId: string): Promise<void> {
    const data = await StorageService.getData();
    if (!data)
        return;
    const page = data.pages.find(p => p.url === pageUrl);
    if (!page)
        return;
    data.savedValues = data.savedValues.filter(sv => !(sv.pageId === page.id && sv.id === savedValueId));
    await StorageService.setData(data);
}

export async function getSavedFormDataForField(pageUrl: string, testId: string, querySelector: string): Promise<SavedValue[]> {
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

export async function getSavedValuesForPage(pageId: string): Promise<SavedValue[]> {
    const data = await StorageService.getData();
    if (!data)
        return [];
    return data.savedValues.filter(sv => sv.pageId === pageId);
}

export async function addSavedValue(pageId: string, savedValue: Partial<SavedValue>): Promise<SavedValue> {
    const data = await StorageService.getData();
    if (!data)
        throw new Error('No data');
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

export async function deleteSavedValue(savedValueId: string): Promise<void> {
    const data = await StorageService.getData();
    if (!data)
        return;
    data.savedValues = data.savedValues.filter(sv => sv.id !== savedValueId);
    await StorageService.setData(data);
}
