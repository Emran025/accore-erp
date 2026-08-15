import type { CatalogKey } from "./catalog";
import type { AppDictionary } from "./types";

export function interpolate(template: string, values: Record<string, unknown>): string {
    return template.replace(/\{([a-zA-Z][a-zA-Z0-9_]*)\}/g, (placeholder, name) => {
        const value = values[name];
        return value === undefined || value === null ? placeholder : String(value);
    });
}

export function catalogText(dictionary: Readonly<AppDictionary>, key: CatalogKey, values?: Record<string, unknown>): string {
    const template = dictionary.catalog[key];
    return values ? interpolate(template, values) : template;
}
