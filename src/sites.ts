export function saveSites(sites : string[]): void{
    localStorage.setItem("sites", JSON.stringify(sites));
}
export function retreiveSites() : string[]{
    if(localStorage.getItem("sites") != null){
        return JSON.parse(localStorage.getItem("sites") as string);
    }
    return [];
}