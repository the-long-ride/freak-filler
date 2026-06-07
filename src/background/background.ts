import { StorageService } from '../services/storage.service';

// Store the last clicked element info
let lastClickedElement: { testId: string; querySelector: string } | null = null;

// Initialize storage when extension is installed
chrome.runtime.onInstalled.addListener(async () => {
  await StorageService.initialize();
  console.log('Freak Filler extension installed and initialized');
  
  // Check and add order values to regex patterns if missing
  const data = await StorageService.getData();
  if (data && data.regexPatterns && data.regexPatterns.length > 0) {
    let needsUpdate = false;
    data.regexPatterns.forEach((pattern, index) => {
      if (pattern.order === undefined) {
        pattern.order = index + 1;
        needsUpdate = true;
      }
    });
    
    if (needsUpdate) {
      await StorageService.setData(data);
      console.log('Migrated regex patterns with order values');
    }
  }
  
  // Create context menus
  chrome.contextMenus.create({
    id: 'showFillingAssistant',
    title: 'Open Filling Assistant',
    contexts: ['editable']
  });
  
  chrome.contextMenus.create({
    id: 'getElementSelector',
    title: 'Get element query selector',
    contexts: ['all']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab?.id) return;
  const tabId = tab.id as number;
  
  if (info.menuItemId === 'showFillingAssistant') {
    // Check settings before sending message
    StorageService.getSettings().then(settings => {
      const enabled =
        settings?.enableSaveValue ||
        settings?.enableImportValue ||
        settings?.enableLiveAssistant ||
        settings?.enableRandomStringInAssistant ||
        settings?.enableLocatorRetriever ||
        settings?.enableRegexPattern;
      if (!enabled) {
        console.log('Assistant disabled by settings; not opening from context menu');
        return;
      }
      // Send message to content script to show assistant
      try {
        chrome.tabs.sendMessage(tabId, { action: 'showAssistantFromContextMenu' });
      } catch (error) {
        console.warn('Failed to show assistant:', error);
      }
    }).catch(err => {
      console.warn('Failed to read settings before showing assistant:', err);
    });
  } else if (info.menuItemId === 'getElementSelector') {
    // Send message to content script to get and copy selector
    chrome.tabs.sendMessage(tab.id, { 
      action: 'getElementSelector' 
    }).catch(error => {
      console.warn('Failed to get selector:', error);
    });
  }
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getData') {
    StorageService.getData().then(data => {
      sendResponse({ data });
    });
    return true; // Keep the message channel open for async response
  }
});
