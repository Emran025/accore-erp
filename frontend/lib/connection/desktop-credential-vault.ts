import { invoke } from '@tauri-apps/api/core';
import { appLocalDataDir } from '@tauri-apps/api/path';
import { Client, Stronghold } from '@tauri-apps/plugin-stronghold';
import { isClientRelease } from '@/lib/product-flavor';

const VAULT_FILE_NAME = ['accore', 'client', 'credentials', 'v1'].join('-').concat('.hold');
const VAULT_CLIENT_NAME = 'accore-client-session-v1';
const VAULT_RECORD_KEY = 'credential-bundle-v1';

export interface ProtectedDesktopCredentials {
  schemaVersion: 1;
  deviceAccessToken: string;
  deviceId: string;
  refreshToken: string | null;
  refreshExpiresAt: string | null;
}

let memoryCredentials: ProtectedDesktopCredentials | null = null;
let inMemoryAccessToken: string | null = null;

function isTauriRuntime(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

function usesClientCredentialVault(): boolean {
  // Server Desktop never receives the Client-only Stronghold capability or
  // keychain command. Its local login must proceed without a device vault.
  return isTauriRuntime() && isClientRelease();
}

function encoder(): TextEncoder {
  return new TextEncoder();
}

function decoder(): TextDecoder {
  return new TextDecoder();
}

async function desktopVaultStore() {
  const vaultPassword = await invoke<string>('desktop_credential_vault_key');

  try {
    const vaultPath = [await appLocalDataDir(), VAULT_FILE_NAME].join('/');
    const stronghold = await Stronghold.load(vaultPath, vaultPassword);
    let client: Client;

    try {
      client = await stronghold.loadClient(VAULT_CLIENT_NAME);
    } catch {
      client = await stronghold.createClient(VAULT_CLIENT_NAME);
    }

    return { stronghold, store: client.getStore() };
  } finally {
    // The key remains only in the JS runtime for the duration of vault opening.
    // It is persisted exclusively by the operating system credential store.
    void vaultPassword;
  }
}

function isProtectedCredentialBundle(value: unknown): value is ProtectedDesktopCredentials {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Partial<ProtectedDesktopCredentials>;
  return (
    candidate.schemaVersion === 1 &&
    typeof candidate.deviceAccessToken === 'string' &&
    candidate.deviceAccessToken.length > 0 &&
    typeof candidate.deviceId === 'string' &&
    candidate.deviceId.length > 0 &&
    (candidate.refreshToken === null || typeof candidate.refreshToken === 'string') &&
    (candidate.refreshExpiresAt === null || typeof candidate.refreshExpiresAt === 'string')
  );
}

export async function ensureProtectedDesktopCredentialStore(): Promise<void> {
  if (!usesClientCredentialVault()) return;

  // Probe the OS keychain and Stronghold before an enrollment code is consumed.
  await desktopVaultStore();
}

export async function readProtectedDesktopCredentials(): Promise<ProtectedDesktopCredentials | null> {
  if (!usesClientCredentialVault()) return memoryCredentials;

  const { store } = await desktopVaultStore();
  const payload = await store.get(VAULT_RECORD_KEY);
  if (!payload) return null;

  try {
    const parsed = JSON.parse(decoder().decode(payload)) as unknown;
    if (!isProtectedCredentialBundle(parsed)) {
      await store.remove(VAULT_RECORD_KEY);
      return null;
    }

    return parsed;
  } catch {
    await store.remove(VAULT_RECORD_KEY);
    return null;
  }
}

export async function writeProtectedDesktopCredentials(
  credentials: ProtectedDesktopCredentials
): Promise<void> {
  if (!usesClientCredentialVault()) {
    memoryCredentials = credentials;
    return;
  }

  const { stronghold, store } = await desktopVaultStore();
  await store.insert(VAULT_RECORD_KEY, Array.from(encoder().encode(JSON.stringify(credentials))));
  await stronghold.save();
}

export async function clearProtectedDesktopCredentials(): Promise<void> {
  inMemoryAccessToken = null;
  memoryCredentials = null;

  if (!usesClientCredentialVault()) return;

  const { stronghold, store } = await desktopVaultStore();
  await store.remove(VAULT_RECORD_KEY);
  await stronghold.save();
}

export function setInMemoryAccessToken(token: string | null): void {
  inMemoryAccessToken = token;
}

export function getInMemoryAccessToken(): string | null {
  return inMemoryAccessToken;
}

export function clearInMemoryAccessToken(): void {
  inMemoryAccessToken = null;
}
