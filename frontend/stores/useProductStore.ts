import { catalogMessage } from "@/lib/i18n";
import { createCRUDStore } from './factories/createCRUDStore';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { Product } from '@/types';

/**
 * Zustand store for Products.
 * Replaces the old `useProducts` custom hook with a global, cached store.
 *
 * Product data is transformed to include UI-mapped fields (selling_price, stock, etc.)
 * so consuming components don't need to do manual mapping.
 */
export const useProductStore = createCRUDStore<Product>({
    endpoint: API_ENDPOINTS.SUPPLY_CHAIN.PRODUCTS,
    storeName: 'product-store',
    params: { item_type: 'all' },
    messages: {
        loadError: catalogMessage("text_bf68e6f346c3"),
        saveSuccess: catalogMessage("text_795c337065c1"),
        updateSuccess: catalogMessage("text_36ce2cca21ac"),
        saveError: catalogMessage("text_21257171efe4"),
        deleteSuccess: catalogMessage("text_a56ad80a480a"),
        deleteError: catalogMessage("text_0a0e34eb9478"),
    },
    transform: (raw: unknown[]): Product[] =>
        (raw as Record<string, any>[])
            .filter(item => item.item_type !== 'service') // Filter out services as they are managed on a different page
            .map(p => ({
                ...p,
                selling_price: parseFloat(p.unit_price) || 0,
                purchase_price: parseFloat(p.purchase_price || p.latest_purchase_price) || 0,
                stock: p.stock_quantity || 0,
                min_stock: 10,
                unit_type: p.unit_name === catalogMessage("text_cc7593424dc5") ? 'ctn' : 'piece',
                profit_margin: parseFloat(p.minimum_profit_margin) || 0,
                description: p.description || '',
            } as Product)),
});
