import { catalogMessage } from "@/lib/i18n";
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { fetchAPI } from '@/lib/api';
import { showToast } from '@/components/ui';

/**
 * State shape for any CRUD store created by this factory.
 */
export interface CRUDState<T> {
    items: T[];
    currentPage: number;
    totalPages: number;
    isLoading: boolean;
    lastFetched: number | null;

    load: (page?: number, search?: string) => Promise<void>;
    save: (data: Record<string, unknown>, id?: number) => Promise<boolean>;
    remove: (id: number) => Promise<boolean>;
    invalidate: () => void;
}

/**
 * Configuration for creating a CRUD store.
 */
export interface CRUDConfig<T = unknown> {
    /** API endpoint path (e.g. API_ENDPOINTS.SUPPLY_CHAIN.PRODUCTS) */
    endpoint: string;
    /** DevTools store name (e.g. 'product-store') */
    storeName: string;
    /** Items per page, defaults to 10 */
    itemsPerPage?: number;
    /** Cache TTL in milliseconds, defaults to 5 minutes */
    cacheTTL?: number;
    /** Custom toast messages in Arabic */
    messages?: {
        loadError?: string;
        saveSuccess?: string;
        updateSuccess?: string;
        saveError?: string;
        deleteSuccess?: string;
        deleteError?: string;
    };
    /**
     * Optional transform applied to the raw data array returned from the API.
     * Use this to map backend field names to frontend-friendly names.
     */
    transform?: (raw: unknown[]) => T[];
    /**
     * Optional static query parameter to append to every load request.
     */
    params?: Record<string, string>;
}

/**
 * Creates a fully-typed Zustand CRUD store with pagination, caching,
 * devtools, and toast notifications.
 *
 * @example
 * ```ts
 * export const useProductStore = createCRUDStore<Product>({
 *   endpoint: API_ENDPOINTS.SUPPLY_CHAIN.PRODUCTS,
 *   storeName: 'product-store',
 * });
 * ```
 */
export function createCRUDStore<T extends { id: number }>(config: CRUDConfig<T>) {
    const {
        endpoint,
        storeName,
        itemsPerPage = 10,
        // cacheTTL = 5 * 60 * 1000,
        messages = {},
        transform,
    } = config;

    return create<CRUDState<T>>()(
        devtools(
            (set, get) => ({
                items: [],
                currentPage: 1,
                totalPages: 1,
                isLoading: false,
                lastFetched: null,

                load: async (page = 1, search = '') => {
                    set({ isLoading: true });
                    try {
                        let url = `${endpoint}?page=${page}&limit=${itemsPerPage}&search=${encodeURIComponent(search)}`;
                        
                        // Append extra params if provided
                        if (config.params) {
                            Object.entries(config.params).forEach(([key, value]) => {
                                url += `&${key}=${encodeURIComponent(value)}`;
                            });
                        }

                        const res = await fetchAPI(url);
                        if (res.success) {
                            const raw = res.data ?? [];
                            let itemsToTransform: unknown[] = [];
                            let totalPages = 1;

                            if (Array.isArray(raw)) {
                                itemsToTransform = raw;
                            } else if (raw && typeof raw === 'object') {
                                const paginated = raw as Record<string, unknown>;
                                if (Array.isArray(paginated.data)) {
                                    itemsToTransform = paginated.data as unknown[];
                                    totalPages = (paginated.last_page as number) || 1;
                                }
                            }

                            // Also check pagination object from BaseApiController
                            const pagination = res.pagination as Record<string, unknown> | undefined;
                            if (pagination?.total_pages) {
                                totalPages = pagination.total_pages as number;
                            }

                            const items = transform
                                ? transform(itemsToTransform)
                                : (itemsToTransform as T[]);

                            set({
                                items,
                                totalPages,
                                currentPage: page,
                                lastFetched: Date.now(),
                            });
                        } else {
                            showToast(res.message || messages.loadError || catalogMessage("common.general.errorLoadingData"), 'error');
                        }
                    } catch {
                        showToast(messages.loadError || catalogMessage("common.general.errorLoadingData"), 'error');
                    } finally {
                        set({ isLoading: false });
                    }
                },

                save: async (data, id?) => {
                    try {
                        const url = id ? catalogMessage("common.general.message", { value0: endpoint, value1: id }) : endpoint;
                        const res = await fetchAPI(url, {
                            method: id ? 'PUT' : 'POST',
                            body: JSON.stringify(data),
                        });
                        if (res.success) {
                            showToast(
                                id
                                    ? (messages.updateSuccess || catalogMessage("common.general.updatedSuccessfully"))
                                    : (messages.saveSuccess || catalogMessage("state.createcrudstore.addedSuccessfully")),
                                'success'
                            );
                            // Invalidate cache so next load is fresh
                            get().invalidate();
                            return true;
                        }
                        showToast(res.message || messages.saveError || catalogMessage("common.general.failedSave"), 'error');
                        return false;
                    } catch {
                        showToast(messages.saveError || catalogMessage("common.general.errorSaving"), 'error');
                        return false;
                    }
                },

                remove: async (id) => {
                    try {
                        const res = await fetchAPI(catalogMessage("common.general.message", { value0: endpoint, value1: id }), { method: 'DELETE' });
                        if (res.success) {
                            showToast(messages.deleteSuccess || catalogMessage("state.createcrudstore.deleted"), 'success');
                            // Optimistic removal from local items
                            set(state => ({ items: state.items.filter(item => item.id !== id) }));
                            return true;
                        }
                        showToast(res.message || messages.deleteError || catalogMessage("common.general.deletionFailed"), 'error');
                        return false;
                    } catch {
                        showToast(messages.deleteError || catalogMessage("common.general.deletionError"), 'error');
                        return false;
                    }
                },

                invalidate: () => set({ lastFetched: null }),
            }),
            { name: storeName }
        )
    );
}
