class Settings{
    siteList : HTMLElement | null;
    constructor(){
        this.siteList = document.querySelector("#blocked-sites-list")
        this.displayBlockedSites();
        this.loadTheme();
    }
    displayBlockedSites(){
        var finalHTML : string = "";
        // Go through a foreach loop throughout every blocked site

        // Remove Later
        finalHTML = `
            <div class="site">Site1</div>
            <div class="site">Site2</div>
            <div class="site">Site3</div>
        `;
        // Remove Later
        
        if(this.siteList != null){
            this.siteList.innerHTML = finalHTML;
        }
    }
    addBlockedSite(){
        // Adding blocked site
        this.displayBlockedSites();
    }
    loadTheme() {
        let theme : string | null = "";
        if(localStorage.getItem("Theme") != null) {
            theme = (localStorage.getItem("Theme"));
            console.log(theme);
        }
        const existingLink = document.getElementById("theme-stylesheet");
        if (existingLink) {
            existingLink.remove();
        }
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.id = 'theme-stylesheet';
        if(theme == "dark") {
            link.href = '/settings/dark.css';
        }
        else if(theme == "light") {
            link.href = '/settings/light.css';
        }
        else if(theme == "solarized") {
            link.href = '/settings/solarized.css';
        }
        else {
            link.href = '/settings/brown.css';
        }
        document.head.appendChild(link);
    }
    changeTheme(theme : string) {
        localStorage.setItem("Theme", theme);
        this.loadTheme();
    }
}
new Settings();