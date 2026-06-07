import { RootData, PageData, Preset, FormFieldData, ExtensionSettings, SavedValue, SaveItemTarget, ThemeMode, RandomStringCharset } from '../../types';
import { getCurrentTimestamp, generateUniqueId } from '../../utils/helpers';
import { DEFAULTS, DEFAULT_REGEX_PATTERNS } from '../../constants/appConstants';
import { SETTINGS_KEY, STORAGE_KEY } from './keys';
import { StorageService } from '../storage.service';

export async function getPageByUrl(url: string, matchIdentify: 'exactMatch' | 'prefixMatch'): Promise<PageData | null> {
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

export async function getPageById(pageId: string): Promise<PageData | null> {
    const data = await StorageService.getData();
    if (!data)
        return null;
    return data.pages.find(page => page.id === pageId) || null;
}

export async function getCurrentPageData(currentUrl: string): Promise<PageData | null> {
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

export async function addPage(pageData: Omit<PageData, 'id' | 'createdAt' | 'updatedAt'>): Promise<PageData> {
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
    const newPage: PageData = {
        ...pageData,
        id: generateUniqueId(existingIds),
        createdAt: getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp()
    };
    data.pages.push(newPage);
    await StorageService.setData(data);
    return newPage;
}

export async function updatePage(id: string, updates: Partial<PageData>): Promise<void> {
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
