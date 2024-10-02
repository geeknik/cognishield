chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateBadge") {
    chrome.action.setBadgeText({ text: request.data.text, tabId: sender.tab.id });
    chrome.action.setBadgeBackgroundColor({ color: request.data.color, tabId: sender.tab.id });
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading') {
    chrome.action.setBadgeText({ text: '', tabId: tabId });
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get('sensitivity', function(data) {
    if (!data.sensitivity) {
      chrome.storage.sync.set({sensitivity: '65'});
    }
  });
});
