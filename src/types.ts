export interface SiteElement {
    url: string;
    priority: string[];
}
export type Sites = Record<string, SiteElement>;