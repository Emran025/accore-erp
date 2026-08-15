import { catalogMessage } from "@/lib/i18n";
import { SalesRepresentative } from '@/app/02-commercial/marketing-distribution/representatives/reps-list/(pages)/types';
import { createCRUDStore } from './factories/createCRUDStore';
import { API_ENDPOINTS } from '@/lib/endpoints';

export const useSalesRepresentativeStore = createCRUDStore<SalesRepresentative>({
    endpoint: API_ENDPOINTS.COMMERCIAL.SALES.REPRESENTATIVES.BASE,
    storeName: 'sales-representative-store',
    messages: {
        loadError: catalogMessage("state.usesalesrepresentativestore.errorLoadingRepresentatives"),
        saveSuccess: catalogMessage("common.general.savedSuccessfully"),
        updateSuccess: catalogMessage("common.general.updatedSuccessfully"),
        saveError: catalogMessage("common.general.errorSaving"),
        deleteSuccess: catalogMessage("common.general.deletedSuccessfully"),
        deleteError: catalogMessage("common.general.deletionError"),
    },
});
