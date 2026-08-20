import { invoke } from '@tauri-apps/api/core';
import { PRODUCT_FLAVOR } from '@/lib/product-flavor';

export interface ServerRuntimeComponent {
  state: string;
  detail: string;
}

export interface ServerRuntimeStatus {
  state: string;
  detail: string;
  database: ServerRuntimeComponent;
  api: ServerRuntimeComponent;
  queue: ServerRuntimeComponent;
  backup: ServerRuntimeComponent;
  runtimePresent: boolean;
  updatedAt: number | null;
}

export interface ServerBackupStatus {
  state: string;
  detail: string;
  retainedRestorePoints: number;
  lastBackupAtUnix: number | null;
  lastVerifiedAtUnix: number | null;
  updatedAtUnix: number | null;
}

export function isServerDesktopRuntime(): boolean {
  return PRODUCT_FLAVOR === 'server';
}

export async function readServerRuntimeStatus(): Promise<ServerRuntimeStatus | null> {
  if (!isServerDesktopRuntime()) return null;
  try {
    return await invoke<ServerRuntimeStatus>('server_runtime_status');
  } catch {
    return null;
  }
}

export async function startServerRuntime(): Promise<ServerRuntimeStatus | null> {
  if (!isServerDesktopRuntime()) return null;
  try {
    return await invoke<ServerRuntimeStatus>('server_runtime_start');
  } catch {
    return null;
  }
}

export async function readServerBackupStatus(): Promise<ServerBackupStatus | null> {
  if (!isServerDesktopRuntime()) return null;
  try {
    return await invoke<ServerBackupStatus>('server_backup_status');
  } catch {
    return null;
  }
}

export async function requestServerBackup(): Promise<ServerBackupStatus | null> {
  if (!isServerDesktopRuntime()) return null;
  try {
    return await invoke<ServerBackupStatus>('trigger_server_backup');
  } catch {
    return null;
  }
}

export async function prepareServerDesktopUpdate(): Promise<ServerRuntimeStatus | null> {
  if (!isServerDesktopRuntime()) return null;
  try {
    return await invoke<ServerRuntimeStatus>('prepare_server_desktop_update');
  } catch {
    return null;
  }
}
