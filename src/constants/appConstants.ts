/**
 * Application-wide constants
 */

// Storage keys
export const STORAGE_KEYS = {
  DATA: 'formFillerData',
  SETTINGS: 'formFillerSettings',
  MIGRATION: 'formFillerMigrationCompleted'
} as const;

// Theme constants
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark'
} as const;

// Form field types
export const FIELD_TYPES = {
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
} as const;

// UI messages
export const MESSAGES = {
  NO_PAGE_URL: 'Page URL is required',
  NO_PRESETS: 'No presets yet',
  NO_PAGES: 'No pages available',
  NO_FORM_FIELDS: 'No form fields found on the page',
  CONFIRM_DELETE: 'Are you sure you want to delete this',
  UNSAVED_CHANGES: 'You have unsaved changes. Do you want to discard them and',
  SUCCESS_SAVE: 'Saved successfully!',
  INVALID_DATA: 'Invalid data format'
} as const;

// Default values
export const DEFAULTS = {
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
} as const;

// Limits and thresholds
export const LIMITS = {
  PARENT_SEARCH_DEPTH: 7,
  SAME_ROW_THRESHOLD: 10, // pixels
  DEFAULT_PAGE_SIZE: 25,
  MAX_RETRIES: 3,
  MIN_STRING_LENGTH: 1,
  MAX_STRING_LENGTH: 99999,
  QUANTIFIER_MAX_REPEAT: 10
} as const;

// Sort directions
export const SORT_DIRECTION = {
  ASC: 'asc',
  DESC: 'desc'
} as const;

// CSS class names
export const CSS_CLASSES = {
  ACTIVE: 'active',
  CHECKED: 'checked',
  HIDDEN: 'hidden',
  DISABLED: 'disabled',
  LOADING: 'loading'
} as const;

// Export/Import JSON schema
export const EXPORT_SCHEMA = 'form-filler.export.v1' as const;

// Character sets for random string generation
export const CHAR_SETS = {
  ALPHABET: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  DIGITS: '0123456789',
  SPECIAL: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  CONTROL: '~`\'"\\/',
  WORD_CHARS: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_'
} as const;

// Random string character set templates
export const RANDOM_STRING_CHARSETS = {
  ALPHABET: 'alphabet',
  NUMERIC: 'numeric',
  ALPHANUMERIC: 'alphanumeric',
  ALPHANUMERIC_SPECIAL: 'alphanumeric-special',
  ALPHANUMERIC_SPECIAL_CONTROL: 'alphanumeric-special-control'
} as const;

// Default regex patterns
export const DEFAULT_REGEX_PATTERNS = [
  { name: 'Shortest email', regex: '^[a-zA-Z0-9_%+-]@[a-zA-Z0-9.-]\\.[a-zA-Z]{2}$', order: 1 },
  { name: 'Standard email', regex: '^[a-zA-Z0-9_%+-][a-zA-Z0-9._%+-]{6}@[a-zA-Z0-9.-]{4}\\.[a-zA-Z]{3}$', order: 2 },
  { name: 'Longest email', regex: '^[a-zA-Z0-9_%+-][a-zA-Z0-9._%+-]{245}@[a-zA-Z0-9.-]{5}\\.[a-zA-Z]{3}$', order: 3 }
] as const;
