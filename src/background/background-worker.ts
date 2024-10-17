chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        console.log(`Tab updated: ${tab.url}`);
    }
});

chrome.tabs.onActivated.addListener(activeInfo => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (tab.url) {
            console.log(`Tab activated: ${tab.url}`);
        }
    });
});

chrome.webNavigation.onCompleted.addListener((details) => {
    console.log(`Navigation completed on tabId: ${details.tabId}, URL: ${details.url}`);
}, { url: [{ urlMatches: 'https://*/*' }, { urlMatches: 'http://*/*' }] });