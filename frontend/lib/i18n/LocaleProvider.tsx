"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_LOCALE, getDictionary, getLocaleMetadata, resolveSupportedLocale } from "./registry";
import type { I18nContextValue, SupportedLocale } from "./types";

const LOCALE_STORAGE_KEY = "accore.locale";
const I18nContext = createContext<I18nContextValue | null>(null);
const diagnosticEvents = new Set<string>();

function reportFallback(event: string): void {
    if (process.env.NODE_ENV === "production" || diagnosticEvents.has(event)) return;
    diagnosticEvents.add(event);
    console.warn(`[i18n] ${event}`);
}

function readPersistedLocale(initialLocale: SupportedLocale): SupportedLocale {
    if (typeof window === "undefined") return initialLocale;
    try {
        return resolveSupportedLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY));
    } catch {
        reportFallback("Locale persistence was unavailable; using the initial locale.");
        return initialLocale;
    }
}

function toDate(value: Date | string | number): Date {
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? new Date() : date;
}

export function LocaleProvider({ children, initialLocale = DEFAULT_LOCALE }: { children: React.ReactNode; initialLocale?: SupportedLocale }) {
    const [locale, setLocaleState] = useState<SupportedLocale>(() => readPersistedLocale(initialLocale));
    const metadata = getLocaleMetadata(locale);

    const setLocale = useCallback((candidate: SupportedLocale) => {
        const resolved = resolveSupportedLocale(candidate);
        setLocaleState(resolved);
        try {
            window.localStorage.setItem(LOCALE_STORAGE_KEY, resolved);
        } catch {
            reportFallback("Locale selection could not be persisted.");
        }
    }, []);

    useEffect(() => {
        document.documentElement.lang = metadata.languageTag;
        document.documentElement.dir = metadata.direction;
        document.documentElement.style.setProperty("--app-font-family", metadata.fontFamily);
    }, [metadata]);

    const value = useMemo<I18nContextValue>(() => ({
        locale,
        metadata,
        t: getDictionary(locale),
        format: {
            number: (input, options) => new Intl.NumberFormat(metadata.formattingLocale, options).format(input),
            currency: (input, currency = "SAR") => new Intl.NumberFormat(metadata.formattingLocale, { style: "currency", currency, maximumFractionDigits: 2 }).format(input),
            date: (input, options) => new Intl.DateTimeFormat(metadata.formattingLocale, options ?? { dateStyle: "medium" }).format(toDate(input)),
        },
        setLocale,
    }), [locale, metadata, setLocale]);

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error("useI18n must be used inside LocaleProvider.");
    }
    return context;
}
