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
        loadError: catalogMessage("state.usesupplierstore.errorLoadingSuppliers"),
        saveSuccess: catalogMessage("state.usesupplierstore.supplierAddedSuccessfully"),
        updateSuccess: catalogMessage("state.usesupplierstore.supplierUpdatedSuccessfully"),
        saveError: catalogMessage("state.usesupplierstore.errorSavingSupplier"),
        deleteSuccess: catalogMessage("state.usesupplierstore.resourceDeleted"),
        deleteError: catalogMessage("state.usesupplierstore.errorDeletingResource"),
    },
});
