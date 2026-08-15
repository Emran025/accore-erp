import { arSA } from "./dictionaries/ar-SA";
import { enUS } from "./dictionaries/en-US";
import { catalogText } from "./interpolate";
import type { CatalogKey } from "./catalog";
import type { AppDictionary, LocaleMetadata, SupportedLocale } from "./types";

export const DEFAULT_LOCALE: SupportedLocale = "ar-SA";

export const localeMetadata: Record<SupportedLocale, LocaleMetadata> = {
    "ar-SA": {
        code: "ar-SA",
        languageTag: "ar-SA",
        direction: "rtl",
        formattingLocale: "ar-SA",
        fontFamily: '"Cairo", "Outfit", sans-serif',
        displayName: "Arabic (Saudi Arabia)",
        nativeName: "العربية",
        fallback: null,
    },
    "en-US": {
        code: "en-US",
        languageTag: "en-US",
        direction: "ltr",
        formattingLocale: "en-US",
        fontFamily: '"Outfit", "Cairo", sans-serif',
        displayName: "English (United States)",
        nativeName: "English",
        fallback: "ar-SA",
    },
};

const dictionaries: Record<SupportedLocale, AppDictionary> = {
    "ar-SA": arSA,
    "en-US": enUS,
};

function deepFreeze<T>(value: T): Readonly<T> {
    if (value && typeof value === "object" && !Object.isFrozen(value)) {
        Object.freeze(value);
        Object.values(value as Record<string, unknown>).forEach((child) => deepFreeze(child));
    }
    return value;
}

Object.values(dictionaries).forEach((dictionary) => deepFreeze(dictionary));

export function resolveSupportedLocale(candidate?: string | null): SupportedLocale {
    if (!candidate) return DEFAULT_LOCALE;
    if (candidate === "ar" || candidate.startsWith("ar-")) return "ar-SA";
    if (candidate === "en" || candidate.startsWith("en-")) return "en-US";
    return DEFAULT_LOCALE;
}

export function getLocaleMetadata(locale?: string | null): LocaleMetadata {
    return localeMetadata[resolveSupportedLocale(locale)];
}

export function getDictionary(locale?: string | null): Readonly<AppDictionary> {
    return dictionaries[resolveSupportedLocale(locale)];
}

function getRuntimeLocale(): SupportedLocale {
    if (typeof window === "undefined") return DEFAULT_LOCALE;
    try {
        return resolveSupportedLocale(window.localStorage.getItem("accore.locale") ?? document.documentElement.lang);
    } catch {
        return resolveSupportedLocale(document.documentElement.lang);
    }
}

/** Safe non-hook lookup for server output, module configuration, and store messages. */
export function catalogMessage(key: CatalogKey, values?: Record<string, unknown>): string {
    return catalogText(getDictionary(getRuntimeLocale()), key, values);
}

export async function loadDictionary(locale?: string | null): Promise<Readonly<AppDictionary>> {
    return getDictionary(locale);
}

export function getLocaleRegistry(): Readonly<Record<SupportedLocale, LocaleMetadata>> {
    return localeMetadata;
}
