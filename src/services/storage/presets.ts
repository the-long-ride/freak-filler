import { RootData, PageData, Preset, FormFieldData, ExtensionSettings, SavedValue, SaveItemTarget, ThemeMode, RandomStringCharset } from '../../types';
import { getCurrentTimestamp, generateUniqueId } from '../../utils/helpers';
import { DEFAULTS, DEFAULT_REGEX_PATTERNS } from '../../constants/appConstants';
import { SETTINGS_KEY, STORAGE_KEY } from './keys';
import { StorageService } from '../storage.service';

export async function deletePreset(presetId: string): Promise<void> {
    const data = await StorageService.getData();
    if (!data)
        return;
    // Remove preset
    data.presets = data.presets.filter(p => p.id !== presetId);
    // Remove all links to this preset
    data.presetPageLinks = data.presetPageLinks.filter(link => link.presetId !== presetId);
    await StorageService.setData(data);
}

export async function getPresetsForPage(pageId: string): Promise<Preset[]> {
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

export async function getPageIdsForPreset(presetId: string): Promise<string[]> {
    const data = await StorageService.getData();
    if (!data)
        return [];
    return data.presetPageLinks
        .filter(link => link.presetId === presetId)
        .map(link => link.pageId);
}

export async function getUnlinkedPresets(pageId: string): Promise<Preset[]> {
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

export async function getPresetById(presetId: string): Promise<Preset | null> {
    const data = await StorageService.getData();
    if (!data)
        return null;
    const preset = data.presets.find(p => p.id === presetId);
    return preset || null;
}

export async function addPreset(preset: Omit<Preset, 'id' | 'createdAt' | 'updatedAt'>): Promise<Preset> {
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
    const newPreset: Preset = {
        ...preset,
        id: generateUniqueId(existingIds),
        createdAt: getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp()
    };
    data.presets.push(newPreset);
    await StorageService.setData(data);
    return newPreset;
}

export async function updatePreset(presetId: string, updates: Partial<Preset>): Promise<void> {
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

export async function linkPresetToPage(presetId: string, pageId: string): Promise<void> {
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

export async function unlinkPresetFromPage(presetId: string, pageId: string): Promise<void> {
    const data = await StorageService.getData();
    if (!data)
        return;
    data.presetPageLinks = data.presetPageLinks.filter(link => !(link.presetId === presetId && link.pageId === pageId));
    await StorageService.setData(data);
}
