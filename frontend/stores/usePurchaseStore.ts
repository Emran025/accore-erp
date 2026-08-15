import { catalogMessage } from "@/lib/i18n";
import { createCRUDStore } from './factories/createCRUDStore';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { Purchase } from '@/types';

/**
 * Zustand store for Purchases.
 * Replaces the old `usePurchases` custom hook with a global, cached store.
 */
export const usePurchaseStore = createCRUDStore<Purchase>({
    endpoint: API_ENDPOINTS.COMMERCIAL.PROCUREMENT.BASE,
    storeName: 'purchase-store',
    messages: {
        loadError: catalogMessage("text_d3d262b8933e"),
        saveSuccess: catalogMessage("text_a8e1d2e98a29"),
        updateSuccess: catalogMessage("text_0ffa50a41cd6"),
        saveError: catalogMessage("text_5f43e62ef2a3"),
        deleteSuccess: catalogMessage("text_85da60fe762d"),
        deleteError: catalogMessage("text_5728aa53813e"),
    },
});
