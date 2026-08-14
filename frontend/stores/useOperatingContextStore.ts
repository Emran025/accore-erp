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
  checks: Array<{ key: string; complete: boolean; action: string | null }>;
  missing: Array<{ key: string; complete: boolean; action: string }>;
  next_action: string | null;
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
              error: response.message || 'Unable to load operating readiness.',
              isLoading: false,
            });
            return null;
          }
          const readiness = response.data as OperatingReadiness;
          set({ readiness, isLoading: false });
          return readiness;
        } catch (error) {
          console.error('Unable to load operating readiness.', error);
          set({ error: 'Unable to load operating readiness.', isLoading: false });
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
          console.error('Unable to select operating context.', error);
          return false;
        }
      },
    }),
    { name: 'operating-context-store' }
  )
);
