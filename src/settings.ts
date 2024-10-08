import * as Site from './sites.js';
import { Sites, Site as SiteType } from './types';
import { MultiSelectTag} from './MultiSelectTag.js';
class Settings {
    Site: any;
    siteList: HTMLElement | null;
    blockButton : HTMLElement | null;
    sites: Sites = {};
    blockedPopupState: boolean = false;
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

    openBlockedPopup() {
        if(!this.blockedPopupState && this.modal != null){
            this.modal.classList.add("open-modal");
            this.blockedPopupState = true;
            this.displayListUnblockedSites();
        }
    }
    closeBlockedPopup() {
        if(this.blockedPopupState && this.modal != null){
            this.modal.classList.remove("open-modal");
            this.blockedPopupState = false;
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
                                const selectedPriorities: string[] = [];
                                console.log("yo test", priorities);
                                // ERROR IS HAPPENING HERE
                                const multiSelectTag = new MultiSelectTag('priority-select', {
                                    placeholder: 'Select priorities...',
                                    onChange: (selectedValues) => {
                                        selectedPriorities.length = 0;
                                        selectedValues.forEach(value => selectedPriorities.push(value.value));
                                        this.savePriorities(selectedPriorities, key);
                                    },
                                    tagColor: {
                                        textColor: '#FF5D29',
                                        borderColor: '#FF5D29',
                                        bgColor: '#FFE9E2'
                                    }
                                });
                                // ERROR IS HAPPENING BEFORE HERE
                                const prioritySelect = document.createElement('select');
                                prioritySelect.id = 'priority-select'; 
                                prioritySelect.className = "blocked-site-select";
                                prioritySelect.multiple = true;  
                            
                                // Populate the select options
                                Object.entries(priorities).forEach(([priorityKey, description]) => {
                                    const option = document.createElement('option');
                                    option.value = priorityKey;
                                    option.textContent = description;
                                    option.selected = false; // Default to not selected
                            
                                    prioritySelect.appendChild(option);
                                });
                            
                                // Add the select element to the MultiSelectTag instance
                                if(multiSelectTag != null){
                                    multiSelectTag.appendSelectElement(prioritySelect);
                                    const container = multiSelectTag.container;
                                    if(container != null){
                                        siteInfo.appendChild(container);
                                    }
                                }
                                
                                const submitButton = document.createElement('button');
                                submitButton.textContent = "Update Priorities";
                                submitButton.addEventListener('click', () => {
                                    // this.updateSitePriorities(key, selectedPriorities);
                                    console.log("Our updated priorities : " , selectedPriorities , " for value: " , key)
                                });
                                siteInfo.appendChild(submitButton);
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
    savePriorities(priorities : string[], siteKey : string) {
        console.log("Our priorities are: " , priorities , " for site: " , siteKey);
    }
    addAffectedSite(site : SiteType, name : string) {
        this.Site.retrieveSites((retrievedSites : Sites) => {
            this.sites = retrievedSites;
            if (!this.sites || typeof this.sites !== 'object' || Object.keys(this.sites).length === 0) {
                this.sites = {};
            }
            this.sites[name] = {url : site.url , priority : site.priority? site.priority : 1};
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
