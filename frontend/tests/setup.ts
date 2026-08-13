/**
 * Global test setup for Vitest.
 * Mocks browser APIs and external dependencies used by stores.
 */
import { vi } from 'vitest';

// ─── Mock fetch globally ──────────────────────────────────────
global.fetch = vi.fn();

// ─── Mock localStorage ────────────────────────────────────────
const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
        getItem: vi.fn((key: string) => store[key] ?? null),
        setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
        removeItem: vi.fn((key: string) => { delete store[key]; }),
        clear: vi.fn(() => { store = {}; }),
        get length() { return Object.keys(store).length; },
        key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
    };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// ─── Mock showToast ───────────────────────────────────────────
vi.mock('@/components/ui', () => ({
    showToast: vi.fn(),
}));

// ─── Mock fetchAPI ────────────────────────────────────────────
vi.mock('@/lib/api', () => ({
    fetchAPI: vi.fn(),
}));

// API_ENDPOINTS intentionally remains unmocked. It is a pure collection of
// constants and path builders; using its real implementation keeps tests
// aligned with the current endpoint hierarchy used by the stores.

// ─── Mock auth helpers ────────────────────────────────────────
vi.mock('@/lib/auth', () => ({
    getSidebarLinks: vi.fn(() => []),
    Permission: {},
}));

// ─── Mock window.confirm ──────────────────────────────────────
global.confirm = vi.fn(() => true);
