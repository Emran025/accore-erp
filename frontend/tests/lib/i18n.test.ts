import { describe, expect, it } from "vitest";
import { arSA } from "@/lib/i18n/dictionaries/ar-SA";
import { enUS } from "@/lib/i18n/dictionaries/en-US";
import { DEFAULT_LOCALE, getDictionary, getLocaleMetadata, resolveSupportedLocale } from "@/lib/i18n/registry";

function shapeOf(value: unknown): unknown {
    if (typeof value === "function") return `function:${value.length}`;
    if (Array.isArray(value)) return value.map(shapeOf);
    if (value && typeof value === "object") {
        return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, child]) => [key, shapeOf(child)]));
    }
    return typeof value;
}

describe("typed locale runtime", () => {
    it("keeps Arabic and English dictionary structures and message signatures aligned", () => {
        expect(shapeOf(arSA)).toEqual(shapeOf(enUS));
    });

    it("resolves only supported locales and falls back safely", () => {
        expect(resolveSupportedLocale("ar")).toBe("ar-SA");
        expect(resolveSupportedLocale("en-GB")).toBe("en-US");
        expect(resolveSupportedLocale("fr-FR")).toBe(DEFAULT_LOCALE);
        expect(resolveSupportedLocale(null)).toBe(DEFAULT_LOCALE);
    });

    it("provides immutable dictionary access without a raw-key fallback", () => {
        const dictionary = getDictionary("en-US");
        expect(Object.isFrozen(dictionary)).toBe(true);
        expect(dictionary.feedback.unavailable).toBe("This content is currently unavailable.");
        expect(dictionary.messages.recordsShown({ count: 3, total: 12 })).toBe("Showing 3 of 12 records");
    });

    it("contains the complete generated catalog in both locales", () => {
        expect(Object.keys(arSA.catalog).length).toBeGreaterThan(3000);
        expect(Object.keys(enUS.catalog)).toEqual(Object.keys(arSA.catalog));
    });

    it("uses descriptive English semantic labels instead of opaque generated catalog keys", () => {
        const semanticKey = /^[a-z][A-Za-z0-9]*(?:\.[a-z][A-Za-z0-9]*){2,}(?:\.alternative\d+)?$/;
        const keys = Object.keys(arSA.catalog);
        expect(keys.every((key) => semanticKey.test(key))).toBe(true);
        expect(keys.some((key) => key.startsWith("text_"))).toBe(false);
    });

    it("exposes direction and formatting metadata through the locale registry", () => {
        expect(getLocaleMetadata("ar-SA")).toMatchObject({ direction: "rtl", formattingLocale: "ar-SA" });
        expect(getLocaleMetadata("en-US")).toMatchObject({ direction: "ltr", formattingLocale: "en-US" });
    });
});
