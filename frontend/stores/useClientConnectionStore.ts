'use client';

import { create } from 'zustand';
import { clearProtectedDesktopCredentials } from '@/lib/connection/desktop-credential-vault';
import {
  type ClientConnectionProfile,
  type PairingCandidate,
  PairingError,
  readClientConnectionProfile,
  removeClientConnectionProfile,
  verifyAndPairClient,
  verifyClientConnectionPolicy,
} from '@/lib/connection/client-connection';
import { useAuthStore } from '@/stores/useAuthStore';

export type ClientConnectionStatus =
  | 'checking'
  | 'profile-required'
  | 'pairing'
  | 'ready'
  | 'error';

interface ClientConnectionState {
  status: ClientConnectionStatus;
  profile: ClientConnectionProfile | null;
  error: PairingError | null;
  hydrate: () => Promise<void>;
  pair: (candidate: PairingCandidate) => Promise<boolean>;
  retry: () => Promise<void>;
  removeProfile: () => Promise<void>;
}

function clearClientSensitiveState(): void {
  useAuthStore.setState({
    user: null,
    permissions: [],
    isAuthenticated: false,
    isLoading: false,
    sessionToken: null,
    lastSyncedAt: null,
    sessionExpired: false,
  });
}

export const useClientConnectionStore = create<ClientConnectionState>((set, get) => ({
  status: 'checking',
  profile: null,
  error: null,

  hydrate: async () => {
    set({ status: 'checking', error: null });

    try {
      const profile = await readClientConnectionProfile();
      if (!profile) {
        set({ profile: null, status: 'profile-required' });
        return;
      }

      await verifyClientConnectionPolicy(profile);
      set({ profile, status: 'ready' });
    } catch (error) {
      clearClientSensitiveState();
      set({
        profile: null,
        status: 'error',
        error: error instanceof PairingError ? error : new PairingError('unexpected_response'),
      });
    }
  },

  pair: async (candidate) => {
    set({ status: 'pairing', error: null });

    try {
      const profile = await verifyAndPairClient(candidate);
      set({ profile, status: 'ready', error: null });
      return true;
    } catch (error) {
      const pairingError =
        error instanceof PairingError ? error : new PairingError('unexpected_response');
      set({ status: 'error', error: pairingError });
      return false;
    }
  },

  retry: async () => {
    await get().hydrate();
  },

  removeProfile: async () => {
    await clearProtectedDesktopCredentials();
    await removeClientConnectionProfile();
    clearClientSensitiveState();
    set({ profile: null, status: 'profile-required', error: null });
  },
}));
