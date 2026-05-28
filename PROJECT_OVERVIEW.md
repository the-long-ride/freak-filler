# Freak Filler Chrome Extension - Project Overview

## ✅ Project Status: Production Ready

This is a fully functional Chrome extension built with **TypeScript** and **Manifest V3** that helps users automatically fill form data using customizable presets. The extension features a cyberpunk-themed UI with dark/light mode support.

---

## 🎯 Core Features

### 1. Page Profile Management
- **Create page profiles** for specific URLs
- **URL matching modes**: Exact match or prefix match (startsWith)
- **Page metadata**: Title, description, owner, timestamps
- **Clone existing profiles** to create new ones quickly
- **Import/export profiles** with all associated data

### 2. Preset System (Many-to-Many Architecture)
- **Create reusable presets** with form field configurations
- **Link presets to multiple pages** - same preset works across different URLs
- **Link multiple presets to a page** - organize different fill scenarios
- **Clone presets** for quick duplication
- **Drag-and-drop reordering** of form fields within presets

### 3. Form Field Support
| Type | Input Element | Value Storage | Fill Behavior |
|------|---------------|---------------|---------------|
| `text` | `<input type="text/email/password/tel/url">`, `<textarea>` | String | Set value |
| `search` | `<input type="search">` | String | Set value |
| `checkbox` | `<input type="checkbox">` | Boolean (`'true'`/`'false'`) | Set checked state |
| `radio` | `<input type="radio">` | String (value to select) | Check matching radio |
| `dropdown` | `<select>` | String (option value) | Set selected value |
| `datepicker` | `<input type="date/datetime-local">` | String (ISO date) | Set value |
| `dynamicDate` | `<input type="date">` | JSON `{years, months, days}` | Calculate from current date |
| `range` | `<input type="range">` | Number | Set value |
| `number` | `<input type="number">` | Number | Set value |
| `color` | `<input type="color">` | String (hex: `#RRGGBB`) | Set color value |
| `htmlEditor` | Contenteditable and same-origin iframe HTML editors (TinyMCE, CKEditor, Quill, Froala, Summernote, Jodit, ProseMirror/Tiptap, Lexical, Slate, Draft.js, Editor.js, Toast UI, Trix, Redactor, etc.) | String (HTML) | Set editor HTML |
| `clickable` | Any element | Number (delay in ms) | Click element |

### 4. Live Filling Assistant
- **Popup on input focus/click** (when enabled)
- **Random String Generator** - Multiple charset options (alphabet, numeric, alphanumeric, special characters)
- **Regex Pattern Import** - Generate values from saved regex patterns
- **String Counter** - Count characters, words, lines, paragraphs, and sentences
- **Save current value** to saved values or preset
- **Import from saved values** - field-specific saved data
- **Import from preset values** - values from linked presets
- **Context menu integration** - right-click to show assistant

### 5. Saved Values System
- **Per-page saved values** - values linked to specific page profiles
- **Field matching** by testId or querySelector
- **Quick import** from assistant popup
- **Manage in editor** - edit, delete, export saved values

### 6. Smart Form Scanning
- **Auto-detect form fields** on any page
- **Extract element identifiers**: data-testid, id, name, selector
- **Label detection** from associated labels, aria-label, placeholder
- **Import scanned fields** directly into preset

### 7. Regex Pattern Management
- **Create reusable regex patterns** with custom names
- **Generate values from patterns** - automatically create test data matching regex rules
- **Use in assistant** - quick access via pattern buttons in the filling popup
- **Manage patterns** - add, edit, delete, and export patterns in settings
- **Pattern library** - includes preset patterns (email formats, digits, etc.)

### 8. String Counter & Analysis
- **Real-time character count** - total and without spaces
- **Word count** - count individual words
- **Line and paragraph counts** - analyze text structure
- **Sentence count** - count sentences in text
- **Character ratio** - analyze character distribution
- **Modal interface** - accessible from popup toolbar

### 9. Field Length Configuration
- **Define expected lengths** for specific fields or selectors
- **Context-aware generation** - random string generator respects field length limits
- **Locator-based matching** - match by data-testid or CSS selector
- **Settings management** - add and remove configurations in settings page

### 10. Data Management (Settings Page)
- **Locators overview** - all unique testId/querySelector combinations
- **Pages management** - view, edit, delete all pages
- **Presets management** - global preset list with linked pages
- **Saved values management** - all saved values across pages
- **Full export/import** - backup and restore all extension data

### 8. UI/UX Features
- **Cyberpunk theme** with neon accents and cut-corner aesthetics
- **Dark/light mode** toggle with persistence
- **Toast notifications** for feedback
- **Modal dialogs** for confirmations
- **Guide overlays** for help/onboarding
- **Responsive design** for various popup sizes

---

## 📁 Project Structure

```
form-filler/
├── public/                          # Static files (copied to dist)
│   ├── manifest.json                # Chrome extension manifest v3
│   ├── css/                         # Stylesheets
│   │   ├── variables.css            # CSS custom properties (theming)
│   │   ├── popup.css                # Main popup styles
│   │   ├── page-profile-editor.css  # Editor page styles
│   │   ├── settings.css             # Settings page styles
│   │   ├── content.css              # Live assistant styles
│   │   ├── cyberpunk-buttons.css    # Button component styles
│   │   ├── modal.css                # Modal dialog styles
│   │   ├── toast.css                # Toast notification styles
│   │   └── ...                      # Other component styles
│   ├── html/                        # HTML pages
│   │   ├── popup.html               # Extension popup
│   │   ├── page-profile-editor.html # Profile/preset editor
│   │   └── settings.html            # Settings and data management
│   └── icons/                       # Extension icons
│
├── src/                             # TypeScript source files
│   ├── background/
│   │   └── background.ts            # Service worker (context menus)
│   ├── constants/
│   │   ├── appConstants.ts          # Storage keys, field types, messages
│   │   └── svgs.ts                  # SVG icon definitions
│   ├── content/
│   │   ├── content.ts               # Main content script
│   │   ├── element-helpers.ts       # Element selector utilities
│   │   ├── import-section.ts        # Assistant import functionality
│   │   └── save-section.ts          # Assistant save functionality
│   ├── pages/
│   │   ├── page-profile-editor.ts   # Profile/preset editor logic
│   │   └── settings.ts              # Settings page logic
│   ├── popup/
│   │   └── popup.ts                 # Main popup logic
│   ├── services/
│   │   └── storage.service.ts       # Chrome storage API wrapper
│   ├── types/
│   │   └── index.ts                 # TypeScript interfaces
│   └── utils/
│       ├── common.ts                # Shared utilities
│       ├── helpers.ts               # Core helper functions
│       ├── export-format.ts         # Export/import utilities
│       ├── modal-utils.ts           # Modal and toast utilities
│       ├── cyber-btn-init.ts        # Button initialization
│       ├── icon-replacer.ts         # SVG icon system
│       └── guide-overlay.ts         # Help overlay system
│
├── dist/                            # Build output (load in Chrome)
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript configuration
├── webpack.config.js                # Webpack bundler config
├── build.bat                        # Windows build script
└── test-page.html                   # Local test page
```

---

## 🔧 Data Architecture

### Storage Structure (Normalized)

```typescript
interface RootData {
  pages: PageData[];              // All page configurations
  presets: Preset[];              // All form presets (global)
  presetPageLinks: PresetPageLink[];  // Many-to-many relationships
  savedValues: SavedValue[];      // Saved form values per page
}
```

### Key Interfaces

```typescript
interface PageData {
  id: string;                     // GUID
  pageTitle: string;              // Display name
  url: string;                    // URL for matching
  description?: string;           // Optional description
  owner?: string;                 // Optional owner
  matchIdentify: 'exactMatch' | 'prefixMatch';
  createdAt: string;              // ISO timestamp
  updatedAt: string;              // ISO timestamp
}

interface Preset {
  id: string;                     // GUID
  name: string;                   // Preset name
  description?: string;           // Optional description
  formData: FormFieldData[];      // Form field configurations
  createdAt: string;
  updatedAt: string;
}

interface FormFieldData {
  id: string;                     // GUID
  type: FieldType;                // text, checkbox, dropdown, etc.
  title: string;                  // Field label/name
  value: string | boolean | number;
  testId: string;                 // data-testid attribute
  querySelector: string;          // CSS selector
  fillDelay: number;              // Delay before fill (ms)
  autoBlur: boolean;              // Blur after fill
  order: number;                  // Display order
  createdAt: string;
  updatedAt: string;
}

interface SavedValue {
  id: string;                     // GUID
  pageId: string;                 // Associated page
  label: string;                  // Field label
  value: string;                  // Saved value
  testId: string;                 // data-testid
  querySelector: string;          // CSS selector
  createdAt: string;
  updatedAt: string;
}

interface ExtensionSettings {
  enableSaveValue: boolean;       // Show save in assistant
  enableImportValue: boolean;     // Show import in assistant
  enableLiveAssistant: boolean;   // Enable on focus/click
  defaultSaveItemTo: 'preset' | 'savedValues';
  theme: 'light' | 'dark';
  randomStringCharset: RandomStringCharset; // Default charset for random generator
  randomStringLength: number;     // Default length for random strings
}

interface RegexPattern {
  name: string;                   // Pattern display name
  regex: string;                  // Regular expression string
}

interface LengthConfiguration {
  name: string;                   // Configuration name
  description: string;            // Optional description
  locator: string;                // Element testId or selector
  maxLength: number;              // Maximum field length
}
```
```

---

## 🚀 Build & Installation

### Build Commands
```bash
npm install          # Install dependencies
npm run build        # Production build
npm run dev          # Development with watch
npm run clean        # Clean dist folder
```

### Load in Chrome
1. Navigate to `chrome://extensions/`
2. Enable **"Developer mode"** (top-right toggle)
3. Click **"Load unpacked"**
4. Select the `dist` folder
5. Extension icon appears in toolbar

---

## 📝 Technical Details

### Manifest V3 Configuration
```json
{
  "manifest_version": 3,
  "permissions": [
    "storage",       // Data persistence
    "activeTab",     // Current tab access
    "scripting",     // Script injection
    "contextMenus",  // Right-click menus
    "clipboardWrite" // Copy to clipboard
  ],
  "host_permissions": ["<all_urls>"],
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "css": ["css/content.css"],
      "run_at": "document_idle"
    }
  ]
}
```

### TypeScript Configuration
- **Target**: ES2020
- **Module**: ES2020
- **Strict mode**: Enabled
- **Source maps**: Development only

### Dependencies
| Package | Purpose |
|---------|---------|
| `typescript` | TypeScript compiler |
| `webpack` | Module bundler |
| `ts-loader` | TypeScript webpack loader |
| `copy-webpack-plugin` | Static file copying |
| `@types/chrome` | Chrome API type definitions |
| `css-loader` | CSS processing |
| `mini-css-extract-plugin` | CSS extraction |

---

## 🎨 UI Components

### Cyberpunk Theme System
```css
/* CSS Custom Properties (variables.css) */
:root {
  --bg-primary: #0a0a0f;
  --bg-secondary: #12121a;
  --accent-primary: #00ffff;    /* Cyan */
  --accent-secondary: #ff00ff;  /* Magenta */
  --text-primary: #e0e0e0;
  --border-color: rgba(0, 255, 255, 0.3);
}

[data-theme="light"] {
  --bg-primary: #f0f0f5;
  --bg-secondary: #ffffff;
  --text-primary: #1a1a2e;
}
```

### Key UI Patterns
- **Cut-corner inputs**: `clip-path: polygon(...)` for cyberpunk aesthetic
- **Glow effects**: `box-shadow` with accent colors
- **Sticky headers**: Data grids with fixed headers
- **Toast notifications**: Non-blocking feedback messages
- **Modal dialogs**: Confirmation and form dialogs

---

## 🔄 User Flow

### Initial Setup
1. Navigate to target webpage
2. Click extension icon → Create new page profile
3. Fill in page title, URL, match type
4. Create a preset with form fields
5. Configure field types, selectors, values

### Daily Usage
1. Navigate to configured page
2. Click extension icon → See linked presets
3. Click "Apply" to fill form with preset values
4. Or use Live Assistant for individual fields

### Live Assistant (Optional)
1. Enable in settings or popup
2. Click/focus on input field
3. Save current value or import from saved/preset values

---

## ⚙️ Extension Settings

| Setting | Default | Description |
|---------|---------|-------------|
| Enable Live Assistant | `false` | Show assistant on input focus/click |
| Enable Save Value | `true` | Show save option in assistant |
| Enable Import Value | `true` | Show import option in assistant |
| Default Save Target | `savedValue` | Where to save values by default |
| Theme | `dark` | Dark or light mode |

---

## 📤 Export/Import Format

```typescript
interface ExtensionExportFile {
  schema: 'form-filler.export.v1';
  exportedAt: string;  // ISO timestamp
  included: {
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

### Export Options
- **Page profile export**: Single page with linked presets and saved values
- **Full extension export**: All data including settings

### Import Behavior
- Duplicate detection by ID and name
- Automatic linking of imported presets to pages
- Skip duplicates with notification

---

## 🔜 Potential Enhancements

- [ ] Cloud sync via Chrome sync storage
- [ ] Preset templates/marketplace
- [ ] AI-powered field detection
- [ ] Keyboard shortcuts
- [ ] Bulk operations (fill multiple presets)
- [ ] Conditional filling (if-then rules)
- [ ] Password field support with encryption
- [ ] Multi-language support
- [ ] Form validation rules
- [ ] Preset versioning/history

---

## 📖 Quick Reference

### Context Menu Actions
- **"Show Filling Assistant"** - Open assistant for input
- **"Copy Element Selector"** - Copy CSS selector to clipboard

### Keyboard Shortcuts
- *Coming soon*

### Storage Keys
```typescript
STORAGE_KEYS.DATA = 'formFillerData'
STORAGE_KEYS.SETTINGS = 'formFillerSettings'
```

---

*Last Updated: January 2026*  
*Version: 2.0 (Normalized storage architecture with many-to-many relationships)*
