import * as Site from './sites.js';
import { Sites } from './types';
// import { Sites, SiteElement as SiteType } from './types';
class App{
    url : string;
    Site : any
    siteKey : string
    constructor(){
        this.url = window.location.href;
        this.siteKey = "";
        this.Site = Site
        console.log("My ts file is loaded!")
        this.Site.retrieveSites((siteResponse : Sites) => {
            for(const currSite in siteResponse){
                console.log(currSite);
            }
        })
    }
    checkTimeout(){
        // This function returns whether or not there is a timeout on the page and return the amount (0 if none)
        
    }
}
new App();