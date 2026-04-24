/**
 * Application-wide constants
 */
export declare const STORAGE_KEYS: {
    readonly DATA: "formFillerData";
    readonly SETTINGS: "formFillerSettings";
    readonly MIGRATION: "formFillerMigrationCompleted";
};
export declare const THEMES: {
    readonly LIGHT: "light";
    readonly DARK: "dark";
};
export declare const FIELD_TYPES: {
    readonly TEXT: "text";
    readonly SEARCH: "search";
    readonly CHECKBOX: "checkbox";
    readonly DROPDOWN: "dropdown";
    readonly DATEPICKER: "datepicker";
    readonly CLICKABLE: "clickable";
    readonly RADIO: "radio";
    readonly RANGE: "range";
    readonly NUMBER: "number";
    readonly COLOR: "color";
    readonly DYNAMIC_DATE: "dynamicDate";
};
export declare const MESSAGES: {
    readonly NO_PAGE_URL: "Page URL is required";
    readonly NO_PRESETS: "No presets yet";
    readonly NO_PAGES: "No pages available";
    readonly NO_FORM_FIELDS: "No form fields found on the page";
    readonly CONFIRM_DELETE: "Are you sure you want to delete this";
    readonly UNSAVED_CHANGES: "You have unsaved changes. Do you want to discard them and";
    readonly SUCCESS_SAVE: "Saved successfully!";
    readonly INVALID_DATA: "Invalid data format";
};
export declare const DEFAULTS: {
    readonly FILL_DELAY: 0;
    readonly AUTO_BLUR: true;
    readonly MUST_BE_MATCHED: false;
    readonly ENABLE_SAVE_VALUE: true;
    readonly ENABLE_IMPORT_VALUE: true;
    readonly ENABLE_LIVE_ASSISTANT: false;
    readonly DEFAULT_SAVE_ITEM_TO: "savedValues";
    readonly THEME: "light";
    readonly ENABLE_LOCATOR_RETRIEVER: false;
    readonly ENABLE_REGEX_PATTERN: false;
    readonly ENABLE_RANDOM_STRING_SECTION: false;
    readonly ENABLE_RANDOM_STRING_IN_ASSISTANT: false;
    readonly RANDOM_STRING_CHARSET: "alphanumeric-special";
    readonly RANDOM_STRING_LENGTH: 100;
};
export declare const LIMITS: {
    readonly PARENT_SEARCH_DEPTH: 7;
    readonly SAME_ROW_THRESHOLD: 10;
    readonly DEFAULT_PAGE_SIZE: 25;
    readonly MAX_RETRIES: 3;
    readonly MIN_STRING_LENGTH: 1;
    readonly MAX_STRING_LENGTH: 99999;
    readonly QUANTIFIER_MAX_REPEAT: 10;
};
export declare const SORT_DIRECTION: {
    readonly ASC: "asc";
    readonly DESC: "desc";
};
export declare const CSS_CLASSES: {
    readonly ACTIVE: "active";
    readonly CHECKED: "checked";
    readonly HIDDEN: "hidden";
    readonly DISABLED: "disabled";
    readonly LOADING: "loading";
};
export declare const EXPORT_SCHEMA: "form-filler.export.v1";
export declare const CHAR_SETS: {
    readonly ALPHABET: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    readonly DIGITS: "0123456789";
    readonly SPECIAL: "!@#$%^&*()_+-=[]{}|;:,.<>?";
    readonly CONTROL: "~`'\"\\/";
    readonly WORD_CHARS: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_";
};
export declare const RANDOM_STRING_CHARSETS: {
    readonly ALPHABET: "alphabet";
    readonly NUMERIC: "numeric";
    readonly ALPHANUMERIC: "alphanumeric";
    readonly ALPHANUMERIC_SPECIAL: "alphanumeric-special";
    readonly ALPHANUMERIC_SPECIAL_CONTROL: "alphanumeric-special-control";
};
export declare const DEFAULT_REGEX_PATTERNS: readonly [{
    readonly name: "Shortest email";
    readonly regex: "^[a-zA-Z0-9_%+-]@[a-zA-Z0-9.-]\\.[a-zA-Z]{2}$";
    readonly order: 1;
}, {
    readonly name: "Standard email";
    readonly regex: "^[a-zA-Z0-9_%+-][a-zA-Z0-9._%+-]{6}@[a-zA-Z0-9.-]{4}\\.[a-zA-Z]{3}$";
    readonly order: 2;
}, {
    readonly name: "Longest email";
    readonly regex: "^[a-zA-Z0-9_%+-][a-zA-Z0-9._%+-]{245}@[a-zA-Z0-9.-]{5}\\.[a-zA-Z]{3}$";
    readonly order: 3;
}];
//# sourceMappingURL=appConstants.d.ts.map