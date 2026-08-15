import { catalogMessage } from "@/lib/i18n";
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { fetchAPI } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';

interface SystemSettings {
    store_name?: string;
    store_address?: string;
    store_phone?: string;
    store_email?: string;
    tax_number?: string;
    cr_number?: string;
    invoice_size?: 'thermal' | 'a4';
    footer_message?: string;
    currency_symbol?: string;
    [key: string]: unknown;
}

interface SettingsState {
    settings: SystemSettings | null;
    isLoading: boolean;
    initSettings: () => Promise<SystemSettings | null>;
    getSetting: <T = unknown>(key: string, defaultValue?: T) => T;
}

let initPromise: Promise<SystemSettings | null> | null = null;

export const useSettingsStore = create<SettingsState>()(
    devtools(
        (set, get) => ({
            settings: null,
            isLoading: false,

            initSettings: async () => {
                const current = get().settings;
                if (current && Object.keys(current).length > 0) return current;

                if (initPromise) {
                    return initPromise;
                }

                set({ isLoading: true });

                initPromise = (async () => {
                    try {
                        const result = await fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.SETTINGS.INDEX);
                        const rawData = result.settings || result.data || result;
                        
                        let settingsObj: SystemSettings = {};
                        
                        if (Array.isArray(rawData)) {
                            rawData.forEach((item: any) => {
                                if (item.setting_key || item.key) {
                                    settingsObj[item.setting_key || item.key] = item.setting_value ?? item.value;
                                }
                            });
                        } else if (typeof rawData === 'object' && rawData !== null) {
                            settingsObj = rawData as SystemSettings;
                        }

                        set({ settings: settingsObj, isLoading: false });
                        return settingsObj;
                    } catch (e) {
                        console.error(catalogMessage("text_e19f4348c1b5"), e);
                        set({ settings: {}, isLoading: false });
                        return null;
                    } finally {
                        initPromise = null;
                    }
                })();

                return initPromise;
            },

            getSetting: <T>(key: string, defaultValue?: T): T => {
                const { settings } = get();
                if (!settings) return defaultValue as T;
                return (settings[key] !== undefined ? settings[key] : defaultValue) as T;
            }
        }),
        { name: 'settings-store' }
    )
);
