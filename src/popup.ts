// This js file will be used for displaying time information etc...
class Popup {
    htmlDoc : Document;
    selectElement : HTMLElement | null;
    disabledSelect : HTMLElement | null;
    settingsButton : HTMLElement | null;
    constructor() {
        this.htmlDoc = document;
        this.selectElement = this.htmlDoc.getElementById("theme-select");
        this.disabledSelect = this.htmlDoc.getElementById("disabled-select");
        this.loadTheme();
        this.settingsButton = document.querySelector("#settings-btn")
        this.selectElement?.addEventListener("change", (event) => {
            this.changeTheme((event.target as HTMLSelectElement).value);
        });
        if(this.settingsButton != null){
            this.settingsButton.addEventListener("click", function() {
                const settingsUrl = chrome.runtime.getURL("../settings/index.html");
                window.open(settingsUrl, '_blank');
            });
        }
    }
    loadTheme() {
        let theme : string | null = "";
        if(localStorage.getItem("Theme") != null) {
            theme = (localStorage.getItem("Theme"));
            console.log(theme);
        }
        const existingLink = this.htmlDoc.getElementById("theme-stylesheet");
        if (existingLink) {
            existingLink.remove();
        }
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.id = 'theme-stylesheet';
        if(theme == "dark") {
            link.href = '/popup/dark.css';
        }
        else if(theme == "light") {
            link.href = '/popup/light.css';
        }
        else if(theme == "solarized") {
            link.href = '/popup/solarized.css';
        }
        else {
            link.href = '/popup/brown.css';
        }
        if(this.disabledSelect != null && theme) {
            if(theme == "light") {
                this.disabledSelect.innerText = "Light Theme";
            }
            else if(theme == "dark") {
                this.disabledSelect.innerText = "Dark Theme";
            }
            else if(theme == "solarized") {
                this.disabledSelect.innerText = "Solarized Theme";
            }
            else {
                this.disabledSelect.innerText = "Brown Theme";
            }
        }
        this.htmlDoc.head.appendChild(link);
    }
    changeTheme(theme : string) {
        localStorage.setItem("Theme", theme);
        this.loadTheme();
    }
}
new Popup();