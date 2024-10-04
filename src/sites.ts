import { Sites } from './types';

export function saveSites(sites: Sites): void { 
    chrome.storage.sync.set({ sites: sites });
}

export function retrieveSites(callback: (sites: Sites) => void): void { 
    chrome.storage.sync.get("sites", function(result) {
        if (result.sites) {
            callback(result.sites); 
        } else {
            callback({}); 
        }
    });
}