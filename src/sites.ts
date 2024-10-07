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

export function getSitePriorities(key: string, callback: (priorityRules: { [priorityLevel: string]: string } | undefined) => void) {
    fetch('/site-data/base-sites.json')
        .then(response => response.json())
        .then((data) => {
            if (data.hasOwnProperty(key) && data[key]) {
                const currSite = data[key];
                if (currSite.priorityRules) {
                    callback(currSite.priorityRules);
                    console.log("Priority rules found for site:", currSite.priorityRules);
                } else {
                    callback(undefined);
                    console.log("No priority rules found for site:", currSite);
                }
            } else {
                callback(undefined);
                console.log("Site key not found:", key);
            }
        })
        .catch(error => {
            console.error('Error fetching the sites:', error);
            callback(undefined);  
        });
}
