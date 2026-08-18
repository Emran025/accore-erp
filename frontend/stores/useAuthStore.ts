'use client';

import { create } from 'zustand';
import { fetchAPI } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import {
  clearInMemoryAccessToken,
  clearProtectedDesktopCredentials,
  getInMemoryAccessToken,
  readProtectedDesktopCredentials,
  setInMemoryAccessToken,
  writeProtectedDesktopCredentials,
} from '@/lib/connection/desktop-credential-vault';

export interface User {
  id: number;
  username: string;
  full_name: string;
  role: string;
  role_id: number;
  is_active: boolean;
  manager_id?: number;
}
export interface Permission {
  module: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}
interface AuthState {
  user: User | null;
  permissions: Permission[];
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionToken: string | null;
  lastSyncedAt: number | null;
  sessionExpired: boolean;
  checkAuth: (forceSync?: boolean) => Promise<boolean>;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  canAccess: (module: string, action?: 'view' | 'create' | 'edit' | 'delete') => boolean;
  setLoading: (v: boolean) => void;
  setUser: (v: User | null) => void;
  setPermissions: (v: Permission[]) => void;
  setSessionExpired: (v: boolean) => void;
}
const clearState = (set: (state: Partial<AuthState>) => void, expired = false) => {
  clearInMemoryAccessToken();
  set({
    user: null,
    permissions: [],
    isAuthenticated: false,
    isLoading: false,
    sessionToken: null,
    lastSyncedAt: null,
    sessionExpired: expired,
  });
};
async function deviceHeaders(): Promise<Record<string, string>> {
  const credentials = await readProtectedDesktopCredentials();
  return credentials
    ? {
        'X-Accore-Device-Id': credentials.deviceId,
        'X-Accore-Device-Token': credentials.deviceAccessToken,
      }
    : {};
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  permissions: [],
  isAuthenticated: false,
  isLoading: true,
  sessionToken: null,
  lastSyncedAt: null,
  sessionExpired: false,
  checkAuth: async (forceSync = false) => {
    const current = get();
    const lastSyncedAt = current.lastSyncedAt;
    if (
      !forceSync &&
      current.isAuthenticated &&
      current.user &&
      lastSyncedAt &&
      Date.now() - lastSyncedAt < 60 * 60 * 1000
    ) {
      set({ isLoading: false });
      return true;
    }
    set({ isLoading: true });
    if (!getInMemoryAccessToken()) {
      const credentials = await readProtectedDesktopCredentials();
      if (credentials?.refreshToken) {
        const refreshed = await fetchAPI<any>(API_ENDPOINTS.AUTH.REFRESH, {
          method: 'POST',
          headers: await deviceHeaders(),
          body: JSON.stringify({ refresh_token: credentials.refreshToken }),
          skipSessionRecovery: true,
        });
        if (
          refreshed.success &&
          typeof refreshed.token === 'string' &&
          typeof refreshed.refresh_token === 'string'
        ) {
          setInMemoryAccessToken(refreshed.token);
          await writeProtectedDesktopCredentials({
            ...credentials,
            refreshToken: refreshed.refresh_token,
            refreshExpiresAt:
              typeof refreshed.refresh_expires_at === 'string'
                ? refreshed.refresh_expires_at
                : null,
          });
        } else {
          await clearProtectedDesktopCredentials();
          clearState(set, true);
          return false;
        }
      }
    }
    try {
      const response = await fetchAPI<any>(API_ENDPOINTS.AUTH.CHECK, { skipSessionRecovery: true });
      if (response.authenticated && response.user) {
        const user = response.user as User;
        set({
          user,
          permissions: Array.isArray(response.permissions) ? response.permissions : [],
          isAuthenticated: true,
          isLoading: false,
          sessionToken: getInMemoryAccessToken(),
          lastSyncedAt: Date.now(),
          sessionExpired: false,
        });
        return true;
      }
    } catch {
      /* fail closed below */
    }
    clearState(set, true);
    return false;
  },
  login: async (username, password) => {
    const credentials = await readProtectedDesktopCredentials();
    const response = await fetchAPI<any>(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      headers: await deviceHeaders(),
      body: JSON.stringify({ username, password }),
      skipSessionRecovery: true,
    });
    if (!response.success || !response.user || typeof response.token !== 'string')
      return {
        success: false,
        error: typeof response.message === 'string' ? response.message : undefined,
      };
    setInMemoryAccessToken(response.token);
    if (credentials && typeof response.refresh_token === 'string')
      await writeProtectedDesktopCredentials({
        ...credentials,
        refreshToken: response.refresh_token,
        refreshExpiresAt:
          typeof response.refresh_expires_at === 'string' ? response.refresh_expires_at : null,
      });
    const user = response.user as User;
    set({
      user,
      permissions: Array.isArray(response.permissions) ? response.permissions : [],
      isAuthenticated: true,
      isLoading: false,
      sessionToken: response.token,
      lastSyncedAt: Date.now(),
      sessionExpired: false,
    });
    return { success: true };
  },
  logout: async () => {
    const credentials = await readProtectedDesktopCredentials();
    if (credentials?.refreshToken)
      await fetchAPI(API_ENDPOINTS.AUTH.REVOKE, {
        method: 'POST',
        headers: await deviceHeaders(),
        body: JSON.stringify({ refresh_token: credentials.refreshToken, reason: 'user_logout' }),
        skipSessionRecovery: true,
      });
    if (credentials)
      await writeProtectedDesktopCredentials({
        ...credentials,
        refreshToken: null,
        refreshExpiresAt: null,
      });
    clearState(set);
    if (typeof window !== 'undefined') window.location.href = '/auth/login';
  },
  canAccess: (module, action = 'view') => {
    const permission = get().permissions.find(
      (item) => item.module === module || item.module === '*'
    );
    return (
      !!permission &&
      (action === 'view'
        ? permission.can_view
        : action === 'create'
          ? permission.can_create
          : action === 'edit'
            ? permission.can_edit
            : permission.can_delete)
    );
  },
  setLoading: (isLoading) => set({ isLoading }),
  setUser: (user) => set({ user }),
  setPermissions: (permissions) => set({ permissions }),
  setSessionExpired: (sessionExpired) => set({ sessionExpired }),
}));
