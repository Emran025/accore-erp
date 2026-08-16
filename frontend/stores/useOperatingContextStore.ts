import { catalogMessage } from "@/lib/i18n";
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { fetchAPI } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';

export interface OperatingContext {
  id: number;
  org_node_uuid: string | null;
  warehouse_id: number | null;
  pos_terminal_id: number | null;
  cost_center_id: number | null;
  profit_center_id: number | null;
  status: 'draft' | 'ready' | 'suspended';
  is_default: boolean;
  warehouse?: {
    id: number;
    code: string;
    name: string;
    name_en?: string | null;
    is_active: boolean;
  };
  pos_terminal?: {
    id: number;
    code: string;
    name: string;
    name_en?: string | null;
    is_active: boolean;
  };
}

export interface OperatingReadiness {
  ready: boolean;
  status: 'draft' | 'ready';
  checks: Array<{ key: string; complete: boolean; action_key: string | null }>;
  missing: Array<{ key: string; complete: boolean; action_key: string }>;
  next_action: string | null;
  structural_readiness: {
    ready: boolean;
    reason_codes: string[];
    node_uuids: string[];
  };
  context: OperatingContext | null;
}

interface OperatingContextState {
  readiness: OperatingReadiness | null;
  isLoading: boolean;
  error: string | null;
  loadReadiness: () => Promise<OperatingReadiness | null>;
  selectContext: (id: number) => Promise<boolean>;
}

export const useOperatingContextStore = create<OperatingContextState>()(
  devtools(
    (set) => ({
      readiness: null,
      isLoading: false,
      error: null,
      loadReadiness: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetchAPI(
            API_ENDPOINTS.ENTERPRISE_CORE.OPERATING_CONTEXT.READINESS
          );
          if (!response.success) {
            set({
              error: response.message || catalogMessage("common.general.unableLoadOperatingReadiness"),
              isLoading: false,
            });
            return null;
          }
          const readiness = response.data as OperatingReadiness;
          set({ readiness, isLoading: false });
          return readiness;
        } catch (error) {
          console.error(catalogMessage("common.general.unableLoadOperatingReadiness"), error);
          set({ error: catalogMessage("common.general.unableLoadOperatingReadiness"), isLoading: false });
          return null;
        }
      },
      selectContext: async (id: number) => {
        try {
          const response = await fetchAPI(
            API_ENDPOINTS.ENTERPRISE_CORE.OPERATING_CONTEXT.SELECT(id),
            {
              method: 'POST',
            }
          );
          if (!response.success) return false;
          await useOperatingContextStore.getState().loadReadiness();
          return true;
        } catch (error) {
          console.error(catalogMessage("state.useoperatingcontextstore.unableSelectOperatingContext"), error);
          return false;
        }
      },
    }),
    { name: 'operating-context-store' }
  )
);
