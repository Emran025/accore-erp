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
        loadError: 'خطأ في تحميل الخدمات',
        saveSuccess: 'تمت إضافة الخدمة بنجاح',
        updateSuccess: 'تم تحديث الخدمة بنجاح',
        saveError: 'خطأ في حفظ الخدمة',
        deleteSuccess: 'تم حذف الخدمة',
        deleteError: 'خطأ في حذف الخدمة',
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
