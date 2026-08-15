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
        loadError: catalogMessage("state.usepurchasestore.errorLoadingPurchases"),
        saveSuccess: catalogMessage("state.usepurchasestore.buyerAddedSuccessfully"),
        updateSuccess: catalogMessage("state.usepurchasestore.buyerUpdatedSuccessfully"),
        saveError: catalogMessage("common.general.serverConnectionError.alternative2"),
        deleteSuccess: catalogMessage("state.usepurchasestore.buyerDeleted"),
        deleteError: catalogMessage("state.usepurchasestore.errorDeletingBuyer"),
    },
});
