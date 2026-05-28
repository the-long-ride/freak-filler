// Type definitions for the extension

export interface FormFieldData {
  id: string;
  type: 'text' | 'search' | 'checkbox' | 'dropdown' | 'datepicker' | 'clickable' | 'radio' | 'range' | 'number' | 'color' | 'dynamicDate' | 'htmlEditor';
  title: string;
  value: string | boolean | number;
  testId: string;
  querySelector: string;
  fillDelay: number;
  autoBlur: boolean;
  createdAt: string;
  updatedAt: string;
  order: number;
}

export interface Preset {
  id: string;
  name: string;
  description?: string;
  formData: FormFieldData[];
  createdAt: string;
  updatedAt: string;
}

export interface SavedValue {
  id: string;
  pageId: string;
  label: string;
  value: string;
  testId: string;
  querySelector: string;
  createdAt: string;
  updatedAt: string;
}

export interface PresetPageLink {
  presetId: string;
  pageId: string;
}

export type MatchIdentify = 'exactMatch' | 'prefixMatch';

export interface PageData {
  id: string;
  pageTitle: string;
  url: string;
  description?: string;
  owner?: string;
  matchIdentify: MatchIdentify;
  createdAt: string;
  updatedAt: string;
}

export interface RootData {
  pages: PageData[];
  presets: Preset[];
  presetPageLinks: PresetPageLink[];
  savedValues: SavedValue[];
  regexPatterns: RegexPattern[];
  lengthConfigurations: LengthConfiguration[];
}

export interface RegexPattern {
  name: string;
  regex: string;
  order: number;
}

export interface LengthConfiguration {
  name: string;
  description: string;
  locator: string;
  maxLength: number;
}

export type RandomStringCharset = 'alphabet' | 'numeric' | 'alphanumeric' | 'alphanumeric-special' | 'alphanumeric-special-control';

export type ThemeMode = 'light' | 'dark';
export type SaveItemTarget = 'preset' | 'savedValues';
export interface ExtensionSettings {
  enableSaveValue: boolean;      // Show save value option in filling assistant
  enableImportValue: boolean;    // Show import from saved values in filling assistant
  enableLiveAssistant: boolean;  // Show assistant on click/focus instead of context menu
  defaultSaveItemTo: SaveItemTarget; // Default target for saving form field values
  theme: ThemeMode;              // Dark/light mode
  enableLocatorRetriever: boolean; // Show element locators (testId, selector) in assistant
  enableRegexPattern: boolean;   // Show regex pattern buttons in assistant
  enableRandomStringSectionInPopup: boolean; // Show random string generator section in popup
  enableRandomStringInAssistant: boolean; // Show random string generator in Freak Filler assistant
  randomStringCharset: RandomStringCharset; // Default character set for random strings
  randomStringLength: number;    // Default length for random strings
}

export interface StorageData {
  data: RootData;
  settings: ExtensionSettings;
}

export interface ExtensionExportIncluded {
  settings: boolean;
  pages: boolean;
  presets: boolean;
  presetPageLinks: boolean;
  savedValues: boolean;
  regexPatterns: boolean;
  lengthConfigurations: boolean;
}

export interface ExtensionExportFile {
  schema: 'form-filler.export.v1';
  exportedAt: string;
  included: ExtensionExportIncluded;
  settings: ExtensionSettings;
  data: RootData;
}
