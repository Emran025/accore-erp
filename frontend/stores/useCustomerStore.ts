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
        loadError: catalogMessage("text_b54ebc83b603"),
        saveSuccess: catalogMessage("text_313b10d64a4e"),
        updateSuccess: catalogMessage("text_26eea6c87f71"),
        saveError: catalogMessage("text_5f43e62ef2a3"),
        deleteSuccess: catalogMessage("text_a5ef3dd855aa"),
        deleteError: catalogMessage("text_1810b81c9a85"),
    },
});
