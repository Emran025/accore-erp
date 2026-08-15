import { catalogMessage } from "@/lib/i18n";
import { SalesRepresentative } from '@/app/02-commercial/marketing-distribution/representatives/reps-list/(pages)/types';
import { createCRUDStore } from './factories/createCRUDStore';
import { API_ENDPOINTS } from '@/lib/endpoints';

export const useSalesRepresentativeStore = createCRUDStore<SalesRepresentative>({
    endpoint: API_ENDPOINTS.COMMERCIAL.SALES.REPRESENTATIVES.BASE,
    storeName: 'sales-representative-store',
    messages: {
        loadError: catalogMessage("text_41d1d8701fd1"),
        saveSuccess: catalogMessage("text_ff783ee2826d"),
        updateSuccess: catalogMessage("text_e1d61adfff9f"),
        saveError: catalogMessage("text_c574313242be"),
        deleteSuccess: catalogMessage("text_12b6e3813b40"),
        deleteError: catalogMessage("text_3bdb299872fb"),
    },
});
