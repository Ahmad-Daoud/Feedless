import { Sites } from './types';

export function saveSites(sites: Sites): void { 
    // Saves selected sites and their properties to the user's chrome storage
    chrome.storage.sync.set({ sites: sites });
}

export function retrieveSites(callback: (sites: Sites) => void): void { 
    // Retrieves the sites that the user has activated
    chrome.storage.sync.get("sites", function(result) {
        if (result.sites) {
            callback(result.sites); 
        } else {
            callback({}); 
        }
    });
}

export function addUserSitePriority(siteKey: string, priority: string, callback: () => void) {
    // This adds the priority that the user has personally selected for said site
    retrieveSites((sites) => {
        if (!sites || typeof sites !== 'object' || Object.keys(sites).length === 0) {
            sites = {};
        }
        if (sites[siteKey]) {
            getSitePriorities(siteKey, (priorityRules) => {
                if (priorityRules) {
                    if (priorityRules.hasOwnProperty(priority) && !sites[siteKey].priority.includes(priority)) {
                        console.log(sites[siteKey], " sepa " ,sites[siteKey].priority);
                        sites[siteKey].priority.push(priority);
                        saveSites(sites);
                        console.log("added new priority! here's the array : " , sites)
                        callback();
                    } else {
                        console.error("Attempted to add invalid property : " , priority , " for site: " , siteKey);
                    }
                } else {
                    console.error("Priority rules not found for site:", siteKey);
                }
            })
        }
        callback();
    });
}
export function removeUserSitePriority(siteKey: string, priority: string, callback: () => void) {
    // This removes the priority that the user has personally selected for said site
    retrieveSites((sites) => {
        if (!sites || typeof sites !== 'object' || Object.keys(sites).length === 0) {
            sites = {};
        }
        if (sites[siteKey]) {
            getSitePriorities(siteKey, (priorityRules) => {
                if (priorityRules) {
                    if (priorityRules.hasOwnProperty(priority)) {
                        sites[siteKey].priority = sites[siteKey].priority.filter((p) => p !== priority);
                        saveSites(sites);
                        console.log("removed priority! here's the array : " , sites)
                        callback();
                    } else {
                        console.error("Attempted to remove invalid property : " , priority , " for site: " , siteKey);
                    }
                } else {
                    console.error("Priority rules not found for site:", siteKey);
                }
            })
        }
    });
    callback();
}   
export function getSitePriorities(key: string, callback: (priorityRules: { [priorityLevel: string]: string } | undefined) => void) {
    // This fetches the site's base priorities from the base-sites.json file
    fetch('/site-data/base-sites.json')
        .then(response => response.json())
        .then((data) => {
            if (data.hasOwnProperty(key) && data[key]) {
                const currSite = data[key];
                if (currSite.priorityRules) {
                    callback(currSite.priorityRules);
                } else {
                    callback(undefined);
                }
            } else {
                callback(undefined);
                console.error("Site key not found:", key);
            }
        })
        .catch(error => {
            console.error('Error fetching the sites:', error);
            callback(undefined);  
        });
}
