![Freak Filler icon (128x128)](public/icons/icon-128.png)
# Freak Filler Chrome Extension

A Chrome extension for automatically filling form data based on customizable presets.

## Features

- 🎯 **Auto-fill popup** - Shows above text input fields with random string generation, regex patterns, and saved values
- 📝 **preset Management** - Create, edit, and manage multiple presets per page
- 💾 **Saved Data** - Save frequently used form values for quick access
- 🔍 **Smart Matching** - Match pages by exact URL or URL prefix
- ⚙️ **Easy Configuration** - User-friendly popup interface for management
- ✏️ **Edit Page Settings** - Modify page configuration anytime
- 🧮 **String Counter** - Count characters, words, lines, and more in any text
- 🎲 **Advanced String Generator** - Generate random strings with custom charsets (alphabet, numeric, alphanumeric, special characters)
- 🔤 **Regex Pattern Import** - Create reusable regex patterns and generate values from them

## Installation & Development

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Setup

1. Install dependencies:
```bash
npm install
```

2. Build the extension:
```bash
npm run build
```

For development with auto-rebuild:
```bash
npm run dev
```

### Load Extension in Chrome
1. Execute `build.bat` in the root folder.
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist` (created by `build.bat`) folder from this project

The extension is now installed and ready to use!

## Usage

### Enable/Disable Auto-fill Popup

Click the extension icon and toggle the "Enable Auto-fill Popup" checkbox.

### Creating a Page Configuration

1. Navigate to a webpage you want to configure
2. Click the extension icon
3. Click "Create New Page"
4. Fill in:
   - **Page Title**: A friendly name for the page
   - **URL**: The page URL (pre-filled with current URL)
   - **Description**: Optional description
   - **Owner**: Optional owner name
   - **Must be exact match**: Check for exact URL match, uncheck for prefix match

### Editing Page Settings

1. Open the extension popup on a configured page
2. Click the "Edit Page" button in the top-right of the page info section
3. Modify any settings (title, URL, description, owner, matching rule)
4. Click "Save Changes" to update or "Cancel" to discard

### Creating presets

1. Open the extension popup on a configured page
2. Click "+ Create preset"
3. Enter preset name and description
4. Add form fields with:
   - **Order**: Display order (used for sorting)
   - **Title**: Field label
   - **Type**: text, checkbox, dropdown, or datepicker
   - **Value**: The value to fill
   - **Test ID**: data-testid attribute value
   - **Query Selector**: CSS selector (e.g., #firstName)
5. Click "Save preset"

### Using presets

1. Navigate to a configured page
2. Click the extension icon
3. Click "Apply" on any preset to fill all fields

### Using Auto-fill Popup

When enabled, focusing on a text input shows a popup with:
- **Random String Generator**: Choose charset (alphabet, numeric, alphanumeric, special characters) and length, then click "Generate"
- **Regex Patterns**: Click any saved pattern to generate a value matching that regex
- **String Counter**: Analyze text with character, word, line, and paragraph counts
- **Save Options**: Save current value to Saved Data or a preset
- **Saved Values**: Click any saved value to fill the field

## Import/Export

The extension supports importing and exporting all configuration data using a unified JSON schema (`form-filler.export.v1`). This allows you to backup, restore, or share configurations between different installations.

### Exporting Data

1. Open the extension settings (click the gear icon in the popup or navigate to `chrome-extension://[extension-id]/html/settings.html`)
2. Click "Export All" to download a complete backup of all your data
3. Individual data types can also be exported from their respective management sections

### Importing Data

1. Open the extension settings
2. Click "Import All" and select a JSON file
3. Choose which data types to import from the file
4. The import will merge with existing data (no duplicates)

### Supported Data Types

The unified export format supports importing/exporting:

- **Settings**: Extension preferences and configuration
- **Pages**: Page configurations with URL matching rules
- **Presets**: Form filling presets with field definitions
- **Preset-Page Links**: Associations between presets and pages
- **Saved Values**: Frequently used form field values
- **Regex Patterns**: Reusable regex patterns for value generation
- **Length Configurations**: Field-specific length limits for smart generation

### Sample Data

Pre-configured sample data is available in the `./sample-data/` directory:

- **`Regex-Pattern.json`**: Common regex patterns for emails, phone numbers, ZIP codes, and more
- **`Field-Length-Configuration-ListingEditor.json`**: Field length configurations for listing editor forms

To import sample data:
1. Open extension settings
2. Click "Import All"
3. Select the desired JSON file from `./sample-data/`
4. Choose the appropriate data type to import

## Data Structure

Data is stored in Chrome's local storage with this structure:

```json
{
  "root": [
    {
      "pageTitle": "Example Page",
      "url": "https://example.com",
      "description": "Example description",
      "owner": "admin",
      "matchIdentify": "exactMatch",
      "savedFormData": [...],
      "presets": [...]
    }
  ]
}
```

## Development Scripts

- `npm run build` - Production build
- `npm run dev` - Development build with watch mode
- `npm run clean` - Clean dist folder

## Project Structure

```
form-filler/
├── public/              # Static files (copied to dist)
│   ├── manifest.json    # Extension manifest
│   ├── popup.html       # Extension popup
│   ├── preset-manager.html
│   └── *.css           # Stylesheets
├── src/
│   ├── background/     # Service worker
│   ├── content/        # Content script
│   ├── popup/          # Popup script
│   ├── pages/          # Additional pages
│   ├── services/       # Storage service
│   ├── types/          # TypeScript types
│   └── utils/          # Utility functions
├── dist/               # Build output (load this in Chrome)
├── package.json
├── tsconfig.json
└── webpack.config.js
```

## Notes

- The extension uses Manifest V3
- TypeScript is compiled to ES2020
- All data is stored locally using Chrome Storage API
- Icons need to be added to `public/icons/` (16x16, 48x48, 128x128)
