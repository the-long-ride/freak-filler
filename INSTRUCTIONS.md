# Freak Filler Chrome Extension - Developer Instructions

## Overview

This is a Chrome Extension for automating form filling on web pages. It allows users to create presets with form field data and apply them to web pages with a single click. The extension supports multiple pages, preset management, saved values, and a live filling assistant.

**Purpose**: Streamline repetitive form filling tasks by storing and applying preset configurations for different pages.

**Target Users**: Developers, QA testers, and anyone who frequently fills forms with similar data.

---

## Project Structure

```
form-filler/
├── public/                          # Static assets and HTML pages
│   ├── manifest.json                # Chrome extension manifest (v3)
│   ├── css/                         # Stylesheets
│   │   ├── action-buttons.css       # Action button styles
│   │   ├── content.css              # Content script styles (live assistant)
│   │   ├── cyberpunk-buttons.css    # Cyberpunk theme button styles
│   │   ├── guide-overlay.css        # Help overlay styles
│   │   ├── modal.css                # Modal dialog styles
│   │   ├── page-profile-editor.css  # Page profile editor styles
│   │   ├── popup.css                # Main popup styles
│   │   ├── scrollbar.css            # Custom scrollbar styles
│   │   ├── settings.css             # Settings page styles
│   │   ├── toast.css                # Toast notification styles
│   │   └── variables.css            # CSS custom properties (theming)
│   ├── html/                        # HTML pages
│   │   ├── page-profile-editor.html # Page profile and preset editor
│   │   ├── popup.html               # Main popup interface
│   │   └── settings.html            # Settings and data management
│   ├── icons/                       # Extension icons
│   └── js/                          # Compiled JavaScript (output)
│
├── src/                             # TypeScript source code
│   ├── background/
│   │   └── background.ts            # Service worker (context menus, lifecycle)
│   ├── constants/
│   │   ├── appConstants.ts          # Storage keys, messages, field types, defaults
│   │   └── svgs.ts                  # SVG icon definitions
│   ├── content/
│   │   ├── content.ts               # Main content script (form filling, scanning)
│   │   ├── element-helpers.ts       # Element selector/locator utilities
│   │   ├── import-section.ts        # Import values from saved data/presets
│   │   └── save-section.ts          # Save form values to storage
│   ├── pages/
│   │   ├── page-profile-editor.ts   # Page profile and preset editor logic
│   │   └── settings.ts              # Settings page and data management
│   ├── popup/
│   │   └── popup.ts                 # Main popup interface controller
│   ├── services/
│   │   └── storage.service.ts       # Chrome storage API wrapper (CRUD)
│   ├── types/
│   │   └── index.ts                 # TypeScript interfaces and types
│   └── utils/
│       ├── common.ts                # Shared utilities (escapeHtml, theme, file ops)
│       ├── cyber-btn-init.ts        # Cyberpunk button initialization
│       ├── export-format.ts         # Export/import JSON format utilities
│       ├── guide-overlay.ts         # Help overlay system
│       ├── helpers.ts               # Core helpers (GUID, timestamp, URL matching)
│       ├── icon-replacer.ts         # Dynamic SVG icon replacement
│       └── modal-utils.ts           # Modal and toast utilities
│
├── build.bat                        # Windows build script
├── package.json                     # Node dependencies and scripts
├── tsconfig.json                    # TypeScript configuration
├── webpack.config.js                # Webpack bundler configuration
├── test-page.html                   # Local test page for development
├── INSTRUCTIONS.md                  # This file - developer instructions
├── PROJECT_OVERVIEW.md              # Project overview and features
├── QUICKSTART.md                    # Quick start guide
└── README.md                        # User documentation
```

---

## Architecture & Technical Design

### 1. Storage Architecture

**Storage Type**: Chrome Extension Local Storage (`chrome.storage.local`)

**Storage Keys** (defined in `src/constants/appConstants.ts`):
```typescript
export const STORAGE_KEYS = {
  DATA: 'formFillerData',           // Main data storage
  SETTINGS: 'formFillerSettings',   // User preferences
  MIGRATION: 'formFillerMigrationCompleted'  // Migration flag
} as const;
```

**Data Structure**:

```typescript
// Main data container
interface RootData {
  pages: PageData[];              // All page configurations
  presets: Preset[];              // All form presets (shared across pages)
  presetPageLinks: PresetPageLink[];  // Many-to-many relationships
  savedValues: SavedValue[];      // Saved form values per page
  regexPatterns: RegexPattern[];  // Reusable regex patterns for text generation
  lengthConfigurations: LengthConfiguration[];  // Field length configurations
}

// Page configuration
interface PageData {
  id: string;                     // Unique identifier (GUID)
  pageTitle: string;              // Display name
  url: string;                    // Page URL for matching
  description?: string;           // Optional description
  owner?: string;                 // Optional owner name
  matchIdentify: MatchIdentify;   // 'exactMatch' | 'prefixMatch'
  createdAt: string;              // ISO timestamp
  updatedAt: string;              // ISO timestamp
}

// Form preset
interface Preset {
  id: string;                     // Unique identifier (GUID)
  name: string;                   // Preset name
  description?: string;           // Optional description
  formData: FormFieldData[];      // Array of form field configs
  createdAt: string;              // ISO timestamp
  updatedAt: string;              // ISO timestamp
}

// Form field configuration
interface FormFieldData {
  id: string;                     // Unique identifier (GUID)
  type: FieldType;                // Field type (see below)
  title: string;                  // Field label/name
  value: string | boolean | number;  // Field value
  testId: string;                 // data-testid attribute
  querySelector: string;          // CSS selector
  fillDelay: number;              // Delay in ms before filling
  autoBlur: boolean;              // Auto-blur after filling
  order: number;                  // Display order
  createdAt: string;              // ISO timestamp
  updatedAt: string;              // ISO timestamp
}

// Supported field types
type FieldType = 
  | 'text'           // Standard text input
  | 'search'         // Search input
  | 'checkbox'       // Checkbox (boolean value)
  | 'dropdown'       // Select dropdown
  | 'datepicker'     // Date/datetime input
  | 'clickable'      // Element to click (value = delay in ms)
  | 'radio'          // Radio button group
  | 'range'          // Range slider
  | 'number'         // Number input
  | 'color'          // Color picker (hex value)
  | 'dynamicDate';   // Dynamic date with offsets (years/months/days)

// Preset-Page link (many-to-many)
interface PresetPageLink {
  presetId: string;
  pageId: string;
}

// Saved value for a page
interface SavedValue {
  id: string;                     // Unique identifier (GUID)
  pageId: string;                 // Associated page ID
  label: string;                  // Field label
  value: string;                  // Saved value
  testId: string;                 // data-testid attribute
  querySelector: string;          // CSS selector
  createdAt: string;              // ISO timestamp
  updatedAt: string;              // ISO timestamp
}

// User settings
interface ExtensionSettings {
  enableSaveValue: boolean;       // Show save option in live assistant
  enableImportValue: boolean;     // Show import option in live assistant
  enableLiveAssistant: boolean;   // Enable live assistant on focus/click
  defaultSaveItemTo: SaveItemTarget;  // 'preset' | 'savedValues'
  theme: 'light' | 'dark';        // UI theme
  randomStringCharset: RandomStringCharset; // Default charset for random generator
  randomStringLength: number;     // Default length for random strings
}

// Regex pattern for text generation
interface RegexPattern {
  name: string;                   // Pattern display name
  regex: string;                  // Regular expression string
}

// Field length configuration
interface LengthConfiguration {
  name: string;                   // Configuration name
  description: string;            // Optional description
  locator: string;                // Element testId or CSS selector
  maxLength: number;              // Maximum field length
}
  theme: ThemeMode;               // 'light' | 'dark'
}
```

### 2. Module Responsibilities

**StorageService** (`src/services/storage.service.ts`):
- Centralized data access layer - ALL storage operations go through this
- CRUD operations for pages, presets, links, saved values
- Theme management
- Data migration (old structure to new)
- Extension context validation

**Key Methods**:
```typescript
// Data operations
static async getData(): Promise<RootData | null>
static async setData(data: RootData): Promise<void>

// Page operations
static async getCurrentPageData(currentUrl: string): Promise<PageData | null>
static async getPageById(pageId: string): Promise<PageData | null>
static async addPage(pageData: Omit<PageData, 'id' | 'createdAt' | 'updatedAt'>): Promise<PageData>
static async updatePage(id: string, updates: Partial<PageData>): Promise<void>

// Preset operations
static async getPresetsForPage(pageId: string): Promise<Preset[]>
static async getPresetById(presetId: string): Promise<Preset | null>
static async addPreset(preset: Omit<Preset, 'id' | 'createdAt' | 'updatedAt'>): Promise<Preset>
static async updatePreset(presetId: string, updates: Partial<Preset>): Promise<void>
static async deletePreset(presetId: string): Promise<void>

// Link operations
static async linkPresetToPage(presetId: string, pageId: string): Promise<void>
static async unlinkPresetFromPage(presetId: string, pageId: string): Promise<void>
static async getPageIdsForPreset(presetId: string): Promise<string[]>
static async getUnlinkedPresets(pageId: string): Promise<Preset[]>

// Saved values operations
static async getSavedValuesForPage(pageId: string): Promise<SavedValue[]>
static async addSavedValue(pageId: string, savedValue: Partial<SavedValue>): Promise<SavedValue>
static async deleteSavedValue(savedValueId: string): Promise<void>
static async getSavedFormDataForField(pageUrl: string, testId: string, querySelector: string): Promise<SavedValue[]>

// Settings operations
static async getSettings(): Promise<ExtensionSettings | null>
static async setSettings(settings: ExtensionSettings): Promise<void>
static async getTheme(): Promise<'light' | 'dark'>
static async setTheme(theme: 'light' | 'dark'): Promise<void>
```

**Content Script** (`src/content/content.ts`):
- Injected into ALL web pages via manifest
- Provides live filling assistant (popup on input focus/click)
- Scans form fields on demand
- Applies preset data to page elements
- Handles context menu actions
- Listens for messages from popup/background

**Key Functions**:
```typescript
// Form scanning
function scanFormFields(): FormFieldData[]

// Preset application
function applypresetToPage(formData: FormFieldData[]): void

// Live assistant
function showAutoFillPopup(inputElement: HTMLInputElement): Promise<void>

// Element label detection (priority order)
function getElementLabel(element: HTMLElement): string
```

**Background Script** (`src/background/background.ts`):
- Service worker for Manifest V3
- Creates and manages context menus
- Handles extension lifecycle events
- Sends messages to content scripts

**Context Menu Items**:
- "Show Filling Assistant" - Opens live assistant for right-clicked input
- "Copy Element Selector" - Copies CSS selector for right-clicked element

**Popup** (`src/popup/popup.ts`):
- Main user interface when clicking extension icon
- Displays current page info and linked presets
- Create/clone/import page profiles
- Apply, edit, delete presets
- Toggle live assistant settings
- Export page profile with presets

**Page Profile Editor** (`src/pages/page-profile-editor.ts`):
- Full-page editor for page profiles and presets
- **Page Profile Tab**: Edit page title, URL, description, match type
- **Preset Tab**: Edit preset fields with drag-and-drop reordering
- **Saved Values Tab**: Manage saved values for the page
- Supports "Preset-only mode" for editing unlinked presets

**Settings** (`src/pages/settings.ts`):
- Global settings management
- Data management (locators, pages, presets, saved values)
- Full export/import of all extension data
- Bulk operations (delete, edit locators)

### 3. Key Features

**URL Matching** (`matchIdentify`):
- `'exactMatch'`: URL must exactly match stored URL
- `'prefixMatch'`: Current URL must start with stored URL

**Element Selection Priority** (when filling):
1. `data-testid` attribute → `[data-testid="value"]`
2. `querySelector` if `testId` not found

**Element Selector Building** (`element-helpers.ts`):
1. Check for `data-testid` attribute
2. Check for element `id` → `#elementId`
3. Search parent hierarchy (up to 7 levels) for id or data-testid
4. Build CSS selector with tag name, type, and name attributes

**Label Detection Priority** (`getElementLabel`):
1. Closest `<label>` tag containing the element
2. `<label for="elementId">` matching element's ID
3. `aria-label` attribute
4. `title` attribute
5. `placeholder` attribute
6. `name` attribute
7. `data-testid` attribute
8. `id` attribute

**Form Scanning** (`scanFormFields`):
Scans these input types:
- `text`, `email`, `password`, `tel`, `url`, `search` → type: 'text'
- `input[type="search"]` → type: 'search'
- `input[type="radio"]` → type: 'radio'
- `input[type="range"]` → type: 'range'
- `input[type="number"]` → type: 'number'
- `input[type="color"]` → type: 'color'
- `input[type="date"]`, `input[type="datetime-local"]` → type: 'datepicker'
- `textarea` → type: 'text'
- `input[type="checkbox"]` → type: 'checkbox'
- `select` → type: 'dropdown'

**Form Filling Logic** (`applypresetToPage`):
| Field Type | Fill Behavior |
|------------|---------------|
| `text`, `search` | `element.value = value` + dispatch events |
| `checkbox` | `element.checked = (value === 'true')` |
| `radio` | Find radio with matching value and check it |
| `clickable` | `element.click()` after optional delay |
| `range`, `number` | `element.value = value` |
| `color` | `element.value = hexValue` |
| `datepicker` | `element.value = dateString` |
| `dropdown` | `element.value = value` |
| `dynamicDate` | Calculate date from `{years, months, days}` offsets |

**Dynamic Date Feature**:
```typescript
// Value is stored as JSON: {"years": 0, "months": -1, "days": 5}
// Calculates: currentDate + years + months + days
const offsets = JSON.parse(field.value);
const date = new Date();
date.setFullYear(date.getFullYear() + offsets.years);
date.setMonth(date.getMonth() + offsets.months);
date.setDate(date.getDate() + offsets.days);
// Result formatted as YYYY-MM-DD
```

**Live Assistant**:
- Shows popup below focused/clicked input
- **Save Section**: Save current field value to saved values or preset
- **Import Section**: Import from saved values or preset values
- Triggered by focus (if `enableLiveAssistant` is true) or context menu

**Export/Import Format**:
```typescript
interface ExtensionExportFile {
  schema: 'form-filler.export.v1';    // Version identifier
  exportedAt: string;                  // ISO timestamp
  included: {                          // What's included in export
    settings: boolean;
    pages: boolean;
    presets: boolean;
    presetPageLinks: boolean;
    savedValues: boolean;
  };
  settings: ExtensionSettings;
  data: RootData;
}
```

### 4. Build System

**Technology Stack**:
- TypeScript 4.x with strict mode
- Webpack 5 for bundling
- Chrome Extension Manifest V3

**Build Commands**:
```bash
npm install          # Install dependencies
npm run build        # Production build
npm run dev          # Development build with watch mode
npm run clean        # Clean dist folder
```

**Webpack Configuration**:
- Multiple entry points: popup, background, content, page-profile-editor, settings
- CSS extraction with MiniCssExtractPlugin
- HTML and static file copying
- Source maps in development mode

**Output Structure** (`dist/`):
```
dist/
├── background.js           # Service worker
├── content.js              # Content script bundle
├── popup.js                # Popup script
├── page-profile-editor.js  # Page profile editor script
├── settings.js             # Settings page script
├── html/
│   ├── popup.html
│   ├── page-profile-editor.html
│   └── settings.html
├── css/
│   ├── content.css
│   ├── popup.css
│   ├── page-profile-editor.css
│   ├── settings.css
│   └── ... (other CSS files)
├── manifest.json
└── icons/
```

---

## Code Organization Patterns

### Constants (`src/constants/appConstants.ts`)

```typescript
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

// Field types
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
  DYNAMIC_DATE: 'dynamicDate'
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
  AUTO_BLUR: false,
  MUST_BE_MATCHED: false,
  ENABLE_SAVE_VALUE: true,
  ENABLE_IMPORT_VALUE: true,
  ENABLE_LIVE_ASSISTANT: false,
  DEFAULT_SAVE_ITEM_TO: 'preset',
  THEME: 'light'
} as const;

// Limits and thresholds
export const LIMITS = {
  PARENT_SEARCH_DEPTH: 7,
  SAME_ROW_THRESHOLD: 10,
  DEFAULT_PAGE_SIZE: 25,
  MAX_RETRIES: 3
} as const;
```

### Common Utilities (`src/utils/common.ts`)

```typescript
// XSS protection
export function escapeHtml(text: string): string

// Date formatting (relative: "5 mins ago")
export function formatDate(dateString: string): string

// Theme management
export async function initTheme(): Promise<void>
export async function toggleTheme(): Promise<void>
export function updateThemeIcons(theme: string): void

// File operations
export function downloadFile(content: string, filename: string, type?: string): void
export async function readFileAsText(file: File): Promise<string>

// General utilities
export function debounce<T>(func: T, delay: number): (...args: any[]) => void
export function sanitizeFilename(name: string): string
export function deepClone<T>(obj: T): T
export function isElementVisible(element: HTMLElement): boolean
export async function retryAsync<T>(operation: () => Promise<T>, maxRetries?: number): Promise<T>
```

### Core Helpers (`src/utils/helpers.ts`)

```typescript
// ID generation
export function generateGuid(): string
export function generateUniqueId(existingIds: string[]): string

// Timestamps
export function getCurrentTimestamp(): string  // ISO format

// URL matching
export function matchUrl(pageUrl: string, currentUrl: string, matchIdentify: MatchIdentify): boolean

// Display helpers
export function buildQuantityString(quantity: number): string  // "Total: X items"
```

---

## Development Workflow

### 1. Adding a New Field Type

1. **Update types** in `src/types/index.ts`:
   ```typescript
   type: 'text' | 'checkbox' | ... | 'newFieldType';
   ```

2. **Add constant** in `src/constants/appConstants.ts`:
   ```typescript
   export const FIELD_TYPES = {
     // ... existing
     NEW_FIELD_TYPE: 'newFieldType'
   } as const;
   ```

3. **Update scanning** in `src/content/content.ts`:
   ```typescript
   // Add selector for new field type
   document.querySelectorAll('input[type="newtype"]').forEach(input => {
     fields.push({
       type: 'newFieldType',
       // ... other properties
     });
   });
   ```

4. **Update filling logic** in `src/content/content.ts`:
   ```typescript
   } else if (field.type === 'newFieldType') {
     // Implement filling logic
     element.value = String(field.value);
     element.dispatchEvent(new Event('input', { bubbles: true }));
     element.dispatchEvent(new Event('change', { bubbles: true }));
   }
   ```

5. **Update UI** in `src/pages/page-profile-editor.ts`:
   - Add option in type dropdown
   - Add value input rendering
   - Handle value parsing/formatting

### 2. Adding a Storage Operation

1. **Add method** to `StorageService` class:
   ```typescript
   static async newOperation(param: string): Promise<ResultType> {
     const data = await this.getData();
     if (!data) return defaultValue;
     
     // Perform operation
     const result = data.collection.find(item => item.id === param);
     
     // If modifying data, save and update timestamps
     result.updatedAt = getCurrentTimestamp();
     await this.setData(data);
     
     return result;
   }
   ```

2. **Always use** async/await and proper error handling

### 3. Debugging

**Chrome DevTools Access**:
- **Popup**: Right-click extension icon → "Inspect popup"
- **Background**: `chrome://extensions` → Extension → "Inspect views: service worker"
- **Content Script**: Page DevTools → Sources → Content Scripts → form-filler
- **Storage**: DevTools → Application → Storage → Local Storage

**Common Issues**:
- **"Extension context invalidated"**: Extension was reloaded, refresh page
- **Content script not injected**: Check manifest.json `content_scripts` configuration
- **Storage not updating**: Verify `chrome.storage.local` permission in manifest
- **Selector not working**: Test in page console with `document.querySelector(selector)`

### 4. Testing Changes

1. Run `npm run build`
2. Go to `chrome://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked" → select `dist/` folder
5. Test all affected features
6. Check console in all contexts for errors

---

## Best Practices for AI Copilot

### Code Modifications

1. **Always use StorageService** - Never access `chrome.storage` directly
2. **Maintain type safety** - Use types from `src/types/index.ts`
3. **Use constants** - Never hardcode strings or magic numbers
4. **Update timestamps** - Call `getCurrentTimestamp()` for `updatedAt` fields
5. **Null checks** - Always check for null before DOM manipulation
6. **Use escapeHtml()** - When inserting user content into innerHTML

### Naming Conventions

- **PascalCase**: Types, interfaces, classes (`PageData`, `StorageService`)
- **camelCase**: Functions, variables, methods (`loadPageData`, `currentUrl`)
- **UPPER_SNAKE_CASE**: Constants (`STORAGE_KEYS`, `FIELD_TYPES`)
- **kebab-case**: File names (`storage.service.ts`, `page-profile-editor.ts`)
- **Prefix handlers**: `handle` for event handlers (`handleClick`, `handleDragStart`)
- **Prefix rendering**: `render` for DOM rendering functions (`renderFormDataTable`)

### File Structure Pattern

```typescript
// 1. Imports
import { StorageService } from '../services/storage.service';
import { PageData, Preset } from '../types';
import { generateGuid, getCurrentTimestamp } from '../utils/helpers';
import { escapeHtml, initTheme } from '../utils/common';
import { STORAGE_KEYS, MESSAGES } from '../constants/appConstants';

// 2. Module-level variables
let currentPageData: PageData | null = null;
let hasUnsavedChanges = false;

// 3. Main init function
async function init() {
  await initTheme();
  await loadData();
  setupEventListeners();
}

// 4. Public/main functions
async function loadData() { /* ... */ }
function renderTable() { /* ... */ }

// 5. Helper functions
function formatValue(value: string): string { /* ... */ }

// 6. Event handlers
function handleSaveClick() { /* ... */ }
function handleDeleteClick() { /* ... */ }

// 7. Init call
init();
```

### Common Patterns

**Loading data with error handling**:
```typescript
async function loadData() {
  try {
    const data = await StorageService.getData();
    if (!data) {
      console.warn('No data found');
      return;
    }
    // Process data...
  } catch (error) {
    console.error('Failed to load data:', error);
    showToast('Failed to load data', 'error');
  }
}
```

**Safe DOM manipulation**:
```typescript
function renderTable() {
  const tbody = document.getElementById('tableBody');
  if (!tbody) {
    console.warn('Table body element not found');
    return;
  }
  
  tbody.innerHTML = '';
  items.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${escapeHtml(item.name)}</td>`;
    tbody.appendChild(row);
  });
}
```

**Confirmation dialog**:
```typescript
async function handleDelete() {
  if (!await showConfirm('Delete', 'Are you sure you want to delete this?')) {
    return;
  }
  await StorageService.deletePreset(presetId);
  showToast('Deleted successfully', 'success');
  await loadData();
}
```

---

## Quick Reference

### Key Files for Common Tasks

| Task | File(s) |
|------|---------|
| Add storage operation | `src/services/storage.service.ts` |
| Add UI feature (popup) | `src/popup/popup.ts` |
| Add UI feature (editor) | `src/pages/page-profile-editor.ts` |
| Add form filling logic | `src/content/content.ts` |
| Add types | `src/types/index.ts` |
| Add constants | `src/constants/appConstants.ts` |
| Add utilities | `src/utils/common.ts` or `src/utils/helpers.ts` |
| Add modal/toast | `src/utils/modal-utils.ts` |

### Important StorageService Methods

```typescript
// Get all data
const data = await StorageService.getData();

// Get page by current URL
const page = await StorageService.getCurrentPageData(url);

// Get presets for a page
const presets = await StorageService.getPresetsForPage(pageId);

// Create new preset and link to page
const preset = await StorageService.addPreset({ name, description, formData });
await StorageService.linkPresetToPage(preset.id, pageId);

// Get saved values for a field
const values = await StorageService.getSavedFormDataForField(pageUrl, testId, querySelector);

// Get/set settings
const settings = await StorageService.getSettings();
await StorageService.setSettings({ ...settings, theme: 'dark' });
```

### Chrome Extension APIs Used

| API | Permission | Usage |
|-----|------------|-------|
| `chrome.storage.local` | `storage` | Data persistence |
| `chrome.tabs.query` | `activeTab` | Get current tab info |
| `chrome.tabs.sendMessage` | `activeTab` | Send messages to content script |
| `chrome.scripting.executeScript` | `scripting` | Inject scripts dynamically |
| `chrome.contextMenus` | `contextMenus` | Right-click menu items |
| `navigator.clipboard.writeText` | `clipboardWrite` | Copy to clipboard |
| `chrome.runtime.getManifest` | - | Get extension version |

---

*Last Updated: January 2026*
*Version: 2.0 (Normalized storage architecture)*
