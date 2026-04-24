import { DEFAULTS, EXPORT_SCHEMA } from '../constants/appConstants';
import {
  ExtensionExportFile,
  ExtensionExportIncluded,
  ExtensionSettings,
  RandomStringCharset,
  RootData,
  SaveItemTarget,
  ThemeMode
} from '../types';
import { getCurrentTimestamp } from './helpers';

const INCLUDED_KEYS: Array<keyof ExtensionExportIncluded> = [
  'settings',
  'pages',
  'presets',
  'presetPageLinks',
  'savedValues',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export function createEmptyRootData(): RootData {
  return {
    pages: [],
    presets: [],
    presetPageLinks: [],
    savedValues: [],
    regexPatterns: [],
    lengthConfigurations: []
  };
}

export function createDefaultSettings(): ExtensionSettings {
  return {
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
  };
}

function normalizeIncluded(partial?: Partial<ExtensionExportIncluded>): ExtensionExportIncluded {
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

export function createExportFile(params: {
  included: Partial<ExtensionExportIncluded>;
  settings?: ExtensionSettings | null;
  data?: Partial<RootData> | null;
  exportedAt?: string;
}): ExtensionExportFile {
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

export function isExtensionExportFile(value: unknown): value is ExtensionExportFile {
  if (!isRecord(value)) return false;
  if (value.schema !== EXPORT_SCHEMA) return false;
  if (!isString(value.exportedAt)) return false;

  if (!isRecord(value.included)) return false;
  for (const key of INCLUDED_KEYS) {
    if (!isBoolean(value.included[key])) return false;
  }

  if (!isRecord(value.settings)) return false;
  if (!isBoolean(value.settings.enableSaveValue)) return false;
  if (!isBoolean(value.settings.enableImportValue)) return false;
  if (!isBoolean(value.settings.enableLiveAssistant)) return false;
  if (!isString(value.settings.theme)) return false;

  if (!isRecord(value.data)) return false;
  if (!isArray(value.data.pages)) return false;
  if (!isArray(value.data.presets)) return false;
  if (!isArray(value.data.presetPageLinks)) return false;
  if (!isArray(value.data.savedValues)) return false;

  return true;
}

export function parseExtensionExportJson(text: string): ExtensionExportFile {
  const parsed: unknown = JSON.parse(text);
  if (!isExtensionExportFile(parsed)) {
    throw new Error('Invalid import file format (expected form-filler.export.v1)');
  }
  return parsed;
}
