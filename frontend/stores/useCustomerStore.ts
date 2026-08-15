import { catalogMessage } from "@/lib/i18n";
import { createCRUDStore } from './factories/createCRUDStore';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { Customer } from '@/types';

/**
 * Zustand store for AR Customers.
 * Replaces the old `useCustomers` custom hook with a global, cached store.
 */
export const useCustomerStore = createCRUDStore<Customer>({
    endpoint: API_ENDPOINTS.FINANCE.AR.CUSTOMERS,
    storeName: 'customer-store',
    messages: {
        loadError: catalogMessage("state.usecustomerstore.errorLoadingCustomers"),
        saveSuccess: catalogMessage("state.usecustomerstore.customerAddedSuccessfully"),
        updateSuccess: catalogMessage("state.usecustomerstore.clientUpdatedSuccessfully"),
        saveError: catalogMessage("common.general.serverConnectionError.alternative2"),
        deleteSuccess: catalogMessage("state.usecustomerstore.customerDeleted"),
        deleteError: catalogMessage("state.usecustomerstore.errorDeletingCustomer"),
    },
});
