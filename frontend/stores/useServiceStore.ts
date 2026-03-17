import { createCRUDStore } from './factories/createCRUDStore';
import { API_ENDPOINTS } from '@/lib/endpoints';

export interface ServiceItem {
    id: number;
    name: string;
    description?: string;
    unit_price: number;
    selling_price?: number;
    category_id?: number;
    category_name?: string;
    item_type: 'service';
    taxable: boolean;
    inventory_control: boolean;
    sellable: boolean;
    unit_name?: string;
    created_at?: string;
}

export const useServiceStore = createCRUDStore<ServiceItem>({
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
    transform: (raw: unknown[]): ServiceItem[] =>
        (raw as Record<string, any>[]).map(s => ({
            ...s,
            selling_price: parseFloat(s.unit_price) || 0,
            item_type: 'service' as const,
            taxable: s.taxable ?? true,
            inventory_control: false,
            sellable: s.sellable ?? true,
        } as ServiceItem)),
});
