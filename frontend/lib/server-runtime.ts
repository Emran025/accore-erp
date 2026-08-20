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
  runtimePresent: boolean;
  updatedAt: number | null;
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
