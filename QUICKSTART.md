# Quick Start Guide

## Installation Steps

### 1. Install Dependencies

If you're behind a corporate proxy, you may need to configure npm first:

```bash
# Set proxy (if needed)
npm config set proxy http://your-proxy:port
npm config set https-proxy http://your-proxy:port

# Or bypass proxy for specific registry
npm config set registry https://registry.npmjs.org/
```

Then install:
```bash
npm install
```

### 2. Build the Extension

```bash
npm run build
```

This creates the `dist` folder with the compiled extension.

### 3. Load in Chrome

1. Open Chrome: `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **"Load unpacked"**
4. Select the `dist` folder
5. The extension icon should appear in your toolbar!

## Development Mode

For active development with auto-rebuild:

```bash
npm run dev
```

This watches for file changes and automatically rebuilds.

## Troubleshooting

### Proxy Issues

If `npm install` fails with 407 error:
1. Check your proxy settings
2. Try using a different network
3. Or manually download dependencies

### TypeScript Errors

Make sure you're using Node.js v14+:
```bash
node --version
```

### Extension Not Loading

1. Check the Chrome console for errors
2. Make sure all icon files exist (or remove icon references temporarily)
3. Verify `dist` folder contains all files

## Testing the Extension

1. **Enable Auto-fill**: Click extension icon, check "Enable Auto-fill Popup"
2. **Visit any page** with text inputs
3. **Focus on input**: Should see auto-fill popup appear with multiple sections:
   - Random String Generator with charset options
   - Regex Patterns (if configured)
   - String Counter tool
   - Saved Values section
4. **Test String Generator**: 
   - Try different charsets (alphabet, numeric, alphanumeric, special)
   - Observe character count limits based on element maxlength
5. **Test String Counter**: Open counter modal, paste text and view character/word/line counts
6. **Create Regex Patterns**: In Settings → Regex Patterns, add patterns and test generation
7. **Create page config**: Click extension icon → Create New Page
8. **Create preset**: After creating page → Create preset with form fields

## Next Steps

- Add actual PNG icons to `public/icons/` (see icons/README.md)
- Customize styles in `public/*.css`
- Add more form field types as needed
- Export/import presets feature
- Add keyboard shortcuts
