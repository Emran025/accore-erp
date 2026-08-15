import { catalogMessage } from "@/lib/i18n";
import { createCRUDStore } from './factories/createCRUDStore';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { Supplier } from '@/types';

/**
 * Zustand store for Suppliers (AP).
 * Replaces the old `useSuppliers` custom hook with a global, cached store.
 */
export const useSupplierStore = createCRUDStore<Supplier>({
    endpoint: API_ENDPOINTS.COMMERCIAL.PROCUREMENT.SUPPLIERS.BASE,
    storeName: 'supplier-store',
    messages: {
        loadError: catalogMessage("text_f16d554b1201"),
        saveSuccess: catalogMessage("text_c3c43d0e6ead"),
        updateSuccess: catalogMessage("text_fe9c8dd70f2a"),
        saveError: catalogMessage("text_f8f3b5e8914d"),
        deleteSuccess: catalogMessage("text_9c978d310493"),
        deleteError: catalogMessage("text_71e84db5a345"),
    },
});
