import { catalogMessage } from "@/lib/i18n";
import { createCRUDStore } from './factories/createCRUDStore';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { Product as Service } from '@/types';

/**
 * Zustand store for Services.
 * Services are a subset of items that don't track inventory.
 */
export const useServiceStore = createCRUDStore<Service>({
    endpoint: API_ENDPOINTS.COMMERCIAL.SERVICES.BASE,
    storeName: 'service-store',
    messages: {
        loadError: catalogMessage("text_2567903dd0bd"),
        saveSuccess: catalogMessage("text_9df81bf2a0d8"),
        updateSuccess: catalogMessage("text_3b9e9f188077"),
        saveError: catalogMessage("text_32040c7944f8"),
        deleteSuccess: catalogMessage("text_ff360bbaf64a"),
        deleteError: catalogMessage("text_8d15356c1d39"),
    },
    transform: (raw: unknown[]): Service[] =>
        (raw as Record<string, any>[]).map(s => ({
            ...s,
            selling_price: parseFloat(s.unit_price) || 0,
            purchase_price: 0, // Services typically don't have purchase price in this context
            stock: 0,
            min_stock: 0,
            unit_type: 'service',
            profit_margin: 0,
            description: s.description || '',
            item_type: 'service',
            inventory_control: false,
            sellable: true,
            taxable: s.taxable ?? true,
        } as Service)),
});
