import * as Site from './sites.js';
import { Sites } from './types';
class Settings {
    Site: any;
    siteList: HTMLElement | null;
    sites: Sites = {};
    
    constructor() {
        this.Site = Site;
        this.siteList = document.querySelector("#blocked-sites-list");
        this.displayBlockedSites();
        this.loadTheme();
    }

    displayBlockedSites() {
        var finalHTML: string = "";
        this.Site.retrieveSites((retrievedSites : Sites) => {
            this.sites = retrievedSites;
            if (!this.sites || typeof this.sites !== 'object' || Object.keys(this.sites).length === 0) {
                finalHTML = "<p>You have not yet chosen any sites.</p>";
            } else {
                // Go through each blocked site
                for (const key in this.sites) {
                    if (this.sites.hasOwnProperty(key)) {
                        const site = this.sites[key]; // types.ts for properties
                        finalHTML += `<div> <h2>${key}</h2> <p>${site.url}</p><p>${site.priority}</p></div>`;
                    }
                }
            }
            if (this.siteList != null) {
                this.siteList.innerHTML = finalHTML;
            }
        });
    }

    // addAffectedSite(site: string) {
    //     this.sites.push(site);
    //     this.Site.saveSites(this.sites);
    //     this.displayBlockedSites();
    // }

    changeTheme(theme: string) {
        chrome.storage.sync.set({Theme : theme});
        this.loadTheme();
    }

    loadTheme() {
        chrome.storage.sync.get("Theme" , (result) => {
            let theme: string | null = "";
            if(result.Theme){
                theme = result.Theme;
            }
        
            const existingLink = document.getElementById("theme-stylesheet");
            if (existingLink) {
                existingLink.remove();
            }
            var link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.id = 'theme-stylesheet';
            if (theme == "dark") {
                link.href = '/settings/dark.css';
            } else if (theme == "light") {
                link.href = '/settings/light.css';
            } else if (theme == "solarized") {
                link.href = '/settings/solarized.css';
            } else {
                link.href = '/settings/brown.css';
            }
            document.head.appendChild(link);
        })
    }
}

new Settings();
