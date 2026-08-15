export { arCatalog } from "./ar-SA";
export { enCatalog } from "./en-US";
export type CatalogKey = keyof typeof import("./ar-SA").arCatalog;
export type CatalogDictionary = Readonly<Record<CatalogKey, string>>;
