import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { fetchAPI } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';

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
    // State
    user: User | null;
    permissions: Permission[];
    isAuthenticated: boolean;
    isLoading: boolean;
    sessionToken: string | null;
    lastSyncedAt: number | null;
    sessionExpired: boolean;

    // Actions
    checkAuth: (forceSync?: boolean) => Promise<boolean>;
    login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    canAccess: (module: string, action?: 'view' | 'create' | 'edit' | 'delete') => boolean;
    setLoading: (loading: boolean) => void;
    setUser: (user: User | null) => void;
    setPermissions: (permissions: Permission[]) => void;
    setSessionExpired: (expired: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        devtools(
            (set, get) => ({
                // Initial state
                user: null,
                permissions: [],
                isAuthenticated: false,
                isLoading: true,
                sessionToken: null,
                lastSyncedAt: null,
                sessionExpired: false,

                // Check authentication with backend
                checkAuth: async (forceSync = false) => {
                    const { isAuthenticated, lastSyncedAt, user, sessionToken } = get();
                    const now = Date.now();
                    const ONE_HOUR = 60 * 60 * 1000;

                    // Frontend-only check if within 1 hour and already authenticated
                    if (!forceSync && isAuthenticated && user && lastSyncedAt && (now - lastSyncedAt < ONE_HOUR)) {
                        set({ isLoading: false });
                        return true;
                    }

                    set({ isLoading: true });
                    try {
                        const response = await fetchAPI(API_ENDPOINTS.AUTH.CHECK);
                        if (response.authenticated && response.user) {
                            const user = response.user as User;
                            const permissions = Array.isArray(response.permissions) ? response.permissions : [];
                            const token = (response.token as string) || get().sessionToken;

                            set({
                                user,
                                permissions,
                                isAuthenticated: true,
                                sessionToken: token,
                                isLoading: false,
                                lastSyncedAt: Date.now()
                            });

                            // Legacy compatibility: Sync with localStorage
                            if (typeof window !== 'undefined') {
                                localStorage.setItem('user', JSON.stringify(user));
                                localStorage.setItem('userPermissions', JSON.stringify(permissions));
                                localStorage.setItem('userRole', user.role);
                                if (token) localStorage.setItem('sessionToken', token);
                            }

                            return true;
                        }
                    } catch { /* fall through */ }

                    // If check fails, we clear everything
                    set({ user: null, permissions: [], isAuthenticated: false, isLoading: false, sessionToken: null, lastSyncedAt: null, sessionExpired: true });

                    // Legacy compatibility: Clear localStorage
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem('user');
                        localStorage.removeItem('userPermissions');
                        localStorage.removeItem('userRole');
                        localStorage.removeItem('sessionToken');
                    }

                    return false;
                },

                // Login
                login: async (username, password) => {
                    try {
                        const response = await fetchAPI(API_ENDPOINTS.AUTH.LOGIN, {
                            method: 'POST',
                            body: JSON.stringify({ username, password }),
                        });
                        if (response.success && response.user) {
                            const user = response.user as User;
                            const permissions = Array.isArray(response.permissions) ? response.permissions : [];

                            set({
                                user,
                                permissions,
                                isAuthenticated: true,
                                sessionToken: response.token as string,
                                lastSyncedAt: Date.now(),
                                sessionExpired: false
                            });

                            // Legacy compatibility: Sync with localStorage
                            if (typeof window !== 'undefined') {
                                localStorage.setItem('user', JSON.stringify(user));
                                localStorage.setItem('userPermissions', JSON.stringify(permissions));
                                localStorage.setItem('userRole', user.role);
                                if (response.token) localStorage.setItem('sessionToken', response.token as string);
                            }

                            return { success: true };
                        }
                        return { success: false, error: response.message || 'فشل تسجيل الدخول' };
                    } catch (e) {
                        return { success: false, error: e instanceof Error ? e.message : 'حدث خطأ في الاتصال' };
                    }
                },

                // Logout
                logout: async () => {
                    try { await fetchAPI(API_ENDPOINTS.AUTH.LOGOUT, { method: 'POST' }); } catch { }
                    set({ user: null, permissions: [], isAuthenticated: false, sessionToken: null, lastSyncedAt: null, sessionExpired: false });

                    // Legacy compatibility
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem('user');
                        localStorage.removeItem('userPermissions');
                        localStorage.removeItem('userRole');
                        localStorage.removeItem('sessionToken');
                        window.location.href = '/auth/login';
                    }
                },

                // Permission check
                canAccess: (module, action = 'view') => {
                    const { permissions } = get();
                    const perm = permissions.find(p => p.module === module || p.module === '*');
                    if (!perm) return false;
                    // Fix implicit action check
                    return action === 'view' ? perm.can_view
                        : action === 'create' ? perm.can_create
                            : action === 'edit' ? perm.can_edit
                                : perm.can_delete;
                },

                setLoading: (loading) => set({ isLoading: loading }),
                setUser: (user) => set({ user }),
                setPermissions: (permissions) => set({ permissions }),
                setSessionExpired: (sessionExpired) => set({ sessionExpired }),
            }),
            { name: 'auth-store' }
        ),
        {
            name: 'accore-auth',
            partialize: (state) => ({
                user: state.user,
                permissions: state.permissions,
                isAuthenticated: state.isAuthenticated,
                sessionToken: state.sessionToken,
                lastSyncedAt: state.lastSyncedAt,
                sessionExpired: state.sessionExpired,
            }),
        }
    )
);
