import * as Site from './sites.js';
import { Sites, SiteElement as SiteType } from './types';
class Settings {
    Site: any;
    siteList: HTMLElement | null;
    blockButton : HTMLElement | null;
    sites: Sites = {};
    popupState: boolean = false;
    modal : HTMLElement | null;
    modalchoicelist : HTMLElement | null;
    constructor() {
        this.Site = Site;
        this.siteList = document.querySelector("#blocked-sites-list");
        this.blockButton = document.querySelector("#add-blocked-btn");
        this.modal = document.querySelector(".modal");
        this.displayBlockedSites();
        this.loadTheme();
        this.modalchoicelist = document.querySelector("#site-choice-list");
        if(this.blockButton != null){
            this.blockButton.addEventListener("click", () => {
                this.openBlockedPopup();
            });
        }
        document.addEventListener("keydown", (event) => {
            // Close modal with esc
            if (event.key === "Escape") {
                this.closeBlockedPopup();
            }
        });
        if (this.modal != null) {
            this.modal.addEventListener("click", (event) => {
                const target = event.target as HTMLElement;
                const modalContent = this.modal!.querySelector(".modal-content");
                if (target === this.modal && !modalContent!.contains(target)) {
                    this.closeBlockedPopup();
                }
            });
        }
    }
    displayListUnblockedSites() {
        // This function is going to display the base sites which have not been chosen.
        // Fetch base sites here
        fetch('/site-data/base-sites.json')
        .then(response => response.json())
        .then((data) => {
            // Remove the sites that are already active
            Object.keys(data).forEach((siteName => {
                console.log(siteName);
                if (this.sites[siteName]) {
                    delete data[siteName];
                }
            }))
            // Display the remaining sites
            this.modalchoicelist!.innerHTML = "";
            Object.keys(data).forEach((siteName) => {
                const site = data[siteName];
                const siteElement = document.createElement("div");
                siteElement.innerHTML = `<h2>${siteName}</h2><p>${site.url}</p><button class="add-site-btn">Add</button>`;
                this.modalchoicelist!.appendChild(siteElement);
                siteElement.querySelector("button")!.addEventListener("click", () => {
                    this.addAffectedSite(site, siteName);
                    siteElement.remove();
                });
            });
        })
        .catch(error => console.error('Error fetching the sites:', error));
    }

    displayPriorityList(key : string) {
        this.Site.getSitePriorities(key, (priorities: { [propertyKey: string]: string }) => {
            this.modalchoicelist!.innerHTML = "";
            if (priorities) {
                this.Site.retrieveSites((retrievedSites : Sites) => {
                    for (const priority in priorities) {
                        if (priorities.hasOwnProperty(priority)) {
                            const priorityElement = document.createElement("div");
                            if(!retrievedSites[key].priority.includes(priority)){
                                priorityElement.innerHTML = `<h2>${priority}</h2><p>${priorities[priority]}</p><button class="add-site-btn">Add</button>`;
                            }
                            else{
                                priorityElement.innerHTML = `<h2>${priority}</h2><p>${priorities[priority]}</p><button class="add-site-btn">Remove</button>`;
                            }
                            this.modalchoicelist!.appendChild(priorityElement);
                            if(!retrievedSites[key].priority.includes(priority)){
                                priorityElement.querySelector("button")!.addEventListener("click", () => {
                                    this.addPriority(priority, key);
                                });
                            }
                            else{
                                priorityElement.querySelector("button")!.addEventListener("click", () => {
                                    this.removePriority(priority, key)
                                });
                            }
                        }
                        else{
                            console.log("Priority " , priority, " does not exist for : ", key);
                        }
                    }
                });
            } else {
                console.log("Priorities not found for: ", key);
            }
        })
    }

    openBlockedPopup() {
        if(!this.popupState && this.modal != null){
            this.modal.classList.add("open-modal");
            this.popupState = true;
            this.displayListUnblockedSites();
            this.modalchoicelist!.innerHTML = "";
        }
    }
    closeBlockedPopup() {
        if(this.popupState && this.modal != null){
            this.modal.classList.remove("open-modal");
            this.popupState = false;
            this.modalchoicelist!.innerHTML = "";
        }
    }
    openPriorityPopup(key:string) {
        if(!this.popupState && this.modal != null){
            this.modal.classList.add("open-modal");
            this.popupState = true;
            this.modalchoicelist!.innerHTML = "";
            this.displayPriorityList(key);
        }
    }
    closePriorityPopup() {
        if(this.popupState && this.modal != null){
            this.modal.classList.remove("open-modal");
            this.popupState = false;
            this.modalchoicelist!.innerHTML = "";
        }
    }
    displayBlockedSites() {
        var finalHTML: string = "";
        this.siteList!.innerHTML = "";
        this.Site.retrieveSites((retrievedSites : Sites) => {
            this.sites = retrievedSites;
            if (!this.sites || typeof this.sites !== 'object' || Object.keys(this.sites).length === 0) {
                finalHTML = '<p class="none-chosen">You have not yet chosen any sites.</p>';
                this.siteList!.innerHTML = finalHTML;
            } else {
                // Go through each blocked site
                for (const key in this.sites) {
                    if (this.sites.hasOwnProperty(key)) {
                        const siteElement = document.createElement('div');
                        siteElement.className = 'site-el';

                        const siteInfo = document.createElement('div');
                        siteInfo.className = 'site-info';
                        siteInfo.innerHTML = `<h2 class="blocked-site-name">${key}</h2>`;
                        this.Site.getSitePriorities(key, (priorities: { [propertyKey: string]: string }) => {
                            if (priorities) {
                                const priorityElement = document.createElement("button");
                                priorityElement.textContent = 'Change priority';
                                priorityElement.className = "blocked-site-priority-button"
                                priorityElement.addEventListener('click', () => {
                                    this.openPriorityPopup(key);
                                });
                                siteInfo.appendChild(priorityElement);
                            } else {
                                console.log("Not found for: ", key);
                            }
                        });
                        
                        const removeButton = document.createElement('button');
                        removeButton.textContent = 'Remove site';
                        removeButton.className = "blocked-site-remove-button"
                        removeButton.addEventListener('click', () => {
                            delete this.sites[key];
                            this.Site.saveSites(this.sites, () => this.displayBlockedSites());
                            this.displayBlockedSites();
                        });
                        siteElement.appendChild(siteInfo);
                        siteElement.appendChild(removeButton);

                        if (this.siteList != null) {
                            this.siteList.appendChild(siteElement);
                        }
                    }
                }
            }
        });
    }
    addPriority(priority : string, siteKey : string) {
        this.Site.addUserSitePriority(siteKey, priority, () => {this.displayPriorityList(siteKey)});
    }
    removePriority(priority : string, siteKey : string) {
        this.Site.removeUserSitePriority(siteKey, priority, () => {this.displayPriorityList(siteKey)});
    }
    addAffectedSite(site : SiteType, name : string) {
        this.Site.retrieveSites((retrievedSites : Sites) => {
            this.sites = retrievedSites;
            if (!this.sites || typeof this.sites !== 'object' || Object.keys(this.sites).length === 0) {
                this.sites = {};
            }
            // for future developpement : we can make it so we retrieve priorities if they already existed before. This is not necessary but might be quality of life
            this.sites[name] = {url : site.url , priority : []};
            this.Site.saveSites(this.sites);
            this.displayBlockedSites();
        });
    }

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
