export interface Site {
    url: string;
    priority: number;
}
export type Sites = Record<string, Site>;