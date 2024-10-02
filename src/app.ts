class App{
    addBlockedPage(url: string){
        chrome.runtime.sendMessage({action: "addBlockedPage", url: url});
    }
}
new App();