import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { fetchAPI } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';

export type ModuleLifecycle = 'not_selected' | 'selected_pending_org_setup' | 'active';

export interface SetupModuleState {
  module_key: string;
  name_ar: string;
  name_en: string;
  category: string | null;
  is_core: boolean;
  exists: boolean;
  lifecycle: ModuleLifecycle;
  is_selected: boolean;
  is_operational: boolean;
  remediation: string;
}

export interface SetupState {
  setup_required: boolean;
  selected_module_keys: string[];
  next_action: 'select_modules' | 'complete_organization_setup' | null;
  pending_module_keys: string[];
  active_module_keys: string[];
  modules: SetupModuleState[];
}

interface SetupStateStore {
  state: SetupState | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  loadState: () => Promise<SetupState | null>;
  selectModules: (moduleKeys: string[]) => Promise<SetupState | null>;
  activateReadyModules: () => Promise<SetupState | null>;
}

export const useSetupStateStore = create<SetupStateStore>()(
  devtools(
    (set) => ({
      state: null,
      isLoading: false,
      isSaving: false,
      error: null,
      loadState: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.SETUP.STATE);
          if (!response.success) {
            set({
              error: response.message || 'Unable to load setup state.',
              isLoading: false,
            });
            return null;
          }

          const state = response.data as SetupState;
          set({ state, isLoading: false });
          return state;
        } catch (error) {
          console.error('Unable to load setup state.', error);
          set({ error: 'Unable to load setup state.', isLoading: false });
          return null;
        }
      },
      activateReadyModules: async () => {
        set({ isSaving: true, error: null });
        try {
          const response = await fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.SETUP.ACTIVATE_READY, {
            method: 'POST',
          });
          if (!response.success) {
            set({
              error: response.message || 'Unable to activate ready modules.',
              isSaving: false,
            });
            return null;
          }

          const payload = response.data as { state: SetupState };
          const state = payload.state;
          set({ state, isSaving: false });
          return state;
        } catch (error) {
          console.error('Unable to activate ready modules.', error);
          set({ error: 'Unable to activate ready modules.', isSaving: false });
          return null;
        }
      },
      selectModules: async (moduleKeys: string[]) => {
        set({ isSaving: true, error: null });
        try {
          const response = await fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.SETUP.MODULES, {
            method: 'POST',
            body: JSON.stringify({ module_keys: moduleKeys }),
          });
          if (!response.success) {
            set({
              error: response.message || 'Unable to save selected modules.',
              isSaving: false,
            });
            return null;
          }

          const state = response.data as SetupState;
          set({ state, isSaving: false });
          return state;
        } catch (error) {
          console.error('Unable to save selected modules.', error);
          set({ error: 'Unable to save selected modules.', isSaving: false });
          return null;
        }
      },
    }),
    { name: 'setup-state-store' }
  )
);
